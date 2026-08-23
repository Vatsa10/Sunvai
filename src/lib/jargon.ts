/**
 * The jargon table.
 *
 * "Disposed" currently reads as good news to a citizen who was never told otherwise. This is
 * the single cheapest usability win in the product: applied automatically to incoming
 * department text, with the original always still visible beside it.
 */

type Entry = { en: string; hi: string; mr: string };

export const JARGON: Record<string, Entry> = {
  'Disposed': {
    en: 'Closed. The department has marked this finished. It does not mean solved.',
    hi: 'बंद कर दिया गया। विभाग ने इसे पूरा मान लिया है। इसका मतलब हल हो गया नहीं है।',
    mr: 'बंद केलं. विभागाने हे पूर्ण मानलं आहे. याचा अर्थ सुटलं असा नाही.',
  },
  'Under Process': {
    en: 'Someone has it. Nothing has been decided yet.',
    hi: 'किसी के पास है। अभी कुछ तय नहीं हुआ।',
    mr: 'कुणाकडे तरी आहे. अजून काहीच ठरलेलं नाही.',
  },
  'Pending': {
    en: 'Nobody has acted on it yet.',
    hi: 'अभी तक किसी ने कुछ नहीं किया।',
    mr: 'अजून कुणीच काही केलेलं नाही.',
  },
  'Closed with remarks': {
    en: 'Closed, with a note explaining why — read the note.',
    hi: 'एक टिप्पणी के साथ बंद किया गया — वह टिप्पणी पढ़िए।',
    mr: 'एका शेऱ्यासह बंद केलं — तो शेरा वाचा.',
  },
  'Appeal under process': {
    en: 'A more senior officer is now looking at how your complaint was handled.',
    hi: 'अब कोई वरिष्ठ अधिकारी देख रहा है कि आपकी शिकायत कैसे निपटाई गई।',
    mr: 'आता वरिष्ठ अधिकारी तुमची तक्रार कशी हाताळली गेली ते पाहत आहेत.',
  },
  'Nodal Officer': {
    en: 'The person responsible for your complaint at that office.',
    hi: 'उस दफ़्तर में आपकी शिकायत के लिए ज़िम्मेदार व्यक्ति।',
    mr: 'त्या कार्यालयात तुमच्या तक्रारीसाठी जबाबदार व्यक्ती.',
  },
  'matter forwarded to concerned department': {
    en: 'They sent it somewhere else and stopped tracking it here.',
    hi: 'उन्होंने इसे कहीं और भेज दिया और यहाँ देखना बंद कर दिया।',
    mr: 'त्यांनी हे दुसरीकडे पाठवलं आणि इथे बघणं थांबवलं.',
  },
  'noted for future action': {
    en: 'They have written it down. Nothing is scheduled.',
    hi: 'उन्होंने लिख लिया है। कुछ तय नहीं हुआ।',
    mr: 'त्यांनी लिहून ठेवलं आहे. काहीच ठरलेलं नाही.',
  },
  'appropriate action is being taken': {
    en: 'They have not said what they are doing.',
    hi: 'उन्होंने यह नहीं बताया कि वे क्या कर रहे हैं।',
    mr: 'ते काय करत आहेत हे त्यांनी सांगितलेलं नाही.',
  },
  'does not pertain to this office': {
    en: 'They say this is not their job.',
    hi: 'वे कह रहे हैं कि यह उनका काम नहीं है।',
    mr: 'हे आमचं काम नाही असं ते म्हणत आहेत.',
  },
  'you may approach the State Government': {
    en: 'They are telling you to start again somewhere else.',
    hi: 'वे कह रहे हैं कि कहीं और से दोबारा शुरू कीजिए।',
    mr: 'दुसरीकडे पुन्हा सुरुवात करा असं ते सांगत आहेत.',
  },
  'Appellate Authority': {
    en: 'The senior officer who reviews complaints that were handled badly.',
    hi: 'वह वरिष्ठ अधिकारी जो ख़राब तरीक़े से निपटाई गई शिकायतें देखता है।',
    mr: 'वाईट पद्धतीने हाताळलेल्या तक्रारी पाहणारे वरिष्ठ अधिकारी.',
  },
  'Registration Number': {
    en: 'Your complaint’s ID number. Keep it — it is how you find your case again.',
    hi: 'आपकी शिकायत का नंबर। इसे सँभालिए — इसी से केस दोबारा मिलेगा।',
    mr: 'तुमच्या तक्रारीचा क्रमांक. जपून ठेवा — यानेच प्रकरण पुन्हा सापडेल.',
  },
};

type Lang = 'en' | 'hi' | 'mr';

export function translateJargon(term: string, lang: string): string {
  const l: Lang = (['en', 'hi', 'mr'] as const).includes(lang as Lang) ? (lang as Lang) : 'hi';
  const hit = JARGON[term] ?? JARGON[Object.keys(JARGON).find((k) => k.toLowerCase() === term.toLowerCase()) ?? ''];
  return hit ? hit[l] : term;
}

/** Phrases worth flagging inside a department reply, longest first so the specific one wins. */
export const REPLY_PHRASES = Object.keys(JARGON)
  .filter((k) => k === k.toLowerCase())
  .sort((a, b) => b.length - a.length);
