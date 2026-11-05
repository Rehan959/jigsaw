---
title: "CLI de Jigsaw: extrae datos desde la terminal"
description: "Instala las herramientas de terminal de Jigsaw y elige entre los comandos de extracción, el shell interactivo y el servidor MCP. Sigue la guía que necesites."
---

# Interfaz de línea de comandos {#command-line-interface}

Desde la versión 0.3, Jigsaw incluye una interfaz de línea de comandos con tres funciones principales:

1. **Shell interactivo**: Un entorno para extraer datos web basado en IPython, con muchos atajos y herramientas útiles.
2. **Comandos de extracción**: Extrae datos de sitios web desde la terminal sin programar.
3. **Comandos de utilidad**: Herramientas de instalación y gestión.

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

Para usar las herramientas de esta sección, instala el grupo de dependencias extra `shell`:
```bash
pip install "jigsaw[shell]"
```
Para obtener páginas con un navegador, instala también sus dependencias:
```bash
jigsaw install
```
Este comando descarga Chromium y sus dependencias del sistema, y actualiza la lista de TLD. Las solicitudes HTTP no necesitan este paso.
