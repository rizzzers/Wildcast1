import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByEmail, verifyPassword } from '@/lib/auth-utils';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

async function notifyNewUser(name: string, email: string, method: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Howdi <notifications@gethowdi.com>',
        to: 'ryan@ryanestes.info',
        subject: `New user signed up — ${name || email}`,
        html: `
          <h2>New Howdi User</h2>
          <p><strong>Name:</strong> ${name || '(not provided)'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sign-up method:</strong> ${method}</p>
          <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
        `,
      }),
    });
  } catch {
    // Non-critical — don't block sign-in
  }
}

// Custom Google provider that uses fetch for ALL HTTP calls, bypassing openid-client's
// https.request which is not implemented in Cloudflare Workers (unenv).
// Both token exchange and userinfo are handled with custom request functions.
const CloudflareGoogleProvider = (clientId: string, clientSecret: string) => ({
  id: 'google',
  name: 'Google',
  type: 'oauth' as const,
  issuer: 'https://accounts.google.com',
  clientId,
  clientSecret,
  authorization: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    params: { scope: 'openid email profile' },
  },
  token: {
    url: 'https://oauth2.googleapis.com/token',
    async request({ provider, params }: { provider: any; params: any }) {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: params.code,
          redirect_uri: provider.callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
      });
      const tokens = await res.json() as any;
      return { tokens };
    },
  },
  userinfo: {
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    async request({ tokens }: { tokens: any }) {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      return res.json() as any;
    },
  },
  idToken: false,
  checks: 'state' as const,
  profile(profile: { sub: string; name: string; email: string; picture: string }) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [CloudflareGoogleProvider(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)]
      : []),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUserByEmail(credentials.email);
        if (!user || !user.password_hash) return null;

        const isValid = await verifyPassword(credentials.password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'google') {
        // Google sign-in: find or create user in D1
        const db = getDb();
        let dbUser = await db
          .prepare('SELECT id, email, name, role, plan FROM users WHERE email = ?')
          .bind(user.email!)
          .first<{ id: string; email: string; name: string; role: string; plan: string }>();

        if (!dbUser) {
          // Create new user for Google sign-in
          const newId = crypto.randomUUID();
          const role = user.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
          await db
            .prepare("INSERT INTO users (id, email, name, google_id, role, plan) VALUES (?, ?, ?, ?, ?, 'free')")
            .bind(newId, user.email!, user.name || '', token.sub, role)
            .run();
          dbUser = { id: newId, email: user.email!, name: user.name || '', role, plan: 'free' };
          void notifyNewUser(user.name || '', user.email!, 'Google');
        } else {
          // Update google_id on existing account if missing
          await db
            .prepare("UPDATE users SET google_id = ?, updated_at = datetime('now') WHERE id = ? AND google_id IS NULL")
            .bind(token.sub, dbUser.id)
            .run();
        }

        token.sub = dbUser.id;
        token.role = dbUser.role;
        token.plan = dbUser.plan;
      } else if (user) {
        // Credentials sign-in
        token.sub = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
