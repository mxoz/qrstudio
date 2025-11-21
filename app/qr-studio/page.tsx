"use client";

import React, { useEffect, useRef, useState } from "react";

type DotsType =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";
type DownloadFormat = "png" | "svg";
type ContentType = "text" | "wifi" | "email" | "sms" | "tel" | "vcard";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

const PREVIEW_SIZE = 320;

export default function Page() {
  const ref = useRef<HTMLDivElement | null>(null);
  const qrInstance = useRef<any | null>(null);

  const clampExportSize = (value: number) => {
    const v = Number.isFinite(value) ? value : 1024;
    return Math.min(2048, Math.max(128, v));
  };

  // UI-Theme (nur Oberfläche, nicht QR-Farben)
  const [uiTheme, setUiTheme] = useState<"dark" | "light">("dark");
  const isDark = uiTheme === "dark";

  // Inhaltstyp
  const [contentType, setContentType] = useState<ContentType>("text");

  // Content-States
  const [textValue, setTextValue] = useState("https://example.com");

  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [smsTo, setSmsTo] = useState("");
  const [smsBody, setSmsBody] = useState("");

  const [telNumber, setTelNumber] = useState("");

  const [vcardFirst, setVcardFirst] = useState("");
  const [vcardLast, setVcardLast] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");
  const [vcardTel, setVcardTel] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");

  // Design-States
  const [dotsType, setDotsType] = useState<DotsType>("rounded");
  const [dotsColor, setDotsColor] = useState("#111111");
  const [cornerSquareColor, setCornerSquareColor] = useState("#111111");
  const [cornerDotColor, setCornerDotColor] = useState("#4f46e5");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [exportSize, setExportSize] = useState(1024); // nur für Download
  const [animatedBg, setAnimatedBg] = useState(false);
  const [downloadFormat, setDownloadFormat] =
    useState<DownloadFormat>("png");
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("H");

  // qr-code-styling nur im Browser laden und Instanz erzeugen
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const mod = await import("qr-code-styling");
      const QRCodeStyling = (mod as any).default;

      if (!ref.current || cancelled) return;

      const instance = new QRCodeStyling({
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        type: "canvas",
        data: "https://example.com",
        margin: 12,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        dotsOptions: {
          type: "rounded",
          color: "#111111",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#111111",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#4f46e5",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
      });

      qrInstance.current = instance;
      instance.append(ref.current);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Helfer fürs WIFI-Format
  const escapeWifiValue = (value: string) =>
    value.replace(/([\\;,:"])/g, "\\$1");

  // vCard-Build
  const buildVcard = () => {
    if (!vcardFirst && !vcardLast && !vcardOrg && !vcardTel && !vcardEmail) {
      return "";
    }
    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${vcardLast};${vcardFirst};;;`,
      `FN:${[vcardFirst, vcardLast].filter(Boolean).join(" ") || vcardOrg}`,
    ];
    if (vcardOrg) lines.push(`ORG:${vcardOrg}`);
    if (vcardTel) lines.push(`TEL;TYPE=CELL,VOICE:${vcardTel}`);
    if (vcardEmail) lines.push(`EMAIL;TYPE=INTERNET:${vcardEmail}`);
    lines.push("END:VCARD");
    return lines.join("\n");
  };

  // Daten aus Formularfeldern generieren
  const buildDataFromForm = (): string => {
    switch (contentType) {
      case "text": {
        return textValue.trim();
      }
      case "wifi": {
        if (!wifiSsid.trim()) return "";
        let wifi = "WIFI:";
        wifi += `T:${wifiAuth};`;
        wifi += `S:${escapeWifiValue(wifiSsid.trim())};`;
        if (wifiAuth !== "nopass" && wifiPassword) {
          wifi += `P:${escapeWifiValue(wifiPassword)};`;
        }
        if (wifiHidden) {
          wifi += "H:true;";
        }
        wifi += ";";
        return wifi;
      }
      case "email": {
        if (!emailTo.trim()) return "";
        const params: string[] = [];
        if (emailSubject.trim()) {
          params.push("subject=" + encodeURIComponent(emailSubject.trim()));
        }
        if (emailBody.trim()) {
          params.push("body=" + encodeURIComponent(emailBody.trim()));
        }
        const query = params.length ? "?" + params.join("&") : "";
        return `mailto:${encodeURIComponent(emailTo.trim())}${query}`;
      }
      case "sms": {
        if (!smsTo.trim()) return "";
        if (smsBody.trim()) {
          return `SMSTO:${smsTo.trim()}:${smsBody.trim()}`;
        }
        return `SMSTO:${smsTo.trim()}:`;
      }
      case "tel": {
        if (!telNumber.trim()) return "";
        return `tel:${telNumber.trim()}`;
      }
      case "vcard": {
        return buildVcard();
      }
      default:
        return "";
    }
  };

  // QR-Vorschau (immer PREVIEW_SIZE)
  useEffect(() => {
    if (!qrInstance.current) return;

    const data = buildDataFromForm();

    qrInstance.current.update({
      data: data || " ",
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      backgroundOptions: { color: bgColor },
      dotsOptions: {
        type: dotsType,
        color: dotsColor,
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: cornerSquareColor,
      },
      cornersDotOptions: {
        type: "dot",
        color: cornerDotColor,
      },
      qrOptions: {
        errorCorrectionLevel,
      },
      image: logoUrl || undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: 0.28,
      },
    });
  }, [
    contentType,
    textValue,
    wifiSsid,
    wifiAuth,
    wifiPassword,
    wifiHidden,
    emailTo,
    emailSubject,
    emailBody,
    smsTo,
    smsBody,
    telNumber,
    vcardFirst,
    vcardLast,
    vcardOrg,
    vcardTel,
    vcardEmail,
    dotsType,
    dotsColor,
    cornerSquareColor,
    cornerDotColor,
    bgColor,
    logoUrl,
    errorCorrectionLevel,
  ]);

  const handleDownload = async () => {
    if (!qrInstance.current) return;

    const data = buildDataFromForm();

    const baseConfig = {
      data: data || " ",
      backgroundOptions: { color: bgColor },
      dotsOptions: {
        type: dotsType,
        color: dotsColor,
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: cornerSquareColor,
      },
      cornersDotOptions: {
        type: "dot",
        color: cornerDotColor,
      },
      qrOptions: {
        errorCorrectionLevel,
      },
      image: logoUrl || undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: 0.28,
      },
    };

    // für Export temporär auf Export-Größe umstellen
    qrInstance.current.update({
      ...baseConfig,
      width: exportSize,
      height: exportSize,
    });

    await qrInstance.current.download({
      name: "fancy-qr",
      extension: downloadFormat,
    });

    // danach Vorschau wieder auf PREVIEW_SIZE zurücksetzen
    qrInstance.current.update({
      ...baseConfig,
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
    });
  };

  const handleApplyRecommendedSettings = () => {
    // sehr einfache Heuristik:
    // - mit Logo → H
    // - ohne Logo & große Exportgröße → M
    // - sonst → Q
    if (logoUrl) {
      setErrorCorrectionLevel("H");
    } else if (exportSize >= 1024) {
      setErrorCorrectionLevel("M");
    } else {
      setErrorCorrectionLevel("Q");
    }
  };

  // ein paar Theme-abhängige Farben
  const pageBackground = isDark
    ? "radial-gradient(circle at top left, rgba(79,70,229,0.3), transparent 55%)," +
      "radial-gradient(circle at bottom right, rgba(56,189,248,0.25), transparent 50%)," +
      "#050816"
    : "radial-gradient(circle at top left, rgba(129,140,248,0.35), transparent 55%)," +
      "radial-gradient(circle at bottom right, rgba(56,189,248,0.25), transparent 55%)," +
      "#e5edff";

  const leftCardBg = isDark
    ? "radial-gradient(circle at top left, rgba(79,70,229,0.12), transparent 55%)," +
      "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))"
    : "radial-gradient(circle at top left, rgba(129,140,248,0.16), transparent 55%)," +
      "linear-gradient(145deg, #ffffff, #eef2ff)";

  const rightCardBg = isDark
    ? "radial-gradient(circle at top right, rgba(79,70,229,0.16), transparent 55%)," +
      "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))"
    : "radial-gradient(circle at top right, rgba(129,140,248,0.2), transparent 55%)," +
      "linear-gradient(145deg, #ffffff, #eef2ff)";

  const headerBg = isDark
    ? "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.4))"
    : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(226,232,240,0.95))";

  const headerBorder = isDark
    ? "1px solid rgba(148,163,184,0.35)"
    : "1px solid rgba(148,163,184,0.55)";

  const cardBorder = isDark
    ? "1px solid rgba(148,163,184,0.35)"
    : "1px solid rgba(148,163,184,0.4)";

  const baseTextColor = isDark ? "#f9fafb" : "#020617";
  const mutedTextColor = isDark ? "#9ca3af" : "#6b7280";

  const inputBg = isDark ? "rgba(15,23,42,0.9)" : "rgba(248,250,252,0.95)";
  const inputBorder = isDark
    ? "1px solid rgba(148,163,184,0.4)"
    : "1px solid rgba(148,163,184,0.5)";
  const inputText = isDark ? "#f9fafb" : "#020617";

  const previewBg = isDark
    ? "radial-gradient(circle at top left, rgba(15,23,42,0.85), rgba(15,23,42,0.98))"
    : "radial-gradient(circle at top left, rgba(248,250,252,0.95), rgba(226,232,240,1))";

  const infoBoxBg = isDark
    ? "rgba(15,23,42,0.85)"
    : "rgba(248,250,252,0.95)";

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-10 md:py-10"
      style={{
        background: pageBackground,
        color: baseTextColor,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap:4 md:gap-6">
        {/* Header */}
        <header
          style={{
            borderRadius: 999,
            padding: "10px 18px",
            background: headerBg,
            border: headerBorder,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backdropFilter: "blur(24px)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              color: mutedTextColor,
            }}
          >
            QR<span style={{ color: "#4f46e5" }}>Studio</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setUiTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.8rem",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.5)",
              padding: "4px 10px",
              background: isDark ? "rgba(15,23,42,0.8)" : "rgba(248,250,252,0.9)",
              color: mutedTextColor,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>
              {isDark ? "🌙" : "☀️"}
            </span>
            <span>{isDark ? "Dark UI" : "Light UI"}</span>
          </button>
        </header>

        <main className="grid gap-4 md:gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)]">
          {/* LEFT: Inhalt + Design */}
          <section
            style={{
              borderRadius: 22,
              padding: "18px 18px 16px",
              background: leftCardBg,
              border: cardBorder,
              boxShadow: "0 24px 60px rgba(15,23,42,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.4rem", margin: 0 }}>QR-Code Generator</h1>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: mutedTextColor,
                  marginTop: 4,
                }}
              >
                Inhaltstyp wählen, Daten eingeben, Style einstellen – fertig.
              </p>
            </div>

            {/* Inhaltstyp */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{ fontSize: "0.8rem", color: mutedTextColor }}
              >
                Inhaltstyp
              </label>
              <select
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as ContentType)
                }
                style={{
                  borderRadius: 10,
                  border: inputBorder,
                  background: inputBg,
                  color: inputText,
                  padding: "8px 10px",
                  fontSize: "0.85rem",
                }}
              >
                <option value="text">Text / URL</option>
                <option value="wifi">WLAN</option>
                <option value="email">E-Mail</option>
                <option value="sms">SMS</option>
                <option value="tel">Telefonnummer</option>
                <option value="vcard">vCard / Kontakt</option>
              </select>
            </div>

            {/* Content-Felder je Typ */}
            <div style={{ marginTop: 4 }}>
              {contentType === "text" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{ fontSize: "0.8rem", color: mutedTextColor }}
                  >
                    Text oder URL
                  </label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    rows={3}
                    style={{
                      borderRadius: 10,
                      border: inputBorder,
                      background: inputBg,
                      color: inputText,
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}

              {contentType === "wifi" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: mutedTextColor }}
                      >
                        SSID
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="WLAN-Name"
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          border: inputBorder,
                          background: inputBg,
                          color: inputText,
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 120 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: mutedTextColor }}
                      >
                        Verschlüsselung
                      </label>
                      <select
                        value={wifiAuth}
                        onChange={(e) =>
                          setWifiAuth(e.target.value as "WPA" | "WEP" | "nopass")
                        }
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          border: inputBorder,
                          background: inputBg,
                          color: inputText,
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Offen</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: mutedTextColor }}
                      >
                        Passwort
                      </label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="leer bei offenem WLAN"
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          border: inputBorder,
                          background: inputBg,
                          color: inputText,
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.8rem",
                        color: mutedTextColor,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                      />
                      Verstecktes Netzwerk
                    </label>
                  </div>
                </div>
              )}

              {contentType === "email" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Empfänger
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="name@example.com"
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Betreff
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Nachricht
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </div>
              )}

              {contentType === "sms" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Nummer
                    </label>
                    <input
                      type="tel"
                      value={smsTo}
                      onChange={(e) => setSmsTo(e.target.value)}
                      placeholder="+491712345678"
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Nachricht
                    </label>
                    <textarea
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </div>
              )}

              {contentType === "tel" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{ fontSize: "0.8rem", color: mutedTextColor }}
                  >
                    Telefonnummer
                  </label>
                  <input
                    type="tel"
                    value={telNumber}
                    onChange={(e) => setTelNumber(e.target.value)}
                    placeholder="+491712345678"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: inputBorder,
                      background: inputBg,
                      color: inputText,
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              )}

              {contentType === "vcard" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: mutedTextColor }}
                      >
                        Vorname
                      </label>
                      <input
                        type="text"
                        value={vcardFirst}
                        onChange={(e) => setVcardFirst(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          border: inputBorder,
                          background: inputBg,
                          color: inputText,
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: mutedTextColor }}
                      >
                        Nachname
                      </label>
                      <input
                        type="text"
                        value={vcardLast}
                        onChange={(e) => setVcardLast(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          border: inputBorder,
                          background: inputBg,
                          color: inputText,
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Firma
                    </label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={vcardTel}
                      onChange={(e) => setVcardTel(e.target.value)}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: mutedTextColor }}
                    >
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: inputBorder,
                        background: inputBg,
                        color: inputText,
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DESIGN-BLOCK */}
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid rgba(148,163,184,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <h2 style={{ fontSize: "1rem", margin: 0 }}>Design</h2>

              {/* Shape + Export-Größe + Error-Correction */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label
                    style={{ fontSize: "0.8rem", color: mutedTextColor }}
                  >
                    Punktform
                  </label>
                  <select
                    value={dotsType}
                    onChange={(e) =>
                      setDotsType(e.target.value as DotsType)
                    }
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: inputBorder,
                      background: inputBg,
                      color: inputText,
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="square">Quadrate</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Abgerundet</option>
                    <option value="extra-rounded">Extra rund</option>
                    <option value="classy">Classy (Balken-Style)</option>
                    <option value="classy-rounded">
                      Classy rund (Balken-Style)
                    </option>
                  </select>
                </div>

                <div style={{ minWidth: 140 }}>
                  <label
                    title="Gültiger Bereich: 128–2048 Pixel. Höhere Werte ergeben größere Dateien."
                    style={{ fontSize: "0.8rem", color: mutedTextColor }}
                  >
                    Export-Größe (px)
                  </label>
                  <input
                    type="number"
                    value={exportSize}
                    min={128}
                    max={2048}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value || "1024", 10);
                      const clamped = clampExportSize(raw);
                      setExportSize(clamped);
                    }}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: inputBorder,
                      background: inputBg,
                      color: inputText,
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div style={{ minWidth: 160 }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: mutedTextColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Fehlerkorrektur
                    <span
                      title="L: effizient, empfindlicher · M/Q: Mittel · H: toleriert die meiste Beschädigung, nutzt mehr QR-Fläche."
                      style={{
                        cursor: "help",
                        fontSize: "0.9rem",
                      }}
                    >
                      ⓘ
                    </span>
                  </label>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) =>
                      setErrorCorrectionLevel(
                        e.target.value as ErrorCorrectionLevel
                      )
                    }
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: inputBorder,
                      background: inputBg,
                      color: inputText,
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="L">L (gering)</option>
                    <option value="M">M (mittel)</option>
                    <option value="Q">Q (hoch)</option>
                    <option value="H">H (maximal)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleApplyRecommendedSettings}
                    style={{
                      marginTop: 4,
                      fontSize: "0.75rem",
                      borderRadius: 999,
                      border: "none",
                      padding: "4px 8px",
                      cursor: "pointer",
                      background: "rgba(79,70,229,0.15)",
                      color: isDark ? "#c7d2fe" : "#4338ca",
                    }}
                  >
                    Empfohlene Einstellungen
                  </button>
                </div>
              </div>

              {/* Farben: Dots, Ecken, Hintergrund */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginTop: 6,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: mutedTextColor,
                      marginBottom: 2,
                    }}
                  >
                    Punkte (innen)
                  </span>
                  <input
                    type="color"
                    value={dotsColor}
                    onChange={(e) => setDotsColor(e.target.value)}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: mutedTextColor,
                      marginBottom: 2,
                    }}
                  >
                    Ecken außen
                  </span>
                  <input
                    type="color"
                    value={cornerSquareColor}
                    onChange={(e) => setCornerSquareColor(e.target.value)}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: mutedTextColor,
                      marginBottom: 2,
                    }}
                  >
                    Ecken innen
                  </span>
                  <input
                    type="color"
                    value={cornerDotColor}
                    onChange={(e) => setCornerDotColor(e.target.value)}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: mutedTextColor,
                      marginBottom: 2,
                    }}
                  >
                    Hintergrund
                  </span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                    }}
                  />
                </div>
              </div>

              {/* Logo + Download */}
              <div style={{ marginTop: 6 }}>
                <label
                  style={{ fontSize: "0.8rem", color: mutedTextColor }}
                >
                  Logo-URL (optional, Mitte)
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value.trim())}
                  placeholder="https://…/logo.png"
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: inputBorder,
                    background: inputBg,
                    color: inputText,
                    padding: "8px 10px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: "0.8rem",
                    color: mutedTextColor,
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    Format:
                    <select
                      value={downloadFormat}
                      onChange={(e) =>
                        setDownloadFormat(e.target.value as DownloadFormat)
                      }
                      style={{
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.5)",
                        background: inputBg,
                        color: inputText,
                        padding: "3px 8px",
                        fontSize: "0.8rem",
                      }}
                    >
                      <option value="png">PNG</option>
                      <option value="svg">SVG</option>
                    </select>
                  </label>

                  <label
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <input
                      type="checkbox"
                      checked={animatedBg}
                      onChange={(e) => setAnimatedBg(e.target.checked)}
                    />
                    animierter Hintergrund
                  </label>
                </div>

                <button
                  onClick={handleDownload}
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(191,219,254,0.6)",
                    background:
                      "linear-gradient(135deg, #4f46e5, #6366f1)",
                    color: "#eef2ff",
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: "0 14px 35px rgba(79,70,229,0.6)",
                  }}
                >
                  Download {exportSize}×{exportSize} (
                  {downloadFormat.toUpperCase()})
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT: Preview */}
          <section
            style={{
              borderRadius: 22,
              padding: "16px 16px 14px",
              background: rightCardBg,
              border: cardBorder,
              boxShadow: "0 24px 60px rgba(15,23,42,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Vorschau</h2>

            <div
              style={{
                padding: "16px 8px 8px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                id="qr-preview"
                ref={ref}
                className={animatedBg ? "qr-animated" : undefined}
                style={{
                  width: PREVIEW_SIZE,
                  height: PREVIEW_SIZE,
                  borderRadius: 18,
                  border: "1px dashed rgba(148,163,184,0.45)",
                  background: previewBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 12,
                  overflow: "hidden",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                color: mutedTextColor,
                borderRadius: 14,
                border: "1px dashed rgba(148,163,184,0.4)",
                background: infoBoxBg,
                padding: "10px 12px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Logo nicht größer als ~30 % der Kantenlänge setzen.</li>
                <li>
                  Bei knalligen Farben und Logos immer mit echten Geräten testen.
                </li>
                <li>SVG für Druck, PNG für schnelle Nutzung / Messenger.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
