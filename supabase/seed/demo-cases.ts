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
    expected: {
      verdict: 'resolved',
      citizenSaysResolved: false,
      note: 'A work order is not a repaired road. Our auditor accepts it; Meera says nothing has been done.',
    },
  },
];
