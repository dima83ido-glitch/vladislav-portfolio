import { ImageResponse } from "next/og";
import { SITE } from "@/lib/data/site";

const OG_ROLE = "Full-Stack Web Developer";
const OG_TAGLINE = "Design. Code. Result.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — Premium Web Development Studio`;

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#030407",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            top: -220,
            left: -160,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(77,125,255,0.45) 0%, rgba(77,125,255,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            bottom: -260,
            right: -140,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(122,162,255,0.35) 0%, rgba(122,162,255,0) 70%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#8a90a6",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          {OG_ROLE}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 800,
            color: "#f5f7fb",
            letterSpacing: -3,
            marginTop: 24,
          }}
        >
          {SITE.name}
          <span style={{ color: "#7aa2ff" }}>.</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 300,
            color: "#7aa2ff",
            marginTop: 20,
          }}
        >
          {OG_TAGLINE}
        </div>
      </div>
    ),
    { ...size }
  );
}
