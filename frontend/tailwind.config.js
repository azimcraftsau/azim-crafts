/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vw-dark': '#131313',
        'vw-text': '#131313',
        'vw-heading': '#131313',
        'vw-accent-gold': '#ae2828',
        'vw-btn': '#1b1a1a',
        'vw-btn-hover': '#333333',
        'vw-accent-1': '#f7eddb',
        'vw-accent-2': '#3F5147',
        'vw-card-border': 'rgba(19, 19, 19, 0.08)',
        'vw-muted': '#757575',
        'vw-price': '#131313',
        'vw-soldout': '#757575',
      },
      fontFamily: {
        'heading': ['"Titillium Web"', 'sans-serif'],
        'body': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'menu': ['"Work Sans"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 10px 30px rgba(0, 0, 0, 0.12)',
        'drawer': '0 0 50px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        'page': '1200px',
        'page-wide': '1440px',
      }
    },
  },
  plugins: [],
}
