---
title: "Jigsaw CLI: Scrape from the Terminal"
description: "Install Jigsaw terminal tools and choose between extract commands, the interactive shell and the MCP server. Follow the guide for your task."
---

# Command Line Interface

Since v0.3, Jigsaw includes a powerful command-line interface that provides three main capabilities:

1. **Interactive Shell**: An interactive Web Scraping shell based on IPython that provides many shortcuts and useful tools
2. **Extract Commands**: Scrape websites from the terminal without any programming
3. **Utility Commands**: Installation and management tools

```bash
# Launch interactive shell
jigsaw shell

# Convert the content of a page to markdown and save it to a file
jigsaw extract get "https://example.com" content.md

# Get help for any command
jigsaw --help
jigsaw extract --help
```

## Requirements
This section requires you to install the extra `shell` dependency group, like the following:
```bash
pip install "jigsaw[shell]"
```
For browser fetching, also install the browser dependencies:
```bash
jigsaw install
```
This downloads Chromium and its system dependencies, and updates the TLD list. HTTP requests do not need this step.