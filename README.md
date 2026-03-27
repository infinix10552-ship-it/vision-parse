# 👁️ VisionParse AI

VisionParse is a high-performance, AI-powered document OCR web application. It uses Azure AI Vision to extract text from images and PDFs with a premium, glassmorphism-styled UI.

## 🚀 Deployment

### Option 1: Unified (Recommended)
Deploy the entire project as a single service on **Render**.
1. Connect this GitHub repo to Render.
2. Render will automatically pick up `render.yaml`.
3. Set your `AZURE_VISION_ENDPOINT` and `AZURE_VISION_KEY` in Render dashboard.

### Option 2: Split (Vercel + Render)
Deploy the frontend to **Vercel** and the backend to **Render**.

#### 1. Backend (Render)
- Deploy the `/backend` directory to Render.
- Add your Vercel frontend URL to the `ALLOWED_ORIGINS` env var in Render.

#### 2. Frontend (Vercel)
- Deploy the root directory to Vercel.
- Update `vercel.json` rewrite destination to point to your backend Render URL:
  ```json
  { "source": "/api/(.*)", "destination": "https://your-backend.onrender.com/api/$1" }
  ```
- Or set environment variable `VITE_API_URL` to your Render backend URL.

## ⚙️ Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## 🔐 Configuration

Copy `backend/.env.example` to `backend/.env` and add your Azure credentials:
- `AZURE_VISION_ENDPOINT`
- `AZURE_VISION_KEY`

---
Built with React, Vite, Framer Motion, and Express.
