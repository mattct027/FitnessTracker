import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import gymImage from './pictures/Clean.png';

function Home() {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <div className="home-logo">FitnessTracker</div>
        <nav className="nav-links">
          <Link to="/login" className="nav-button">Login</Link>
          <Link to="/signup" className="nav-button">Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="text-content">
          <h1>Achieve Your Fitness Goals Effortlessly</h1>
          <p>The ultimate platform to track your workouts, monitor progress, and stay motivated on your journey.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="primary-button">Start Now</Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="image-content">
          <img
            src={gymImage}
            alt="Fitness Dashboard"
            className="dashboard-image"
          />
  </div>

      </main>
    </div>
  );
}

export default Home;
