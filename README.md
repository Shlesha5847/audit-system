# Audit System

A Next.js (App Router, TypeScript, Tailwind CSS) web application for managing audit clients, document lifecycle workflows, review processes, and chronological audit trails powered by Supabase.

---

## Features

- **Client Management (`/clients`)**: View client lists filtered by firm, create new clients, and navigate to client workspaces.
- **Document Management (`/clients/[id]`)**: Upload files to Supabase Storage, store document records, and link uploaded documents to client profiles.
- **Document Review Workflow (`/documents/[id]`)**: Role-based document review actions including:
  - `[UPLOAD]` - Initial document upload
  - `[REVIEW]` - Mark document `UNDER_REVIEW`
  - `[APPROVED]` - Approve document
  - `[CORRECTION]` - Request corrections with detailed reasoning
- **Audit History Timeline**: Vertical timeline displaying a chronological history of all document actions with timestamps, user attribution, status labels, and highlighted correction reasons.

---

## Audit Trail Integrity

> **Important**: **Audit logs are append-only to maintain integrity.**  
> The system enforces that audit records can only be created upon state changes. No modification or deletion of existing audit entries is permitted under any circumstances.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components & Client Components)
- **Styling**: Tailwind CSS
- **Database & Storage**: Supabase (PostgreSQL + Storage Buckets)
- **Language**: TypeScript

---

## Getting Started

1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/Shlesha5847/audit-system.git
   cd audit-system
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
