import React, { useState, useEffect } from "react";
import "./AddCourse.css";
import { BsFileEarmarkText, BsFilm, BsFilePost } from "react-icons/bs";
import axios from "../api/axios";
import { FaUserCircle, FaTrashAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar, FaTree, FaCloud, FaSun } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../img/logo.png";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const EditCourse = ({ setShowBar }) => {
  let navigate = useNavigate();
  const { courseId } = useParams();
  const [courseDetails, setCourseDetails] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [addedQuizzes, setAddedQuizzes] = useState([]);
  const [addedDocuments, setAddedDocuments] = useState([]);
  const [addedVideos, setAddedVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [buttonSelected, setButtonSelected] = useState(true);
  const [quizSelected, setQuizSelected] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [displayQuizDetails, setDisplayQuizDetails] = useState(false);
  const [quizDetails, setQuizDetails] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [toggledAnswer, setToggledAnswer] = useState(null);
  const [show, setShow] = useState(false);
  const [documentSelected, setDocumentSelected] = useState(false);
  const [videoSelected, setVideoSelected] = useState(false);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/course-details/${courseId}`);
      const { courseDetails, quizzes, documents, videos } = response.data;
      setCourseDetails(courseDetails);
      setCourseTitle(courseDetails.title);
      setCourseDesc(courseDetails.desc);
      setAddedQuizzes(quizzes);
      setAddedDocuments(documents);
      setAddedVideos(videos);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`/api/quizzes`);
      setQuizzes(response.data);
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
    fetchCourseDetails();
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
      setQuizzes([]);
      setQuizDetails({});
      setQuestions([]);
      setSelectedQuestion(null);
      setDisplayQuizDetails(false);
      setButtonSelected(false);
    } else {
      const firstQuiz = updatedQuizzes[0];
      setQuizSelected(false);
      fetchQuizDetails(firstQuiz.id);
      setDisplayQuizDetails(true);
      setButtonSelected(false);
    }

    // Add the removed quiz back to the main list
    const removedQuiz = addedQuizzes.find((q) => q.title === item);
    if (removedQuiz) {
      setQuizzes([...quizzes, removedQuiz]);
    }
  };

  const handleAddQuizToCourse = (quiz) => {
    setAddedQuizzes([...addedQuizzes, quiz]);
    setQuizzes(quizzes.filter((q) => q.id !== quiz.id));
  };

  const handleDisplayQuizDetails = (quizId) => {
    fetchQuizDetails(quizId);
    setDisplayQuizDetails(true);
    setButtonSelected(false);
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

  const handleAddDocumentToCourse = (document) => {
    setAddedDocuments([...addedDocuments, document]);
    setDocuments(documents.filter((d) => d.id !== document.id));
  };

  const handleAddVideoToCourse = (video) => {
    setAddedVideos([...addedVideos, video]);
    setVideos(videos.filter((v) => v.id !== video.id));
  };

  const handleSaveCourse = async () => {
    try {
      const data = {
        courseId: courseDetails.id, // Make sure this is valid
        courseTitle,
        courseDesc,
        addedQuizzes,
        addedDocuments,
        addedVideos,
      };
      await axios.post(`/api/update-course/${courseDetails.id}`, data);
      setShowBar(true);
      alert("Course updated successfully!");
      navigate("/courses");
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleRemoveDocument = (documentTitle) => {
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem !== documentTitle
    );
    setSelectedItems(updatedItems);

    const removedDocument = addedDocuments.find(
      (d) => d.title === documentTitle
    );
    if (removedDocument) {
      const updatedDocuments = addedDocuments.filter(
        (d) => d.title !== documentTitle
      );
      setAddedDocuments(updatedDocuments);
      setDocuments([
        ...documents.filter((d) => d.title !== documentTitle),
        removedDocument,
      ]);
    }
  };

  const handleRemoveVideo = (videoTitle) => {
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem !== videoTitle
    );
    setSelectedItems(updatedItems);

    const removedVideo = addedVideos.find((v) => v.title === videoTitle);
    if (removedVideo) {
      const updatedVideos = addedVideos.filter((v) => v.title !== videoTitle);
      setAddedVideos(updatedVideos);
      setVideos([
        ...videos.filter((v) => v.title !== videoTitle),
        removedVideo,
      ]);
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
      <div className="top-bar border-bottom border-light">
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
            Save Changes
          </button>
          <button className="btn btn-primary" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course Title and Description</Modal.Title>
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

      <div className="container vh-100">
        <div className="row h-100 pb-5">
          <div className="col-4 mt-5">
            <div class="activities-left-panel bg-white p-5 border border-black rounded h-100">
              <div class="add-activity-division">
                <span class="fs-4 fw-bold me-4 mt-3">Activities</span>
                <button
                  className="btn btn-primary"
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
                <div
                  class="added-quiz"
                  key={quiz.id}
                  onClick={() => handleDisplayQuizDetails(quiz.id)}
                >
                  <img
                    src={quiz.image_url}
                    alt={quiz.title}
                    className="added-quiz-image"
                  />
                  <span>{quiz.title}</span>
                  <div
                    className="remove-item-button-container"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveItem(quiz.title);
                    }}
                  >
                    <FaTrashAlt className="remove-item-button" />
                  </div>
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
          </div>

          <div className="col-8 mt-5">
            <div class="bg-white p-5 border border-black rounded h-100">
              {buttonSelected && (
                <div>
                  <div className="p-3 mt-2">
                    <span className="fs-4 fw-bold me-4">Add an activity</span>
                  </div>
                  <div className="add-activities-division">
                    <div
                      className="activity-division p-5 border rounded"
                      onClick={() => handlePanelSelect("quizzes")}
                    >
                      <BsFileEarmarkText />
                      <span>Quiz</span>
                    </div>
                    <div
                      className="activity-division p-5 border rounded"
                      onClick={() => handlePanelSelect("documents")}
                    >
                      <BsFilm />
                      <span>Document</span>
                    </div>
                    <div
                      className="activity-division p-5 border rounded"
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
                  <div className="mt-3 mb-2">
                    <span className="fs-4 fw-bold me-4">Select quiz</span>
                  </div>
                  <div className="course-quizzes-container">
                    {quizzes.map(
                      (quiz) =>
                        // Check if the quiz is not already added to the course
                        !addedQuizzes.some(
                          (addedQuiz) => addedQuiz.id === quiz.id
                        ) && (
                          <div key={quiz.id}>
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
                                  <FaUserCircle
                                    style={{ marginRight: "5px" }}
                                  />
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
                        )
                    )}
                  </div>
                </div>
              )}

              {displayQuizDetails && (
                <div className="container">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="d-flex border-bottom border-secondary pb-5 p-4">
                        <div className="mt-4">
                          <img
                            src={quizDetails.quiz_image_url}
                            alt={quizDetails.quiz_title}
                            className="quiz-image"
                          />
                        </div>
                        <div className="ms-2">
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
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <div className="fs-5 fw-bold me-4 ps-4 mt-4">
                          Questions:
                        </div>
                        <div className="edit-course-quiz-questions ps-4">
                          {questions.map((question, index) => (
                            <div
                              className="edit-course-quiz-details border border-secondary-subtle rounded"
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
                                <div className=" p-2">
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
                  </div>
                </div>
              )}

              {documentSelected && (
                <div>
                  <div className="mb-4">
                    <span class="fs-4 fw-bold me-5">Select Document</span>
                  </div>
                  <div className="course-quizzes-container">
                    {documents.map(
                      (document) =>
                        // Check if the document is not already added to the course
                        !addedDocuments.some(
                          (addedDoc) => addedDoc.id === document.id
                        ) && (
                          <div key={document.id} className="quiz-item">
                            <div className="quiz-details">
                              <div className="quiz-opr">
                                <span>{document.title}</span>
                              </div>
                            </div>
                            <button
                              className="btn btn-primary mb-3"
                              onClick={() =>
                                handleAddDocumentToCourse(document)
                              }
                            >
                              Add to Course
                            </button>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {videoSelected && (
                <div>
                  <div className="mb-4">
                    <span class="fs-4 fw-bold me-5">Select Video</span>
                  </div>
                  <div className="course-quizzes-container">
                    {videos.map(
                      (video) =>
                        // Check if the video is not already added to the course
                        !addedVideos.some(
                          (addedVideo) => addedVideo.id === video.id
                        ) && (
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
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
