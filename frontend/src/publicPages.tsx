type BootstrapData = {
  appName: string;
  user: null | {
    username: string;
  };
};

const adviceTopics = [
  ['Common Cold', 'Rest, fluids, and over-the-counter remedies can help manage symptoms.'],
  ['Pain Management', 'Paracetamol and ibuprofen are effective for mild to moderate pain.'],
  ['Allergies', 'Antihistamines and nasal sprays can provide relief from seasonal allergies.'],
  ['Skin Conditions', 'Speak to our pharmacists about creams and treatments for eczema, psoriasis and more.'],
];

const services = [
  ['Prescription Dispensing', 'Fast and accurate dispensing of NHS and private prescriptions.'],
  ['Flu Vaccinations', 'Annual flu jabs available to eligible patients - no appointment needed.'],
  ['Blood Pressure Monitoring', 'Free blood pressure checks with one of our trained pharmacists.'],
  ['Medication Reviews', 'We review your medicines to help optimise your treatment and reduce side-effects.'],
];

const vulnerabilities = [
  ['CWE-89', 'SQL Injection', 'GET /api/v3/users?keywords=', "?keywords=' OR '1'='1"],
  ['CWE-79', 'Reflected XSS', 'GET /products?keywords=, /app/products?keywords=, /login?error=', '?keywords=<script>alert(1)</script>'],
  ['CWE-79', 'Stored XSS', 'Product reviews, messages, /app/products/:id reviews', 'Submit <script>alert(1)</script> as review comment'],
  ['CWE-611', 'XXE', 'POST /user/upload-xml-file', '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/hosts">]>'],
  ['CWE-22', 'Path Traversal', 'GET /user/files/download/unverified?file=', '?file=../../../etc/passwd'],
  ['CWE-78', 'OS Command Injection', 'POST /admin/command-shell, /user/command-shell', 'cmd=ls; cat /etc/passwd'],
  ['CWE-502', 'Insecure Deserialization', 'POST /user/import-settings', 'Base64 node-serialize payload with IIFE function'],
  ['CWE-117', 'Log Injection', 'POST /admin/log?val=, /user/log', '?val=%0AINFO%20Injected%20log%20entry'],
  ['CWE-532', 'Sensitive Data in Logs', 'POST /login', 'Check ./logs/iwa.log after login attempt'],
  ['CWE-327, CWE-338', 'Weak Crypto / Insecure Randomness', 'src/utils/crypto.ts, VerificationService', 'generateInsecureToken() uses Math.random()'],
  ['CWE-352', 'CSRF Disabled', 'All state-changing web forms', 'Cross-origin POST has no CSRF token validation'],
  ['CWE-942', 'Permissive CORS', 'src/config/security.ts', 'Send request with arbitrary Origin header'],
  ['CWE-601', 'Open Redirect', 'POST /login?redirect=', 'POST /login?redirect=http://evil.example'],
  ['CWE-798', 'Hardcoded Credentials', 'src/config/env.ts, src/web/admin/index.ts', 'Hardcoded JWT secret and BACKDOOR_TOKEN'],
  ['CWE-209', 'Verbose Error Handling', 'src/middleware/errorHandler.ts', 'Trigger error and inspect stack trace'],
  ['CWE-639', 'Broken Access Control / IDOR', 'PUT /api/v3/users/:id', 'PUT without Authorization header'],
  ['CWE-1035', 'Vulnerable Dependencies', 'package.json', 'Run npm audit'],
  ['CWE-1321', 'Prototype Pollution', 'src/utils/deepMerge.ts, POST /user/edit-profile', '{"__proto__":{"polluted":true}}'],
  ['CWE-915', 'Mass Assignment', 'PUT /api/v3/users/:id', '{"enabled":false,"locked":true}'],
  ['CWE-95', 'Code Injection via eval', 'POST /admin/diagnostics', "expr=require('child_process').execSync('id')"],
  ['CWE-918', 'SSRF', 'POST /admin/diagnostics', 'url=http://169.254.169.254/latest/meta-data/'],
  ['CWE-1333', 'ReDoS', 'Email validation regex in registration', 'Submit email like aaaaaaaaaaaaaaaaaa@'],
  ['CWE-943', 'Query Object Injection', 'GET /api/v3/products', 'Pass Sequelize operators as query params'],
  ['CWE-614, CWE-1004, CWE-384', 'Insecure Session', 'src/config/security.ts', 'Inspect IWASESSION cookie attributes'],
  ['CWE-307', 'Missing Rate Limiting', 'POST /login, POST /api/v3/site/sign-in', 'Unlimited login attempts'],
  ['CWE-434', 'Unrestricted File Upload', 'POST /user/upload-file', 'Upload .php or .exe file'],
  ['CWE-22', 'Zip Slip', 'POST /admin/backup', 'Upload ZIP with ../../etc/cron.d/evil'],
];

export function HomePage({ bootstrap }: { bootstrap: BootstrapData | null }) {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <p className="eyebrow">Local Service, Global Reach</p>
          <h1>Welcome to {bootstrap?.appName ?? 'IWA Pharmacy Direct'}</h1>
          <p>{bootstrap?.user ? `Welcome back to our site, ${bootstrap.user.username}` : 'Your trusted online pharmacy for medicines and health advice.'}</p>
          <div className="hero-actions">
            {!bootstrap?.user ? <a className="button secondary" href="/app/register">Register</a> : null}
            <a className="button" href="/app/products">Shop Now</a>
            <a className="button secondary" href="/app/prescriptions">Prescriptions</a>
          </div>
        </div>
      </section>

      <section className="promo-grid">
        <Promo title="Free Shipping" text="Fast and secure delivery" detail="Available on qualifying orders." href="/app/services" />
        <Promo title="Season Sale 50% Off" text="Special offers this week" detail="Browse discounted products now." href="/app/products" />
        <Promo title="Health Advice" text="Speak with our pharmacists" detail="Get practical guidance today." href="/app/advice" />
      </section>

      <section className="testimonial-band">
        <h2>Testimonials</h2>
        <div className="testimonial-grid">
          <Testimonial image="/img/person_1.jpg" quote="Excellent service and great value. Highly recommended." name="Sarah Peters" />
          <Testimonial image="/img/person_2.jpg" quote="Quick delivery and easy online ordering experience." name="Brent Easter" />
          <Testimonial image="/img/person_3.jpg" quote="Helpful advice and quality products for my family." name="Lucas Gallione" />
        </div>
      </section>
    </div>
  );
}

export function AdvicePage() {
  return <InfoGridPage title="Health Advice" intro="Our team of qualified pharmacists is available to provide free health advice on a range of conditions." items={adviceTopics} />;
}

export function ServicesPage() {
  return <InfoGridPage title="Our Services" items={services} />;
}

export function PrescriptionsPage({ bootstrap }: { bootstrap: BootstrapData | null }) {
  return (
    <section className="content-page">
      <Breadcrumb current="Prescriptions" />
      <h1>Prescriptions</h1>
      <p>Order your repeat prescriptions online. We will dispense and deliver to your door.</p>
      {bootstrap?.user ? <a className="button" href="/app/user/orders">View My Prescriptions</a> : <div className="notice">Please <a href="/app/login">login</a> to order prescriptions.</div>}
    </section>
  );
}

export function VulnerabilitiesPage() {
  return (
    <section className="content-page vulnerabilities-page">
      <Breadcrumb current="Intentional Vulnerabilities" />
      <h1>Intentional Vulnerabilities</h1>
      <div className="danger-notice"><strong>WARNING:</strong> All vulnerabilities below are intentional and exist for security training purposes.</div>
      <div className="vulnerability-table-wrap">
        <table className="vulnerability-table">
          <thead><tr><th>#</th><th>CWE</th><th>Name</th><th>Location</th><th>Detection Tooling</th><th>Reproduction</th></tr></thead>
          <tbody>
            {vulnerabilities.map(([cwe, name, location, reproduction], index) => (
              <tr key={`${cwe}-${name}`}>
                <td>{index + 1}</td>
                <td>{cwe}</td>
                <td>{name}</td>
                <td>{location}</td>
                <td>SAST, DAST</td>
                <td><code>{reproduction}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>See <a href="/swagger-ui">API Documentation</a> for all REST endpoints.</p>
    </section>
  );
}

function InfoGridPage({ title, intro, items }: { title: string; intro?: string; items: string[][] }) {
  return (
    <section className="content-page">
      <Breadcrumb current={title} />
      <h1>{title}</h1>
      {intro ? <p>{intro}</p> : null}
      <div className="info-grid">
        {items.map(([heading, text]) => (
          <article className="info-card" key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Breadcrumb({ current }: { current: string }) {
  return <div className="page-kicker"><a href="/app/">Home</a> / <strong>{current}</strong></div>;
}

function Promo({ title, text, detail, href }: { title: string; text: string; detail: string; href: string }) {
  return (
    <a className="promo-card" href={href}>
      <h2>{title}</h2>
      <p>{text}</p>
      <strong>{detail}</strong>
    </a>
  );
}

function Testimonial({ image, quote, name }: { image: string; quote: string; name: string }) {
  return (
    <figure className="testimonial-card">
      <img src={image} alt={name} />
      <blockquote>{quote}</blockquote>
      <figcaption>{name}</figcaption>
    </figure>
  );
}