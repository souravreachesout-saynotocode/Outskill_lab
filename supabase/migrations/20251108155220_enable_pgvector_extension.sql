/*
  # Enable pgvector Extension

  1. Extensions
    - Enable the `vector` extension for similarity search capabilities
  
  2. Notes
    - This extension allows us to store and query vector embeddings
    - Required for semantic search functionality
*/

CREATE EXTENSION IF NOT EXISTS vector;