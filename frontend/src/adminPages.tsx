import React from 'react';
import { getJson } from './api';

type AdminSummary = {
  stats: Record<'users' | 'products' | 'orders' | 'reviews' | 'messages', number>;
  users: Array<{
    id: string;
    username: string;
    email: string;
    enabled: boolean;
    authorities?: Array<{ name: string }>;
  }>;
  products: Array<{
    code: string;
    name: string;
    price: number | string;
    inStock: boolean;
  }>;
  orders: Array<{
    orderNum: string;
    amount: number | string;
    shipped: boolean;
    user?: { username: string };
  }>;
  reviews: Array<{
    id: string;
    comment: string;
    rating: number;
    product?: { name: string };
    user?: { username: string };
  }>;
  messages: Array<{
    id: string;
    text: string;
    read: boolean;
    sentDate: string;
    user?: { username: string };
  }>;
  logContent: string;
  reactResult: null | {
    kind: string;
    content?: string;
    evalResult?: string;
    fetchResult?: string;
  };
};

export function AdminRoute() {
  const [summary, setSummary] = React.useState<AdminSummary | null>(null);
  const [status, setStatus] = React.useState('Loading admin');
  const path = window.location.pathname.replace(/\/$/, '');

  React.useEffect(() => {
    getJson<AdminSummary>('/api/v3/admin/summary')
      .then((data) => {
        setSummary(data);
        setStatus('');
      })
      .catch((error: Error) => setStatus(error.message));
  }, []);

  if (status) return <AdminGate message={status} />;
  if (!summary) return <AdminGate message="Admin data unavailable" />;

  if (path === '/app/admin/users') return <UsersPage summary={summary} />;
  if (path === '/app/admin/products') return <ProductsPage summary={summary} />;
  if (path === '/app/admin/orders') return <OrdersPage summary={summary} />;
  if (path === '/app/admin/reviews') return <ReviewsPage summary={summary} />;
  if (path === '/app/admin/messages') return <MessagesPage summary={summary} />;
  if (path === '/app/admin/backup') return <BackupPage summary={summary} />;
  if (path === '/app/admin/diagnostics') return <DiagnosticsPage summary={summary} />;
  if (path === '/app/admin/command-shell') return <CommandShellPage summary={summary} />;
  if (path === '/app/admin/log') return <AdminLogPage summary={summary} />;
  if (path === '/app/admin/backdoor') return <BackdoorPage />;

  return <Dashboard summary={summary} />;
}

function AdminGate({ message }: { message: string }) {
  return (
    <section className="content-page">
      <h1>Admin</h1>
      <p>{message}</p>
      <a className="button" href={`/app/login?redirect=${encodeURIComponent(window.location.pathname)}`}>Login</a>
    </section>
  );
}

function Dashboard({ summary }: { summary: AdminSummary }) {
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="Dashboard" />
      <h1>Admin Dashboard</h1>
      <div className="admin-stats">
        <Stat label="Users" value={summary.stats.users} />
        <Stat label="Products" value={summary.stats.products} />
        <Stat label="Orders" value={summary.stats.orders} />
        <Stat label="Messages" value={summary.stats.messages} />
      </div>
      <div className="admin-actions">
        <AdminAction href="/app/admin/users" label="Users" />
        <AdminAction href="/app/admin/products" label="Products" />
        <AdminAction href="/app/admin/orders" label="Orders" />
        <AdminAction href="/app/admin/reviews" label="Reviews" />
        <AdminAction href="/app/admin/messages" label="Messages" />
        <AdminAction href="/app/admin/diagnostics" label="Diagnostics" />
        <AdminAction href="/app/admin/command-shell" label="Command Shell" danger />
        <AdminAction href="/app/admin/log" label="Log" />
        <AdminAction href="/app/admin/backup" label="Backup" />
        <AdminAction href="/app/admin/backdoor?token=iwa-admin-backdoor-super-secret-token-cwe798" label="Backdoor" danger />
      </div>
    </section>
  );
}

function UsersPage({ summary }: { summary: AdminSummary }) {
  const keywords = new URLSearchParams(window.location.search).get('keywords') ?? '';
  const users = keywords ? summary.users.filter((user) => user.username.includes(keywords)) : summary.users;
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="User Management" />
      <h1>User Management</h1>
      <form className="search-form" method="GET" action="/app/admin/users">
        <input name="keywords" placeholder="Search users..." type="text" defaultValue={keywords} />
        <button type="submit">Search</button>
      </form>
      {keywords ? <AdminSearchTerm html={keywords} /> : null}
      <DataTable headers={['Username', 'Email', 'Roles', 'Enabled', 'Actions']}>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td><StoredRoleNames html={(user.authorities ?? []).map((authority) => authority.name).join(', ')} /></td>
            <td>{user.enabled ? 'Yes' : 'No'}</td>
            <td><a href={`/api/v3/users/${user.id}`}>View</a></td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}

function ProductsPage({ summary }: { summary: AdminSummary }) {
  return <TablePage title="Product Management" headers={['Code', 'Name', 'Price', 'In Stock']} rows={summary.products.map((product) => [product.code, product.name, String(product.price), product.inStock ? 'Yes' : 'No'])} />;
}

function OrdersPage({ summary }: { summary: AdminSummary }) {
  return <TablePage title="Order Management" headers={['Order #', 'User', 'Amount', 'Status']} rows={summary.orders.map((order) => [order.orderNum, order.user?.username ?? '', String(order.amount), order.shipped ? 'Shipped' : 'Pending'])} />;
}

function ReviewsPage({ summary }: { summary: AdminSummary }) {
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="Review Management" />
      <h1>Review Management</h1>
      <DataTable headers={['Product', 'User', 'Comment', 'Rating']}>
        {summary.reviews.map((review) => (
          <tr key={review.id}>
            <td>{review.product?.name ?? ''}</td>
            <td>{review.user?.username ?? ''}</td>
            <td><StoredReviewComment html={review.comment} /></td>
            <td>{review.rating}</td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}

function MessagesPage({ summary }: { summary: AdminSummary }) {
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="Message Management" />
      <h1>Message Management</h1>
      <DataTable headers={['User', 'Message', 'Date', 'Read']}>
        {summary.messages.map((message) => (
          <tr key={message.id}>
            <td>{message.user?.username ?? ''}</td>
            <td><StoredMessageText html={message.text} /></td>
            <td>{new Date(message.sentDate).toLocaleString()}</td>
            <td>{message.read ? 'Yes' : 'No'}</td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}

function BackupPage({ summary }: { summary: AdminSummary }) {
  return (
    <AdminToolForm title="Backup & Restore" action="/admin/backup" submitLabel="Extract Archive" encType="multipart/form-data" danger>
      {/* INSECURE: archive upload is extracted without path validation (CWE-22)
          Purpose: demonstrates Zip Slip in the modern React admin frontend for Fortify SAST/DAST
          Fix: resolve each entry path and ensure it remains inside the extraction root */}
      <div className="danger-notice compact">INSECURE: Zip Slip (CWE-22)</div>
      <label>Archive (.zip)<input name="archive" accept=".zip" required type="file" /></label>
      <AdminResultPanel result={summary.reactResult} />
    </AdminToolForm>
  );
}

function DiagnosticsPage({ summary }: { summary: AdminSummary }) {
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="Diagnostics" />
      <h1>Admin Diagnostics</h1>
      <div className="admin-tool-grid">
        <AdminToolForm title="Expression Evaluator" action="/admin/diagnostics" submitLabel="Evaluate" danger compact>
          {/* INSECURE: expression text posted to eval sink (CWE-95)
              Purpose: demonstrates code injection in the modern React admin frontend for Fortify SAST/DAST
              Fix: remove eval and expose safe diagnostics only */}
          <div className="danger-notice compact">INSECURE: Code Injection via eval (CWE-95)</div>
          <label>Expression<input name="expr" placeholder="1+1" type="text" /></label>
        </AdminToolForm>
        <AdminToolForm title="URL Fetch" action="/admin/diagnostics" submitLabel="Fetch" danger compact>
          {/* INSECURE: URL text posted to arbitrary server-side fetch sink (CWE-918)
              Purpose: demonstrates SSRF in the modern React admin frontend for Fortify SAST/DAST
              Fix: restrict outbound requests to an allowlist and block internal addresses */}
          <div className="danger-notice compact">INSECURE: SSRF (CWE-918)</div>
          <label>URL<input name="url" placeholder="http://internal-service/" type="text" /></label>
        </AdminToolForm>
      </div>
      <AdminResultPanel result={summary.reactResult} />
    </section>
  );
}

function CommandShellPage({ summary }: { summary: AdminSummary }) {
  return (
    <AdminToolForm title="Admin Command Shell" action="/admin/command-shell" submitLabel="Execute" danger>
      {/* INSECURE: command text posted to child_process.execSync sink (CWE-78)
          Purpose: demonstrates OS command injection in the modern React admin frontend for Fortify SAST/DAST
          Fix: avoid shell execution and use safe parameterized system APIs only */}
      <div className="danger-notice compact">INSECURE: OS Command Injection (CWE-78)</div>
      <label>Command<input name="cmd" placeholder="ls -la" type="text" /></label>
      <AdminResultPanel result={summary.reactResult} />
    </AdminToolForm>
  );
}

function AdminLogPage({ summary }: { summary: AdminSummary }) {
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="Application Log" />
      <h1>Application Log</h1>
      <form className="tool-form" method="POST" action="/admin/log">
        <input type="hidden" name="appReturnTo" value="/app/admin/log" />
        {/* INSECURE: admin log value accepts raw CR/LF-controlled input (CWE-117)
            Purpose: demonstrates log injection in the modern React admin frontend for Fortify SAST/DAST
            Fix: strip CR/LF and use structured logging */}
        <label>Log injection payload<input name="val" id="val" type="text" /></label>
        <button type="submit">Inject Log Entry</button>
      </form>
      <StoredLogContent html={summary.logContent} />
    </section>
  );
}

function BackdoorPage() {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const granted = token === 'iwa-admin-backdoor-super-secret-token-cwe798';
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current="Backdoor" />
      <div className="danger-notice">
        <h1>Backdoor Access</h1>
        {/* INSECURE: hardcoded admin backdoor token displayed in frontend (CWE-798)
            Purpose: demonstrates hardcoded credentials/backdoor access in the modern React admin frontend for Fortify SAST/DAST
            Fix: remove the backdoor and rely on proper authenticated admin access only */}
        <p><strong>{granted ? 'Backdoor access granted!' : 'Invalid backdoor token'}</strong></p>
        <p>This backdoor is accessible with token: <code>iwa-admin-backdoor-super-secret-token-cwe798</code></p>
      </div>
    </section>
  );
}

function TablePage({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="content-page admin-page">
      <AdminBreadcrumb current={title} />
      <h1>{title}</h1>
      <DataTable headers={headers}>{rows.map((row, rowIndex) => <tr key={String(rowIndex)}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</DataTable>
    </section>
  );
}

function AdminToolForm({ title, action, submitLabel, encType, danger, compact, children }: { title: string; action: string; submitLabel: string; encType?: string; danger?: boolean; compact?: boolean; children: React.ReactNode }) {
  const returnTo = window.location.pathname;
  return (
    <section className={compact ? 'admin-tool-panel' : 'content-page admin-page tool-page'}>
      {!compact ? <AdminBreadcrumb current={title} /> : null}
      <h1>{title}</h1>
      <form className="tool-form" method="POST" action={action} encType={encType}>
        <input type="hidden" name="appReturnTo" value={returnTo} />
        {children}
        <button className={danger ? 'danger-button' : undefined} type="submit">{submitLabel}</button>
      </form>
    </section>
  );
}

function AdminBreadcrumb({ current }: { current: string }) {
  return <div className="page-kicker"><a href="/app/admin">Admin</a> / <strong>{current}</strong></div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <article className="admin-stat"><strong>{value}</strong><span>{label}</span></article>;
}

function AdminAction({ href, label, danger }: { href: string; label: string; danger?: boolean }) {
  return <a className={danger ? 'admin-action danger' : 'admin-action'} href={href}>{label}</a>;
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="data-table-wrap"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function AdminSearchTerm({ html }: { html: string }) {
  // INSECURE: admin user search term reflected into DOM without escaping (CWE-79)
  // Purpose: demonstrates reflected XSS in the modern React admin users page for Fortify SAST/DAST
  // Fix: render search terms normally so React escapes them
  return <p>Results for: <span dangerouslySetInnerHTML={{ __html: html }} /></p>;
}

function StoredRoleNames({ html }: { html: string }) {
  // INSECURE: user authority names rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates stored XSS in the modern React admin users page for Fortify SAST/DAST
  // Fix: render authority names as text
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function StoredReviewComment({ html }: { html: string }) {
  // INSECURE: review comments rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates stored XSS in the modern React admin reviews page for Fortify SAST/DAST
  // Fix: render review comments as text and sanitize stored content before display
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function StoredMessageText({ html }: { html: string }) {
  // INSECURE: message text rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates stored XSS in the modern React admin messages page for Fortify SAST/DAST
  // Fix: render message text as text and sanitize stored content before display
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function StoredLogContent({ html }: { html: string }) {
  // INSECURE: admin log content rendered into DOM without escaping (CWE-79, CWE-117)
  // Purpose: demonstrates log injection and stored XSS in the modern React admin log page for Fortify SAST/DAST
  // Fix: render log content as text and encode untrusted data before display
  return <pre className="terminal-output" dangerouslySetInnerHTML={{ __html: html }} />;
}

function AdminResultPanel({ result }: { result: AdminSummary['reactResult'] }) {
  if (!result) return null;
  if (result.evalResult || result.fetchResult) {
    return (
      <div className="result-panel">
        {result.evalResult ? <StoredAdminToolResult html={`Result: ${result.evalResult}`} /> : null}
        {result.fetchResult ? <StoredAdminToolResult html={result.fetchResult} /> : null}
      </div>
    );
  }
  if (result.content) return <StoredAdminToolResult html={result.content} />;
  return null;
}

function StoredAdminToolResult({ html }: { html: string }) {
  // INSECURE: admin tool result rendered into DOM without escaping (CWE-79)
  // Purpose: preserves legacy unescaped command/eval/fetch result rendering for Fortify SAST/DAST
  // Fix: render tool output as text and encode untrusted data before display
  return <pre className="terminal-output" dangerouslySetInnerHTML={{ __html: html }} />;
}