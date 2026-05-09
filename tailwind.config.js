/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg:          '#0D0D14',
        surface:     '#131320',
        card:        '#1A1A2E',
        border:      '#252545',
        accent:      '#9945FF',
        'accent-dim':'#7B35CC',
        green:       '#14F195',
        orange:      '#FF9900',
        red:         '#FF5555',
        'text-primary':   '#FFFFFF',
        'text-secondary': '#8A8AAF',
        'text-muted':     '#50507A',
        divider:     '#1E1E38',
      },
      fontFamily: {
        sans:  ['System'],
        mono:  ['monospace'],
      },
      fontSize: {
        'xs':   ['13px', { lineHeight: '18px' }],
        'sm':   ['15px', { lineHeight: '22px' }],
        'base': ['17px', { lineHeight: '26px' }],
        'lg':   ['19px', { lineHeight: '28px' }],
        'xl':   ['22px', { lineHeight: '30px' }],
        '2xl':  ['26px', { lineHeight: '34px' }],
        '3xl':  ['32px', { lineHeight: '40px' }],
        '4xl':  ['38px', { lineHeight: '46px' }],
        '5xl':  ['52px', { lineHeight: '60px' }],
      },
    },
  },
  plugins: [],
}
