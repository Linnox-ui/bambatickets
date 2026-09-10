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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <svg viewBox="0 0 150 150" width="300" height="300">
        <path
          d="M 30 30 H 90 C 120 30, 120 70, 90 70 H 60"
          fill="none"
          stroke="#0A0A0A"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="60"
          y1="30"
          x2="60"
          y2="120"
          stroke="#0A0A0A"
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
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#0A0A0A",
          marginTop: 40,
          letterSpacing: "-0.05em",
        }}
      >
        Bamba Tickets
      </div>
    </div>,
    { ...size },
  );
}
