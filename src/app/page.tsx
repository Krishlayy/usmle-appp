'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

interface FeatureItem {
  icon: 'content' | 'analytics' | 'purchase';
  tileColor: string;
  title: string;
  description: string;
}

function BookIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <path
        d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 1 4 17.5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5H18V4H6.5Z"
        fill={color}
      />
    </svg>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M5 12h12.17l-4.58 4.59L14 18l7-7-7-7-1.41 1.41L17.17 10H5v2Z" fill={color} />
    </svg>
  );
}

function FeatureIcon({ variant, color }: { variant: 'content' | 'analytics' | 'purchase'; color: string }) {
  if (variant === 'content') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
        <path
          d="M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Zm0 2v10.76l2-.99 4 2 4-2 2 .99V5H6Z"
          fill={color}
        />
      </svg>
    );
  }
  if (variant === 'analytics') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
        <path d="M4 19h16v2H2V3h2v16Zm3-2V9h3v8H7Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <path
        d="M7 4h10l3 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l3-4Zm1.05 2L6.5 8h11L16 6H8.05ZM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        fill={color}
      />
    </svg>
  );
}

export default function Home() {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.2 });
  const shouldAnimate = inView;

  // Config
  const brand = 'Micro Q Bank';
  const eyebrow = 'The New Standard in Clinical Education';
  const emphasizedHeading = 'Master Medical Concepts,';
  const headingRemainder = 'One Topic at a Time.';
  const supportingParagraph =
    'Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored precisely for your clinical weak spots.';
  const primaryButtonLabel = 'Explore Question Banks';
  const primaryButtonHref = '/store';
  const secondaryButtonLabel = 'Create Free Account';
  const secondaryButtonHref = '/signup';
  const features: FeatureItem[] = [
    {
      icon: 'content',
      tileColor: '#FEF3C7',
      title: 'High-Yield Content',
      description:
        'Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.',
    },
    {
      icon: 'analytics',
      tileColor: '#CFFAFE',
      title: 'Advanced Analytics',
      description:
        'Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.',
    },
    {
      icon: 'purchase',
      tileColor: '#EDE9FE',
      title: 'Pay Per Module',
      description: 'Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.',
    },
  ];
  const calloutTitle = 'Ready to elevate your clinical study?';
  const calloutBody = 'Join a smarter question-bank experience designed for focused learning and measurable growth.';
  const calloutButtonLabel = 'Get Started Today';
  const calloutButtonHref = '/signup';
  const footerBrand = 'Micro Q Bank';
  const footerCopyright = `© ${new Date().getFullYear()} Micro Q Bank. All rights reserved.`;

  // Colors
  const pageBackground = '#FFFFFF';
  const accentYellow = '#FEF3C7';
  const aqua = '#67E8F9';
  const navy = '#0F172A';
  const cardSurface = '#FFFFFF';
  const sectionSurface = '#F5F5F5';
  const primaryText = '#000000';
  const mutedText = '#CCCCCC';
  const borderColor = '#EEEEEE';
  const radius = '14px';

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        background: pageBackground,
        color: primaryText,
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <header
        style={{
          width: '100%',
          padding: '20px 20px 8px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
            }}
          >
            <BookIcon color={primaryText} />
            <span
              style={{
                fontWeight: 700,
                minWidth: 'max-content',
                color: primaryText,
                fontSize: 14,
              }}
            >
              {brand}
            </span>
          </Link>
          <nav
            aria-label="Top navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <Link
              href="/dashboard"
              style={{
                color: primaryText,
                textDecoration: 'none',
                fontSize: 14,
                transition: 'opacity 0.2s',
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/store"
              style={{
                color: primaryText,
                textDecoration: 'none',
                fontSize: 14,
                transition: 'opacity 0.2s',
              }}
            >
              Store
            </Link>
            <Link
              href="/login"
              style={{
                color: primaryText,
                textDecoration: 'none',
                fontSize: 14,
                transition: 'opacity 0.2s',
              }}
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>

      <main
        style={{
          width: '100%',
          padding: '18px 20px 60px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 56,
          }}
        >
          {/* Hero Section */}
          <section
            style={{
              position: 'relative',
              borderRadius: radius,
              padding: '74px 20px 70px',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: '58%',
                minWidth: 280,
                transform: 'translateX(-50%)',
                height: 230,
                background: `radial-gradient(circle at center, ${aqua}24 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 14 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 22,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 999,
                  padding: '7px 12px',
                  textTransform: 'uppercase',
                  color: mutedText,
                  letterSpacing: '0.06em',
                  fontSize: 12,
                  lineHeight: '1em',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: accentYellow,
                    display: 'inline-block',
                  }}
                />
                {eyebrow}
              </span>

              <h1
                style={{
                  fontSize: 'clamp(42px, 7vw, 72px)',
                  lineHeight: '1.05',
                  margin: 0,
                  color: primaryText,
                  maxWidth: 820,
                  fontWeight: 600,
                  letterSpacing: '-0.04em',
                }}
              >
                <span style={{ fontStyle: 'italic', marginRight: 8 }}>{emphasizedHeading}</span>
                <br />
                {headingRemainder}
              </h1>

              <p
                style={{
                  margin: 0,
                  color: mutedText,
                  maxWidth: 680,
                  fontSize: 16,
                  lineHeight: '1.35em',
                  letterSpacing: '-0.01em',
                }}
              >
                {supportingParagraph}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  width: '100%',
                  paddingTop: 8,
                }}
              >
                <Link href={primaryButtonHref}>
                  <span
                    style={{
                      minHeight: 50,
                      minWidth: 210,
                      padding: '12px 18px',
                      borderRadius: radius,
                      border: '1px solid #000000',
                      background: '#000000',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{primaryButtonLabel}</span>
                    <ArrowIcon color="#FFFFFF" />
                  </span>
                </Link>
                <Link href={secondaryButtonHref}>
                  <span
                    style={{
                      minHeight: 50,
                      minWidth: 210,
                      padding: '12px 18px',
                      borderRadius: radius,
                      border: `1px solid ${borderColor}`,
                      background: accentYellow,
                      color: primaryText,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {secondaryButtonLabel}
                  </span>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section
            style={{
              background: sectionSurface,
              borderRadius: radius,
              padding: '28px 18px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {features.map((feature, index) => (
                <motion.article
                  key={`${feature.title}-${index}`}
                  initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.06 * index,
                    ease: 'easeOut',
                  }}
                  style={{
                    background: cardSurface,
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    minWidth: 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: feature.tileColor,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FeatureIcon variant={feature.icon} color={primaryText} />
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      color: primaryText,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: mutedText,
                      fontSize: 14,
                      lineHeight: '1.5',
                    }}
                  >
                    {feature.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Callout Section */}
          <motion.section
            initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
              delay: 0.08,
            }}
            style={{
              width: '100%',
              background: navy,
              borderRadius: radius,
              padding: '28px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 0,
                flex: '1 1 360px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#FFFFFF',
                  fontSize: 'clamp(24px, 3.3vw, 38px)',
                  lineHeight: '1.08em',
                  fontWeight: 600,
                  letterSpacing: '-0.04em',
                }}
              >
                {calloutTitle}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: '#D5DCE8',
                  maxWidth: 620,
                  fontSize: 16,
                  lineHeight: '1.35em',
                  letterSpacing: '-0.01em',
                }}
              >
                {calloutBody}
              </p>
            </div>
            <Link href={calloutButtonHref}>
              <span
                style={{
                  background: aqua,
                  color: navy,
                  textDecoration: 'none',
                  borderRadius: radius,
                  border: `1px solid ${aqua}`,
                  minHeight: 48,
                  minWidth: 220,
                  padding: '12px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span>{calloutButtonLabel}</span>
                <ArrowIcon color={navy} />
              </span>
            </Link>
          </motion.section>
        </div>
      </main>

      <footer
        style={{
          width: '100%',
          background: sectionSurface,
          borderTop: `1px solid ${borderColor}`,
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <BookIcon color={primaryText} />
            <span
              style={{
                color: primaryText,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {footerBrand}
            </span>
          </div>
          <span style={{ color: mutedText, fontSize: 12 }}>{footerCopyright}</span>
        </div>
      </footer>
    </div>
  );
}
