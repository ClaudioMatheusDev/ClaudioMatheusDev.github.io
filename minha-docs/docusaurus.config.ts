import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Executa em Node.js — não use APIs de navegador aqui.

const GITHUB = 'https://github.com/ClaudioMatheusDev';
const LINKEDIN = 'https://www.linkedin.com/in/claudio-matheus-814420278/';
const PORTFOLIO = 'https://claudiomatheusdev.github.io/';

const config: Config = {
  title: 'Claudio Matheus · Docs',
  tagline: 'Documentação técnica dos meus projetos backend .NET',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  // Publicado em https://claudiomatheusdev.github.io/docs/ junto com o portfólio
  url: 'https://claudiomatheusdev.github.io',
  baseUrl: '/docs/',
  organizationName: 'ClaudioMatheusDev',
  projectName: 'ClaudioMatheusDev.github.io',
  trailingSlash: true,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  ],

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        // Modo "somente docs": a documentação é a página inicial de /docs/
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: `${GITHUB}/ClaudioMatheusDev.github.io/tree/main/minha-docs/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    metadata: [
      {name: 'author', content: 'Claudio Matheus'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: 'Claudio Matheus',
      logo: {
        alt: 'Logo Claudio Matheus',
        src: 'img/logo.png',
        href: PORTFOLIO,
        target: '_self',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Projetos',
        },
        {
          href: PORTFOLIO,
          label: 'Portfólio',
          position: 'left',
          target: '_self',
        },
        {
          href: GITHUB,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            {label: 'Início', to: '/'},
            {label: 'DataPulseCM', to: '/projetos/datapulsecm'},
            {label: 'ECommerceCM', to: '/projetos/ecommercecm'},
            {label: 'Work Session Tracker', to: '/projetos/work-session-tracker'},
          ],
        },
        {
          title: 'Contato',
          items: [
            {label: 'GitHub', href: GITHUB},
            {label: 'LinkedIn', href: LINKEDIN},
            {label: 'E-mail', href: 'mailto:claudiomatheus055@gmail.com'},
          ],
        },
        {
          title: 'Mais',
          items: [
            {label: 'Portfólio', href: PORTFOLIO},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Claudio Matheus`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['csharp', 'bash', 'powershell', 'json', 'sql', 'python'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
