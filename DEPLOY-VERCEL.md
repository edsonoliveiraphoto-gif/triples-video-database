# Como publicar o tripleS Video Database na Vercel (guia passo a passo)

Você vai colocar o site no ar em um link permanente, gratuito e com HTTPS, algo como:

```
https://triples-video-database.vercel.app
```

O site é 100% estático (os dados vivem no arquivo `public/data/contents.json`): não usa banco de dados, não usa variáveis de ambiente e não tem custo — o plano **Hobby (grátis)** da Vercel é suficiente, sem cartão de crédito.

Antes de começar, descompacte `triples-video-database.zip` em uma pasta do seu computador. Vai surgir a pasta `triples-video-database` com o projeto dentro.

---

## Caminho A — GitHub + Vercel (recomendado)

Vantagem: depois de configurado, qualquer alteração no GitHub publica o site sozinho.

### A1. Crie o repositório no GitHub

1. Acesse [github.com](https://github.com) e crie uma conta (se ainda não tiver) — também é grátis.
2. Clique no botão **+** (canto superior direito) e depois em **New repository**.
3. Preencha:
   - **Repository name**: `triples-video-database`
   - Deixe **Public** (ou Private, se preferir — funciona igual na Vercel)
4. Clique em **Create repository**.
5. Na tela seguinte ("Quick setup"), clique no link **"uploading an existing file"**.

### A2. Suba os arquivos

1. Abra a pasta `triples-video-database` que você descompactou.
2. Entre nela e selecione **todo o conteúdo que está DENTRO dela** — no Windows `Ctrl+A`, no Mac `Cmd+A`.
   - IMPORTANTE: arraste o conteúdo, não a pasta em si. Se você arrastar a pasta inteira, o `package.json` fica "escondido" dentro de uma subpasta e a Vercel não encontra o projeto.
3. Arraste tudo para a área de upload do GitHub e aguarde o upload (o maior arquivo é o `contents.json`, ~5 MB).
   - O GitHub aceita até 100 arquivos por vez; este projeto tem ~85, então um único arraste resolve. Se por algum motivo ele reclamar, arraste primeiro a pasta `src`, depois `public`, e por fim os arquivos soltos.
4. Role até a base da página, escreva algo em "Commit changes" (ex.: "primeira versão") e clique em **Commit changes**.

### A3. Importe na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (você já tem a conta).
2. No dashboard, clique em **Add New...** e depois em **Project**.
3. Se for a primeira vez, clique em **Continue with GitHub** e autorize o acesso da Vercel ao GitHub quando o navegador pedir.
4. Na lista "Import Git Repository", localize `triples-video-database` e clique em **Import**.
5. **Não altere nada nas configurações**: a Vercel detecta sozinha o framework (Next.js), o comando de build e tudo o mais. Só confirme que o campo "Root Directory" está vazio.
6. Clique em **Deploy** e aguarde 1 a 2 minutos (a primeira build instala as dependências e leva um pouco mais; as próximas são mais rápidas).
7. Pronto: a página vai mostrar o link do seu site. Anote-o — ele é permanente, funciona 24 horas por dia e compartilha normalmente no WhatsApp/Twitter/Discord.

### A4. Para atualizar o site depois

- Envie os arquivos alterados ao GitHub (na página do repositório, o mesmo caminho de upload, ou edite o arquivo pela web com o lápis) — a Vercel re-publica sozinha em segundos.
- Exemplo de atualização de dados: substitua `public/data/contents.json` por uma exportação nova da base e salve o commit.

---

## Caminho B — Terminal com a CLI da Vercel (sem GitHub)

Para quem prefere linha de comando (opcional, não é obrigatório).

1. Instale o [Node.js LTS](https://nodejs.org) (botão de download verde, next-next-finish).
2. Abra o terminal **dentro da pasta** `triples-video-database`:
   - Windows: segure `Shift` e clique com o botão direito dentro da pasta → "Abrir PowerShell aqui" (ou cmd).
3. Instale a CLI e conecte sua conta:

```bash
npm install -g vercel
vercel login
```

4. Publique:

```bash
vercel --prod
```

5. Confirme as perguntas com Enter (defaults: projeto novo, diretório atual). No fim o link aparece no terminal.

Para atualizar depois: substitua os arquivos na pasta e rode `vercel --prod` de novo.

---

## Domínio próprio (opcional)

No dashboard da Vercel: **Project → Settings → Domains → Add**. Um subdomínio `www.seudominio.com` é grátis; a Vercel emite e renova o certificado HTTPS sozinha.

---

## Problemas comuns

| Sintoma | O que fazer |
| --- | --- |
| Build falha em "Installing dependencies" | Project → Settings → General → **Install Command** → `bun install` → Redeploy. |
| Deploy termina mas o link dá 404 | O `package.json` foi parar numa subpasta. No GitHub, ele precisa estar na raiz do repositório. Refaça o upload selecionando o conteúdo interno da pasta. |
| "The file contents.json is too large" | Não vai acontecer (5 MB, e o limite por arquivo é 100 MB). Se aparecer, o arquivo foi corrompido no upload — suba de novo. |
| Quero mudar o nome do link | Project → Settings → **Change Project Name**. O domínio `.vercel.app` segue o nome. |

## O que ficou fora do pacote de propósito

- `node_modules` e `.next`: gerados de novo no build da Vercel — nunca devem ser enviados.
- `.env`: não existe segredo nenhum neste site; se algum dia você criar um, nunca o envie ao GitHub.
- Watchlist: fica no navegador de cada visitante (localStorage), e a importação de CSV usa IndexedDB — nada disso muda com o deploy.
