import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Import the new CSS

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">💖 Heartful Hands</div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/signup" className="nav-btn primary-btn">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Make a Difference with Heartful Hands</h1>
        <p>Join our community of volunteers and event managers to create meaningful impact.</p>
        <div className="hero-buttons">
          <Link to="/signup" className="hero-btn primary-btn">Get Started</Link>
          <Link to="/events" className="hero-btn">Explore Events</Link>
        </div>
      </header>

      {/* About Section */}
      <section className="about">
        <h2>What is Heartful Hands?</h2>
        <p>Heartful Hands is a platform that connects volunteers with organizations in need. Whether you're looking to help or need volunteers for an event, we make it easy.</p>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How It Works</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Volunteer</h3>
            <p>Find opportunities to give back and make an impact in your community.</p>
          </div>
          <div className="feature-card">
            <h3>Manage Events</h3>
            <p>Create and manage volunteering events with ease.</p>
          </div>
          <div className="feature-card">
            <h3>Connect</h3>
            <p>Meet like-minded individuals and work together for a cause.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Start Your Journey Today</h2>
        <p>Join thousands of volunteers and event managers making a difference.</p>
        <Link to="/signup" className="cta-btn primary-btn">Sign Up Now</Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Heartful Hands. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
