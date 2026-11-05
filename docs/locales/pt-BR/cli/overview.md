---
title: "CLI do Jigsaw: extraia dados pelo terminal"
description: "Instale as ferramentas de terminal do Jigsaw e escolha entre os comandos de extração, o shell interativo e o servidor MCP. Siga o guia da sua tarefa."
---

# Interface de linha de comando {#command-line-interface}

Desde a versão 0.3, o Jigsaw inclui uma interface de linha de comando com três funções principais:

1. **Shell interativo**: Um ambiente de extração de dados web baseado em IPython, com vários atalhos e ferramentas úteis.
2. **Comandos de extração**: Extraia dados de sites pelo terminal sem programar.
3. **Comandos utilitários**: Ferramentas de instalação e gerenciamento.

```bash
# Launch interactive shell
jigsaw shell

# Convert the content of a page to markdown and save it to a file
jigsaw extract get "https://example.com" content.md

# Get help for any command
jigsaw --help
jigsaw extract --help
```

## Requisitos {#requirements}

Para usar as ferramentas desta seção, instale o grupo de dependências extras `shell`:
```bash
pip install "jigsaw[shell]"
```
Para obter páginas com um navegador, instale também as dependências dele:
```bash
jigsaw install
```
Esse comando baixa o Chromium e suas dependências de sistema, além de atualizar a lista de TLDs. As solicitações HTTP não precisam dessa etapa.
