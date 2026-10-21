"use client";

import React from "react";
import { motion } from "framer-motion";

const SHIMMER_DURATION = 1.6;

export function ShimmerBone({
  width = "100%",
  height = 12,
  borderRadius = 6,
  className,
  style,
  theme = "dark",
  delay = 0,
}) {
  const boneBase = theme === "dark" ? "#1c1c28" : "#e8e8ed";
  const shimmerCenter =
    theme === "dark" ? "rgba(255,255,255,0.065)" : "rgba(255,255,255,0.75)";

  const shimmerGradient = `linear-gradient(90deg, transparent 0%, ${shimmerCenter} 40%, ${shimmerCenter} 50%, transparent 100%)`;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height,
        borderRadius,
        backgroundColor: boneBase,
        flexShrink: 0,
        ...style,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: shimmerGradient,
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: SHIMMER_DURATION,
          ease: "linear",
          repeat: Infinity,
          delay,
        }}
      />
    </div>
  );
}

// ── Report Loading Skeleton (Used when generating report) ──
export function ReportSkeleton({ theme = "dark" }) {
  const d = (n) => n * 0.05;
  const bone = (props) => <ShimmerBone theme={theme} {...props} />;

  const tokens =
    theme === "dark"
      ? {
          cardBg: "#141418",
          cardBorder: "rgba(255, 255, 255, 0.07)",
          innerBg: "rgba(255, 255, 255, 0.02)",
          tableHeader: "#16161b",
        }
      : {
          cardBg: "#ffffff",
          cardBorder: "rgba(0, 0, 0, 0.08)",
          innerBg: "rgba(0, 0, 0, 0.02)",
          tableHeader: "#f1f5f9",
        };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        marginTop: 20,
        width: "100%",
        maxWidth: 1250,
      }}
    >
      {/* Report Status Banner */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 10,
          border: `1px solid ${tokens.cardBorder}`,
          backgroundColor: tokens.cardBg,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {bone({ width: 22, height: 22, borderRadius: "50%", delay: d(0) })}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {bone({ width: 220, height: 14, borderRadius: 4, delay: d(1) })}
          {bone({ width: 340, height: 10, borderRadius: 4, delay: d(2) })}
        </div>
        {bone({ width: 120, height: 34, borderRadius: 8, delay: d(2) })}
      </div>

      {/* KPI Summary Cards (3 cards) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              border: `1px solid ${tokens.cardBorder}`,
              backgroundColor: tokens.cardBg,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {bone({ width: 100, height: 11, borderRadius: 3, delay: d(i) })}
              {bone({ width: 24, height: 24, borderRadius: "50%", delay: d(i + 1) })}
            </div>
            {bone({ width: 85, height: 28, borderRadius: 6, delay: d(i + 1) })}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {bone({ width: 70, height: 9, borderRadius: 3, delay: d(i + 2) })}
              {bone({ width: "90%", height: 6, borderRadius: 999, delay: d(i + 2) })}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Skeleton */}
      <div
        style={{
          borderRadius: 12,
          border: `1px solid ${tokens.cardBorder}`,
          backgroundColor: tokens.cardBg,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {bone({ width: 180, height: 18, borderRadius: 4, delay: d(2) })}
          <div style={{ display: "flex", gap: 8 }}>
            {bone({ width: 64, height: 26, borderRadius: 6, delay: d(3) })}
            {bone({ width: 64, height: 26, borderRadius: 6, delay: d(4) })}
          </div>
        </div>
        {bone({ width: "100%", height: 180, borderRadius: 8, delay: d(3) })}
      </div>

      {/* Attainment Result Table Skeleton */}
      <div
        style={{
          borderRadius: 12,
          border: `1px solid ${tokens.cardBorder}`,
          backgroundColor: tokens.cardBg,
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: tokens.tableHeader,
            borderBottom: `1px solid ${tokens.cardBorder}`,
            display: "flex",
            gap: 20,
          }}
        >
          {[80, 140, 100, 100, 80, 70].map((w, i) => (
            <React.Fragment key={i}>
              {bone({ width: w, height: 11, borderRadius: 4, delay: d(i) })}
            </React.Fragment>
          ))}
        </div>

        {/* Table Rows (5 rows) */}
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              borderBottom: rowIdx < 4 ? `1px solid ${tokens.cardBorder}` : "none",
            }}
          >
            {bone({ width: 60, height: 12, borderRadius: 4, delay: d(rowIdx) })}
            {bone({ width: 140, height: 12, borderRadius: 4, delay: d(rowIdx + 1) })}
            {bone({ width: 90, height: 12, borderRadius: 4, delay: d(rowIdx + 1) })}
            {bone({ width: 90, height: 12, borderRadius: 4, delay: d(rowIdx + 2) })}
            {bone({ width: 70, height: 12, borderRadius: 4, delay: d(rowIdx + 2) })}
            <div style={{ flex: 1 }} />
            {bone({ width: 65, height: 22, borderRadius: 999, delay: d(rowIdx + 3) })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full Portal UI Skeleton Loader ──
export default function PortalSkeleton({
  theme = "dark",
  step = 1,
  sidebarCollapsed = false,
}) {
  const tokens =
    theme === "dark"
      ? {
          bg: "#09090b",
          sidebarBg: "#121215",
          surface: "#141418",
          surface2: "#1b1b20",
          border: "#27272f",
          cardBorder: "#27272f",
          cardBg: "#141418",
          tableHeaderBg: "#16161b",
          tableBorder: "#27272f",
        }
      : {
          bg: "#f8fafc",
          sidebarBg: "#ffffff",
          surface: "#ffffff",
          surface2: "#f1f5f9",
          border: "#e2e8f0",
          cardBorder: "#e2e8f0",
          cardBg: "#ffffff",
          tableHeaderBg: "#f1f5f9",
          tableBorder: "#e2e8f0",
        };

  const sidebarWidth = sidebarCollapsed ? 64 : 250;
  const d = (n) => n * 0.05;

  const bone = (props) => <ShimmerBone theme={theme} {...props} />;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: tokens.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        overflow: "visible",
      }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: sidebarWidth,
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: tokens.sidebarBg,
          borderRight: `1px solid ${tokens.border}`,
          display: "flex",
          flexDirection: "column",
          padding: sidebarCollapsed ? "28px 12px" : "28px 18px",
          gap: 20,
          zIndex: 50,
          transition: "width 0.25s ease",
        }}
      >
        {/* Attainx Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          {bone({ width: 36, height: 36, borderRadius: 8, delay: d(0) })}
          {!sidebarCollapsed &&
            bone({ width: 90, height: 20, borderRadius: 5, delay: d(1) })}
        </div>

        {/* Sidebar User Profile Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: sidebarCollapsed ? "8px 4px" : "10px",
            border: `1px solid ${tokens.border}`,
            borderRadius: 10,
            backgroundColor: tokens.sidebarBg,
          }}
        >
          {bone({
            width: 36,
            height: 36,
            borderRadius: "50%",
            delay: d(1),
            style: { flexShrink: 0 },
          })}
          {!sidebarCollapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flex: 1,
              }}
            >
              {bone({ width: "70%", height: 12, borderRadius: 4, delay: d(2) })}
              {bone({ width: "45%", height: 10, borderRadius: 4, delay: d(3) })}
            </div>
          )}
          {!sidebarCollapsed &&
            bone({ width: 14, height: 6, borderRadius: 2, delay: d(3) })}
        </div>

        {/* Sidebar Menu Items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flex: 1,
          }}
        >
          {[
            { num: "01", w: 90, active: true },
            { num: "02", w: 125, active: false },
            { num: "03", w: 115, active: false },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: sidebarCollapsed ? "12px 6px" : "12px 14px",
                borderRadius: 8,
                backgroundColor: item.active ? tokens.surface2 : "transparent",
                border: item.active
                  ? `1px solid ${tokens.border}`
                  : "1px solid transparent",
              }}
            >
              {bone({
                width: 20,
                height: 12,
                borderRadius: 4,
                delay: d(2 + i),
              })}
              {!sidebarCollapsed &&
                bone({
                  width: item.w,
                  height: 13,
                  borderRadius: 4,
                  delay: d(3 + i),
                })}
            </div>
          ))}
        </div>

        {/* Sidebar Bottom (Settings) */}
        <div
          style={{
            paddingTop: 18,
            borderTop: `1px solid ${tokens.border}`,
            marginTop: "auto",
          }}
        >
          <div
            style={{
              padding: sidebarCollapsed ? "12px 6px" : "12px 14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {sidebarCollapsed
              ? bone({ width: 24, height: 14, borderRadius: 4, delay: d(6) })
              : bone({ width: 70, height: 13, borderRadius: 4, delay: d(6) })}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          minHeight: "100vh",
          padding: "55px 5vw 100px",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.25s ease",
        }}
      >
        {/* Portal Header */}
        <div
          style={{
            marginBottom: 55,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Eyebrow */}
          {bone({ width: 130, height: 11, borderRadius: 3, delay: d(1) })}
          {/* Main Title: Student Attainment */}
          {bone({
            width: "clamp(260px, 45%, 440px)",
            height: 48,
            borderRadius: 8,
            delay: d(2),
          })}
          {/* Subtitle */}
          {bone({ width: 240, height: 14, borderRadius: 4, delay: d(3) })}
        </div>

        {/* Wizard Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            maxWidth: 620,
            marginBottom: 52,
            gap: 12,
          }}
        >
          {[
            { num: 1, labelWidth: 105 },
            { num: 2, labelWidth: 95 },
            { num: 3, labelWidth: 120 },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                {bone({
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  delay: d(3 + idx),
                })}
                {bone({
                  width: s.labelWidth,
                  height: 13,
                  borderRadius: 4,
                  delay: d(4 + idx),
                })}
              </div>
              {idx < 2 && (
                <div style={{ flex: 1, minWidth: 24, padding: "0 4px" }}>
                  {bone({
                    width: "100%",
                    height: 2,
                    borderRadius: 1,
                    delay: d(4 + idx),
                  })}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Academic Details Skeleton ── */}
        {step === 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 70,
              maxWidth: 1250,
            }}
          >
            {/* Section 01: Faculty Information */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(3) })}
                {bone({ width: 170, height: 22, borderRadius: 5, delay: d(4) })}
              </div>

              <div
                style={{
                  maxWidth: 650,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingTop: 6,
                }}
              >
                {bone({ width: 100, height: 10, borderRadius: 3, delay: d(4) })}
                {bone({ width: "100%", height: 44, borderRadius: 6, delay: d(5) })}
                {bone({ width: 210, height: 10, borderRadius: 3, delay: d(6) })}
              </div>
            </div>

            {/* Section 02: Attainment Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(4) })}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bone({ width: 150, height: 22, borderRadius: 5, delay: d(5) })}
                  {bone({ width: 260, height: 12, borderRadius: 4, delay: d(6) })}
                </div>
              </div>

              {/* 4 Attainment Type Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                  marginTop: 6,
                }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 12,
                      backgroundColor: tokens.cardBg,
                      padding: "22px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {bone({ width: 22, height: 12, borderRadius: 3, delay: d(i) })}
                    {bone({ width: 130, height: 16, borderRadius: 4, delay: d(i + 1) })}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 34 }}>
                      {bone({ width: "90%", height: 11, borderRadius: 4, delay: d(i + 2) })}
                      {bone({ width: "65%", height: 11, borderRadius: 4, delay: d(i + 3) })}
                    </div>
                    {bone({ width: 55, height: 18, borderRadius: 999, delay: d(i + 3) })}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 03: Academic Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(5) })}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bone({ width: 160, height: 22, borderRadius: 5, delay: d(6) })}
                  {bone({ width: 300, height: 12, borderRadius: 4, delay: d(7) })}
                </div>
              </div>

              {/* 2 Academic Select Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 20,
                  maxWidth: 1000,
                  marginTop: 6,
                }}
              >
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 12,
                      backgroundColor: tokens.cardBg,
                      padding: "22px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {bone({ width: 110, height: 10, borderRadius: 3, delay: d(i) })}
                      {bone({ width: 45, height: 16, borderRadius: 12, delay: d(i + 1) })}
                    </div>
                    {bone({ width: "100%", height: 46, borderRadius: 8, delay: d(i + 2) })}
                    {bone({ width: 180, height: 10, borderRadius: 3, delay: d(i + 3) })}
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Nav Button */}
            <div style={{ marginTop: -10 }}>
              {bone({ width: 240, height: 48, borderRadius: 8, delay: d(8) })}
            </div>
          </div>
        )}

        {/* ── STEP 2: COs & Mapping Skeleton ── */}
        {step === 2 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 70,
              maxWidth: 1250,
            }}
          >
            {/* Section 04: Course Outcomes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(3) })}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bone({ width: 170, height: 22, borderRadius: 5, delay: d(4) })}
                  {bone({ width: 220, height: 12, borderRadius: 4, delay: d(5) })}
                </div>
              </div>

              <div
                style={{
                  maxWidth: 1000,
                  display: "flex",
                  flexDirection: "column",
                  borderTop: `1px solid ${tokens.border}`,
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr",
                      alignItems: "center",
                      height: 54,
                      borderBottom: `1px solid ${tokens.border}`,
                    }}
                  >
                    {bone({ width: 32, height: 12, borderRadius: 3, delay: d(i) })}
                    {bone({ width: "80%", height: 14, borderRadius: 4, delay: d(i + 1) })}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 05: CO / PO Mapping */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(4) })}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bone({ width: 170, height: 22, borderRadius: 5, delay: d(5) })}
                  {bone({ width: 250, height: 12, borderRadius: 4, delay: d(6) })}
                </div>
              </div>

              {/* Mapping Grid Table */}
              <div
                style={{
                  borderRadius: 8,
                  border: `1px solid ${tokens.border}`,
                  backgroundColor: tokens.surface,
                  overflowX: "auto",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px repeat(14, 1fr)",
                    minWidth: 1000,
                    backgroundColor: tokens.tableHeaderBg,
                    borderBottom: `1px solid ${tokens.border}`,
                    height: 48,
                    alignItems: "center",
                    padding: "0 10px",
                    gap: 8,
                  }}
                >
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                      {bone({ width: i === 0 ? 55 : 32, height: 11, borderRadius: 3, delay: d(i) })}
                    </div>
                  ))}
                </div>

                {Array.from({ length: 6 }).map((_, row) => (
                  <div
                    key={row}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px repeat(14, 1fr)",
                      minWidth: 1000,
                      height: 48,
                      alignItems: "center",
                      padding: "0 10px",
                      gap: 8,
                      borderBottom: row < 5 ? `1px solid ${tokens.border}` : "none",
                    }}
                  >
                    {Array.from({ length: 15 }).map((_, col) => (
                      <div key={col} style={{ display: "flex", justifyContent: "center" }}>
                        {bone({ width: col === 0 ? 35 : 24, height: 20, borderRadius: 4, delay: d(row + col) })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                {bone({ width: 90, height: 36, borderRadius: 6, delay: d(5) })}
                {bone({ width: 200, height: 12, borderRadius: 3, delay: d(6) })}
              </div>
            </div>

            {/* Nav Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {bone({ width: 80, height: 46, borderRadius: 6, delay: d(7) })}
              {bone({ width: 240, height: 48, borderRadius: 8, delay: d(8) })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Upload & Calculate Skeleton ── */}
        {step === 3 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 70,
              maxWidth: 1250,
            }}
          >
            {/* Section 06: Import Data */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(3) })}
                {bone({ width: 140, height: 22, borderRadius: 5, delay: d(4) })}
              </div>

              {/* Upload Box */}
              <div
                style={{
                  height: 180,
                  borderRadius: 12,
                  border: `1px dashed ${tokens.border}`,
                  backgroundColor: tokens.cardBg,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {bone({ width: 36, height: 36, borderRadius: "50%", delay: d(4) })}
                {bone({ width: 180, height: 14, borderRadius: 4, delay: d(5) })}
                {bone({ width: 100, height: 10, borderRadius: 3, delay: d(6) })}
              </div>
            </div>

            {/* Calculate Attainment Section */}
            <div
              style={{
                borderRadius: 14,
                border: `1px solid ${tokens.border}`,
                backgroundColor: tokens.cardBg,
                padding: "28px 24px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bone({ width: 120, height: 10, borderRadius: 3, delay: d(5) })}
                {bone({ width: 190, height: 32, borderRadius: 6, delay: d(6) })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {/* Target Inputs Card */}
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: `1px solid ${tokens.border}`,
                    backgroundColor: tokens.surface2,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  {bone({ width: 80, height: 12, borderRadius: 3, delay: d(6) })}
                  {bone({ width: 60, height: 34, borderRadius: 6, delay: d(7) })}
                  {bone({ width: 60, height: 34, borderRadius: 6, delay: d(8) })}
                </div>

                {/* Calculate Button */}
                {bone({ width: 180, height: 48, borderRadius: 8, delay: d(8) })}
              </div>
            </div>

            {/* Section 07: Generated Report Skeleton */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {bone({ width: 20, height: 12, borderRadius: 3, delay: d(5) })}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {bone({ width: 160, height: 22, borderRadius: 5, delay: d(6) })}
                  {bone({ width: 280, height: 12, borderRadius: 4, delay: d(7) })}
                </div>
              </div>

              <ReportSkeleton theme={theme} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
