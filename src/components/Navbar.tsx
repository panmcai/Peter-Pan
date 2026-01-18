'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: '首页', path: '/' },
  { name: '关于我', path: '/about' },
  { name: '博客', path: '/blog' },
  { name: '工具', path: '/tools' },
  { name: '联系', path: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Peter<span className="text-blue-600 dark:text-blue-400">.Pan</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${pathname === item.path
                      ? 'bg-zinc-100 text-blue-600 dark:bg-zinc-900 dark:text-blue-400'
                      : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
