import React from "react";
import { useNavigate } from "react-router-dom";
import "../templates/Portal.css";

function ReportFormat() {
  const navigate = useNavigate();

  return (
    <main className="portal report-format-page">

      <button
        className="back-button"
        onClick={() => navigate("/portal")}
      >
        ← Back to Portal
      </button>

      <section className="incoming-feature">

        <span className="eyebrow">
          REPORT GENERATION
        </span>

        <h1>
          Report
          <br />
          <span>Format.</span>
        </h1>

        <div className="incoming-line"></div>

        <p>
          Customize and select the format used for
          generating your student attainment reports.
        </p>

        <div className="incoming-badge">
          INCOMING FEATURE
        </div>

        <div className="feature-info">
          <span>01</span>

          <div>
            <strong>
              Multiple Report Formats
            </strong>

            <p>
              Choose from predefined academic report
              formats or create your own format.
            </p>
          </div>
        </div>

      </section>

    </main>
  );
}

export default ReportFormat;