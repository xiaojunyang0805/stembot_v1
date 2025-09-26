# 🚀 StemBot Supabase Database Setup

## Quick Start Guide

### Option 1: Automated Setup (Recommended)
Run the setup script to automatically create all database tables:

```bash
npm run db:setup
```

### Option 2: Manual Setup via Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/kutpbtpdgptcmrlabekq
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy the migration file**: Open `supabase/migrations/001_create_research_database.sql`
4. **Paste and execute** the SQL code in the Supabase SQL Editor
5. **Verify setup** by checking the Tables section

## ✅ What Gets Created

### 📊 Database Tables
- **users** - User profiles and academic information
- **projects** - Research project management
- **project_memory** - AI context storage with vector embeddings
- **sources** - Literature and reference management
- **conversations** - Chat history with AI mentor
- **user_sessions** - User activity tracking

### 🔐 Security Features
- **Row Level Security (RLS)** policies for all tables
- **User isolation** - Users can only access their own data
- **JWT-based authentication** integration

### ⚡ Performance Optimizations
- **Indexes** on frequently queried columns
- **Vector search** support for semantic memory retrieval
- **Automated triggers** for timestamp updates and statistics

### 🛠️ Helper Functions
- `get_project_with_stats()` - Get project data with statistics
- `search_project_memory()` - Semantic search in project memory

## 🔧 After Setup

1. **Generate TypeScript types** (optional):
   ```bash
   npm run db:generate
   ```

2. **Verify the setup** by checking your Supabase dashboard:
   - Go to Table Editor
   - You should see all 6 tables created
   - Check that RLS is enabled on all tables

3. **Test authentication** by running your app:
   ```bash
   npm run dev
   ```

## 🎯 Next Steps

After database setup is complete, you can proceed with:

1. **Authentication Integration** - Connect your app to use the new user system
2. **Project Management** - Implement create/read/update operations for projects
3. **AI Memory System** - Set up context storage and retrieval
4. **Literature Management** - Build source management features

## 🐛 Troubleshooting

**If you encounter errors:**

1. **Check your environment variables** in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Ensure required extensions are enabled** in Supabase:
   - Go to Database → Extensions
   - Enable `uuid-ossp` and `vector`

3. **Check Supabase logs** for detailed error messages:
   - Dashboard → Settings → Logs

4. **Manual execution**: If the automated script fails, use Option 2 above

## 📋 Database Schema Overview

```
users (User profiles)
├── id (UUID)
├── email, university, academic_level
├── research_interests, subscription_tier
└── profile_data (JSON)

projects (Research projects)
├── id (UUID)
├── user_id → users.id
├── title, research_question, subject
├── status, current_phase, due_date
└── progress_data (JSON)

project_memory (AI context storage)
├── id (UUID)
├── project_id → projects.id
├── content, content_type
├── embedding_vector (for semantic search)
└── relevance_score

sources (Literature management)
├── id (UUID)
├── project_id → projects.id
├── title, authors, url, doi
├── credibility_score, summary
└── citation_style (JSON)

conversations (AI chat history)
├── id (UUID)
├── project_id → projects.id
├── user_id → users.id
├── message, ai_response
├── context_recall (JSON)
└── tokens_used

user_sessions (Activity tracking)
├── id (UUID)
├── user_id → users.id
├── project_id → projects.id
├── session_start, session_end
└── activity_data (JSON)
```

This database schema supports the complete StemBot research mentoring platform with AI-powered features, literature management, and comprehensive user tracking. 🎓✨