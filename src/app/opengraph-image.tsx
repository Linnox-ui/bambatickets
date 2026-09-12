import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A0A",
        padding: "0 80px",
      }}
    >
      {/* Left Side: SVG Logo */}
      <svg viewBox="0 0 150 150" width="220" height="220">
        <path
          d="M 30 30 H 90 C 120 30, 120 70, 90 70 H 60"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="60"
          y1="30"
          x2="60"
          y2="120"
          stroke="#FFFFFF"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M 60 70 C 105 70, 105 120, 75 120 H 60"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Right Side: Branding & Tagline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 50,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          BAMBA TICKETS
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "#A1A1AA",
            marginTop: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Effortless Event Access. Instant Discovery.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
