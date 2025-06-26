

CREATE TABLE blocks (
  block_height INTEGER PRIMARY KEY,
  ver INTEGER NOT NULL,
  main_chain_block_hash BYTEA NOT NULL,
  seed TEXT NOT NULL,
  ms_timestamp TIMESTAMP without time zone NOT NULL,
  block_hash BYTEA
);

INSERT INTO blocks (block_height, ver, main_chain_block_hash, seed, ms_timestamp, block_hash)
VALUES (0, 2, (decode('013d7d16d7ad4fefb61bd95b765c8ceb', 'hex')), 'seed', current_timestamp, (decode('013d7d16d7ad4fefb61bd95b765c8ceb', 'hex')));

