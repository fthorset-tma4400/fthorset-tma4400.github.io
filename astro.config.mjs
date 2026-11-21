import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import studyCompanion from "study-companion";

// Eget tema: laster theme/apple.css på alle sider. Filen overstyrer bare
// rammeverkets design-tokens og noen få knappe- og overskriftsregler.
const themeCss = fileURLToPath(new URL("./theme/apple.css", import.meta.url));
const courseTheme = {
  name: "course-theme",
  hooks: {
    "astro:config:setup": ({ injectScript }) => {
      injectScript("page-ssr", `import ${JSON.stringify(themeCss)};`);
    },
  },
};

// The integration injects all pages, the MDX+KaTeX pipeline, and the Pagefind
// search index. The only thing a course declares here is its canonical origin.
export default defineConfig({
  // REQUIRED: this guide's public origin (no trailing path). The framework reads
  // it for the canonical link, Open Graph / Twitter cards and the sitemap — set
  // it to your real deploy URL. Without it those absolute-URL features are
  // skipped (with a dev warning).
  site: "https://fthorset-tma4400.github.io",
  integrations: [studyCompanion(), courseTheme],
});
