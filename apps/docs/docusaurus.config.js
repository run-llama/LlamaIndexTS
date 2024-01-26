// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const renderer = require("prism-react-renderer");
const lightCodeTheme = renderer.themes.github;
const darkCodeTheme = renderer.themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "LlamaIndex.TS",
  tagline: "Unleash the power of LLMs over your data in TypeScript",
  favicon: "img/favicon.png",

  // Set the production url of your site here
  url: "https://ts.llamaindex.ai",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "run-llama", // Usually your GitHub org/user name.
  projectName: "LlamaIndex.TS", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: [
      "en",
      "zh-Hans",
      "es",
      "fr",
      "de",
      "ja",
      "ko",
      "pt",
      "ar",
      "it",
      "tr",
      "pl",
      "nl",
      "vi",
      "th",
    ], // "fa", "ru", "ro", "sv", "hu", "cs", "el", "da", "fi", "he", "no", "hi", "in", "sl", "se", "sk", "uk", "bg", "hr", "lt", "lv", "et", "cat"
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
        },
        blog: false,
        gtag: {
          trackingID: "G-NB9B8LW9W5",
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/favicon.png", // TODO change this
      navbar: {
        title: "LlamaIndex.TS",
        logo: {
          alt: "LlamaIndex.TS",
          src: "img/favicon.png",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "mySidebar",
            position: "left",
            label: "Docs",
          },
          {
            type: "localeDropdown",
            position: "left",
          },
          {
            href: "https://github.com/run-llama/LlamaIndexTS",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "API",
                to: "/api",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.com/invite/eN6D2HQ4aX",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/LlamaIndex",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/run-llama/LlamaIndexTS",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} LlamaIndex. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: "DYKPM6G4CX",

        // Public API key: it is safe to commit it
        apiKey: "c4ff3789f20bb72a5d735082aef17719",

        indexName: "ts-llamaindex",

        // Optional: see doc section below
        contextualSearch: true,
      },
    }),
  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: ["../../packages/core/src/index.ts"],
        tsconfig: "../../packages/core/tsconfig.json",
        readme: "none",
        sourceLinkTemplate:
          "https://github.com/run-llama/LlamaIndexTS/blob/{gitRevision}/{path}#L{line}",
        sidebar: {
          position: 6,
        },
      },
    ],
  ],
  markdown: {
    format: "detect",
  },
};

module.exports = config;
