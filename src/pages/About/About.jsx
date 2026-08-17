import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

export const About = () => {
  return (
    <div className="about-page">

      {/* ---- HERO ---- */}
      <section className="about-hero">
        <img
          src="/About_us_-_Banner.png"
          alt="About Vélora Banner"
          className="about-hero-bg-img"
        />
        <div className="about-hero-inner">
          <span className="about-hero-label">OUR STORY</span>
          <h1 className="about-hero-heading">
            Footwear with a sense<br />of purpose.
          </h1>
          <p className="about-hero-sub">
            VÉLORA began with a simple idea: everyday footwear can be both beautifully considered and effortless to live in.
          </p>
        </div>
      </section>

      {/* ---- BEGINNINGS SPLIT ---- */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-beginnings-split">
            {/* Image Side */}
            <div className="about-beginnings-image">
              <img
                src="/About_us__Beginnings_section.png"
                alt="Vélora Beginnings"
                className="about-beginnings-img"
              />
            </div>
            {/* Text Side */}
            <div className="about-beginnings-text">
              <span className="about-beginnings-label">BEGINNINGS</span>
              <h2 className="about-beginnings-heading">
                Made for lives that rarely move in straight lines.
              </h2>
              <p className="about-beginnings-body">
                VÉLORA was born from a question most footwear brands never ask: what do you actually do in these shoes? We noticed a gap between 
                performance-obsessed trainers and style-first dress shoes — and an entire life lived between those two extremes.
              </p>
              <p className="about-beginnings-body">
                So we built footwear for that in-between space. The commute, the café, the market floor, 
                the afternoon walk — designed to quietly support you through every transition from morning to evening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- VALUES CARDS ---- */}
      <section className="about-section about-section-alt">
        <div className="about-section-inner">
          <div className="about-values-grid">
            {[
              {
                num: "01",
                label: "DESIGN",
                title: "Design",
                desc: "Minimal silhouettes refined until only the essential lines remain. We draw slowly, prototype fast, and edit without mercy."
              },
              {
                num: "02",
                label: "COMFORT",
                title: "Comfort",
                desc: "Anatomical footbeds, cushioned midsoles and flex points mapped to real movement — because comfort should never be an afterthought."
              },
              {
                num: "03",
                label: "CRAFT",
                title: "Craft",
                desc: "Responsibly sourced leathers, recycled knit uppers and hand-finished details — considered materials that soften, never wear out."
              }
            ].map((value) => (
              <div key={value.num} className="about-value-card">
                <span className="about-value-num">{value.num} / {value.label}</span>
                <h3 className="about-value-title">{value.title}</h3>
                <p className="about-value-desc">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- QUOTE BAND ---- */}
      <section className="about-quote">
        <img
          src="/About_Us_Qoute_section.png"
          alt="Vélora Studio Quote Background"
          className="about-quote-bg-img"
        />
        <div className="about-quote-overlay" />
        <div className="about-quote-inner">
          <blockquote className="about-quote-text">
            "The best design is the kind you feel before you notice."
          </blockquote>
          <span className="about-quote-attr">VÉLORA STUDIO</span>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <h2 className="about-cta-heading">Meet your next everyday pair.</h2>
          <Link to="/collection" className="about-cta-btn">
            SHOP COLLECTION
          </Link>
        </div>
      </section>

    </div>
  );
};
