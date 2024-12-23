import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../redux/userSlice"; // Import the updateUserProfile action
import "./UserProfile.css";
import { logout } from "../redux/userSlice"; // Ensure this import is correct
import { RxAvatar } from "react-icons/rx"; // Avatar icon

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) {
      // Redirect to login if not logged in
      navigate("/login");
    } else {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.profileImage) {
        setPreviewImage(`http://localhost:5000/${user.profileImage}`);
      }
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // State for validation errors
  const handleUpdateDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        alert("Profile details updated successfully!");
        dispatch(updateUserProfile(updatedUser));
        setErrors({}); // Clear any existing errors
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          // Map backend validation errors to the `errors` state
          const formattedErrors = errorData.errors.reduce((acc, error) => {
            acc[error.param] = error.msg;
            return acc;
          }, {});
          setErrors(formattedErrors);
        } else {
          alert(errorData.message || "Failed to update profile details.");
        }
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  const handleUpload = async () => {
    if (!profileImage) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", profileImage);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/user/profile/picture", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Profile picture updated successfully!");
        dispatch(updateUserProfile({ profileImage: data.user.profileImage }));
        setPreviewImage(`http://localhost:5000/${data.user.profileImage}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to upload the profile picture.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout()); // Reset the user state in Redux
    navigate("/login"); // Redirect to login page
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-logo">Profile</h1>
        <div className="navbar-buttons">
          <button onClick={() => navigate("/")} className="navbar-button">Home</button>
          <button onClick={handleLogout} className="navbar-button logout-button">Logout</button>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="user-profile-container">
        <h1 className="user-profile-title">Edit Profile</h1>
        <div className="user-details">
          <div className="profile-image-section">
            <label htmlFor="file-input" className="profile-image-label">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-image" />
              ) : (
                <RxAvatar className="profile-avatar-icon" size={100} />
              )}
          
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <button onClick={handleUpload} className="upload-button">Upload Profile Picture</button>
          </div>

          <div className="user-info">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <button onClick={handleUpdateDetails} className="update-button">Update Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
