import React, { useState, useEffect } from "react";
import axios from "../api/axios"; // Import axios for making HTTP requests
import { useParams } from "react-router-dom";
import "./UserProfile.css"; // Import CSS file for styling
import { IoRocket } from "react-icons/io5";

const UserProfile = ({ isStudent, setRenderNav }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [username, setUsername] = useState(""); // State for username input
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const [avatarModalOpen, setAvatarModalOpen] = useState(false); // State to control modal visibility
  const [avatars, setAvatars] = useState("");
  const [numberOfParticipatedCourse, setNumberOfParticipatedCourse] =
    useState(0);
  const [level, setLevel] = useState(0);
  const [levelPoints, setLevelPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const { userId } = useParams();

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/user/${userId}`);
      setUserDetails(response.data);
      setUsername(response.data.username);
      setEmail(response.data.email);
      setPassword(response.data.password);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchAvatars = async () => {
    try {
      const response = await axios.get(`/get-avatars/${userId}`);
      setAvatars(response.data);

      const numberOfParticipatedCourseResponse = await axios.get(
        `/get-participated-course-number/${userId}`
      );
      setNumberOfParticipatedCourse(
        numberOfParticipatedCourseResponse.data.count
      );
    } catch (error) {
      console.error("Error fetching avatars: ", error);
    }
  };

  const fetchLevel = async () => {
    try {
      const response = await axios.get(`/get-points/${userId}`);
      const { level, levelPoints } = response.data;
      setLevel(level);
      setLevelPoints(levelPoints);
    } catch (error) {
      console.error("Error fetching level: ", error);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const response = await axios.get(`/get-user-badges/${userId}`);
      setUserBadges(response.data.userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchAvatars();
    fetchLevel();
    fetchUserBadges();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPassword(password)) {
      alert(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, one symbol, and have a minimum length of 8 characters."
      );
      return;
    }
    try {
      await axios.put(`/user/${userId}`, { username, email, password });
      alert("User details updated successfully!");
      setRenderNav((prev) => !prev);
      setModalOpen(false);
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating user details:", error);
      alert("Failed to update user details. Please try again later.");
    }
  };

  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])[A-Za-z\d!@#$%^&*()\-_=+{};:,<.>.]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleAvatarModal = () => {
    setAvatarModalOpen(true);
  };

  const handleImageClick = async (avatarId) => {
    try {
      await axios.put(`/update-avatar/${userId}`, { avatarId });
      alert("Avatar updated successfully!");
      setRenderNav((prev) => !prev);
      setAvatarModalOpen(false);
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <div className="user-profile-container">
      <div className="row bg-white p-5 border border-black rounded">
        <div
          className={`${
            isStudent ? "student-user-details" : "teacher-user-details"
          }`}
        >
          {userDetails && (
            <>
              <div className="user-avatar" onClick={handleAvatarModal}>
                <img
                  src={userDetails.avatar} // Ensure userDetails.avatar contains the image name
                  alt="Avatar"
                  className="user-avatar-img"
                />
                <div className="overlay">+</div>
              </div>
              <div>
                <div className="fs-2 fw-bold">{userDetails.username} </div>
                <div className="fst-italic user-email">{userDetails.email}</div>
                <div className="user-role">
                  {userDetails.isStudent == 1 ? (
                    <div>( 🧑🏻‍🎓 Student )</div>
                  ) : (
                    <div>( 👨🏻‍💼 Teacher )</div>
                  )}
                </div>
              </div>
              {userBadges.length > 0 && (
                <div className="user-badges-container">
                  <div
                    className="mt-4 fs-5 text-warning fw-bolder text-decoration-underline"
                    style={{ color: "#fbc02d" }}
                  >
                    Badges
                  </div>
                  <div className="badges-grid">
                    {userBadges.map((badge, index) => (
                      <div>
                        <img
                          key={index}
                          src={badge.badge_url}
                          alt={`Badge ${index}`}
                        />
                        <div className="fst-italic">{badge.badge_desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isStudent && (
                <div className="level-container d-flex align-items-center justify-content-center mt-2">
                  <div>
                    <IoRocket className="level-icon" />
                    <span className="level-text mt-2 me-2">Level {level}</span>
                  </div>
                  <div>
                    <div
                      className="progress rounded-pill"
                      style={{
                        height: "15px",
                        width: "300px",
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
                        <div className="level-exp">{levelPoints} exp</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {userDetails.isStudent == 1 ? (
                <div className="row user-profile-bottom">
                  <div className="col user-profile-points-container mt-4">
                    <span className="fs-2">{numberOfParticipatedCourse}</span>
                    <span>Number of Course Participated</span>
                  </div>
                  <div className="col user-profile-points-container">
                    <span className="fs-2">{userDetails.currentPoints}</span>
                    <span>Current Points</span>
                  </div>
                  <div className="col user-profile-points-container">
                    <span className="fs-2">{userDetails.totalPoints}</span>
                    <span>Highest Points Obtained</span>
                  </div>
                </div>
              ) : (
                <div className="col user-profile-points-container mb-4"></div>
              )}
            </>
          )}
          <button
            type="button"
            className="btn btn-success mt-2"
            onClick={() => setModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {avatarModalOpen && (
        <div
          className="modal fade show"
          id="modal2"
          tabIndex="-1"
          aria-labelledby="modal2Label"
          aria-hidden="true"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modal2">
                  Choose Avatar
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setAvatarModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {avatars.map((avatar, index) => (
                    <div className="col-md-3" key={index}>
                      <div
                        className="avatar-container"
                        onClick={() => handleImageClick(avatar.id)}
                      >
                        <img
                          src={avatar.image_url}
                          className="avatar-image"
                          alt={`Avatar ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="modal fade show"
          id="modal1"
          tabIndex="-1"
          aria-labelledby="modal1Label"
          aria-hidden="true"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modal1">
                  Edit Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  className="row g-3"
                  id="editProfileForm"
                  onSubmit={handleSubmit}
                >
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <div className="valid-feedback">Looks good!</div>
                    <div className="invalid-feedback">
                      Please enter a username.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="valid-feedback">Looks good!</div>
                    <div className="invalid-feedback">
                      Please enter a valid email.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      <div className="valid-feedback">Looks good!</div>
                      <div className="invalid-feedback">
                        Password must contain at least one uppercase letter, one
                        lowercase letter, one number, one symbol, and have a
                        minimum length of 8 characters.
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  form="editProfileForm"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
