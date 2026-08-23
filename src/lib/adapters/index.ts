/**
 * Adapter selection. Everything outside this folder imports `adapter` from here and never
 * names a vendor.
 *
 * This is what makes "adding EPFO is one file" a true statement rather than a slide. The rest
 * of the system — the auditor, the ledger, the clusters, the metric — has no idea what it is
 * talking to.
 */

import { MockCPGRAMSAdapter } from './mock-cpgrams';
import type { GrievanceSystemAdapter } from './types';

const REGISTRY: Record<string, () => GrievanceSystemAdapter> = {
  mock: () => new MockCPGRAMSAdapter(),
  // official: () => new CPGRAMSOfficialAdapter(),   ← blocked on an access agreement, not on code
  // epfo:     () => new EPFOAdapter(),
  // state:    () => new StatePortalAdapter(),
};

const selected = process.env.GRIEVANCE_SYSTEM ?? 'mock';
const make = REGISTRY[selected];
if (!make) throw new Error(`unknown GRIEVANCE_SYSTEM: ${selected}`);

export const adapter: GrievanceSystemAdapter = make();
export type { GrievanceSystemAdapter } from './types';
