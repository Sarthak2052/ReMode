# Travel Disruption Recovery Engine — Implementation Plan

**Team:** TECHDYNASTY
**Scope:** Real, publicly deployable product — not hackathon-scoped
**Origin:** Hackathon problem statement, Sep 2026

---

## 1. Problem & Vision

Airlines and hotels only manage their own leg of a trip. When something breaks — a delayed flight, a cancelled train, a storm at the destination — nobody stitches together what it means for the *rest* of the trip: the hotel check-in now at risk, the transfer about to be missed, the activity about to be wasted money on. Travelers currently do that reasoning manually, across five different apps, usually mid-crisis at an airport or station.

**The real product:** a system that watches a traveler's entire trip as one connected graph, detects disruptions from real data sources, computes the actual downstream impact, and generates ranked, explainable recovery plans — then lets the traveler act on one with a single click.

Existing tools sit in adjacent spaces, not this one: AI trip planners like Mindtrip help *before* a trip; status apps like M-Indicator report what's happening on *one* transit mode. Neither computes what a disruption means across a multi-booking trip, or what to do about it — that gap is the product.

## 2. Target Users

- Leisure travelers with 3+ interdependent bookings (flight + hotel + activities)
- Business travelers with tight connections
- Trip organizers managing bookings for a group or family

## 3. Phased Roadmap

Build in phases. Validate the core loop with real users before expanding it.

**Phase 0 — Foundation**
Trip import, unified trip view, auth, data model, a manual disruption trigger for testing. *Status: landing page, auth context, and trip store scaffolding already exist — confirm the trigger actually reaches the recovery engine end-to-end before calling this done.*

**Phase 1 — Core Recovery Loop**
Disruption detection, ripple impact, recovery plan generation with explainability, a comparison view (cost/time/convenience/itinerary-affected), apply flow, AI copilot chat. *Status: `RecoveryEngine.ts`, `RiskScorer.ts`, `geminiAgent.ts`, `ConfirmApplyModal.tsx`, and `CopilotDrawer.tsx` already exist — same caveat, verify the full chain runs live before treating this as finished.*

**Phase 2 — Personalization & Trust**
Traveler preference profile, risk heat map, proactive alerts before a disruption fully unfolds, real hotel/activity alternatives beyond the seed catalog.

**Phase 3 — Production Hardening**
Real backend persistence (see Section 4's open gap), background-job architecture for live API polling, booking-provider partnerships or deep-linking for actual rebooking, monitoring, caching, legal basics (privacy policy, ToS, data retention).

Treat the hackathon as Phase 0 plus a working slice of Phase 1 — you're most of the way there on scaffolding; the remaining work is wiring and verification, not new architecture.

## 4. System Architecture (as actually built)

- **Framework:** Next.js 14.2 (App Router), TypeScript 5.6 (strict), React 18.3, Node.js runtime
- **Styling:** Tailwind CSS 3.4 + PostCSS/Autoprefixer, `clsx`/`tailwind-merge` for dynamic classNames, Lucide React icons
- **Motion:** Motion (Framer Motion's successor) for transforms/entrances/layout transitions, GSAP for complex timeline tweens
- **Maps:** Leaflet + OpenStreetMap with custom SVG markers and animated route lines — a better hackathon call than Mapbox: free, no API key, no rate limit to worry about on demo day
- **AI:** `@google/genai` (official Gemini SDK) — used for narration and conversation only, **not** for computing the recovery plan itself
- **Recovery computation:** deterministic, not LLM-driven — `RecoveryEngine.ts` runs a multi-modal graph search over 13 factors (cancellation policies, safe buffer thresholds, carrier-jumping rules, DGCA passenger rights, weather risk, and more); `RiskScorer.ts` turns that into buffer/exposure/arrival-risk scores
- **State (current):** React Context (`AuthContext`), an in-memory singleton (`TripStore.ts`), and `localStorage` persistence — no backend database yet
- **Testing:** Node's native test runner (`node --experimental-strip-types --test`) against the deterministic engine

This split is better than a single-LLM-call design for a live demo: the recovery plan is computed deterministically, so it can't hallucinate a broken plan under pressure — Gemini's only job is to explain a plan that's already correct, and generate natural-language, policy-backed reasoning. Keep it that way; don't let Gemini "just generate the plan directly" later for speed. You'd trade a deterministic, testable core for a probabilistic one for no real gain.

**The one real open gap:** everything currently lives client-side (Context + in-memory + `localStorage`). That's genuinely fine for a single-device hackathon demo. It is not fine for the "real, publicly deployable product" goal stated earlier — `localStorage` doesn't survive a cleared cache, doesn't sync across devices, and isn't a real user account. Decide explicitly: keep it client-side through the hackathon and make real persistence (MongoDB Atlas + real auth) the first Phase 3 task, or pull it forward if you need multi-device sooner. Don't let it become permanent by default.

## 5. Target Data Model (for when real persistence is added)

This is the schema to migrate `TripStore.ts` toward once you add a real database — not what's live today:

```
User          { id, email, name, preferences: {priorityWeights, avoidNightTravel, ...} }
Trip          { id, userId, title, startDate, endDate, status, bookings: Booking[] }
Booking       { id, tripId, type, status, provider, externalRef,
                startTime, endTime, origin, destination,
                dependsOn: string[], cost, currency, details }
Disruption    { id, bookingId, type, source, severity, detectedAt,
                description, impactedBookings: string[] }
RecoveryPlan  { id, disruptionId, tier, changes, costDelta, timeDelta,
                riskScore, convenienceScore, tripPreservationScore,
                explanation, appliedAt? }
Notification  { id, userId, tripId, type, channel, sentAt, read }
```

`dependsOn` on `Booking` is what should power the ripple-impact graph — a missed flight points at the transfer and hotel check-in that depend on it.

## 6. Data Sources (as actually built)

Already solved better than a generic mocked dataset: `routeCatalogs.ts` — pre-seeded multimodal data across real Indian corridors: Air India, IndiGo, Akasa (air), IRCTC Vande Bharat & Rajdhani (rail), BluSmart EV cabs, HPTDC Volvo buses, Taj/Oberoi (hotels). That's real-named-provider seed data — your "world," with `RecoveryEngine` + `RiskScorer` + `geminiAgent` staying fully computed on top of it. This is exactly what "seed vs. computed" should look like, and it beats hand-authored mock JSON because a judge can ask about a real corridor and get something coherent back.

Growth path once you outgrow the static catalog:

| Need | Real API |
|---|---|
| Flight status | Amadeus Self-Service (free tier) |
| Hotel availability | Amadeus Hotel Search |
| Weather | Open-Meteo or OpenWeatherMap |
| Train status | Still no clean official feed — stay user-reported, same as before |

## 7. AI / Decision Engine (as actually built)

- **`RecoveryEngine.ts`** computes the actual recovery options — deterministic multi-modal graph search over cost, time, cancellation policy, safe buffer thresholds, carrier-jumping rules, DGCA passenger rights, weather risk, and the rest of its 13 factors. This is your answer to the PS's "availability, timing, cost, refunds, cancellation policies, location, traveler preferences" requirement — arguably stronger than an LLM call, since it's auditable and repeatable
- **`RiskScorer.ts`** turns engine output into comparison scores — buffer score, disruption exposure, arrival risk grade
- **`geminiAgent.ts`** narrates the engine's output: natural-language, policy-backed explanations, and the AI Travel Copilot conversation. It explains a plan that already exists — it never invents one
- Require an explanation on every plan the engine surfaces — that satisfies explainability without adding a second, separate feature
- Booking execution stays human-confirmed regardless of which layer proposed the change (`ConfirmApplyModal.tsx` is the right place to enforce this) — never apply a change without it going through that confirmation

## 8. Target API Surface (once a real backend exists)

Not live yet given the current client-side state — the shape to build toward:

```
POST   /api/trips                     create trip
GET    /api/trips/:id                 trip + bookings
POST   /api/trips/:id/bookings        add booking
POST   /api/disruptions               report/detect disruption
GET    /api/disruptions/:id/impact    ripple impact
POST   /api/disruptions/:id/recovery  generate recovery plans
POST   /api/recovery/:id/apply        apply chosen plan
POST   /api/copilot/chat              AI copilot
```

## 9. Folder Structure (as actually built, roughly)

```
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── login/  signup/
│   └── trip/
├── components/
│   ├── ScenariosCarouselSection.tsx, FeaturesCardSwapSection.tsx, HowItWorksSection.tsx  (landing)
│   ├── CardSwap.tsx, Dock.tsx, Navbar.tsx, Footer.tsx                                    (landing)
│   ├── CopilotDrawer.tsx, ConfirmApplyModal.tsx                                          (copilot + apply flow)
├── core/
│   ├── RecoveryEngine.ts
│   ├── RiskScorer.ts
│   ├── ExplanationEngine.ts
│   ├── geminiAgent.ts
│   ├── TripStore.ts
│   └── dataset/
│       └── routeCatalogs.ts
├── context/
│   └── AuthContext.tsx
└── tests/
    └── engine.test.mjs
```

## 10. Security, Privacy, Compliance

Non-negotiable once this holds real people's trip data:
- Real auth, properly managed sessions — no shortcuts, once you move past the current client-side auth context
- Never expose provider API keys client-side; every external call proxies through a backend once one exists
- Users can export and delete their trip data on request
- Publish a privacy policy and ToS before any public launch — you're storing travel plans and possibly booking references
- Rate-limit your own API to protect infrastructure and upstream API quotas, once a backend exists to rate-limit

## 11. Deployment (as actually built)

No database or worker needed yet — everything runs client-side today:
- **Web:** Vercel — single app, nothing else to stand up for the hackathon
- **When real persistence is added:** MongoDB Atlas + real auth; a worker service (Railway/Render/Fly.io) only enters the picture once you add background API polling — not before

## 12. Using This With Antigravity

Antigravity has no dedicated "project context" upload screen — its context comes from the repo itself, `.agents/rules/` files (auto-loaded every session), Knowledge Items it accumulates over time, and whatever you tell a task in the Manager view. Save this document as `.agents/rules/project-context.md` in the repo (or keep it at `docs/PRD.md` and just point the agent at it) so it's read automatically instead of re-pasted each session. Given how much of Phase 0/1 already exists, your next task should be verification and gap-filling, not scaffolding: "read the plan, confirm the disruption trigger reaches RecoveryEngine → RiskScorer → geminiAgent end-to-end, fix whatever's broken in that chain" — before asking for anything in Phase 2.
