/**
 * The guided tour, as data.
 *
 * A reviewer opening this site has no registration number, no context, and — on the day the
 * submissions are read — no patience. The tour exists so the whole argument can be walked
 * without knowing where anything is: it points at one thing at a time, says why that thing is
 * there, and moves. It crosses pages, because the argument does.
 *
 * Steps are declarative on purpose. A step names the route it lives on and the element it
 * points at, so adding one is a data change and no positioning code moves. Every target is
 * marked with `data-tour` in the page rather than a class or a nth-child, so restyling a
 * section cannot silently unhook the tour from it.
 *
 * If a target is missing — a case with no appeal yet, a section that renders only in some
 * states — the tour says so and offers the next step rather than pointing at nothing.
 */

import type { ShippedLang } from './i18n/strings';

/** Kamla's case. The tour walks one concrete case rather than describing cases in general. */
export const TOUR_REF = 'DEMO/2026/0000472';

export type TourStep = {
  /** Where this step lives. The tour navigates when the next step is on another route. */
  route: (lang: ShippedLang) => string;
  /** The element to point at, marked with data-tour in the page. */
  target: string;
  title: Record<ShippedLang, string>;
  body: Record<ShippedLang, string>;
};

const caseRoute = (lang: ShippedLang) => `/case/${encodeURIComponent(TOUR_REF)}?lang=${lang}`;

export const TOUR_STEPS: TourStep[] = [
  {
    route: (lang) => `/?lang=${lang}`,
    target: 'problem',
    title: {
      en: 'Start with who is hurt',
      hi: 'पहले यह कि नुक़सान किसका है',
      mr: 'आधी हे की नुकसान कोणाचं आहe',
    },
    body: {
      en: 'Closing a case and fixing a problem are different things, and only one of them is counted today. That gap is the entire reason this exists.',
      hi: 'शिकायत बंद करना और समस्या ठीक करना अलग बातें हैं, और आज गिनी सिर्फ़ एक जाती है। यही फ़ासला इस पूरी चीज़ की वजह है।',
      mr: 'तक्रार बंद करणं आणि अडचण दूर करणं या वेगळ्या गोष्टी आहेत, आणि आज मोजली जाते फक्त एकच. हीच तफावत या सगळ्याचं कारण आहे.',
    },
  },
  {
    route: (lang) => `/?lang=${lang}`,
    target: 'cases',
    title: {
      en: 'No login, no reference number',
      hi: 'न लॉगिन, न कोई नंबर',
      mr: 'ना लॉगिन, ना कोणता क्रमांक',
    },
    body: {
      en: 'Three real closures you can open right now. We will follow the first one — a pension that never arrived — all the way through.',
      hi: 'तीन बंद हुई शिकायतें, अभी खोल सकते हैं। हम पहली के साथ चलेंगे — वह पेंशन जो कभी नहीं आई।',
      mr: 'तीन बंद झालेल्या तक्रारी, आत्ता उघडता येतील. आपण पहिलीसोबत जाऊ — जी पेन्शन कधीच आली नाही.',
    },
  },
  {
    route: caseRoute,
    target: 'reply',
    title: {
      en: 'What the office actually wrote',
      hi: 'दफ़्तर ने असल में क्या लिखा',
      mr: 'कार्यालयाने खरंच काय लिहिलं',
    },
    body: {
      en: 'Their reply, in full and unedited, before we say a word about it. Nineteen days for two sentences that name no date and no amount.',
      hi: 'उनका जवाब, पूरा और बिना बदले, इससे पहले कि हम उस पर कुछ कहें। उन्नीस दिन, और दो वाक्य जिनमें न कोई तारीख़ है न रक़म।',
      mr: 'त्यांचं उत्तर, पूर्ण आणि न बदललेलं, आम्ही त्यावर काही बोलण्याआधी. एकोणीस दिवस, आणि दोन वाक्यं ज्यात ना तारीख आहे ना रक्कम.',
    },
  },
  {
    route: caseRoute,
    target: 'audit',
    title: {
      en: 'The verdict, and what it rests on',
      hi: 'फ़ैसला, और वह किस पर टिका है',
      mr: 'निकाल, आणि तो कशावर उभा आहे',
    },
    body: {
      en: 'Every claim here is anchored to a quote copied from their reply character for character. If a quote cannot be found in their text, we say we are unsure instead of guessing.',
      hi: 'यहाँ हर बात उनके जवाब से हूबहू लिए गए उद्धरण पर टिकी है। अगर कोई उद्धरण उनके लिखे में न मिले, तो हम अंदाज़ा लगाने के बजाय कहते हैं कि हमें पक्का नहीं।',
      mr: 'इथली प्रत्येक गोष्ट त्यांच्या उत्तरातून जसंच्या तसं घेतलेल्या अवतरणावर उभी आहे. एखादं अवतरण त्यांच्या मजकुरात सापडलं नाही, तर आम्ही अंदाज न बांधता खात्री नाही असं सांगतो.',
    },
  },
  {
    route: caseRoute,
    target: 'confirm',
    title: {
      en: 'The only answer that counts',
      hi: 'अकेला जवाब जो गिना जाता है',
      mr: 'एकमेव उत्तर जे मोजलं जातं',
    },
    body: {
      en: 'Our published resolution rate is built from this answer alone — never from the verdict above it. A department can write a flawless reply and still score zero here.',
      hi: 'हमारा छपा हुआ समाधान-दर सिर्फ़ इसी जवाब से बनता है — ऊपर वाले फ़ैसले से कभी नहीं। कोई दफ़्तर बेहतरीन जवाब लिखकर भी यहाँ शून्य पा सकता है।',
      mr: 'आमचा प्रसिद्ध निपटारा-दर फक्त याच उत्तरातून बनतो — वरच्या निकालातून कधीच नाही. एखादं कार्यालय निर्दोष उत्तर लिहूनही इथे शून्य मिळवू शकतं.',
    },
  },
  {
    route: (lang) => `/numbers?lang=${lang}`,
    target: 'rates',
    title: {
      en: 'Two numbers, side by side',
      hi: 'दो आँकड़े, आमने-सामने',
      mr: 'दोन आकडे, समोरासमोर',
    },
    body: {
      en: 'The disposal rate, and the rate citizens themselves confirmed. Below them we publish how often our own auditor is wrong, measured on replies labelled before the prompt was written.',
      hi: 'बंद करने की दर, और वह दर जो नागरिकों ने खुद पक्की की। उनके नीचे हम यह भी छापते हैं कि हमारी अपनी जाँच कितनी बार ग़लत होती है।',
      mr: 'बंद करण्याचा दर, आणि नागरिकांनी स्वतः पक्का केलेला दर. त्यांच्याखाली आम्ही हेही छापतो की आमची स्वतःची तपासणी किती वेळा चुकते.',
    },
  },
];

export const TOUR_UI = {
  en: {
    start: 'Take the guided tour',
    startHint: 'Six steps, about a minute. It walks one real closure end to end.',
    next: 'Next',
    back: 'Back',
    done: 'Finish',
    exit: 'Close tour',
    step: (i: number, n: number) => `Step ${i} of ${n}`,
    missing: 'This part of the page is not showing for this case. Skipping to the next step.',
    finished: 'That is the whole loop. Everything you saw is synthetic demo data, labelled as such.',
  },
  hi: {
    start: 'साथ चलकर दिखाइए',
    startHint: 'छह क़दम, लगभग एक मिनट। एक सच्ची बंद शिकायत को शुरू से आख़िर तक चलकर दिखाता है।',
    next: 'आगे',
    back: 'पीछे',
    done: 'ख़त्म',
    exit: 'बंद कीजिए',
    step: (i: number, n: number) => `${n} में से ${i}वाँ क़दम`,
    missing: 'इस शिकायत के लिए पन्ने का यह हिस्सा नहीं दिख रहा। अगले क़दम पर जा रहे हैं।',
    finished: 'यही पूरा चक्र है। जो कुछ आपने देखा वह नकली demo आँकड़े हैं, और वैसा ही लिखा है।',
  },
  mr: {
    start: 'सोबत चालून दाखवा',
    startHint: 'सहा पावलं, साधारण एक मिनिट. एक खरी बंद तक्रार सुरुवातीपासून शेवटपर्यंत चालून दाखवते.',
    next: 'पुढे',
    back: 'मागे',
    done: 'संपलं',
    exit: 'बंद करा',
    step: (i: number, n: number) => `${n} पैकी ${i}वं पाऊल`,
    missing: 'या तक्रारीसाठी पानाचा हा भाग दिसत नाही. पुढच्या पावलाकडे जात आहोत.',
    finished: 'हेच संपूर्ण चक्र. तुम्ही जे पाहिलं ते सगळं बनावट demo आकडे आहेत, आणि तसंच लिहिलं आहे.',
  },
} as const;
