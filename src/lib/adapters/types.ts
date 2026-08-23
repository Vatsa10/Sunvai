/**
 * The adapter boundary.
 *
 * Nothing outside src/lib/adapters/ may know which grievance system is on the other end.
 * Upstream code deals only in Grievance, Reply, Department. scripts/check-adapter-boundary.sh
 * fails CI if that leaks. Adding a new department is one file; the auditor, the ledger, the
 * clusters and the metric do not change, because none of them know what CPGRAMS is.
 */

export type Lang = 'hi' | 'en' | 'bn' | 'ta' | 'te' | 'mr';

export type ExternalStatus =
  | 'filed'
  | 'acknowledged'
  | 'assigned'
  | 'under_process'
  | 'replied'
  | 'closed'
  | 'appealed';

export type ExternalReply = {
  body: string;      // verbatim; the citation guard string-matches against this
  lang: Lang;
  receivedAt: string;
  isFinal: boolean;
};

export type ExternalCase = {
  ref: string;
  status: ExternalStatus; // normalised, for our logic
  rawStatus: string;      // the vendor's own word, preserved for display
  subject?: string;
  narrative?: string;
  narrativeLang?: Lang;
  department?: string;
  office?: string;
  replies: ExternalReply[];
  filedAt: string;
  closedAt?: string;
};

export type FiledGrievance = {
  formalText: string;
  subject: string;
  departmentId: string;
  officeId: string | null;
  citizenName: string;
  citizenLang: Lang;
};

export type DepartmentNode = {
  id: string;
  name: string;
  shortName: string;
  categoryPath: string[];
  offices: { id: string; name: string; state: string; district?: string }[];
};

export interface GrievanceSystemAdapter {
  readonly id: string;
  readonly displayName: string;
  /** Drives the UI mock badge. Never hardcode that badge — it has to be structural. */
  readonly isMock: boolean;

  /** Door A: look up a case the citizen already filed. */
  fetchCase(ref: string): Promise<ExternalCase | null>;
  /** Door B: file a new one. Called only after the consent gate. */
  file(input: FiledGrievance): Promise<{ ref: string; filedAt: string }>;
  /** Appeal an inadequate closure. Also only after the consent gate. */
  appeal(ref: string, body: string): Promise<{ appealRef: string; filedAt: string }>;
  poll(ref: string): Promise<ExternalCase | null>;
  /** The routing taxonomy this system understands. The Router never hardcodes one. */
  taxonomy(): Promise<DepartmentNode[]>;
  /** Declared SLAs, so no clock in our logic is a magic number. */
  slas(): Promise<{ replyDays: number; appealDays: number }>;
}

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`${what} requires an official integration agreement — see round-table/02-architecture/04-adapters.md`);
    this.name = 'NotImplementedError';
  }
}
