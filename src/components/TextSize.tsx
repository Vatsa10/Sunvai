'use client';

import { useEffect, useState } from 'react';

/**
 * A persistent text-size control.
 *
 * Not a novelty: the median user of a pension grievance service is over fifty. Browser zoom
 * exists, but a lot of people do not know it exists, and asking someone to find it is asking
 * them to leave. The choice is remembered per device.
 */

const SIZES = [
  { key: 'normal', label: 'A', title: 'Normal text' },
  { key: 'large', label: 'A', title: 'Larger text' },
  { key: 'xlarge', label: 'A', title: 'Largest text' },
] as const;

const CLASS = ['text-base', 'text-xl', 'text-2xl'];

export function TextSize() {
  const [size, setSize] = useState<string>('normal');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sunvai:textsize');
      if (saved) {
        setSize(saved);
        document.documentElement.dataset.textsize = saved;
      }
    } catch {
      // Private window, or site data blocked. The default size is fine; nothing to recover.
    }
  }, []);

  function choose(key: string) {
    setSize(key);
    document.documentElement.dataset.textsize = key;
    try {
      localStorage.setItem('sunvai:textsize', key);
    } catch {
      // Preference not remembered on this device. It still applies for this visit.
    }
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      {SIZES.map((s, i) => (
        <button
          key={s.key}
          type="button"
          onClick={() => choose(s.key)}
          aria-pressed={size === s.key}
          title={s.title}
          className={`flex h-touch min-h-touch w-touch min-w-touch items-center justify-center rounded border font-semibold ${CLASS[i]} ${
            size === s.key ? 'border-ink bg-ink text-paper' : 'border-rule text-ink'
          }`}
        >
          {s.label}
          <span className="sr-only">{s.title}</span>
        </button>
      ))}
    </div>
  );
}
