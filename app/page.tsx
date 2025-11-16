"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

const qrCode = new QRCodeStyling({
  width: 320,
  height: 320,
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

type DotsType = "square" | "dots" | "rounded" | "extra-rounded";
type GradientPreset = "indigoPinkGreen" | "sunset" | "aqua" | "mono";
type DownloadFormat = "png" | "svg";
type ContentType = "text" | "wifi" | "email" | "sms" | "tel" | "vcard";

const PREVIEW_SIZE = 320;

export default function Page() {
  const ref = useRef<HTMLDivElement | null>(null);

  const clampExportSize = (value: number) => {
    const v = Number.isFinite(value) ? value : 1024;
    return Math.min(2048, Math.max(160, v));
  };

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
  const [useGradient, setUseGradient] = useState(true);
  const [gradientPreset, setGradientPreset] =
    useState<GradientPreset>("indigoPinkGreen");
  const [fgColor, setFgColor] = useState("#111111");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [exportSize, setExportSize] = useState(1024); // nur für Download
  const [animatedBg, setAnimatedBg] = useState(false);
  const [downloadFormat, setDownloadFormat] =
    useState<DownloadFormat>("png");

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
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

  // Dots-Options (mit/ohne Gradient)
  const buildDotsOptions = (): any => {
    if (useGradient) {
      let colorStops;
      switch (gradientPreset) {
        case "sunset":
          colorStops = [
            { offset: 0, color: "#f97316" },
            { offset: 0.5, color: "#ec4899" },
            { offset: 1, color: "#6366f1" },
          ];
          break;
        case "aqua":
          colorStops = [
            { offset: 0, color: "#22c55e" },
            { offset: 0.5, color: "#06b6d4" },
            { offset: 1, color: "#0ea5e9" },
          ];
          break;
        case "mono":
          colorStops = [
            { offset: 0, color: "#0f172a" },
            { offset: 1, color: "#64748b" },
          ];
          break;
        case "indigoPinkGreen":
        default:
          colorStops = [
            { offset: 0, color: "#4f46e5" },
            { offset: 0.5, color: "#ec4899" },
            { offset: 1, color: "#22c55e" },
          ];
          break;
      }

      return {
        type: dotsType,
        color: undefined,   // sicherstellen, dass nur Gradient benutzt wird
        gradient: {
          type: "linear",
          rotation: 0.5,
          colorStops,
        },
      };
    }

    // Gradient explizit abschalten, sonst bleibt er intern hängen
    return {
      type: dotsType,
      color: fgColor,
      gradient: null,
    };
  };

  // QR-Vorschau (immer PREVIEW_SIZE)
  useEffect(() => {
    const data = buildDataFromForm();
    const dotsOptions = buildDotsOptions();

    qrCode.update({
      data: data || " ",
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      backgroundOptions: { color: bgColor },
      dotsOptions,
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
    useGradient,
    gradientPreset,
    fgColor,
    bgColor,
    logoUrl,
  ]);

  const handleDownload = async () => {
    const data = buildDataFromForm();
    const dotsOptions = buildDotsOptions();

    const baseConfig = {
      data: data || " ",
      backgroundOptions: { color: bgColor },
      dotsOptions,
      image: logoUrl || undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: 0.28,
      },
    };

    // für Export temporär auf Export-Größe umstellen
    qrCode.update({
      ...baseConfig,
      width: exportSize,
      height: exportSize,
    });

    await qrCode.download({
      name: "fancy-qr",
      extension: downloadFormat,
    });

    // danach Vorschau wieder auf PREVIEW_SIZE zurücksetzen
    qrCode.update({
      ...baseConfig,
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
    });
  };

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-10 md:py-10"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.3), transparent 55%)," +
          "radial-gradient(circle at bottom right, rgba(56,189,248,0.25), transparent 50%)," +
          "#050816",
        color: "#f9fafb",
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
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.4))",
            border: "1px solid rgba(148,163,184,0.35)",
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
              color: "#9ca3af",
            }}
          >
            QR<span style={{ color: "#4f46e5" }}>Studio</span>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.45)",
              background: "rgba(15,23,42,0.6)",
              color: "#9ca3af",
            }}
          >
            Next + qr-code-styling
          </span>
        </header>

        <main className="grid gap-4 md:gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)]">
          {/* LEFT: Inhalt + Design */}
          <section
            style={{
              borderRadius: 22,
              padding: "18px 18px 16px",
              background:
                "radial-gradient(circle at top left, rgba(79,70,229,0.12), transparent 55%)," +
                "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))",
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "0 24px 60px rgba(15,23,42,0.7)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Fancy QR Generator</h1>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginTop: 4 }}>
                Inhaltstyp wählen, Daten eingeben, Style einstellen – fertig.
              </p>
            </div>

            {/* Inhaltstyp */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Inhaltstyp
              </label>
              <select
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as ContentType)
                }
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(15,23,42,0.9)",
                  color: "#f9fafb",
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
                  <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    Text oder URL
                  </label>
                  <textarea
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    rows={3}
                    style={{
                      borderRadius: 10,
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#f9fafb",
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
                        style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                          border: "1px solid rgba(148,163,184,0.4)",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 120 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                          border: "1px solid rgba(148,163,184,0.4)",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
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
                        style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                          border: "1px solid rgba(148,163,184,0.4)",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
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
                        color: "#9ca3af",
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
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
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
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
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
                    style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#f9fafb",
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
                        style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                          border: "1px solid rgba(148,163,184,0.4)",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label
                        style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                          border: "1px solid rgba(148,163,184,0.4)",
                          background: "rgba(15,23,42,0.9)",
                          color: "#f9fafb",
                          padding: "8px 10px",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: "0.8rem", color: "#9ca3af" }}
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
                        border: "1px solid rgba(148,163,184,0.4)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
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

              {/* Shape */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
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
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#f9fafb",
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="square">Quadrate</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Abgerundet</option>
                    <option value="extra-rounded">Extra rund</option>
                  </select>
                </div>

                {/* Export-Größe (nur Download, nicht Vorschau) */}
                <div style={{ minWidth: 140 }}>
                  <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    Export-Größe (px)
                  </label>
                  <input
                    type="number"
                    value={exportSize}
                    min={160}
                    max={2048}
                    step={64}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value || "1024", 10);
                      const clamped = clampExportSize(raw);
                      setExportSize(clamped);
                    }}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#f9fafb",
                      padding: "8px 10px",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>

              {/* Farben / Gradients */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                  />
                  Farbverlauf für QR-Dots aktiv
                </label>

                {useGradient ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    {(
                      [
                        {
                          key: "indigoPinkGreen",
                          label: "Rainbow",
                          preview:
                            "linear-gradient(90deg,#4f46e5,#ec4899,#22c55e)",
                        },
                        {
                          key: "sunset",
                          label: "Sunset",
                          preview:
                            "linear-gradient(90deg,#f97316,#ec4899,#6366f1)",
                        },
                        {
                          key: "aqua",
                          label: "Aqua",
                          preview:
                            "linear-gradient(90deg,#22c55e,#06b6d4,#0ea5e9)",
                        },
                        {
                          key: "mono",
                          label: "Mono",
                          preview:
                            "linear-gradient(90deg,#0f172a,#64748b)",
                        },
                      ] as { key: GradientPreset; label: string; preview: string }[]
                    ).map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setGradientPreset(preset.key)}
                        style={{
                          borderRadius: 999,
                          border:
                            gradientPreset === preset.key
                              ? "1px solid rgba(191,219,254,0.9)"
                              : "1px solid rgba(148,163,184,0.5)",
                          padding: "3px 10px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background:
                            gradientPreset === preset.key
                              ? "rgba(15,23,42,0.95)"
                              : "rgba(15,23,42,0.8)",
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 10,
                            borderRadius: 999,
                            background: preset.preview,
                          }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          marginBottom: 2,
                        }}
                      >
                        Vordergrund
                      </span>
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        style={{
                          width: 40,
                          height: 24,
                          borderRadius: 6,
                          border: "none",
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
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
                          width: 40,
                          height: 24,
                          borderRadius: 6,
                          border: "none",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Logo + Download */}
              <div style={{ marginTop: 6 }}>
                <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
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
                    border: "1px solid rgba(148,163,184,0.4)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f9fafb",
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
                    color: "#9ca3af",
                    flexWrap: "wrap",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Format:
                    <select
                      value={downloadFormat}
                      onChange={(e) =>
                        setDownloadFormat(e.target.value as DownloadFormat)
                      }
                      style={{
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.5)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
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
              background:
                "radial-gradient(circle at top right, rgba(79,70,229,0.16), transparent 55%)," +
                "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
              border: "1px solid rgba(148,163,184,0.4)",
              boxShadow: "0 24px 60px rgba(15,23,42,0.7)",
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
                  background:
                    "radial-gradient(circle at top left, rgba(15,23,42,0.85), rgba(15,23,42,0.98))",
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
                color: "#9ca3af",
                borderRadius: 14,
                border: "1px dashed rgba(148,163,184,0.4)",
                background: "rgba(15,23,42,0.85)",
                padding: "10px 12px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Logo nicht größer als ~30 % der Kantenlänge setzen.</li>
                <li>Bei starken Gradients immer mit echten Geräten testen.</li>
                <li>SVG für Druck, PNG für schnelle Nutzung / Messenger.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}