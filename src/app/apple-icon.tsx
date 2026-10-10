import { ImageResponse } from "next/og";
import { palette } from "@/lib/palette";

// Ícone para a tela inicial do iPhone: o mesmo desenho do favicon (icon.svg).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32">
        <rect width="32" height="32" fill={palette.light.grafite} />
        <path d="M10 8.5V22.5H21" fill="none" stroke={palette.light.papel} strokeWidth="3.4" strokeLinecap="square" />
        <rect x="17.5" y="8.5" width="5" height="5" rx="1" fill={palette.dark.ambar} />
      </svg>
    ),
    size,
  );
}
