import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiMap,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiShield,
} from "react-icons/fi";
import styles from "../styles/Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className={styles["home-container"]}>
      {/* Hero Section */}
      <section className={styles["hero-section"]}>
        <div className={styles["hero-content"]}>
          <div className={styles["hero-logo-container"]}>
            <img
              src="/ndma-logo.png"
              alt="NDMA Logo"
              className={styles["hero-logo"]}
            />
            <img
              src="/mha-logo.jpg"
              alt="MHA Logo"
              className={styles["hero-logo"]}
            />
          </div>
          <h1 className={styles["hero-title"]}>
            Disaster Management Training Portal
          </h1>
          <p className={styles["hero-subtitle"]}>
            Real-Time Monitoring System for Capacity Building & Training
            Programs
          </p>
          <div className={styles["hero-cta"]}>
            <button
              className={styles["hero-btn"] + " " + styles["hero-btn-primary"]}
              onClick={() => handleGetStarted("partner")}
            >
              Partner Login
            </button>
            <button
              className={styles["hero-btn"] + " " + styles["hero-btn-primary"]}
              onClick={() => handleGetStarted("admin")}
            >
              Admin Login
            </button>
            <a
              href="/map"
              className={
                styles["hero-btn"] + " " + styles["hero-btn-secondary"]
              }
            >
              View Training Map
            </a>
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className={styles["counters-section"]}>
        <div className={styles["counters-container"]}>
          <div className={styles["counter-item"]}>
            <div className={styles["counter-number"]}>1,250</div>
            <div className={styles["counter-label"]}>
              Total Trainings Conducted
            </div>
          </div>
          <div className={styles["counter-item"]}>
            <div className={styles["counter-number"]}>28</div>
            <div className={styles["counter-label"]}>States Covered</div>
          </div>
          <div className={styles["counter-item"]}>
            <div className={styles["counter-number"]}>50K+</div>
            <div className={styles["counter-label"]}>Volunteers Trained</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles["features-section"]}>
        <h2 className={styles["section-title"]}>Key Features</h2>
        <div className={styles["features-grid"]}>
          <div className={styles["feature-card"]}>
            <div className={styles["feature-icon"]}>
              <FiMap size={32} />
            </div>
            <h3 className={styles["feature-title"]}>GIS-Based Mapping</h3>
            <p className={styles["feature-desc"]}>
              Real-time visualization of training locations across India with
              interactive maps
            </p>
          </div>
          <div className={styles["feature-card"]}>
            <div className={styles["feature-icon"]}>
              <FiBarChart2 size={32} />
            </div>
            <h3 className={styles["feature-title"]}>Analytics & Reports</h3>
            <p className={styles["feature-desc"]}>
              Comprehensive dashboards for impact analysis and coverage
              assessment
            </p>
          </div>
          <div className={styles["feature-card"]}>
            <div className={styles["feature-icon"]}>
              <FiShield size={32} />
            </div>
            <h3 className={styles["feature-title"]}>Secure Access</h3>
            <p className={styles["feature-desc"]}>
              Role-based access control with secure authentication for all users
            </p>
          </div>
          <div className={styles["feature-card"]}>
            <div className={styles["feature-icon"]}>
              <FiTrendingUp size={32} />
            </div>
            <h3 className={styles["feature-title"]}>Real-Time Data Entry</h3>
            <p className={styles["feature-desc"]}>
              Quick and easy submission of training event details by partners
            </p>
          </div>
          <div className={styles["feature-card"]}>
            <div className={styles["feature-icon"]}>✅</div>
            <h3 className={styles["feature-title"]}>
              Certificate Verification
            </h3>
            <p className={styles["feature-desc"]}>
              Public verification system for training certificates and
              credentials
            </p>
          </div>
          <div className={styles["feature-card"]}>
            <div className={styles["feature-icon"]}>🔔</div>
            <h3 className={styles["feature-title"]}>Notifications</h3>
            <p className={styles["feature-desc"]}>
              Instant alerts for new trainings and important updates
            </p>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className={styles["updates-section"]}>
        <div className={styles["updates-container"]}>
          <h2 className={styles["section-title"]}>Latest Updates</h2>
          <div className={styles["updates-grid"]}>
            <div className={styles["update-card"]}>
              <div className={styles["update-date"]}>Dec 14, 2024</div>
              <div className={styles["update-title"]}>
                Cyclone Preparedness Training in Odisha
              </div>
              <div className={styles["update-desc"]}>
                200 volunteers trained in cyclone disaster management in
                Bhubaneswar region
              </div>
            </div>
            <div className={styles["update-card"]}>
              <div className={styles["update-date"]}>Dec 12, 2024</div>
              <div className={styles["update-title"]}>
                Flood Rescue Operations Workshop
              </div>
              <div className={styles["update-desc"]}>
                Advanced training conducted for 150 rescue personnel in Delhi
              </div>
            </div>
            <div className={styles["update-card"]}>
              <div className={styles["update-date"]}>Dec 10, 2024</div>
              <div className={styles["update-title"]}>
                First Aid Certification Program
              </div>
              <div className={styles["update-desc"]}>
                300 community volunteers completed first aid certification in
                Mumbai
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles["home-footer"]}>
        <div className={styles["home-footer-content"]}>
          <div className={styles["home-footer-links"]}>
            <a href="/map">View Map</a>
            <a href="/verify-certificate">Verify Certificate</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
          <div className={styles["home-footer-text"]}>
            © 2024 National Disaster Management Authority (NDMA). All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
