import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./Login.css";
import { Form } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

const Login = ({
  setLoginClicked,
  setIsLoggedIn,
  setUserId,
  setUsername,
  setEmail,
  setIsStudent,
}) => {
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoginClicked(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "/login",
        {
          username: user,
          password: pwd,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const fetchInfoResponse = await axios.get(`/user/${response.data.id}`);
      const { id, username, email, isStudent } = fetchInfoResponse.data;

      setUserId(id);
      setUsername(username);
      setEmail(email);

      if (isStudent == 1) {
        setIsStudent(true);
      } else {
        setIsStudent(false);
      }

      setLoginClicked(false);
      setIsLoggedIn(true);

      const userData = {
        id,
        username,
        email,
        isStudent,
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("authToken", response.data.token);
      alert("Login account successfully!");
      navigate("/student-home");
      setUserId(response.data.id);
    } catch (err) {
      if (!err.response) {
        setErrMsg("No Server Response");
      } else if (err.response.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.response.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
    }
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
        <div className="login-title">Login</div>
        <Form onSubmit={handleSubmit}>
          <div style={{ marginTop: "15px" }}>
            <Form.Group controlId="user">
              <Form.Label>Username:</Form.Label>
              <Form.Control
                type="text"
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Password:</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
              />
            </Form.Group>
          </div>

          <p className="forgot-password">
            Forgot password? <a href="/forgot-password">Reset your password</a>
          </p>
          <button className="login-button" type="submit">
            Log In
          </button>
        </Form>
        <p className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
          {errMsg}
        </p>
        <p>
          <span className="create-acc">
            Need an Account? <a href="/signup">Sign Up</a>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
