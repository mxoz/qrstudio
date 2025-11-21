"use client";

import React, { useState, useCallback } from "react";

const monoFont =
  '"JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
// bewusst kompatible Sonderzeichen, die fast überall akzeptiert werden
const SYMBOLS = "!@#$%&*?-_+";

function getCryptoRandomInt(max: number): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PasswordGeneratorPage() {
  const [darkMode, setDarkMode] = useState(true);

  const [length, setLength] = useState(16);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const background = darkMode
    ? "radial-gradient(circle at 20% 20%, #0b102a, #050816 60%)"
    : "radial-gradient(circle at 20% 20%, #dbe4ff, #f3f4f7 60%)";

  const baseTextColor = darkMode ? "#e5e7eb" : "#111827";
  const mutedTextColor = darkMode ? "#9ca3af" : "#6b7280";

  const cardBg = darkMode
    ? "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))"
    : "linear-gradient(145deg, #ffffff, #eef2ff)";

  const cardBorder = darkMode
    ? "1px solid rgba(148,163,184,0.35)"
    : "1px solid rgba(148,163,184,0.35)";

  const inputBg = darkMode ? "rgba(15,23,42,0.9)" : "#f9fafb";
  const inputBorder = darkMode
    ? "1px solid rgba(148,163,184,0.45)"
    : "1px solid rgba(148,163,184,0.55)";

  const canGenerate =
    includeLower || includeUpper || includeDigits || includeSymbols;

  const generatePassword = useCallback(() => {
    if (!canGenerate || typeof window === "undefined" || !window.crypto) {
      return;
    }

    const sets: string[] = [];
    if (includeLower) sets.push(LOWER);
    if (includeUpper) sets.push(UPPER);
    if (includeDigits) sets.push(DIGITS);
    if (includeSymbols) sets.push(SYMBOLS);

    if (sets.length === 0) return;

    const allChars = sets.join("");
    const chars: string[] = [];

    // Sicherstellen: mindestens ein Zeichen pro aktivem Set
    for (const set of sets) {
      const idx = getCryptoRandomInt(set.length);
      chars.push(set[idx]);
    }

    // Rest mit beliebigen Zeichen auffüllen
    for (let i = chars.length; i < length; i++) {
      const idx = getCryptoRandomInt(allChars.length);
      chars.push(allChars[idx]);
    }

    const shuffled = shuffleArray(chars);
    setPassword(shuffled.join(""));
    setCopied(false);
  }, [canGenerate, includeLower, includeUpper, includeDigits, includeSymbols, length]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignorieren – kein Clipboard verfügbar
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 md:px-10 py-8 md:py-10"
      style={{
        background,
        color: baseTextColor,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
      }}
    >
      <div className="max-w-5xl w-full">
        {/* Top-Bar */}
        <header
          style={{
            borderRadius: 999,
            padding: "10px 18px",
            marginBottom: 24,
            background: darkMode
              ? "rgba(15,23,42,0.9)"
              : "rgba(255,255,255,0.95)",
            border: "1px solid rgba(148,163,184,0.35)",
            backdropFilter: "blur(20px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            PWDGEN
          </span>

          <button
            onClick={() => setDarkMode((v) => !v)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(15,23,42,0.06)",
              border: "1px solid rgba(148,163,184,0.35)",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: mutedTextColor,
              cursor: "pointer",
            }}
          >
            <span>{darkMode ? "🌙" : "☀️"}</span>
            <span>{darkMode ? "Dark UI" : "Light UI"}</span>
          </button>
        </header>

        <main className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
          {/* Linke Card: Einstellungen */}
          <section
            style={{
              borderRadius: 22,
              padding: "18px 18px 16px",
              background: cardBg,
              border: cardBorder,
              boxShadow: "0 24px 60px rgba(15,23,42,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.4rem", margin: 0 }}>
                Passwort Generator
              </h1>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: mutedTextColor,
                  marginTop: 4,
                }}
              >
                Starke Passwörter direkt im Browser. Alles lokal, ohne Server.
              </p>
            </div>

            {/* Länge */}
            <div
              style={{
                marginTop: 4,
                borderTop: "1px solid rgba(148,163,184,0.35)",
                paddingTop: 10,
              }}
            >
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  marginBottom: 6,
                  color: mutedTextColor,
                }}
              >
                <span>Passwortlänge</span>
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: "0.85rem",
                    color: baseTextColor,
                  }}
                >
                  {length} Zeichen
                </span>
              </label>
              <input
                type="range"
                min={8}
                max={128}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                style={{
                  width: "100%",
                  accentColor: "#6366f1",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 2,
                  fontSize: "0.75rem",
                  color: mutedTextColor,
                }}
              >
                <span>8</span>
                <span>128</span>
              </div>
            </div>

            {/* Zeichensätze */}
            <div
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: 8,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.85rem",
                  color: mutedTextColor,
                }}
              >
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                />
                Kleinbuchstaben (a–z)
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.85rem",
                  color: mutedTextColor,
                }}
              >
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                />
                Großbuchstaben (A–Z)
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.85rem",
                  color: mutedTextColor,
                }}
              >
                <input
                  type="checkbox"
                  checked={includeDigits}
                  onChange={(e) => setIncludeDigits(e.target.checked)}
                />
                Zahlen (0–9)
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.85rem",
                  color: mutedTextColor,
                }}
              >
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                />
                Sonderzeichen ({SYMBOLS})
              </label>
            </div>

            {!canGenerate && (
              <p
                style={{
                  marginTop: 6,
                  fontSize: "0.8rem",
                  color: "#f97373",
                }}
              >
                Mindestens einen Zeichentyp auswählen, um ein Passwort zu
                erzeugen.
              </p>
            )}

            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={generatePassword}
                disabled={!canGenerate}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(191,219,254,0.6)",
                  background: canGenerate
                    ? "linear-gradient(135deg, #4f46e5, #6366f1)"
                    : "rgba(148,163,184,0.35)",
                  color: "#eef2ff",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  boxShadow: canGenerate
                    ? "0 14px 35px rgba(79,70,229,0.6)"
                    : "none",
                  opacity: canGenerate ? 1 : 0.6,
                }}
              >
                Passwort generieren
              </button>
            </div>
          </section>

          {/* Rechte Card: Ergebnis */}
          <section
            style={{
              borderRadius: 22,
              padding: "18px 18px 16px",
              background: cardBg,
              border: cardBorder,
              boxShadow: "0 24px 60px rgba(15,23,42,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Ergebnis</h2>

            <div
              style={{
                marginTop: 6,
                borderRadius: 16,
                border: "1px solid rgba(148,163,184,0.45)",
                background: inputBg,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontFamily: monoFont,
                  fontSize: "0.9rem",
                  wordBreak: "break-all",
                  color: password ? baseTextColor : mutedTextColor,
                }}
              >
                {password || "Noch kein Passwort generiert."}
              </div>
              <button
                onClick={handleCopy}
                disabled={!password}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: password
                    ? "rgba(79,70,229,0.2)"
                    : "rgba(148,163,184,0.2)",
                  color: password ? "#c7d2fe" : mutedTextColor,
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  cursor: password ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "Kopiert ✔" : "Kopieren"}
              </button>
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: "0.8rem",
                color: mutedTextColor,
                borderRadius: 14,
                border: "1px dashed rgba(148,163,184,0.45)",
                padding: "10px 12px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>
                  Passwörter werden nur im Browser erzeugt – keine Übertragung
                  an einen Server.
                </li>
                <li>
                  Für kritische Konten zusätzlich einen Passwort-Manager
                  verwenden.
                </li>
                <li>
                  Längere Passwörter (&gt;= 16 Zeichen) sind deutlich schwerer zu
                  knacken.
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
