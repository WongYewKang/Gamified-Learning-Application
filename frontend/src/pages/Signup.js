import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./Login.css";
import { Form, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

const SignUp = ({ setLoginClicked }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setErrMsg("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrMsg("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      setErrMsg(
        "Password must contain at least one character, one number, one symbol, and be at least 8 characters long."
      );
      return;
    }

    const fetchDataResponse = await axios.get("/users");

    // Check if the username or email already exists
    const usernameExists = fetchDataResponse.data.some(
      (user) => user.username === username
    );
    const emailExists = fetchDataResponse.data.some(
      (user) => user.email === email
    );

    if (usernameExists) {
      setErrMsg("Username already exists. Please choose a different one.");
      return;
    }

    if (emailExists) {
      setErrMsg("Email already exists. Please use a different one.");
      return;
    }

    try {
      await axios.post(
        "/register",
        {
          username,
          email,
          password,
          role,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      alert("Register account successfully!");
      setLoginClicked(true);
      navigate("/login");
    } catch (err) {
      if (!err.response) {
        setErrMsg("No Server Response");
      } else if (err.response.status === 400) {
        setErrMsg("Invalid Registration Information");
      } else {
        setErrMsg("Registration Failed");
      }
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const isValidPassword = (password) => {
    // Regular expression for password validation
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleBack = () => {
    window.history.back(); // Go back to the previous screen
    setLoginClicked(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button
          type="button"
          class="btn back-button"
          data-bs-toggle="button"
          onClick={handleBack}
        >
          <FaArrowLeft /> Back
        </button>
        <div className="login-title">Sign Up</div>
        <Form onSubmit={handleSubmit}>
          <div style={{ marginTop: "15px" }}>
            <Form.Group controlId="username">
              <Form.Label>Username:</Form.Label>
              <Form.Control
                type="text"
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                required
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Password:</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </Form.Group>

            <Form.Group controlId="role" className="mb-3">
              <Form.Label>Role:</Form.Label>
              <Form.Select
                onChange={(e) => setRole(e.target.value)}
                value={role}
                required
              >
                <option value="">Select Role</option>
                <option value="1">Student</option>
                <option value="0">Teacher</option>
              </Form.Select>
            </Form.Group>
          </div>

          <button type="submit" className="login-button">
            Register
          </button>
        </Form>
        <p className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
          {errMsg}
        </p>
        <p>
          <span className="create-acc">
            Already have an account? <a href="/login">Log In</a>
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
