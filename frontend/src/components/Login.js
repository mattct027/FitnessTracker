import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginSignups.css';
import Home from './Home';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal visibility
  const [showErrorModal, setShowErrorModal] = useState(false); // State for error modal visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    var obj = {login:email,password:password};
    var js = JSON.stringify(obj);

    try {
      const response = await fetch('https://largeproject.mattct027.xyz/api/login', {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

      var res = JSON.parse(await response.text());

      if (res.id < 0) {
        setShowErrorModal(true);
      }
      else {
        var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
        localStorage.setItem('user_data', JSON.stringify(user));

        setShowSuccessModal(true); // Valid login, show success modal
      }
    }
    catch (e) {
      setShowErrorModal(true); // Error
      return;
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false); // Close success modal
    navigate('/dashboard'); // Navigate to Dashboard
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false); // Close error modal
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p>
        <Link to="/" className="back-home-link">Back to Home</Link>
      </p>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Login Successful!</h3>
            <p>Welcome back! Redirecting to your dashboard...</p>
            <button onClick={handleSuccessModalClose}>OK</button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Login Failed</h3>
            <p>The email or password you entered is incorrect. Please try again.</p>
            <button onClick={handleErrorModalClose}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
