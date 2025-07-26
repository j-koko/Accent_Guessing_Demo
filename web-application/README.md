# QualMetrics - Qualtrics Survey Analytics Dashboard

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <repository-url>
cd qualmetrics
npm install
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Get your project credentials from Settings > API

### 3. Environment Configuration

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

### 4. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📊 Usage Guide

### Qualtrics Integration

Configure your Qualtrics survey with a WebService element:

**Endpoint**: `https://your-app.vercel.app/api/responses`  
**Method**: POST  
**Content-Type**: application/json

**Example Payload**:
```json
{
  "responseId": "${e://Field/ResponseID}",
  "Q1": "${q://QID1/ChoiceTextEntryValue}",
  "Q2": "${q://QID2/ChoiceTextEntryValue}",
  "Q3": "${q://QID3/ChoiceTextEntryValue}"
}
```

### Viewing Reports

Access analytics at: `/report?responseId=R_abc123XYZ`

## 🔧 API Reference

### POST /api/responses

Submit survey responses from Qualtrics.

**Request Body**:
```json
{
  "responseId": "R_abc123XYZ",
  "Q1": "Answer 1",
  "Q2": "Answer 2"
}
```

**Response**: `{ "status": "ok" }`

### GET /api/report?responseId=R_abc123XYZ

Generate analytics report for a response.

**Response**:
```json
{
  "you": { "Q1": "Answer 1", "Q2": "Answer 2" },
  "allResponses": [...]
}
```

## 🚀 Deployment

### Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`