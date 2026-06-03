'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Moon, Sun } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/bracket', label: 'Bracket' },
  { href: '/teams', label: 'Teams' },
  { href: '/predictor', label: 'AI Predictor' },
];

export function Navbar() {
  const path = usePathname();
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    setDark(d => !d);
    document.documentElement.classList.toggle('light');
  };

  return (
    <nav className={clsx(
      'sticky top-0 z-50 h-[60px] flex items-center justify-between px-6 md:px-8 transition-all',
      scrolled
        ? 'bg-bg/95 backdrop-blur-md border-b border-border2'
        : 'bg-bg border-b border-border'
    )}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-head font-extrabold text-[17px] tracking-tight">
        <span className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-sm">⚽</span>
        <span className="hidden sm:inline">FIFA Predictor</span>
        <span className="text-muted font-normal text-xs ml-1 hidden md:inline">2026</span>
      </Link>

      {/* Links */}
      <div className="flex gap-1">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all',
              path === l.href
                ? 'bg-surface2 text-white'
                : 'text-subtle hover:bg-surface2 hover:text-white'
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-[11px] text-muted bg-surface2 border border-border2 px-2 py-1 rounded-full">
          104 matches
        </span>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg bg-surface2 border border-border2 flex items-center justify-center text-subtle hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </nav>
  );
}
