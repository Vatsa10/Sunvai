# Adapters — the harness interface

> Part of the [Sunvai Round Table](../README.md).
> This is the document that makes *"a general layer, proven on one vertical"* a true claim
> rather than a slogan. It is also our answer to *"how could this work safely at a larger
> scale?"*

---

## The constraint that produces the design

The brief prohibits accessing, testing or interfering with live government systems, and
prohibits reverse-engineering private systems or undocumented private APIs.

So we cannot call CPGRAMS. Good — **we should not want to.** A prototype that scrapes
pgportal.gov.in would demo well and could never ship: it breaks when the markup changes, it
cannot be operated at scale, it violates the terms of the system it depends on, and it
answers *"how does this work in production?"* with *"it doesn't."*

The correct answer is an **interface with one honest implementation and several named,
unbuilt ones.** That turns a restriction into an architecture, and it is exactly what
"end-to-end thinking" is asking for.

---

## `GrievanceSystemAdapter`

The single boundary between Sunvai and any grievance system. **No code outside
`lib/adapters/` may know that CPGRAMS exists.**

```ts
export interface GrievanceSystemAdapter {
  readonly id: string;              // 'mock_cpgrams' | 'cpgrams_official' | ...
  readonly displayName: string;
  readonly isMock: boolean;         // drives the UI mock badge — never hardcode that badge

  /** Look up an existing case by its registration number. Door A. */
  fetchCase(ref: string): Promise<ExternalCase | null>;

  /** File a new grievance. Door B. Called only after the citizen consent gate. */
  file(input: FiledGrievance): Promise<{ ref: string; filedAt: string }>;

  /** File an appeal against an inadequate closure. */
  appeal(ref: string, body: string): Promise<{ appealRef: string; filedAt: string }>;

  /** Poll for state changes. Push-capable systems may implement subscribe() instead. */
  poll(ref: string): Promise<ExternalCase | null>;

  /** The routing taxonomy this system understands — consumed by the Router Agent. */
  taxonomy(): Promise<DepartmentNode[]>;

  /** Declared SLAs, so clocks are never hardcoded in our logic. */
  slas(): Promise<{ replyDays: number; appealDays: number }>;
}

export interface ExternalCase {
  ref: string;
  status: ExternalStatus;           // normalised, not the vendor's word
  rawStatus: string;                // the vendor's word, preserved for display
  subject?: string;
  narrative?: string;
  department?: string;
  office?: string;
  replies: { body: string; lang: string; receivedAt: string; isFinal: boolean }[];
  filedAt: string;
  closedAt?: string;
}
```

**Two design notes that matter:**

`status` **and** `rawStatus`. We normalise for our logic and preserve the original for the
citizen, because [we always show the source](../01-product/02-india-nuances.md#10-distrust-is-the-baseline-and-it-is-earned).
Normalising away the department's actual word would be exactly the kind of quiet
substitution this product exists to oppose.

`isMock` **is a property of the adapter.** The UI mock badge reads from it. Nobody can ship
a real integration and forget to remove a hardcoded badge, and nobody can remove the badge
while still on mock data. Honesty is enforced structurally, not remembered.

---

## Implementations

| Adapter | Status | What it is |
|---|---|---|
| **`MockCPGRAMSAdapter`** | ✅ **Built** | A faithful simulation of CPGRAMS behaviour over our own Postgres, including its failure modes |
| `CPGRAMSOfficialAdapter` | 🔲 Stub | The production path — official integration, see below |
| `StatePortalAdapter` | 🔲 Stub | State grievance portals |
| `EPFOAdapter` | 🔲 Stub | Shows the harness generalises beyond grievances |
| `ConsumerHelplineAdapter` | 🔲 Stub | Adjacent redressal system |

Stubs are **real files implementing the interface**, with every method throwing
`NotImplementedError('Requires official integration — see docs/adapters')`. They are not
comments or wishes. A reader can open `CPGRAMSOfficialAdapter.ts` and see precisely what
would need to be filled in, which is the difference between an architecture and a
sentence in a pitch.

### `MockCPGRAMSAdapter` — simulating the failure, not the success

The mock is not a happy-path stand-in. **It reproduces the documented pathology**, because
a system that only sees good replies cannot demonstrate an audit.

It models: the real status vocabulary (`Under Process`, `Disposed`, `Closed with remarks`);
disposal with genuine boilerplate drawn from documented patterns — *"matter forwarded to
concerned department"*, *"noted for future action"*; closure with **no reason given at
all**, which the Parliamentary Committee found in many cases; the transfer chain
central → state → local; the 21-day reply SLA and 30-day appeal SLA; and the **"Poor" rating
gate** on appeals, so we can show on screen the door that Sunvai removes.

See [`../04-build/03-mock-data.md`](../04-build/03-mock-data.md) for the corpus.

---

## The production integration path

Named specifically, because *"we'd integrate officially"* is worth nothing without saying
how. This is what a real Sunvai would use — all of it existing Indian public digital
infrastructure:

| Need | Real mechanism |
|---|---|
| Case data, filing, appeals | **DARPG / CPGRAMS official integration.** CPGRAMS already exposes departmental integrations; a civic layer would need a formal read/write agreement — a *policy* step, not a technical one |
| Government API access generally | **API Setu** — the national API exchange |
| Documents | **DigiLocker** — issued documents with citizen consent, no uploads of scans |
| Identity | **Aadhaar e-KYC via UIDAI**, or DigiLocker-based identity — consented, never stored |
| Consent management | **DEPA / Account Aggregator consent-artefact pattern** — machine-readable, revocable, auditable |
| Language | **Bhashini** — the sovereign stack CPGRAMS already uses |
| Reach | **CSC / VLE network** (5 lakh+ centres) for assisted access; **UMANG** for distribution |

> **The honest framing:** the blocker on a production Sunvai is not technical. It is an
> access agreement with DARPG. The architecture assumes cooperation, not circumvention —
> which is both the only lawful path and the only one that survives contact with scale.

---

## `LanguageProvider`

Separated for the same reason, and because it lets us be honest about Bhashini.

```ts
export interface LanguageProvider {
  readonly id: string;
  transcribe(audio: Blob, hintLang?: Lang): Promise<{ text: string; lang: Lang }>;
  synthesize(text: string, lang: Lang): Promise<Blob>;
  translate(text: string, from: Lang, to: Lang): Promise<string>;
}
```

| Implementation | Status | Note |
|---|---|---|
| `OpenAILanguageProvider` | ✅ Built | Required by the hackathon brief |
| `BhashiniLanguageProvider` | 🔲 Stub | What production would use |

We make **no comparative quality claim** between them — we have run no benchmark. See
[`../00-mission/03-competitive-landscape.md`](../00-mission/03-competitive-landscape.md#bhashini-vs-openai--an-honest-note)
for the exact wording to use in the video.

---

## `ChannelAdapter`

```ts
export interface ChannelAdapter {
  readonly id: string;              // 'web' | 'whatsapp' | 'ivr'
  send(to: CitizenContact, message: OutboundMessage): Promise<void>;
  supportsAudio(): boolean;
  supportsRichLayout(): boolean;    // false ⇒ text must stand alone
}
```

| Implementation | Status | Why not built |
|---|---|---|
| `WebChannel` | ✅ Built | — |
| `WhatsAppChannel` | 🔲 Stub | Needs Meta Business verification and a number we cannot obtain in six days |
| `IVRChannel` | 🔲 Stub | Needs a telecom number and provider account |

`supportsRichLayout()` is why all copy must survive as plain text — see
[`../01-product/04-content-and-voice.md`](../01-product/04-content-and-voice.md#writing-for-a-channel-we-have-not-built).

---

## Adding a new department: the harness claim, made checkable

To extend Sunvai to a new grievance system:

1. Implement `GrievanceSystemAdapter` — one file.
2. Provide its `taxonomy()` and `slas()`.
3. Register it.

**Nothing else changes.** The Closure Auditor does not know which system produced a reply —
it reads text against a complaint. The ledger, clusters, appeals, confirmations and the
resolution metric are all system-agnostic by construction.

That is the harness claim, and the way to state it on video is as a fact about the code
rather than an aspiration:

> *"Adding EPFO is one file implementing one interface. The audit, the ledger, the
> clustering and the metric do not change — because none of them know what CPGRAMS is."*

---

## Verifying the boundary holds

A boundary maintained by intention decays. Enforce it:

```bash
# CI check: the only place that may mention CPGRAMS is lib/adapters/
grep -ril "cpgrams" --include="*.ts" --include="*.tsx" src/ \
  | grep -v "^src/lib/adapters/" \
  && echo "LEAK: vendor concept escaped the adapter boundary" && exit 1
```

If that check fails, the harness claim has quietly become false — which is worth catching
before a judge asks how general the system really is.

---

**Next:** [`05-scale-and-safety.md`](05-scale-and-safety.md) — what changes at national scale.
