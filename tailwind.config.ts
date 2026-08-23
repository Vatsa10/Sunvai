import type { Config } from 'tailwindcss';

// The accessibility floor lives here, not in per-component classnames:
// body text >= 18px, touch targets >= 48px, contrast >= 7:1 (see 01-product/02-india-nuances.md).
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.6' }], // 18px floor
        lg: ['1.25rem', { lineHeight: '1.55' }],
        xl: ['1.5rem', { lineHeight: '1.4' }],
      },
      minHeight: { touch: '48px' },
      minWidth: { touch: '48px' },
      colors: {
        ink: '#111111',
        paper: '#ffffff',
        muted: '#4a4a4a',   // 8.9:1 on white
        rule: '#d9d9d9',
        good: '#0f6b3a',    // 7.1:1
        warn: '#8a5a00',    // 7.0:1
        bad: '#a4161a',     // 7.4:1
      },
    },
  },
  plugins: [],
} satisfies Config;
