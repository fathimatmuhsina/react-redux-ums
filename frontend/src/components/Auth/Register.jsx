import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";  // Import Toastify CSS
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // useNavigate hook for redirect

  // Regex for validating email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password validation: at least 8 characters, including letters, numbers, and special characters
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous error and success messages
    toast.dismiss(); // Dismiss previous toasts

    // Basic Frontend Validation
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful!", {
          position: "top-center",
          className: "toast-success",
          onClose: () => navigate("/login"), // Navigate after the toast closes
        });
      
        setName("");
        setEmail("");
        setPassword("");
      }
      
       else {
        toast.error(data.message || "Registration failed!");  // Error message
      }
    } catch (err) {
      toast.error("An error occurred. Please try again later.");  // Catch block error message
    }
  };

  return (
    
    <div className="register-container">
      
      <h1 className="register-title">Register</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="form-button" type="submit">Register</button>
        Already Have An Account?<Link to='/login'>Login</Link>

      </form>

      {/* ToastContainer to render the notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default Register;
