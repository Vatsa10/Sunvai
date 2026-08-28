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
  /**
   * The database is not answering. Different from a wrong number, and the instruction is
   * different too: wait, do not re-read your number.
   */
  systemDown: string;
  /** The on-device case list, under Door A. */
  myCases: string;
  /**
   * Load-bearing, and the one sentence on this feature that has to survive someone opening the
   * network tab. The list itself never leaves the device — that part is true and is why a
   * client-side store is acceptable at all. But rendering the box sends every reference in it
   * to us, because each row is checked against the case lookup, and a citizen reads this line
   * as being about the box in front of them. So the check is stated in its own sentence rather
   * than buried in a clause after a comma.
   */
  myCasesPrivacy: string;
  /** One stored reference we could not open just now. Muted, not removed. */
  caseUnavailable: string;
  /**
   * Where the citizen's own words go. The paste box, the microphone and the read-aloud button
   * all send text or audio out of this service to OpenAI, which is who actually reads it. We
   * store none of it — `auditText()` writes nothing, `/api/transcribe` keeps no audio — but
   * "nothing is saved" and "nobody else sees it" are different promises, and only the first
   * one is ours to make. So the transmission is said where the decision is taken, in the
   * language the decision is being taken in.
   */
  sentToModel: string;
  /** The microphone, before it is switched on. */
  sentToModelVoice: string;
  /** Read-aloud, next to the button. */
  sentToModelSpeech: string;
  /** A number that looks like a real registration number. Not an error — the boundary. */
  realRefHeading: string;
  realRefBody: string;
  /** The database is not answering and the page is rendering the committed fixture copy. */
  offlineHeading: string;
  offlineBody: string;
  offlineWrites: string;
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
  simulatedCounts: string;
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
  consentNothingSent: string;
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
  appealHoldHeading: (by: string) => string;
  appealHoldBody: (by: string) => string;
  appealAnyway: string;
  translatedByUs: string;
  translationFailed: string;
  notOnlyOne: string;
  /**
   * Three states, never two. `saidNotFixed` are closures the citizen themselves told us were
   * still not fixed; `neverAsked` are closures nobody answered about. They are printed
   * separately and never added together — counting silence as failure would be the same
   * audit-as-metric inversion this product exists to refuse.
   */
  clusterLine: (others: number, saidNotFixed: number, neverAsked: number) => string;
  clusterSee: string;
  mockNote: string;

  /**
   * The front page in the language the front page is actually in.
   *
   * It defaults to `hi`, and until now the headline was Hindi over an English body: the demo
   * chips, the whole paste box, the measured-accuracy block and the footer note were all
   * hardcoded English while every case page behind them was fully translated. A reader's first
   * fifteen seconds read that as unfinished localisation. These are the strings that were
   * hardcoded.
   */
  langNote: string;
  goToBox: string;
  /** The three demo chips. `what` is one line; `who` carries the name and age. */
  demoChips: { who: string; what: string }[];
  evalHeading: (cases: number) => string;
  evalFalseAccusation: (pct: string | null) => string;
  evalAdversarial: (pct: string) => string;
  evalGates: (n: number) => string;
  evalSeeEvery: string;
  evalOneWrong: string;
  homeMockNote: string;
  homeMockNoteLink: string;

  /**
   * The one line above everything else on the landing page: who is hurt, by what. The figure
   * is the published national one for May 2026, and `problemSource` says so — it is a number
   * we read in a government monthly report, not one we measured, and the two must never be
   * allowed to blur into each other on the same screen.
   */
  problemLead: string;
  problemSource: string;

  /**
   * The side-by-side on Kamla's seeded closure. The left panel is deliberately plain: it is
   * quoting the text a citizen received, and any attempt to make it *look* like the portal
   * would be mimicry of a government interface. The plainness is the argument.
   *
   * The reply text, the status word and the dates are read from the seed, and the verdict and
   * the quoted spans from the recorded model run, so none of them can drift out of these
   * strings. What lives here is only our own framing — headings, the summary of what went
   * unanswered, and the forum line — because all of it has to exist in three languages.
   */
  sxsHeading: string;
  sxsLeftHeading: string;
  sxsRightHeading: string;
  sxsStatusLabel: string;
  sxsElapsedLabel: string;
  sxsReplyLabel: string;
  sxsReplyNote: string;
  sxsVerdictLabel: string;
  sxsQuotedLabel: string;
  sxsUnansweredLabel: string;
  sxsUnanswered: string[];
  sxsForumLabel: string;
  sxsForumValue: string;
  sxsOpenCase: string;
  /** The whole argument in one line: what "simpler" is actually measured in. */
  sxsClosing: string;

  /** The elapsed time, given its own weight on the case page rather than a subordinate clause. */
  elapsedDays: (n: number) => string;
  elapsedCaption: string;

  // The paste box. Door A's answer to "of course it works, you picked the cases".
  tryHeading: string;
  trySub: string;
  tryChipsHeading: string;
  tryChipsBody: string;
  tryLoadedBadge: string;
  tryAttribution: (system: string, attribution: string) => string;
  tryComplaintLabel: string;
  tryReplyLabel: string;
  tryComplaintPlaceholder: string;
  tryReplyPlaceholder: string;
  tryJudge: string;
  tryReadingButton: string;
  tryTimeNote: string;
  /** Shown instead of tryTimeNote when the box holds an example chip verbatim. */
  tryTimeNoteChip: string;
  tryBusyStatus: string;
  tryBusyDetail: string;
  tryTook: (seconds: string) => string;
  /** The took-line for a committed verdict. It must not read as the auditor being fast. */
  tryTookPrecomputed: (seconds: string) => string;
  /** Printed on the verdict itself whenever it came from the committed fixture. */
  tryPrecomputed: string;
  tryFailed: string;
  tryQuoted: string;
  tryCheckedLine: (verified: boolean, retries: number) => string;
  tryUnaddressed: string;
  tryInjection: string;
  tryNotScore: string;
  /** The model writes its reasoning in English. In hi/mr we say so rather than pretend. */
  tryReasoningLang: string;
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
  systemDown:
    'Our system is not answering right now. Your number is probably fine — please try again in a minute.',
  myCases: 'Cases you opened on this phone',
  myCasesPrivacy:
    'This list is saved only on this phone — we never store it. To show whether each case still opens, we check its number with our server.',
  caseUnavailable: 'We could not open this one right now.',
  sentToModel:
    'What you paste is sent to OpenAI, the model provider we use, so that a model can read it. We keep no copy — nothing you type here is written to our database or our logs.',
  sentToModelVoice:
    'Your recording is sent to OpenAI to be turned into text. The audio is not kept, by them or by us — only the words, which you can edit before anything else happens.',
  sentToModelSpeech:
    'To read this out, the text on this page is sent to OpenAI. Nothing about you is sent with it.',
  realRefHeading: 'That looks like a real registration number. We cannot open it.',
  realRefBody:
    'Sunvai has no connection to the government grievance portal, and will not have one without an access agreement. Nothing here reads live cases. What does work on a real case: paste the reply the department actually sent you into the box below, and we will read it against what you asked for. We keep no copy of it — but it is sent to OpenAI, the model provider we use, so that a model can read it.',
  offlineHeading: 'The live database is not answering.',
  offlineBody:
    'What you are reading is the copy committed to this repository — the same three demo cases, the same department replies, and the verdicts from the recorded model run against that text. It is not live data and we are not pretending otherwise.',
  offlineWrites:
    'Anything that would be written down — your answer to “did it work?”, an appeal — is switched off until the database is back, because there is nowhere to record it.',
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
  simulatedCounts: 'Simulated counts',
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
    'In the government system, this door only opens if you rate the closure “Poor” — a question most people are never asked. We write the appeal for you first, and you decide what happens to it.',
  writeMyAppeal: 'Write my appeal',
  appealDaysLeft: (n) =>
    n === 0
      ? 'Today is the last day of the 30-day appeal window on this closure.'
      : `${n} days left of the 30-day appeal window on this closure.`,
  grounds: 'Grounds',
  consentTitle: 'This is the whole appeal, word for word. Nothing is added to it.',
  consentNothingSent:
    'And this is a prototype with no connection to any government system. Saying yes records this appeal here and on your receipt — it does not reach any office, and no reply is owed to you. Take it to the office named under “What to do next” above.',
  sentEnglish: 'The appeal text (English)',
  sentYourLang: 'The same text, in your language',
  hearWhatWillBeSent: 'Hear the appeal read out',
  consentBox: 'I have read this and I want it recorded.',
  sendMyAppeal: 'Record my appeal',
  recordedHeading: 'Recorded here. Not sent anywhere.',
  recordedBody:
    'Your appeal is saved on this page and in your receipt. It did not reach any government office — this tool has no connection to one. No clock has started and nobody there has to reply. Take this text to the office named under “What to do next” above, and carry your receipt with you.',
  windowClosedHeading: 'The 30-day appeal window on this closure has passed.',
  windowClosedBody: (closedOn, daysAgo) =>
    `This was closed on ${closedOn}. An appeal against a closure has to go in within 30 days, and that ended ${daysAgo} days ago, so there is no live appeal to offer you. What is still open: the route under “What to do next” above, and filing the problem afresh — a new complaint starts a new clock where an appeal no longer can.`,
  appealHoldHeading: (by) => `An appeal before ${by} comes back in one line.`,
  appealHoldBody: (by) =>
    `They gave themselves until ${by}. Until that date passes there is nothing yet to say they missed it, and an appellate officer closes an early appeal as premature. Do the step above first, and keep your dated photographs. If you want to appeal now anyway, you still can — that is your call, not ours.`,
  appealAnyway: 'I still want to appeal now',
  translatedByUs: 'Translated by us from our auditor’s English. Their reply above is untouched.',
  translationFailed:
    'This is our auditor’s own explanation, in English. We could not translate it just now, so we are showing it as it was written rather than guessing at it.',
  whatToDoNext: 'What to do next',
  notOnlyOne: 'You are not the only one',
  clusterLine: (others, saidNotFixed, neverAsked) =>
    `${others} other people have complained about the same thing at the same office. ${saidNotFixed} of them were closed and the person told us the problem was still not fixed. Another ${neverAsked} were closed and nobody answered us, so we do not know either way.`,
  clusterSee: 'See the pattern',
  mockNote:
    'This case, this citizen and this department reply are synthetic. The audit above was produced by a real model run against that text, and the ledger entries behind the receipt are real hashes of real events.',
  langNote: 'Three languages, done properly. Not twenty-two, half-working.',
  goToBox: 'Go to the box',
  demoChips: [
    { who: 'Kamla, 58', what: 'Pension stopped three months ago. Marked Disposed in 19 days.' },
    { who: 'Arif, 31', what: 'PF claim rejected. The reply repeats the rejection code.' },
    { who: 'Meera, 24', what: 'Road not repaired. A case our own auditor gets wrong.' },
  ],
  evalHeading: (cases) => `We tested this on ${cases} closure replies we labelled before we wrote the prompt.`,
  evalFalseAccusation: (p) =>
    p === null
      ? 'It never accused a department that had actually answered.'
      : `It wrongly accused a department that had actually answered ${p} of the time.`,
  evalAdversarial: (p) => `It caught ${p} of replies we wrote specifically to fool it.`,
  evalGates: (n) =>
    n === 0
      ? 'It passes every gate we set for it.'
      : n === 1
        ? 'There is one test it fails, and we left it failing.'
        : `There are ${n} tests it fails, and we left them failing.`,
  evalSeeEvery: 'See every number, and what it fails',
  evalOneWrong: 'One of the three cases above is one we get wrong on purpose. It is left in.',
  homeMockNote:
    'There is no login here, and nothing to sign up for. Every case, citizen and department reply on this site is synthetic — we never touch a live government system.',
  homeMockNoteLink: 'What is real and what is mocked',

  problemLead:
    'In May 2026 about 2.6 lakh grievances were closed on the national portal, while the feedback call centre reached about 79,000 people — so most people whose case was closed were never asked whether anything actually changed.',
  problemSource:
    'Published national figures for May 2026, read from the government’s own monthly reporting. Not our measurement.',

  sxsHeading: 'The same closure, read two ways',
  sxsLeftHeading: 'What the portal tells Kamla today',
  sxsRightHeading: 'What Sunvai tells her',
  sxsStatusLabel: 'Status',
  sxsElapsedLabel: 'Time taken',
  sxsReplyLabel: 'The reply, in full',
  sxsReplyNote: 'She received it in English. Reproduced word for word, with nothing removed.',
  sxsVerdictLabel: 'Our verdict',
  sxsQuotedLabel: 'The words it rests on, quoted from that same reply',
  sxsUnansweredLabel: 'What she asked, and this reply never answers',
  sxsUnanswered: [
    'Why the pension stopped in May.',
    'When it starts again, and when the missed months get paid.',
    'Which office holds the file now, and who there she can ask.',
  ],
  sxsForumLabel: 'Who can actually act',
  sxsForumValue:
    'The money leaves the State treasury, not the department that closed this. In writing to the Drawing and Disbursing Officer at the Muzaffarpur treasury — and, if the pension is a central one, on the pensioners’ own grievance portal.',
  sxsOpenCase: 'Open Kamla’s case in full',
  sxsClosing:
    'Simpler is not fewer taps. It is fewer questions left unanswered — the same wait, ending with something she can act on.',

  elapsedDays: (n) => `${n} days`,
  elapsedCaption:
    'from the day it was filed to the day it was closed. What those days produced is written below.',

  tryHeading: 'Try it on a reply we did not choose',
  trySub: 'Paste a closure you actually received, or write one designed to fool us.',
  tryChipsHeading: 'The same dead end, on six different systems',
  tryChipsBody:
    'These are other people’s rejection letters, pasted in here as text. Nothing is stored, and no platform is contacted — we hold no connection to EPFO, the Income Tax portal, GST, UIDAI or CPGRAMS, and none of these buttons reaches one. The verdict vocabulary is generic: the auditor judges whether a reply answered the question, and knows nothing about any particular platform’s reason codes.',
  tryLoadedBadge: 'loaded',
  tryAttribution: (system, attribution) =>
    `${system} — ${attribution}. Retyped from public reports; the complaint above it is written by us, not taken from anyone’s case.`,
  tryComplaintLabel: 'What the citizen asked for',
  tryReplyLabel: 'What the department wrote back',
  tryComplaintPlaceholder: 'My pension stopped in May and nobody has told me why…',
  tryReplyPlaceholder: 'The matter has been forwarded to the concerned department…',
  tryJudge: 'Judge this reply',
  tryReadingButton: 'Reading it…',
  tryTimeNote:
    'Pasting your own text runs the auditor live, and that takes time: of the runs we have timed, the fastest took eight seconds and the slowest eighteen. Nothing is looked up — a reasoning model reads the reply against the complaint, and then every quote it wants to show you is checked character-by-character against your text before you see a verdict.',
  tryTimeNoteChip:
    'This example was audited earlier and its verdict is committed to our repository, so it appears at once rather than being worked out now. Change a single character of it, or paste a reply of your own, and the auditor runs live instead — eight to eighteen seconds, in the runs we have timed.',
  tryBusyStatus: 'Reading it. Of the runs we have timed, the fastest took eight seconds and the slowest eighteen.',
  tryBusyDetail:
    'In that time, two things happen and we cannot see which one is running: the model reads the reply against the complaint, and then the citation guard checks every quote it produced against your text — sending it back to try again if a quote is not exactly there.',
  tryTook: (seconds) => `That took ${seconds} seconds, measured from your click.`,
  tryTookPrecomputed: (seconds) =>
    `That took ${seconds} seconds because the answer was already in our repository — not because the auditor is that fast.`,
  tryPrecomputed:
    'This verdict was not worked out just now. It is a real audit of this exact text, run earlier and committed to our repository — same model, same prompt, and the quotes below were checked against this text character-by-character when it was run. Change anything in either box, or paste a reply of your own, and the auditor runs live.',
  tryFailed:
    'That did not work. We kept no copy of what you pasted — but it had already been sent to OpenAI to be read, and we cannot unsend it.',
  tryQuoted: 'Quoted from what you pasted',
  tryCheckedLine: (verified, retries) =>
    `Each of those was checked character-by-character against your text before you were shown a verdict. Verified: ${verified ? 'yes' : 'no'}${retries > 0 ? ` · the model had to be sent back ${retries} time(s)` : ''}`,
  tryUnaddressed: 'What it did not answer',
  tryInjection:
    'That text tried to give our auditor instructions. We treated it as evidence and judged it on its substance — but you should know it tried.',
  tryNotScore:
    'This verdict is not a score. In a real case the number that counts is the citizen’s own answer to “did your problem actually get fixed?” — never ours.',
  tryReasoningLang: '',
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
  systemDown:
    'हमारा सिस्टम अभी जवाब नहीं दे रहा। आपका नंबर शायद सही है — कृपया एक मिनट बाद फिर कोशिश कीजिए।',
  myCases: 'इस फ़ोन पर खोली गई शिकायतें',
  myCasesPrivacy:
    'यह सूची सिर्फ़ इसी फ़ोन में सहेजी जाती है — हम इसे कभी अपने पास नहीं रखते। हर शिकायत अभी खुलती है या नहीं, यह दिखाने के लिए हम उसका नंबर अपने सर्वर से जाँचते हैं।',
  caseUnavailable: 'यह अभी नहीं खुल पाई।',
  sentToModel:
    'आप जो चिपकाएँगे वह पढ़े जाने के लिए OpenAI को भेजा जाता है — मॉडल हम उन्हीं का इस्तेमाल करते हैं। हम उसकी कोई नकल नहीं रखते: यहाँ लिखी कोई बात न हमारे डेटाबेस में जाती है, न हमारे रिकॉर्ड में।',
  sentToModelVoice:
    'आपकी रिकॉर्डिंग शब्दों में बदलने के लिए OpenAI को भेजी जाती है। आवाज़ न वे रखते हैं न हम — सिर्फ़ लिखे हुए शब्द बचते हैं, और आगे कुछ होने से पहले आप उन्हें बदल सकते हैं।',
  sentToModelSpeech:
    'पढ़कर सुनाने के लिए इस पन्ने का लिखा हुआ OpenAI को भेजा जाता है। आपके बारे में उसके साथ कुछ नहीं भेजा जाता।',
  realRefHeading: 'यह असली पंजीकरण नंबर लगता है। हम इसे नहीं खोल सकते।',
  realRefBody:
    'सुनवाई का सरकारी शिकायत पोर्टल से कोई जुड़ाव नहीं है, और बिना आधिकारिक अनुमति के होगा भी नहीं। यहाँ से कोई असली शिकायत नहीं पढ़ी जाती। जो काम करता है वह यह है: विभाग ने आपको जो जवाब भेजा, उसे नीचे वाले बक्से में चिपकाइए — हम उसे आपकी माँग के सामने रखकर पढ़ेंगे। उसकी कोई नकल हम नहीं रखते — पर पढ़े जाने के लिए वह OpenAI को भेजा जाता है, मॉडल हम उन्हीं का इस्तेमाल करते हैं।',
  offlineHeading: 'लाइव डेटाबेस जवाब नहीं दे रहा।',
  offlineBody:
    'आप जो देख रहे हैं वह इस प्रोजेक्ट में सहेजी गई प्रति है — वही तीन नमूना शिकायतें, वही विभागीय जवाब, और उसी दर्ज मॉडल-रन से निकले नतीजे। यह लाइव डेटा नहीं है, और हम इसे लाइव बताने की कोशिश नहीं कर रहे।',
  offlineWrites:
    'जो कुछ दर्ज होना है — "क्या काम हुआ?" का आपका जवाब, अपील — वह डेटाबेस लौटने तक बंद है, क्योंकि उसे लिखने की जगह ही नहीं है।',
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
  simulatedCounts: 'नमूना आँकड़े',
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
    'सरकारी व्यवस्था में यह दरवाज़ा तभी खुलता है जब आप बंद करने को “खराब” रेटिंग दें — और यह सवाल ज़्यादातर लोगों से कभी पूछा ही नहीं जाता। हम अपील पहले लिख देते हैं; उसका क्या करना है, यह आप तय करते हैं।',
  writeMyAppeal: 'मेरी अपील लिखिए',
  appealDaysLeft: (n) =>
    n === 0
      ? 'इस बंदी के विरुद्ध अपील की तीस दिन की मियाद का आज आखिरी दिन है।'
      : `इस बंदी के विरुद्ध अपील की तीस दिन की मियाद में ${n} दिन बचे हैं।`,
  grounds: 'आधार',
  consentTitle: 'पूरी अपील यही है, शब्द दर शब्द। इसमें कुछ और नहीं जोड़ा जाता।',
  consentNothingSent:
    'और यह एक नमूना सेवा है, किसी सरकारी व्यवस्था से इसका कोई जुड़ाव नहीं है। हाँ कहने पर यह अपील यहाँ और आपकी रसीद में दर्ज हो जाएगी — यह किसी दफ्तर तक नहीं पहुँचेगी, और वहाँ किसी पर जवाब देने की ज़िम्मेदारी नहीं आएगी। ऊपर “आगे क्या कीजिए” में बताए दफ्तर में इसे ले जाइए।',
  sentEnglish: 'अपील का पाठ (अंग्रेज़ी में)',
  sentYourLang: 'वही पाठ, आपकी भाषा में',
  hearWhatWillBeSent: 'अपील पढ़कर सुनिए',
  consentBox: 'मैंने यह पढ़ लिया है और मैं चाहता/चाहती हूँ कि यह दर्ज हो।',
  sendMyAppeal: 'मेरी अपील दर्ज कीजिए',
  recordedHeading: 'यहाँ दर्ज हो गई। कहीं भेजी नहीं गई।',
  recordedBody:
    'आपकी अपील इस पन्ने पर और आपकी रसीद में सुरक्षित है। यह किसी सरकारी दफ्तर तक नहीं पहुँची — इस सेवा का किसी सरकारी व्यवस्था से कोई जुड़ाव नहीं है। कोई समय-सीमा शुरू नहीं हुई और वहाँ किसी को जवाब देना नहीं है। ऊपर “आगे क्या कीजिए” में बताए दफ्तर में यही लिखा हुआ ले जाइए, और अपनी रसीद साथ रखिए।',
  windowClosedHeading: 'इस बंदी के विरुद्ध अपील की तीस दिन की मियाद बीत चुकी है।',
  windowClosedBody: (closedOn, daysAgo) =>
    `यह मामला ${closedOn} को बंद किया गया था। बंद करने के विरुद्ध अपील तीस दिन के भीतर देनी होती है, और वह मियाद ${daysAgo} दिन पहले खत्म हो गई — इसलिए यहाँ ऐसा बटन नहीं दिखाया जा रहा जो कहीं नहीं ले जाता। अब भी क्या खुला है: ऊपर “आगे क्या कीजिए” में बताया रास्ता, और उसी समस्या पर नई शिकायत दर्ज करना — नई शिकायत से समय फिर से शुरू होता है, अपील से अब नहीं।`,
  appealHoldHeading: (by) => `${by} से पहले की गई अपील एक ही लाइन में लौट आती है।`,
  appealHoldBody: (by) =>
    `उन्होंने खुद ${by} तक का समय लिया है। वह तारीख बीते बिना यह नहीं कहा जा सकता कि उन्होंने काम नहीं किया, और अपील अधिकारी समय से पहले की अपील को “अभी मियाद बाकी है” कहकर बंद कर देते हैं। पहले ऊपर बताया कदम उठाइए। फिर भी अभी अपील करनी हो, तो कर सकते हैं — यह फैसला आपका है, हमारा नहीं।`,
  appealAnyway: 'फिर भी मुझे अभी अपील करनी है',
  translatedByUs: 'यह हमारी जाँच की अंग्रेज़ी बात है, अनुवाद हमने किया है। ऊपर उनका जवाब जस का तस है।',
  translationFailed:
    'यह हमारी अपनी जाँच की बात है, अंग्रेज़ी में। अभी इसका अनुवाद नहीं हो सका, इसलिए अंदाज़ा लगाने के बजाय हम इसे जैसा लिखा गया वैसा ही दिखा रहे हैं।',
  whatToDoNext: 'आगे क्या कीजिए',
  notOnlyOne: 'आप अकेले नहीं हैं',
  clusterLine: (others, saidNotFixed, neverAsked) =>
    `इसी दफ्तर में इसी बात की शिकायत ${others} और लोगों ने की है। उनमें से ${saidNotFixed} शिकायतें बंद कर दी गईं और उन लोगों ने हमें बताया कि समस्या तब भी हल नहीं हुई थी। ${neverAsked} और शिकायतें बंद हुईं, पर उनका किसी ने जवाब नहीं दिया — इसलिए उनके बारे में हमें कुछ पता नहीं।`,
  clusterSee: 'यह सिलसिला देखिए',
  mockNote:
    'यह मामला, यह नागरिक और विभाग का यह जवाब — तीनों नमूना हैं। ऊपर की जाँच उसी लिखे पर असली मॉडल चलाकर की गई है, और रसीद के पीछे की बहीखाता प्रविष्टियाँ असली घटनाओं के असली हैश हैं।',
  langNote: 'तीन भाषाएँ, ठीक से। बाईस भाषाएँ आधी-अधूरी नहीं।',
  goToBox: 'उस बक्से तक जाइए',
  demoChips: [
    { who: 'कमला, 58', what: 'तीन महीने से पेंशन बंद। 19 दिन में “निपटा दिया गया” लिख दिया।' },
    { who: 'आरिफ़, 31', what: 'पीएफ़ का दावा खारिज। जवाब में वही खारिजी कोड दोबारा लिखा है।' },
    { who: 'मीरा, 24', what: 'सड़क नहीं बनी। यह वह मामला है जिसमें हमारी अपनी जाँच गलत निकलती है।' },
  ],
  evalHeading: (cases) =>
    `प्रॉम्प्ट लिखने से पहले हमने ${cases} बंदी-जवाबों पर खुद निशान लगाए, और उन्हीं पर यह जाँच परखी।`,
  evalFalseAccusation: (p) =>
    p === null
      ? 'जिस विभाग ने सचमुच जवाब दिया था, उस पर इसने कभी गलत इल्ज़ाम नहीं लगाया।'
      : `जिस विभाग ने सचमुच जवाब दिया था, उस पर इसने ${p} बार गलत इल्ज़ाम लगाया।`,
  evalAdversarial: (p) => `इसे चकमा देने के लिए हमने जो जवाब खुद लिखे थे, उनमें से ${p} इसने पकड़ लिए।`,
  evalGates: (n) =>
    n === 0
      ? 'हमने जो भी कसौटी रखी, यह उस पर खरा उतरा।'
      : n === 1
        ? 'एक जाँच में यह फेल होता है, और हमने उसे फेल ही रहने दिया।'
        : `${n} जाँचों में यह फेल होता है, और हमने उन्हें फेल ही रहने दिया।`,
  evalSeeEvery: 'हर आँकड़ा देखिए, और यह भी कि कहाँ फेल होता है',
  evalOneWrong: 'ऊपर के तीन मामलों में एक वह है जिसे हम जानबूझकर गलत जाँचते हैं। उसे हटाया नहीं गया है।',
  homeMockNote:
    'यहाँ न कोई लॉगिन है, न कुछ बनवाना है। इस साइट का हर मामला, हर नागरिक और विभाग का हर जवाब नमूना है — हम किसी चालू सरकारी व्यवस्था को छूते ही नहीं।',
  homeMockNoteLink: 'क्या असली है और क्या नमूना',

  problemLead:
    'मई 2026 में राष्ट्रीय पोर्टल पर लगभग 2.6 लाख शिकायतें बंद की गईं, और फ़ीडबैक कॉल सेंटर करीब 79,000 लोगों तक ही पहुँच पाया — यानी जिनकी शिकायत बंद हुई, उनमें से ज़्यादातर से कभी पूछा ही नहीं गया कि सचमुच कुछ बदला या नहीं।',
  problemSource:
    'मई 2026 के प्रकाशित राष्ट्रीय आँकड़े, सरकार की अपनी मासिक रिपोर्टिंग से लिए गए। यह हमारी अपनी नाप नहीं है।',

  sxsHeading: 'एक ही बंदी, दो तरह से पढ़ी हुई',
  sxsLeftHeading: 'आज पोर्टल कमला को इतना बताता है',
  sxsRightHeading: 'सुनवाई उन्हें यह बताती है',
  sxsStatusLabel: 'दर्जा',
  sxsElapsedLabel: 'लगा समय',
  sxsReplyLabel: 'पूरा जवाब, जस का तस',
  sxsReplyNote: 'यह जवाब उन्हें अंग्रेज़ी में मिला था। यहाँ शब्दशः वही रखा है, कुछ हटाया नहीं गया।',
  sxsVerdictLabel: 'हमारा निष्कर्ष',
  sxsQuotedLabel: 'यह निष्कर्ष जिन शब्दों पर टिका है — उसी जवाब से उद्धृत',
  sxsUnansweredLabel: 'कमला ने जो पूछा, और इस जवाब में जिसका कहीं नाम नहीं',
  sxsUnanswered: [
    'पेंशन मई में रुकी क्यों।',
    'दोबारा कब से मिलेगी, और छूटे महीनों का पैसा कब आएगा।',
    'फ़ाइल अब किस दफ्तर के पास है, और वहाँ किससे पूछा जाए।',
  ],
  sxsForumLabel: 'ज़ोर किस पर चलता है',
  sxsForumValue:
    'पैसा राज्य के ट्रेजरी से निकलता है, उस विभाग से नहीं जिसने यह शिकायत बंद की। मुज़फ़्फ़रपुर ट्रेजरी के आहरण एवं संवितरण अधिकारी (DDO) को लिखित में — और अगर पेंशन केंद्र सरकार की नौकरी से है, तो पेंशनभोगियों के अपने शिकायत पोर्टल पर।',
  sxsOpenCase: 'कमला का पूरा मामला खोलिए',
  sxsClosing:
    'आसान का मतलब कम टैप नहीं। आसान का मतलब है — कम सवाल जो बिना जवाब रह जाएँ। इंतज़ार उतना ही रहा, पर अंत में उनके हाथ में कुछ ऐसा है जिस पर वे चल सकें।',

  elapsedDays: (n) => `${n} दिन`,
  elapsedCaption:
    'शिकायत दर्ज होने से बंद होने तक का समय। इन दिनों में क्या निकला, वह नीचे लिखा है।',

  tryHeading: 'ऐसे जवाब पर आज़माइए जो हमने नहीं चुना',
  trySub: 'आपको सचमुच मिला कोई बंदी-जवाब यहाँ चिपकाइए, या ऐसा जवाब लिखिए जो हमें चकमा दे सके।',
  tryChipsHeading: 'वही बंद गली, छह अलग-अलग व्यवस्थाओं में',
  tryChipsBody:
    'ये दूसरे लोगों को मिले खारिजी जवाब हैं, यहाँ सिर्फ़ लिखे हुए रूप में रखे गए हैं। कुछ भी सहेजा नहीं जाता, और किसी मंच से कोई संपर्क नहीं होता — ईपीएफ़ओ, आयकर पोर्टल, जीएसटी, यूआईडीएआई या सीपीग्राम्स से हमारा कोई जुड़ाव नहीं है, और इनमें से कोई बटन वहाँ तक नहीं पहुँचता। नतीजे के शब्द आम हैं: जाँच यह देखती है कि जवाब में सवाल का उत्तर है या नहीं, और किसी मंच के अपने कोड उसे मालूम ही नहीं।',
  tryLoadedBadge: 'भरा हुआ',
  tryAttribution: (system, attribution) =>
    `${system} — ${attribution}। सार्वजनिक रिपोर्टों से हाथ से टाइप किया गया; ऊपर लिखी शिकायत हमने खुद लिखी है, किसी के मामले से नहीं ली।`,
  tryComplaintLabel: 'नागरिक ने क्या माँगा था',
  tryReplyLabel: 'विभाग ने क्या जवाब लिखा',
  tryComplaintPlaceholder: 'मई से मेरी पेंशन बंद है और किसी ने वजह नहीं बताई…',
  tryReplyPlaceholder: 'मामला संबंधित विभाग को भेज दिया गया है…',
  tryJudge: 'इस जवाब को जाँचिए',
  tryReadingButton: 'पढ़ा जा रहा है…',
  tryTimeNote:
    'अपना लिखा चिपकाने पर जाँच उसी वक़्त चलती है, और उसमें समय लगता है: हमने जितनी बार नापा, सबसे कम आठ सेकंड और सबसे ज़्यादा अठारह सेकंड लगे। कुछ ढूँढ़कर नहीं लाया जाता — एक मॉडल शिकायत के सामने रखकर जवाब पढ़ता है, और फिर वह जो भी उद्धरण दिखाना चाहता है, नतीजा दिखाने से पहले उसे आपके लिखे से अक्षर दर अक्षर मिलाया जाता है।',
  tryTimeNoteChip:
    'यह उदाहरण पहले जाँचा जा चुका है और उसका नतीजा हमारी कोड-फ़ाइलों में दर्ज है, इसलिए वह अभी बनाया नहीं जाता — तुरंत दिख जाता है। इसमें एक अक्षर भी बदलिए, या अपना कोई जवाब चिपकाइए, तो जाँच उसी वक़्त चलेगी — हमने जितनी बार नापा, उसमें आठ से अठारह सेकंड लगे।',
  tryBusyStatus: 'पढ़ा जा रहा है। हमने जितनी बार नापा, सबसे कम आठ और सबसे ज़्यादा अठारह सेकंड लगे।',
  tryBusyDetail:
    'इस बीच दो काम होते हैं और हमें दिखता नहीं कि अभी कौन-सा चल रहा है: मॉडल शिकायत के सामने रखकर जवाब पढ़ता है, और फिर उद्धरण-पहरा उसके हर उद्धरण को आपके लिखे से मिलाता है — कोई उद्धरण हूबहू न मिले तो उसे दोबारा करने के लिए वापस भेज देता है।',
  tryTook: (seconds) => `आपके दबाने से गिनकर इसमें ${seconds} सेकंड लगे।`,
  tryTookPrecomputed: (seconds) =>
    `इसमें ${seconds} सेकंड लगे क्योंकि जवाब पहले से हमारी फ़ाइलों में दर्ज था — इसलिए नहीं कि जाँच इतनी तेज़ है।`,
  tryPrecomputed:
    'यह नतीजा अभी नहीं बनाया गया। यह इसी लिखे की असली जाँच है, जो पहले चलाई गई और हमारी कोड-फ़ाइलों में दर्ज कर दी गई — वही मॉडल, वही निर्देश, और नीचे के उद्धरण उसी वक़्त इसी लिखे से अक्षर दर अक्षर मिलाए गए थे। दोनों में से कुछ भी बदलिए, या अपना जवाब चिपकाइए, तो जाँच उसी वक़्त चलेगी।',
  tryFailed:
    'यह नहीं हो पाया। आपने जो चिपकाया उसकी कोई नकल हमने नहीं रखी — पर वह पढ़े जाने के लिए OpenAI तक पहुँच चुका था, और उसे वापस नहीं लिया जा सकता।',
  tryQuoted: 'आपने जो चिपकाया, उसमें से उद्धृत',
  tryCheckedLine: (verified, retries) =>
    `इनमें से हर उद्धरण, नतीजा दिखाने से पहले, आपके लिखे से अक्षर दर अक्षर मिलाया गया। मिलाया गया: ${verified ? 'हाँ' : 'नहीं'}${retries > 0 ? ` · मॉडल को ${retries} बार वापस भेजना पड़ा` : ''}`,
  tryUnaddressed: 'किन बातों का जवाब नहीं दिया',
  tryInjection:
    'उस लिखे ने हमारी जाँच को निर्देश देने की कोशिश की। हमने उसे सबूत मानकर उसकी बात पर ही परखा — पर आपको पता होना चाहिए कि कोशिश हुई थी।',
  tryNotScore:
    'यह नतीजा कोई आँकड़ा नहीं है। असली मामले में गिना वही जाता है जो नागरिक खुद कहता है — “क्या आपकी समस्या सच में ठीक हुई?” — हमारा कहा नहीं।',
  tryReasoningLang: 'यह हमारी जाँच की अपनी बात है, अंग्रेज़ी में — यहाँ इसका अनुवाद नहीं किया जाता।',
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
  systemDown:
    'आमची यंत्रणा सध्या उत्तर देत नाही. तुमचा क्रमांक बहुधा बरोबर आहे — कृपया एका मिनिटाने पुन्हा पाहा.',
  myCases: 'या फोनवर उघडलेल्या तक्रारी',
  myCasesPrivacy:
    'ही यादी फक्त याच फोनमध्ये जतन होते — आम्ही ती कधीच आमच्याकडे ठेवत नाही. प्रत्येक तक्रार अजून उघडते का हे दाखवण्यासाठी आम्ही तिचा क्रमांक आमच्या सर्व्हरकडे तपासतो.',
  caseUnavailable: 'ही सध्या उघडता आली नाही.',
  sentToModel:
    'तुम्ही जे चिकटवाल ते वाचण्यासाठी OpenAI कडे पाठवलं जातं — मॉडेल आम्ही त्यांचंच वापरतो. आम्ही त्याची प्रत ठेवत नाही: इथे लिहिलेलं काहीही आमच्या डेटाबेसमध्ये किंवा नोंदींमध्ये जात नाही.',
  sentToModelVoice:
    'तुमचं रेकॉर्डिंग शब्दांत बदलण्यासाठी OpenAI कडे पाठवलं जातं. आवाज ना ते ठेवतात ना आम्ही — फक्त शब्द उरतात, आणि पुढे काही होण्याआधी तुम्ही ते बदलू शकता.',
  sentToModelSpeech:
    'वाचून दाखवण्यासाठी या पानावरचा मजकूर OpenAI कडे पाठवला जातो. तुमच्याबद्दलचं काहीही त्यासोबत जात नाही.',
  realRefHeading: 'हा खरा नोंदणी क्रमांक दिसतो. आम्ही तो उघडू शकत नाही.',
  realRefBody:
    'सुनवाईचा सरकारी तक्रार पोर्टलशी काहीही संबंध नाही, आणि अधिकृत परवानगीशिवाय तो होणारही नाही. इथून कुठलीही खरी तक्रार वाचली जात नाही. जे चालतं ते हे: विभागानं तुम्हाला पाठवलेलं उत्तर खालच्या चौकटीत चिकटवा — तुम्ही काय मागितलं होतं त्यासमोर आम्ही ते वाचू. आम्ही त्याची प्रत ठेवत नाही — पण वाचण्यासाठी ते OpenAI कडे पाठवलं जातं, मॉडेल आम्ही त्यांचंच वापरतो.',
  offlineHeading: 'लाइव्ह डेटाबेस उत्तर देत नाही.',
  offlineBody:
    'तुम्ही पाहताय ती या प्रकल्पात जतन केलेली प्रत आहे — तेच तीन नमुना तक्रारी, तीच विभागाची उत्तरं, आणि त्याच नोंदवलेल्या मॉडेल-रनमधून आलेले निकाल. ही लाइव्ह माहिती नाही, आणि तसं भासवतही नाही.',
  offlineWrites:
    'जे नोंदवलं जाणार आहे — "काम झालं का?" चं तुमचं उत्तर, अपील — ते डेटाबेस परत येईपर्यंत बंद आहे, कारण ते लिहायला जागाच नाही.',
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
  simulatedCounts: 'नमुना आकडे',
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
    'सरकारी यंत्रणेत हे दार तेव्हाच उघडतं जेव्हा तुम्ही बंद करण्याला “असमाधानकारक” असं मानांकन देता — आणि हा प्रश्न बहुतेकांना कधी विचारलाच जात नाही. आम्ही अपील आधीच लिहून ठेवतो; तिचं काय करायचं हे तुम्ही ठरवता.',
  writeMyAppeal: 'माझं अपील लिहा',
  appealDaysLeft: (n) =>
    n === 0
      ? 'या बंद करण्याविरुद्ध अपील करण्याच्या तीस दिवसांच्या मुदतीचा आज शेवटचा दिवस आहे.'
      : `या बंद करण्याविरुद्ध अपील करण्याच्या तीस दिवसांच्या मुदतीत ${n} दिवस उरले आहेत.`,
  grounds: 'आधार',
  consentTitle: 'संपूर्ण अपील हीच आहे, शब्दन् शब्द. यात आणखी काहीही जोडलं जात नाही.',
  consentNothingSent:
    'आणि ही एक नमुना सेवा आहे, कोणत्याही सरकारी यंत्रणेशी तिचा संबंध जोडलेला नाही. होय म्हटल्यावर हे अपील इथे आणि तुमच्या पावतीत नोंदवलं जाईल — ते कोणत्याही कार्यालयापर्यंत पोहोचणार नाही, आणि तिथे कुणावर उत्तर देण्याचं बंधन येणार नाही. वर “पुढे काय करावं” मध्ये सांगितलेल्या कार्यालयात ते घेऊन जा.',
  sentEnglish: 'अपिलाचा मजकूर (इंग्रजीत)',
  sentYourLang: 'तोच मजकूर, तुमच्या भाषेत',
  hearWhatWillBeSent: 'अपील वाचून ऐका',
  consentBox: 'मी हे वाचलं आहे आणि ते नोंदवावं अशी माझी इच्छा आहे.',
  sendMyAppeal: 'माझं अपील नोंदवा',
  recordedHeading: 'इथे नोंदवलं. कुठेही पाठवलेलं नाही.',
  recordedBody:
    'तुमचं अपील या पानावर आणि तुमच्या पावतीत जपून ठेवलं आहे. ते कोणत्याही सरकारी कार्यालयापर्यंत पोहोचलेलं नाही — या सेवेचा कोणत्याही सरकारी यंत्रणेशी संबंध जोडलेला नाही. कोणतीही मुदत सुरू झालेली नाही आणि तिथे कुणावर उत्तर देण्याचं बंधन नाही. वर “पुढे काय करावं” मध्ये सांगितलेल्या कार्यालयात हाच मजकूर घेऊन जा, आणि पावती सोबत ठेवा.',
  windowClosedHeading: 'या बंद करण्याविरुद्ध अपील करण्याची तीस दिवसांची मुदत संपली आहे.',
  windowClosedBody: (closedOn, daysAgo) =>
    `हे प्रकरण ${closedOn} रोजी बंद करण्यात आलं. बंद करण्याविरुद्ध अपील तीस दिवसांच्या आत करावी लागते, आणि ती मुदत ${daysAgo} दिवसांपूर्वी संपली — म्हणून कुठेच न नेणारं बटण इथे दाखवत नाही. अजून काय शिल्लक आहे: वर “पुढे काय करावं” मध्ये दिलेला मार्ग, आणि त्याच अडचणीची नव्याने तक्रार — नव्या तक्रारीने वेळ पुन्हा सुरू होते, अपिलाने आता होणार नाही.`,
  appealHoldHeading: (by) => `${by} च्या आधी केलेली अपील एका ओळीत परत येते.`,
  appealHoldBody: (by) =>
    `त्यांनी स्वतःसाठी ${by} पर्यंतची मुदत घेतली आहे. ती तारीख उलटल्याशिवाय त्यांनी काम केलं नाही असं म्हणता येत नाही, आणि अपील अधिकारी मुदतीआधीची अपील “मुदत अजून संपलेली नाही” म्हणून बंद करतात. आधी वरचं पाऊल उचला आणि तारीख दिसणारे फोटो जपून ठेवा. तरीही आत्ताच अपील करायची असेल, तर करू शकता — तो निर्णय तुमचा आहे, आमचा नाही.`,
  appealAnyway: 'तरीही मला आत्ताच अपील करायची आहे',
  translatedByUs: 'हे आमच्या तपासणीचं इंग्रजीतलं म्हणणं, भाषांतर आम्ही केलं आहे. वरचं त्यांचं उत्तर जसंच्या तसं आहे.',
  translationFailed:
    'हे आमच्याच तपासणीचं म्हणणं आहे, इंग्रजीत. आत्ता त्याचं भाषांतर होऊ शकलं नाही, म्हणून अंदाज करण्याऐवजी ते जसं लिहिलं तसंच दाखवत आहोत.',
  whatToDoNext: 'पुढे काय करावं',
  notOnlyOne: 'तुम्ही एकटे नाही',
  clusterLine: (others, saidNotFixed, neverAsked) =>
    `याच कार्यालयात याच गोष्टीची तक्रार आणखी ${others} लोकांनी केली आहे. त्यांपैकी ${saidNotFixed} तक्रारी बंद झाल्या आणि त्या लोकांनी आम्हाला सांगितलं की अडचण तेव्हाही दूर झाली नव्हती. आणखी ${neverAsked} तक्रारी बंद झाल्या, पण त्यांचं कुणीच उत्तर दिलं नाही — त्यामुळे त्यांबद्दल आम्हाला काहीच माहीत नाही.`,
  clusterSee: 'हा प्रकार पाहा',
  mockNote:
    'हे प्रकरण, हा नागरिक आणि विभागाचं हे उत्तर — तिन्ही नमुना आहेत. वरची तपासणी त्याच मजकुरावर खरा मॉडेल चालवून केली आहे, आणि पावतीमागच्या नोंदी खऱ्या घटनांचे खरे हॅश आहेत.',
  langNote: 'तीन भाषा, नीट. बावीस भाषा अर्धवट नाही.',
  goToBox: 'त्या चौकटीकडे जा',
  demoChips: [
    { who: 'कमला, 58', what: 'तीन महिन्यांपासून पेन्शन बंद. 19 दिवसांत “निकाली काढलं” असं नोंदवलं.' },
    { who: 'आरिफ, 31', what: 'पीएफचा दावा नाकारला. उत्तरात तोच नकाराचा कोड पुन्हा लिहिला आहे.' },
    { who: 'मीरा, 24', what: 'रस्ता दुरुस्त झाला नाही. याच प्रकरणात आमची स्वतःची तपासणी चुकते.' },
  ],
  evalHeading: (cases) =>
    `प्रॉम्प्ट लिहिण्याआधी आम्ही ${cases} बंद-उत्तरांवर स्वतः खुणा केल्या, आणि त्यांवरच ही तपासणी पडताळली.`,
  evalFalseAccusation: (p) =>
    p === null
      ? 'ज्या विभागाने खरोखर उत्तर दिलं होतं, त्याच्यावर हिने कधीही चुकीचा आरोप केला नाही.'
      : `ज्या विभागाने खरोखर उत्तर दिलं होतं, त्याच्यावर हिने ${p} वेळा चुकीचा आरोप केला.`,
  evalAdversarial: (p) => `तिला फसवण्यासाठी आम्ही मुद्दाम लिहिलेल्या उत्तरांपैकी ${p} तिने पकडली.`,
  evalGates: (n) =>
    n === 0
      ? 'आम्ही ठेवलेल्या प्रत्येक कसोटीवर ती उतरते.'
      : n === 1
        ? 'एका चाचणीत ती नापास होते, आणि आम्ही ती तशीच नापास ठेवली आहे.'
        : `${n} चाचण्यांत ती नापास होते, आणि आम्ही त्या तशाच नापास ठेवल्या आहेत.`,
  evalSeeEvery: 'प्रत्येक आकडा पाहा, आणि ती कुठे नापास होते तेही',
  evalOneWrong: 'वरच्या तीन प्रकरणांपैकी एक असं आहे जे आम्ही मुद्दाम चुकीचं तपासतो. ते काढून टाकलेलं नाही.',
  homeMockNote:
    'इथे लॉगिन नाही, आणि नोंदणी करण्यासारखं काहीच नाही. या संकेतस्थळावरचं प्रत्येक प्रकरण, प्रत्येक नागरिक आणि विभागाचं प्रत्येक उत्तर नमुना आहे — आम्ही कोणत्याही चालू सरकारी यंत्रणेला हातही लावत नाही.',
  homeMockNoteLink: 'काय खरं आहे आणि काय नमुना',

  problemLead:
    'मे 2026 मध्ये राष्ट्रीय पोर्टलवर सुमारे 2.6 लाख तक्रारी बंद करण्यात आल्या, आणि फीडबॅक कॉल सेंटर जेमतेम 79,000 लोकांपर्यंत पोहोचलं — म्हणजे ज्यांची तक्रार बंद झाली, त्यांतल्या बहुतेकांना खरंच काही बदललं का, हे कधी विचारलंच गेलं नाही.',
  problemSource:
    'मे 2026 चे प्रकाशित राष्ट्रीय आकडे, सरकारच्या स्वतःच्या मासिक अहवालातून घेतलेले. ही आमची स्वतःची मोजणी नाही.',

  sxsHeading: 'एकच बंदी, दोन प्रकारे वाचलेली',
  sxsLeftHeading: 'आज पोर्टल कमलाला एवढंच सांगतं',
  sxsRightHeading: 'सुनवाई तिला हे सांगते',
  sxsStatusLabel: 'दर्जा',
  sxsElapsedLabel: 'लागलेला वेळ',
  sxsReplyLabel: 'संपूर्ण उत्तर, जसंच्या तसं',
  sxsReplyNote: 'हे उत्तर तिला इंग्रजीत मिळालं होतं. इथे शब्दशः तेच ठेवलं आहे, काहीही काढलेलं नाही.',
  sxsVerdictLabel: 'आमचा निष्कर्ष',
  sxsQuotedLabel: 'हा निष्कर्ष ज्या शब्दांवर उभा आहे — त्याच उत्तरातून उद्धृत',
  sxsUnansweredLabel: 'कमलाने जे विचारलं, आणि या उत्तरात ज्याचा उल्लेखही नाही',
  sxsUnanswered: [
    'पेन्शन मे महिन्यात का थांबली.',
    'ती पुन्हा कधीपासून मिळेल, आणि थकलेल्या महिन्यांचे पैसे कधी येतील.',
    'फाइल आता कोणत्या कार्यालयाकडे आहे, आणि तिथे कोणाला विचारायचं.',
  ],
  sxsForumLabel: 'कोण खरंच काही करू शकतं',
  sxsForumValue:
    'पैसा राज्याच्या तिजोरीतून निघतो, ही तक्रार बंद करणाऱ्या विभागाकडून नाही. मुझफ्फरपूर तिजोरीच्या आहरण व संवितरण अधिकाऱ्याकडे (DDO) लेखी — आणि पेन्शन केंद्र सरकारच्या नोकरीची असेल, तर पेन्शनधारकांच्या स्वतःच्या तक्रार पोर्टलवर.',
  sxsOpenCase: 'कमलाचं संपूर्ण प्रकरण उघडा',
  sxsClosing:
    'सोपं म्हणजे कमी टॅप नाही. सोपं म्हणजे बिनउत्तराचे कमी प्रश्न — वाट तेवढीच, पण शेवटी तिच्या हातात कृती करण्यासारखं काहीतरी.',

  elapsedDays: (n) => `${n} दिवस`,
  elapsedCaption:
    'तक्रार दाखल झाल्यापासून ती बंद होईपर्यंतचा वेळ. या दिवसांतून काय निघालं ते खाली लिहिलं आहे.',

  tryHeading: 'आम्ही न निवडलेल्या उत्तरावर करून पाहा',
  trySub: 'तुम्हाला खरोखर मिळालेलं बंद-उत्तर इथे चिकटवा, किंवा आम्हाला फसवेल असं उत्तर लिहा.',
  tryChipsHeading: 'तीच बंद गल्ली, सहा वेगवेगळ्या यंत्रणांत',
  tryChipsBody:
    'ही दुसऱ्या लोकांना आलेली नकाराची उत्तरं आहेत, इथे फक्त मजकूर म्हणून ठेवलेली. काहीही साठवलं जात नाही, आणि कोणत्याही मंचाशी संपर्क होत नाही — ईपीएफओ, आयकर पोर्टल, जीएसटी, यूआयडीएआय किंवा सीपीग्राम्सशी आमचा काहीही संबंध नाही, आणि यापैकी कोणतंही बटण तिथवर पोहोचत नाही. निकालाचे शब्द सर्वसाधारण आहेत: उत्तरात प्रश्नाचं उत्तर आहे का एवढंच तपासणी पाहते, कोणत्याही मंचाचे स्वतःचे कोड तिला माहीतच नाहीत.',
  tryLoadedBadge: 'भरलेलं',
  tryAttribution: (system, attribution) =>
    `${system} — ${attribution}. सार्वजनिक नोंदींवरून हाताने पुन्हा टाइप केलेलं; वरची तक्रार आम्ही स्वतः लिहिली आहे, कुणाच्या प्रकरणातून घेतलेली नाही.`,
  tryComplaintLabel: 'नागरिकाने काय मागितलं होतं',
  tryReplyLabel: 'विभागाने काय उत्तर लिहिलं',
  tryComplaintPlaceholder: 'मे महिन्यापासून माझी पेन्शन बंद आहे आणि कुणीही कारण सांगितलेलं नाही…',
  tryReplyPlaceholder: 'हे प्रकरण संबंधित विभागाकडे पाठवण्यात आलं आहे…',
  tryJudge: 'हे उत्तर तपासा',
  tryReadingButton: 'वाचलं जात आहे…',
  tryTimeNote:
    'स्वतःचा मजकूर चिकटवला की तपासणी त्याच क्षणी चालते, आणि त्याला वेळ लागतो: आम्ही जितक्या वेळा मोजलं, त्यात सर्वात कमी आठ सेकंद आणि सर्वात जास्त अठरा सेकंद लागले. काहीही शोधून आणलं जात नाही — एक मॉडेल तक्रारीसमोर ठेवून उत्तर वाचतं, आणि मग ते जे अवतरण दाखवू पाहतं ते निकाल दिसण्याआधी तुमच्या मजकुराशी अक्षर न् अक्षर पडताळलं जातं.',
  tryTimeNoteChip:
    'हे उदाहरण आधीच तपासलं गेलं आहे आणि त्याचा निकाल आमच्या कोड-फायलींमध्ये नोंदवलेला आहे, त्यामुळे तो आत्ता काढला जात नाही — लगेच दिसतो. यात एक अक्षर जरी बदललं, किंवा स्वतःचं उत्तर चिकटवलं, तर तपासणी त्याच क्षणी चालेल — आम्ही मोजलेल्या वेळांत त्याला आठ ते अठरा सेकंद लागले.',
  tryBusyStatus: 'वाचलं जात आहे. आम्ही मोजलेल्या वेळांत सर्वात कमी आठ आणि सर्वात जास्त अठरा सेकंद लागले.',
  tryBusyDetail:
    'या वेळात दोन गोष्टी होतात आणि आत्ता कोणती चालू आहे हे आम्हाला दिसत नाही: मॉडेल तक्रारीसमोर ठेवून उत्तर वाचतं, आणि मग अवतरण-पहारा त्याचं प्रत्येक अवतरण तुमच्या मजकुराशी पडताळतो — अवतरण तंतोतंत नसेल तर त्याला पुन्हा करायला परत पाठवतो.',
  tryTook: (seconds) => `तुम्ही दाबल्यापासून मोजून यास ${seconds} सेकंद लागले.`,
  tryTookPrecomputed: (seconds) =>
    `यास ${seconds} सेकंद लागले कारण उत्तर आधीपासून आमच्या फायलींमध्ये नोंदवलेलं होतं — तपासणी इतकी वेगवान आहे म्हणून नाही.`,
  tryPrecomputed:
    'हा निकाल आत्ता काढलेला नाही. ही याच मजकुराची खरी तपासणी आहे, जी आधी चालवली गेली आणि आमच्या कोड-फायलींमध्ये नोंदवली गेली — तेच मॉडेल, तेच निर्देश, आणि खालची अवतरणं त्याच वेळी याच मजकुराशी अक्षर न् अक्षर पडताळली गेली होती. दोन्हींपैकी काहीही बदला, किंवा स्वतःचं उत्तर चिकटवा, तपासणी त्याच क्षणी चालेल.',
  tryFailed:
    'हे झालं नाही. तुम्ही जे चिकटवलं त्याची प्रत आम्ही ठेवलेली नाही — पण ते वाचण्यासाठी OpenAI कडे पोहोचलं होतं, आणि ते परत घेता येत नाही.',
  tryQuoted: 'तुम्ही चिकटवलेल्या मजकुरातून उद्धृत',
  tryCheckedLine: (verified, retries) =>
    `यातलं प्रत्येक अवतरण, निकाल दाखवण्याआधी, तुमच्या मजकुराशी अक्षर न् अक्षर पडताळलं गेलं. पडताळलं: ${verified ? 'हो' : 'नाही'}${retries > 0 ? ` · मॉडेलला ${retries} वेळा परत पाठवावं लागलं` : ''}`,
  tryUnaddressed: 'कशाचं उत्तर दिलं नाही',
  tryInjection:
    'त्या मजकुराने आमच्या तपासणीला सूचना देण्याचा प्रयत्न केला. आम्ही तो पुरावा मानून त्याच्या आशयावरच तपासला — पण प्रयत्न झाला होता हे तुम्हाला कळायला हवं.',
  tryNotScore:
    'हा निकाल म्हणजे आकडा नाही. खऱ्या प्रकरणात मोजलं जातं ते नागरिकाचं स्वतःचं उत्तर — “तुमची अडचण खरंच दूर झाली का?” — आमचं म्हणणं नाही.',
  tryReasoningLang: 'हे आमच्या तपासणीचं स्वतःचं म्हणणं आहे, इंग्रजीत — इथे त्याचं भाषांतर केलं जात नाही.',
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
