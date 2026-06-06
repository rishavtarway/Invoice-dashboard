/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F7F5',
        surface: '#FFFFFF',
        border: '#E5E3DF',
        muted: '#9B9690',
        ink: '#1A1916',
        inkSecondary: '#6B6860',
        statusPaid: '#166534',
        statusPaidBg: '#DCFCE7',
        statusUnpaid: '#92400E',
        statusUnpaidBg: '#FEF3C7',
        statusOverdue: '#991B1B',
        statusOverdueBg: '#FEE2E2',
        statusDraft: '#374151',
        statusDraftBg: '#F3F4F6',
        statusSent: '#1E40AF',
        statusSentBg: '#DBEAFE',
        statusVoid: '#6B7280',
        statusVoidBg: '#F9FAFB',
        accent: '#1A1916',
        accentHover: '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        base: ['14px', '20px'],
      },
      boxShadow: {
        overlay: '0 10px 30px -10px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
