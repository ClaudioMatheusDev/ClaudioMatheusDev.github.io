# Portfólio · Claudio Matheus

Portfólio e documentação técnica dos meus projetos como desenvolvedor backend .NET.

- **Portfólio:** <https://claudiomatheusdev.github.io/>
- **Documentação:** <https://claudiomatheusdev.github.io/docs/>

## Estrutura

```text
.
├── index.html              Página do portfólio (HTML, CSS e JS sem framework)
├── assets/
│   ├── css/styles.css      Estilos, com tema claro e escuro
│   ├── js/script.js        Tema, menu mobile e animações
│   └── img/                Favicon, logo e imagem de compartilhamento
├── minha-docs/             Documentação em Docusaurus (servida em /docs/)
└── .github/workflows/
    └── deploy.yml          Build e publicação no GitHub Pages
```

## Rodar localmente

Portfólio (qualquer servidor estático):

```bash
python -m http.server 8080
```

Documentação:

```bash
cd minha-docs
npm ci
npm start
```

## Deploy

A cada push na `main`, o workflow [deploy.yml](.github/workflows/deploy.yml) compila o Docusaurus,
junta o build com o portfólio (docs em `/docs/`) e publica no GitHub Pages.
Em pull requests ele só compila, para validar links e tipos.

## Contato

- GitHub: [@ClaudioMatheusDev](https://github.com/ClaudioMatheusDev)
- LinkedIn: [Claudio Matheus](https://www.linkedin.com/in/claudio-matheus-814420278/)
- E-mail: claudiomatheus055@gmail.com
