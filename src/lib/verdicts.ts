/**
 * How a verdict is said to a citizen. Colour is never the only carrier of meaning — every
 * verdict has an icon and a word as well, because a citizen with low vision or a bad screen
 * in sunlight still has to be able to tell "answered" from "not answered".
 */

export type VerdictKey =
  | 'resolved'
  | 'partial'
  | 'deflected'
  | 'transferred_lawfully'
  | 'boilerplate'
  | 'non_responsive'
  | 'undetermined';

type Copy = { icon: string; label: string; headline: string; tone: 'good' | 'warn' | 'bad' | 'muted' };

const COPY: Record<VerdictKey, Record<'en' | 'hi' | 'mr', Copy>> = {
  resolved: {
    en: { icon: '✔', label: 'Answered', headline: 'They answered what you asked.', tone: 'good' },
    hi: { icon: '✔', label: 'जवाब दिया', headline: 'आपने जो पूछा, उसका जवाब दिया गया है।', tone: 'good' },
    mr: { icon: '✔', label: 'उत्तर दिलं', headline: 'तुम्ही जे विचारलं, त्याचं उत्तर दिलं आहे.', tone: 'good' },
  },
  partial: {
    en: { icon: '◑', label: 'Half answered', headline: 'They answered part of it, and left the rest out.', tone: 'warn' },
    hi: { icon: '◑', label: 'आधा जवाब', headline: 'कुछ बातों का जवाब दिया, बाकी छोड़ दिया।', tone: 'warn' },
    mr: { icon: '◑', label: 'अर्धं उत्तर', headline: 'काही गोष्टींचं उत्तर दिलं, बाकी सोडून दिलं.', tone: 'warn' },
  },
  deflected: {
    en: { icon: '✖', label: 'Passed on', headline: 'That is not an answer. They moved your file and closed it here.', tone: 'bad' },
    hi: { icon: '✖', label: 'आगे बढ़ा दिया', headline: 'यह जवाब नहीं है। फ़ाइल कहीं और भेजकर यहाँ बंद कर दी।', tone: 'bad' },
    mr: { icon: '✖', label: 'पुढे ढकललं', headline: 'हे उत्तर नाही. फाइल दुसरीकडे पाठवून इथे बंद केली.', tone: 'bad' },
  },
  // Not a negative verdict. A mandated transfer — a State subject, a sub judice matter, an
  // RTI request, a service matter — is correct procedure, and saying otherwise would be a
  // false accusation. Styled `muted`, never like `deflected`.
  transferred_lawfully: {
    en: { icon: '→', label: 'Sent to the right office', headline: 'This one really does belong to another office — and they told you which.', tone: 'muted' },
    hi: { icon: '→', label: 'सही दफ्तर भेजा', headline: 'यह मामला सचमुच दूसरे दफ्तर का है — और उन्होंने बताया कि किसका।', tone: 'muted' },
    mr: { icon: '→', label: 'योग्य कार्यालयाकडे पाठवलं', headline: 'हे प्रकरण खरोखर दुसऱ्या कार्यालयाचं आहे — आणि त्यांनी कोणत्या ते सांगितलं आहे.', tone: 'muted' },
  },
  boilerplate: {
    en: { icon: '✖', label: 'Standard text', headline: 'That is a standard sentence. It says nothing about your case.', tone: 'bad' },
    hi: { icon: '✖', label: 'बना-बनाया जवाब', headline: 'यह बना-बनाया वाक्य है। आपके मामले के बारे में कुछ नहीं कहता।', tone: 'bad' },
    mr: { icon: '✖', label: 'ठराविक मजकूर', headline: 'हे ठराविक वाक्य आहे. तुमच्या प्रकरणाबद्दल काहीच सांगत नाही.', tone: 'bad' },
  },
  non_responsive: {
    en: { icon: '✖', label: 'Answers something else', headline: 'They answered a different question from the one you asked.', tone: 'bad' },
    hi: { icon: '✖', label: 'दूसरी बात का जवाब', headline: 'आपने जो पूछा वह नहीं, कुछ और बताया गया है।', tone: 'bad' },
    mr: { icon: '✖', label: 'दुसऱ्याच गोष्टीचं उत्तर', headline: 'तुम्ही विचारलं ते नाही, भलतंच सांगितलं आहे.', tone: 'bad' },
  },
  undetermined: {
    en: { icon: '?', label: 'We are not sure', headline: 'We are not confident about this one. Read it yourself below.', tone: 'muted' },
    hi: { icon: '?', label: 'हम पक्का नहीं कह सकते', headline: 'इस पर हमें भरोसा नहीं। नीचे खुद पढ़िए।', tone: 'muted' },
    mr: { icon: '?', label: 'आम्हाला खात्री नाही', headline: 'याबद्दल आम्हाला खात्री नाही. खाली स्वतः वाचा.', tone: 'muted' },
  },
};

const TONE_CLASS: Record<Copy['tone'], string> = {
  good: 'border-good text-good',
  warn: 'border-warn text-warn',
  bad: 'border-bad text-bad',
  muted: 'border-rule text-muted',
};

export function verdictCopy(verdict: string, lang: string) {
  const key = (verdict in COPY ? verdict : 'undetermined') as VerdictKey;
  const l = (['en', 'hi', 'mr'].includes(lang) ? lang : 'hi') as 'en' | 'hi' | 'mr';
  const copy = COPY[key][l];
  return { ...copy, className: TONE_CLASS[copy.tone], isNegative: copy.tone === 'bad' || copy.tone === 'warn' };
}
