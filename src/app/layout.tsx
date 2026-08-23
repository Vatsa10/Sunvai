import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { TextSize } from '@/components/TextSize';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sunvai — सुनवाई',
  description:
    'Your complaint was closed. Was it actually solved? Sunvai reads the department’s reply against what you asked, asks whether your problem was really fixed, and drafts your appeal when it was not.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        {/* No emblem, no ministry logo, no tricolour masthead. This line is on every screen. */}
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
            <Link href="/" className="text-xl font-semibold tracking-tight text-ink no-underline">
              सुनवाई <span className="font-normal text-muted">Sunvai</span>
            </Link>
            <p className="text-sm text-muted">An independent civic tool. Not a government service.</p>
            <div className="ml-auto"><TextSize /></div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>

        <footer className="mt-16 border-t border-rule">
          <nav className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2 px-5 py-6 text-sm text-muted">
            <Link href="/how-this-works" className="underline">How this works · what is mocked</Link>
            <Link href="/numbers" className="underline">The numbers</Link>
            <Link href="/verify" className="underline">Verify a receipt</Link>
            <Link href="/dept" className="underline">Department view (scaffolding)</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
