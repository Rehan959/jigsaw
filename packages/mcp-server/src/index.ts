#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJigsawServer } from "./server.js";

serveStdio(() => createJigsawServer());
