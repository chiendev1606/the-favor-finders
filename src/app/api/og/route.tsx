import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || "XXXXXX";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 40%, #FED7AA 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top food emojis */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", fontSize: "48px" }}>
          <span>🍜</span>
          <span>🥢</span>
          <span>🍲</span>
          <span>🥘</span>
          <span>🍛</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "#EA580C",
            marginBottom: "12px",
            display: "flex",
          }}
        >
          The Flavor Finders
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#9A3412",
            marginBottom: "32px",
            display: "flex",
          }}
        >
          Vote on what to eat together!
        </div>

        {/* Room code card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: "20px",
            padding: "28px 48px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "20px", color: "#78716C", marginBottom: "8px", display: "flex" }}>
            Join with room code
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "800",
              letterSpacing: "0.2em",
              color: "#1F2937",
              display: "flex",
            }}
          >
            {code}
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginTop: "28px",
            fontSize: "22px",
            color: "#A8A29E",
          }}
        >
          <span>Scan QR or click link to join</span>
          <span>🗳️</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
