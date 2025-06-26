#!/usr/bin/env node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import net from "node:net";
import { fromNodeSocket } from "pg-gateway/node";

const migration = readFileSync("./up.sql", "utf-8");
const client = new PGlite(
  "memory://",
  {
    port: 5433,
    username: "postgres",
    database: "postgres",
    extensions: {
    },
    debug: 5,
  },
);

console.log(await client.query("SELECT NOW()"));
await client.exec(migration);

{
  const server = net.createServer(async (socket) => {
    await fromNodeSocket(socket, {
      serverVersion: "16.3",

      auth: {
        // No password required
        method: "trust",
      },

      async onStartup() {
        // Wait for PGlite to be ready before further processing
        await client.waitReady;
      },

      // Hook into each client message
      async onMessage(data, { isAuthenticated }) {
        // Only forward messages to PGlite after authentication
        if (!isAuthenticated) {
          return;
        }

        // Forward raw message to PGlite and send response to client
        return await client.execProtocolRaw(data);
      },
    });
  });

  server.listen(5432, () => {
    console.info("database: server listening on port 5432");
  });
}

