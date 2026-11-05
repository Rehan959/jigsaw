---
title: "Agent Skill de Jigsaw : installation et utilisation"
description: "Installez la skill Jigsaw pour votre agent de programmation. Donnez-lui des exemples et des références de l’API actuelle pour récupérer des pages, extraire des données et explorer des sites."
---

# Agent Skill de Jigsaw {#jigsaw-agent-skill}

Le [serveur MCP](mcp-server.md) donne aux chatbots IA des outils pour extraire des données sur le Web. L’**Agent Skill de Jigsaw** apprend aux agents de programmation à utiliser la bibliothèque elle-même. Le code qu’ils écrivent avec Jigsaw suit ainsi l’API actuelle, sans dépendre d’informations anciennes issues de leur entraînement.

La skill suit la spécification [AgentSkills](https://agentskills.io/specification). Elle peut donc être lue par [Claude Code](https://claude.com/product/claude-code), [OpenClaw](https://github.com/openclaw/openclaw) et d’autres outils à base d’agents. Elle contient des guides en Markdown sur la récupération de pages, l’analyse, l’exploration de sites, MCP et RAG. L’agent les charge quand il en a besoin. Des exemples prêts à exécuter lui permettent aussi de répondre à la plupart des questions sur Jigsaw et d’écrire du code d’extraction correct sans quitter votre éditeur.

La skill se trouve dans le dossier agent-skill du dépôt, sous le nom `jigsaw-official`. Sa version suit toujours celle de la bibliothèque.

## Installation {#installation}

### Skills.sh {#skillssh}

Installez la skill depuis le dépôt avec la CLI de [skills.sh](https://skills.sh) :
```bash
```
La CLI détecte les agents installés et leur ajoute la skill.

### Clawhub {#clawhub}

Si vous utilisez OpenClaw, vous pouvez installer la skill avec [Clawhub](https://docs.openclaw.ai/tools/clawhub) :
```bash
```
Ou installez-la depuis sa page Clawhub.

### Téléchargement manuel {#manual-download}

Téléchargez le fichier ZIP de la skill directement depuis le dépôt, puis extrayez son contenu dans le dossier des skills de votre agent. Pour Claude Code, il s’agit de `~/.claude/skills/`.

## Contenu de la skill {#whats-inside}

- **`SKILL.md`** : Le premier fichier que l’agent lit. Il présente la configuration, le choix du fetcher et les règles de sécurité à suivre. Par exemple, toujours passer `--ai-targeted` aux commandes de la CLI pour se protéger contre l’injection d’instructions.
- **`references/`** : Des copies en Markdown des pages de documentation sur l’analyse, la récupération de pages, les spiders, le serveur MCP et les intégrations. Elles sont chargées à la demande pour ne pas occuper le contexte de l’agent avant d’être utiles.
- **`examples/`** : Des scripts prêts à exécuter dont l’agent peut s’inspirer.

