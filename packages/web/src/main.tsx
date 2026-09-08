import React from 'react';
import { createRoot } from 'react-dom/client';
import { AccountRoute } from './accountPages';
import { AdminRoute } from './adminPages';
import { AssistantPage } from './agentPage';
import { ForgotPasswordPage, LoginPage, MfaPage, RegisterPage } from './authPages';
import { CartPage } from './cartPage';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
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
  const assistantNeedsLogin = path === '/app/assistant' && bootstrapLoaded && !bootstrap?.user;

  React.useEffect(() => {
    if (assistantNeedsLogin) {
      window.location.replace(`/app/login?redirect=${encodeURIComponent('/app/assistant')}`);
    }
  }, [assistantNeedsLogin]);

  if (path === '/app' || path === '') return <HomePage bootstrap={bootstrap ?? null} />;
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
  if (path === '/app/prescriptions') return <PrescriptionsPage bootstrap={bootstrap ?? null} />;
  if (path === '/app/vulnerabilities') return <VulnerabilitiesPage />;
  if (path === '/app/assistant') {
    if (assistantNeedsLogin) return null;
    return <AssistantPage />;
  }

  return <Preview bootstrap={bootstrap ?? null} />;
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

function Preview({ bootstrap }: { bootstrap: BootstrapResponse['data'] | null }) {
  return (
    <section className="app-panel page-frame">
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
