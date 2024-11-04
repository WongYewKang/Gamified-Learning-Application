import React, { useState, useEffect } from "react";
import axios from "../api/axios"; // Import axios instance with your API URL
import "./AddQuiz.css";
import Logo from "../img/logo.png";
import { Bs1Circle, Bs2Circle, Bs3Circle, Bs4Circle } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { imageDb } from "../api/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const EditQuiz = ({ setShowBar, username }) => {
  const { quizId } = useParams();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([
    {
      question_text: "",
      ans_1: "",
      ans_2: "",
      ans_3: "",
      ans_4: "",
      image_url: "",
      difficulty: "", // New state for difficulty level
      correct_answer: "", // New state for correct answer
    },
  ]);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState(""); // State to track quiz title
  const [coverImageToUpload, setCoverImageToUpload] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState(
    Array(questions.length).fill(null)
  );
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [show, setShow] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await axios.get(`/api/questions/${quizId}`);
        const quizData = response.data;

        setQuizTitle(quizData[0].quiz_title);
        setQuizDesc(quizData[0].quiz_desc);
        setCoverImagePreview(quizData[0].quiz_image_url);

        const formattedQuestions = quizData.map((question) => ({
          question_id: question.id,
          question_text: question.title,
          ans_1: question.ans_1,
          ans_2: question.ans_2,
          ans_3: question.ans_3,
          ans_4: question.ans_4,
          difficulty: question.difficulty, // New state for difficulty level
          correct_answer: question.correct_answer, // New state for correct answer
          image_url: question.image_url,
        }));

        setQuestions(formattedQuestions);

        const allImageURLs = formattedQuestions.map(
          (question) => question.image_url
        );
        setImagePreviews(allImageURLs);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handlePopupInputChange = (field, value) => {
    setPopupData({
      ...popupData,
      [field]: value,
    });
  };

  const handleTogglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };

  const handleQuestionSwitch = (questionIndex) => {
    setSelectedQuestionIndex(questionIndex);
    handleQuestionChange(
      { target: { value: questions[questionIndex].question_text } },
      questionIndex
    );
  };

  const handleQuestionChange = (event, questionIndex) => {
    const { name, value } = event.target;
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex][name] = value;
    setQuestions(updatedQuestions);

    const image = questions[questionIndex].image_url;

    if (image instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(questionIndex, reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setImagePreview(questionIndex, image);
    }
  };

  const handleDifficultyChange = (event, questionIndex) => {
    const { value } = event.target;
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].difficulty = value;
    setQuestions(updatedQuestions);
  };

  // Function to handle changes in the correct answer for a question
  const handleCorrectAnswerChange = (event, questionIndex) => {
    const { value } = event.target;
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correct_answer = value;
    setQuestions(updatedQuestions);
  };

  const setImagePreview = (questionIndex, preview) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews[questionIndex] = preview;
    setImagePreviews(updatedPreviews);
  };

  const handleAddQuestion = async () => {
    try {
      // Fetch the latest question ID from the server
      const response = await axios.get("/api/get-latest-question-id");
      const latestQuestionId = response.data.latestId;

      setQuestions([
        ...questions,
        {
          question_id: latestQuestionId, // Use the latest question ID
          question_text: "",
          ans_1: "",
          ans_2: "",
          ans_3: "",
          ans_4: "",
          difficulty: "",
          correct_answer: "",
          image: "",
        },
      ]);

      setSelectedQuestionIndex(questions.length);
    } catch (error) {
      console.error("Error fetching latest question ID:", error);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      let downloadURL = "";

      try {
        if (coverImageToUpload) {
          const coverImageRef = ref(imageDb, `cover-images/${v4()}`);
          await uploadBytes(coverImageRef, coverImageToUpload);

          downloadURL = await getDownloadURL(coverImageRef);
        } else {
          downloadURL = coverImagePreview;
        }
      } catch (error) {
        console.error("Error uploading cover image:", error);
      }

      try {
        for (let i = 0; i < questions.length; i++) {
          if (!(questions[i].image_url instanceof File)) {
            console.error("No file selected for upload");
            continue;
          }

          const imageRef = ref(imageDb, `question-images/${v4()}`);
          await uploadBytes(imageRef, questions[i].image_url);

          const downloadURL = await getDownloadURL(imageRef);
          questions[i].image_url = downloadURL;
        }
      } catch (error) {
        console.error("Error uploading question images:", error);
      }

      const quizData = {
        title: quizTitle,
        desc: quizDesc,
        create_date: new Date().toISOString().split("T")[0],
        image_url: downloadURL,
        opr: username,
        questions: questions.map((question) => ({
          id: question.question_id,
          title: question.question_text,
          ans_1: question.ans_1,
          ans_2: question.ans_2,
          ans_3: question.ans_3,
          ans_4: question.ans_4,
          difficulty: question.difficulty, // Include difficulty level
          correct_answer: question.correct_answer, // Include correct answer
          image_url: question.image_url,
        })),
      };
      console.log(quizData);

      await axios.put(`/api/update-quiz/${quizId}`, quizData);
      setShowBar(true);
      navigate("/activities");
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleImageChange = (e, questionIndex) => {
    const selectedFile = e.target.files[0];
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].image_url = selectedFile;
    setQuestions(updatedQuestions);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(questionIndex, reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCoverImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setCoverImageToUpload(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleExit = async () => {
    setShowBar(true);
    navigate("/activities");
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="add-quiz-container">
      <div className="top-bar">
        <div>
          <img src={Logo} alt="Logo" className="add-course-logo" />
        </div>

        <div className="mt-2">
          <button className="btn btn-light" onClick={handleShow}>
            Enter quiz title and description
          </button>
        </div>

        <div className="save-exit-buttons">
          <button class="btn btn-primary" onClick={handleSaveQuiz}>
            Save Changes
          </button>
          <button class="btn btn-primary" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Quiz Title and Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            className="form-control mb-3"
            placeholder="Enter quiz title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
          <textarea
            className="form-control"
            placeholder="Enter quiz description"
            rows={3}
            value={quizDesc}
            onChange={(e) => setQuizDesc(e.target.value)}
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

      <div class="panels">
        <div className="left-panel">
          <h2>Questions</h2>
          <div class="cover-image-container">
            <div
              className="cover-image-input-container"
              onClick={() => document.getElementById("coverFileInput").click()}
            >
              <img
                src={coverImagePreview}
                alt="Selected Preview"
                className="file-preview"
              />
              <input
                type="file"
                id="coverFileInput"
                onChange={handleCoverImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
          <ul>
            {questions.map((question, index) => (
              <li key={index} onClick={() => handleQuestionSwitch(index)}>
                Question {index + 1}
              </li>
            ))}
            <li onClick={handleAddQuestion}>+ Add Question</li>
          </ul>
        </div>
        <div className="main-panel">
          <input
            type="text"
            className="question-input"
            placeholder="Enter your question here..."
            name="question_text"
            value={questions[selectedQuestionIndex].question_text}
            onChange={(event) =>
              handleQuestionChange(event, selectedQuestionIndex)
            }
          />
          <div className="mt-3">
            <label className="fs-5 add-quiz-label">Difficulty Level : </label>
            <select
              value={questions[selectedQuestionIndex].difficulty}
              onChange={(event) =>
                handleDifficultyChange(event, selectedQuestionIndex)
              }
              className="ms-2 select-box" // Add a class for styling
            >
              <option value="">Select</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </select>
          </div>
          <div className="mt-2 d-flex ">
            <label className="fs-5 add-quiz-label">Correct Answer : </label>
            <select
              value={questions[selectedQuestionIndex].correct_answer}
              onChange={(event) =>
                handleCorrectAnswerChange(event, selectedQuestionIndex)
              }
              className="ms-2 select-box" // Add a class for styling
            >
              <option value="">Select</option>
              <option value="1">Answer 1</option>
              <option value="2">Answer 2</option>
              <option value="3">Answer 3</option>
              <option value="4">Answer 4</option>
            </select>
          </div>
          <div
            className="file-input-container"
            onClick={() => document.getElementById("questionFileInput").click()}
          >
            <img
              src={imagePreviews[selectedQuestionIndex]}
              alt="Selected Preview"
              className="file-preview"
            />
            <input
              type="file"
              id="questionFileInput"
              onChange={(e) => handleImageChange(e, selectedQuestionIndex)}
              style={{ display: "none" }}
            />
          </div>

          <div className="answers-container">
            <div className="answer-container-top">
              <div className="wrapper">
                <div className="icon">
                  <Bs1Circle />
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="Answer 1"
                  name="ans_1"
                  value={questions[selectedQuestionIndex].ans_1}
                  onChange={(event) =>
                    handleQuestionChange(event, selectedQuestionIndex)
                  }
                />
              </div>

              <div className="wrapper">
                <div className="icon">
                  <Bs2Circle />
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="Answer 2"
                  name="ans_2"
                  value={questions[selectedQuestionIndex].ans_2}
                  onChange={(event) =>
                    handleQuestionChange(event, selectedQuestionIndex)
                  }
                />
              </div>
            </div>

            <div className="answer-container-bottom">
              <div className="wrapper">
                <div className="icon">
                  <Bs3Circle />
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="Answer 3"
                  name="ans_3"
                  value={questions[selectedQuestionIndex].ans_3}
                  onChange={(event) =>
                    handleQuestionChange(event, selectedQuestionIndex)
                  }
                />
              </div>

              <div className="wrapper">
                <div className="icon">
                  <Bs4Circle />
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="Answer 4"
                  name="ans_4"
                  value={questions[selectedQuestionIndex].ans_4}
                  onChange={(event) =>
                    handleQuestionChange(event, selectedQuestionIndex)
                  }
                />
              </div>
            </div>
          </div>
          {isPopupVisible && (
            <div className="quiz-details-popup">
              <div className="overlay" onClick={handleTogglePopup}>
                <div class="title-container">
                  <label class="fs-5 fw-bold mb-1">Title :</label>
                  <input
                    placeholder="Type your quiz title here..."
                    value={quizTitle}
                    class="title"
                    type="text"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>

                <div class="desc-container">
                  <label class="fs-5 fw-bold mb-1">Description : </label>
                  <textarea
                    className="desc"
                    value={popupData.description}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handlePopupInputChange("description", e.target.value)
                    }
                  />
                </div>

                <button class="btn btn-primary" onClick={handleTogglePopup}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;
