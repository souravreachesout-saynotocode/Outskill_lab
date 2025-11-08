/*
  # Add Embedding Column to Tasks Table

  1. Schema Changes
    - Add `embedding` column to `tasks` table (vector type with 1536 dimensions for OpenAI embeddings)
    - Create an index for fast vector similarity search
  
  2. Search Function
    - Create a function to perform semantic similarity search on tasks
    - Returns tasks with similarity score above threshold
  
  3. Notes
    - Using OpenAI's text-embedding-3-small model (1536 dimensions)
    - Index improves query performance for large datasets
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE tasks ADD COLUMN embedding vector(1536);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS tasks_embedding_idx ON tasks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE OR REPLACE FUNCTION search_tasks_by_similarity(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 2,
  user_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  priority text,
  status text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tasks.id,
    tasks.title,
    tasks.priority,
    tasks.status,
    1 - (tasks.embedding <=> query_embedding) as similarity
  FROM tasks
  WHERE 
    tasks.embedding IS NOT NULL
    AND (user_id_filter IS NULL OR tasks.user_id = user_id_filter)
    AND 1 - (tasks.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY tasks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;