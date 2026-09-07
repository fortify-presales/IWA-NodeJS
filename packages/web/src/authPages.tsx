import { UserCircleIcon } from '@heroicons/react/24/outline';
import { BrandLogo } from './components/BrandLogo';

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

export function MfaPage() {
  const error = queryParam('error');

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
      </div>
    </section>
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
