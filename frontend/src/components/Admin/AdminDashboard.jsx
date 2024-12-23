import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // Import the CSS file for styling

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const decoded = JSON.parse(atob(token.split(".")[1]));
    if (!decoded.isAdmin) {
      navigate("/admin/login");
      return;
    }

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      } else {
        alert("Failed to fetch user data.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("An error occurred while fetching data.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase()); // Convert input to lowercase for case-insensitive search
  };

  return (
    <div>
      <ToastContainer />
      <nav className="navbar">
        <div className="navbar-brand">Admin Panel</div>
        <ul className="navbar-links">
          <li>
            <button onClick={() => localStorage.removeItem("token")} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </nav>

      <div className="admin-dashboard">
        <h2>User Details</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by name or email"
          className="search-bar"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        {adminData ? (
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>
                    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                      Add New User
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminData
                  .filter(
                    (user) =>
                      !user.isAdmin &&
                      (user.name.toLowerCase().includes(searchQuery) ||
                        user.email.toLowerCase().includes(searchQuery))
                  )
                  .map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.isBlocked ? "Blocked" : "Active"}</td>
                      <td>
                        <button onClick={() => setEditUser(user)} className="action-btn">
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleBlockUnblock(user._id, user.isBlocked)
                          }
                          className="action-btn"
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="action-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
