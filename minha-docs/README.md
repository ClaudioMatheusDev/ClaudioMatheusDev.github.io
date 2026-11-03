# Documentação dos projetos

Site de documentação feito com [Docusaurus](https://docusaurus.io/), publicado em
<https://claudiomatheusdev.github.io/docs/>.

## Rodar localmente

```bash
npm ci
npm start        # servidor de desenvolvimento em http://localhost:3000/docs/
npm run build    # gera o site estático em ./build
npm run typecheck
```

## Adicionar um projeto

1. Crie uma pasta em `docs/projetos/<NomeDoProjeto>/`.
2. Adicione um `_category_.json` com `label`, `position` e `link` apontando para a página principal.
3. Na página principal, defina `slug: /projetos/<nome-em-minusculas>` no front matter.
4. Adicione o projeto na tabela de `docs/intro.md` e, se quiser, como card no `index.html` da raiz.
