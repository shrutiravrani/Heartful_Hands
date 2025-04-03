import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Import the new CSS

const LandingPage = () => {
  const [stats, setStats] = useState({
    volunteers: 0,
    events: 0,
    hours: 0
  });

  // Animate statistics
  useEffect(() => {
    const targetStats = {
      volunteers: 500,
      events: 100,
      hours: 2500
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const animate = () => {
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setStats({
          volunteers: Math.floor((targetStats.volunteers * currentStep) / steps),
          events: Math.floor((targetStats.events * currentStep) / steps),
          hours: Math.floor((targetStats.hours * currentStep) / steps)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
    };

    // Start animation when component mounts
    animate();
  }, []);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">💖</span>
          <span className="logo-text">Heartful Hands</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/signup" className="nav-btn primary-btn">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>Make a Difference with Heartful Hands</h1>
          <p className="hero-subtitle">Join our community of volunteers and event managers to create meaningful impact in your community.</p>
          <div className="hero-buttons">
            <Link to="/signup" className="hero-btn primary-btn">Get Started</Link>
            <Link to="/events" className="hero-btn">Explore Events</Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://cms-resources.prod.the-internal.cloud/sites/default/files/styles/featured_image/public/2022-05/Training%20students%20in%20effective%20teamwork%20and%20collaboration.jpg?itok=1QAoNulW" 
            alt="Volunteers working together"
            className="hero-img"
          />
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-card">
          <h3>{stats.volunteers}+</h3>
          <p>Active Volunteers</p>
        </div>
        <div className="stat-card">
          <h3>{stats.events}+</h3>
          <p>Events Created</p>
        </div>
        <div className="stat-card">
          <h3>{stats.hours}+</h3>
          <p>Volunteer Hours</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="about-content">
          <h2>What is Heartful Hands?</h2>
          <p>Heartful Hands is a platform that connects passionate volunteers with organizations in need. Whether you're looking to make a difference or need volunteers for your event, we make it easy to create meaningful impact in your community.</p>
        </div>
        <div className="about-image">
          <img 
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Community service"
            className="about-img"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How It Works</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Volunteer</h3>
            <p>Find opportunities to give back and make an impact in your community. Browse events, apply, and track your contributions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Manage Events</h3>
            <p>Create and manage volunteering events with ease. Handle applications, communicate with volunteers, and track event progress.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Connect</h3>
            <p>Meet like-minded individuals and work together for a cause. Build relationships and grow your network.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Community Says</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <img 
              src="https://randomuser.me/api/portraits/women/44.jpg" 
              alt="Sarah Johnson"
              className="testimonial-img"
            />
            <p className="testimonial-text">"Heartful Hands has made it so easy to find meaningful volunteer opportunities. I've met amazing people and made a real difference in my community."</p>
            <p className="testimonial-author">- Sarah Johnson, Volunteer</p>
          </div>
          <div className="testimonial-card">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Michael Chen"
              className="testimonial-img"
            />
            <p className="testimonial-text">"As an event manager, this platform has been invaluable. The tools make it easy to organize and manage volunteers effectively."</p>
            <p className="testimonial-author">- Michael Chen, Event Manager</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Start Your Journey Today</h2>
          <p>Join thousands of volunteers and event managers making a difference in their communities.</p>
          <Link to="/signup" className="cta-btn primary-btn">Sign Up Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">💖</span>
            <span className="logo-text">Heartful Hands</span>
          </div>
          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        <p className="footer-copyright">© {new Date().getFullYear()} Heartful Hands. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
