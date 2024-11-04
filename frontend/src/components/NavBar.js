import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import "./NavBar.css";
import { FaCaretDown } from "react-icons/fa";
import { IoExitOutline } from "react-icons/io5";
import PointsDisplay from "../components/PointsDisplay";
import { IoRocket } from "react-icons/io5";
import Logo from "../img/logo.png";

const Navbar = ({
  loginClicked,
  setLoginClicked,
  isLoggedIn,
  setIsLoggedIn,
  inAnswerQuiz,
  renderNav,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isStudent, setIsStudent] = useState(false);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPoints, setCurrentPoints] = useState(0);
  const [avatarImageUrl, setAvatarImageUrl] = useState("");
  const [level, setLevel] = useState(0);
  const [levelPoints, setLevelPoints] = useState(0);
  const [user, setUser] = useState("");

  useEffect(() => {
    console.log("Navbar regenerated for route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (authToken) {
          const storedUserData = JSON.parse(localStorage.getItem("userData"));

          const userResponse = await axios.get(`/user/${storedUserData.id}`);
          setIsLoggedIn(true);
          setIsStudent(userResponse.data.isStudent == 0 ? false : true);
          setUserId(userResponse.data.id);
          setUsername(userResponse.data.username);
          setEmail(userResponse.data.email);

          const response = await axios.get(`/get-points/${storedUserData.id}`);
          const { currentPoints, imageUrl, level, levelPoints } = response.data;
          setCurrentPoints(currentPoints);
          setAvatarImageUrl(imageUrl);
          setLevel(level);
          setLevelPoints(levelPoints);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [isLoggedIn, renderNav]);

  const handleLogout = () => {
    setIsStudent(false);
    setIsLoggedIn(false);
    setLoginClicked(false);

    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  const handleClick = (page) => {
    if (page === "login") {
      navigate("/login");
      setLoginClicked(true);
    } else {
      navigate("/signup");
      setLoginClicked(true);
    }
  };

  return (
    <div
      className={
        isLoggedIn && isStudent
          ? "navbar"
          : isLoggedIn && !isStudent
          ? "teacher-navbar"
          : "navbar-before"
      }
    >
      <div>
        <img src={Logo} alt="Logo" className="logo" />
      </div>

      {isLoggedIn && !inAnswerQuiz && (
        <div
          className={
            isLoggedIn && isStudent
              ? "navigation-container d-flex align-items-center justify-content-center"
              : "teacher-navigation-container d-flex align-items-center justify-content-center"
          }
        >
          <div className="border border-white p-3 rounded-pill">
            {isStudent && (
              <NavLink
                to="/student-home"
                className="navbar-link ms-2 me-5"
                activeClassName="active"
              >
                HOME
              </NavLink>
            )}
            {!isStudent && (
              <NavLink
                to="/"
                className="navbar-link ms-2 me-5"
                activeClassName="active"
              >
                HOME
              </NavLink>
            )}
            <NavLink
              to="/courses"
              className="navbar-link me-5"
              activeClassName="active"
            >
              COURSES
            </NavLink>
            {!isStudent && (
              <NavLink
                to="/activities"
                className="navbar-link me-5"
                activeClassName="active"
              >
                ACTIVITIES
              </NavLink>
            )}
            {!isStudent && (
              <NavLink
                to="/student-progress"
                className="navbar-link me-2"
                activeClassName="active"
              >
                STUDENT PROGRESS
              </NavLink>
            )}
            {isStudent && (
              <NavLink
                to="/participated-courses"
                className="navbar-link me-5"
                activeClassName="active"
              >
                MY COURSES
              </NavLink>
            )}
            {isStudent && (
              <NavLink
                to="/leaderboard"
                className="navbar-link me-5"
                activeClassName="active"
              >
                LEADERBOARD
              </NavLink>
            )}
            {isStudent && (
              <NavLink
                to="/summary"
                className="navbar-link me-5"
                activeClassName="active"
              >
                SUMMARY
              </NavLink>
            )}
            {isStudent && (
              <NavLink
                to="/shop"
                className="navbar-link me-2"
                activeClassName="active"
              >
                SHOP
              </NavLink>
            )}
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="d-flex align-items-center">
          <div className="mt-3">
            {isStudent && <PointsDisplay currentPoints={currentPoints} />}
          </div>
          <div>
            <div className="dropdown">
              <div
                className="d-flex align-items-center mt-1 pe-3 profile-section"
                role="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <img
                  src={avatarImageUrl}
                  alt="Avatar"
                  className="nav-avatar-img"
                  style={{ border: "2px solid #007bff" }} // Optionally add border style here as well
                />
                <div className="profile-container">
                  <div className="profile-details">
                    <p className="profile-username">{username}</p>
                    <p className="profile-email">{email}</p>
                  </div>
                </div>
                <FaCaretDown className="text-white fs-3 me-3" />
              </div>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <NavLink
                    className="dropdown-item"
                    to={`/profile/${userId}`} // Include userId as a URL parameter
                  >
                    <FaRegUserCircle className="me-2" />
                    View Profile
                  </NavLink>
                </li>
                <li>
                  <div>
                    <NavLink
                      to="/"
                      onClick={handleLogout}
                      className="logout-link"
                    >
                      <IoExitOutline className="me-2 mb-1" />
                      Logout
                    </NavLink>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              {isStudent && (
                <div className="level-container d-flex align-items-center">
                  <div>
                    <IoRocket className="level-icon" />
                    <span className="level-text mt-2 me-2">Level {level}</span>
                  </div>
                  <div>
                    <div
                      className="progress rounded-pill"
                      style={{
                        height: "15px",
                        width: "140px",
                        background:
                          "linear-gradient(to right, #79a8d2, #4082bf)",
                      }}
                    >
                      <div
                        className="progress-bar"
                        role="progressbar"
                        aria-valuenow={levelPoints}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style={{ width: `${levelPoints}%` }}
                      >
                        <span className="fst-italic">{levelPoints} exp</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoggedIn && !loginClicked && (
        <div className="d-flex align-items-center">
          <button
            className="btn btn-light me-4"
            onClick={() => handleClick("login")}
          >
            Login
          </button>
          <button
            className="btn btn-light me-4"
            onClick={() => handleClick("signUp")}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
