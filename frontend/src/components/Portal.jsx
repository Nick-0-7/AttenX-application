import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { curriculumSubjects } from "../data/curriculumData";
import API_BASE_URL from "../config/api";
import "../templates/Portal.css";
import attainxLogo from "../assets/attainx-logo.png";
import TickerDelta from "./TickerDelta";

/**
 * Checks whether a curriculum subject is a laboratory / practical course
 */
const isLabSubject = (subject) => {
  if (!subject) return false;
  const text = `${subject.code || ""} ${subject.title || ""}`.toLowerCase();
  return /\blab(oratory|pratory)?\b|\bpractical\b|\bpr\b/i.test(text);
};

// =========================================
// SVG ICONS (Crisp, themeable, zero-emoji)
// =========================================
const IconLock = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconSun = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconTrash = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const IconCheck = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClipboard = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const IconUploadCloud = ({ size = 22, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 16l-4-4-4 4" />
    <path d="M12 12v9" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const IconArrowRight = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconArrowLeft = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconDownload = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconHistory = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconSettings = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconAlert = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconSpinner = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon-spin ${className}`}
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const IconExternalLink = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconClose = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSparkles = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const IconChevronDown = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MATRIX_COLGROUP = `<colgroup>
    <col style="width: 14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
    <col style="width: 6.14% !important;">
  </colgroup>`;

const CES_COLGROUP = `<colgroup>
    <col style="width: 8% !important;">
    <col style="width: 8% !important;">
    <col style="width: 10% !important;">
    <col style="width: 9% !important;">
    <col style="width: 65% !important;">
  </colgroup>`;

/**
 * Classifies tables and structural elements from Mammoth HTML so that
 * institutional letterheads, signature blocks, 15-column matrices,
 * and assessment tables maintain pristine alignments in both preview and PDF export.
 */
function formatReportHtml(rawHtml) {
  if (!rawHtml) return "";

  // 1. Remove empty nested artifact tables created by Mammoth from Word shapes
  let processed = rawHtml.replace(/<table>\s*<tr>\s*<td>\s*<\/td>\s*<\/tr>\s*<\/table>/gi, "");

  // 2. Classify tables with semantic classes and inject precise column specifications
  processed = processed.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    const text = tableHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    // College Letterhead table (contains logo or college name)
    if (
      tableHtml.includes("<img") ||
      text.includes("Shri Shamrao") ||
      text.includes("COLLEGE OF ENGINEERING") ||
      text.includes("Autonomous Institute")
    ) {
      return tableHtml.replace("<table", '<table class="report-letterhead-table"');
    }

    // Signature table (contains Prepared By / Verified By / Head of Department)
    if (
      text.includes("Prepared By") &&
      (text.includes("Verified By") || text.includes("Head of Department"))
    ) {
      return tableHtml.replace("<table", '<table class="report-signature-table"');
    }

    // Course Details / Metadata table
    if (text.includes("Course:-") || text.includes("Course Code:-")) {
      return tableHtml.replace("<table", '<table class="report-metadata-table"');
    }

    // 15-column CO-PO / PSO mapping matrix
    if (
      text.includes("PO1") &&
      text.includes("PO2") &&
      (text.includes("PSO") || text.includes("PO 10") || text.includes("PO 11"))
    ) {
      return tableHtml
        .replace("<table", '<table class="report-matrix-table"')
        .replace(/<table[^>]*>/, `$&${MATRIX_COLGROUP}`);
    }

    // Course Exit Survey (CES) table
    if (text.includes(">70%") || text.includes("55-70%") || text.includes("Attainment out of 3")) {
      return tableHtml
        .replace("<table", '<table class="report-ces-table report-data-table"')
        .replace(/<table[^>]*>/, `$&${CES_COLGROUP}`);
    }

    // CO Statements table (CO1 -, CO2 -, etc.)
    if (/CO[1-6]\s*-/.test(text)) {
      return tableHtml.replace("<table", '<table class="report-co-statements-table"');
    }

    // Default to standard data table
    return tableHtml.replace("<table", '<table class="report-data-table"');
  });

  // 3. Insert clean A4 page breaks ONLY at logical section boundaries:
  let sigIndex = 0;
  processed = processed.replace(/<table class="report-signature-table"[\s\S]*?<\/table>/gi, (match) => {
    sigIndex++;
    if (sigIndex === 1) {
      return match + '<div class="html2pdf__page-break page-break-section"></div>';
    }
    return match;
  });

  processed = processed.replace(
    /(<p><strong>\s*D\]\s*Attainment from End Semester Exam)/i,
    '<div class="html2pdf__page-break page-break-section"></div>$1'
  );

  processed = processed.replace(
    /(<p><strong>\s*Attainment of CO(?:’|\')s with PO(?:’|\')s)/i,
    '<div class="html2pdf__page-break page-break-section"></div>$1'
  );

  return processed;
}

/**
 * Ensures all table elements in a rendered DOM node have the proper semantic classes, colgroups, and page breaks
 */
function ensureTableClasses(container) {
  if (!container) return;
  const tables = container.querySelectorAll("table");
  let sigIndex = 0;

  tables.forEach((table) => {
    const text = table.textContent || "";
    const hasImg = table.querySelector("img");

    if (
      hasImg ||
      text.includes("Shri Shamrao") ||
      text.includes("COLLEGE OF ENGINEERING") ||
      text.includes("Autonomous Institute")
    ) {
      table.classList.add("report-letterhead-table");
    } else if (
      text.includes("Prepared By") &&
      (text.includes("Verified By") || text.includes("Head of Department"))
    ) {
      table.classList.add("report-signature-table");
      sigIndex++;
      if (sigIndex === 1 && !table.nextElementSibling?.classList.contains("html2pdf__page-break")) {
        const breakEl = document.createElement("div");
        breakEl.className = "html2pdf__page-break page-break-section";
        table.parentNode.insertBefore(breakEl, table.nextSibling);
      }
    } else if (text.includes("Course:-") || text.includes("Course Code:-")) {
      table.classList.add("report-metadata-table");
    } else if (
      text.includes("PO1") &&
      text.includes("PO2") &&
      (text.includes("PSO") || text.includes("PO 10") || text.includes("PO 11"))
    ) {
      table.classList.add("report-matrix-table");
      if (!table.querySelector("colgroup")) {
        table.insertAdjacentHTML("afterbegin", MATRIX_COLGROUP);
      }
    } else if (text.includes(">70%") || text.includes("55-70%") || text.includes("Attainment out of 3")) {
      table.classList.add("report-ces-table", "report-data-table");
      if (!table.querySelector("colgroup")) {
        table.insertAdjacentHTML("afterbegin", CES_COLGROUP);
      }
    } else if (/CO[1-6]\s*-/.test(text)) {
      table.classList.add("report-co-statements-table");
    } else {
      table.classList.add("report-data-table");
    }
  });

  const paragraphs = container.querySelectorAll("p");
  paragraphs.forEach((p) => {
    const text = p.textContent || "";
    if (
      text.includes("Attainment from End Semester Exam") &&
      !p.previousElementSibling?.classList.contains("html2pdf__page-break")
    ) {
      const breakEl = document.createElement("div");
      breakEl.className = "html2pdf__page-break page-break-section";
      p.parentNode.insertBefore(breakEl, p);
    } else if (
      text.includes("Attainment of CO") &&
      text.includes("with PO") &&
      !p.previousElementSibling?.classList.contains("html2pdf__page-break")
    ) {
      const breakEl = document.createElement("div");
      breakEl.className = "html2pdf__page-break page-break-section";
      p.parentNode.insertBefore(breakEl, p);
    }
  });
}

function Portal() {
  const navigate = useNavigate();

  // 4-Step Wizard State: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState("");

  // Read logged-in user details from authentication storage
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          name: parsed.name || "Faculty Member",
          department: parsed.department || "Computer Science Engineering",
          email: parsed.email || "faculty@college.edu",
          role: parsed.role || "TEACHER",
          password: "••••••••",
          image: parsed.image || null,
        };
      }
    } catch (e) {
      console.error("Failed to read user from localStorage", e);
    }
    return {
      name: "Admin User",
      department: "Computer Science Engineering",
      email: "admin@college.edu",
      role: "ADMIN",
      password: "••••••••",
      image: null,
    };
  };

  const [user, setUser] = useState(getStoredUser);

  // Auth state: check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("authToken") || localStorage.getItem("currentUser"));
  });

  // Dark mode synced with localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("attenx_theme") === "dark";
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("attenx_theme", next ? "dark" : "light");
      return next;
    });
  };

  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Profile Card ref to detect outside clicks
  const profileCardRef = useRef(null);

  // Attainment History State (stored in localStorage)
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const stored = localStorage.getItem("attainment_history");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Calculation Metadata (KPIs, CO Results, PO Results, Survey)
  const [calculationMetadata, setCalculationMetadata] = useState(null);

  // Session verification on mount: verify login info and auth token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("currentUser");
    if (!token && !storedUser) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    // Optional background session ping to backend /api/auth/me
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.user) {
            setUser((prev) => ({
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.email || prev.email,
              role: data.user.role || prev.role,
            }));
          }
        })
        .catch(() => {
          // Fallback gracefully to offline/local session
        });
    }
  }, []);

  // Handle clicking outside profile card to close it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showProfile &&
        profileCardRef.current &&
        !profileCardRef.current.contains(e.target) &&
        !e.target.closest(".sidebar-user") &&
        !e.target.closest(".sidebar-bottom")
      ) {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showProfile]);

  // Persist history changes to localStorage
  const saveHistoryItem = (newItem) => {
    setHistoryItems((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.id !== newItem.id)].slice(0, 50);
      try {
        localStorage.setItem("attainment_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteHistoryItem = (id) => {
    setHistoryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("attainment_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all attainment calculation history?")) {
      setHistoryItems([]);
      try {
        localStorage.removeItem("attainment_history");
      } catch (e) {}
    }
  };

  // =========================================
  // STEP 1: TEMPLATE GENERATOR STATE
  // =========================================
  const [templateCoCount, setTemplateCoCount] = useState(6);
  const [templateCourseName, setTemplateCourseName] = useState("");
  const [templateAcademicYear, setTemplateAcademicYear] = useState("2026-27");
  const [templateDownloaded, setTemplateDownloaded] = useState(false);
  const [hasExistingTemplate, setHasExistingTemplate] = useState(false);

  // Empty rows generator for blank template (PRN, CA1, MSE, CA2, ESE, COs)
  const createEmptyTemplateRows = (count = 5) => {
    return Array.from({ length: count }, () => {
      const row = { prn: "", ca1: "", mse: "", ca2: "", ese: "" };
      for (let i = 1; i <= 6; i++) {
        row[`co${i}`] = "";
      }
      return row;
    });
  };

  const [templateData, setTemplateData] = useState(createEmptyTemplateRows(5));

  // =========================================
  // STEP 2: ACADEMIC DETAILS STATE
  // =========================================
  const [facultyName, setFacultyName] = useState(user.name);
  const [attainmentType, setAttainmentType] = useState("theory");
  const [academicYear, setAcademicYear] = useState("TY");

  const departmentOptions = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Telecommunication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Artificial Intelligence & Data Science",
  ];

  const [department, setDepartment] = useState(
    user.department || "Computer Science Engineering"
  );

  // Uploaded mark sheet file and validation state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Subject Selection and Auto-fetch state
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [selectedSubjectTitle, setSelectedSubjectTitle] = useState("");
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);

  // Available subjects filtered by Academic Year AND Attainment Type (Theory vs Laboratory)
  const availableSubjects = useMemo(() => {
    return curriculumSubjects.filter((s) => {
      if (academicYear && s.academicYear !== academicYear) {
        return false;
      }
      const isLab = isLabSubject(s);
      if (attainmentType === "theory") {
        return !isLab;
      }
      if (attainmentType === "laboratory" || attainmentType === "lab-pr-or") {
        return isLab;
      }
      if (attainmentType === "audit-course") {
        return !isLab;
      }
      return true;
    });
  }, [academicYear, attainmentType]);

  // =========================================
  // STEP 3: COURSE OUTCOMES & MAPPING STATE
  // =========================================
  const rows = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];
  const columns = [
    "PO1",
    "PO2",
    "PO3",
    "PO4",
    "PO5",
    "PO6",
    "PO7",
    "PO8",
    "PO9",
    "PO10",
    "PO11",
    "PSO1",
    "PSO2",
    "PSO3",
  ];

  const createEmptyMapping = () => {
    return rows.reduce((obj, row) => {
      obj[row] = {};
      columns.forEach((column) => {
        obj[row][column] = "";
      });
      return obj;
    }, {});
  };

  const [cos, setCos] = useState({
    CO1: "",
    CO2: "",
    CO3: "",
    CO4: "",
    CO5: "",
    CO6: "",
  });

  const [mapping, setMapping] = useState(createEmptyMapping());

  // =========================================
  // STEP 4: ATTAINMENT & REPORT STATE
  // =========================================
  const [targetCA1, setTargetCA1] = useState(60);
  const [targetCA2, setTargetCA2] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [reportHtml, setReportHtml] = useState("");
  const [reportBlob, setReportBlob] = useState(null);
  const [reportError, setReportError] = useState("");
  const reportPreviewRef = useRef(null);

  // Institutional Metadata Signatories, Class & Academic Year
  const [verifiedBy, setVerifiedBy] = useState("Academic Audit Committee");
  const [hodName, setHodName] = useState("Head of Department");
  const [className, setClassName] = useState("TE CSE");
  const [reportAcademicYear, setReportAcademicYear] = useState("2025-26");

  // References for keyboard navigation
  const facultyRef = useRef(null);
  const coRefs = useRef({});
  const inputRefs = useRef({});
  const templateGridRefs = useRef({});

  // =========================================
  // AUTO-FETCH SUBJECT DATA (COs & Mapping)
  // =========================================
  const handleSubjectSelect = (code) => {
    setSelectedSubjectCode(code);
    setStepError("");
    if (!code) {
      setSelectedSubjectTitle("");
      setIsAutoLoaded(false);
      return;
    }

    const found = curriculumSubjects.find((s) => s.code === code);
    if (found) {
      setSelectedSubjectTitle(found.title);
      setIsAutoLoaded(true);

      // 1. Auto-fill Course Outcomes
      setCos({
        CO1: found.cos?.CO1 || "",
        CO2: found.cos?.CO2 || "",
        CO3: found.cos?.CO3 || "",
        CO4: found.cos?.CO4 || "",
        CO5: found.cos?.CO5 || "",
        CO6: found.cos?.CO6 || "",
      });

      // 2. Auto-fill CO-PO mapping matrix
      const newMapping = createEmptyMapping();
      rows.forEach((r) => {
        if (found.mapping && found.mapping[r]) {
          columns.forEach((col) => {
            const val =
              found.mapping[r][col] ??
              found.mapping[r][col.replace("PO", "PO ")] ??
              found.mapping[r][col.replace("PSO", "PSO ")] ??
              "";
            if (val !== undefined && val !== null && val !== "") {
              newMapping[r][col] = String(val);
            }
          });
        }
      });
      setMapping(newMapping);
    }
  };

  const handleAcademicYearChange = (newYear) => {
    setAcademicYear(newYear);
    if (selectedSubjectCode) {
      const currentSub = curriculumSubjects.find((s) => s.code === selectedSubjectCode);
      if (currentSub && currentSub.academicYear !== newYear) {
        setSelectedSubjectCode("");
        setSelectedSubjectTitle("");
        setIsAutoLoaded(false);
      }
    }
  };

  const handleAttainmentTypeSelect = (type) => {
    setAttainmentType(type);
    setStepError("");

    if (selectedSubjectCode) {
      const currentSub = curriculumSubjects.find((s) => s.code === selectedSubjectCode);
      if (currentSub) {
        const isLab = isLabSubject(currentSub);
        const shouldReset =
          (type === "theory" && isLab) ||
          ((type === "laboratory" || type === "lab-pr-or") && !isLab) ||
          (type === "audit-course" && isLab);

        if (shouldReset) {
          setSelectedSubjectCode("");
          setSelectedSubjectTitle("");
          setIsAutoLoaded(false);
          setCos({
            CO1: "",
            CO2: "",
            CO3: "",
            CO4: "",
            CO5: "",
            CO6: "",
          });
          setMapping(createEmptyMapping());
        }
      }
    }
  };

  // =========================================
  // STEP VALIDATION HELPERS
  // =========================================
  // Step 1: User has downloaded the template OR marked they already have one
  const isStep1Complete = templateDownloaded || hasExistingTemplate;

  // Step 2: Faculty, Attainment Type, Academic Year, Department, Subject, and Marksheet uploaded
  const getStep2MissingFields = () => {
    const missing = [];
    if (!facultyName.trim()) missing.push("Faculty Name");
    if (!attainmentType) missing.push("Attainment Type");
    if (!academicYear) missing.push("Academic Year");
    if (!department) missing.push("Department");
    if (!selectedSubjectCode) missing.push("Curriculum Subject");
    if (!uploadedFile) missing.push("Student Marksheet File");
    return missing;
  };

  const isStep2Complete = getStep2MissingFields().length === 0;

  // Step 3: At least active COs are filled & mapping has entries
  const getStep3MissingFields = () => {
    const missing = [];
    const filledCos = Object.values(cos).filter((c) => c && c.trim().length > 0);
    if (filledCos.length === 0) {
      missing.push("Course Outcome Statements (at least 1 CO statement)");
    }
    const hasAnyMapping = Object.values(mapping).some((row) =>
      Object.values(row).some((val) => val && String(val).trim() !== "")
    );
    if (!hasAnyMapping) {
      missing.push("CO / PO Mapping Matrix correlation values");
    }
    return missing;
  };

  const isStep3Complete = isStep2Complete && getStep3MissingFields().length === 0;

  // Step 4: Ready if steps 1-3 complete
  const isStep4Complete = isStep1Complete && isStep2Complete && isStep3Complete;

  // =========================================
  // FEATURE: SKIP TEMPLATE & GO AUTO TO STEP 2
  // =========================================
  const handleSkipTemplateAndProceed = () => {
    setHasExistingTemplate(true);
    setStepError("");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigation handlers with rigorous validation
  const goToStep = (stepNumber) => {
    setStepError("");

    if (stepNumber === 1) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (stepNumber === 2) {
      if (!isStep1Complete) {
        setStepError(
          "Please download a template or choose 'I already have a template' to complete Step 1."
        );
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (stepNumber === 3) {
      if (!isStep1Complete) {
        setStepError("Please complete Step 1 first.");
        return;
      }
      const missing = getStep2MissingFields();
      if (missing.length > 0) {
        setStepError(
          `Please fill all required details in Step 2: ${missing.join(", ")}`
        );
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (stepNumber === 4) {
      if (!isStep1Complete) {
        setStepError("Please complete Step 1 first.");
        return;
      }
      const missing2 = getStep2MissingFields();
      if (missing2.length > 0) {
        setStepError(
          `Please complete Step 2 first. Missing: ${missing2.join(", ")}`
        );
        return;
      }
      const missing3 = getStep3MissingFields();
      if (missing3.length > 0) {
        setStepError(
          `Please complete Step 3 first. Missing: ${missing3.join(", ")}`
        );
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!isStep1Complete) {
        setStepError(
          "Please download a template or click 'I already have a template' to proceed."
        );
        return;
      }
      setStepError("");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      const missing = getStep2MissingFields();
      if (missing.length > 0) {
        setStepError(
          `Cannot proceed. Please complete all required fields: ${missing.join(
            ", "
          )}`
        );
        return;
      }
      setStepError("");
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3) {
      const missing = getStep3MissingFields();
      if (missing.length > 0) {
        setStepError(
          `Cannot proceed. Please fill: ${missing.join(", ")}`
        );
        return;
      }
      setStepError("");
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setStepError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // =========================================
  // COURSE OUTCOME CHANGE
  // =========================================
  const handleCOChange = (co, value) => {
    setCos({
      ...cos,
      [co]: value,
    });
    setStepError("");
  };

  // =========================================
  // MAPPING CHANGE
  // =========================================
  const handleMappingChange = (row, column, value) => {
    setMapping({
      ...mapping,
      [row]: {
        ...mapping[row],
        [column]: value,
      },
    });
    setStepError("");
  };

  // =========================================
  // KEYBOARD NAVIGATION: FACULTY INPUT
  // =========================================
  const handleFacultyKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      document.getElementById("academic-year-select")?.focus();
    }
  };

  // =========================================
  // KEYBOARD NAVIGATION: CO INPUTS
  // =========================================
  const handleCOKeyDown = (e, index) => {
    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      if (index < rows.length - 1) {
        coRefs.current[rows[index + 1]]?.focus();
      } else {
        inputRefs.current["0-0"]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) {
        coRefs.current[rows[index - 1]]?.focus();
      }
    }
  };

  // =========================================
  // KEYBOARD NAVIGATION: MAPPING TABLE
  // =========================================
  const handleKeyDown = (e, rowIndex, columnIndex) => {
    let newRow = rowIndex;
    let newColumn = columnIndex;

    if (e.key === "ArrowRight") {
      if (columnIndex < columns.length - 1) {
        newColumn++;
      } else if (rowIndex < rows.length - 1) {
        newRow++;
        newColumn = 0;
      } else {
        return;
      }
    } else if (e.key === "ArrowLeft") {
      if (columnIndex > 0) {
        newColumn--;
      } else if (rowIndex > 0) {
        newRow--;
        newColumn = columns.length - 1;
      } else {
        return;
      }
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      if (rowIndex < rows.length - 1) {
        newRow++;
      } else {
        return;
      }
    } else if (e.key === "ArrowUp") {
      if (rowIndex > 0) {
        newRow--;
      } else {
        e.preventDefault();
        coRefs.current[rows[rows.length - 1]]?.focus();
        return;
      }
    } else {
      return;
    }

    e.preventDefault();

    if (
      newRow >= 0 &&
      newRow < rows.length &&
      newColumn >= 0 &&
      newColumn < columns.length
    ) {
      inputRefs.current[`${newRow}-${newColumn}`]?.focus();
    }
  };

  // =========================================
  // KEYBOARD NAVIGATION: TEMPLATE GENERATOR PREVIEW
  // =========================================
  const handleTemplateKeyDown = (e, rowIndex, colKey, totalCols, colIndex) => {
    let targetRow = rowIndex;
    let targetColIndex = colIndex;

    if (e.key === "ArrowRight") {
      if (colIndex < totalCols - 1) {
        targetColIndex++;
      } else if (rowIndex < templateData.length - 1) {
        targetRow++;
        targetColIndex = 0;
      } else {
        return;
      }
    } else if (e.key === "ArrowLeft") {
      if (colIndex > 0) {
        targetColIndex--;
      } else if (rowIndex > 0) {
        targetRow--;
        targetColIndex = totalCols - 1;
      } else {
        return;
      }
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      if (rowIndex < templateData.length - 1) {
        targetRow++;
      } else {
        return;
      }
    } else if (e.key === "ArrowUp") {
      if (rowIndex > 0) {
        targetRow--;
      } else {
        return;
      }
    } else {
      return;
    }

    e.preventDefault();
    templateGridRefs.current[`${targetRow}-${targetColIndex}`]?.focus();
  };

  // =========================================
  // CLEAR ALL MAPPING
  // =========================================
  const clearAllMapping = () => {
    setMapping(createEmptyMapping());
  };

  // =========================================
  // GENERATE ATTAINMENT REPORT
  // =========================================
  const calculateAttainment = async () => {
    setIsGenerating(true);
    setReportError("");
    setReportHtml("");
    setReportBlob(null);

    try {
      let response;
      const effYear = reportAcademicYear || "2025-26";
      const effTitle = selectedSubjectTitle || "Data Science and Visualization";
      const effCode = selectedSubjectCode || "23CS2404";

      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("attainmentType", attainmentType);
        formData.append("facultyName", facultyName);
        formData.append("academicYear", effYear);
        formData.append("department", department);
        formData.append("className", className);
        formData.append("verifiedBy", verifiedBy);
        formData.append("hodName", hodName);
        formData.append("courseCode", effCode);
        formData.append("courseTitle", effTitle);
        formData.append("targetCA1", targetCA1);
        formData.append("targetCA2", targetCA2);
        formData.append("directWeight", 0.9);
        formData.append("indirectWeight", 0.1);
        formData.append("cos", JSON.stringify(cos));
        formData.append("mapping", JSON.stringify(mapping));

        response = await fetch(
          `${API_BASE_URL}/reports/create-report`,
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/reports/create-report`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attainmentType,
              facultyName,
              academicYear: effYear,
              department,
              className,
              verifiedBy,
              hodName,
              courseCode: effCode,
              courseTitle: effTitle,
              targetCA1,
              targetCA2,
              cos,
              mapping,
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate report.");
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });

      const formattedHtml = formatReportHtml(result.value);
      setReportBlob(blob);
      setReportHtml(formattedHtml);

      // Extract calculation metadata from response header or calculate-live endpoint
      let metaDataObj = null;
      const headerMeta = response.headers.get("X-Calculation-Summary");
      if (headerMeta) {
        try {
          metaDataObj = JSON.parse(decodeURIComponent(headerMeta));
        } catch (e) {
          console.warn("Failed to decode X-Calculation-Summary header:", e);
        }
      }

      // If header was missing or stripped, fetch from calculate-live endpoint
      if (!metaDataObj) {
        try {
          let liveRes;
          if (uploadedFile) {
            const liveForm = new FormData();
            liveForm.append("file", uploadedFile);
            liveForm.append("targetCA1", targetCA1);
            liveForm.append("targetCA2", targetCA2);
            liveForm.append("cos", JSON.stringify(cos));
            liveForm.append("mapping", JSON.stringify(mapping));
            liveRes = await fetch(`${API_BASE_URL}/reports/calculate-live`, {
              method: "POST",
              body: liveForm,
            });
          } else {
            liveRes = await fetch(`${API_BASE_URL}/reports/calculate-live`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                targetCA1,
                targetCA2,
                cos,
                mapping,
                useSample: true,
              }),
            });
          }
          if (liveRes.ok) {
            const liveJson = await liveRes.json();
            metaDataObj = liveJson.data;
          }
        } catch (mErr) {
          console.warn("Could not retrieve live metadata:", mErr);
        }
      }

      if (metaDataObj) {
        setCalculationMetadata(metaDataObj);
      }

      // Save to attainment calculation history
      const historyRecord = {
        id: "att_" + Date.now(),
        date: new Date().toLocaleString(),
        timestamp: Date.now(),
        courseCode: selectedSubjectCode || "SUB-01",
        courseTitle: selectedSubjectTitle || "Course Outcome Assessment",
        facultyName,
        department,
        academicYear,
        attainmentType,
        targetCA1,
        targetCA2,
        metadata: metaDataObj || null,
        reportHtml: formattedHtml,
      };
      saveHistoryItem(historyRecord);

      setTimeout(() => {
        document
          .getElementById("generated-report")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error("Report generation error:", error);
      setReportError(
        error.message ||
        "Could not connect to the backend. Make sure the server is running."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================================
  // REPORT EXPORT: WORD & PDF
  // =========================================
  const downloadWordReport = () => {
    if (!reportBlob) return;
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement("a");
    link.href = url;
    const safeCourse = (selectedSubjectCode || selectedSubjectTitle || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.download = `Attainx_${attainmentType || "Theory"}_Report_${safeCourse}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  const downloadPdfReport = async () => {
    setIsExportingPdf(true);
    try {
      let response;
      const effYear = reportAcademicYear || "2025-26";
      const effTitle = selectedSubjectTitle || "Data Science and Visualization";
      const effCode = selectedSubjectCode || "23CS2404";

      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("attainmentType", attainmentType);
        formData.append("facultyName", facultyName);
        formData.append("academicYear", effYear);
        formData.append("department", department);
        formData.append("className", className);
        formData.append("verifiedBy", verifiedBy);
        formData.append("hodName", hodName);
        formData.append("courseCode", effCode);
        formData.append("courseTitle", effTitle);
        formData.append("targetCA1", targetCA1);
        formData.append("targetCA2", targetCA2);
        formData.append("directWeight", 0.9);
        formData.append("indirectWeight", 0.1);
        formData.append("cos", JSON.stringify(cos));
        formData.append("mapping", JSON.stringify(mapping));
        if (calculationMetadata) {
          formData.append("calculatedAttainment", JSON.stringify(calculationMetadata));
        }

        response = await fetch(
          `${API_BASE_URL}/reports/create-report?format=pdf`,
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/reports/create-report?format=pdf`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attainmentType,
              facultyName,
              academicYear: effYear,
              department,
              className,
              verifiedBy,
              hodName,
              courseCode: effCode,
              courseTitle: effTitle,
              targetCA1,
              targetCA2,
              cos,
              mapping,
              calculatedAttainment: calculationMetadata,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Failed to generate PDF from backend server.");
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const safeCourse = (selectedSubjectCode || selectedSubjectTitle || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
      link.download = `Attainx_${attainmentType || "Theory"}_Report_${safeCourse}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setShowDownloadModal(false);
    } catch (err) {
      console.warn("Backend PDF generation error, trying html2pdf fallback:", err);
      const element = reportPreviewRef.current || document.querySelector(".report-preview");
      if (element) {
        try {
          ensureTableClasses(element);
          element.classList.add("exporting-pdf");
          await new Promise((resolve) => setTimeout(resolve, 120));

          const html2pdfModule = await import("html2pdf.js");
          const html2pdf = html2pdfModule.default || html2pdfModule;
          const safeCourse = (selectedSubjectCode || selectedSubjectTitle || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");

          const opt = {
            margin: [6, 8, 6, 8],
            filename: `Attainx_${attainmentType || "Theory"}_Report_${safeCourse}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              letterRendering: true,
              scrollY: 0,
              scrollX: 0,
              windowWidth: 720,
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: {
              mode: ["css", "legacy"],
              before: ".html2pdf__page-break",
              avoid: ["tr", ".report-signature-table", "h1", "h2", "h3"],
            },
          };

          await html2pdf().set(opt).from(element).save();
          setShowDownloadModal(false);
        } catch (hErr) {
          window.print();
          setShowDownloadModal(false);
        } finally {
          element.classList.remove("exporting-pdf");
        }
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  // =========================================
  // FILE UPLOAD & VALIDATION
  // =========================================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(extension)) {
      alert("Only CSV and Excel (.xlsx, .csv) files are allowed.");
      e.target.value = "";
      return;
    }

    setUploadedFile(file);
    setUploadError("");
    setStepError("");
    setFileStats(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetCA1", targetCA1);
      formData.append("targetCA2", targetCA2);
      formData.append("cos", JSON.stringify(cos));
      formData.append("mapping", JSON.stringify(mapping));

      const res = await fetch(`${API_BASE_URL}/reports/calculate-live`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFileStats({
          totalStudents: data.data?.totalStudents || 0,
          detectedColumns: data.data?.detectedColumns || [],
        });
      } else {
        setUploadError(data.message || "Failed to parse uploaded marksheet.");
      }
    } catch (err) {
      console.warn("Live file preview error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // =========================================
  // PROFILE IMAGE
  // =========================================
  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = {
        ...user,
        image: reader.result,
      };
      setUser(updated);
      try {
        localStorage.setItem("currentUser", JSON.stringify(updated));
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleUserChange = (field, value) => {
    const updated = { ...user, [field]: value };
    setUser(updated);
    if (field === "name") {
      setFacultyName(value);
    }
    if (field === "department") {
      setDepartment(value);
    }
    try {
      localStorage.setItem("currentUser", JSON.stringify(updated));
    } catch {}
  };

  // =========================================
  // LOGOUT
  // =========================================
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setShowProfile(false);
  };

  // =========================================
  // EXCEL / CSV TEMPLATE GENERATION
  // =========================================
  const handleCoCountChange = (val) => {
    const num = Math.min(6, Math.max(1, parseInt(val, 10) || 1));
    setTemplateCoCount(num);
  };

  const getTemplateColumns = () => {
    const baseCols = ["PRN", "CA1", "MSE", "CA2", "ESE"];
    const coCols = Array.from({ length: templateCoCount }, (_, i) => `CO${i + 1}`);
    return [...baseCols, ...coCols];
  };

  const handleTemplateCellChange = (rowIndex, colKey, val) => {
    const updated = [...templateData];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [colKey]: val,
    };
    setTemplateData(updated);
  };

  const handleAddTemplateRow = () => {
    const newRow = {
      prn: "",
      ca1: "",
      mse: "",
      ca2: "",
      ese: "",
    };
    for (let i = 1; i <= 6; i++) {
      newRow[`co${i}`] = "";
    }
    setTemplateData([...templateData, newRow]);
  };

  const downloadExcelTemplate = () => {
    const cols = getTemplateColumns();
    const rowsData = templateData.map((item) => {
      const row = [
        item.prn || "",
        item.ca1 ?? "",
        item.mse ?? "",
        item.ca2 ?? "",
        item.ese ?? "",
      ];
      for (let i = 1; i <= templateCoCount; i++) {
        row.push(item[`co${i}`] ?? "");
      }
      return row;
    });

    const emptyRowsToAdd = Math.max(0, 15 - rowsData.length);
    for (let i = 0; i < emptyRowsToAdd; i++) {
      const emptyRow = new Array(cols.length).fill("");
      rowsData.push(emptyRow);
    }

    const worksheetData = [cols, ...rowsData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      ...Array.from({ length: templateCoCount }, () => ({ wch: 10 })),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Attainment");

    const fileName = templateCourseName
      ? `Attainx_${templateCourseName.replace(/\s+/g, "_")}_${templateCoCount}COs_Template.xlsx`
      : `Attainx_Student_Attainment_${templateCoCount}COs_Template.xlsx`;

    XLSX.writeFile(workbook, fileName);
    setTemplateDownloaded(true);
    setStepError("");
  };

  const downloadCsvTemplate = () => {
    const cols = getTemplateColumns();
    const rowsData = templateData.map((item) => {
      const row = [
        `"${item.prn || ""}"`,
        item.ca1 ?? "",
        item.mse ?? "",
        item.ca2 ?? "",
        item.ese ?? "",
      ];
      for (let i = 1; i <= templateCoCount; i++) {
        row.push(item[`co${i}`] ?? "");
      }
      return row.join(",");
    });

    const csvContent = [cols.join(","), ...rowsData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = templateCourseName
      ? `Attainx_${templateCourseName.replace(/\s+/g, "_")}_${templateCoCount}COs_Template.csv`
      : `Attainx_Student_Attainment_${templateCoCount}COs_Template.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setTemplateDownloaded(true);
    setStepError("");
  };

  const initial = user.name.charAt(0).toUpperCase();

  const stepItems = [
    {
      id: 1,
      num: "01",
      title: "Generate Template",
      sub: isStep1Complete ? "Completed" : "Download or Skip",
      isComplete: isStep1Complete,
    },
    {
      id: 2,
      num: "02",
      title: "Academic Details",
      sub: isStep2Complete ? "Completed" : "Faculty, Subject & Upload",
      isComplete: isStep2Complete,
    },
    {
      id: 3,
      num: "03",
      title: "COs & Mapping",
      sub: isStep3Complete ? "Completed" : "Syllabus Matrix",
      isComplete: isStep3Complete,
    },
    {
      id: 4,
      num: "04",
      title: "Calculate Attainment",
      sub: reportHtml
        ? "Report Generated"
        : isStep4Complete
          ? "Ready to Analyze"
          : "Pending",
      isComplete: !!reportHtml,
    },
  ];

  return (
    <div className={`portal ${darkMode ? "dark" : "light"}`}>
      {/* =====================================
          SIDEBAR
      ===================================== */}
      <aside className="sidebar">
        <div className="logo">
          <img src={attainxLogo} alt="Attainx" />
          <span>Attainx</span>
        </div>

        {/* USER */}
        {isLoggedIn ? (
          <div className="sidebar-user" onClick={() => setShowProfile(true)}>
            <div className="avatar">
              {user.image ? <img src={user.image} alt="profile" /> : initial}
            </div>

            <div className="user-details">
              <strong>{user.name}</strong>
              <span>{user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "Faculty"}</span>
            </div>

            <span className="dots">•••</span>
          </div>
        ) : (
          <div className="sidebar-user sidebar-guest-user" onClick={() => navigate("/login")}>
            <div className="avatar guest-avatar">
              <IconLock size={15} />
            </div>

            <div className="user-details">
              <strong>Guest Session</strong>
              <span>Sign in required</span>
            </div>

            <span className="sign-in-pill">Login</span>
          </div>
        )}

        {/* 4-STEP WORKFLOW MENU */}
        <div className="sidebar-menu">
          <div style={{ padding: "0 14px 6px", fontSize: "11px", fontWeight: "700", color: "var(--muted)", letterSpacing: "1px" }}>
            WORKFLOW STEPS
          </div>

          {stepItems.map((step) => {
            const isClickable =
              isLoggedIn &&
              (step.id === 1 ||
                (step.id === 2 && isStep1Complete) ||
                (step.id === 3 && isStep1Complete && isStep2Complete) ||
                (step.id === 4 && isStep1Complete && isStep2Complete && isStep3Complete));

            return (
              <button
                key={step.id}
                className={`menu-item ${isLoggedIn && currentStep === step.id ? "active" : ""} ${!isLoggedIn ? "locked-step" : ""}`}
                onClick={isClickable ? () => goToStep(step.id) : null}
                disabled={!isClickable}
                title={!isLoggedIn ? "Please log in to access this step" : ""}
                style={{ opacity: !isLoggedIn ? 0.6 : isClickable ? 1 : 0.6 }}
              >
                {!isLoggedIn && (
                  <span className="step-lock-icon">
                    <IconLock size={13} />
                  </span>
                )}
                <span>{step.num}</span>
                <span className="step-label-text">{step.title}</span>
                {isLoggedIn && step.isComplete && (
                  <span className="menu-step-badge">
                    <IconCheck size={12} />
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />

          <button
            className={`menu-item ${!isLoggedIn ? "locked-step" : ""}`}
            onClick={isLoggedIn ? () => setShowHistory(true) : () => navigate("/login")}
            style={{ opacity: !isLoggedIn ? 0.6 : 1 }}
          >
            <span>
              {!isLoggedIn ? <IconLock size={14} /> : <IconHistory size={16} />}
            </span>
            Attainment History
            {isLoggedIn && historyItems.length > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "#6366f1",
                  color: "#fff",
                  fontSize: "10.5px",
                  fontWeight: "700",
                  padding: "2px 7px",
                  borderRadius: "10px",
                }}
              >
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {/* SETTINGS & THEME TOGGLE */}
        <div className="sidebar-bottom">
          <div className="sidebar-quick-theme">
            <button
              type="button"
              className="sidebar-theme-btn"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <IconSun size={15} /> : <IconMoon size={15} />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          {isLoggedIn && (
            <button className="menu-item" onClick={() => setShowProfile(true)}>
              <span>
                <IconSettings size={16} />
              </span>
              Settings
            </button>
          )}
        </div>
      </aside>

      {/* =====================================
          PROFILE CARD OVERLAY & PANEL
      ===================================== */}
      {showProfile && (
        <>
          <div
            className="profile-overlay"
            onClick={() => setShowProfile(false)}
            aria-hidden="true"
          />
          <div className="profile-panel" ref={profileCardRef}>
            <div className="profile-top">
              <h2>Profile</h2>

              <button
                className="close-profile"
                onClick={() => setShowProfile(false)}
                aria-label="Close Profile"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="profile-picture">
              <div className="large-avatar">
                {user.image ? <img src={user.image} alt="profile" /> : initial}
              </div>

              <label className="change-picture">
                Change picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImage}
                />
              </label>
            </div>

            <label>NAME / USERNAME</label>
            <input
              className="profile-input"
              value={user.name}
              onChange={(e) => handleUserChange("name", e.target.value)}
            />

            <label>ACCOUNT ROLE</label>
            <input
              className="profile-input"
              value={user.role || "TEACHER"}
              disabled
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            />

            <label>DEPARTMENT</label>
            <input
              className="profile-input"
              value={user.department}
              onChange={(e) => handleUserChange("department", e.target.value)}
            />

            <label>EMAIL</label>
            <input
              className="profile-input"
              value={user.email}
              onChange={(e) => handleUserChange("email", e.target.value)}
            />

            <div className="theme-row">
              <div>
                <strong>Appearance</strong>
                <span>{darkMode ? "Dark mode" : "Light mode"}</span>
              </div>

              <button
                className={`toggle ${darkMode ? "on" : ""}`}
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle theme"
              >
                <span />
              </button>
            </div>

            <button className="logout-button" onClick={logout}>
              Logout
              <IconExternalLink size={14} />
            </button>
          </div>
        </>
      )}

      {/* =====================================
          ATTAINMENT HISTORY MODAL
      ===================================== */}
      {showHistory && (
        <div
          className="history-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("history-modal-overlay")) {
              setShowHistory(false);
            }
          }}
        >
          <div className="history-modal-card">
            <div className="history-modal-header">
              <h2>
                <IconHistory size={20} />
                Attainment Calculation History
              </h2>
              <button
                className="close-profile"
                onClick={() => setShowHistory(false)}
                aria-label="Close History"
              >
                <IconClose size={18} />
              </button>
            </div>

            <div className="history-modal-body">
              {historyItems.length === 0 ? (
                <div className="history-empty-state">
                  <IconHistory size={40} />
                  <p style={{ margin: "10px 0 4px", fontWeight: "600", color: "var(--text)" }}>
                    No Attainment History Found
                  </p>
                  <small>
                    Calculated reports and outcome attainment summaries will appear here automatically.
                  </small>
                </div>
              ) : (
                <div className="history-list">
                  {historyItems.map((item) => (
                    <div key={item.id} className="history-item-card">
                      <div className="history-item-main">
                        <div className="history-item-title">
                          <span>{item.courseCode} - {item.courseTitle}</span>
                          <span className="calc-badge" style={{ fontSize: "10px", padding: "2px 8px" }}>
                            {item.attainmentType?.toUpperCase()}
                          </span>
                        </div>
                        <div className="history-item-meta">
                          <span><strong>Faculty:</strong> {item.facultyName}</span>
                          <span><strong>Dept:</strong> {item.department}</span>
                          <span><strong>Academic Year:</strong> {item.academicYear}</span>
                          <span><strong>Date:</strong> {item.date}</span>
                          {item.metadata?.summary?.avgFinalCoScore && (
                            <span style={{ color: "#6366f1", fontWeight: "600" }}>
                              Avg CO Score: {item.metadata.summary.avgFinalCoScore} / 3.0
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="history-item-actions">
                        <button
                          type="button"
                          className="history-btn-view"
                          onClick={() => {
                            if (item.reportHtml) {
                              setReportHtml(item.reportHtml);
                            }
                            if (item.metadata) {
                              setCalculationMetadata(item.metadata);
                            }
                            setSelectedSubjectCode(item.courseCode);
                            setSelectedSubjectTitle(item.courseTitle);
                            setFacultyName(item.facultyName);
                            setDepartment(item.department);
                            setAcademicYear(item.academicYear);
                            setAttainmentType(item.attainmentType);
                            setShowHistory(false);
                            setCurrentStep(4);
                            setTimeout(() => {
                              document.getElementById("generated-report")?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }, 100);
                          }}
                        >
                          Show on Portal
                          <IconArrowRight size={14} />
                        </button>

                        <button
                          type="button"
                          className="history-btn-delete"
                          onClick={() => deleteHistoryItem(item.id)}
                          title="Delete this history record"
                          aria-label="Delete history"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {historyItems.length > 0 && (
              <div className="history-modal-footer">
                <span style={{ fontSize: "12px", color: "var(--soft)" }}>
                  Showing {historyItems.length} archived attainment calculation{historyItems.length > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  className="history-clear-all-btn"
                  onClick={clearAllHistory}
                >
                  Clear All History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================
          MAIN CONTENT AREA
      ===================================== */}
      {!isLoggedIn ? (
        <main className="portal-main portal-main-logged-out">
          <div className="logged-out-center-container">
            {/* 3D Rotating Triangle Delta Canvas */}
            <div className="logged-out-delta-wrapper">
              <TickerDelta
                background="transparent"
                direction="cw"
                speed={0.65}
                hoverSpeed={1.8}
                thickness={4.8}
                roundness={2.5}
                shadow={0}
                scale={140}
                drag={true}
                leftFace={{
                  text: "STUDENT ATTAINMENT ·",
                  size: 6.5,
                  weight: "bold",
                  fill: darkMode ? "#ffffff" : "#0f172a",
                  ink: darkMode ? "#0f172a" : "#ffffff",
                }}
                topFace={{
                  text: "STUDENT ATTAINMENT ·",
                  size: 5,
                  weight: "regular",
                  fill: darkMode ? "#1f1f23" : "#f1f5f9",
                  ink: darkMode ? "#ffffff" : "#0f172a",
                }}
                rightFace={{
                  text: "STUDENT ATTAINMENT ·",
                  size: 4,
                  weight: "light",
                  fill: darkMode ? "#52525b" : "#e2e8f0",
                  ink: darkMode ? "#f4f4f6" : "#334155",
                }}
              />
            </div>

            {/* Central Attainx Brand Section */}
            <div className="logged-out-brand-card">
              <div className="logged-out-logo-row">
                <img src={attainxLogo} alt="Attainx" className="logged-out-logo" />
                <h1 className="logged-out-brand-title">Attainx</h1>
              </div>

              <span className="logged-out-badge">
                OUTCOME-BASED EDUCATION WORKBENCH
              </span>

              <p className="logged-out-description">
                Please log in to your account to configure curriculum data, upload
                assessments, compute NBA CO-PO attainments, and generate official compliance reports.
              </p>

              <div className="logged-out-action-group">
                <button
                  type="button"
                  className="logged-out-login-btn"
                  onClick={() => navigate("/login")}
                >
                  <span>Log In to System</span>
                  <span className="login-arrow">↗</span>
                </button>

                <div className="logged-out-register-prompt">
                  <span>Don't have an account?</span>
                  <button
                    type="button"
                    className="logged-out-create-link"
                    onClick={() => navigate("/login", { state: { mode: "register" } })}
                  >
                    Create Account →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="portal-main">
        {/* HEADER */}
        <header className="portal-header">
          <div>
            <span className="eyebrow">ACADEMIC ATTAINMENT WORKBENCH</span>
            <h1>
              {currentStep === 1 && "Generate Template"}
              {currentStep === 2 && "Academic Details"}
              {currentStep === 3 && "COs & Mapping Matrix"}
              {currentStep === 4 && "Calculate Attainment"}
            </h1>
            <p>
              {currentStep === 1 && "Step 1 of 4: Download assessment template or skip if you already have one ready"}
              {currentStep === 2 && "Step 2 of 4: Enter faculty information, curriculum selection, and upload student marksheet"}
              {currentStep === 3 && "Step 3 of 4: Review auto-fetched Course Outcomes & correlation matrix (editable)"}
              {currentStep === 4 && "Step 4 of 4: Set target thresholds and compute comprehensive outcome attainment"}
            </p>
          </div>
        </header>

        {/* =====================================
            WIZARD STEPPER TRACK
        ===================================== */}
        <div className="wizard-stepper-container">
          <div className="wizard-stepper-track">
            {stepItems.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isComplete = step.isComplete;
              const isAccessible =
                step.id === 1 ||
                (step.id === 2 && isStep1Complete) ||
                (step.id === 3 && isStep1Complete && isStep2Complete) ||
                (step.id === 4 && isStep1Complete && isStep2Complete && isStep3Complete);

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    className={`wizard-step-node ${isActive ? "active" : ""} ${isComplete ? "completed" : ""
                      }`}
                    onClick={() => goToStep(step.id)}
                    disabled={!isAccessible && !isActive}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="wizard-step-badge">
                      {isComplete && !isActive ? (
                        <IconCheck size={14} />
                      ) : (
                        step.num
                      )}
                    </div>

                    <div className="wizard-step-info">
                      <span className="wizard-step-index">Step {step.id}</span>
                      <span className="wizard-step-title">{step.title}</span>
                      <span className="wizard-step-status">
                        {isActive
                          ? "In Progress"
                          : isComplete
                            ? "Completed"
                            : "Pending"}
                      </span>
                    </div>
                  </button>

                  {idx < stepItems.length - 1 && (
                    <div
                      className={`wizard-step-connector ${isComplete ? "completed" : ""
                        }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* VALIDATION ERROR BANNER */}
        {stepError && (
          <div className="step-validation-banner" role="alert">
            <span className="step-validation-icon">
              <IconAlert size={20} />
            </span>
            <div className="step-validation-content">
              <div className="step-validation-title">Action Required to Proceed</div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text)" }}>{stepError}</p>
            </div>
          </div>
        )}

        {/* =====================================
            STEP 1: GENERATE TEMPLATE
        ===================================== */}
        {currentStep === 1 && (
          <div className="step-content-container">
            {/* FEATURE: SKIP CALLOUT CARD */}
            <div className={`skip-template-card ${hasExistingTemplate ? "active-skip" : ""}`}>
              <div className="skip-template-left">
                <div className="skip-template-icon">
                  {hasExistingTemplate ? (
                    <IconCheck size={22} />
                  ) : (
                    <IconClipboard size={22} />
                  )}
                </div>
                <div className="skip-template-text">
                  <h3>Already have your student marksheet template?</h3>
                  <p>
                    If you have an existing Excel/CSV marksheet with Name, PRN, and test marks (CA1, MSE, CA2, ESE, COs), clicking below will immediately mark this step completed and redirect you straight to Academic Details.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={`skip-template-btn ${hasExistingTemplate ? "is-skipped" : ""}`}
                onClick={handleSkipTemplateAndProceed}
              >
                {hasExistingTemplate ? (
                  <>
                    <IconCheck size={15} />
                    Template Marked as Ready (Proceed to Step 2)
                    <IconArrowRight size={14} />
                  </>
                ) : (
                  <>
                    <IconClipboard size={15} />
                    I already have a template — Proceed to Next Step
                    <IconArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* TEMPLATE CONFIGURATION */}
            <section className="portal-section">
              <div className="section-title">
                <span>01</span>
                <div>
                  <h2>Configure Marksheet Template</h2>
                  <p>Customize the number of Course Outcomes (COs) for your course (Maximum 6 COs).</p>
                </div>
              </div>

              <div className="template-config-card">
                <div className="config-group">
                  <div className="config-label-row">
                    <label>NUMBER OF COURSE OUTCOMES (COs)</label>
                    <span className="co-badge">Max 6 COs Allowed</span>
                  </div>

                  <div className="co-counter-row">
                    <div className="co-selector-buttons">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`co-pill-btn ${templateCoCount === num ? "active" : ""}`}
                          onClick={() => setTemplateCoCount(num)}
                        >
                          {num} {num === 1 ? "CO" : "COs"}
                        </button>
                      ))}
                    </div>

                    <div className="co-number-input-wrap">
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={templateCoCount}
                        onChange={(e) => handleCoCountChange(e.target.value)}
                        className="co-number-input"
                      />
                      <span className="co-input-hint">COs</span>
                    </div>
                  </div>
                </div>

                <div className="config-grid-two">
                  <div className="config-field">
                    <label>COURSE NAME / CODE (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Systems (CS401)"
                      value={templateCourseName}
                      onChange={(e) => setTemplateCourseName(e.target.value)}
                      className="template-meta-input"
                    />
                  </div>

                  <div className="config-field">
                    <label>ACADEMIC YEAR (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-2027"
                      value={templateAcademicYear}
                      onChange={(e) => setTemplateAcademicYear(e.target.value)}
                      className="template-meta-input"
                    />
                  </div>
                </div>

                <div className="generated-columns-summary">
                  <span className="summary-title">Columns generated in Excel template:</span>
                  <div className="columns-badges">
                    <span className="col-badge fixed">PRN</span>
                    <span className="col-badge fixed">CA1</span>
                    <span className="col-badge fixed">MSE</span>
                    <span className="col-badge fixed">CA2</span>
                    <span className="col-badge fixed">ESE</span>
                    {Array.from({ length: templateCoCount }, (_, i) => (
                      <span key={i} className="col-badge dynamic">
                        CO{i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* LIVE PREVIEW TABLE */}
            <section className="portal-section">
              <div className="section-title">
                <span>02</span>
                <div>
                  <h2>Live Template Preview</h2>
                  <p>Preview and edit columns before downloading. Use arrow keys (↑ ↓ ← →) to navigate cells.</p>
                </div>
              </div>

              <div className="table-wrapper template-preview-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>#</th>
                      <th style={{ width: "160px" }}>PRN Number</th>
                      <th style={{ width: "90px" }}>CA1</th>
                      <th style={{ width: "90px" }}>MSE</th>
                      <th style={{ width: "90px" }}>CA2</th>
                      <th style={{ width: "90px" }}>ESE</th>
                      {Array.from({ length: templateCoCount }, (_, i) => (
                        <th key={i} style={{ width: "90px" }} className="co-header-th">
                          CO{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templateData.map((row, rIdx) => {
                      const cols = getTemplateColumns();
                      return (
                        <tr key={rIdx}>
                          <td>{rIdx + 1}</td>
                          <td>
                            <input
                              ref={(el) => {
                                templateGridRefs.current[`${rIdx}-0`] = el;
                              }}
                              value={row.prn}
                              onChange={(e) => handleTemplateCellChange(rIdx, "prn", e.target.value)}
                              onKeyDown={(e) => handleTemplateKeyDown(e, rIdx, "prn", cols.length, 0)}
                              placeholder="e.g. 2025CS101"
                            />
                          </td>
                          <td>
                            <input
                              ref={(el) => {
                                templateGridRefs.current[`${rIdx}-1`] = el;
                              }}
                              value={row.ca1}
                              onChange={(e) => handleTemplateCellChange(rIdx, "ca1", e.target.value)}
                              onKeyDown={(e) => handleTemplateKeyDown(e, rIdx, "ca1", cols.length, 1)}
                              inputMode="numeric"
                            />
                          </td>
                          <td>
                            <input
                              ref={(el) => {
                                templateGridRefs.current[`${rIdx}-2`] = el;
                              }}
                              value={row.mse}
                              onChange={(e) => handleTemplateCellChange(rIdx, "mse", e.target.value)}
                              onKeyDown={(e) => handleTemplateKeyDown(e, rIdx, "mse", cols.length, 2)}
                              inputMode="numeric"
                            />
                          </td>
                          <td>
                            <input
                              ref={(el) => {
                                templateGridRefs.current[`${rIdx}-3`] = el;
                              }}
                              value={row.ca2}
                              onChange={(e) => handleTemplateCellChange(rIdx, "ca2", e.target.value)}
                              onKeyDown={(e) => handleTemplateKeyDown(e, rIdx, "ca2", cols.length, 3)}
                              inputMode="numeric"
                            />
                          </td>
                          <td>
                            <input
                              ref={(el) => {
                                templateGridRefs.current[`${rIdx}-4`] = el;
                              }}
                              value={row.ese}
                              onChange={(e) => handleTemplateCellChange(rIdx, "ese", e.target.value)}
                              onKeyDown={(e) => handleTemplateKeyDown(e, rIdx, "ese", cols.length, 4)}
                              inputMode="numeric"
                            />
                          </td>
                          {Array.from({ length: templateCoCount }, (_, i) => {
                            const coKey = `co${i + 1}`;
                            const cIdx = 5 + i;
                            return (
                              <td key={coKey}>
                                <input
                                  ref={(el) => {
                                    templateGridRefs.current[`${rIdx}-${cIdx}`] = el;
                                  }}
                                  value={row[coKey] ?? ""}
                                  onChange={(e) => handleTemplateCellChange(rIdx, coKey, e.target.value)}
                                  onKeyDown={(e) => handleTemplateKeyDown(e, rIdx, coKey, cols.length, cIdx)}
                                  inputMode="numeric"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="template-preview-actions">
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="add-row-btn"
                    onClick={handleAddTemplateRow}
                  >
                    + Add Empty Row
                  </button>

                  <button
                    type="button"
                    className="clear-button"
                    onClick={() => setTemplateData(createEmptyTemplateRows(5))}
                  >
                    Clear Rows
                  </button>
                </div>

                <small className="keyboard-help">
                  Navigate seamlessly across all fields using ↑ ↓ ← → arrow keys
                </small>
              </div>
            </section>

            {/* DOWNLOAD ACTIONS */}
            <section className="calculate-section template-download-section">
              <div>
                <span className="calculate-label">DOWNLOAD TEMPLATE</span>
                <h2>
                  Export
                  <br />
                  <span>Excel Sheet.</span>
                </h2>
                <p className="template-download-sub">
                  Downloading marks Step 1 as completed so you can upload your filled sheet in Step 2.
                </p>
              </div>

              <div className="template-action-buttons">
                <button
                  type="button"
                  className="calculate-button download-excel-main-btn"
                  onClick={downloadExcelTemplate}
                >
                  Download Excel (.xlsx)
                  <IconDownload size={15} />
                </button>

                <button
                  type="button"
                  className="clear-button download-csv-btn"
                  onClick={downloadCsvTemplate}
                >
                  <IconDownload size={15} />
                  Download CSV (.csv)
                </button>
              </div>
            </section>

            {templateDownloaded && (
              <div className="download-toast">
                <IconCheck size={16} />
                Template downloaded! Step 1 completed. You can now proceed to Academic Details.
              </div>
            )}
          </div>
        )}

        {/* =====================================
            STEP 2: DETAILS TILL ACADEMIC DETAILS & MARKSHEET
        ===================================== */}
        {currentStep === 2 && (
          <div className="step-content-container">
            {/* FACULTY INFORMATION */}
            <section className="portal-section">
              <div className="section-title">
                <span>01</span>
                <div>
                  <h2>
                    Faculty Information <span className="required-field-star">*</span>
                  </h2>
                  <p>Confirm the course instructor name responsible for this evaluation.</p>
                </div>
              </div>

              <div className="faculty-input">
                <label>FACULTY NAME</label>
                <input
                  ref={facultyRef}
                  value={facultyName}
                  onChange={(e) => {
                    setFacultyName(e.target.value);
                    setStepError("");
                  }}
                  onKeyDown={handleFacultyKeyDown}
                  placeholder="Enter faculty name"
                  className={!facultyName.trim() && stepError ? "input-has-error" : ""}
                />
                <small>Automatically loaded from your profile · Press Enter/Down to continue</small>
              </div>
            </section>

            {/* ATTAINMENT TYPE */}
            <section className="portal-section">
              <div className="section-title">
                <span>02</span>
                <div>
                  <h2>
                    Attainment Type <span className="required-field-star">*</span>
                  </h2>
                  <p>Select the assessment mode according to course structure.</p>
                </div>
              </div>

              <div className="attainment-type-grid">
                <button
                  type="button"
                  className={`attainment-type-card ${attainmentType === "theory" ? "selected" : ""
                    }`}
                  aria-pressed={attainmentType === "theory"}
                  onClick={() => handleAttainmentTypeSelect("theory")}
                >
                  <span className="attainment-type-number">01</span>
                  <strong>Theory Attainment</strong>
                  <span>CA-1, MSE, CA-2, ESE and CES</span>
                  <span className="attainment-type-check">
                    {attainmentType === "theory" ? (
                      <>
                        <IconCheck size={13} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  className={`attainment-type-card ${attainmentType === "laboratory" ? "selected" : ""
                    }`}
                  aria-pressed={attainmentType === "laboratory"}
                  onClick={() => handleAttainmentTypeSelect("laboratory")}
                >
                  <span className="attainment-type-number">02</span>
                  <strong>Laboratory Attainment</strong>
                  <span>Laboratory course assessment and CES</span>
                  <span className="attainment-type-check">
                    {attainmentType === "laboratory" ? (
                      <>
                        <IconCheck size={13} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  className={`attainment-type-card ${attainmentType === "lab-pr-or" ? "selected" : ""
                    }`}
                  aria-pressed={attainmentType === "lab-pr-or"}
                  onClick={() => handleAttainmentTypeSelect("lab-pr-or")}
                >
                  <span className="attainment-type-number">03</span>
                  <strong>Laboratory with PR/OR</strong>
                  <span>Practical/oral examination and CES</span>
                  <span className="attainment-type-check">
                    {attainmentType === "lab-pr-or" ? (
                      <>
                        <IconCheck size={13} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  className={`attainment-type-card ${attainmentType === "audit-course" ? "selected" : ""
                    }`}
                  aria-pressed={attainmentType === "audit-course"}
                  onClick={() => handleAttainmentTypeSelect("audit-course")}
                >
                  <span className="attainment-type-number">04</span>
                  <strong>Audit Course</strong>
                  <span>Audit course assessment and outcome evaluation</span>
                  <span className="attainment-type-check">
                    {attainmentType === "audit-course" ? (
                      <>
                        <IconCheck size={13} /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </span>
                </button>
              </div>
            </section>

            {/* ACADEMIC DETAILS & SUBJECT AUTO-FETCH */}
            <section className="portal-section">
              <div className="section-title">
                <span>03</span>
                <div>
                  <h2>
                    Academic Details <span className="required-field-star">*</span>
                  </h2>
                  <p>Choose academic year, department, and curriculum subject for auto-populating COs & mapping.</p>
                </div>
              </div>

              <div className="academic-selection-grid">
                <div className="academic-select-card">
                  <div className="academic-select-label-wrap">
                    <label htmlFor="academic-year-select">ACADEMIC YEAR</label>
                    <span className="selection-badge">Class</span>
                  </div>

                  <div className="custom-select-container">
                    <select
                      id="academic-year-select"
                      className="portal-select"
                      value={academicYear}
                      onChange={(e) => handleAcademicYearChange(e.target.value)}
                    >
                      <option value="FY">FY</option>
                      <option value="SY">SY</option>
                      <option value="TY">TY</option>
                      <option value="BTech">BTech</option>
                    </select>
                    <span className="select-dropdown-indicator">
                      <IconChevronDown size={14} />
                    </span>
                  </div>
                  <small className="academic-select-hint">
                    Select from FY, SY, TY, or BTech
                  </small>
                </div>

                <div className="academic-select-card">
                  <div className="academic-select-label-wrap">
                    <label htmlFor="academic-dept-select">SELECT DEPARTMENT</label>
                    <span className="selection-badge">Branch</span>
                  </div>

                  <div className="custom-select-container">
                    <select
                      id="academic-dept-select"
                      className="portal-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <span className="select-dropdown-indicator">
                      <IconChevronDown size={14} />
                    </span>
                  </div>
                  <small className="academic-select-hint">
                    Select department for this course
                  </small>
                </div>

                <div className="academic-select-card">
                  <div className="academic-select-label-wrap">
                    <label htmlFor="academic-subject-select">SELECT SUBJECT</label>
                    <span className="selection-badge">Curriculum</span>
                  </div>

                  <div className="custom-select-container">
                    <select
                      id="academic-subject-select"
                      className={`portal-select ${!selectedSubjectCode && stepError ? "input-has-error" : ""
                        }`}
                      value={selectedSubjectCode}
                      onChange={(e) => handleSubjectSelect(e.target.value)}
                    >
                      <option value="">
                        -- Choose {attainmentType === "theory" ? "Theory Subject" : (attainmentType === "laboratory" || attainmentType === "lab-pr-or") ? "Laboratory Subject" : "Subject"} (Auto-fill) --
                      </option>
                      {availableSubjects.map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.code} - {sub.title}
                        </option>
                      ))}
                    </select>
                    <span className="select-dropdown-indicator">
                      <IconChevronDown size={14} />
                    </span>
                  </div>
                  <small className="academic-select-hint">
                    {attainmentType === "theory"
                      ? `Showing Theory subjects for ${academicYear || "selected year"}`
                      : (attainmentType === "laboratory" || attainmentType === "lab-pr-or")
                        ? `Showing Laboratory subjects for ${academicYear || "selected year"}`
                        : "Auto-populates COs & correlation matrix for Step 3"}
                  </small>
                </div>
              </div>

              {isAutoLoaded && (
                <div className="curriculum-badge-banner" style={{ marginTop: "20px" }}>
                  <span className="curriculum-badge-icon">
                    <IconCheck size={16} />
                  </span>
                  <div>
                    <strong>
                      Loaded Curriculum for {selectedSubjectCode}: {selectedSubjectTitle}
                    </strong>
                    <p>
                      Course Outcomes and CO-PO Correlation Matrix have been auto-fetched from NEP syllabus and are ready in Step 3.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="reset-curriculum-btn"
                    onClick={() => {
                      setSelectedSubjectCode("");
                      setSelectedSubjectTitle("");
                      setIsAutoLoaded(false);
                    }}
                  >
                    Reset / Custom
                  </button>
                </div>
              )}
            </section>

            {/* MARKSHEET FILE UPLOAD */}
            <section className="portal-section">
              <div className="section-title">
                <span>04</span>
                <div>
                  <h2>
                    Upload Student Marksheet <span className="required-field-star">*</span>
                  </h2>
                  <p>Upload your filled Excel (.xlsx) or CSV (.csv) marksheet to evaluate attainment.</p>
                </div>
              </div>

              <label
                className={`upload-box ${uploadedFile ? "upload-box--done" : ""} ${!uploadedFile && stepError ? "input-has-error" : ""
                  }`}
              >
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileUpload}
                />

                <div className="upload-arrow">
                  {isUploading ? (
                    <IconSpinner size={24} />
                  ) : uploadedFile ? (
                    <IconCheck size={24} />
                  ) : (
                    <IconUploadCloud size={24} />
                  )}
                </div>

                {isUploading ? (
                  <>
                    <strong>Analyzing Marksheet...</strong>
                    <span>Validating student rows and columns</span>
                  </>
                ) : uploadedFile ? (
                  <>
                    <strong style={{ color: "#22c55e" }}>
                      {uploadedFile.name}
                    </strong>
                    <span>
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                      {fileStats?.totalStudents
                        ? ` • ${fileStats.totalStudents} students detected`
                        : ""}
                      {" • Click to replace file"}
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Upload CSV or Excel marksheet</strong>
                    <span>CSV · XLS · XLSX (Required to proceed)</span>
                  </>
                )}
              </label>

              {uploadError && (
                <p className="report-error" style={{ marginTop: "12px" }}>
                  {uploadError}
                </p>
              )}
            </section>
          </div>
        )}

        {/* =====================================
            STEP 3: SHOW COs AND MAPPING TABLE
        ===================================== */}
        {currentStep === 3 && (
          <div className="step-content-container">
            {isAutoLoaded && (
              <div className="curriculum-badge-banner" style={{ marginBottom: "35px" }}>
                <span className="curriculum-badge-icon">
                  <IconCheck size={16} />
                </span>
                <div>
                  <strong>
                    Curriculum Auto-Fetched: {selectedSubjectCode} — {selectedSubjectTitle}
                  </strong>
                  <p>
                    All Course Outcomes and correlation mappings below were automatically loaded from the curriculum. You can edit any statement or cell values directly.
                  </p>
                </div>
                <button
                  type="button"
                  className="reset-curriculum-btn"
                  onClick={() => {
                    setSelectedSubjectCode("");
                    setSelectedSubjectTitle("");
                    setIsAutoLoaded(false);
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* COURSE OUTCOMES */}
            <section className="portal-section">
              <div className="section-title">
                <span>01</span>
                <div>
                  <h2>
                    Course Outcomes (COs) <span className="required-field-star">*</span>
                  </h2>
                  <p>
                    {isAutoLoaded
                      ? "Auto-fetched from syllabus. Click and edit any statement as needed."
                      : "Enter Course Outcome statements (use ↑ ↓ arrow keys to navigate)."}
                  </p>
                </div>
              </div>

              <div className="co-container">
                {rows.map((co, index) => (
                  <div className="co-row" key={co}>
                    <span>{co}</span>

                    <input
                      ref={(el) => {
                        coRefs.current[co] = el;
                      }}
                      value={cos[co]}
                      placeholder={`Enter ${co} statement (e.g. Understand core concepts...)`}
                      onChange={(e) => handleCOChange(co, e.target.value)}
                      onKeyDown={(e) => handleCOKeyDown(e, index)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* CO / PO MAPPING MATRIX */}
            <section className="portal-section">
              <div className="section-title">
                <span>02</span>
                <div>
                  <h2>
                    CO / PO Correlation Matrix <span className="required-field-star">*</span>
                  </h2>
                  <p>
                    {isAutoLoaded
                      ? "Auto-fetched correlation values (0: None, 1: Low, 2: Medium, 3: High). Click any cell to customize."
                      : "Enter correlation matrix values from 0 to 3."}
                  </p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>CO / PO</th>
                      {columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={row}>
                        <th>{row}</th>

                        {columns.map((column, columnIndex) => (
                          <td key={column}>
                            <input
                              ref={(element) => {
                                inputRefs.current[`${rowIndex}-${columnIndex}`] =
                                  element;
                              }}
                              value={mapping[row][column]}
                              onChange={(e) =>
                                handleMappingChange(row, column, e.target.value)
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(e, rowIndex, columnIndex)
                              }
                              inputMode="numeric"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mapping-actions">
                <button className="clear-button" onClick={clearAllMapping}>
                  Clear All
                </button>

                <small className="keyboard-help">
                  Use ↑ ↓ ← → arrow keys to move seamlessly between matrix cells
                </small>
              </div>
            </section>
          </div>
        )}

        {/* =====================================
            STEP 4: CALCULATE ATTAINMENT
        ===================================== */}
        {currentStep === 4 && (
          <div className="step-content-container">
            {/* REVIEW SUMMARY CARD */}
            <div className="step-review-summary-card">
              <div className="step-review-header">
                <h3>Verification Summary</h3>
                <span className="step-review-badge">
                  <IconCheck size={12} /> Steps 1, 2, and 3 Verified
                </span>
              </div>

              <div className="step-review-grid">
                <div className="step-review-item">
                  <label>FACULTY</label>
                  <strong>{facultyName || "Not specified"}</strong>
                </div>

                <div className="step-review-item">
                  <label>DEPARTMENT</label>
                  <strong>{department}</strong>
                </div>

                <div className="step-review-item">
                  <label>CLASS / YEAR</label>
                  <strong>{academicYear}</strong>
                </div>

                <div className="step-review-item">
                  <label>SUBJECT</label>
                  <strong>
                    {selectedSubjectCode
                      ? `${selectedSubjectCode} - ${selectedSubjectTitle}`
                      : "Custom Subject"}
                  </strong>
                </div>

                <div className="step-review-item">
                  <label>ATTAINMENT TYPE</label>
                  <strong style={{ textTransform: "capitalize" }}>
                    {attainmentType.replace("-", " ")}
                  </strong>
                </div>

                <div className="step-review-item">
                  <label>MARKSHEET FILE</label>
                  <strong style={{ color: uploadedFile ? "#22c55e" : "inherit" }}>
                    {uploadedFile
                      ? `${uploadedFile.name} (${(
                        uploadedFile.size / 1024
                      ).toFixed(1)} KB)`
                      : "No file"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Course Information Inputs Card */}
            <div className="course-info-inputs-card">
              <div className="course-input-col">
                <label htmlFor="course-title-input">Course Name / Title</label>
                <input
                  id="course-title-input"
                  className="portal-input-clean"
                  type="text"
                  value={selectedSubjectTitle}
                  onChange={(e) => setSelectedSubjectTitle(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                />
              </div>

              <div className="course-input-col">
                <label htmlFor="course-code-input">Course Code</label>
                <input
                  id="course-code-input"
                  className="portal-input-clean"
                  type="text"
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  placeholder="e.g. 23CS2404"
                />
              </div>

              <div className="course-input-col">
                <label htmlFor="course-year-input">Academic Year</label>
                <input
                  id="course-year-input"
                  className="portal-input-clean"
                  type="text"
                  value={reportAcademicYear}
                  onChange={(e) => setReportAcademicYear(e.target.value)}
                  placeholder="e.g. 2025-26"
                />
              </div>

              <div className="course-input-col">
                <label htmlFor="course-faculty-input">Faculty / Instructor</label>
                <input
                  id="course-faculty-input"
                  className="portal-input-clean"
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g. Dr. Faculty Name"
                />
              </div>

              <div className="course-input-col">
                <label htmlFor="course-class-input">Class / Division</label>
                <input
                  id="course-class-input"
                  className="portal-input-clean"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. TE CSE"
                />
              </div>

              <div className="course-input-col">
                <label htmlFor="course-verified-input">Verified By</label>
                <input
                  id="course-verified-input"
                  className="portal-input-clean"
                  type="text"
                  value={verifiedBy}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  placeholder="e.g. Academic Audit Committee"
                />
              </div>

              <div className="course-input-col">
                <label htmlFor="course-hod-input">Head of Department</label>
                <input
                  id="course-hod-input"
                  className="portal-input-clean"
                  type="text"
                  value={hodName}
                  onChange={(e) => setHodName(e.target.value)}
                  placeholder="e.g. Dr. Head of Department"
                />
              </div>
            </div>

            {/* TARGETS & CALCULATE BUTTON */}
            <section className="calculate-section">
              <div>
                <span className="calculate-label">FINAL STEP</span>
                <h2>
                  Calculate
                  <br />
                  <span>Attainment.</span>
                </h2>
                <p style={{ margin: "8px 0 0", color: "var(--soft)", fontSize: "14px" }}>
                  Adjust target percentage thresholds if needed and click to generate the report.
                </p>
              </div>

              <div className="calculate-actions-container">
                <div className="set-target-card">
                  <div className="target-header">
                    <span className="target-title-label">SET TARGET</span>
                    <span className="target-default-badge">Default 60%</span>
                  </div>

                  <div className="target-inputs-row">
                    <div className="target-field">
                      <label htmlFor="target-ca1-input">CA1</label>
                      <div className="target-input-box">
                        <input
                          id="target-ca1-input"
                          type="number"
                          min="0"
                          max="100"
                          value={targetCA1}
                          onChange={(e) => setTargetCA1(e.target.value)}
                          className="target-input"
                        />
                        <span className="target-suffix">%</span>
                      </div>
                    </div>

                    <div className="target-field">
                      <label htmlFor="target-ca2-input">CA2</label>
                      <div className="target-input-box">
                        <input
                          id="target-ca2-input"
                          type="number"
                          min="0"
                          max="100"
                          value={targetCA2}
                          onChange={(e) => setTargetCA2(e.target.value)}
                          className="target-input"
                        />
                        <span className="target-suffix">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="calculate-button"
                  onClick={calculateAttainment}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <IconSpinner size={16} /> Computing Attainment...
                    </>
                  ) : (
                    <>
                      Calculate Attainment
                      <IconSparkles size={16} />
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* CALCULATION METADATA DISPLAY */}
            {calculationMetadata && (
              <section className="calc-metadata-container">
                <div className="calc-metadata-header">
                  <div className="calc-metadata-title">
                    <IconSparkles size={20} />
                    <h3>Attainment Calculation Analytics & Metadata</h3>
                    <span className="calc-scroll-hint">
                      ⇄ Scroll horizontally to view all KPI metric cards
                    </span>
                  </div>
                  <span className="calc-badge">
                    <IconCheck size={13} /> Computed Successfully
                  </span>
                </div>

                {/* KEY PERFORMANCE INDICATORS */}
                <div className="calc-kpi-grid">
                  <div className="calc-kpi-card">
                    <span className="calc-kpi-label">Total Evaluated Students</span>
                    <span className="calc-kpi-value">
                      {calculationMetadata.totalStudents || calculationMetadata.summary?.totalStudents || 0}
                    </span>
                    <span className="calc-kpi-sub">Uploaded class dataset</span>
                  </div>

                  <div className="calc-kpi-card">
                    <span className="calc-kpi-label">Avg Direct Attainment %</span>
                    <span className="calc-kpi-value" style={{ color: "#22c55e" }}>
                      {calculationMetadata.summary?.avgDirectPercentage ?? "0"}%
                    </span>
                    <span className="calc-kpi-sub">
                      Target CA1: {targetCA1}% · CA2: {targetCA2}%
                    </span>
                  </div>

                  <div className="calc-kpi-card">
                    <span className="calc-kpi-label">Average Direct Level</span>
                    <span className="calc-kpi-value" style={{ color: "#6366f1" }}>
                      {calculationMetadata.summary?.avgDirectLevel ?? "0"} / 3
                    </span>
                    <span className="calc-kpi-sub">NBA 3-tier rubrics scale</span>
                  </div>

                  <div className="calc-kpi-card">
                    <span className="calc-kpi-label">Course Exit Survey (CES)</span>
                    <span className="calc-kpi-value" style={{ color: "#06b6d4" }}>
                      {calculationMetadata.survey?.cesScore ?? calculationMetadata.summary?.cesScore ?? "2.0"} / 3
                    </span>
                    <span className="calc-kpi-sub">
                      X: {calculationMetadata.survey?.countX ?? 0} · Y: {calculationMetadata.survey?.countY ?? 0} · Z: {calculationMetadata.survey?.countZ ?? 0}
                    </span>
                  </div>

                  <div className="calc-kpi-card">
                    <span className="calc-kpi-label">Overall Final CO Score</span>
                    <span className="calc-kpi-value" style={{ color: "#f59e0b" }}>
                      {calculationMetadata.summary?.avgFinalCoScore ?? "0"} / 3
                    </span>
                    <span className="calc-kpi-sub">90% Direct + 10% Indirect (CES)</span>
                  </div>

                  <div className="calc-kpi-card">
                    <span className="calc-kpi-label">Average PO Attainment</span>
                    <span className="calc-kpi-value" style={{ color: "#8b5cf6" }}>
                      {calculationMetadata.summary?.avgPoScore ?? "0"} / 3
                    </span>
                    <span className="calc-kpi-sub">Program outcomes mapped avg</span>
                  </div>
                </div>
              </section>
            )}

            {/* GENERATED REPORT */}
            <section
              className="portal-section generated-report-section"
              id="generated-report"
              style={{ marginTop: "30px" }}
            >
              <div className="section-title">
                <span>02</span>
                <div>
                  <h2>Generated Attainment Report</h2>
                  <p>Preview and export your comprehensive outcome attainment report.</p>
                </div>
              </div>

              {isGenerating && (
                <div style={{ padding: "40px", textAlign: "center", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <IconSpinner size={20} />
                  <p style={{ margin: 0, fontSize: "15px", color: "var(--text)" }}>
                    Computing direct and indirect attainment from uploaded marksheet...
                  </p>
                </div>
              )}

              {reportError && (
                <p className="report-error" role="alert">
                  {reportError}
                </p>
              )}

              {!isGenerating && !reportError && !reportHtml && (
                <p className="report-empty">
                  No report generated yet. Click <strong>Calculate Attainment</strong> above to run analysis.
                </p>
              )}

              {reportHtml && (
                <>
                  <div className="report-preview" ref={reportPreviewRef}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: reportHtml,
                      }}
                    />
                  </div>

                  <div className="report-download-group">
                    <button
                      type="button"
                      className="calculate-button download-option-btn download-btn-primary"
                      onClick={() => setShowDownloadModal(true)}
                    >
                      📥 Download Report ▾
                    </button>

                    <button
                      type="button"
                      className="download-option-btn download-btn-secondary"
                      onClick={downloadWordReport}
                      title="Download as Microsoft Word document (.docx)"
                    >
                      📄 Word (.docx)
                    </button>

                    <button
                      type="button"
                      className="download-option-btn download-btn-secondary"
                      onClick={downloadPdfReport}
                      disabled={isExportingPdf}
                      title="Download as PDF document (.pdf)"
                    >
                      {isExportingPdf ? "Generating PDF..." : "📑 PDF (.pdf)"}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* =====================================
            PERSISTENT STEP FOOTER NAVIGATION
        ===================================== */}
        <div className="step-nav-footer">
          <div className="step-nav-left">
            {currentStep > 1 ? (
              <button
                type="button"
                className="step-nav-btn step-nav-btn-prev"
                onClick={handlePrevStep}
              >
                <IconArrowLeft size={16} />
                Back to Step {currentStep - 1}
              </button>
            ) : (
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Start with Step 1
              </span>
            )}
          </div>

          <div className="step-nav-center">
            <span className="step-progress-indicator">Step {currentStep} of 4</span>
            <span className="step-progress-name">
              {currentStep === 1 && "Generate Marksheet Template"}
              {currentStep === 2 && "Course & Academic Details"}
              {currentStep === 3 && "Course Outcomes & Correlation Matrix"}
              {currentStep === 4 && "Calculate Attainment & Export Report"}
            </span>
          </div>

          <div className="step-nav-right">
            {currentStep < 4 && (
              <button
                type="button"
                className="step-nav-btn step-nav-btn-next"
                onClick={handleNextStep}
              >
                {currentStep === 1 && "Continue to Step 2: Academic Details"}
                {currentStep === 2 && "Continue to Step 3: COs & Mapping"}
                {currentStep === 3 && "Continue to Step 4: Calculate Attainment"}
                <IconArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </main>
      )}

      {/* =====================================
          DOWNLOAD FORMAT SELECTION MODAL
      ===================================== */}
      {showDownloadModal && (
        <div
          className="download-format-modal-backdrop"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="download-format-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-modal-title"
          >
            <div className="download-modal-header">
              <h3 id="download-modal-title">Select Download Format</h3>
              <button
                type="button"
                className="download-modal-close"
                onClick={() => setShowDownloadModal(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "18px" }}>
              Which format would you like to download your report in?
            </p>

            <div className="download-options-list">
              <button
                type="button"
                className="download-format-card"
                onClick={downloadPdfReport}
                disabled={isExportingPdf}
              >
                <div className="download-format-icon">📑</div>
                <div className="download-format-info">
                  <div className="download-format-title-row">
                    <span className="download-format-title">PDF Document</span>
                    <span className="download-format-badge">.PDF</span>
                  </div>
                  <span className="download-format-desc">
                    {isExportingPdf
                      ? "Generating PDF document..."
                      : "Standard formatted A4 PDF, ideal for printing and NBA/NAAC audit submissions."}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="download-format-card"
                onClick={downloadWordReport}
              >
                <div className="download-format-icon">📄</div>
                <div className="download-format-info">
                  <div className="download-format-title-row">
                    <span className="download-format-title">Microsoft Word</span>
                    <span className="download-format-badge">.DOCX</span>
                  </div>
                  <span className="download-format-desc">
                    Editable institutional Word document containing all formatted tables and values.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portal;