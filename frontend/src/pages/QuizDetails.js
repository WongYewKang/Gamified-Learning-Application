import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import "primeicons/primeicons.css";
import "./QuizDetails.css";
import { FaUserCircle, FaTrashAlt } from "react-icons/fa";
import { FaStar, FaTree, FaCloud, FaSun } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { Dropdown, DropdownButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdMoreVert, MdEdit } from "react-icons/md";

const QuizDetails = ({ setShowBar }) => {
  const [quizDetails, setQuizDetails] = useState({});
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [toggledAnswer, setToggledAnswer] = useState(null);
  const { quizId } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await axios.get(`/api/questions/${quizId}`);
        const quizData = response.data;

        if (quizData.length > 0) {
          setQuizDetails({
            quiz_id: quizData[0].quiz_id,
            quiz_title: quizData[0].quiz_title,
            quiz_desc: quizData[0].quiz_desc,
            quiz_create_date: quizData[0].quiz_create_date,
            quiz_image_url: quizData[0].quiz_image_url,
            quiz_opr: quizData[0].quiz_opr,
          });

          setQuestions(quizData);
          console.log(response.data);
        } else {
          console.error("No data received for the quiz details");
        }
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleViewAnswer = (questionId) => {
    const selected = questions.find((question) => question.id === questionId);

    setSelectedQuestion((prevSelected) =>
      prevSelected === selected ? null : selected
    );

    setToggledAnswer((prevToggled) =>
      prevToggled === questionId ? null : questionId
    );
  };

  const handleDeleteQuiz = async () => {
    setDeleteConfirmationVisible(true);
  };

  const handleEditQuiz = async () => {
    setShowBar(false);
    navigate(`/edit-quiz/${quizId}`);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/delete-quiz/${quizDetails.quiz_id}`
      );

      if (response.data.success) {
      } else {
        console.error("Error deleting quiz:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setDeleteConfirmationVisible(false);
      alert("Quiz deleted successfully!");
      navigate("/");
    }
  };

  const rejectDelete = () => {
    setDeleteConfirmationVisible(false);
  };

  return (
    <div className="container vh-100">
      <div className="row">
        <div className="col mt-5" style={{ height: "90vh" }}>
          <div class="bg-white p-5 border border-black rounded h-100">
            <div className="container">
              <div className="row mt-2 mb-3">
                <img
                  src={quizDetails.quiz_image_url}
                  alt={quizDetails.quiz_title}
                  className="quiz-image"
                />
              </div>

              <div className="row align-items-center">
                <div className="d-flex align-items-center">
                  <div className="col mt-3">
                    <span className="fs-2 fw-medium text-success me-1">
                      {quizDetails.quiz_title}
                    </span>
                    <span className="fs-3">🌟</span>
                  </div>
                </div>

                {/* Description displayed under the title */}
                <div className="col">
                  <span>{quizDetails.quiz_desc}</span>
                </div>

                <div>
                  <DropdownButton
                    title={<MdMoreVert className="fs-5" />}
                    className="custom-dropdown-button"
                  >
                    <Dropdown.Item onClick={handleEditQuiz}>
                      <div className="d-flex align-items-center">
                        <MdEdit
                          className="edit-icon"
                          onClick={handleEditQuiz}
                        />
                        <span>Edit</span>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDeleteQuiz}>
                      <div className="d-flex align-items-center">
                        <FaTrashAlt
                          className="trash-icon"
                          onClick={handleDeleteQuiz}
                        />
                        <span>Remove</span>
                      </div>
                    </Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>

              <div className="row mt-3">
                <div className="me-2 fs-2">
                  <FaUserCircle />
                </div>
                <div className="quiz-details-opr">
                  <span style={{ fontWeight: "bold" }}>
                    {quizDetails.quiz_opr}
                  </span>
                  <span style={{ fontSize: "13px" }}>
                    Created at {quizDetails.quiz_create_date}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col mt-5" style={{ height: "90vh" }}>
          <div class="bg-white p-5 border border-black rounded h-100">
            <span class="quiz-details-right-content-title fs-5 fw-bolder">
              Questions :
            </span>
            <div className="quiz-details-right-content-toggled">
              {questions.map((question, index) => (
                <div
                  className="quiz-details-right-content border border-secondary-subtle rounded"
                  key={question.question_id}
                  onClick={() => handleViewAnswer(question.id)}
                >
                  <div
                    className={`question-header ${
                      toggledAnswer === question.id
                        ? "bg-primary-subtle border border-primary-subtle rounded-top"
                        : ""
                    }`}
                  >
                    <div className="p-2">
                      <span>Question {index + 1} -</span>
                      <div class="quiz-details-right-question">
                        <span className="fs-5 fw-medium">{question.title}</span>
                        <img
                          src={question.image_url}
                          alt={question.title}
                          className="question-image"
                        />
                      </div>
                    </div>
                  </div>
                  {selectedQuestion && selectedQuestion.id === question.id && (
                    <>
                      <div className="quiz-details-right-answer">
                        <div>
                          <div className="mt-4 answers-dropdown">
                            <div>
                              <FaTree
                                style={{
                                  color: "#4caf50",
                                  fontSize: "25px",
                                  marginRight: "5px",
                                }}
                              />
                              <span className="fw-semibold ms-2">
                                {selectedQuestion.ans_1}
                              </span>
                            </div>
                            <div>
                              {question.correct_answer === "1" && (
                                <TiTick className="answer-tick" />
                              )}
                              {question.correct_answer !== "1" && (
                                <RxCross2 className="answer-cross" />
                              )}
                            </div>
                          </div>
                          <div className="mt-3 answers-dropdown">
                            <div>
                              <FaCloud
                                style={{
                                  color: "#03a9f4",
                                  fontSize: "25px",
                                  marginRight: "5px",
                                }}
                              />
                              <span className="fw-semibold ms-2">
                                {selectedQuestion.ans_2}
                              </span>
                            </div>
                            <div>
                              {question.correct_answer === "2" && (
                                <TiTick className="answer-tick" />
                              )}
                              {question.correct_answer !== "2" && (
                                <RxCross2 className="answer-cross" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="mt-3 answers-dropdown">
                            <div>
                              <FaStar
                                style={{
                                  color: "#ffe500",
                                  fontSize: "25px",
                                  marginRight: "5px",
                                }}
                              />
                              <span className="fw-semibold ms-2">
                                {selectedQuestion.ans_3}
                              </span>
                            </div>
                            <div>
                              {question.correct_answer === "3" && (
                                <TiTick className="answer-tick" />
                              )}
                              {question.correct_answer !== "3" && (
                                <RxCross2 className="answer-cross" />
                              )}
                            </div>
                          </div>
                          <div className="mt-3 mb-3 answers-dropdown">
                            <div>
                              <FaSun
                                style={{
                                  color: "orange",
                                  fontSize: "25px",
                                  marginRight: "5px",
                                }}
                              />
                              <span className="fw-semibold ms-2">
                                {selectedQuestion.ans_4}
                              </span>
                            </div>
                            <div>
                              {question.correct_answer === "4" && (
                                <TiTick className="answer-tick" />
                              )}
                              {question.correct_answer !== "4" && (
                                <RxCross2 className="answer-cross" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className="delete-confirmation-overlay"
        style={{ display: deleteConfirmationVisible ? "block" : "none" }}
      />
      <ConfirmDialog
        className="delete-confirmation-popup"
        visible={deleteConfirmationVisible}
        onHide={rejectDelete}
        draggable={false}
        closable={false}
        header={<div className="delete-confirmation-header">Confirmation</div>}
        message={
          <div className="delete-confirmation-message">
            Are you sure you want to delete this quiz ?
          </div>
        }
        footer={
          <div className="delete-confirmation-footer">
            <Button
              label="Cancel"
              class="btn btn-outline-danger"
              onClick={rejectDelete}
            />
            <Button
              label="Delete"
              class="btn btn-outline-primary"
              onClick={confirmDelete}
            />
          </div>
        }
      />
    </div>
  );
};

export default QuizDetails;
