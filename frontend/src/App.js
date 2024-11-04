// src/App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentHome from "./pages/StudentHome";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import Courses from "./pages/Courses";
import ParticipatedCourses from "./pages/ParticipatedCourses";
import AnswerQuiz from "./pages/AnswerQuiz";
import Activities from "./pages/Activities";
import Quizzes from "./pages/Quizzes";
import QuizDetails from "./pages/QuizDetails";
import CourseDetails from "./pages/CourseDetails";
import AddQuiz from "./pages/AddQuiz";
import EditQuiz from "./pages/EditQuiz";
import AddCourse from "./pages/AddCourse";
import EditCourse from "./pages/EditCourse";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";
import Summary from "./pages/Summary";
import StudentProgress from "./pages/StudentProgress";
import Shop from "./pages/Shop";
import Navbar from "./components/NavBar";
import StudentProgressDetails from "./pages/StudentProgressDetails";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isStudent, setIsStudent] = useState("");
  const [showBar, setShowBar] = useState(true);
  const [loginClicked, setLoginClicked] = useState(false);
  const [inAnswerQuiz, setInAnswerQuiz] = useState(false);
  const [renderNav, setRenderNav] = useState(false);

  return (
    <Router>
      {showBar && (
        <Navbar
          loginClicked={loginClicked}
          setLoginClicked={setLoginClicked}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          inAnswerQuiz={inAnswerQuiz}
          renderNav={renderNav}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/student-home"
          element={
            <StudentHome userId={userId} setInAnswerQuiz={setInAnswerQuiz} />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              setIsLoggedIn={setIsLoggedIn}
              setUserId={setUserId}
              setUsername={setUsername}
              setEmail={setEmail}
              setIsStudent={setIsStudent}
            />
          }
        />
        <Route
          path="/signup"
          element={<SignUp setLoginClicked={setLoginClicked} />}
        />
        <Route
          path="/courses"
          element={
            <Courses
              userId={userId}
              setShowBar={setShowBar}
              isStudent={isStudent}
            />
          }
        />
        <Route
          path="/participated-courses"
          element={
            <ParticipatedCourses
              userId={userId}
              setShowBar={setShowBar}
              isStudent={isStudent}
              setInAnswerQuiz={setInAnswerQuiz}
            />
          }
        />
        <Route
          path="/answer-quiz/:quizId/:courseId"
          element={
            <AnswerQuiz
              userId={userId}
              setShowBar={setShowBar}
              setRenderNav={setRenderNav}
            />
          }
        />
        <Route
          path="/activities"
          element={<Activities setShowBar={setShowBar} />}
        />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route
          path="/quiz-details/:quizId"
          element={<QuizDetails setShowBar={setShowBar} />}
        />
        <Route
          path="/add-quiz"
          element={<AddQuiz setShowBar={setShowBar} username={username} />}
        />
        <Route
          path="/edit-quiz/:quizId"
          element={<EditQuiz setShowBar={setShowBar} username={username} />}
        />
        <Route
          path="/add-course"
          element={<AddCourse setShowBar={setShowBar} username={username} />}
        />
        <Route
          path="/edit-course/:courseId"
          element={<EditCourse setShowBar={setShowBar} username={username} />}
        />
        <Route path="/quizzes/:quizId" element={<QuizDetails />} />
        <Route path="/course/:courseId" element={<CourseDetails />} />
        <Route path="/leaderboard" element={<Leaderboard userId={userId} />} />
        <Route
          path="/profile/:userId"
          element={
            <UserProfile isStudent={isStudent} setRenderNav={setRenderNav} />
          }
        />
        <Route path="/summary" element={<Summary userId={userId} />} />
        <Route
          path="/student-progress"
          element={<StudentProgress userId={userId} />}
        />
        <Route
          path="/student-progress-details"
          element={<StudentProgressDetails />}
        />
        <Route
          path="/shop"
          element={<Shop userId={userId} setRenderNav={setRenderNav} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
