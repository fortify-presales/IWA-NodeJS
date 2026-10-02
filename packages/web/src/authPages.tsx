import { useCallback, useEffect, useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { BrandLogo } from './components/BrandLogo';
import { RevealValue, RevealTotpCode } from './components/MfaReveal';

type AuthPageProps = {
  user: null | {
    username: string;
  };
};

function queryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name) ?? '';
}

export function LoginPage({ user }: AuthPageProps) {
  const error = queryParam('error');
  const message = queryParam('message');
  const redirect = queryParam('redirect') || '/app/';

  if (user) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h1>Already signed in</h1>
          <p>Welcome back, {user.username}.</p>
          <a className="button" href="/user/home">
            Go To Account
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page login-background">
      <div className="auth-card">
        {message ? <div className="notice compact">{message}</div> : null}
        {error ? <LoginError html={error} /> : null}
        <div className="login-logo">
          <BrandLogo appName="IWA Pharmacy Direct" variant="onLight" layout="stacked" />
        </div>
        <h1>Enter your details</h1>
        <form method="POST" action="/login">
          <input type="hidden" name="redirect" value={redirect} />
          <label>
            Username or Email
            <input autoFocus name="username" required type="text" />
          </label>
          <label>
            Password
            <input autoComplete="off" name="password" required type="password" />
          </label>
          <button name="login-submit" id="login-submit" type="submit">
            <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
            Login
          </button>
        </form>
        <p className="auth-links">
          <a href="/app/forgot-password">Forgot password?</a>
          <span>|</span>
          <a href="/app/register">Register</a>
        </p>
      </div>
    </section>
  );
}

type MfaHint = {
  pending: boolean;
  username?: string;
  mfaType?: string;
  secret?: string;
  qrCode?: string;
  currentCode?: string;
  otp?: string | null;
};

export function MfaPage() {
  const error = queryParam('error');
  const [hint, setHint] = useState<MfaHint | null>(null);

  const loadHint = useCallback(() => {
    // INSECURE: the challenge screen pulls the pending account's TOTP secret and live code (CWE-200)
    // Purpose: demonstrates second-factor disclosure to an unauthenticated browser for Fortify DAST
    // Fix: Remove this call; the challenge page must not reveal any enrolment material
    fetch('/login-mfa/hint', { credentials: 'same-origin' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => setHint(data))
      .catch(() => setHint(null));
  }, []);

  useEffect(() => { loadHint(); }, [loadHint]);

    if (hint && !hint.pending) {
      return (
        <section className="auth-page">
          <div className="auth-card narrow">
            <h1>No MFA challenge pending</h1>
            <p>Sign out, then sign in with an MFA-enabled account to start a verification challenge.</p>
            <div className="action-row">
              <a className="button" href="/logout">Sign out</a>
              <a className="button secondary outline" href="/app/login">Sign in</a>
            </div>
          </div>
        </section>
      );
    }

  return (
    <section className="auth-page">
      <div className="auth-card narrow">
        <h1>Two-Factor Authentication</h1>
        {error ? <MfaError html={error} /> : null}
        <p>Please enter your verification code.</p>
        <form method="POST" action="/login-mfa">
          <label>
            Verification Code
            <input autoFocus maxLength={6} name="code" required type="text" />
          </label>
          <button type="submit">Verify</button>
        </form>
        {hint?.pending ? <MfaDemoHint hint={hint} onRefresh={loadHint} /> : null}
        <form className="auth-reset-form" method="POST" action="/login-mfa/reset">
          <input type="hidden" name="username" value={hint?.username ?? ''} />
          <button className="secondary outline" type="submit">Lost your device? Reset MFA</button>
        </form>
      </div>
    </section>
  );
}

function MfaDemoHint({ hint, onRefresh }: { hint: MfaHint; onRefresh: () => void }) {
  return (
    <details className="mfa-demo-details">
      <summary>Demo helper: show QR code and codes</summary>
      <div className="notice compact mfa-hint">
        <p>You can use the information below to complete the challenge. You can use an Authenticator app to scan the QR code or enter the secret manually.</p>
        <p>Account: <code>{hint.username}</code> ({hint.mfaType})</p>
        {hint.qrCode ? <img className="qr-code" src={hint.qrCode} alt="TOTP enrolment QR code" /> : null}
        {hint.secret ? <RevealValue label="TOTP secret" value={hint.secret} /> : null}
        {hint.currentCode ? <RevealTotpCode code={hint.currentCode} onRefresh={onRefresh} /> : null}
        {hint.otp ? <RevealValue label="Emailed/SMS code" value={hint.otp} /> : null}
      </div>
    </details>
  );
}

export function RegisterPage({ user }: AuthPageProps) {
  if (user) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h1>Already registered</h1>
          <p>You are signed in as {user.username}.</p>
          <a className="button" href="/user/home">
            Go To Account
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page login-background">
      <div className="auth-card">
        <h1>Register</h1>
        <form method="POST" action="/user/register">
          <input type="hidden" name="appReturnTo" value="/app/login" />
          <label>
            Username
            <input name="username" required type="text" />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <div className="form-grid">
            <label>
              First Name
              <input name="firstName" required type="text" />
            </label>
            <label>
              Last Name
              <input name="lastName" required type="text" />
            </label>
          </div>
          <label>
            Password
            <input name="password" required type="password" />
          </label>
          <button type="submit">Register</button>
        </form>
        <p className="auth-links">
          Already have an account? <a href="/app/login">Login</a>
        </p>
      </div>
    </section>
  );
}

export function ForgotPasswordPage() {
  return (
    <section className="auth-page">
      <div className="auth-card narrow">
        <h1>Forgot Password</h1>
        <form method="POST" action="/user/forgot-password">
          <input type="hidden" name="appReturnTo" value="/app/login" />
          <label>
            Email Address
            <input name="email" required type="email" />
          </label>
          <button type="submit">Reset Password</button>
        </form>
        <p className="auth-links">
          <a href="/app/login">Back to Login</a>
        </p>
      </div>
    </section>
  );
}

function LoginError({ html }: { html: string }) {
  // INSECURE: login error rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates reflected XSS in the modern React login page for Fortify SAST/DAST
  // Fix: render error text normally so React escapes it
  return <div className="danger-notice compact" role="alert" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MfaError({ html }: { html: string }) {
  // INSECURE: MFA error rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates reflected XSS in the modern React MFA page for Fortify SAST/DAST
  // Fix: render error text normally so React escapes it
  return <div className="danger-notice compact" role="alert" dangerouslySetInnerHTML={{ __html: html }} />;
}
