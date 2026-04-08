## DataMentor Full-Stack Implementation Plan

### Phase 1: Database & Storage Setup
- Create `datasets` table (id, user_id, filename, file_url, summary_json, created_at)
- Create `chat_conversations` table (id, user_id, dataset_id, created_at)
- Create `chat_messages` table (id, conversation_id, role, content, created_at)
- Create storage bucket for file uploads (CSV, Excel)
- Set up RLS policies

### Phase 2: AI Chat Edge Function
- Create `chat` edge function using Lovable AI Gateway
- System prompt: expert data analyst that follows the 4-part response format
- When dataset context is provided, include summary in system prompt
- Streaming responses with markdown rendering

### Phase 3: File Upload & Analysis Edge Function
- Create `analyze-dataset` edge function
- Parse CSV/Excel files, extract column info, types, missing values, basic stats
- Use AI to generate cleaning suggestions and visualization recommendations
- Store analysis results in `datasets.summary_json`

### Phase 4: Frontend - File Upload UI
- Add file upload component (drag & drop, multi-file)
- Show dataset summary card after upload (columns, types, missing values)
- Dataset selector in sidebar/header

### Phase 5: Frontend - Real AI Chat
- Replace hardcoded responses with streaming AI calls
- Render markdown responses with react-markdown
- Include dataset context in messages when a dataset is selected

### Phase 6: Auto Chart Generation
- Use recharts to render charts from AI-suggested configurations
- AI returns chart config JSON (type, x/y axes, data) via tool calling
- Render charts inline in chat responses

### Phase 7: Predictive Analysis
- Edge function that runs simple statistical analysis
- AI recommends and explains ML approaches
- Display prediction results with charts
