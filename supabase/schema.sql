-- Увімкнення розширення UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблиця папок
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблиця медіафайлів
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  size_bytes BIGINT,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблиця коментарів
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Індекси
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_media_folder_id ON media(folder_id);
CREATE INDEX idx_comments_media_id ON comments(media_id);

-- Для пошуку по імені та автору
CREATE INDEX idx_media_name ON media USING gin(to_tsvector('simple', name));
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_folders_name ON folders USING gin(to_tsvector('simple', name));

-- Налаштування Storage bucket (виконати вручну в Supabase Dashboard або через API):
-- Створіть bucket з іменем 'family-media' та зробіть його приватним.
-- Додайте наступні RLS-правила для таблиць (опціонально для додаткового захисту).
