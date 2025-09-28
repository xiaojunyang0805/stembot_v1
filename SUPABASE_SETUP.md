# 🚀 StemBot Supabase Database Setup

## 🚨 Current Issue: Need Your Real Supabase Credentials

**Problem:** You have a Google account registered in Supabase, but the app is using **invalid/old credentials**.
**Error:** `Auth session missing!` when creating projects.
**Root Cause:** App tries real Supabase auth but can't connect with current credentials.

## ✅ Solution Ready - Just Need Your Credentials

## 🎯 Quick Fix (2 Minutes)

Since you already have a Google account registered in Supabase, you have a working Supabase project. We just need to connect to it:

### Step 1: Get Your Supabase Project Credentials

1. **Go to your Supabase Dashboard:** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project** (the one where your Google account is registered)
3. **Go to Settings → API** (left sidebar)
4. **Copy these two values:**
   - `Project URL` (looks like: `https://your-project-id.supabase.co`)
   - `anon public` API key (long string starting with `eyJ...`)

### Step 2: Update Environment Variables

Update your `.env.local` file with YOUR credentials:

```bash
# Replace with YOUR actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Keep these settings for real authentication
NEXT_PUBLIC_INTEGRATION_METHOD=env-based
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_FALLBACK_TO_MOCKS=true
```

### Step 3: Test the Fix

1. **Restart your development server:** `npm run dev`
2. **Try Google login again**
3. **Check browser console** for authentication logs
4. **Create a project** - should now work! ✅

## Alternative Options

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `stembot-mvp`
   - Choose region and database password

2. **Get your credentials:**
   - Go to Settings → API
   - Copy the **Project URL** and **anon public key**

3. **Update your environment variables:**
   ```bash
   # Create/update .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-new-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   NEXT_PUBLIC_INTEGRATION_METHOD=env-based
   NEXT_PUBLIC_USE_MOCKS=false
   ```

4. **Run the database migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy content from `supabase/migrations/001_create_research_database.sql`
   - Paste and execute in SQL Editor

### Option 2: Continue with Mock Mode (Development)

The app is currently running with mock data. This is perfect for:
- UI/UX testing
- Frontend development
- Demonstrating functionality

To keep using mocks, no action needed! The `.env.local` is already configured.

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