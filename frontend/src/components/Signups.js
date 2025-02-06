import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginSignups.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    var obj = {login:email,password:password,firstname:firstname, lastname:lastname}; 
    var js = JSON.stringify(obj);

    try {
      const response = await fetch('https://largeproject.mattct027.xyz/api/signup', {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

      var res = JSON.parse(await response.text());

      if (res.error.length <= 0) {
        setShowModal(true); // Show modal on successful signup
      }
      else {
        alert(res.error);
        return; // Invalid signup
      }
    }
    catch {
      alert(e.toString());
      return; // Error
    }
    
  };

  const handleModalClose = () => {
    setShowModal(false); // Hide modal
    navigate('/login'); // Navigate to login page
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
      <input
          type="firstname"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="lastname"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      <p>
        <Link to="/" className="back-home-link">Back to Home</Link>
      </p>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Signup Successful!</h3>
            <p>You can now log in with your new account.</p>
            <button onClick={handleModalClose}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
