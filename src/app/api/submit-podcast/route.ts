import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Log the submission (in production, you'd send an email or store in DB)
    console.log('New podcast submission:', data);

    // For MVP, we'll just log. In production, integrate with:
    // - Email service (SendGrid, Resend, etc.) to notify ryan@ryanestes.info
    // - Database to store submissions

    // Example email integration (uncomment when email service is set up):
    /*
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wildcast <noreply@wildcast.app>',
        to: 'ryan@ryanestes.info',
        subject: `New Podcast Submission: ${data.podcastName}`,
        html: `
          <h2>New Podcast Submission</h2>
          <p><strong>Podcast:</strong> ${data.podcastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>URL:</strong> ${data.podcastUrl}</p>
          <p><strong>Description:</strong> ${data.description || 'Not provided'}</p>
          <p><strong>Has Media Kit:</strong> ${data.hasMediaKit ? 'Yes' : 'No'}</p>
        `,
      }),
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
