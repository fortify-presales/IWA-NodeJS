import React from 'react';
import { createRoot } from 'react-dom/client';
import { AccountRoute } from './accountPages';
import { AdminRoute } from './adminPages';
import { AssistantPage } from './agentPage';
import { ForgotPasswordPage, LoginPage, MfaPage, RegisterPage } from './authPages';
import { CartCount, CartPage } from './cartPage';
import { ProductCatalog } from './products';
import { AdvicePage, HomePage, PrescriptionsPage, ServicesPage, VulnerabilitiesPage } from './publicPages';
import './styles.css';

type BootstrapResponse = {
  status: string;
  message: string;
  data?: {
    appName: string;
    appVersion: string;
    currency: string;
    user: null | {
      id: number | string;
      username: string;
      email?: string;
      authorities: string[];
    };
    flash: {
      success?: string;
      error?: string;
    };
  };
};

function App() {
  const [bootstrap, setBootstrap] = React.useState<BootstrapResponse['data'] | null>(null);

  React.useEffect(() => {
    let ignore = false;

    fetch('/api/v3/site/bootstrap', { credentials: 'include' })
      .then((response) => response.json() as Promise<BootstrapResponse>)
      .then((payload) => {
        if (!ignore) setBootstrap(payload.data ?? null);
      })
      .catch(() => {
        if (!ignore) setBootstrap(null);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return <ModernShell bootstrap={bootstrap}><AppRoute bootstrap={bootstrap} /></ModernShell>;
}

function AppRoute({ bootstrap }: { bootstrap: BootstrapResponse['data'] | null }) {
  const path = window.location.pathname.replace(/\/$/, '');

  if (path === '/app' || path === '') return <HomePage bootstrap={bootstrap} />;
  if (path === '/app/login') return <LoginPage user={bootstrap?.user ?? null} />;
  if (path === '/app/login-mfa') return <MfaPage />;
  if (path === '/app/register') return <RegisterPage user={bootstrap?.user ?? null} />;
  if (path === '/app/forgot-password') return <ForgotPasswordPage />;
  if (path === '/app/cart') return <CartPage currency={bootstrap?.currency ?? 'GBP'} user={bootstrap?.user ?? null} />;
  if (path.startsWith('/app/admin')) return <AdminRoute />;
  if (path.startsWith('/app/user')) return <AccountRoute currency={bootstrap?.currency ?? 'GBP'} />;
  if (path.startsWith('/app/products')) return <ProductCatalog currency={bootstrap?.currency ?? 'GBP'} />;
  if (path === '/app/advice') return <AdvicePage />;
  if (path === '/app/services') return <ServicesPage />;
  if (path === '/app/prescriptions') return <PrescriptionsPage bootstrap={bootstrap} />;
  if (path === '/app/vulnerabilities') return <VulnerabilitiesPage />;
  if (path === '/app/assistant') return <AssistantPage />;

  return <Preview bootstrap={bootstrap} />;
}

function ModernShell({ bootstrap, children }: { bootstrap: BootstrapResponse['data'] | null; children: React.ReactNode }) {
  const accountLabel = bootstrap?.user ? bootstrap.user.username : 'My Account';

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/app/">{bootstrap?.appName ?? 'IWA Pharmacy Direct'}</a>
        <nav>
          <a href="/app/">Home</a>
          <details className="nav-menu">
            <summary>Shop</summary>
            <div className="dropdown-panel">
              <a href="/app/products">All Products</a>
              <a href="/app/products?keywords=First%20Aid">First Aid</a>
              <a href="/app/prescriptions">Prescriptions</a>
            </div>
          </details>
          <details className="nav-menu">
            <summary>Learn</summary>
            <div className="dropdown-panel">
              <a href="/app/services">Services</a>
              <a href="/app/advice">Advice</a>
              <a href="/app/assistant">AI Assistant</a>
              <a href="/app/vulnerabilities">Vulnerabilities</a>
              <a href="/swagger-ui" target="_blank">API Explorer</a>
            </div>
          </details>
          <details className="nav-menu">
            <summary>{accountLabel}</summary>
            <div className="dropdown-panel">
              {bootstrap?.user ? <a href="/app/user/home">Account Home</a> : <a href="/app/login">Login</a>}
              {bootstrap?.user ? <a href="/app/user/profile">Profile</a> : <a href="/app/register">Register</a>}
              {bootstrap?.user ? <a href="/app/user/orders">Orders</a> : null}
              {bootstrap?.user ? <a href="/app/user/messages">Messages</a> : null}
              {bootstrap?.user?.authorities.includes('ROLE_ADMIN') ? <a href="/app/admin">Site Administration</a> : null}
              {bootstrap?.user ? <a href="/logout">Logout</a> : null}
            </div>
          </details>
          <a className="cart-link" href="/app/cart">Cart <CartCount /></a>
        </nav>
      </header>
      <main className="app-shell">{children}</main>
    </>
  );
}

function Preview({ bootstrap }: { bootstrap: BootstrapResponse['data'] | null }) {
  return (
    <section className="app-panel">
      <p className="eyebrow">Modern frontend preview</p>
      <h1>{bootstrap?.appName ?? 'IWA Pharmacy Direct'}</h1>
      <p>This React and TypeScript shell is served from Express and now includes migrated public routes.</p>
      <dl className="facts">
        <div>
          <dt>Version</dt>
          <dd>{bootstrap?.appVersion ?? 'Loading'}</dd>
        </div>
        <div>
          <dt>Currency</dt>
          <dd>{bootstrap?.currency ?? 'Loading'}</dd>
        </div>
        <div>
          <dt>Session</dt>
          <dd>{bootstrap?.user ? bootstrap.user.username : 'Anonymous'}</dd>
        </div>
      </dl>
    </section>
  );
}

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}