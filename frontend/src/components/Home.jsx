import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../src/redux/userSlice";
import "./Home.css";

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to the home page
  };

  useEffect(() => {
    // Prevent back button navigation
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="navbar-title">Home Page</h1>
        <div className="navbar-buttons">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">
                <button className="nav-btn">Login</button>
              </Link>
              <Link to="/register" className="nav-link">
                <button className="nav-btn">Register</button>
              </Link>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={handleLogout}>
                Logout
              </button>
              <Link to="/profile" className="nav-link">
                <button className="nav-btn">Profile</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-content">
        <h2>Welcome to our platform!</h2>
      </div>
      <div className="hero">
        <div className="hero-img">
          <img
            src="https://llandscapes-10674.kxcdn.com/wp-content/uploads/2019/12/landscape-photography-profile.jpg"
            alt="image"
          />
        </div>
      </div>
    </>
  );
};

export default Home;
