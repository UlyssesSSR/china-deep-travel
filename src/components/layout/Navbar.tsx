'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { PublicUser } from '@/lib/types';

export function Navbar() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const refetchUser = () => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetchUser();
    const handler = () => refetchUser();
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.dispatchEvent(new Event('auth:changed'));
    setUser(null);
    setDropdownOpen(false);
    router.replace('/');
  };

  const navLinks = [
    { href: '/guides', label: 'Guides' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' }
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? 'shadow-md bg-surface/95 backdrop-blur-sm' : 'bg-surface'
      }`}
    >
      <nav className="max-w-container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl" aria-hidden="true">🏔</span>
          <span className="font-display font-semibold text-secondary text-lg tracking-tight hidden sm:block">
            China Deep Travel
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-btn text-sm font-medium transition-colors duration-150 ${
                pathname.startsWith(link.href)
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-8 skeleton rounded-btn" />
          ) : user ? (
            <>
              {/* Points chip */}
              <Link
                href="/user/points"
                className="hidden sm:flex items-center gap-1.5 bg-gold/10 border border-gold/30 rounded-full px-3 py-1 text-sm font-semibold text-secondary"
              >
                🪙 <span className="text-accent font-bold">{user.currentPoints.toLocaleString()}</span>
                <span className="text-text-muted font-normal">pts</span>
              </Link>

              {/* Avatar + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface rounded-card shadow-lg border border-border py-1 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="font-semibold text-sm text-secondary truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/user/dashboard"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-background transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/user/library"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-background transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Library
                    </Link>
                    <Link
                      href="/user/points"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-background transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Buy Points
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-background transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-secondary transition-colors duration-150"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-btn hover:bg-primary-dark transition-colors duration-150"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 text-text-secondary hover:text-secondary transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-primary bg-primary/5'
                    : 'text-text-secondary hover:text-secondary hover:bg-background'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
