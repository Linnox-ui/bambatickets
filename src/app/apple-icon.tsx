import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A0A",
        borderRadius: "36px",
      }}
    >
      <svg viewBox="0 0 150 150" width="70%" height="70%">
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
    </div>,
    { ...size },
  );
}
