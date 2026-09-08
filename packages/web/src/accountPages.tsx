import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { getJson } from './api';

type AccountSummary = {
  user: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    zip?: string;
    mfaType?: string;
  };
  unreadMessages: number;
  orders: Array<{
    id: string;
    orderNum: string;
    orderDate: string;
    amount: number | string;
    shipped: boolean;
  }>;
  messages: Array<{
    id: string;
    text: string;
    sentDate: string;
    read: boolean;
  }>;
  reviews: Array<{
    id: string;
    comment: string;
    rating: number;
    product?: {
      name: string;
    };
  }>;
  files: string[];
  logContent: string;
  reactResult: null | {
    kind: string;
    message?: string;
    content?: string;
    qrCode?: string;
    secret?: string;
  };
};

type AccountProps = {
  currency: string;
};

export function AccountRoute({ currency }: AccountProps) {
  const [summary, setSummary] = React.useState<AccountSummary | null>(null);
  const [status, setStatus] = React.useState('Loading account');
  const path = window.location.pathname.replace(/\/$/, '');

  React.useEffect(() => {
    getJson<AccountSummary>('/api/v3/account/summary')
      .then((data) => {
        setSummary(data);
        setStatus('');
      })
      .catch(() => setStatus('Authentication required'));
  }, []);

  if (status === 'Authentication required') {
    return (
      <section className="page-frame content-page">
        <h1>Sign in required</h1>
        <p>Please sign in to view your account.</p>
        <a className="button" href={`/app/login?redirect=${encodeURIComponent(window.location.pathname)}`}>Login</a>
      </section>
    );
  }

  if (status || !summary) return <p className="status-line page-frame">{status}</p>;

  if (path === '/app/user/profile') return <ProfilePage summary={summary} />;
  if (path === '/app/user/edit-profile') return <EditProfilePage summary={summary} />;
  if (path === '/app/user/change-password') return <ChangePasswordPage />;
  if (path === '/app/user/orders') return <OrdersPage currency={currency} summary={summary} />;
  if (path === '/app/user/messages') return <MessagesPage summary={summary} />;
  if (path === '/app/user/reviews') return <ReviewsPage summary={summary} />;
  if (path === '/app/user/security') return <SecurityPage summary={summary} />;
  if (path === '/app/user/upload-file') return <UploadFilePage summary={summary} />;
  if (path === '/app/user/import-settings') return <ImportSettingsPage summary={summary} />;
  if (path === '/app/user/upload-xml-file') return <UploadXmlPage summary={summary} />;
  if (path === '/app/user/download-file') return <DownloadFilesPage summary={summary} />;
  if (path === '/app/user/command-shell') return <CommandShellPage summary={summary} />;
  if (path === '/app/user/log') return <LogPage summary={summary} />;

  return <AccountHome summary={summary} />;
}

function AccountHome({ summary }: { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page">
      <AccountBreadcrumb current="My Account" />
      <h1>My Account</h1>
      <div className="account-grid">
        <AccountTile href="/app/user/profile" title="Profile" value={summary.user.username} icon={UserCircleIcon} />
        <AccountTile href="/app/user/orders" title="Orders" value={String(summary.orders.length)} icon={ShoppingBagIcon} />
        <AccountTile href="/app/user/messages" title="Messages" value={summary.unreadMessages > 0 ? `${summary.unreadMessages} new` : 'None new'} icon={ChatBubbleLeftRightIcon} />
        <AccountTile href="/app/user/reviews" title="Reviews" value={String(summary.reviews.length)} icon={ClipboardDocumentListIcon} />
      </div>
    </section>
  );
}

function ProfilePage({ summary }: { summary: AccountSummary }) {
  const user = summary.user;
  return (
    <section className="page-frame content-page">
      <AccountBreadcrumb current="My Profile" />
      <h1>My Profile</h1>
      <table className="profile-table"><tbody>
        <tr><th scope="row">Username</th><td>{user.username}</td></tr>
        <tr><th scope="row">Email</th><td>{user.email}</td></tr>
        <tr><th scope="row">Name</th><td>{user.firstName} {user.lastName}</td></tr>
        <tr><th scope="row">Phone</th><td>{user.phone || '-'}</td></tr>
        <tr><th scope="row">Address</th><td>{user.address || '-'}</td></tr>
        <tr><th scope="row">City</th><td>{user.city || '-'}</td></tr>
        <tr><th scope="row">Postcode</th><td>{user.zip || '-'}</td></tr>
      </tbody></table>
      <div className="action-row">
        <a className="button" href="/app/user/edit-profile">Edit Profile</a>
        <a className="button secondary outline" href="/app/user/change-password">Change Password</a>
        <a className="button secondary outline" href="/app/user/security">Security</a>
      </div>
    </section>
  );
}

function EditProfilePage({ summary }: { summary: AccountSummary }) {
  const user = summary.user;
  return (
    <ToolFormPage title="Edit Profile" action="/user/edit-profile" submitLabel="Save Changes">
      <div className="form-grid">
        <label>First Name<input name="firstName" type="text" defaultValue={user.firstName || ''} /></label>
        <label>Last Name<input name="lastName" type="text" defaultValue={user.lastName || ''} /></label>
      </div>
      <label>Email<input name="email" type="email" defaultValue={user.email || ''} /></label>
      <label>Phone<input name="phone" type="text" defaultValue={user.phone || ''} /></label>
      <label>Address<input name="address" type="text" defaultValue={user.address || ''} /></label>
      <div className="form-grid wide-left">
        <label>City<input name="city" type="text" defaultValue={user.city || ''} /></label>
        <label>Postcode<input name="zip" type="text" defaultValue={user.zip || ''} /></label>
      </div>
    </ToolFormPage>
  );
}

function ChangePasswordPage() {
  return (
    <ToolFormPage title="Change Password" action="/user/change-password" submitLabel="Change Password">
      <label>New Password<input name="newPassword" required minLength={8} type="password" /></label>
      <label>Confirm Password<input name="confirmPassword" required type="password" /></label>
    </ToolFormPage>
  );
}

function SecurityPage({ summary }: { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page tool-page">
      <AccountBreadcrumb current="Security Settings" />
      <h1>Security Settings</h1>
      <p><strong>Current MFA:</strong> {summary.user.mfaType ?? 'MFA_NONE'}</p>
      <form className="tool-form" method="POST" action="/user/security/enable-mfa">
        <input type="hidden" name="appReturnTo" value="/app/user/security" />
        <input type="hidden" name="type" value="app" />
        <button type="submit">Enable TOTP MFA</button>
      </form>
      <ResultPanel result={summary.reactResult} />
    </section>
  );
}

function UploadFilePage({ summary }: { summary: AccountSummary }) {
  return (
    <ToolFormPage title="Upload File" action="/user/upload-file" submitLabel="Upload" encType="multipart/form-data">
      {/* INSECURE: unrestricted file upload form accepts any type (CWE-434)
          Purpose: demonstrates unrestricted file upload in the modern React frontend for Fortify SAST/DAST
          Fix: restrict extensions, validate MIME/content, and store outside the web root */}
      <label>Select File (any type accepted)<input name="file" required type="file" /></label>
      <ResultPanel result={summary.reactResult} />
    </ToolFormPage>
  );
}

function ImportSettingsPage({ summary }: { summary: AccountSummary }) {
  return (
    <ToolFormPage title="Import Settings" action="/user/import-settings" submitLabel="Import">
      {/* INSECURE: base64 payload posted to node-serialize unserialize sink (CWE-502)
          Purpose: demonstrates insecure deserialization in the modern React frontend for Fortify SAST/DAST
          Fix: use JSON.parse with schema validation and never deserialize executable objects */}
      <label>Base64 Payload<textarea name="payload" rows={7} required /></label>
      <ResultPanel result={summary.reactResult} />
    </ToolFormPage>
  );
}

function UploadXmlPage({ summary }: { summary: AccountSummary }) {
  return (
    <ToolFormPage title="Upload XML File" action="/user/upload-xml-file" submitLabel="Upload & Parse" encType="multipart/form-data">
      {/* INSECURE: XML upload reaches parser configured with external entities enabled (CWE-611)
          Purpose: demonstrates XXE in the modern React frontend for Fortify SAST/DAST
          Fix: disable DTD processing and external entities */}
      <label>XML File<input name="xmlFile" accept=".xml" required type="file" /></label>
      <ResultPanel result={summary.reactResult} />
    </ToolFormPage>
  );
}

function DownloadFilesPage({ summary }: { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page tool-page">
      <AccountBreadcrumb current="Download Files" />
      <h1>Download Uploaded Files</h1>
      {summary.files.length === 0 ? <EmptyState text="No files uploaded yet." /> : (
        <div className="message-list">
          {summary.files.map((file) => (
            <article className="message-card file-row" key={file}>
              <span>{file}</span>
              {/* INSECURE: filename is passed to unverified download endpoint (CWE-22)
                  Purpose: demonstrates path traversal in the modern React frontend for Fortify SAST/DAST
                  Fix: request downloads by server-generated IDs, not raw paths */}
              <a href={`/user/files/download/unverified?file=${encodeURIComponent(file)}`}>Download</a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function CommandShellPage({ summary }: { summary: AccountSummary }) {
  return (
    <ToolFormPage title="Command Shell" action="/user/command-shell" submitLabel="Execute" danger>
      {/* INSECURE: command text posted to child_process.execSync sink (CWE-78)
          Purpose: demonstrates OS command injection in the modern React frontend for Fortify SAST/DAST
          Fix: never execute shell commands from untrusted input */}
      <div className="danger-notice compact">This page intentionally demonstrates command injection.</div>
      <label>Command<input name="cmd" placeholder="ls -la" type="text" /></label>
      <ResultPanel result={summary.reactResult} />
    </ToolFormPage>
  );
}

function LogPage({ summary }: { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page tool-page">
      <AccountBreadcrumb current="Application Log" />
      <h1>Application Log</h1>
      <form className="tool-form" method="POST" action="/user/log">
        <input type="hidden" name="appReturnTo" value="/app/user/log" />
        {/* INSECURE: log message accepts raw CR/LF-controlled input (CWE-117)
            Purpose: demonstrates log injection in the modern React frontend for Fortify SAST/DAST
            Fix: strip CR/LF and use structured logging */}
        <label>Append Log Message<input name="message" type="text" /></label>
        <button type="submit">Write Log Entry</button>
      </form>
      <StoredLogContent html={summary.logContent} />
    </section>
  );
}

function ToolFormPage({ title, action, submitLabel, encType, danger, children }: { title: string; action: string; submitLabel: string; encType?: string; danger?: boolean; children: React.ReactNode }) {
  const returnTo = window.location.pathname;
  return (
    <section className="page-frame content-page tool-page">
      <AccountBreadcrumb current={title} />
      <h1>{title}</h1>
      <form className="tool-form" method="POST" action={action} encType={encType}>
        <input type="hidden" name="appReturnTo" value={returnTo} />
        {children}
        <div className="action-row">
          <button className={danger ? 'danger-button' : undefined} type="submit">{submitLabel}</button>
          <a className="button secondary outline" href="/app/user/home">Cancel</a>
        </div>
      </form>
    </section>
  );
}

function OrdersPage({ currency, summary }: AccountProps & { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page">
      <AccountBreadcrumb current="My Orders" />
      <h1>My Orders</h1>
      {summary.orders.length === 0 ? <EmptyState text="No orders yet." action="Shop Now" href="/app/products" /> : (
        <DataTable headers={['Order #', 'Date', 'Amount', 'Status', 'Actions']}>
          {summary.orders.map((order) => (
            <tr key={order.id}>
              <td>{order.orderNum}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>{currency} {order.amount}</td>
              <td><span className={order.shipped ? 'stock in' : 'stock pending'}>{order.shipped ? 'Shipped' : 'Pending'}</span></td>
              <td><a href={`/user/orders/${order.id}/invoice.pdf`}>Invoice</a></td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}

function MessagesPage({ summary }: { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page">
      <AccountBreadcrumb current="My Messages" />
      <h1>My Messages</h1>
      {summary.messages.length === 0 ? <EmptyState text="No messages." /> : (
        <div className="message-list">
          {summary.messages.map((message) => (
            <article className={message.read ? 'message-card' : 'message-card unread'} key={message.id}>
              <StoredMessageText html={message.text} />
              <small>{new Date(message.sentDate).toLocaleString()} {!message.read ? <span>New</span> : null}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewsPage({ summary }: { summary: AccountSummary }) {
  return (
    <section className="page-frame content-page">
      <AccountBreadcrumb current="My Reviews" />
      <h1>My Reviews</h1>
      {summary.reviews.length === 0 ? <EmptyState text="No reviews yet." /> : (
        <DataTable headers={['Product', 'Comment', 'Rating']}>
          {summary.reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.product?.name ?? 'Unknown'}</td>
              <td><StoredReviewCell html={review.comment} /></td>
              <td>{review.rating}/5</td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}

function AccountTile({
  href,
  title,
  value,
  icon: Icon,
}: {
  href: string;
  title: string;
  value: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <a className="account-tile" href={href}>
      {Icon ? <Icon className="h-6 w-6 text-brand-muted" aria-hidden="true" /> : null}
      <span>{title}</span>
      <strong>{value}</strong>
    </a>
  );
}

function AccountBreadcrumb({ current }: { current: string }) {
  return <div className="page-kicker"><a href="/app/user/home">My Account</a> / <strong>{current}</strong></div>;
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="data-table-wrap"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function EmptyState({ text, action, href }: { text: string; action?: string; href?: string }) {
  return <div className="notice">{text} {action && href ? <a href={href}>{action}</a> : null}</div>;
}

function StoredMessageText({ html }: { html: string }) {
  // INSECURE: message text rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates stored XSS in the modern React account messages page for Fortify SAST/DAST
  // Fix: render message text normally so React escapes it
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function StoredReviewCell({ html }: { html: string }) {
  // INSECURE: review comment rendered into DOM without escaping (CWE-79)
  // Purpose: demonstrates stored XSS in the modern React account reviews page for Fortify SAST/DAST
  // Fix: render review comments normally so React escapes them
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function StoredLogContent({ html }: { html: string }) {
  // INSECURE: log content rendered into DOM without escaping (CWE-79, CWE-117)
  // Purpose: demonstrates log injection and stored XSS in the modern React account log page for Fortify SAST/DAST
  // Fix: render log content as text and encode untrusted data before display
  return <pre className="terminal-output" dangerouslySetInnerHTML={{ __html: html }} />;
}

function ResultPanel({ result }: { result: AccountSummary['reactResult'] }) {
  if (!result) return null;
  if (result.kind === 'mfa') {
    return (
      <div className="notice result-panel">
        <p>{result.message}</p>
        {result.qrCode ? <img className="qr-code" src={result.qrCode} alt="QR Code" /> : null}
        {result.secret ? <p>Secret: <code>{result.secret}</code></p> : null}
      </div>
    );
  }
  if (result.content) return <StoredToolResult html={result.content} />;
  if (result.message) return <div className="notice result-panel">{result.message}</div>;
  return null;
}

function StoredToolResult({ html }: { html: string }) {
  // INSECURE: account tool result rendered into DOM without escaping (CWE-79)
  // Purpose: preserves legacy unescaped command/XML/deserialization result rendering for Fortify SAST/DAST
  // Fix: render tool output as text and encode untrusted data before display
  return <pre className="terminal-output" dangerouslySetInnerHTML={{ __html: html }} />;
}