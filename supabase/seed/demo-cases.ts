/**
 * The three demo cases. Every reference number carries a DEMO/ prefix, every phone is in the
 * reserved +91 90000 0xxxx range and is stored only as a hash, and no real official is named
 * anywhere. The replies are hand-written from documented CPGRAMS closure patterns — not
 * model-generated, because a model writing the pathology we then detect is circular.
 *
 * Case 3 (Meera) is the one we deliberately get wrong. It feeds the published error rate.
 */

import type { Lang } from '../../src/lib/adapters/types';

export type DemoCase = {
  ref: string;
  citizen: { name: string; phone: string; lang: Lang; prefersAudio: boolean };
  filedBy?: { name: string; phone: string; lang: Lang; relation: string };
  department: string;      // short_name
  office: string;          // office name
  subject: string;
  narrative: string;       // the citizen's own words, their own language
  narrativeLang: Lang;
  filedAt: string;
  closedAt: string;
  rawStatus: string;
  reply: { body: string; lang: Lang };
  /**
   * What this person should actually do next, and where. Hand-written from a domain review,
   * in the citizen's own language, never model-generated. Names a forum or a post, never an
   * individual official, and never asserts a legal right or cites a provision as advice.
   * Optional: a case with no known correct forum shows nothing rather than an invention.
   */
  nextStep?: { heading: string; body: string };
  /**
   * A date the department itself stated, before which an appeal would be dismissed as
   * premature. Advisory: it changes what the page says, never what the citizen may do.
   */
  appealNotAdvisedBefore?: string;
  expected: {
    verdict: 'resolved' | 'partial' | 'deflected' | 'boilerplate' | 'non_responsive';
    citizenSaysResolved: boolean;
    note: string;
  };
};

export const DEMO_CASES: DemoCase[] = [
  {
    // The headline. Minute one of the video.
    ref: 'DEMO/2026/0000472',
    citizen: { name: 'Kamla Devi', phone: '+91 90000 04721', lang: 'hi', prefersAudio: true },
    filedBy: { name: 'CSC Operator (Ward 4)', phone: '+91 90000 04722', lang: 'hi', relation: 'CSC operator, filed on her behalf' },
    department: 'DoPPW',
    office: 'Treasury Office, Muzaffarpur',
    subject: 'Pension not received since May 2026',
    narrative:
      'मेरी पेंशन मई से नहीं आ रही है। तीन महीने हो गए। बैंक वाले कहते हैं कि खाते में कुछ नहीं आया। ' +
      'मैं ट्रेजरी ऑफिस दो बार गई, वहाँ कहते हैं ऊपर से नहीं आया है। मुझे बताइए पैसा क्यों रुका और कब मिलेगा।',
    narrativeLang: 'hi',
    filedAt: '2026-08-06T09:12:00.000Z',
    closedAt: '2026-08-25T11:40:00.000Z',
    rawStatus: 'Disposed',
    reply: {
      body: 'The matter has been forwarded to the concerned disbursing authority. The grievance is accordingly closed at this level.',
      lang: 'en',
    },
    nextStep: {
      heading: 'पहले यह तय कीजिए कि पेंशन केंद्र सरकार की है या राज्य की — रास्ता उसी से बदलता है',
      body:
        'यह शिकायत DoPPW के नाम पर बंद हुई है, लेकिन पैसा राज्य के ट्रेजरी से निकलता है। DoPPW में की गई ' +
        'अपील का ट्रेजरी की अदायगी पर कोई ज़ोर नहीं चलता — उसमें हफ़्ते चले जाएँगे और नतीजा कुछ नहीं आएगा।\n\n' +
        'अगर पेंशन केंद्र सरकार की नौकरी से है (PPO केंद्रीय पेंशन लेखा कार्यालय का बना हुआ है), तो ' +
        'पेंशनभोगियों के अपने पोर्टल CPENGRAMS पर शिकायत दर्ज कीजिए। अगर पेंशन राज्य सरकार की है, तो ' +
        'राज्य के पेंशन प्रकोष्ठ में, और साथ ही मुज़फ़्फ़रपुर ट्रेजरी के आहरण एवं संवितरण अधिकारी (DDO) के ' +
        'पास लिखित में दीजिए — भुगतान वहीं से निकलता है।\n\n' +
        'साथ ले जाइए: PPO नंबर, बैंक पासबुक की वह प्रविष्टि जिसमें मई से कोई जमा नहीं दिखता, और इस शिकायत ' +
        'का नंबर DEMO/2026/0000472। लिखित पावती माँगिए, बिना पावती के कागज़ मत छोड़िए।\n\n' +
        'कब: इसी हफ़्ते। जितनी देर, उतनी बकाया किस्तें जोड़नी पड़ेंगी।',
    },
    expected: {
      verdict: 'deflected',
      citizenSaysResolved: false,
      note: 'Sent elsewhere and closed here. No reason, no owner, no date.',
    },
  },

  {
    // The subtle one. Coherent, case-specific, and answers a question she did not ask.
    ref: 'DEMO/2026/0000518',
    citizen: { name: 'Arif Sheikh', phone: '+91 90000 05181', lang: 'en', prefersAudio: false },
    department: 'EPFO',
    office: 'EPFO Regional Office, Hyderabad',
    subject: 'PF withdrawal claim rejected without a reason',
    narrative:
      'My PF withdrawal claim was rejected on 2 August. The portal only shows a rejection code. ' +
      'I have submitted the same documents twice. I want to know WHY it was rejected and what exactly ' +
      'I need to correct so that it goes through.',
    narrativeLang: 'en',
    filedAt: '2026-08-04T06:30:00.000Z',
    closedAt: '2026-08-18T10:05:00.000Z',
    rawStatus: 'Closed with remarks',
    reply: {
      body:
        'With reference to your grievance dated 04.08.2026, it is informed that Claim ID ' +
        'HYD/2026/0088341 was rejected under rejection reason code 32. The member may submit a fresh ' +
        'claim through the Member e-Sewa portal. The grievance is closed.',
      lang: 'en',
    },
    nextStep: {
      heading: 'EPFO has its own ladder. A general grievance appeal is not on it.',
      body:
        'This is an EPFO claim matter, and EPFO runs its own grievance and appeal route. Sending it up the ' +
        'general public-grievance channel puts it in front of people who cannot reopen your claim, and burns ' +
        'weeks doing it.\n\n' +
        'Step one: file on EPFiGMS, the EPFO grievance portal, against the office that holds your account. ' +
        'Do not restate the complaint — ask the two questions the closure skipped: what specifically was ' +
        'deficient under rejection reason code 32, and which document or correction will clear it.\n\n' +
        'Step two, if there is no substantive reply or the reply repeats the code: a written representation ' +
        'to the Regional Provident Fund Commissioner of that regional office, attaching the EPFiGMS ' +
        'registration number.\n\n' +
        'Step three, if the rejection still stands: the EPF Appellate Tribunal is the forum that hears ' +
        'challenges to such orders. Take advice on it before you go — this is a pointer to the right door, ' +
        'not legal advice.\n\n' +
        'Carry: UAN, Claim ID HYD/2026/0088341, a screenshot of the rejection, the KYC and claim documents ' +
        'you submitted both times, and the dates of both submissions.',
    },
    expected: {
      verdict: 'non_responsive',
      citizenSaysResolved: false,
      note: 'Restates the rejection code he already had. He asked what code 32 means and what to fix.',
    },
  },

  {
    // ★ The one we get wrong, on purpose. The auditor reads a competent reply and calls it
    // resolved. The citizen says nothing was done. Her answer wins, and the disagreement is
    // published on /numbers as our error.
    ref: 'DEMO/2026/0000631',
    citizen: { name: 'Meera Kulkarni', phone: '+91 90000 06311', lang: 'mr', prefersAudio: false },
    department: 'MoRTH',
    office: 'PWD Sub-Division, Pune (Rural)',
    subject: 'Road not repaired after monsoon damage',
    narrative:
      'आमच्या रस्त्यावर पावसामुळे मोठे खड्डे पडले आहेत. दुचाकी चालवणे धोकादायक झाले आहे. ' +
      'तीन वेळा तक्रार केली आहे. रस्ता कधी दुरुस्त होणार ते सांगा.',
    narrativeLang: 'mr',
    filedAt: '2026-07-28T05:45:00.000Z',
    closedAt: '2026-08-14T09:20:00.000Z',
    rawStatus: 'Disposed',
    reply: {
      body:
        'The matter was inspected by the Sub-Divisional Officer on 09.08.2026. Work order ' +
        'No. PWD/PN/2026/1174 for pothole repair on the said stretch has been issued to the ' +
        'executing agency with a completion target of 31.08.2026. The grievance is disposed accordingly.',
      lang: 'en',
    },
    // Their own completion target. Until it passes there is nothing yet to say they failed.
    appealNotAdvisedBefore: '2026-08-31T18:29:59.000Z',
    nextStep: {
      heading: '३१ ऑगस्टपर्यंत थांबा. त्याआधीची अपील एका ओळीत फेटाळली जाते.',
      body:
        'त्यांच्या उत्तरात कामाचा आदेश क्रमांक PWD/PN/2026/1174 आणि पूर्ततेची तारीख ३१.०८.२०२६ दिली आहे. ' +
        'ती तारीख उलटण्याआधी अपील केली, तर "मुदत अजून संपलेली नाही" असं म्हणून ती एका ओळीत बंद होते — आणि ' +
        'तुमचा एक फेरा वाया जातो.\n\n' +
        'आतापासून ३१ ऑगस्टपर्यंत: रस्त्याचे फोटो काढून ठेवा, प्रत्येक फोटोवर तारीख दिसेल असे. काम सुरू झालं ' +
        'का, हेच पुरावा म्हणून कामाला येतं.\n\n' +
        '१ सप्टेंबरला रस्ता दुरुस्त झाला नसेल, तर पुणे (ग्रामीण) सार्वजनिक बांधकाम उपविभागात लेखी ' +
        'पाठपुरावा द्या — आदेश क्रमांक, ३१.०८.२०२६ ही तारीख आणि फोटो जोडून, आदेशाची पूर्तता झाली नाही असं ' +
        'नोंदवून. त्याची एक प्रत विभागाच्या कार्यकारी अभियंत्यांच्या कार्यालयात द्या. दोन्ही ठिकाणी ' +
        'पोहोचपावती घ्या.\n\n' +
        'तक्रार पुन्हा उघडायची असेल, तर तीच पोहोचपावती त्यासाठीचा आधार असते.',
    },
    expected: {
      verdict: 'resolved',
      citizenSaysResolved: false,
      note: 'A work order is not a repaired road. Our auditor accepts it; Meera says nothing has been done.',
    },
  },
];
