import Link from 'next/link';
import { FileFlow } from '@/components/FileFlow';
import { MockNote } from '@/components/MockBadge';
import { SHIPPED_LANGS, type ShippedLang , DEFAULT_LANG} from '@/lib/i18n/strings';

export const dynamic = 'force-dynamic';

export default async function FilePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const sp = await searchParams;
  const lang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '') ? (sp.lang as ShippedLang) : DEFAULT_LANG;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Make a new complaint</h1>
        <p className="text-muted">
          Speak it. We will ask at most four short questions, show you who it is going to and why, and show you
          the exact words before anything is sent.
        </p>
      </header>

      <FileFlow lang={lang} />

      <section className="space-y-2 border-t border-rule pt-6 text-sm text-muted">
        <p>
          <strong className="text-ink">Where this sits, honestly.</strong> Voice filing in twenty-two languages
          already exists — DARPG shipped Samadhan Didi on 30 May 2026, built on Bhashini. This is here because a
          complete journey needs a front door, not because it is our contribution. Ours starts after a
          department closes your case.{' '}
          <Link href="/how-this-works" className="underline">
            More on what is ours and what is not
          </Link>
          .
        </p>
      </section>

      <MockNote>
        Nothing is sent to any government system. Your complaint is filed into our own simulated CPGRAMS, where
        you can then watch the clock, the reply and the audit behave the way the real thing does.
      </MockNote>
    </div>
  );
}
