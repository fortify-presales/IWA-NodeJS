type BrandLogoProps = {
  appName?: string;
  variant?: 'onLight' | 'onDark';
  layout?: 'inline' | 'stacked';
  className?: string;
};

/**
 * Theme-aware recreation of /img/logo.png (prescription mark + wordmark)
 * so chrome/auth can follow the sage palette without baked-in plates.
 */
export function BrandLogo({
  appName = 'IWA Pharmacy Direct',
  variant = 'onLight',
  layout = 'inline',
  className = '',
}: BrandLogoProps) {
  const onDark = variant === 'onDark';
  const stacked = layout === 'stacked';
  const ink = onDark ? '#f6f8f3' : '#1d2721';
  const muted = onDark ? 'rgba(246, 248, 243, 0.72)' : '#47784e';
  const markFill = onDark ? '#81b760' : '#e6efe1';
  const markStroke = onDark ? '#d7e8cf' : '#315f38';
  const markDetail = onDark ? '#243528' : '#315f38';

  const markClass = stacked
    ? 'brand-logo-mark h-16 w-16'
    : 'brand-logo-mark h-9 w-9 shrink-0 md:h-10 md:w-10';

  const titleClass = stacked
    ? 'font-display text-[2rem] font-bold tracking-wide'
    : 'font-display text-[1.15rem] font-bold tracking-wide md:text-[1.3rem]';

  const subtitleClass = stacked
    ? 'mt-1 text-[0.95rem] font-semibold tracking-[0.02em]'
    : 'mt-0.5 text-[0.68rem] font-semibold tracking-[0.02em] md:text-[0.74rem]';

  return (
    <span
      className={`brand-logo inline-flex ${stacked ? 'flex-col items-center gap-3 text-center' : 'items-center gap-2.5'} ${className}`.trim()}
      aria-label={appName}
    >
      <svg
        aria-hidden="true"
        className={markClass}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="3" width="26" height="34" rx="3" fill={markFill} stroke={markStroke} strokeWidth="2" />
        <path d="M22 3 L30 11 L22 11 Z" fill={markStroke} />
        <path
          d="M13 12 H21 M17 8 V16"
          stroke={markDetail}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M11 21 H25 M11 26 H23 M11 31 H20"
          stroke={markDetail}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className={`flex min-w-0 flex-col leading-none ${stacked ? 'items-center' : ''}`}>
        <span className={titleClass} style={{ color: ink }}>
          IWA
        </span>
        <span className={subtitleClass} style={{ color: muted }}>
          Pharmacy Direct
        </span>
      </span>
    </span>
  );
}
