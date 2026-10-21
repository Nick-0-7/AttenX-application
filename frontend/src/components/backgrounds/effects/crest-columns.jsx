import React, { useEffect, useRef } from "react";

/**
 * CrestColumns
 * A modern animated background effect featuring rhythmic vertical columns with cresting light waves,
 * luminous peak caps, and architectural column lines.
 *
 * Configured so:
 * - Columns rise till they reach the exact position of the cursor on screen
 * - Columns on the right side of the screen have higher, more dramatic heights
 * - The connecting string across columns is removed for a pure, individual architectural column aesthetic
 * - Half-speed calm motion with peaceful resting state
 *
 * @param {Object} props
 * @param {string} [props.color="#dde3ec"] - Primary brand crest highlight color (silver/white)
 * @param {string} [props.glowColor="rgba(255, 255, 255, 0.85)"] - Luminous peak glow color
 * @param {string} [props.secondaryColor="#64748b"] - Ambient column shaft color
 * @param {string} [props.lineColor="rgba(255, 255, 255, 0.07)"] - Column divider line color
 * @param {number} [props.speed=0.2] - Wave animation speed multiplier (calm, slowed-down pace)
 * @param {number} [props.columnCount=22] - Approximate number of vertical columns
 * @param {boolean} [props.interactive=true] - Whether columns respond to cursor movement
 * @param {number} [props.glowIntensity=1.0] - Brightness multiplier for the crest lighting
 * @param {string} [props.className=""] - Extra CSS class names
 * @param {React.CSSProperties} [props.style={}] - Custom inline styles
 */
export const CrestColumns = ({
  color = "#dde3ec",
  glowColor = "rgba(255, 255, 255, 0.85)",
  secondaryColor = "#64748b",
  lineColor = "rgba(255, 255, 255, 0.07)",
  speed = 0.2,
  columnCount = 20,
  interactive = true,
  glowIntensity = 1.0,
  className = "",
  style = {},
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = performance.now();

    // Mouse tracking
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    // Per-column animation, varied height, and hover states
    const columnStates = [];

    // Shimmer pulse particles
    const pulses = [];
    const maxPulses = 8;

    const spawnPulseOnCol = (colIndex) => {
      if (pulses.length >= maxPulses) return;
      pulses.push({
        colIndex,
        progress: 0,
        speed: 0.0015 + Math.random() * 0.002,
        size: 25 + Math.random() * 35,
        alpha: 0.22 + Math.random() * 0.3,
      });
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const targetElement = container.parentElement || container;

    const handleMouseMove = (e) => {
      if (!interactive || !targetElement) return;
      const rect = targetElement.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("resize", handleResize);
    targetElement.addEventListener("mousemove", handleMouseMove);
    targetElement.addEventListener("mouseleave", handleMouseLeave);
    handleResize();

    // Helper: parse hex color into rgb
    const hexToRgb = (hex) => {
      const clean = hex.replace("#", "");
      if (clean.length === 3) {
        return {
          r: parseInt(clean[0] + clean[0], 16),
          g: parseInt(clean[1] + clean[1], 16),
          b: parseInt(clean[2] + clean[2], 16),
        };
      }
      if (clean.length === 6) {
        return {
          r: parseInt(clean.substring(0, 2), 16),
          g: parseInt(clean.substring(2, 4), 16),
          b: parseInt(clean.substring(4, 6), 16),
        };
      }
      return { r: 221, g: 227, b: 236 };
    };

    const primaryRgb = hexToRgb(color);
    const secondaryRgb = hexToRgb(secondaryColor);

    const render = (now) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || width === 0 || height === 0) return;

      const dt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;

      // Smooth mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;

      ctx.clearRect(0, 0, width, height);

      // Determine dynamic column count
      const targetColCount = Math.max(12, Math.min(32, Math.round(width / 70)));
      const colWidth = width / targetColCount;

      // Ensure state array matches targetColCount
      // Columns on the right side of the screen are designed to reach significantly higher heights
      while (columnStates.length < targetColCount) {
        const i = columnStates.length;
        const normX = (i + 0.5) / targetColCount;

        const hash = Math.sin((i + 1) * 91.3458) * 47453.5453;
        const rnd = hash - Math.floor(hash);

        // Ascending slope toward the right:
        // Left side stays lower (around ~0.65 - 0.76)
        // Right side ascends high (reaching ~0.16 - 0.35)
        const rightSlope = 0.68 - normX * 0.42;

        const rhythmic =
          Math.sin(normX * Math.PI * 4.0) * 0.09 +
          Math.cos(normX * Math.PI * 6.5) * 0.06 +
          ((i % 4) - 1.5) * 0.07 +
          (rnd - 0.5) * 0.12;

        const baseHeight = Math.max(0.15, Math.min(0.80, rightSlope + rhythmic));

        columnStates.push({
          hover: 0,
          animTime: (i % 7) * 0.5,
          baseHeight,
          currentY: baseHeight * height,
        });
      }
      if (columnStates.length > targetColCount) {
        columnStates.length = targetColCount;
      }

      const hoveredColIndices = [];
      const crestData = [];

      for (let i = 0; i < targetColCount; i++) {
        const state = columnStates[i];
        const colCenter = i * colWidth + colWidth * 0.5;
        const normX = (i + 0.5) / targetColCount;

        // Determine if mouse is over or close to this specific column
        let targetHover = 0;
        if (mouse.active && mouse.x >= 0 && mouse.y >= 0 && mouse.y <= height) {
          const dist = Math.abs(mouse.x - colCenter);
          const influence = colWidth * 1.25;
          if (dist < influence) {
            const ratio = 1 - dist / influence;
            targetHover = Math.pow(ratio, 1.4);
          }
        }

        // Smoothly transition hover level
        state.hover += (targetHover - state.hover) * 0.10;

        // ONLY advance animation time when this column is actively hovered!
        // At rest (hover === 0), the column remains completely static.
        if (state.hover > 0.005) {
          state.animTime += dt * (speed * 0.5) * state.hover;
          if (state.hover > 0.3) {
            hoveredColIndices.push(i);
          }
        }

        // 1. Static resting height (higher on right side of screen)
        const restingY = state.baseHeight * height;

        // 2. Target height when hovered: rises up until it reaches cursor position on screen
        const clampedMouseY = Math.max(
          height * 0.06,
          Math.min(height * 0.94, mouse.y)
        );

        // Subtle gentle breathing wave around cursor position at half-speed
        const wave1 = Math.sin(normX * Math.PI * 3.5 + state.animTime * 0.55) * 0.025;
        const wave2 = Math.cos(normX * Math.PI * 5.0 - state.animTime * 0.35) * 0.02;
        const waveOffset = (wave1 + wave2) * height;

        const targetHoveredY = clampedMouseY + waveOffset;

        // Smoothly blend between resting height and cursor height based on hover
        const targetCrestY =
          restingY * (1 - state.hover) + targetHoveredY * state.hover;

        if (state.currentY === undefined || Number.isNaN(state.currentY)) {
          state.currentY = restingY;
        }

        // Fluid vertical easing toward the target position
        state.currentY += (targetCrestY - state.currentY) * 0.12;

        const crestY = state.currentY;
        const intensity = (0.24 + 0.76 * state.hover) * glowIntensity;

        crestData.push({
          colCenter,
          crestY,
          intensity,
          hover: state.hover,
        });
      }

      // Spawn pulses only on hovered columns occasionally
      if (hoveredColIndices.length > 0 && Math.random() < 0.025) {
        const picked = hoveredColIndices[Math.floor(Math.random() * hoveredColIndices.length)];
        spawnPulseOnCol(picked);
      }

      // 1. Column divider lines
      ctx.lineWidth = 1;
      for (let i = 0; i <= targetColCount; i++) {
        const x = Math.round(i * colWidth);
        const grad = ctx.createLinearGradient(x, 0, x, height);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.015)");
        grad.addColorStop(0.3, lineColor);
        grad.addColorStop(0.7, lineColor);
        grad.addColorStop(1, "rgba(255, 255, 255, 0.01)");

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }

      // 2. Render each individual Column Shaft & Distinct Crest Cap (no connecting string)
      for (let i = 0; i < targetColCount; i++) {
        const { colCenter, crestY, intensity, hover } = crestData[i];
        const colLeft = i * colWidth;
        const colPadding = 1.5;
        const drawWidth = colWidth - colPadding * 2;

        // Shaft Gradient: from bottom to individual crest peak
        const shaftGrad = ctx.createLinearGradient(0, height, 0, crestY);
        const baseAlpha = 0.02 * intensity;
        const midAlpha = (0.05 + hover * 0.18) * intensity;
        const crestAlpha = (0.15 + hover * 0.45) * intensity;

        shaftGrad.addColorStop(
          0,
          `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, ${baseAlpha * 0.2})`
        );
        shaftGrad.addColorStop(
          0.6,
          `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, ${midAlpha})`
        );
        shaftGrad.addColorStop(
          0.92,
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${crestAlpha})`
        );
        shaftGrad.addColorStop(
          1,
          `rgba(255, 255, 255, ${Math.min(0.85, (0.22 + hover * 0.65) * intensity)})`
        );

        ctx.fillStyle = shaftGrad;
        ctx.fillRect(colLeft + colPadding, crestY, drawWidth, height - crestY);

        // 3. Ambient Crest Bloom at the peak
        if (hover > 0.01) {
          const bloomRadius = colWidth * (1.2 + hover * 0.9);
          const bloomGrad = ctx.createRadialGradient(
            colCenter,
            crestY,
            0,
            colCenter,
            crestY,
            bloomRadius
          );
          const peakAlpha = Math.min(0.7, (0.1 + hover * 0.45) * intensity);
          bloomGrad.addColorStop(0, `rgba(255, 255, 255, ${peakAlpha})`);
          bloomGrad.addColorStop(
            0.35,
            `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${peakAlpha * 0.5})`
          );
          bloomGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.save();
          ctx.fillStyle = bloomGrad;
          ctx.fillRect(
            colCenter - bloomRadius,
            crestY - bloomRadius * 0.7,
            bloomRadius * 2,
            bloomRadius * 1.5
          );
          ctx.restore();
        }

        // 4. Distinct Crest Cap Line on each individual column top
        const capHeight = 2.2 + hover * 1.8;
        const capGrad = ctx.createLinearGradient(
          colLeft,
          crestY,
          colLeft + drawWidth,
          crestY
        );
        const edgeAlpha = (0.12 + hover * 0.25).toFixed(2);
        capGrad.addColorStop(0, `rgba(255, 255, 255, ${edgeAlpha})`);
        capGrad.addColorStop(0.5, hover > 0.05 ? glowColor : "rgba(255, 255, 255, 0.45)");
        capGrad.addColorStop(1, `rgba(255, 255, 255, ${edgeAlpha})`);

        ctx.fillStyle = capGrad;
        ctx.fillRect(colLeft + colPadding, crestY - capHeight * 0.5, drawWidth, capHeight);
      }

      // 5. Update and render pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1 || pulse.colIndex >= targetColCount) {
          pulses.splice(p, 1);
          continue;
        }

        const col = crestData[pulse.colIndex];
        const colLeft = pulse.colIndex * colWidth;
        const pulseY = height - pulse.progress * (height - col.crestY);
        const pulseAlpha = Math.sin(pulse.progress * Math.PI) * pulse.alpha * col.intensity;

        const pulseGrad = ctx.createLinearGradient(
          0,
          pulseY - pulse.size,
          0,
          pulseY + pulse.size
        );
        pulseGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        pulseGrad.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${Math.min(0.65, pulseAlpha * 1.4)})`
        );
        pulseGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = pulseGrad;
        ctx.fillRect(colLeft + 2, pulseY - pulse.size, colWidth - 4, pulse.size * 2);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (targetElement) {
        targetElement.removeEventListener("mousemove", handleMouseMove);
        targetElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [
    color,
    glowColor,
    secondaryColor,
    lineColor,
    speed,
    columnCount,
    interactive,
    glowIntensity,
  ]);

  return (
    <div
      ref={containerRef}
      className={`crest-columns-container ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default CrestColumns;
