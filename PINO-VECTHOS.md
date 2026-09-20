# Por que esta branch existe

Esta é a branch que o plugin `vecthos-ops` executa, e ela **não é para ser lida como
código**: ela é `biblioteca-e-refluxo` mais o `dist/` compilado junto.

O motivo é prático. O plugin sobe o canvas por `npx` direto do GitHub, e este projeto
não tem script de build na instalação — sem o `dist` pronto, cada primeira execução
teria que instalar 546 pacotes e compilar, uns 90 segundos, com risco real de estourar o
tempo de inicialização do servidor MCP e o canvas simplesmente não subir.

**Esta branch morre quando o PR entrar.** O conserto está em
https://github.com/yctimlin/mcp_excalidraw/pull/113 — aceito lá, o plugin volta a puxar
`mcp-excalidraw-server` do npm e esta branch e o fork inteiro podem ser apagados.

Para regerar o `dist` depois de mexer no código:

    npm install && npm run build && git add -f dist && git commit
