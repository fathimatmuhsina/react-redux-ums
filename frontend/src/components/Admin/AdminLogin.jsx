import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To store the error message
  const [validationError, setValidationError] = useState(""); // To store client-side validation errors
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the admin is already logged in (i.e., if token exists and is valid)
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT to get the payload
      if (decoded.isAdmin) {
        navigate("/admin/dashboard"); // Redirect to dashboard if user is an admin
      }
    }
  }, [navigate]);

  const validateInputs = () => {
    // Basic client-side validation
    if (!username.trim()) {
      setValidationError("Username is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    if (!password.trim()) {
      setValidationError("Password is required.");
      return false;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return false;
    }
    setValidationError(""); // Clear validation errors
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return; // Prevent submission if validation fails

    setError(""); // Clear previous errors

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user && data.user.isAdmin) {
          localStorage.setItem("token", data.token); // Save token in localStorage
          navigate("/admin/dashboard"); // Redirect to admin dashboard
        } else {
          setError("You are not an admin."); // Show error if user is not an admin
        }
      } else {
        setError(data.message || "Login failed"); // Show the error message if login fails
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          
        />
        <button type="submit">Login</button>
      </form>

      {/* Display validation errors */}
      {validationError && <p style={{ color: "orange" }}>{validationError}</p>}

      {/* Display server-side errors */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminLogin;
