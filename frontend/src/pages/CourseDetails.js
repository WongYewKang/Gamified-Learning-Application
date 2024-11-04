import React, { useState, useEffect } from "react";
import "./CourseDetails.css";
import axios from "../api/axios";
import { FaUserCircle } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { FaStar, FaTree, FaCloud, FaSun } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";

const CourseDetails = ({
  userId,
  setShowBar,
  courseId,
  isStudent,
  setInAnswerQuiz,
  fromParticipatedCourses,
  participateStatus,
}) => {
  let navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [toggledAnswer, setToggledAnswer] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    console.log(participateStatus);
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/course-details/${courseId}`);
      const { courseDetails, quizzes, documents, videos } = response.data;
      setCourseDetails(courseDetails);
      setQuizzes(quizzes);
      setDocuments(documents);
      setVideos(videos);

      if (quizzes.length > 0 && !isStudent) {
        handleDisplayQuizDetails(quizzes[0].id);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const fetchQuizDetails = async (quizId) => {
    try {
      const response = await axios.get(`/api/questions/${quizId}`);
      const quizData = response.data;

      if (quizData.length > 0) {
        setQuizDetails({
          quiz_id: quizData[0].quiz_id,
          quiz_title: quizData[0].quiz_title,
          quiz_create_date: quizData[0].quiz_create_date,
          quiz_image_url: quizData[0].quiz_image_url,
          quiz_opr: quizData[0].quiz_opr,
        });

        setQuestions(quizData);
      } else {
        console.error("No data received for the quiz details");
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
    }
  };

  const handleDisplayQuizDetails = (quizId) => {
    setSelectedQuiz(quizId);
    fetchQuizDetails(quizId);
  };

  const handleViewAnswer = (questionId) => {
    const selected = questions.find((question) => question.id === questionId);

    setSelectedQuestion((prevSelected) =>
      prevSelected === selected ? null : selected
    );

    setToggledAnswer((prevToggled) =>
      prevToggled === questionId ? null : questionId
    );
  };

  const handleDeleteCourse = () => {
    setDeleteConfirmationVisible(true);
  };

  const handleEditCourse = () => {
    setShowBar();
    navigate(`/edit-course/${courseId}`);
  };

  const rejectDelete = () => {
    setDeleteConfirmationVisible(false);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/delete-course/${courseId}`);
      setDeleteConfirmationVisible(false);
      alert("Course deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const participateCourse = async () => {
    try {
      await axios.post(`/api/participate-course`, {
        courseId: courseId,
        userId: userId,
      });

      alert("Participate course successfully!");
      navigate("/participated-courses");
    } catch (error) {
      console.error("Error participating in the course:", error);
    }
  };

  const handleStartAnswer = (quizId) => {
    setInAnswerQuiz(true);
    navigate(`/answer-quiz/${quizId}/${courseId}`);
  };

  return (
    <div className="vh-100">
      <div class="mt-5 d-flex align-items-center justify-content-center">
        <div class="course-details-container bg-white p-5 border border-black rounded">
          <div className="course-details-title">
            <span className="fw-medium text-secondary-emphasis">
              Course Title :<br></br>
            </span>
            <span className="fs-1 text-info-emphasis">
              {courseDetails.title}
            </span>
            <div className="course-details-title-decoration"></div>
          </div>

          <div>
            <span className="fw-medium text-secondary-emphasis">
              Course Desc :<br></br>
            </span>
            <span className="text-info-emphasis fw-medium">
              {courseDetails.desc}
            </span>
          </div>

          <div class="mt-2">
            <div className="me-2 fs-2">
              <FaUserCircle />
            </div>
            <div class="course-details-header">
              <div className="course-details-opr">
                <span style={{ fontWeight: "bold" }}>{courseDetails.opr}</span>
                <span style={{ fontSize: "13px" }}>
                  Created at {courseDetails.create_date}
                </span>
              </div>
              <div className="course-actions-container">
                {isStudent &&
                !fromParticipatedCourses &&
                participateStatus !== "Participated" ? (
                  <Button
                    label="Participate"
                    class="btn btn-primary"
                    onClick={participateCourse}
                  />
                ) : (
                  !isStudent && (
                    <>
                      <MdEdit
                        className="courses-edit-icon"
                        onClick={handleEditCourse}
                      />
                      <FaTrashAlt
                        className="courses-trash-icon"
                        onClick={handleDeleteCourse}
                      />
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isStudent && fromParticipatedCourses ? (
        <div className="container">
          <div
            className="bg-white p-5 border border-black rounded mt-3 card-container"
            style={{ maxHeight: "540px" }}
          >
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  id="tab1-tab"
                  data-bs-toggle="tab"
                  href="#tab1"
                  role="tab"
                  aria-controls="tab1"
                  aria-selected="true"
                >
                  Quizzes
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="tab2-tab"
                  data-bs-toggle="tab"
                  href="#tab2"
                  role="tab"
                  aria-controls="tab2"
                  aria-selected="false"
                >
                  Documents
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="tab3-tab"
                  data-bs-toggle="tab"
                  href="#tab3"
                  role="tab"
                  aria-controls="tab3"
                  aria-selected="false"
                >
                  Videos
                </a>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="tab1"
                role="tabpanel"
                aria-labelledby="tab1-tab"
              >
                <div className="row align-items-center mt-5 bg-white">
                  {quizzes.length > 0 &&
                    quizzes.map((quiz) => (
                      <div
                        className="col-md-4 mb-3"
                        key={quiz.id}
                        onClick={() =>
                          isStudent ? null : handleDisplayQuizDetails(quiz.id)
                        }
                      >
                        <div className="card ms-4" style={{ width: "15rem" }}>
                          <img
                            src={quiz.image_url}
                            alt={quiz.title}
                            className="card-img-top"
                            style={{ width: "100%", height: "200px" }}
                          />
                          <div className="card-body">
                            <h5 className="card-title mt-2 mb-4">
                              {quiz.title}
                            </h5>
                            <div style={{ marginTop: "-20px" }}>
                              {quiz.desc}
                            </div>
                            <div>
                              <Button
                                label="Start Answer"
                                className="btn btn-success mt-3"
                                onClick={() => handleStartAnswer(quiz.id)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="tab2"
                role="tabpanel"
                aria-labelledby="tab2-tab"
              >
                {documents.length > 0 &&
                  documents.map((document, index) => (
                    <div className="col mb-4 mt-3" key={document.id}>
                      <div className="card ms-4" style={{ width: "15rem" }}>
                        <div className="card-body">
                          <h5 className="card-title mt-2 mb-4">
                            Document {index + 1}: {document.title}
                          </h5>
                          <div>
                            <a
                              href={document.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div
                className="tab-pane fade"
                id="tab3"
                role="tabpanel"
                aria-labelledby="tab3-tab"
              >
                {videos.length > 0 &&
                  videos.map((video, index) => (
                    <div className="col-md-4 mb-3 mt-4" key={video.id}>
                      <div className="card ms-4" style={{ width: "15rem" }}>
                        <div className="card-body">
                          <h5 className="card-title mt-2">
                            Video {index + 1}: {video.title}
                          </h5>
                          <div>
                            <a
                              href={video.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              Watch Video
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : isStudent && !fromParticipatedCourses ? (
        <div className="container">
          <div
            className="bg-white p-5 border border-black rounded h-100 mt-3 card-container mb-5"
            style={{ maxHeight: "540px" }}
          >
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  id="tab1-tab"
                  data-bs-toggle="tab"
                  href="#tab1"
                  role="tab"
                  aria-controls="tab1"
                  aria-selected="true"
                >
                  Quizzes
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="tab2-tab"
                  data-bs-toggle="tab"
                  href="#tab2"
                  role="tab"
                  aria-controls="tab2"
                  aria-selected="false"
                >
                  Documents
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="tab3-tab"
                  data-bs-toggle="tab"
                  href="#tab3"
                  role="tab"
                  aria-controls="tab3"
                  aria-selected="false"
                >
                  Videos
                </a>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="tab1"
                role="tabpanel"
                aria-labelledby="tab1-tab"
              >
                <div className="row align-items-center mt-5 bg-white">
                  {quizzes.length > 0 &&
                    quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() =>
                          isStudent ? null : handleDisplayQuizDetails(quiz.id)
                        }
                        className="col-md-4 mb-3"
                      >
                        <div className="card ms-4" style={{ width: "15rem" }}>
                          <img
                            src={quiz.image_url}
                            alt={quiz.title}
                            className="card-img-top"
                            style={{ width: "100%", height: "200px" }}
                          />
                          <div className="card-body">
                            <h5 className="card-title">{quiz.title}</h5>
                            <p className="card-text">{quiz.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="tab2"
                role="tabpanel"
                aria-labelledby="tab2-tab"
              >
                {documents.length > 0 &&
                  documents.map((document, index) => (
                    <div className="col-md-4 mb-3 mt-4" key={document.id}>
                      <div className="card ms-4" style={{ width: "15rem" }}>
                        <div className="card-body">
                          <h5 className="card-title mt-2">
                            Document {index + 1}: {document.title}
                          </h5>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div
                className="tab-pane fade"
                id="tab3"
                role="tabpanel"
                aria-labelledby="tab3-tab"
              >
                {videos.length > 0 &&
                  videos.map((video, index) => (
                    <div className="col-md-4 mb-3 mt-4" key={video.id}>
                      <div className="card ms-4" style={{ width: "15rem" }}>
                        <div className="card-body">
                          <h5 className="card-title mt-2">
                            Video {index + 1}: {video.title}
                          </h5>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div class="container">
          <div className="row mt-4">
            <div class="col-4">
              <div className="course-details-bottom-left-panel bg-white p-5 border border-black rounded h-100">
                {quizzes.length > 0 && (
                  <>
                    <div className="mb-3 fs-5 fw-semibold text-secondary-emphasis">
                      Quizzes :
                    </div>
                    {quizzes.map((quiz) => (
                      <div
                        className={`course-details-quiz ${
                          selectedQuiz === quiz.id ? "selected-quiz" : ""
                        }`}
                        key={quiz.id}
                        onClick={() =>
                          isStudent ? null : handleDisplayQuizDetails(quiz.id)
                        }
                      >
                        <img
                          src={quiz.image_url}
                          alt={quiz.title}
                          className="course-details-quiz-image"
                        />
                        <span>{quiz.title}</span>
                        <div>
                          {isStudent && fromParticipatedCourses && (
                            <Button
                              label="Start Answer"
                              class="btn btn-success"
                              onClick={() => handleStartAnswer(quiz.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {documents.length > 0 && (
                  <>
                    <div className="mb-3 fs-5 fw-semibold text-secondary-emphasis">
                      Documents :
                    </div>
                    <div className="documents-list-container">
                      <div className="documents-list">
                        {documents.map((document, index) => (
                          <div
                            key={index}
                            className="border border-secondary-subtle rounded mb-3 p-4"
                          >
                            <div>
                              Document {index + 1}: {document.title}
                            </div>
                            <div>
                              <a
                                href={document.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-none"
                              >
                                View Document
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {videos.length > 0 && (
                  <>
                    <div className="mb-3 fs-5 fw-semibold text-secondary-emphasis">
                      Videos :
                    </div>
                    <div className="documents-list-container">
                      <div className="documents-list">
                        {videos.map((video, index) => (
                          <div
                            key={index}
                            className="border border-secondary-subtle rounded mb-3 p-4"
                          >
                            <div>
                              Video {index + 1}: {video.title}
                            </div>
                            <div>
                              <a
                                href={video.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-none"
                              >
                                Watch Video
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div class="col-8">
              <div class="course-details-bottom-right-panel bg-white p-5 border border-black rounded h-100">
                {questions && questions.length > 0 && (
                  <>
                    <div className="mb-3 fs-5 fw-semibold text-secondary-emphasis">
                      Questions:
                    </div>
                    {questions.map((question, index) => (
                      <div
                        className="course-details-right-content border border-secondary-subtle rounded mb-3"
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
                              <span className="fs-5 fw-medium">
                                {question.title}
                              </span>
                              <img
                                src={question.image_url}
                                alt={question.title}
                                className="question-image"
                              />
                            </div>
                          </div>
                        </div>

                        {selectedQuestion &&
                          selectedQuestion.id === question.id && (
                            <>
                              <div className="course-details-quiz-answer">
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
                                        {selectedQuestion.ans_3}{" "}
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
                                  <div className="mt-3 answers-dropdown">
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
                  </>
                )}
                {questions.length === 0 &&
                  documents.length == 0 &&
                  videos.length == 0 && (
                    <div className="fs-5 fw-bolder">
                      No learning activity included in this course yet...
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

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
            Are you sure you want to delete this course?
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

export default CourseDetails;
