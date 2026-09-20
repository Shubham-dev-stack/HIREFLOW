# HireFlow ⚡
### Evidence-First Hiring Decision QA & Agentic Validation System
Built for **Agentic AI Hackathon 2026**

---

## 🎯 Overview
**HireFlow** does not score or rank candidates. Instead, it checks whether a hiring decision is supported by sufficient evidence, detects critical uncertainties/gaps, and generates the minimum validation step required to reach decision readiness.

```
OBSERVE ➔ IDENTIFY UNCERTAINTY ➔ CHOOSE NEXT ACTION ➔ GENERATE MINIMUM VALIDATION ➔ COLLECT EVIDENCE ➔ RE-EVALUATE ➔ HUMAN DECISION
```

---

## ✨ Key Features
- **Cinematic Landing Page**: Interactive WebGL Orb background with custom 3D noise shaders, animated readiness metrics, and smooth scroll reveals.
- **Evidence-First Decision Matrix**: Requirements evaluated with verifiable citations, timestamps, and confidence scores.
- **Decision QA & Readiness Gauge**: Mathematically deterministic readiness score (`0% - 100%`) with threshold indicators.
- **Decision Lever Analysis**: Computes real-time sensitivity and potential readiness delta ($\Delta$) for each missing qualification.
- **Agentic Minimum Validation**: Targeted micro-scenarios with calculated ROI (% gain per minute).
- **Dual AI Engine**:
  - Direct integration with **Google Gemini (`gemini-2.5-flash`)**
  - **Guaranteed Zero-Downtime Fallback**: 100% deterministic heuristic fallback if no API key is provided or during network timeouts.
- **Complete Audit Trail**: Immutable cryptographic log for every evaluation step and manual override.

---

## 🚀 Tech Stack
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS + Lucide Icons
- **Animation & Graphics**: Framer Motion + OGL (WebGL)
- **Routing**: React Router v6

---

## 📦 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Shubham-dev-stack/HIREFLOW.git
cd HIREFLOW
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the root directory if you want live Gemini AI analysis:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: If you don't provide an API key, HireFlow will automatically use its built-in offline heuristic analysis.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## ⚖️ License
MIT License. Created by [Shubham-dev-stack](https://github.com/Shubham-dev-stack).
