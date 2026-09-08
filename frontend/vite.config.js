import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serwuje ten projekt pod adresem /roko-flow/, nie pod domeną głównego
  // konta (ikangela.github.io/) — bez tego linki do plików JS/CSS w zbudowanej stronie
  // wskazywałyby na zły adres i strona wyglądałaby na pustą/zepsutą. Tylko przy budowaniu
  // (`vite build`, używane przez workflow do GitHub Pages) — lokalny `npm run dev` ma
  // zostać pod zwykłym localhost:5173/, bez tego dopisku.
  base: command === 'build' ? '/roko-flow/' : '/',
}))
