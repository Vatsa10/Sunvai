'use client';

/**
 * A scripted conversation, not a free-form chatbot.
 *
 * The steps are fixed and the only model call in the whole flow is the closure audit — the same
 * `auditText` the paste box uses, with the same citation guard. That is deliberate. A free-form
 * bot answering questions about a citizen's own case would be answering from nothing, and the
 * failure mode of a confident wrong answer here is a person not appealing a closure they should
 * have appealed.
 *
 * What the assistant may say is therefore bounded: it reads the reply back, reports the audited
 * verdict with the spans it rests on, asks the citizen the one question that actually counts, and
 * hands off. It never files, never sends, and never states the problem's status on its own.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { auditText } from '@/actions/audit-actions';
import type { ShippedLang } from '@/lib/i18n/strings';
import type { Lang } from '@/lib/adapters/types';

type DemoCase = {
  ref: string;
  who: string;
  office: string;
  narrative: string;
  reply: string;
  replyLang: Lang;
  narrativeLang: Lang;
  days: number;
};

type Turn = { from: 'bot' | 'you'; text: string; quote?: string };

const COPY = {
  en: {
    title: 'The closure assistant',
    sub: 'It starts where filing ends. It does not file anything, and it sends nothing on your behalf.',
    open: 'An office has closed your case. I can read what they wrote back and tell you whether it answers what you asked. Whose case should I read?',
    picked: (c: DemoCase) =>
      `${c.who}, ${c.office}. Closed after ${c.days} days. This is what they wrote back, in full:`,
    asking: 'Reading their reply against what was actually asked…',
    verdictLead:
      'Here is what I found. Every quote below is copied from their reply word for word — if I could not find a quote in their text, I would tell you I was unsure instead.',
    unanswered: 'What they never answered:',
    theQuestion:
      'Now the only question that counts, and the only one that moves our published number: did your problem actually get fixed?',
    yes: 'Yes, it was fixed',
    no: 'No, nothing changed',
    onYes:
      'Then this closure was a real one, and it is recorded as fixed because you said so — not because their reply sounded complete. That is the whole difference.',
    onNo:
      'Then the closure is on the record and the problem is not. You can appeal it. I have not written or sent anything yet — the appeal flow shows you the full text first and only sends it if you agree.',
    goAppeal: 'Take me to the appeal',
    restart: 'Read a different case',
    note:
      'This assistant runs one model call — the closure audit — and nothing it says about the reply is unquoted. It cannot file a grievance. Samadhan Didi, on the national portal, does that in 22 languages.',
    err: 'That did not come back. Nothing was recorded, and nothing was sent.',
  },
  hi: {
    title: 'बंद हुई शिकायत की सहायक',
    sub: 'यह वहाँ से शुरू होती है जहाँ शिकायत दर्ज करना ख़त्म होता है। यह कुछ दर्ज नहीं करती, और आपकी ओर से कुछ नहीं भेजती।',
    open: 'किसी दफ़्तर ने आपकी शिकायत बंद कर दी है। मैं पढ़ सकती हूँ कि उन्होंने क्या जवाब लिखा और बता सकती हूँ कि वह आपके पूछे का जवाब है या नहीं। किसकी शिकायत पढ़ूँ?',
    picked: (c: DemoCase) => `${c.who}, ${c.office}। ${c.days} दिन बाद बंद। उन्होंने पूरा यही लिखा:`,
    asking: 'उनका जवाब उस बात के सामने रखकर पढ़ रही हूँ जो असल में पूछी गई थी…',
    verdictLead:
      'मुझे यह मिला। नीचे हर उद्धरण उनके जवाब से हूबहू लिया गया है — अगर कोई बात उनके लिखे में न मिलती, तो मैं कह देती कि मुझे पक्का नहीं है।',
    unanswered: 'जिनका जवाब उन्होंने कभी नहीं दिया:',
    theQuestion:
      'अब वही एक सवाल जो असल में गिना जाता है, और जो अकेला हमारे छपे आँकड़े को हिलाता है: क्या आपकी समस्या सच में ठीक हुई?',
    yes: 'हाँ, ठीक हो गई',
    no: 'नहीं, कुछ नहीं बदला',
    onYes:
      'तो यह सचमुच का समाधान था, और यह ठीक हुआ इसलिए दर्ज है क्योंकि आपने कहा — इसलिए नहीं कि उनका जवाब पूरा लग रहा था। यही पूरा फ़र्क़ है।',
    onNo:
      'तो बंद होना रिकॉर्ड में है और समस्या नहीं। आप अपील कर सकते हैं। मैंने अभी कुछ लिखा या भेजा नहीं है — अपील वाली जगह पहले आपको पूरा लिखा दिखाती है और आपकी सहमति पर ही भेजती है।',
    goAppeal: 'अपील की ओर ले चलिए',
    restart: 'कोई दूसरी शिकायत पढ़िए',
    note:
      'यह सहायक एक ही मॉडल-कॉल चलाती है — जवाब की जाँच — और जवाब के बारे में इसकी कही कोई बात बिना उद्धरण के नहीं है। यह शिकायत दर्ज नहीं कर सकती। राष्ट्रीय पोर्टल पर समाधान दीदी वह काम 22 भाषाओं में करती है।',
    err: 'यह वापस नहीं आया। कुछ दर्ज नहीं हुआ, और कुछ भेजा नहीं गया।',
  },
  mr: {
    title: 'बंद झालेल्या तक्रारीची सहायक',
    sub: 'ही तिथून सुरू होते जिथे तक्रार दाखल करणं संपतं. ही काहीही दाखल करत नाही, आणि तुमच्या वतीने काहीही पाठवत नाही.',
    open: 'एका कार्यालयाने तुमची तक्रार बंद केली आहे. त्यांनी काय उत्तर लिहिलं ते मी वाचू शकते आणि ते तुमच्या प्रश्नाचं उत्तर आहे का हे सांगू शकते. कोणाची तक्रार वाचू?',
    picked: (c: DemoCase) => `${c.who}, ${c.office}. ${c.days} दिवसांनी बंद. त्यांनी पूर्ण हेच लिहिलं:`,
    asking: 'त्यांचं उत्तर जे खरंच विचारलं होतं त्यासमोर ठेवून वाचते आहे…',
    verdictLead:
      'मला हे सापडलं. खालचं प्रत्येक अवतरण त्यांच्या उत्तरातून जसंच्या तसं घेतलं आहे — एखादं वाक्य त्यांच्या मजकुरात सापडलं नसतं, तर मी खात्री नाही असंच सांगितलं असतं.',
    unanswered: 'ज्यांचं उत्तर त्यांनी कधीच दिलं नाही:',
    theQuestion:
      'आता तोच एक प्रश्न जो खरंच मोजला जातो, आणि जो एकटा आमचा प्रसिद्ध आकडा हलवतो: तुमची अडचण खरंच दूर झाली का?',
    yes: 'हो, दूर झाली',
    no: 'नाही, काहीच बदललं नाही',
    onYes:
      'मग हा खरा निपटारा होता, आणि तो झाला म्हणून नोंदला आहे कारण तुम्ही सांगितलं — त्यांचं उत्तर पूर्ण वाटलं म्हणून नाही. हाच संपूर्ण फरक आहे.',
    onNo:
      'मग बंद होणं नोंदीत आहे आणि अडचण नाही. तुम्ही अपील करू शकता. मी अजून काहीही लिहिलेलं किंवा पाठवलेलं नाही — अपिलाची जागा आधी तुम्हाला पूर्ण मजकूर दाखवते आणि तुमच्या संमतीनेच पाठवते.',
    goAppeal: 'अपिलाकडे न्या',
    restart: 'दुसरी तक्रार वाचा',
    note:
      'ही सहायक एकच मॉडेल-कॉल चालवते — उत्तराची तपासणी — आणि उत्तराबद्दल तिचं कोणतंही म्हणणं अवतरणाशिवाय नाही. ही तक्रार दाखल करू शकत नाही. राष्ट्रीय पोर्टलवर समाधान दीदी ते काम 22 भाषांमध्ये करते.',
    err: 'हे परत आलं नाही. काहीही नोंदलं गेलं नाही, आणि काहीही पाठवलं गेलं नाही.',
  },
} as const;

const VERDICT_WORD: Record<string, Record<ShippedLang, string>> = {
  deflected: {
    en: 'Passed on, not answered',
    hi: 'आगे बढ़ा दिया, जवाब नहीं दिया',
    mr: 'पुढे ढकललं, उत्तर दिलं नाही',
  },
  transferred_lawfully: {
    en: 'Lawfully transferred',
    hi: 'नियम से दूसरे दफ़्तर भेजी',
    mr: 'नियमाने दुसऱ्या कार्यालयाकडे',
  },
  boilerplate: { en: 'A standard paragraph', hi: 'बना-बनाया जवाब', mr: 'ठरलेला मजकूर' },
  resolved: { en: 'Actually answered', hi: 'सच में जवाब दिया', mr: 'खरंच उत्तर दिलं' },
  undetermined: { en: 'We are not sure', hi: 'हमें पक्का नहीं', mr: 'आम्हाला खात्री नाही' },
};

export function ClosureAssistant({ lang, cases }: { lang: ShippedLang; cases: DemoCase[] }) {
  const t = COPY[lang];
  const [turns, setTurns] = useState<Turn[]>([{ from: 'bot', text: t.open }]);
  const [picked, setPicked] = useState<DemoCase | null>(null);
  const [stage, setStage] = useState<'pick' | 'reading' | 'verdict' | 'answered'>('pick');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const say = (turn: Turn) => setTurns((prev) => [...prev, turn]);

  async function pick(c: DemoCase) {
    if (busy) return;
    setBusy(true);
    setPicked(c);
    setStage('reading');
    say({ from: 'you', text: c.who });
    say({ from: 'bot', text: t.picked(c), quote: c.reply });
    say({ from: 'bot', text: t.asking });

    try {
      const out = await auditText({
        complaint: c.narrative,
        reply: c.reply,
        lang: c.narrativeLang,
        replyLang: c.replyLang,
      });
      if (!out.ok) {
        say({ from: 'bot', text: t.err });
        setStage('pick');
        return;
      }
      const word = VERDICT_WORD[out.result.verdict]?.[lang] ?? out.result.verdict;
      say({ from: 'bot', text: `${word}. ${t.verdictLead}` });
      for (const cite of out.result.citations) say({ from: 'bot', text: '', quote: cite.quote });
      if (out.result.unaddressed.length > 0) {
        say({ from: 'bot', text: `${t.unanswered}\n• ${out.result.unaddressed.join('\n• ')}` });
      }
      say({ from: 'bot', text: t.theQuestion });
      setStage('verdict');
    } catch {
      say({ from: 'bot', text: t.err });
      setStage('pick');
    } finally {
      setBusy(false);
    }
  }

  function answer(fixed: boolean) {
    say({ from: 'you', text: fixed ? t.yes : t.no });
    say({ from: 'bot', text: fixed ? t.onYes : t.onNo });
    setStage('answered');
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-[18px] leading-relaxed">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-neutral-700">{t.sub}</p>

      <div className="mt-6 space-y-4" aria-live="polite">
        {turns.map((turn, i) => (
          <div key={i} className={turn.from === 'you' ? 'text-right' : ''}>
            {turn.text && (
              <p
                className={
                  turn.from === 'you'
                    ? 'inline-block rounded-lg bg-neutral-900 px-4 py-3 text-left text-white whitespace-pre-line'
                    : 'whitespace-pre-line'
                }
              >
                {turn.text}
              </p>
            )}
            {turn.quote && (
              <blockquote className="mt-2 border-l-4 border-neutral-900 bg-neutral-100 px-4 py-3">
                “{turn.quote}”
              </blockquote>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {stage === 'pick' &&
          cases.map((c) => (
            <button
              key={c.ref}
              onClick={() => pick(c)}
              disabled={busy}
              className="min-h-[48px] rounded-lg border-2 border-neutral-900 px-4 py-3 font-medium disabled:opacity-50"
            >
              {c.who} — {c.office}
            </button>
          ))}

        {stage === 'verdict' && (
          <>
            <button
              onClick={() => answer(true)}
              className="min-h-[48px] rounded-lg border-2 border-neutral-900 px-4 py-3 font-medium"
            >
              {t.yes}
            </button>
            <button
              onClick={() => answer(false)}
              className="min-h-[48px] rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white"
            >
              {t.no}
            </button>
          </>
        )}

        {stage === 'answered' && picked && (
          <>
            <Link
              href={`/case/${encodeURIComponent(picked.ref)}?lang=${lang}`}
              className="min-h-[48px] rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white"
            >
              {t.goAppeal}
            </Link>
            <button
              onClick={() => {
                setTurns([{ from: 'bot', text: t.open }]);
                setPicked(null);
                setStage('pick');
              }}
              className="min-h-[48px] rounded-lg border-2 border-neutral-900 px-4 py-3 font-medium"
            >
              {t.restart}
            </button>
          </>
        )}
      </div>

      <p className="mt-10 border-t pt-4 text-[16px] text-neutral-700">{t.note}</p>
    </main>
  );
}
