import React, { useState, useEffect } from "react";
import "./AddCourse.css";
import { BsFileEarmarkText, BsFilm, BsFilePost } from "react-icons/bs";
import axios from "../api/axios";
import { FaUserCircle, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaStar, FaTree, FaCloud, FaSun } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import Logo from "../img/logo.png";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const AddCourse = ({ setShowBar, username }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [addedQuizzes, setAddedQuizzes] = useState([]);
  const [addedDocuments, setAddedDocuments] = useState([]);
  const [addedVideos, setAddedVideos] = useState([]);
  const [buttonSelected, setButtonSelected] = useState(true);
  const [quizSelected, setQuizSelected] = useState(false);
  const [documentSelected, setDocumentSelected] = useState(false);
  const [videoSelected, setVideoSelected] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [displayQuizDetails, setDisplayQuizDetails] = useState(false);
  const [quizDetails, setQuizDetails] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [toggledAnswer, setToggledAnswer] = useState(null);
  const [show, setShow] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  let navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`/api/quizzes`);
      setQuizzes(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
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

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`/get-documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`/get-videos`);
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchDocuments();
    fetchVideos();
  }, []);

  const handlePanelSelect = (panel) => {
    if (panel === "quizzes") {
      setQuizSelected(true);
      setButtonSelected(false);
      setDocumentSelected(false);
      setVideoSelected(false);
    } else if (panel === "documents") {
      setDocumentSelected(true);
      setButtonSelected(false);
      setQuizSelected(false);
      setVideoSelected(false);
    } else {
      setVideoSelected(true);
      setButtonSelected(false);
      setQuizSelected(false);
      setDocumentSelected(false);
    }
  };

  const handleRemoveItem = (item) => {
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem !== item
    );
    setSelectedItems(updatedItems);

    const updatedQuizzes = addedQuizzes.filter((q) => q.title !== item);
    setAddedQuizzes(updatedQuizzes);

    if (updatedQuizzes.length === 0) {
      setQuizDetails({});
      setQuestions([]);
      setSelectedQuestion(null);
      setDisplayQuizDetails(false);
    } else {
      const firstQuiz = updatedQuizzes[0];
      fetchQuizDetails(firstQuiz.id);
      setDisplayQuizDetails(true);
    }

    const removedQuiz = addedQuizzes.find((q) => q.title === item);
    if (removedQuiz) {
      setQuizzes([...quizzes, removedQuiz]);
    }
  };

  const handleRemoveDocument = (documentTitle) => {
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem !== documentTitle
    );
    setSelectedItems(updatedItems);

    const updatedDocuments = addedDocuments.filter(
      (d) => d.title !== documentTitle
    );
    setAddedDocuments(updatedDocuments);

    const removedDocument = addedDocuments.find(
      (d) => d.title === documentTitle
    );
    if (removedDocument) {
      setDocuments([...documents, removedDocument]); // Concatenate removedDocument to documents
    }
  };

  const handleRemoveVideo = (videoTitle) => {
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem !== videoTitle
    );
    setSelectedItems(updatedItems);

    const updatedVideos = addedVideos.filter((v) => v.title !== videoTitle);
    setAddedVideos(updatedVideos);

    const removedVideo = addedVideos.find((v) => v.title === videoTitle);
    if (removedVideo) {
      setVideos([...videos, removedVideo]); // Concatenate removedDocument to documents
    }
  };

  const handleAddQuizToCourse = (quiz) => {
    setAddedQuizzes([...addedQuizzes, quiz]);
    setQuizzes(quizzes.filter((q) => q.id !== quiz.id));
  };

  const handleAddDocumentToCourse = (document) => {
    setAddedDocuments([...addedDocuments, document]);
    setDocuments(documents.filter((d) => d.id !== document.id));
  };

  const handleAddVideoToCourse = (video) => {
    setAddedVideos([...addedVideos, video]);
    setVideos(videos.filter((v) => v.id !== video.id));
  };

  const handleDisplayQuizDetails = (quizId) => {
    fetchQuizDetails(quizId);
    setDisplayQuizDetails(true);
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

  const handleSaveCourse = async () => {
    try {
      const data = {
        courseTitle,
        courseDesc,
        addedQuizzes,
        addedDocuments,
        addedVideos,
        username,
      };

      await axios.post("/api/save-course", data);
      setShowBar(true);
      alert("Course created successfully!");
      navigate("/courses");
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleExit = async () => {
    setShowBar(true);
    navigate("/");
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
      <div className="top-bar border-bottom">
        <div>
          <img src={Logo} alt="Logo" className="add-course-logo" />
        </div>
        <div className="mt-2">
          <button className="btn btn-light" onClick={handleShow}>
            Edit course title and description
          </button>
        </div>
        <div className="save-exit-buttons">
          <button className="btn btn-primary" onClick={handleSaveCourse}>
            Save Course
          </button>
          <button className="btn btn-primary" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course Title and Course Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            className="form-control mb-3"
            placeholder="Enter course title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
          <textarea
            className="form-control"
            placeholder="Enter course description"
            rows={3}
            value={courseDesc}
            onChange={(e) => setCourseDesc(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="container mt-5 vh-100">
        <div className="row">
          <div className="col-3 bg-white p-4 border border-black rounded me-4">
            <div class="add-activity-division">
              <span class="fs-4 fw-bold me-5">Activities</span>
              <button
                className="btn btn-primary mb-3"
                onClick={() => {
                  setButtonSelected(true);
                  setDisplayQuizDetails(false);
                  setQuizSelected(false);
                  setDocumentSelected(false);
                  setVideoSelected(false);
                }}
              >
                + Add Activity
              </button>
            </div>
            {addedQuizzes.map((quiz) => (
              <div class="added-quiz" key={quiz.id}>
                <img
                  src={quiz.image_url}
                  alt={quiz.title}
                  className="added-quiz-image"
                  onClick={() => handleDisplayQuizDetails(quiz.id)}
                />
                {quiz.title}
                <FaTrashAlt
                  className="remove-item-button"
                  onClick={() => {
                    handleRemoveItem(quiz.title);
                  }}
                />
              </div>
            ))}
            {addedDocuments.map((document) => (
              <div class="added-quiz" key={document.id}>
                {document.title}
                <FaTrashAlt
                  className="remove-item-button"
                  onClick={() => {
                    handleRemoveDocument(document.title);
                  }}
                />
              </div>
            ))}
            {addedVideos.map((video) => (
              <div class="added-quiz" key={video.id}>
                {video.title}
                <FaTrashAlt
                  className="remove-item-button"
                  onClick={() => {
                    handleRemoveVideo(video.title);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="col bg-white p-5 border border-black rounded">
            {buttonSelected && (
              <div>
                <span class="fs-4 fw-bold me-5">Add an Activity</span>
                <div className="add-activities-division">
                  <div
                    className="activity-division"
                    onClick={() => handlePanelSelect("quizzes")}
                  >
                    <BsFileEarmarkText />
                    <span>Quiz</span>
                  </div>
                  <div
                    className="activity-division"
                    onClick={() => handlePanelSelect("documents")}
                  >
                    <BsFilm />
                    <span>Document</span>
                  </div>
                  <div
                    className="activity-division"
                    onClick={() => handlePanelSelect("videos")}
                  >
                    <BsFilePost />
                    <span>Video</span>
                  </div>
                </div>
              </div>
            )}

            {quizSelected && !displayQuizDetails && (
              <div>
                <div className="mb-4">
                  <span class="fs-4 fw-bold me-5">Select Quiz</span>
                </div>
                <div className="course-quizzes-container">
                  {quizzes.map((quiz) => (
                    <div key={quiz.quiz_id}>
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
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAddQuizToCourse(quiz)}
                        >
                          Add to Course
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {displayQuizDetails && (
              <div className="container">
                <div className="row">
                  <div className="col-4 border-end border-black mt-3">
                    <div>
                      <img
                        src={quizDetails.quiz_image_url}
                        alt={quizDetails.quiz_title}
                        className="add-course-image"
                      />
                    </div>
                    <div className="quiz-title-container">
                      <span className="fs-3 mt-3">
                        {quizDetails.quiz_title}
                      </span>
                    </div>
                    <div className="quiz-details-opr-container">
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
                  <div className="col-7 ms-4 mt-5 add-course-right-content-quiz">
                    <span class="fs-4 fw-bold me-5">Questions :</span>
                    {questions.map((question, index) => (
                      <div
                        className="add-course-right-content-quiz-details border border-secondary-subtle rounded"
                        key={question.id}
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
                                      {question.correct_answer === 1 && (
                                        <TiTick className="answer-tick" />
                                      )}
                                      {question.correct_answer !== 1 && (
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
                                      {question.correct_answer === 2 && (
                                        <TiTick className="answer-tick" />
                                      )}
                                      {question.correct_answer !== 2 && (
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
                                      {question.correct_answer === 3 && (
                                        <TiTick className="answer-tick" />
                                      )}
                                      {question.correct_answer !== 3 && (
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
                                      {question.correct_answer === 4 && (
                                        <TiTick className="answer-tick" />
                                      )}
                                      {question.correct_answer !== 4 && (
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
            )}

            {documentSelected && (
              <div>
                <div className="mb-4">
                  <span class="fs-4 fw-bold me-5">Select Document</span>
                </div>
                <div className="course-quizzes-container">
                  {documents.map((document) => (
                    <div key={document.id} className="quiz-item">
                      <div className="quiz-details">
                        <div className="quiz-opr">
                          <span>{document.title}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary mb-3"
                        onClick={() => handleAddDocumentToCourse(document)}
                      >
                        Add to Course
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videoSelected && (
              <div>
                <div className="mb-4">
                  <span class="fs-4 fw-bold me-5">Select Video</span>
                </div>
                <div className="course-quizzes-container">
                  {videos.map((video) => (
                    <div key={video.id} className="quiz-item">
                      <div className="quiz-details">
                        <div className="quiz-opr">
                          <div>
                            <span className="fw-bold">{video.title}</span>{" "}
                            <br></br> link : {video.video_url}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary mb-3"
                        onClick={() => handleAddVideoToCourse(video)}
                      >
                        Add to Course
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
