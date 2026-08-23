/**
 * Three languages shipped properly: Hindi, English, Marathi. Not six half-done, and not the
 * twenty-two CPGRAMS supports — in production this runs on Bhashini rather than duplicating
 * it. The gap is disclosed on /how-this-works rather than hidden behind a language picker
 * that silently degrades.
 *
 * Marathi shares its script with Hindi, which is deliberate: it tests that we handle two
 * languages in one script rather than assuming script equals language.
 */

export const SHIPPED_LANGS = ['hi', 'en', 'mr'] as const;
export type ShippedLang = (typeof SHIPPED_LANGS)[number];

export const LANG_NAMES: Record<ShippedLang, string> = {
  hi: 'हिन्दी',
  en: 'English',
  mr: 'मराठी',
};

type Dict = {
  tagline: string;
  doorA: string;
  doorASub: string;
  doorB: string;
  doorBSub: string;
  tryOne: string;
  demoData: string;
  howItWorks: string;
  independent: string;
  refLabel: string;
  refPlaceholder: string;
  open: string;
  notFound: string;
  theyWrote: string;
  weRead: string;
  daysLeft: (n: number) => string;
  daysOver: (n: number) => string;
  closedOn: string;
  filedOn: string;
  seeHow: string;
  didItWork: string;
  didItWorkSub: string;
  yes: string;
  no: string;
  readAloud: string;
  appealReady: string;
  numbers: string;
  verifyReceipt: string;
  downloadReceipt: string;
};

const en: Dict = {
  tagline: 'Your complaint was closed. Was it actually solved? We check.',
  doorA: 'Check a complaint I already filed',
  doorASub: 'Paste your registration number. We read what they wrote back.',
  doorB: 'Make a new complaint',
  doorBSub: 'Speak it in your own language. We write it up and show you before sending.',
  tryOne: 'Or open one of these:',
  demoData: 'DEMO DATA',
  howItWorks: 'How this works · what is real and what is mocked',
  independent: 'An independent civic tool. Not a government service.',
  refLabel: 'Registration number',
  refPlaceholder: 'DEMO/2026/0000472',
  open: 'Open',
  notFound: 'We could not find that number. Check it, or open one of the examples below.',
  theyWrote: 'This is what they wrote',
  weRead: 'We read it against what you asked for',
  daysLeft: (n) => `${n} days left for them to reply`,
  daysOver: (n) => `${n} days past the date they were supposed to reply`,
  closedOn: 'Closed on',
  filedOn: 'Filed on',
  seeHow: 'See how we judged this',
  didItWork: 'Did your problem actually get fixed?',
  didItWorkSub: 'Not "rate your satisfaction". We mean the thing you complained about.',
  yes: 'Yes, it is sorted',
  no: 'No, nothing changed',
  readAloud: 'Read this aloud',
  appealReady: 'Your appeal is already written',
  numbers: 'The numbers',
  verifyReceipt: 'Verify a receipt',
  downloadReceipt: 'Download your receipt',
};

const hi: Dict = {
  tagline: 'आपकी शिकायत बंद कर दी गई। क्या वह सच में हल हुई? हम जाँचते हैं।',
  doorA: 'पहले से दर्ज शिकायत देखें',
  doorASub: 'अपना पंजीकरण नंबर डालिए। उन्होंने जो जवाब लिखा, हम उसे पढ़ते हैं।',
  doorB: 'नई शिकायत दर्ज करें',
  doorBSub: 'अपनी भाषा में बोलिए। हम लिखकर आपको दिखाएँगे, तभी भेजेंगे।',
  tryOne: 'या इनमें से कोई खोलिए:',
  demoData: 'नमूना डेटा',
  howItWorks: 'यह कैसे काम करता है · क्या असली है और क्या नमूना',
  independent: 'यह एक स्वतंत्र नागरिक सेवा है। सरकारी सेवा नहीं।',
  refLabel: 'पंजीकरण नंबर',
  refPlaceholder: 'DEMO/2026/0000472',
  open: 'खोलिए',
  notFound: 'यह नंबर नहीं मिला। जाँच लीजिए, या नीचे दिए उदाहरण खोलिए।',
  theyWrote: 'उन्होंने यह लिखा',
  weRead: 'आपने जो माँगा था, उसके सामने हमने इसे पढ़ा',
  daysLeft: (n) => `जवाब देने के लिए ${n} दिन बचे हैं`,
  daysOver: (n) => `जवाब की तारीख को ${n} दिन बीत चुके हैं`,
  closedOn: 'बंद किया गया',
  filedOn: 'दर्ज किया गया',
  seeHow: 'हमने कैसे जाँचा, देखिए',
  didItWork: 'क्या आपकी समस्या सच में ठीक हुई?',
  didItWorkSub: '"संतुष्टि" नहीं पूछ रहे। जिस बात की शिकायत की थी, वही पूछ रहे हैं।',
  yes: 'हाँ, ठीक हो गया',
  no: 'नहीं, कुछ नहीं बदला',
  readAloud: 'सुनिए',
  appealReady: 'आपकी अपील पहले से लिखी है',
  numbers: 'आँकड़े',
  verifyReceipt: 'रसीद जाँचिए',
  downloadReceipt: 'अपनी रसीद डाउनलोड कीजिए',
};

const mr: Dict = {
  tagline: 'तुमची तक्रार बंद केली गेली. ती खरंच सुटली का? आम्ही तपासतो.',
  doorA: 'आधी दाखल केलेली तक्रार पाहा',
  doorASub: 'तुमचा नोंदणी क्रमांक टाका. त्यांनी काय उत्तर दिलं ते आम्ही वाचतो.',
  doorB: 'नवीन तक्रार करा',
  doorBSub: 'तुमच्या भाषेत बोला. आम्ही लिहून तुम्हाला दाखवू, मगच पाठवू.',
  tryOne: 'किंवा यापैकी एक उघडा:',
  demoData: 'नमुना माहिती',
  howItWorks: 'हे कसं चालतं · काय खरं आहे आणि काय नमुना',
  independent: 'ही स्वतंत्र नागरी सेवा आहे. सरकारी सेवा नाही.',
  refLabel: 'नोंदणी क्रमांक',
  refPlaceholder: 'DEMO/2026/0000631',
  open: 'उघडा',
  notFound: 'हा क्रमांक सापडला नाही. तपासा, किंवा खालचं उदाहरण उघडा.',
  theyWrote: 'त्यांनी हे लिहिलं',
  weRead: 'तुम्ही जे मागितलं होतं, त्यासमोर आम्ही हे वाचलं',
  daysLeft: (n) => `उत्तर देण्यासाठी ${n} दिवस उरले`,
  daysOver: (n) => `उत्तराची तारीख उलटून ${n} दिवस झाले`,
  closedOn: 'बंद केलं',
  filedOn: 'दाखल केलं',
  seeHow: 'आम्ही कसं ठरवलं ते पाहा',
  didItWork: 'तुमची अडचण खरंच दूर झाली का?',
  didItWorkSub: '"समाधान" विचारत नाही. ज्याची तक्रार केली, तेच विचारतो.',
  yes: 'हो, झालं',
  no: 'नाही, काहीच बदललं नाही',
  readAloud: 'ऐका',
  appealReady: 'तुमचं अपील आधीच लिहिलंय',
  numbers: 'आकडे',
  verifyReceipt: 'पावती तपासा',
  downloadReceipt: 'तुमची पावती उतरवा',
};

const DICTS: Record<ShippedLang, Dict> = { en, hi, mr };

export function t(lang: string): Dict {
  return DICTS[(SHIPPED_LANGS as readonly string[]).includes(lang) ? (lang as ShippedLang) : 'hi'];
}

export function isShipped(lang: string): lang is ShippedLang {
  return (SHIPPED_LANGS as readonly string[]).includes(lang);
}
