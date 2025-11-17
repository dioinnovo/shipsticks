"use client"

import { cn } from "@/lib/utils"

interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    bg?: string
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
  isActive?: boolean
}

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "64px",
  className,
  colors,
  animationDuration = 20,
  isActive = true,
}) => {
  const defaultColors = {
    bg: "transparent",
    c1: "#2d5016",  // Deep Forest Green (premium & sophisticated)
    c2: "#3d6b2e",  // Rich Grass Green (natural & trustworthy)
    c3: "#4a7c3a",  // Fairway Green (professional & elegant)
    c4: "#2e5c1f",  // Dark Grass Green (mature & grounded)
  }

  const finalColors = { ...defaultColors, ...colors }
  const sizeValue = parseInt(size.replace("px", ""), 10)

  const blurAmount = Math.max(sizeValue * 0.08, 8)
  const contrastAmount = Math.max(sizeValue * 0.003, 1.8)

  return (
    <div
      className={cn("siri-orb rounded-full relative overflow-hidden", className)}
      style={
        {
          width: size,
          height: size,
          display: "grid",
          gridTemplateAreas: '"stack"',
          background: `radial-gradient(circle, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.03) 30%, transparent 70%)`,
          "--bg": finalColors.bg,
          "--c1": finalColors.c1,
          "--c2": finalColors.c2,
          "--c3": finalColors.c3,
          "--c4": finalColors.c4,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          gridArea: "stack",
          background: `
            conic-gradient(from calc(var(--angle, 0deg) * 1.2) at 30% 65%, var(--c3) 0deg, var(--c4) 25deg, transparent 65deg 295deg, var(--c3) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * 0.8) at 70% 35%, var(--c2) 0deg, var(--c1) 35deg, transparent 80deg 280deg, var(--c2) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * -1.5) at 65% 75%, var(--c1) 0deg, var(--c3) 50deg, transparent 110deg 250deg, var(--c1) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * 2.1) at 25% 25%, var(--c4) 0deg, var(--c2) 20deg, transparent 50deg 310deg, var(--c4) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * -0.7) at 80% 80%, var(--c1) 0deg, var(--c4) 30deg, transparent 70deg 290deg, var(--c1) 360deg),
            radial-gradient(ellipse 120% 80% at 40% 60%, var(--c3) 0%, var(--c2) 30%, transparent 60%)
          `,
          filter: `blur(${blurAmount}px) contrast(${contrastAmount}) saturate(1.8) brightness(1.2)`,
          animation: isActive ? `siriOrbRotate ${animationDuration}s linear infinite` : "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          gridArea: "stack",
          background: `radial-gradient(circle at 45% 55%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 30%, transparent 70%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}

export default SiriOrb