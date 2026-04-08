-- Projects (one document per project) and persisted chat messages.

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_clerk_user_id_idx ON projects (clerk_user_id);
CREATE INDEX IF NOT EXISTS projects_clerk_updated_idx ON projects (clerk_user_id, updated_at DESC);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

DO $$
DECLARE
  r RECORD;
  new_id UUID;
BEGIN
  FOR r IN SELECT id, clerk_user_id FROM documents WHERE project_id IS NULL LOOP
    INSERT INTO projects (clerk_user_id) VALUES (r.clerk_user_id) RETURNING id INTO new_id;
    UPDATE documents SET project_id = new_id WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE documents ALTER COLUMN project_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS documents_one_per_project_idx ON documents (project_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  parts JSONB NOT NULL,
  sort_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, sort_index)
);

CREATE INDEX IF NOT EXISTS chat_messages_project_sort_idx ON chat_messages (project_id, sort_index);
