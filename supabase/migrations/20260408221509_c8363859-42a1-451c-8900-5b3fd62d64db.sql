
-- Drop existing RLS policies on datasets
DROP POLICY IF EXISTS "Users can view their own datasets" ON public.datasets;
DROP POLICY IF EXISTS "Users can insert their own datasets" ON public.datasets;
DROP POLICY IF EXISTS "Users can update their own datasets" ON public.datasets;
DROP POLICY IF EXISTS "Users can delete their own datasets" ON public.datasets;

-- Drop existing RLS policies on conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

-- Drop existing RLS policies on messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

-- Create open access policies for datasets
CREATE POLICY "Public access to datasets" ON public.datasets FOR ALL USING (true) WITH CHECK (true);

-- Create open access policies for conversations
CREATE POLICY "Public access to conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

-- Create open access policies for messages
CREATE POLICY "Public access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Allow public access to storage bucket for uploads
CREATE POLICY "Public upload to datasets bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'datasets');
CREATE POLICY "Public read from datasets bucket" ON storage.objects FOR SELECT USING (bucket_id = 'datasets');
