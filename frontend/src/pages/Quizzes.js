import React, { useState, useEffect } from "react";
import "./Quizzes.css";
import axios from "../api/axios";
import QuizDetails from "./QuizDetails";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Quizzes = ({ handleViewQuiz, setShowBar }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  let navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    return () => {
      setSelectedQuiz(null);
    };
  }, []); // Empty dependency array to ensure it only runs once on mount

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`/api/quizzes`);
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleViewQuizDetails = (quiz) => {
    handleViewQuiz(quiz);
    setSelectedQuiz(quiz);
    navigate(`/quiz-details/${quiz.id}`);
  };

  const handleAddQuiz = () => {
    setShowBar(false);
    navigate("/add-quiz");
  };

  return (
    <div className="quizzes-container">
      <div className="container quizzes-wrapper">
        <div className="row">
          <div className="col-md-12">
            <div className="quizzes-title-container">
              <span className="quizzes-title">Quizzes</span>
              <button className="btn btn-primary" onClick={handleAddQuiz}>
                + Add
              </button>
            </div>
            <div className="quizzes-list">
              {quizzes.length === 0 ? (
                <p className="fs-5mt-3">No quiz created yet...</p>
              ) : (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.quiz_id}
                    onClick={() => handleViewQuizDetails(quiz)}
                  >
                    <div className="quiz-item">
                      <img
                        src={quiz.image_url}
                        alt={quiz.title}
                        className="quiz-image"
                      />
                      <div className="quiz-details">
                        <div className="quiz-title">
                          <span>{quiz.title}</span>
                        </div>
                        <div className="quiz-opr">
                          <FaUserCircle style={{ marginRight: "5px" }} />
                          <span>{quiz.opr}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
