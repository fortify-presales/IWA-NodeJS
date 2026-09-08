import { FaFacebookF, FaInstagram, FaRss, FaXTwitter } from 'react-icons/fa6';
import { BrandLogo } from './BrandLogo';

export function SiteFooter({ appName }: { appName: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <a className="footer-logo" href="/app/" aria-label={appName}>
            <BrandLogo appName={appName} variant="onDark" />
          </a>
          <p>
            IWA (Insecure Web App) Pharmacy Direct is a deliberately insecure web application for use in{' '}
            <a href="https://www.opentext.com/en-gb/products/application-security">
              OpenText™ Fortify™ Application Security
            </a>{' '}
            demonstrations.
          </p>
          <p>
            ©{' '}
            <a href="https://www.microfocus.com/">OpenText Corporation</a> {year}. All Rights Reserved.
          </p>
        </div>

        <div className="footer-nav">
          <div>
            <h3>Menu</h3>
            <ul className="footer-pages">
              <li>
                <a href="/app/products">Shop</a>
              </li>
              <li>
                <a href="/app/prescriptions">Prescriptions</a>
              </li>
              <li>
                <a href="/app/services">Services</a>
              </li>
              <li>
                <a href="/app/advice">Advice</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Company</h3>
            <ul className="footer-list">
              <li>
                <a href="/app/">About Us</a>
              </li>
              <li>
                <a href="/app/assistant">Contacts</a>
              </li>
              <li>
                <a href="/app/vulnerabilities">Terms &amp; Conditions</a>
              </li>
              <li>
                <a href="/app/vulnerabilities">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <h3>Demo</h3>
          <ul>
            <li>
              <a href="/app/vulnerabilities">Vulnerabilities</a>
            </li>
            <li>
              <a href="/swagger-ui" target="_blank" rel="noreferrer">
                API Explorer
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-ns">
          <h3>Newsletter</h3>
          <p>Sign-up for our newsletter by entering your email address below:</p>
          <form
            className="footer-newsletter"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <label className="sr-only" htmlFor="email-subscribe-input">
              Your email address
            </label>
            <input
              id="email-subscribe-input"
              name="email"
              placeholder="Your email address"
              required
              type="email"
            />
            <button id="email-subscribe-button" type="submit" aria-label="Subscribe">
              Subscribe
            </button>
          </form>
          <ul className="footer-social-icons" aria-label="Follow us on social media">
            <li>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://www.twitter.com/" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                <FaXTwitter aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="/app/rss" target="_blank" rel="noreferrer" aria-label="RSS feed">
                <FaRss aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
