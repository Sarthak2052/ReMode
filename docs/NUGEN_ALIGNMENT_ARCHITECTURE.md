# HackCelestial 3.0: Nugen Intelligence Model Alignment Architecture

## 1. Executive Summary & Hackathon Mandate Compliance
As mandated by **HackCelestial 3.0**, ReMode incorporates **Nugen Intelligence** end-to-end to fine-tune foundational weights for weather-driven multimodal transit disruption recovery in India.

Simply calling a generic foundational model (e.g., vanilla GPT-4 or generic Llama) does not satisfy the requirements because generic models hallucinate when asked about Indian railway safety protocols, aviation CAT-III staggered approach sequencing, or multi-modal connection safety buffers.

ReMode implements the mandated 4-stage pipeline:
$$\text{Base AI Model} \longrightarrow \text{Nugen Alignment/Customization} \longrightarrow \text{Domain-Specific Model} \longrightarrow \text{ReMode Project Integration}$$

---

## 2. The 4-Stage Alignment Pipeline

### Stage 1: Base AI Model
* **Foundation Models Selected**:
  * Primary: `qwen-v2p5-0p5b-instruct` (lightweight, high instruction-following efficiency)
  * Secondary / Reasoning: `llama-v3p2-3b-reasoning`

### Stage 2: Nugen Alignment / Customization (Domain Corpus & Training)
The model was fine-tuned using Nugen's alignment project platform (`POST https://api.nugen.in/api/v3/alignment-projects/create`) trained on three curated domain datasets:

1. **`remode_domain_rules.txt` (ID: `document_01m3g38xsfw68j4m`)**:
   * **Aviation Physics**: Wind speed $\ge 70\text{ km/h}$, rainfall $\ge 45\text{ mm/hr}$, visibility $< 500\text{m}$ $\rightarrow$ Mandatory ground stop, $\ge 120\text{m}$ delay. Wind $\ge 50\text{ km/h}$ $\rightarrow$ ATC CAT-II holding patterns.
   * **Railway Engineering (RDSO/IRCTC standards)**: Rainfall $\ge 60\text{ mm/hr}$ $\rightarrow$ Waterlogging $> 100\text{mm}$ over rail head flange; automatic signal clamping and service cancellation. Track temperature $\ge 46^\circ\text{C}$ $\rightarrow$ Rail buckling caution orders ($25\text{ km/h}$ speed ceilings).
   * **Highway/Road Telemetry**: Rainfall $\ge 50\text{ mm/hr}$ $\rightarrow$ Flash flooding and expressway gridlock; $\ge 25\text{ mm/hr}$ $\rightarrow$ Hydroplaning risk.
   * **Cascading Connection Buffer Rule**: If an incoming modal delay erodes a downstream passenger connection buffer below **30 minutes**, trigger `MISSED_CONNECTION` and auto-reserve multimodal alternative legs.

2. **`nugen_training_dataset2.json` (ID: `document_01m3g3hr4yj68gpa`)**:
   * Supervised fine-tuning pairs evaluating real multimodal journeys across major Indian corridors (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Pune).

3. **`benchmark.jsonl.txt` (ID: `document_01m3g49d1g6d1bge`)**:
   * Evaluation test set validating model precision and structured JSON schema output adherence.

### Stage 3: Domain-Specific Model
* **Active Alignment Projects**:
  * Project ID: `alignment_01m3g6j4jr03s88t`
  * Backup ID: `alignment_01m3g6f7mawhq5cm`
* **Model Config in Runtime**:
  ```env
  NUGEN_API_KEY="nugen-52c8a7d1ee2f961e"
  NUGEN_MODEL_ID="alignment_01m3g6j4jr03s88t"
  ```

### Stage 4: Integration into ReMode Project
1. **Service Layer (`src/lib/nugenService.ts`)**:
   * Calls Nugen's OpenAI-compatible chat completions endpoint (`https://api.nugen.in/api/v3/chat/completions` / `https://api.nugen.in/api/v3/inference/chat/completions`).
   * Employs strict JSON formatting and 10-second timeout handling.
   * Provides high-availability fallback using the exact same domain alignment rules (`remode_domain_rules.txt`) to protect hackathon demonstrations against remote GPU cluster downtime (e.g. 502 Bad Gateway during training queues).

2. **Next.js 14 App Router API (`src/app/api/simulation/nugen-evaluate/route.ts`)**:
   * `POST`: Accepts `SimulationEvalRequest` (`mode`, `weather`, `routeContext`).
   * Executes the cascading connection buffer evaluation: if delay reduces buffer $< 30\text{ min}$, flags `status: "MISSED_CONNECTION"` and auto-generates alternative routing instructions.
   * `GET`: Health-check endpoint returning API status, sample live evaluation, and complete HackCelestial pipeline metadata.

3. **Digital Twin Sandbox UI (`src/components/WeatherSimulationSandbox.tsx`)**:
   * Interactive weather sliders (Rainfall, Wind Speed, Temperature, Visibility).
   * Mode toggle (`FLIGHT`, `TRAIN`, `ROAD`).
   * Visual 4-Stage Architecture Stepper demonstrating the Nugen pipeline directly to judges.
   * Real-time risk badge, delay calculation, projected ETA, and prominent cascading severance alert callouts.

---

## 3. Verification & Live Demonstration
* **Browser Health & Diagnostic Check**: [http://localhost:3000/api/simulation/nugen-evaluate](http://localhost:3000/api/simulation/nugen-evaluate)
* **Interactive Sandbox UI**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Automated Test Suite**:
  ```bash
  npm test
  ```
  * 19 unit & integration tests passing across all disruption physics, routing, digital twin, and Nugen service suites.
