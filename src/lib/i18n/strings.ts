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

  // The case page. Every string on the screen that matters.
  simulatedCase: string;
  filedOnBehalf: (name: string, relation: string) => string;
  whereThisStands: string;
  theirWordFor: string;
  whatThatMeans: string;
  clock: string;
  closedAfter: (n: number) => string;
  markedText: string;
  readTheirReply: string;
  whatTheyDidNotAnswer: string;
  listenToThis: string;
  howWeJudgedBody: (name: string) => string;
  quotedFromReply: string;
  checkedLine: (verified: boolean, pct: number, model: string, prompt: string) => string;
  notTheScore: string;
  numbersLink: string;
  youSaid: string;
  disagreement: (verdict: string) => string;
  numbersPageLink: string;
  changeMyAnswer: string;
  appealIntro: string;
  writeMyAppeal: string;
  appealDaysLeft: (n: number) => string;
  grounds: string;
  consentTitle: string;
  sentEnglish: string;
  sentYourLang: string;
  hearWhatWillBeSent: string;
  consentBox: string;
  sendMyAppeal: string;
  recordedHeading: string;
  recordedBody: string;
  windowClosedHeading: string;
  windowClosedBody: (closedOn: string, daysAgo: number) => string;
  whatToDoNext: string;
  notOnlyOne: string;
  clusterLine: (others: number, unresolved: number) => string;
  clusterSee: string;
  mockNote: string;
  events: Record<string, string>;
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

  simulatedCase: 'Simulated case',
  filedOnBehalf: (name, relation) =>
    `Filed on ${name}’s behalf — ${relation}. Her consent is recorded in the ledger.`,
  whereThisStands: 'Where this stands',
  theirWordFor: 'Their word for it:',
  whatThatMeans: 'What that means:',
  clock: 'Clock:',
  closedAfter: (n) => `${n} days after it was filed`,
  markedText: 'Marked text is what our audit quoted — copied out of their reply, word for word.',
  readTheirReply: 'Read their reply aloud',
  whatTheyDidNotAnswer: 'What they did not answer',
  listenToThis: 'Listen to this',
  howWeJudgedBody: (name) =>
    `We compared their reply against what ${name} actually asked for, in the language each was written in. We are only allowed to claim something if we can quote it.`,
  quotedFromReply: 'Quoted from their reply',
  checkedLine: (verified, pct, model, prompt) =>
    `Every quote above was checked, character by character, against their reply before this verdict was shown to anyone. Checked: ${verified ? 'yes' : 'no'} · confidence ${pct}% · model ${model} · prompt ${prompt}`,
  notTheScore: 'This verdict is not the score. What counts is your answer to the question below.',
  numbersLink: 'We publish how often we get this wrong',
  youSaid: 'You said:',
  disagreement: (verdict) =>
    `Our audit said “${verdict}” and you say otherwise. Your answer is what counts, and this disagreement is counted as our error on`,
  numbersPageLink: 'the numbers page',
  changeMyAnswer: 'Change my answer',
  appealIntro:
    'In the government system, this door only opens if you rate the closure “Poor” — a question most people are never asked. We write the appeal for you first, and you decide whether it goes.',
  writeMyAppeal: 'Write my appeal',
  appealDaysLeft: (n) =>
    n === 0
      ? 'Today is the last day of the 30-day appeal window on this closure.'
      : `${n} days left of the 30-day appeal window on this closure.`,
  grounds: 'Grounds',
  consentTitle: 'This is exactly what we will send. Nothing else.',
  sentEnglish: 'What is sent (English)',
  sentYourLang: 'The same thing, in your language',
  hearWhatWillBeSent: 'Hear what will be sent',
  consentBox: 'I have read this and I want it sent.',
  sendMyAppeal: 'Send my appeal',
  recordedHeading: 'Recorded here. Not sent anywhere.',
  recordedBody:
    'Your appeal is saved on this page and in your receipt. It did not reach any government office — this tool has no connection to one. No clock has started and nobody there has to reply. Take this text to the office named under “What to do next”, and carry your receipt with you.',
  windowClosedHeading: 'The 30-day appeal window on this closure has passed.',
  windowClosedBody: (closedOn, daysAgo) =>
    `This was closed on ${closedOn}. An appeal against a closure has to go in within 30 days, and that ended ${daysAgo} days ago, so there is no live appeal to offer you. What is still open: the route under “What to do next” below, and filing the problem afresh — a new complaint starts a new clock where an appeal no longer can.`,
  whatToDoNext: 'What to do next',
  notOnlyOne: 'You are not the only one',
  clusterLine: (others, unresolved) =>
    `${others} other people have complained about the same thing at the same office. ${unresolved} of those were closed without the problem being fixed.`,
  clusterSee: 'See the pattern',
  mockNote:
    'This case, this citizen and this department reply are synthetic. The audit above was produced by a real model run against that text, and the ledger entries behind the receipt are real hashes of real events.',
  events: {
    grievance_filed: 'Complaint filed',
    assisted_filing_declared: 'Filed by someone on her behalf, with her consent',
    acknowledged: 'Received by the office',
    assigned: 'Given to an officer',
    reply_received: 'They replied',
    closed: 'They marked it closed',
    audit_completed: 'We read their reply',
    citizen_confirmed_resolved: 'You told us it was fixed',
    citizen_confirmed_unresolved: 'You told us nothing changed',
    confirmation_superseded: 'You changed your answer',
    appeal_drafted: 'We wrote your appeal',
    appeal_consented: 'You agreed to send it',
    appeal_filed: 'Appeal recorded here',
  },
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

  simulatedCase: 'नमूना मामला',
  filedOnBehalf: (name, relation) =>
    `${name} की ओर से दर्ज किया गया — ${relation}। उनकी सहमति बहीखाते में दर्ज है।`,
  whereThisStands: 'मामला अभी कहाँ है',
  theirWordFor: 'उनका शब्द:',
  whatThatMeans: 'इसका मतलब:',
  clock: 'समय:',
  closedAfter: (n) => `दर्ज करने के ${n} दिन बाद`,
  markedText: 'निशान लगा हिस्सा वही है जो हमारी जाँच ने उनके जवाब से हूबहू उद्धृत किया है।',
  readTheirReply: 'उनका जवाब सुनिए',
  whatTheyDidNotAnswer: 'किन बातों का जवाब नहीं दिया',
  listenToThis: 'यह सुनिए',
  howWeJudgedBody: (name) =>
    `${name} ने असल में जो माँगा था, उसके सामने रखकर हमने उनका जवाब पढ़ा — दोनों अपनी-अपनी भाषा में। हम कोई बात तभी कह सकते हैं जब उसे उद्धृत कर सकें।`,
  quotedFromReply: 'उनके जवाब से उद्धृत',
  checkedLine: (verified, pct, model, prompt) =>
    `ऊपर का हर उद्धरण, अक्षर दर अक्षर, उनके जवाब से मिलाया गया — यह नतीजा किसी को दिखाने से पहले। जाँचा गया: ${verified ? 'हाँ' : 'नहीं'} · भरोसा ${pct}% · मॉडल ${model} · प्रॉम्प्ट ${prompt}`,
  notTheScore: 'यह नतीजा आँकड़ा नहीं है। जो गिना जाता है वह नीचे दिए सवाल का आपका जवाब है।',
  numbersLink: 'हम कितनी बार गलत होते हैं, यह हम छापते हैं',
  youSaid: 'आपने कहा:',
  disagreement: (verdict) =>
    `हमारी जाँच ने “${verdict}” कहा और आप कुछ और कह रहे हैं। गिना आपका जवाब जाता है, और यह मतभेद हमारी गलती के रूप में यहाँ दर्ज होता है —`,
  numbersPageLink: 'आँकड़ों के पन्ने पर',
  changeMyAnswer: 'अपना जवाब बदलिए',
  appealIntro:
    'सरकारी व्यवस्था में यह दरवाज़ा तभी खुलता है जब आप बंद करने को “खराब” रेटिंग दें — और यह सवाल ज़्यादातर लोगों से कभी पूछा ही नहीं जाता। हम अपील पहले लिख देते हैं; भेजनी है या नहीं, यह आप तय करते हैं।',
  writeMyAppeal: 'मेरी अपील लिखिए',
  appealDaysLeft: (n) =>
    n === 0
      ? 'इस बंदी के विरुद्ध अपील की तीस दिन की मियाद का आज आखिरी दिन है।'
      : `इस बंदी के विरुद्ध अपील की तीस दिन की मियाद में ${n} दिन बचे हैं।`,
  grounds: 'आधार',
  consentTitle: 'हम बिल्कुल यही भेजेंगे। इसके अलावा कुछ नहीं।',
  sentEnglish: 'जो भेजा जाएगा (अंग्रेज़ी में)',
  sentYourLang: 'वही बात, आपकी भाषा में',
  hearWhatWillBeSent: 'क्या भेजा जाएगा, सुनिए',
  consentBox: 'मैंने यह पढ़ लिया है और मैं चाहता/चाहती हूँ कि यह भेजा जाए।',
  sendMyAppeal: 'मेरी अपील भेजिए',
  recordedHeading: 'यहाँ दर्ज हो गई। कहीं भेजी नहीं गई।',
  recordedBody:
    'आपकी अपील इस पन्ने पर और आपकी रसीद में सुरक्षित है। यह किसी सरकारी दफ्तर तक नहीं पहुँची — इस सेवा का किसी सरकारी व्यवस्था से कोई जुड़ाव नहीं है। कोई समय-सीमा शुरू नहीं हुई और वहाँ किसी को जवाब देना नहीं है। नीचे “आगे क्या कीजिए” में बताए दफ्तर में यही लिखा हुआ ले जाइए, और अपनी रसीद साथ रखिए।',
  windowClosedHeading: 'इस बंदी के विरुद्ध अपील की तीस दिन की मियाद बीत चुकी है।',
  windowClosedBody: (closedOn, daysAgo) =>
    `यह मामला ${closedOn} को बंद किया गया था। बंद करने के विरुद्ध अपील तीस दिन के भीतर देनी होती है, और वह मियाद ${daysAgo} दिन पहले खत्म हो गई — इसलिए यहाँ ऐसा बटन नहीं दिखाया जा रहा जो कहीं नहीं ले जाता। अब भी क्या खुला है: नीचे “आगे क्या कीजिए” में बताया रास्ता, और उसी समस्या पर नई शिकायत दर्ज करना — नई शिकायत से समय फिर से शुरू होता है, अपील से अब नहीं।`,
  whatToDoNext: 'आगे क्या कीजिए',
  notOnlyOne: 'आप अकेले नहीं हैं',
  clusterLine: (others, unresolved) =>
    `इसी दफ्तर में इसी बात की शिकायत ${others} और लोगों ने की है। उनमें से ${unresolved} शिकायतें समस्या हल हुए बिना बंद कर दी गईं।`,
  clusterSee: 'यह सिलसिला देखिए',
  mockNote:
    'यह मामला, यह नागरिक और विभाग का यह जवाब — तीनों नमूना हैं। ऊपर की जाँच उसी लिखे पर असली मॉडल चलाकर की गई है, और रसीद के पीछे की बहीखाता प्रविष्टियाँ असली घटनाओं के असली हैश हैं।',
  events: {
    grievance_filed: 'शिकायत दर्ज हुई',
    assisted_filing_declared: 'किसी और ने उनकी ओर से, उनकी सहमति से दर्ज की',
    acknowledged: 'दफ्तर को मिली',
    assigned: 'अधिकारी को सौंपी गई',
    reply_received: 'उन्होंने जवाब दिया',
    closed: 'उन्होंने बंद कर दी',
    audit_completed: 'हमने उनका जवाब पढ़ा',
    citizen_confirmed_resolved: 'आपने बताया कि ठीक हो गया',
    citizen_confirmed_unresolved: 'आपने बताया कि कुछ नहीं बदला',
    confirmation_superseded: 'आपने अपना जवाब बदला',
    appeal_drafted: 'हमने आपकी अपील लिखी',
    appeal_consented: 'आपने भेजने की सहमति दी',
    appeal_filed: 'अपील यहाँ दर्ज हुई',
  },
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

  simulatedCase: 'नमुना प्रकरण',
  filedOnBehalf: (name, relation) =>
    `${name} यांच्या वतीने दाखल — ${relation}. त्यांची संमती नोंदवहीत नोंदलेली आहे.`,
  whereThisStands: 'हे प्रकरण आत्ता कुठे आहे',
  theirWordFor: 'त्यांचा शब्द:',
  whatThatMeans: 'याचा अर्थ:',
  clock: 'वेळ:',
  closedAfter: (n) => `दाखल केल्यानंतर ${n} दिवसांनी`,
  markedText: 'खूण केलेला मजकूर तोच आहे जो आमच्या तपासणीने त्यांच्या उत्तरातून जसाच्या तसा उद्धृत केला.',
  readTheirReply: 'त्यांचं उत्तर ऐका',
  whatTheyDidNotAnswer: 'कशाचं उत्तर दिलं नाही',
  listenToThis: 'हे ऐका',
  howWeJudgedBody: (name) =>
    `${name} यांनी प्रत्यक्षात काय मागितलं होतं, त्यासमोर ठेवून आम्ही त्यांचं उत्तर वाचलं — दोन्ही ज्या भाषेत लिहिली त्याच भाषेत. उद्धृत करता येत असेल तरच आम्ही काही म्हणू शकतो.`,
  quotedFromReply: 'त्यांच्या उत्तरातून उद्धृत',
  checkedLine: (verified, pct, model, prompt) =>
    `वरचं प्रत्येक अवतरण, अक्षर न् अक्षर, त्यांच्या उत्तराशी पडताळून पाहिलं — हा निकाल कुणालाही दाखवण्याआधी. तपासलं: ${verified ? 'हो' : 'नाही'} · खात्री ${pct}% · मॉडेल ${model} · प्रॉम्प्ट ${prompt}`,
  notTheScore: 'हा निकाल म्हणजे आकडा नाही. मोजलं जातं ते खालच्या प्रश्नाला दिलेलं तुमचं उत्तर.',
  numbersLink: 'आम्ही किती वेळा चुकतो, ते आम्ही प्रसिद्ध करतो',
  youSaid: 'तुम्ही म्हणालात:',
  disagreement: (verdict) =>
    `आमच्या तपासणीने “${verdict}” म्हटलं आणि तुम्ही वेगळं सांगत आहात. मोजलं तुमचं उत्तर जातं, आणि हा मतभेद आमची चूक म्हणून इथे नोंदवला जातो —`,
  numbersPageLink: 'आकड्यांच्या पानावर',
  changeMyAnswer: 'माझं उत्तर बदला',
  appealIntro:
    'सरकारी यंत्रणेत हे दार तेव्हाच उघडतं जेव्हा तुम्ही बंद करण्याला “असमाधानकारक” असं मानांकन देता — आणि हा प्रश्न बहुतेकांना कधी विचारलाच जात नाही. आम्ही अपील आधीच लिहून ठेवतो; ती पाठवायची की नाही हे तुम्ही ठरवता.',
  writeMyAppeal: 'माझं अपील लिहा',
  appealDaysLeft: (n) =>
    n === 0
      ? 'या बंद करण्याविरुद्ध अपील करण्याच्या तीस दिवसांच्या मुदतीचा आज शेवटचा दिवस आहे.'
      : `या बंद करण्याविरुद्ध अपील करण्याच्या तीस दिवसांच्या मुदतीत ${n} दिवस उरले आहेत.`,
  grounds: 'आधार',
  consentTitle: 'आम्ही नेमकं हेच पाठवू. याखेरीज काहीही नाही.',
  sentEnglish: 'जे पाठवलं जाईल (इंग्रजीत)',
  sentYourLang: 'तेच, तुमच्या भाषेत',
  hearWhatWillBeSent: 'काय पाठवलं जाईल ते ऐका',
  consentBox: 'मी हे वाचलं आहे आणि ते पाठवावं अशी माझी इच्छा आहे.',
  sendMyAppeal: 'माझं अपील पाठवा',
  recordedHeading: 'इथे नोंदवलं. कुठेही पाठवलेलं नाही.',
  recordedBody:
    'तुमचं अपील या पानावर आणि तुमच्या पावतीत जपून ठेवलं आहे. ते कोणत्याही सरकारी कार्यालयापर्यंत पोहोचलेलं नाही — या सेवेचा कोणत्याही सरकारी यंत्रणेशी संबंध जोडलेला नाही. कोणतीही मुदत सुरू झालेली नाही आणि तिथे कुणावर उत्तर देण्याचं बंधन नाही. खाली “पुढे काय करावं” मध्ये सांगितलेल्या कार्यालयात हाच मजकूर घेऊन जा, आणि पावती सोबत ठेवा.',
  windowClosedHeading: 'या बंद करण्याविरुद्ध अपील करण्याची तीस दिवसांची मुदत संपली आहे.',
  windowClosedBody: (closedOn, daysAgo) =>
    `हे प्रकरण ${closedOn} रोजी बंद करण्यात आलं. बंद करण्याविरुद्ध अपील तीस दिवसांच्या आत करावी लागते, आणि ती मुदत ${daysAgo} दिवसांपूर्वी संपली — म्हणून कुठेच न नेणारं बटण इथे दाखवत नाही. अजून काय शिल्लक आहे: खाली “पुढे काय करावं” मध्ये दिलेला मार्ग, आणि त्याच अडचणीची नव्याने तक्रार — नव्या तक्रारीने वेळ पुन्हा सुरू होते, अपिलाने आता होणार नाही.`,
  whatToDoNext: 'पुढे काय करावं',
  notOnlyOne: 'तुम्ही एकटे नाही',
  clusterLine: (others, unresolved) =>
    `याच कार्यालयात याच गोष्टीची तक्रार आणखी ${others} लोकांनी केली आहे. त्यांपैकी ${unresolved} तक्रारी अडचण दूर न होताच बंद केल्या गेल्या.`,
  clusterSee: 'हा प्रकार पाहा',
  mockNote:
    'हे प्रकरण, हा नागरिक आणि विभागाचं हे उत्तर — तिन्ही नमुना आहेत. वरची तपासणी त्याच मजकुरावर खरा मॉडेल चालवून केली आहे, आणि पावतीमागच्या नोंदी खऱ्या घटनांचे खरे हॅश आहेत.',
  events: {
    grievance_filed: 'तक्रार दाखल झाली',
    assisted_filing_declared: 'दुसऱ्या कुणीतरी त्यांच्या वतीने, त्यांच्या संमतीने दाखल केली',
    acknowledged: 'कार्यालयाला मिळाली',
    assigned: 'अधिकाऱ्याकडे दिली',
    reply_received: 'त्यांनी उत्तर दिलं',
    closed: 'त्यांनी बंद केली',
    audit_completed: 'आम्ही त्यांचं उत्तर वाचलं',
    citizen_confirmed_resolved: 'तुम्ही सांगितलं की झालं',
    citizen_confirmed_unresolved: 'तुम्ही सांगितलं की काहीच बदललं नाही',
    confirmation_superseded: 'तुम्ही उत्तर बदललं',
    appeal_drafted: 'आम्ही तुमचं अपील लिहिलं',
    appeal_consented: 'तुम्ही पाठवायला संमती दिली',
    appeal_filed: 'अपील इथे नोंदवलं',
  },
};

const DICTS: Record<ShippedLang, Dict> = { en, hi, mr };

export function t(lang: string): Dict {
  return DICTS[(SHIPPED_LANGS as readonly string[]).includes(lang) ? (lang as ShippedLang) : 'hi'];
}

export function isShipped(lang: string): lang is ShippedLang {
  return (SHIPPED_LANGS as readonly string[]).includes(lang);
}
