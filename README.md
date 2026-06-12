# BIR QAP (Quarterly Alphalist of Payees) CSV to .DAT Converter Core

This standalone workspace handles the core business logic of parsing incoming CSV or Excel (`.xlsx`/`.xls`) tracking lists, validating withholding tax data according to Philippine Bureau of Internal Revenue (BIR) specifications, and compiling them into strictly formatted, machine-readable `.dat` files for **Form 1601-EQ**.

This project functions as a pure, decoupled logic module. **It contains no database layer, no user authentication, and no persistent state storage.** It simply ingests raw data arrays from the client upload window, processes them through strict positional formatting filters, and handles file streaming downloads.

---

## 🏗️ Isolated Architecture

By decoupling the compilation algorithms from your production platform, you ensure:
1. **Seamless Portability:** The entire `src/core-tax-logic/` folder can be cleanly copy-pasted directly into your main production Next.js/Supabase SaaS project later.
2. **Deterministic Computations:** Zero Next.js component rerender interference, enabling rapid runtime updates to string templates when the BIR alters form structures.
3. **Frictionless Vercel Serverless Deployments:** Uses lightweight stream handlers that bypass Vercel serverless function memory caps and execution limits.

---

## 🛠️ Tech Stack & Ecosystem

* **Framework:** Next.js 15 (App Router / Serverless API Route Handlers)
* **Hosting Environment:** Vercel (Edge & Serverless Compute)
* **Excel Processor:** `xlsx` (SheetJS) — Instantly flattens compressed spreadsheet matrix cells into normalized text rows in-memory.
* **Math Library:** `decimal.js` or `currency.js` — Enforces exact scalar decimal calculations, entirely bypassing native JavaScript floating-point rounding errors (`0.1 + 0.2` anomalies) that trigger BIR validation rejection penalties.

---

## 📐 Data Lifecycle (How the Pipeline Flows)

```text
[User Uploads CSV/.XLSX] 
         │
         ▼
[src/app/api/convert/route.ts] ──► Extracts workbook buffer via SheetJS
         │
         ▼
[src/core-tax-logic/parsers] ──► Sanitizes inputs (pads TINs to 9 digits, branch to 4 digits)
         │
         ▼
[src/core-tax-logic/formatters] ──► Sequentially compiles positional "H", "D", and "C" arrays
         │
         ▼
[NextResponse Stream] ──► Browser downloads clean text file explicitly closed via "\r\n"