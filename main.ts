import type{ PoolClient, PoolConfig, Pool } from "pg";
import pg from "pg";
import { main, Operation, spawn, until } from "effection";
import { Buffer } from "node:buffer";

const getConnection = (creds: PoolConfig) => {
  const pool = new pg.Pool(creds);
  pool.on("error", (err: unknown) => {
    console.log("Pool error");
    console.error(err);
  });
    
  pool.on("connect", (_client: PoolClient) => {
    _client.on("error", (err: Error) => {
      console.log("Client error");
      console.error(err);
      Deno.exit(1);
    });
  });

  return pool;
};

const conn = getConnection({
  user: "postgres",
  host: "localhost",
  port: 5432,
  database: "postgres",
});


function* sleep(ms: number) {
  yield* until(new Promise((resolve) => setTimeout(resolve, ms)));
}


function* writter(pool): Operation<unknown> {
  console.log("Writter started");
  let counter = 0;
  while (true) {
    counter++;
    yield* until(pool.query(`
      INSERT INTO blocks(block_height, ver, main_chain_block_hash, seed, ms_timestamp, block_hash)
      VALUES ($1, $2, $3, $4, $5, NULL)
      ON CONFLICT (block_height)
      DO UPDATE SET
      block_height = EXCLUDED.block_height,
      ver = EXCLUDED.ver,
      main_chain_block_hash = EXCLUDED.main_chain_block_hash,
      seed = EXCLUDED.seed,
      ms_timestamp = EXCLUDED.ms_timestamp,
      block_hash = EXCLUDED.block_hash;`, [counter, 1, Buffer.from("013d7d16d7ad4fefb61bd95b765c8ceb"), "seed", new Date().toISOString()]));
    yield* sleep(Math.random() * 10 | 0);
    
    const randomBlockHash = 
      "0x" +
      Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")

    yield* until(pool.query(`
      UPDATE blocks
      SET
      block_hash = $1
      WHERE block_height = $2;
    `, [Buffer.from(randomBlockHash), counter]));
    console.log("Block written", counter);
  }
}

function* reader(pool): Operation<unknown> {
  console.log("Reader started");
  while (true) {
    const row = yield* until(pool.query(`
      SELECT * FROM blocks
      WHERE block_hash IS NOT NULL
      ORDER BY block_height DESC
      LIMIT 1;
    `));
    console.log("Block read", row.rows[0].block_height);
    yield* sleep(Math.random() * 10 | 0);
  }
}

await main(function* () {
  console.log("Main started");

  yield* spawn(function* () {
    yield* writter(conn);
  });
  yield* spawn(function* () {
    // comment this line and error does not happen
    yield* reader(conn);
  });

  while (true) {
    yield* sleep(1000);
  }
});

// await conn.end();
