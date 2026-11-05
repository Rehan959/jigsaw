---
title: "Jigsaw Agent Skill: Installation und Nutzung"
description: "Installieren Sie den Jigsaw-Skill für Ihren Coding-Agenten. Geben Sie ihm aktuelle API-Beispiele und Referenzen zum Abrufen, Parsen und Crawlen von Seiten."
---

# Jigsaw Agent Skill {#jigsaw-agent-skill}

Der [MCP-Server](mcp-server.md) gibt KI-Chatbots Werkzeuge, um Daten von Websites zu extrahieren. Der **Jigsaw Agent Skill** bringt Coding-Agenten die Bibliothek selbst bei. So nutzt der Code, den sie mit Jigsaw schreiben, die aktuelle API statt veralteter Informationen aus ihren Trainingsdaten.

Der Skill folgt der [AgentSkills](https://agentskills.io/specification)-Spezifikation. Damit können ihn [Claude Code](https://claude.com/product/claude-code), [OpenClaw](https://github.com/openclaw/openclaw) und andere Agenten-Werkzeuge lesen. Er enthält Markdown-Anleitungen zum Abrufen, Parsen und Crawlen von Seiten sowie zu MCP und RAG. Der Agent lädt sie bei Bedarf. Dazu kommen sofort ausführbare Beispiele. So kann er die meisten Fragen zu Jigsaw beantworten und passenden Scraping-Code schreiben, ohne Ihren Editor zu verlassen.

Der Skill liegt im Ordner agent-skill des Repositorys unter dem Namen `jigsaw-official`. Seine Version entspricht immer der Version der Bibliothek.

## Installation {#installation}

### Skills.sh {#skillssh}

Installieren Sie den Skill aus dem Repository mit der CLI von [skills.sh](https://skills.sh):
```bash
```
Die CLI erkennt Ihre installierten Agenten und fügt ihnen den Skill hinzu.

### Clawhub {#clawhub}

Wenn Sie OpenClaw nutzen, können Sie den Skill über [Clawhub](https://docs.openclaw.ai/tools/clawhub) installieren:
```bash
```
Oder installieren Sie ihn über seine Clawhub-Seite.

### Manueller Download {#manual-download}

Laden Sie die ZIP-Datei des Skills direkt aus dem Repository herunter. Entpacken Sie sie in den Skills-Ordner Ihres Agenten. Bei Claude Code ist das `~/.claude/skills/`.

## Inhalt des Skills {#whats-inside}

- **`SKILL.md`**: Die Datei, die der Agent zuerst liest. Sie erklärt die Einrichtung, die Auswahl des Fetchers und die Sicherheitsregeln. Zum Beispiel muss der Agent bei CLI-Befehlen immer `--ai-targeted` verwenden, um sich vor Prompt Injection zu schützen.
- **`references/`**: Markdown-Kopien der Dokumentation zu Parsing, Fetchern, Spidern, dem MCP-Server und Integrationen. Sie werden erst bei Bedarf geladen und belegen vorher keinen Platz im Kontext des Agenten.
- **`examples/`**: Sofort ausführbare Skripte, die der Agent als Vorlage verwenden kann.

