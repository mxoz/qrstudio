"use client";

import React, { useEffect, useState } from "react";

const monoFont =
  '"JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

type IpWhoResponse = {
  ip?: string;
  success?: boolean;
  message?: string;
  type?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_eu?: boolean;
  postal?: string;
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    abbr?: string;
    is_dst?: boolean;
    offset?: number;
    utc?: string;
    current_time?: string;
  };
  security?: {
    anonymous?: boolean;
    proxy?: boolean;
    vpn?: boolean;
    tor?: boolean;
    hosting?: boolean;
  };
};

type NetConnection = {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
};

export default function IpInfoPage() {
  const [darkMode, setDarkMode] = useState(true);

  const [ipData, setIpData] = useState<IpWhoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [netConnection, setNetConnection] = useState<NetConnection | null>(
    null
  );

  const background = darkMode
    ? "radial-gradient(circle at 20% 20%, #020617, #02010b 55%, #020617 80%)"
    : "radial-gradient(circle at 20% 20%, #dbe4ff, #f3f4f7 60%)";

  const baseTextColor = darkMode ? "#e5e7eb" : "#111827";
  const mutedTextColor = darkMode ? "#9ca3af" : "#6b7280";

  const cardBg = darkMode
    ? "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))"
    : "linear-gradient(145deg, #ffffff, #eef2ff)";

  const cardBorder = darkMode
    ? "1px solid rgba(148,163,184,0.35)"
    : "1px solid rgba(148,163,184,0.4)";

  const pillBg = darkMode
    ? "rgba(15,23,42,0.85)"
    : "rgba(241,245,249,0.95)";

  useEffect(() => {
    let cancelled = false;

    const fetchIpInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("https://ipwho.is/");
        const json: IpWhoResponse = await res.json();

        if (!json.success) {
          throw new Error(json.message || "IP-Info konnte nicht geladen werden.");
        }

        if (!cancelled) {
          setIpData(json);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unbekannter Fehler beim Laden der IP-Informationen.");
          setIpData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const readNetInfo = () => {
      const nav = navigator as any;
      const conn =
        nav.connection || nav.mozConnection || nav.webkitConnection || null;
      if (conn) {
        setNetConnection({
          downlink: conn.downlink,
          effectiveType: conn.effectiveType,
          rtt: conn.rtt,
          saveData: conn.saveData,
        });
      }
    };

    fetchIpInfo();
    readNetInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopyIp = async () => {
    if (!ipData?.ip) return;
    try {
      await navigator.clipboard.writeText(ipData.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard nicht verfügbar -> ignorieren
    }
  };

  const formatBool = (val: boolean | undefined): string => {
    if (val === undefined) return "unbekannt";
    return val ? "ja" : "nein";
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
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            IPINFO
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

        {/* Titel */}
        <section style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: "1.5rem",
              margin: 0,
            }}
          >
            IP &amp; Network Info
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: mutedTextColor,
              marginTop: 4,
              maxWidth: "40rem",
            }}
          >
            Überblick über deine öffentliche IP, Provider-Infos, ungefähre
            Geolocation und Browser-Netzwerkdaten – alles clientseitig.
          </p>
        </section>

        {/* Grid */}
        <main className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
          {/* Linke Spalte */}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <h2 style={{ fontSize: "1rem", margin: 0 }}>Öffentliche IP</h2>
              <button
                onClick={handleCopyIp}
                disabled={!ipData?.ip}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: ipData?.ip
                    ? "rgba(79,70,229,0.2)"
                    : "rgba(148,163,184,0.2)",
                  color: ipData?.ip ? "#c7d2fe" : mutedTextColor,
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  cursor: ipData?.ip ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "IP kopiert ✔" : "IP kopieren"}
              </button>
            </div>

            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(148,163,184,0.45)",
                background: pillBg,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {loading && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: mutedTextColor,
                  }}
                >
                  Lade IP-Informationen …
                </div>
              )}

              {error && !loading && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#fecaca",
                  }}
                >
                  Fehler: {error}
                </div>
              )}

              {!loading && !error && ipData && (
                <>
                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: "1.1rem",
                    }}
                  >
                    {ipData.ip || "unbekannt"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 4,
                      fontSize: "0.8rem",
                    }}
                  >
                    {ipData.type && (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "3px 8px",
                          background:
                            "linear-gradient(120deg, rgba(79,70,229,0.2), rgba(56,189,248,0.15))",
                          border:
                            "1px solid rgba(129,140,248,0.45)",
                        }}
                      >
                        {ipData.type.toUpperCase()}
                      </span>
                    )}
                    {ipData.country && (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "3px 8px",
                          background: "rgba(15,23,42,0.1)",
                          border:
                            "1px solid rgba(148,163,184,0.45)",
                        }}
                      >
                        {ipData.country}{" "}
                        {ipData.country_code
                          ? `(${ipData.country_code})`
                          : ""}
                      </span>
                    )}
                    {ipData.city && (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "3px 8px",
                          background: "rgba(15,23,42,0.1)",
                          border:
                            "1px solid rgba(148,163,184,0.45)",
                        }}
                      >
                        {ipData.city}
                      </span>
                    )}
                    {ipData.postal && (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "3px 8px",
                          background: "rgba(15,23,42,0.1)",
                          border:
                            "1px solid rgba(148,163,184,0.45)",
                        }}
                      >
                        PLZ {ipData.postal}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Location-Details */}
            <div
              style={{
                marginTop: 6,
                borderTop: "1px solid rgba(148,163,184,0.35)",
                paddingTop: 10,
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                Location
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 8,
                  fontSize: "0.8rem",
                  color: mutedTextColor,
                }}
              >
                <div>
                  <div style={{ opacity: 0.75 }}>Kontinent</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.continent || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Land</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.country || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Region</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.region || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Stadt</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.city || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Koordinaten</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.latitude !== undefined &&
                    ipData?.longitude !== undefined
                      ? `${ipData.latitude.toFixed(
                          3
                        )}, ${ipData.longitude.toFixed(3)}`
                      : "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>EU</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.is_eu === undefined
                      ? "unbekannt"
                      : ipData.is_eu
                      ? "ja"
                      : "nein"}
                  </div>
                </div>
              </div>
            </div>

            {/* Karte (statisch, nur Text-Hinweis / Koordinaten) */}
            <div
              style={{
                marginTop: 10,
                borderRadius: 14,
                border: "1px dashed rgba(148,163,184,0.45)",
                padding: "10px 12px",
                fontSize: "0.8rem",
                color: mutedTextColor,
              }}
            >
              <div style={{ marginBottom: 4 }}>
                Für exakte Kartenansicht kannst du die Koordinaten z.B. in
                OpenStreetMap oder Google Maps nutzen:
              </div>
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: "0.8rem",
                  color: baseTextColor,
                }}
              >
                {ipData?.latitude !== undefined &&
                ipData?.longitude !== undefined
                  ? `${ipData.latitude}, ${ipData.longitude}`
                  : "Koordinaten nicht verfügbar"}
              </div>
            </div>
          </section>

          {/* Rechte Spalte */}
          <section
            style={{
              borderRadius: 22,
              padding: "18px 18px 16px",
              background: cardBg,
              border: cardBorder,
              boxShadow: "0 24px 60px rgba(15,23,42,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Provider / ASN */}
            <div>
              <h2 style={{ fontSize: "1rem", margin: 0 }}>Provider &amp; ASN</h2>
              <div
                style={{
                  marginTop: 8,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                  gap: 8,
                  fontSize: "0.8rem",
                  color: mutedTextColor,
                }}
              >
                <div>
                  <div style={{ opacity: 0.75 }}>ISP</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.connection?.isp || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Organisation</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.connection?.org || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>ASN</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.connection?.asn
                      ? `AS${ipData.connection.asn}`
                      : "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Domain</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.connection?.domain || "unbekannt"}
                  </div>
                </div>
              </div>
            </div>

            {/* Zeitzone */}
            <div
              style={{
                paddingTop: 8,
                borderTop: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                Zeitzone
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 8,
                  fontSize: "0.8rem",
                  color: mutedTextColor,
                }}
              >
                <div>
                  <div style={{ opacity: 0.75 }}>ID</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.timezone?.id || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Abkürzung</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.timezone?.abbr || "unbekannt"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Aktuelle Zeit</div>
                  <div style={{ color: baseTextColor }}>
                    {ipData?.timezone?.current_time ||
                      "nicht vom Dienst gemeldet"}
                  </div>
                </div>
              </div>
            </div>

            {/* Sicherheits-Einschätzung */}
            <div
              style={{
                paddingTop: 8,
                borderTop: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                Sicherheitsindikatoren
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 8,
                  fontSize: "0.8rem",
                  color: mutedTextColor,
                }}
              >
                <div>
                  <div style={{ opacity: 0.75 }}>VPN</div>
                  <div style={{ color: baseTextColor }}>
                    {formatBool(ipData?.security?.vpn)}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Proxy</div>
                  <div style={{ color: baseTextColor }}>
                    {formatBool(ipData?.security?.proxy)}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Tor</div>
                  <div style={{ color: baseTextColor }}>
                    {formatBool(ipData?.security?.tor)}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Hosting / Rechenzentrum</div>
                  <div style={{ color: baseTextColor }}>
                    {formatBool(ipData?.security?.hosting)}
                  </div>
                </div>
              </div>
            </div>

            {/* Browser-Netzwerkdaten */}
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                Browser-Netzwerk (navigator.connection)
              </h3>
              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.45)",
                  background: pillBg,
                  padding: "10px 12px",
                  fontSize: "0.8rem",
                  color: mutedTextColor,
                }}
              >
                {netConnection ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit,minmax(150px,1fr))",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ opacity: 0.75 }}>Downlink</div>
                      <div style={{ color: baseTextColor }}>
                        {netConnection.downlink !== undefined
                          ? `${netConnection.downlink} Mbit/s (geschätzt)`
                          : "unbekannt"}
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.75 }}>Effektiver Typ</div>
                      <div style={{ color: baseTextColor }}>
                        {netConnection.effectiveType || "unbekannt"}
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.75 }}>RTT (geschätzt)</div>
                      <div style={{ color: baseTextColor }}>
                        {netConnection.rtt !== undefined
                          ? `${netConnection.rtt} ms`
                          : "unbekannt"}
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.75 }}>Daten sparen</div>
                      <div style={{ color: baseTextColor }}>
                        {netConnection.saveData
                          ? "ja (vom Browser gewünscht)"
                          : "nein"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    Dein Browser liefert keine{" "}
                    <code style={{ fontFamily: monoFont }}>
                      navigator.connection
                    </code>
                    -Informationen. Auf Desktop-Browsern ist das normal.
                  </div>
                )}
              </div>
            </div>

            {/* Hinweis */}
            <div
              style={{
                fontSize: "0.8rem",
                color: mutedTextColor,
                borderRadius: 14,
                border: "1px dashed rgba(148,163,184,0.45)",
                padding: "10px 12px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>
                  Alle Daten basieren auf einem GeoIP-Dienst (ipwho.is) und
                  Browser-APIs – es können Abweichungen auftreten.
                </li>
                <li>
                  Für interne Diagnosen (Ping, Traceroute, Portscans) ist
                  weiterhin ein lokales Tool oder ein Backend nötig.
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
