'use client';

import { useEffect, useRef, useState } from 'react';

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  isVisible: boolean;
}

function Step({ number, title, description, icon, delay, isVisible }: StepProps) {
  return (
    <div
      className="relative group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {/* Card */}
      <div className="relative p-6 rounded-2xl bg-[var(--card)]/60 border border-[var(--border)] backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-[var(--primary)]/40 group-hover:bg-[var(--card)]">
        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Number badge */}
        <div className="relative flex items-center gap-3 mb-5">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                boxShadow: isVisible ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none',
                transition: `box-shadow 0.8s ease ${delay + 400}ms`,
              }}
            >
              {number}
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                opacity: isVisible ? 0 : 0.4,
                transform: isVisible ? 'scale(1.8)' : 'scale(1)',
                transition: `all 1s ease ${delay + 200}ms`,
              }}
            />
          </div>
        </div>

        {/* Icon */}
        <div
          className="mb-5 text-[var(--primary)]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.8)',
            transition: `all 0.5s ease ${delay + 300}ms`,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold mb-2 relative">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed relative">{description}</p>
      </div>
    </div>
  );
}

// Animated SVG icons for each step
function SurveyIcon({ isVisible, delay }: { isVisible: boolean; delay: number }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Clipboard body */}
      <rect
        x="10" y="8" width="28" height="34" rx="3"
        stroke="currentColor" strokeWidth="2"
        strokeDasharray="124"
        strokeDashoffset={isVisible ? 0 : 124}
        style={{ transition: `stroke-dashoffset 1.2s ease ${delay + 200}ms` }}
      />
      {/* Clipboard clip */}
      <rect
        x="18" y="4" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="2"
        fill="var(--card)"
        strokeDasharray="40"
        strokeDashoffset={isVisible ? 0 : 40}
        style={{ transition: `stroke-dashoffset 0.8s ease ${delay + 600}ms` }}
      />
      {/* Check lines */}
      <path
        d="M17 20h14M17 26h14M17 32h8"
        stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="42"
        strokeDashoffset={isVisible ? 0 : 42}
        style={{ transition: `stroke-dashoffset 0.6s ease ${delay + 900}ms` }}
      />
      {/* Checkboxes */}
      {[20, 26, 32].map((y, i) => (
        <circle
          key={y}
          cx="14" cy={y} r="1.5"
          fill="var(--primary)"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0)',
            transformOrigin: `14px ${y}px`,
            transition: `all 0.3s ease ${delay + 1000 + i * 150}ms`,
          }}
        />
      ))}
    </svg>
  );
}

function MatchIcon({ isVisible, delay }: { isVisible: boolean; delay: number }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Left circle (podcast) */}
      <circle
        cx="18" cy="24" r="10"
        stroke="currentColor" strokeWidth="2"
        strokeDasharray="63"
        strokeDashoffset={isVisible ? 0 : 63}
        style={{ transition: `stroke-dashoffset 1s ease ${delay + 200}ms` }}
      />
      {/* Right circle (sponsor) */}
      <circle
        cx="30" cy="24" r="10"
        stroke="var(--accent)" strokeWidth="2"
        strokeDasharray="63"
        strokeDashoffset={isVisible ? 0 : 63}
        style={{ transition: `stroke-dashoffset 1s ease ${delay + 400}ms` }}
      />
      {/* Overlap fill */}
      <path
        d="M24 16.5a10 10 0 0 0-6 7.5 10 10 0 0 0 6 7.5 10 10 0 0 0 6-7.5 10 10 0 0 0-6-7.5z"
        fill="var(--primary)"
        style={{
          opacity: isVisible ? 0.3 : 0,
          transition: `opacity 0.6s ease ${delay + 800}ms`,
        }}
      />
      {/* Center spark */}
      <circle
        cx="24" cy="24" r="2"
        fill="var(--primary)"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0)',
          transformOrigin: '24px 24px',
          transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 1000}ms`,
        }}
      />
      {/* Spark rays */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + Math.cos(rad) * 4;
        const y1 = 24 + Math.sin(rad) * 4;
        const x2 = 24 + Math.cos(rad) * 7;
        const y2 = 24 + Math.sin(rad) * 7;
        return (
          <line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.3s ease ${delay + 1100 + i * 50}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}

function OutreachIcon({ isVisible, delay }: { isVisible: boolean; delay: number }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Envelope body */}
      <rect
        x="6" y="12" width="36" height="24" rx="3"
        stroke="currentColor" strokeWidth="2"
        strokeDasharray="120"
        strokeDashoffset={isVisible ? 0 : 120}
        style={{ transition: `stroke-dashoffset 1s ease ${delay + 200}ms` }}
      />
      {/* Envelope flap */}
      <path
        d="M6 15l18 12 18-12"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
        strokeDasharray="44"
        strokeDashoffset={isVisible ? 0 : 44}
        style={{ transition: `stroke-dashoffset 0.8s ease ${delay + 600}ms` }}
      />
      {/* Send arrow */}
      <path
        d="M32 8l8 4-8 4"
        stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
          transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 1000}ms`,
        }}
      />
      <line
        x1="24" y1="12" x2="38" y2="12"
        stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="14"
        strokeDashoffset={isVisible ? 0 : 14}
        style={{ transition: `stroke-dashoffset 0.4s ease ${delay + 1100}ms` }}
      />
    </svg>
  );
}

// Floating particle component
function Particle({ x, y, size, duration, delay: particleDelay }: { x: number; y: number; size: number; duration: number; delay: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, var(--primary), transparent)`,
        opacity: 0.15,
        animation: `float ${duration}s ease-in-out ${particleDelay}s infinite`,
      }}
    />
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate the connecting line after cards appear
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setLineProgress(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const particles = [
    { x: 5, y: 20, size: 4, duration: 6, delay: 0 },
    { x: 15, y: 70, size: 3, duration: 8, delay: 1 },
    { x: 35, y: 15, size: 5, duration: 7, delay: 0.5 },
    { x: 55, y: 80, size: 3, duration: 9, delay: 2 },
    { x: 75, y: 25, size: 4, duration: 6, delay: 1.5 },
    { x: 85, y: 65, size: 3, duration: 8, delay: 0.8 },
    { x: 95, y: 35, size: 4, duration: 7, delay: 1.2 },
    { x: 45, y: 90, size: 3, duration: 10, delay: 0.3 },
  ];

  return (
    <section ref={sectionRef} className="relative px-6 py-24 border-t border-white/[0.06] overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.04) 0%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.5s ease',
        }}
      />

      {/* Floating particles */}
      {isVisible && particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className="inline-block mb-4"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.5s ease 100ms',
            }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase border border-[var(--primary)]/20 bg-[var(--primary)]/[0.06] text-[var(--primary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Simple Process
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Three steps to finding sponsors that actually make sense for your show.
          </p>
        </div>

        {/* Connecting line (desktop only) */}
        <div className="hidden md:block absolute top-[280px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-[2px]">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--primary))',
              transform: `scaleX(${lineProgress})`,
              transformOrigin: 'left',
              transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 600ms',
              opacity: 0.3,
            }}
          />
          {/* Traveling glow dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 0 12px var(--primary), 0 0 24px var(--primary)',
              left: `${lineProgress * 100}%`,
              transform: `translate(-50%, -50%)`,
              opacity: lineProgress > 0 && lineProgress < 1 ? 1 : 0,
              transition: 'left 1.2s cubic-bezier(0.16, 1, 0.3, 1) 600ms, opacity 0.3s ease',
            }}
          />
        </div>

        {/* Step cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Step
            number="01"
            title="Tell us about your show"
            description="Category, audience size, tone, format. Seven quick questions so we understand what makes your podcast unique."
            icon={<SurveyIcon isVisible={isVisible} delay={200} />}
            delay={200}
            isVisible={isVisible}
          />
          <Step
            number="02"
            title="Get matched"
            description="Our matching engine pairs you with sponsors whose target audience overlaps with your listeners."
            icon={<MatchIcon isVisible={isVisible} delay={500} />}
            delay={400}
            isVisible={isVisible}
          />
          <Step
            number="03"
            title="Start conversations"
            description="Get direct contact details, LinkedIn profiles, and outreach templates. No middlemen, no waiting."
            icon={<OutreachIcon isVisible={isVisible} delay={800} />}
            delay={600}
            isVisible={isVisible}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
          25% { transform: translateY(-15px) translateX(5px); opacity: 0.25; }
          50% { transform: translateY(-5px) translateX(-5px); opacity: 0.1; }
          75% { transform: translateY(-20px) translateX(3px); opacity: 0.2; }
        }
      `}</style>
    </section>
  );
}
