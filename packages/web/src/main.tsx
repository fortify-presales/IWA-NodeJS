import React from 'react';
import { createRoot } from 'react-dom/client';
import { AccountRoute } from './accountPages';
import { AdminRoute } from './adminPages';
import { AssistantPage, AssistantSetupPage } from './agentPage';
import { ForgotPasswordPage, LoginPage, MfaPage, RegisterPage } from './authPages';
import { CartPage } from './cartPage';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { resolvePreferredCurrency } from './currency';
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
  const [bootstrapLoaded, setBootstrapLoaded] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    fetch('/api/v3/site/bootstrap', { credentials: 'include' })
      .then((response) => response.json() as Promise<BootstrapResponse>)
      .then((payload) => {
        if (!ignore) {
          setBootstrap(payload.data ?? null);
          setBootstrapLoaded(true);
        }
      })
      .catch(() => {
        if (!ignore) {
          setBootstrap(null);
          setBootstrapLoaded(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <ModernShell bootstrap={bootstrap}>
      <AppRoute bootstrap={bootstrap} bootstrapLoaded={bootstrapLoaded} />
    </ModernShell>
  );
}

function AppRoute({
  bootstrap,
  bootstrapLoaded,
}: {
  bootstrap: BootstrapResponse['data'] | null;
  bootstrapLoaded: boolean;
}) {
  const path = window.location.pathname.replace(/\/$/, '');
  const currency = resolvePreferredCurrency(bootstrap?.currency);

  if (path === '/app' || path === '') return <HomePage bootstrap={bootstrap ?? null} />;
  if (path === '/app/login') return <LoginPage user={bootstrap?.user ?? null} />;
  if (path === '/app/login-mfa') return <MfaPage />;
  if (path === '/app/register') return <RegisterPage user={bootstrap?.user ?? null} />;
  if (path === '/app/forgot-password') return <ForgotPasswordPage />;
  if (path === '/app/cart') return <CartPage currency={currency} user={bootstrap?.user ?? null} />;
  if (path.startsWith('/app/admin')) return <AdminRoute currency={currency} />;
  if (path.startsWith('/app/user')) return <AccountRoute currency={currency} />;
  if (path.startsWith('/app/products')) return <ProductCatalog currency={currency} />;
  if (path === '/app/advice') return <AdvicePage />;
  if (path === '/app/services') return <ServicesPage />;
  if (path === '/app/prescriptions') return <PrescriptionsPage bootstrap={bootstrap ?? null} />;
  if (path === '/app/vulnerabilities') return <VulnerabilitiesPage />;
  if (path === '/app/assistant/setup') {
    return <AssistantSetupPage />;
  }
  if (path === '/app/assistant') {
    return <AssistantPage signedIn={Boolean(bootstrap?.user)} bootstrapLoaded={bootstrapLoaded} />;
  }

  return <NotFoundPage />;
}

function ModernShell({
  bootstrap,
  children,
}: {
  bootstrap: BootstrapResponse['data'] | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader
        appName={bootstrap?.appName ?? 'IWA Pharmacy Direct'}
        user={bootstrap?.user ?? null}
      />
      <main className="app-shell">{children}</main>
      <SiteFooter appName={bootstrap?.appName ?? 'IWA Pharmacy Direct'} />
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="page-frame content-page">
      <p className="page-kicker">Page not found</p>
      <h1>We couldn't find that page</h1>
      <p>That address doesn't match a page in IWA Pharmacy Direct.</p>
      <div className="action-row">
        <a className="button" href="/app/">Go to home</a>
        <a className="button secondary outline" href="/app/login">Sign in</a>
      </div>
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
