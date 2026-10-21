import React, { useEffect, useState } from "react";
import "../templates/Landing.css";
import { useNavigate } from "react-router-dom";
import attainxLogo from "../assets/attainx-logo.png";
import CrestColumns from "./backgrounds/effects/crest-columns";
import TickerDelta from "./TickerDelta";
import { useLenis } from "../context/SmoothScroll";

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { lenis, scrollTo } = useLenis();

  /* =========================================
     SCROLL POSITION & PARALLAX (LENIS SYNC)
  ========================================= */

  useEffect(() => {
    if (lenis) {
      const handleLenisScroll = ({ scroll }) => {
        setScrollY(scroll);
      };
      lenis.on("scroll", handleLenisScroll);

      return () => {
        lenis.off("scroll", handleLenisScroll);
      };
    } else {
      const handleScroll = () => {
        setScrollY(window.scrollY);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [lenis]);


  /* =========================================
     SECTION NAVIGATION (SMOOTH LENIS GLIDE)
  ========================================= */

  const scrollToSection = (id) => {
    scrollTo(`#${id}`, { offset: -30, duration: 1.2 });
  };


  return (
    <main className="landing">

      {/* =====================================
          BACKGROUND GLOWS
      ===================================== */}

      <div
        className="glow glow-one"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      />

      <div
        className="glow glow-two"
        style={{
          transform: `translateY(${scrollY * -0.1}px)`,
        }}
      />


      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="navbar">

        <div className="logo">
          <img
            src={attainxLogo}
            alt="Attainx"
          />

          <span>Attainx</span>
        </div>


        <div className="nav-links">

          <button
            onClick={() => scrollToSection("about")}
          >
            About
          </button>

          <button
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>

          <button
            onClick={() => scrollToSection("process")}
          >
            How it works
          </button>

        </div>


        <button
          className="nav-button"
          onClick={() => navigate("/login")}
        >
          Get Started
          <span>↗</span>
        </button>

      </nav>


      {/* =====================================
          HERO
      ===================================== */}

      <section className="hero landing-section">
        {/* Crest Columns Background - Exclusively for Hero section */}
        <CrestColumns
          color="#dde3ec"
          glowColor="rgba(255, 255, 255, 0.9)"
          secondaryColor="#475569"
          lineColor="rgba(255, 255, 255, 0.06)"
          speed={0.2}
          columnCount={22}
          interactive={true}
          glowIntensity={1.0}
          className="hero-crest-columns"
        />

        <div className="hero-top">

          <span>
            ACADEMIC ANALYTICS
          </span>

          <span>
            01 / 04
          </span>

        </div>


        <div className="hero-content">

          <p className="eyebrow">
            Student Attainment System
          </p>


          <h1>
            Understand
            <br />
            <span>what students</span>
            <br />
            actually achieve.
          </h1>


          <p className="hero-description">
            Transform assessment data into meaningful
            course outcome attainment with clarity,
            precision and less manual work.
          </p>


          <div className="hero-actions">

            <button
              className="primary-btn"
              onClick={() => scrollToSection("about")}
            >
              Explore System
              <span>↗</span>
            </button>


            <button
              className="secondary-btn"
              onClick={() => scrollToSection("process")}
            >
              View Demo
            </button>

          </div>

        </div>


        <div className="hero-bottom">

          <div>
            <span className="small-label">
              ASSESSMENTS
            </span>

            <strong>
              CA · MSE · ESE
            </strong>
          </div>


          <div>
            <span className="small-label">
              OUTCOMES
            </span>

            <strong>
              CO / PO / PSO
            </strong>
          </div>


          <div>
            <span className="small-label">
              ANALYSIS
            </span>

            <strong>
              Automated
            </strong>
          </div>

        </div>

      </section>


      {/* =====================================
          ABOUT
      ===================================== */}

      <section
        id="about"
        className="landing-section about-section"
      >

        <div className="section-index">
          02 / 04
        </div>

        <div className="about-layout">
          <div className="about-content-col">
            <div className="section-content reveal-on-scroll">

              <p className="section-eyebrow">
                ABOUT THE SYSTEM
              </p>

              <h2>
                From raw
                <br />
                <span>data to insight.</span>
              </h2>

              <p className="section-description">
                Student Attainment System simplifies the
                process of measuring course outcomes by
                bringing assessment data, CO mapping and
                attainment analysis into one structured
                workflow.
              </p>

            </div>

            <div className="about-meta reveal-stagger">

              <div>
                <span>01</span>
                <p>Assessment Data</p>
              </div>

              <div>
                <span>02</span>
                <p>Outcome Mapping</p>
              </div>

              <div>
                <span>03</span>
                <p>Attainment Analysis</p>
              </div>

            </div>
          </div>

          <div className="about-visual-col reveal-on-scroll">
            <div className="ticker-delta-wrapper">
              <TickerDelta
                background="transparent"
                direction="cw"
                speed={0.6}
                hoverSpeed={2.0}
                thickness={4.8}
                roundness={2.5}
                shadow={0}
                scale={155}
                drag={true}
                leftFace={{
                  text: "STUDENT ATTAINMENT ·",
                  size: 6.5,
                  weight: "bold",
                  fill: "#ffffff",
                  ink: "#111111",
                }}
                topFace={{
                  text: "STUDENT ATTAINMENT ·",
                  size: 5,
                  weight: "regular",
                  fill: "#1f1f23",
                  ink: "#ffffff",
                }}
                rightFace={{
                  text: "STUDENT ATTAINMENT ·",
                  size: 4,
                  weight: "light",
                  fill: "#52525b",
                  ink: "#f4f4f6",
                }}
              />
            </div>
          </div>
        </div>

      </section>


      {/* =====================================
          FEATURES
      ===================================== */}

      <section
        id="features"
        className="landing-section features-section"
      >

        <div className="section-index">
          03 / 04
        </div>


        <div className="section-content reveal-on-scroll">

          <p className="section-eyebrow">
            SYSTEM CAPABILITIES
          </p>


          <h2>
            Everything
            <br />
            <span>in one place.</span>
          </h2>

        </div>


        <div className="feature-list reveal-stagger">

          <div className="feature-item">

            <span>01</span>

            <div>
              <h3>
                CO / PO / PSO Mapping
              </h3>

              <p>
                Define and manage outcome mappings
                through a structured interface.
              </p>
            </div>

          </div>


          <div className="feature-item">

            <span>02</span>

            <div>
              <h3>
                Assessment Import
              </h3>

              <p>
                Import academic assessment data
                using CSV and Excel files.
              </p>
            </div>

          </div>


          <div className="feature-item">

            <span>03</span>

            <div>
              <h3>
                Automated Calculation
              </h3>

              <p>
                Reduce repetitive calculations and
                generate consistent attainment results.
              </p>
            </div>

          </div>


          <div className="feature-item">

            <span>04</span>

            <div>
              <h3>
                Report Generation
              </h3>

              <p>
                Transform calculated attainment into
                structured academic reports.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          HOW IT WORKS
      ===================================== */}

      <section
        id="process"
        className="landing-section process-section"
      >

        <div className="section-index">
          04 / 04
        </div>


        <div className="section-content reveal-on-scroll">

          <p className="section-eyebrow">
            HOW IT WORKS
          </p>


          <h2>
            Four steps.
            <br />
            <span>One workflow.</span>
          </h2>

        </div>


        <div className="process-list reveal-stagger">

          <div className="process-item">

            <span>01</span>

            <strong>
              Import
            </strong>

            <p>
              Upload your assessment data.
            </p>

          </div>


          <div className="process-item">

            <span>02</span>

            <strong>
              Map
            </strong>

            <p>
              Define CO, PO and PSO relationships.
            </p>

          </div>


          <div className="process-item">

            <span>03</span>

            <strong>
              Calculate
            </strong>

            <p>
              Process attainment automatically.
            </p>

          </div>


          <div className="process-item">

            <span>04</span>

            <strong>
              Report
            </strong>

            <p>
              Generate structured academic reports.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================
    FOOTER
===================================== */}

      <footer className="landing-footer">

        <div className="footer-top reveal-on-scroll">

          <div>
            <span className="footer-label">STUDENT ATTAINMENT SYSTEM</span>

            <p>
              Turning academic data into meaningful insight.
            </p>
          </div>

          <div className="footer-links">

            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about");
              }}
            >
              About
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("features");
              }}
            >
              Features
            </a>
            <a
              href="#process"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("process");
              }}
            >
              How it works
            </a>

          </div>

        </div>


        <div className="footer-brand reveal-on-scroll">
          Attain<span>x</span>
        </div>


        <div className="footer-bottom">

          <span>
            © 2026 Attainx
          </span>

          <span>
            Academic Analytics
          </span>

          <span>
            Built for better outcomes.
          </span>

        </div>

      </footer>

    </main>
  );
};

export default Landing;