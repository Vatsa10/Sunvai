/**
 * The closure assistant — a conversation that starts where filing ends.
 *
 * DARPG's own Samadhan Didi takes a grievance by voice in 22 languages and files it. Every
 * description of it, including the launch material, calls it a *registration* assistant. Nothing
 * on the portal talks to a citizen after an office marks their case closed, which is the moment
 * this assistant exists for.
 *
 * It files nothing and sends nothing. It reads a closure reply, quotes it back, and hands the
 * citizen to the consent-gated appeal flow that already exists. Everything it says about the
 * reply comes from the same audited auditor the rest of the product uses.
 */

import { DEMO_CASES } from '../../../supabase/seed/demo-cases';
import { SHIPPED_LANGS, DEFAULT_LANG, type ShippedLang } from '@/lib/i18n/strings';
import { ClosureAssistant } from '@/components/ClosureAssistant';

export const dynamic = 'force-dynamic';

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = (SHIPPED_LANGS as readonly string[]).includes(sp.lang ?? '')
    ? (sp.lang as ShippedLang)
    : DEFAULT_LANG;

  const cases = DEMO_CASES.map((c) => ({
    ref: c.ref,
    who: c.citizen.name,
    office: c.office,
    narrative: c.narrative,
    reply: c.reply.body,
    replyLang: c.reply.lang,
    narrativeLang: c.narrativeLang,
    days: Math.round((Date.parse(c.closedAt) - Date.parse(c.filedAt)) / 86_400_000),
  }));

  return <ClosureAssistant lang={lang} cases={cases} />;
}
