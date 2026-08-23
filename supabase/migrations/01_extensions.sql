-- 1. Extensions.
create extension if not exists pgcrypto;   -- digest() for the ledger hash chain
create extension if not exists vector;     -- cluster centroids (text-embedding-3-small, 1536)
