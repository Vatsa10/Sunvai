'use client';

import { useEffect } from 'react';
import { saveCase } from '@/lib/local-cases';

/**
 * Mounted inside the case page, which is a server component and stays one. This exists only so
 * that arriving at a case — by any route, including a link someone sent — is what puts it on
 * the device's list. Renders nothing.
 */
export function RememberCase({ caseRef, subject }: { caseRef: string; subject: string | null }) {
  useEffect(() => {
    saveCase({ ref: caseRef, subject });
  }, [caseRef, subject]);

  return null;
}
