"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 0,
    fun: false,
    emoji: "👤",
    question: "What best describes how you'll mostly use this car?",
    subtitle: "Pick the one that fits your life",
    options: [
      { label: "Daily commute", emoji: "🏙️", value: "commuter" },
      { label: "Family hauler", emoji: "👨‍👩‍👧", value: "family" },
      { label: "Weekend adventures", emoji: "🏔️", value: "adventure" },
      { label: "A little of everything", emoji: "🔀", value: "mixed" },
    ],
  },
  {
    id: 1,
    fun: false,
    emoji: "💰",
    question: "What's your budget?",
    subtitle: "We'll only show you what's actually in your range",
    options: [
      { label: "Under $20,000", emoji: "💵", value: "20000" },
      { label: "$20,000 – $30,000", emoji: "💵💵", value: "30000" },
      { label: "$30,000 – $45,000", emoji: "💵💵💵", value: "45000" },
      { label: "$45,000+", emoji: "🤑", value: "999999" },
    ],
  },
  {
    id: 2,
    fun: false,
    emoji: "🪑",
    question: "How many seats do you need?",
    subtitle: "Be honest — how many people are usually in the car?",
    options: [
      { label: "Just me (2 is fine)", emoji: "🧍", value: "2" },
      { label: "Me + a few (4–5 seats)", emoji: "👥", value: "5" },
      { label: "Crew mode (6–7 seats)", emoji: "👨‍👩‍👧‍👦", value: "7" },
      { label: "Full squad (8+ seats)", emoji: "🚌", value: "8" },
    ],
  },
  {
    id: 3,
    fun: true,
    emoji: "☕",
    question: "Most important thing in a car — be honest.",
    subtitle: "This one's just for fun (sort of)",
    options: [
      { label: "Perfect cupholder placement", emoji: "☕", value: "cup" },
      { label: "A killer sound system", emoji: "🎵", value: "sound" },
      { label: "Heated seats on cold mornings", emoji: "🌡️", value: "heat" },
      { label: "Tons of USB ports", emoji: "🔌", value: "usb" },
    ],
  },
  {
    id: 4,
    fun: false,
    emoji: "⛽",
    question: "How do you feel about fuel?",
    subtitle: "Gas prices are real — what matters to you?",
    options: [
      { label: "Great MPG is a must", emoji: "📉", value: "efficient" },
      { label: "Hybrid sounds nice", emoji: "🔋", value: "hybrid" },
      { label: "Full electric, please", emoji: "⚡", value: "electric" },
      { label: "Don't really care", emoji: "🤷", value: "any" },
    ],
  },
  {
    id: 5,
    fun: false,
    emoji: "📦",
    question: "How much cargo space do you need?",
    subtitle: "Think about your typical week",
    options: [
      { label: "I travel light", emoji: "🎒", value: "small" },
      { label: "Groceries & everyday stuff", emoji: "🛒", value: "medium" },
      { label: "Sports gear & road trip bags", emoji: "🏕️", value: "large" },
      { label: "I basically move furniture", emoji: "🛋️", value: "xl" },
    ],
  },
  {
    id: 6,
    fun: true,
    emoji: "🎨",
    question: "If your car had a vibe, what would it be?",
    subtitle: "We won't judge. Much.",
    options: [
      { label: "Sleek & mysterious", emoji: "🖤", value: "sleek" },
      { label: "Clean & minimal", emoji: "🤍", value: "clean" },
      { label: "Bold & loud", emoji: "❤️", value: "bold" },
      { label: "Rugged & outdoorsy", emoji: "🌿", value: "rugged" },
    ],
  },
  {
    id: 7,
    fun: false,
    emoji: "⭐",
    question: "What matters most to you in a car?",
    subtitle: "Pick your top priority",
    options: [
      { label: "Safety & driver assists", emoji: "🛡️", value: "safety" },
      { label: "Tech & connectivity", emoji: "📱", value: "tech" },
      { label: "Comfort & premium feel", emoji: "💺", value: "comfort" },
      { label: "Power & performance", emoji: "🏎️", value: "performance" },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  color: string | null;
  msrp: number;
  mileage: number;
  features: string[];
}

type Answers = Record<number, string>;

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreVehicle(vehicle: Vehicle, answers: Answers): number {
  let score = 0;
  const features = vehicle.features.map((f) => f.toLowerCase());
  const featureStr = features.join(" ");

  // Budget match (answer[1] = maxPrice string)
  const maxPrice = parseInt(answers[1] ?? "999999");
  if (vehicle.msrp <= maxPrice) score += 30;
  else return -1; // hard exclude over budget

  // Seats (answer[2])
  const seats = parseInt(answers[2] ?? "5");
  if (seats >= 7 && (featureStr.includes("3rd row") || featureStr.includes("third row") || featureStr.includes("7-passenger") || featureStr.includes("8-passenger"))) score += 20;
  else if (seats >= 7) score += 0;
  else if (seats <= 2) score += 15; // small cars fine for solo
  else score += 15;

  // Fuel (answer[4])
  const fuel = answers[4];
  if (fuel === "hybrid" && (featureStr.includes("hybrid") || featureStr.includes("hev"))) score += 20;
  else if (fuel === "electric" && (featureStr.includes("electric") || featureStr.includes("ev") || featureStr.includes("bev"))) score += 20;
  else if (fuel === "efficient" && (featureStr.includes("mpg") || featureStr.includes("eco"))) score += 15;
  else if (fuel === "any") score += 10;
  else score += 5;

  // Cargo (answer[5])
  const cargo = answers[5];
  if ((cargo === "large" || cargo === "xl") && (featureStr.includes("cargo") || featureStr.includes("suv") || featureStr.includes("truck") || featureStr.includes("van"))) score += 15;
  else if (cargo === "small" || cargo === "medium") score += 10;
  else score += 5;

  // Priority feature (answer[7])
  const priority = answers[7];
  if (priority === "safety" && (featureStr.includes("safety") || featureStr.includes("blind spot") || featureStr.includes("lane") || featureStr.includes("collision"))) score += 15;
  else if (priority === "tech" && (featureStr.includes("apple carplay") || featureStr.includes("android auto") || featureStr.includes("navigation") || featureStr.includes("wireless"))) score += 15;
  else if (priority === "comfort" && (featureStr.includes("leather") || featureStr.includes("heated") || featureStr.includes("premium") || featureStr.includes("sunroof"))) score += 15;
  else if (priority === "performance" && (featureStr.includes("turbo") || featureStr.includes("v6") || featureStr.includes("awd") || featureStr.includes("sport"))) score += 15;
  else score += 5;

  // Lifestyle bonus (answer[0])
  const lifestyle = answers[0];
  if (lifestyle === "adventure" && (featureStr.includes("awd") || featureStr.includes("4wd") || featureStr.includes("off-road") || featureStr.includes("suv"))) score += 10;
  if (lifestyle === "family" && seats >= 5) score += 10;
  if (lifestyle === "commuter" && vehicle.msrp < 35000) score += 5;

  return score;
}

const PERSONALITY: Record<string, { title: string; desc: string; emoji: string }> = {
  adventure: { title: "The Road Warrior", desc: "You live for the journey, not just the destination. You need a car that keeps up.", emoji: "🏔️" },
  family: { title: "The Family MVP", desc: "You're the one driving everyone everywhere. You deserve a car that makes it easy.", emoji: "👨‍👩‍👧" },
  commuter: { title: "The Efficiency Expert", desc: "You know exactly how many miles are between home and work. You want reliability.", emoji: "⚡" },
  mixed: { title: "The Versatile Driver", desc: "One size doesn't fit all your plans. You need a car that adapts.", emoji: "🔀" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CarQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<"quiz" | "loading" | "results">("quiz");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [animKey, setAnimKey] = useState(0);

  const currentQ = QUESTIONS[step];
  const progress = ((step) / QUESTIONS.length) * 100;

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [step]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setAnimKey((k) => k + 1);
      setStep((s) => s + 1);
    } else {
      // Last question — fetch and score inventory
      setPhase("loading");
      const maxPrice = newAnswers[1] ?? "999999";
      const params = new URLSearchParams({ status: "AVAILABLE" });
      if (maxPrice !== "999999") params.set("maxPrice", maxPrice);

      try {
        const res = await fetch(`/api/inventory?${params}`);
        const data = await res.json();
        const scored = (data.vehicles as Vehicle[])
          .map((v) => ({ v, score: scoreVehicle(v, newAnswers) }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map((x) => x.v);
        setVehicles(scored);
      } catch {
        setVehicles([]);
      }
      setPhase("results");
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setPhase("quiz");
    setVehicles([]);
    setAnimKey((k) => k + 1);
  };

  const personality = PERSONALITY[answers[0] ?? "mixed"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .quiz-root {
          min-height: 100vh;
          background: #F2F4F7;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }
        .quiz-nav {
          background: #fff;
          border-bottom: 1px solid #E2E6EB;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .quiz-nav-back {
          font-size: 13px;
          color: #1553A2;
          font-weight: 600;
          text-decoration: none;
        }
        .quiz-nav-back:hover { text-decoration: underline; }
        .quiz-nav-title {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          letter-spacing: 0.01em;
        }
        .quiz-nav-counter {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        /* Progress bar */
        .quiz-progress-track {
          height: 3px;
          background: #E5E7EB;
          width: 100%;
        }
        .quiz-progress-fill {
          height: 100%;
          background: #1553A2;
          transition: width 0.4s ease;
          border-radius: 0 2px 2px 0;
        }

        /* Main area */
        .quiz-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }
        .quiz-card {
          background: #fff;
          border: 1px solid #E2E6EB;
          border-radius: 16px;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          overflow: hidden;
        }

        /* Question slide */
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .quiz-slide {
          animation: slideIn 0.28s ease forwards;
          padding: 36px 36px 32px;
        }

        .quiz-fun-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #FEF3C7;
          color: #92400E;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 14px;
        }
        .quiz-q-emoji {
          font-size: 32px;
          margin-bottom: 10px;
          display: block;
        }
        .quiz-q-text {
          font-size: 20px;
          font-weight: 800;
          color: #101828;
          letter-spacing: -0.3px;
          line-height: 1.25;
          margin-bottom: 6px;
        }
        .quiz-q-sub {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 24px;
          font-weight: 400;
        }

        /* Options grid */
        .quiz-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .quiz-option {
          background: #F9FAFB;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px 14px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s, transform 0.1s;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .quiz-option:hover {
          border-color: #1553A2;
          background: #EFF6FF;
          transform: translateY(-1px);
        }
        .quiz-option:active { transform: scale(0.98); }
        .quiz-option-emoji {
          font-size: 22px;
          line-height: 1;
        }
        .quiz-option-label {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
        }

        @media (max-width: 480px) {
          .quiz-slide { padding: 24px 20px 20px; }
          .quiz-options { grid-template-columns: 1fr; }
          .quiz-q-text { font-size: 17px; }
        }

        /* Loading */
        .quiz-loading {
          padding: 60px 36px;
          text-align: center;
        }
        .quiz-loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #E5E7EB;
          border-top-color: #1553A2;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .quiz-loading-title {
          font-size: 18px;
          font-weight: 800;
          color: #101828;
          margin-bottom: 6px;
        }
        .quiz-loading-sub {
          font-size: 13px;
          color: #6B7280;
        }

        /* Results */
        .quiz-results {
          padding: 32px 36px 36px;
        }
        .quiz-results-personality {
          background: linear-gradient(135deg, #1553A2 0%, #1e40af 100%);
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .quiz-results-personality-emoji {
          font-size: 36px;
          flex-shrink: 0;
        }
        .quiz-results-personality-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 3px;
        }
        .quiz-results-personality-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 4px;
        }
        .quiz-results-personality-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.75);
          line-height: 1.4;
        }

        .quiz-results-heading {
          font-size: 15px;
          font-weight: 800;
          color: #101828;
          margin-bottom: 12px;
        }
        .quiz-results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .quiz-vehicle-card {
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .quiz-vehicle-card:hover {
          border-color: #1553A2;
          box-shadow: 0 2px 12px rgba(21,83,162,0.1);
        }
        .quiz-vehicle-img {
          height: 80px;
          background: linear-gradient(135deg, #EEF1F5, #DDE2EA);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .quiz-vehicle-info {
          padding: 10px 12px;
        }
        .quiz-vehicle-name {
          font-size: 12px;
          font-weight: 700;
          color: #101828;
          line-height: 1.3;
          margin-bottom: 2px;
        }
        .quiz-vehicle-price {
          font-size: 13px;
          font-weight: 800;
          color: #1553A2;
        }
        .quiz-vehicle-trim {
          font-size: 10px;
          color: #6B7280;
          margin-top: 1px;
        }
        .quiz-no-results {
          text-align: center;
          padding: 24px;
          color: #6B7280;
          font-size: 14px;
          background: #F9FAFB;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .quiz-cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .quiz-cta-primary {
          flex: 1;
          background: #1553A2;
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 12px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .quiz-cta-primary:hover { background: #104488; }
        .quiz-cta-secondary {
          background: #F3F4F6;
          color: #374151;
          border: none;
          border-radius: 9px;
          padding: 12px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .quiz-cta-secondary:hover { background: #E5E7EB; }

        @media (max-width: 480px) {
          .quiz-results { padding: 20px 20px 24px; }
          .quiz-results-grid { grid-template-columns: 1fr; }
          .quiz-cta-row { flex-direction: column; }
          .quiz-cta-primary { flex: unset; }
        }
      `}</style>

      <div className="quiz-root">
        <nav className="quiz-nav">
          <Link href="/customer/dashboard" className="quiz-nav-back">← Dashboard</Link>
          <span className="quiz-nav-title">Find My Perfect Car</span>
          {phase === "quiz" && (
            <span className="quiz-nav-counter">{step + 1} / {QUESTIONS.length}</span>
          )}
          {phase !== "quiz" && <span />}
        </nav>

        {phase === "quiz" && (
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="quiz-body">
          <div className="quiz-card">

            {/* Quiz phase */}
            {phase === "quiz" && (
              <div className="quiz-slide" key={animKey}>
                {currentQ.fun && (
                  <div className="quiz-fun-badge">🎉 Just for fun</div>
                )}
                <span className="quiz-q-emoji">{currentQ.emoji}</span>
                <div className="quiz-q-text">{currentQ.question}</div>
                <div className="quiz-q-sub">{currentQ.subtitle}</div>
                <div className="quiz-options">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.value}
                      className="quiz-option"
                      onClick={() => handleAnswer(opt.value)}
                    >
                      <span className="quiz-option-emoji">{opt.emoji}</span>
                      <span className="quiz-option-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading phase */}
            {phase === "loading" && (
              <div className="quiz-loading">
                <div className="quiz-loading-spinner" />
                <div className="quiz-loading-title">Finding your matches…</div>
                <div className="quiz-loading-sub">Searching our inventory based on your answers</div>
              </div>
            )}

            {/* Results phase */}
            {phase === "results" && (
              <div className="quiz-results">
                <div className="quiz-results-personality">
                  <span className="quiz-results-personality-emoji">{personality.emoji}</span>
                  <div>
                    <div className="quiz-results-personality-label">Your driver profile</div>
                    <div className="quiz-results-personality-title">{personality.title}</div>
                    <div className="quiz-results-personality-desc">{personality.desc}</div>
                  </div>
                </div>

                <div className="quiz-results-heading">
                  {vehicles.length > 0
                    ? `${vehicles.length} vehicle${vehicles.length > 1 ? "s" : ""} matched from our inventory`
                    : "No exact matches found"}
                </div>

                {vehicles.length > 0 ? (
                  <div className="quiz-results-grid">
                    {vehicles.map((v) => (
                      <div key={v.vin} className="quiz-vehicle-card">
                        <div className="quiz-vehicle-img">🚗</div>
                        <div className="quiz-vehicle-info">
                          <div className="quiz-vehicle-name">{v.year} {v.make} {v.model}</div>
                          {v.trim && <div className="quiz-vehicle-trim">{v.trim}</div>}
                          <div className="quiz-vehicle-price">${v.msrp.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="quiz-no-results">
                    No vehicles in our current inventory match all your criteria. Try chatting with Alex — we may have incoming stock that fits!
                  </div>
                )}

                <div className="quiz-cta-row">
                  <Link href="/customer/chat" className="quiz-cta-primary">
                    Chat with Alex about these →
                  </Link>
                  <button className="quiz-cta-secondary" onClick={restart}>
                    Retake quiz
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
