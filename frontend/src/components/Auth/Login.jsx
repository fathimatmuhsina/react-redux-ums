import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/userSlice";
import { Link, useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch login action
    const result = await dispatch(loginUser({ email, password }));

    // Check if login was successful
    if (loginUser.fulfilled.match(result)) {
      localStorage.setItem("token", result.payload.token);
      navigate("/"); 
    } else {
      console.error(result.payload);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
                {error && <p className="error-message">{error}</p>}
        <button className="form-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      Don't Have An Account?<Link to='/register'>Register</Link>
      </form>
    </div>
  );
};

export default Login;
