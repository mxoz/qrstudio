"use client";

import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true);

  const background = darkMode
    ? "radial-gradient(circle at 20% 20%, #0b102a, #050816 60%)"
    : "radial-gradient(circle at 20% 20%, #dbe4ff, #f3f4f7 60%)";

  const baseTextColor = darkMode ? "#e5e7eb" : "#111827";
  const mutedTextColor = darkMode ? "#9ca3af" : "#6b7280";

  const tileBorderPrimary = darkMode
    ? "1px solid rgba(129,140,248,0.6)"
    : "1px solid rgba(79,70,229,0.6)";

  const tileBgPrimary = darkMode
    ? "radial-gradient(circle at top left, rgba(79,70,229,0.35), transparent 55%), rgba(15,23,42,0.95)"
    : "radial-gradient(circle at top left, rgba(129,140,248,0.25), transparent 55%), #ffffff";

  const tileBgPlaceholder = darkMode
    ? "rgba(15,23,42,0.8)"
    : "rgba(241,245,249,0.9)";

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
        {/* TOP BAR */}
        <header
          style={{
            borderRadius: 999,
            padding: "10px 18px",
            marginBottom: 24,
            background: darkMode
              ? "rgba(15,23,42,0.9)"
              : "rgba(255,255,255,0.95)",
            border: darkMode
              ? "1px solid rgba(148,163,184,0.35)"
              : "1px solid rgba(148,163,184,0.5)",
            backdropFilter: "blur(20px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Dashboard
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

        {/* TITLE + SUBTITLE */}
        <section style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: '"JetBrains Mono", Menlo, Monaco, monospace',
              fontSize: "3.4rem",
              fontWeight: 600,
              letterSpacing: "0.03em",
              marginBottom: "4px",
              color: darkMode ? "#c7d2fe" : "#1e293b",
              textShadow: darkMode
                ? "0 0 25px rgba(99,102,241,0.55)"
                : "0 0 12px rgba(99,102,241,0.25)",
            }}
          >
            mx:omnitools
          </h1>

          <div
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: mutedTextColor,
              marginBottom: 10,
            }}
          >
            Suite
          </div>

        </section>

        {/* MODULE GRID */}
        <section className="grid gap-4 md:gap-6 md:grid-cols-3">
          {/* Modul 1: QR Studio */}
          <Link href="/qr-studio" className="no-underline">
            <div
              style={{
                borderRadius: 22,
                padding: "18px 18px 20px",
                background: tileBgPrimary,
                border: tileBorderPrimary,
                boxShadow: darkMode
                  ? "0 18px 45px rgba(0,0,0,0.45)"
                  : "0 10px 25px rgba(15,23,42,0.12)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  opacity: 0.6,
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Modul
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                QR Studio
              </div>
              <p style={{ opacity: 0.75, fontSize: "0.85rem" }}>
                Erstellung von QR-Codes mit Farben, Logos, Fehlerkorrektur und
                Exportgrößen von 128px bis 2048px.
              </p>
            </div>
          </Link>

          {/* Modul 2: Passwortgenerator */}
          <Link href="/passwords" className="no-underline">
            <div
              style={{
                borderRadius: 22,
                padding: "18px 18px 20px",
                background: tileBgPrimary,
                border: tileBorderPrimary,
                boxShadow: darkMode
                  ? "0 18px 45px rgba(0,0,0,0.45)"
                  : "0 10px 25px rgba(15,23,42,0.12)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  opacity: 0.6,
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Modul
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Passwortgenerator
              </div>
              <p style={{ opacity: 0.75, fontSize: "0.85rem" }}>
                Sichere Passwörter direkt im Browser generieren – mit
                konfigurierbarer Länge und Zeichentypen.
              </p>
            </div>
          </Link>

          {/* Modul 3: IP Info */}
          <Link href="/ip-info" className="no-underline">
            <div
              style={{
                borderRadius: 22,
                padding: "18px 18px 20px",
                background: tileBgPrimary,
                border: tileBorderPrimary,
                boxShadow: darkMode
                  ? "0 18px 45px rgba(0,0,0,0.45)"
                  : "0 10px 25px rgba(15,23,42,0.12)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  opacity: 0.6,
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Modul
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                IP &amp; Network Info
              </div>
              <p style={{ opacity: 0.75, fontSize: "0.85rem" }}>
                Öffentliche IP, Provider, Geolocation und
                Browser-Netzwerkdaten auf einen Blick – alles clientseitig
                ermittelt.
              </p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
