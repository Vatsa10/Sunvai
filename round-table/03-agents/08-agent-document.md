# Agent — Document

> Part of the [Sunvai Round Table](../README.md). Priority **P2** — first to cut.

## Job

Read a photographed document, extract what the grievance needs, and — most importantly —
**tell the citizen it is unusable *before* they file**, not three weeks later as a rejection.

## The friction it addresses

A rejected claim letter, a pension order, a receipt: photographed at an angle, in poor
light, possibly in Devanagari, Bengali or Telugu, often with the critical line cut off.
Today this class of failure surfaces weeks later as an unexplained rejection
([`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md#7-the-document-is-a-blurry-photo-sideways-in-a-regional-script)).

## Contract

```ts
document({ image: Blob, expectedKind?: string, citizenLang: Lang }) => {
  readable: boolean;
  kind: string | null;              // 'pf_rejection' | 'pension_order' | 'receipt' | ...
  extracted: Record<string, string>;
  missingRegions: string[];         // what is cut off or illegible
  retakeInstruction: string | null; // SPECIFIC, in the citizen's language
}
```

## Rules

**`retakeInstruction` must be specific and actionable.** *"The number at the bottom is cut
off — take it again including the last line"* is useful. *"Image quality is poor"* is not.
This single string is most of the agent's value.

**Never guess an unreadable value.** A hallucinated reference number in a filed grievance is
worse than an absent one — it can get the case dismissed on its own terms, and the citizen
bears that. Unreadable is a real answer.

**Extract only what the grievance needs.** Reference numbers, dates, amounts, the stated
reason for a rejection. Not everything on the page. We are not building a document store.

**Never store an identity number.** If the document contains an Aadhaar or PAN number, it is
**not extracted and not persisted** — the field is skipped and the citizen is told we
deliberately ignored it. See [`../00-mission/05-non-goals.md`](../00-mission/05-non-goals.md).
In this build all documents are synthetic anyway
([`../04-build/03-mock-data.md`](../04-build/03-mock-data.md)), but the rule is written into
the agent so it holds if the code ever meets a real one.

## Model and settings

Vision tier. `temperature: 0`. Images downscaled client-side before upload — our users pay
for data ([`../01-product/02-india-nuances.md`](../01-product/02-india-nuances.md#4-2g-patchy-signal-and-expensive-data)).

## Cut guidance

**P2, and the first thing to cut.** It only appears on the Door B path, which is already the
non-differentiating half of the journey. If it is cut, the attachment upload stays and the
file is simply passed through unread, with the UI saying so honestly.

**Next:** [`09-prompts-and-contracts.md`](09-prompts-and-contracts.md)
