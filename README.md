# CIPL Data Extractor (Next.js)

A Next.js conversion of the Streamlit CIPL extractor app, powered by Google Gemini.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Enter your Gemini API key in the UI
2. Upload a CIPL image (JPG, JPEG, PNG)
3. Click **Extract Data**
4. View results and optionally download as JSON

## Tech Stack

- **Next.js 14** (App Router)
- **@google/generative-ai** SDK
- **Tailwind CSS**
- **TypeScript**

## API Route

`POST /api/extract` — accepts `{ imageBase64, mimeType, apiKey }`, returns `{ data }`.

Jai is learning
Jai sending 2nd change
# cipl-reader2
# cipl-reader2
