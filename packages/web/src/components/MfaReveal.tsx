import React from 'react';

const TOTP_PERIOD_SECONDS = 30;

function secondsRemaining() {
  return TOTP_PERIOD_SECONDS - (Math.floor(Date.now() / 1000) % TOTP_PERIOD_SECONDS);
}

export function RevealValue({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = React.useState(false);

  // INSECURE: renders MFA secrets and one-time codes in the client after user interaction (CWE-200, CWE-522)
  // Purpose: demonstrates second-factor disclosure in the browser for Fortify SAST/DAST
  // Fix: Keep factor secrets server-side and never send them to a client-rendered component
  return (
    <p className="reveal-row">
      <span className="reveal-label">{label}</span>
      {revealed
        ? <code className="reveal-value">{value}</code>
        : <code className="reveal-value masked">{'•'.repeat(Math.min(value.length, 26))}</code>}
      <button className="link-button" onClick={() => setRevealed(current => !current)} type="button">
        {revealed ? 'Hide' : 'Click to reveal'}
      </button>
    </p>
  );
}

export function RevealTotpCode({ code, onRefresh }: { code: string; onRefresh: () => void }) {
  const [revealed, setRevealed] = React.useState(false);
  const [remaining, setRemaining] = React.useState(secondsRemaining);
  const refreshRef = React.useRef(onRefresh);
  refreshRef.current = onRefresh;

  React.useEffect(() => {
    if (!revealed) return;
    const timer = window.setInterval(() => {
      setRemaining(previous => {
        const next = secondsRemaining();
        if (next > previous) refreshRef.current();
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [revealed]);

  return (
    <div className="reveal-row totp-row">
      <span className="reveal-label">Current code</span>
      {revealed
        ? <code className="reveal-value totp-value">{code}</code>
        : <code className="reveal-value masked">••••••</code>}
      <button className="link-button" onClick={() => { setRemaining(secondsRemaining()); setRevealed(current => !current); }} type="button">
        {revealed ? 'Hide' : 'Click to reveal'}
      </button>
      {revealed ? (
        <span className="totp-countdown" role="timer">
          <span className="totp-countdown-bar" style={{ width: `${(remaining / TOTP_PERIOD_SECONDS) * 100}%` }} />
          <span className="totp-countdown-text">valid for {remaining}s</span>
        </span>
      ) : null}
    </div>
  );
}
