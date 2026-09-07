import React from 'react';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  CodeBracketSquareIcon,
  Cog6ToothIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BrandLogo } from './BrandLogo';
import { CartCount } from '../cartPage';

export type BootstrapUser = null | {
  id: number | string;
  username: string;
  email?: string;
  authorities: string[];
};

type SiteHeaderProps = {
  appName: string;
  user: BootstrapUser;
};

type MenuId = 'shop' | 'learn' | 'account' | null;

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type NavLink = {
  href: string;
  label: string;
  icon: IconComponent;
  external?: boolean;
};

const shopLinks: NavLink[] = [
  { href: '/app/products', label: 'All Products', icon: ShoppingBagIcon },
  { href: '/app/products?keywords=First%20Aid', label: 'First Aid', icon: HeartIcon },
  { href: '/app/prescriptions', label: 'Prescriptions', icon: ClipboardDocumentListIcon },
];

const learnLinks: NavLink[] = [
  { href: '/app/services', label: 'Services', icon: BuildingStorefrontIcon },
  { href: '/app/advice', label: 'Advice', icon: BookOpenIcon },
  { href: '/app/assistant', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
  { href: '/app/vulnerabilities', label: 'Vulnerabilities', icon: ShieldExclamationIcon },
  { href: '/swagger-ui', label: 'API Explorer', icon: CodeBracketSquareIcon, external: true },
];

function pathMatches(href: string) {
  const path = window.location.pathname.replace(/\/$/, '') || '/app';
  const target = href.split('?')[0].replace(/\/$/, '');
  if (target === '/app' || target === '/app/') return path === '/app' || path === '';
  return path === target || path.startsWith(`${target}/`);
}

export function SiteHeader({ appName, user }: SiteHeaderProps) {
  const [openMenu, setOpenMenu] = React.useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement | null>(null);
  const accountLabel = user ? user.username : 'My Account';
  const keywords = new URLSearchParams(window.location.search).get('keywords') ?? '';

  React.useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function toggleMenu(id: Exclude<MenuId, null>) {
    setOpenMenu((current) => (current === id ? null : id));
  }

  const accountLinks: NavLink[] = user
    ? [
        { href: '/app/user/home', label: 'Account Home', icon: HomeIcon },
        { href: '/app/user/profile', label: 'Profile', icon: UserCircleIcon },
        { href: '/app/user/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
        { href: '/app/user/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
        ...(user.authorities.includes('ROLE_ADMIN')
          ? [{ href: '/app/admin', label: 'Site Administration', icon: Cog6ToothIcon }]
          : []),
        { href: '/logout', label: 'Logout', icon: ArrowRightOnRectangleIcon },
      ]
    : [
        { href: '/app/login', label: 'Login', icon: ArrowRightOnRectangleIcon },
        { href: '/app/register', label: 'Register', icon: UserPlusIcon },
      ];

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:gap-5 md:px-6">
        <a
          className="brand site-logo shrink-0 no-underline"
          href="/app/"
          aria-label={appName}
        >
          <BrandLogo appName={appName} variant="onLight" />
        </a>

        <form
          className="relative hidden min-w-0 flex-1 md:block"
          action="/app/products"
          method="GET"
          role="search"
        >
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted"
          />
          <input
            aria-label="Search products"
            className="w-full rounded-lg border border-border bg-white py-2.5 pr-3 pl-10 text-[0.95rem] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={keywords}
            name="keywords"
            placeholder="Search medicines and products"
            type="search"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          <a
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[0.85rem] font-bold no-underline transition-colors ${
              pathMatches('/app/') ? 'bg-surface-deep text-brand' : 'text-brand hover:bg-surface-deep'
            }`}
            href="/app/"
          >
            <HomeIcon className="h-4 w-4" aria-hidden="true" />
            Home
          </a>

          <NavDropdown
            id="shop"
            label="Shop"
            open={openMenu === 'shop'}
            onToggle={() => toggleMenu('shop')}
            links={shopLinks}
            icon={ShoppingBagIcon}
            className="nav-menu"
          />
          <NavDropdown
            id="learn"
            label="Learn"
            open={openMenu === 'learn'}
            onToggle={() => toggleMenu('learn')}
            links={learnLinks}
            icon={BookOpenIcon}
            className="nav-menu"
          />
          <NavDropdown
            id="account"
            label={accountLabel}
            open={openMenu === 'account'}
            onToggle={() => toggleMenu('account')}
            links={accountLinks}
            icon={UserCircleIcon}
            className="nav-menu"
          />

          <a
            className="cart-link inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[0.85rem] font-bold text-brand no-underline transition-colors hover:bg-surface-deep"
            href="/app/cart"
          >
            <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
            Cart
            <CartCount />
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <a
            className="relative inline-flex items-center justify-center rounded-md p-2 text-brand no-underline hover:bg-surface-deep"
            href="/app/cart"
            aria-label="Shopping cart"
          >
            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5">
              <CartCount />
            </span>
          </a>
          <button
            type="button"
            className="!min-h-0 rounded-md !bg-transparent !p-2 text-brand hover:!bg-surface-deep"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-surface px-4 py-4 shadow-panel lg:hidden"
        >
          <form className="relative mb-4" action="/app/products" method="GET" role="search">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted"
            />
            <input
              aria-label="Search products"
              className="w-full rounded-lg border border-border bg-white py-2.5 pr-3 pl-10"
              defaultValue={keywords}
              name="keywords"
              placeholder="Search medicines and products"
              type="search"
            />
          </form>

          <div className="grid gap-1">
            <MobileLink href="/app/" label="Home" icon={HomeIcon} />
            <p className="mt-2 mb-1 text-[0.72rem] font-bold tracking-wide text-muted uppercase">Shop</p>
            {shopLinks.map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} icon={link.icon} />
            ))}
            <p className="mt-2 mb-1 text-[0.72rem] font-bold tracking-wide text-muted uppercase">Learn</p>
            {learnLinks.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                external={link.external}
              />
            ))}
            <p className="mt-2 mb-1 text-[0.72rem] font-bold tracking-wide text-muted uppercase">
              {accountLabel}
            </p>
            {accountLinks.map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} icon={link.icon} />
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavDropdown({
  id,
  label,
  open,
  onToggle,
  links,
  icon: Icon,
  className = '',
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  links: NavLink[];
  icon: IconComponent;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`${id}-menu`}
        className={`!min-h-0 inline-flex items-center gap-1.5 rounded-md !bg-transparent px-3 py-2 text-[0.85rem] font-bold !text-brand hover:!bg-surface-deep ${
          open ? '!bg-surface-deep' : ''
        }`}
        onClick={onToggle}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={`${id}-menu`}
          role="menu"
          aria-labelledby={`${id}-trigger`}
          className="absolute right-0 z-50 mt-2 min-w-[13.5rem] origin-top-right rounded-xl border border-border bg-white p-2 shadow-panel"
        >
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <a
                key={link.href}
                role="menuitem"
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[0.9rem] font-semibold text-ink no-underline transition-colors hover:bg-surface-deep hover:text-brand ${
                  pathMatches(link.href) ? 'bg-surface-deep text-brand' : ''
                }`}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
              >
                <LinkIcon className="h-4 w-4 shrink-0 text-brand-muted" aria-hidden="true" />
                {link.label}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
  external,
}: {
  href: string;
  label: string;
  icon: IconComponent;
  external?: boolean;
}) {
  return (
    <a
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[0.95rem] font-semibold text-ink no-underline hover:bg-surface-deep ${
        pathMatches(href) ? 'bg-surface-deep text-brand' : ''
      }`}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <Icon className="h-5 w-5 text-brand-muted" aria-hidden="true" />
      {label}
    </a>
  );
}
