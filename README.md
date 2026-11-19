# tripleS Video Database Explorer

Explorador da [tripleS video database](https://wavsteph.notion.site/tripleS-video-database-080d0d30618040159bd9a01919516d94) (by Steph, @wavsteph): 6.700+ videos de SIGNAL, variedade, fancams e lives, navegáveis com filtros por tipo, era, temporada, canal, legendas e membros (S1 a S24).

- **Busca instantânea** em título, palavras-chave e notas
- **Filtros combináveis**: membro, era, ano, temporada, canal, ENG SUB
- **Watchlist** salva no navegador (localStorage)
- **Tabela de estatísticas** por membro e por era
- **Importação de CSV** alternativa (via IndexedDB)

Feito com Next.js 16, React 19, Tailwind CSS 4, shadcn/ui e Zustand. Os dados ficam em `public/data/contents.json` (estático) — o site roda sem servidor, sem banco e sem variáveis de ambiente.

## Desenvolvimento

```bash
bun install    # ou npm install
bun run dev    # http://localhost:3000
```

## Produção

```bash
bun run build
bun run start
```

## Atualizar os dados

Substitua `public/data/contents.json` por uma exportação nova da base e faça o deploy novamente. A watchlist do usuário fica no navegador dele (localStorage) e não é afetada.

## Créditos

Base de dados compilada por Steph (@wavsteph). Este projeto é apenas uma interface de navegação, sem hospedar os videos — todos os links apontam para os canais oficiais.
