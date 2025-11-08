/*
  # Create subtasks table

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key) - Unique identifier for each subtask
      - `task_id` (uuid, foreign key) - References tasks table
      - `user_id` (uuid, foreign key) - References auth.users table
      - `title` (text) - Subtask title/description
      - `completed` (boolean) - Whether subtask is completed
      - `created_at` (timestamptz) - Timestamp when subtask was created
      - `updated_at` (timestamptz) - Timestamp when subtask was last updated

  2. Security
    - Enable RLS on `subtasks` table
    - Add policy for users to view their own subtasks
    - Add policy for users to insert their own subtasks
    - Add policy for users to update their own subtasks
    - Add policy for users to delete their own subtasks

  3. Indexes
    - Index on task_id for faster queries
    - Index on user_id for filtering
*/

CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks"
  ON subtasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS subtasks_task_id_idx ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS subtasks_user_id_idx ON subtasks(user_id);
