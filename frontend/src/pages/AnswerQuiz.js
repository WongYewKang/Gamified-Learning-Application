import React, { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import "./AnswerQuiz.css";
import { FaStar, FaTree, FaCloud, FaSun } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import Timer from "../components/Timer";
import CircleTimer from "../components/CircleTimer";
import EarnedPointsOverlay from "../components/EarnedPointsOverlay";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { FaRegThumbsUp } from "react-icons/fa6";

const AnswerQuiz = ({ userId, setShowBar, setRenderNav }) => {
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isIncorrectAnswer, setIsIncorrectAnswer] = useState(false);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false); // Track if an answer is selected
  const { quizId, courseId } = useParams();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(null);
  const [questions, setQuestions] = useState([
    {
      question_text: "",
      ans_1: "",
      ans_2: "",
      ans_3: "",
      ans_4: "",
      image_url: "",
    },
  ]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredQuestion, setAnsweredQuestion] = useState(0);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [outerTimer, setOuterTimer] = useState(30);
  const [popupTimer, setPopupTimer] = useState(3);
  const [countdown, setCountdown] = useState(3);
  const [countdownEnded, setCountdownEnded] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeUsed, setTimeUsed] = useState(0);
  const [currentTimeUsed, setCurrentTimeUsed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [expGained, setExpGained] = useState(0);
  const [timerKey, setTimerKey] = useState(Date.now()); // Add a state for timer key
  const questionsRef = useRef(questions);
  let navigate = useNavigate();

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await axios.get(`/api/questions/${quizId}`);
        const quizData = response.data;

        const formattedQuestions = quizData.map((question) => ({
          question_id: question.id,
          question_text: question.title,
          ans_1: question.ans_1,
          ans_2: question.ans_2,
          ans_3: question.ans_3,
          ans_4: question.ans_4,
          difficulty: question.difficulty,
          correct_ans: question.correct_answer,
          image_url: question.image_url,
        }));

        setQuestions(formattedQuestions);
        startOuterTimer();
      } catch (error) {
        console.error("Error fetching quiz details:", error);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  useEffect(() => {
    const popupInterval = setInterval(() => {
      setPopupTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(popupInterval);
        }
        return prevTimer > 0 ? prevTimer - 1 : prevTimer;
      });
    }, 1000);

    return () => clearInterval(popupInterval);
  }, [showTimeoutDialog]);

  const startOuterTimer = () => {
    setOuterTimer(30);
    setTimerKey(Date.now());
  };

  const startCountdown = () => {
    let countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      setCountdownEnded(true);
      startOuterTimer();
    }, 3000);
  };

  useEffect(() => {
    startCountdown();
  }, []);

  const handleAnswerSelection = async (answer) => {
    try {
      setSelectedAnswer(answer);
      setAnsweredQuestion((prev) => prev + 1);
      setTotalTime((prev) => prev + 30);
      const timeUsed = 30 - outerTimer;
      setTimeUsed((prev) => prev + timeUsed);
      const currentTimeUsed = 30 - outerTimer;
      setCurrentTimeUsed(currentTimeUsed);

      console.log(answer, questions[selectedQuestionIndex].correct_ans);
      const isCorrectAnswer =
        answer === questions[selectedQuestionIndex].correct_ans;
      const isIncorrectAnswer =
        answer !== questions[selectedQuestionIndex].correct_ans;

      setIsCorrectAnswer(isCorrectAnswer);
      setIsIncorrectAnswer(isIncorrectAnswer);

      if (isIncorrectAnswer) {
        setQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions];
          updatedQuestions[selectedQuestionIndex].selected_answer = answer;
          return updatedQuestions;
        });
        setWrongAnswers((prev) => prev + 1);
      } else {
        setCorrectAnswers((prev) => prev + 1);
      }

      setTimeout(async () => {
        const pointsForQuestion = isCorrectAnswer
          ? questions[selectedQuestionIndex].difficulty
          : 0;

        const adjustedPoints =
          Math.ceil(pointsForQuestion * (outerTimer / 30)) * 10;
        setEarnedPoints(adjustedPoints);
        setTotalPoints((prevTotalPoints) => prevTotalPoints + adjustedPoints);

        const expGained = Math.ceil(adjustedPoints / 2);
        setExpGained((prevExpGained) => prevExpGained + expGained);

        setIsAnswerSelected(true);

        await axios.post("/submit-answer", {
          userId,
          courseId,
          quizId,
          questionId: questions[selectedQuestionIndex].question_id,
          answer,
          points: adjustedPoints,
        });
      }, 2000);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }

    setTimeout(async () => {
      if (selectedQuestionIndex === questions.length - 1) {
        setIsAnswerSelected(null);
        setEarnedPoints(null);
        setSelectedAnswer(null);
        setIsCorrectAnswer(null);
        setIsIncorrectAnswer(null);
        setShowBar(true);
        setQuizEnded(true);
        setRenderNav((prev) => !prev);
      } else {
        setEarnedPoints(null);
        setIsAnswerSelected(null);
        setSelectedAnswer(null);
        setIsCorrectAnswer(null);
        setIsIncorrectAnswer(null);
        setSelectedQuestionIndex(selectedQuestionIndex + 1);
        startOuterTimer();
      }
    }, 4000);
  };

  useEffect(() => {
    if (selectedQuestionIndex === questions.length - 1 && isAnswerSelected) {
      handleUpdateSummary();
      handleUpdateChartData();
    }
  }, [selectedQuestionIndex, isAnswerSelected]);

  const handleUpdateSummary = async () => {
    const totalQuestions = correctAnswers + wrongAnswers;

    await axios.post("/update-summary", {
      userId,
      quizId,
      correctAnswers,
      wrongAnswers,
      totalQuestions,
      totalPoints,
      timeUsed,
      totalTime,
    });
  };

  const handleUpdateChartData = async () => {
    await axios.post("/update-chart-data", {
      userId,
      totalPoints: totalPoints,
      correctAnswers,
      totalQuestions: correctAnswers + wrongAnswers,
      currentTimeUsed,
    });
  };

  useEffect(() => {
    const insertActionLog = async () => {
      if (correctAnswers + wrongAnswers === 1) {
        try {
          await axios.post("/insert-answer-quiz-action-log", {
            userId,
            courseId,
            quizId,
          });
        } catch (error) {
          console.error("Error inserting action log:", error);
        }
      }
    };

    insertActionLog();
  }, [correctAnswers, wrongAnswers]);

  useEffect(() => {
    let outerInterval;

    if (!quizEnded) {
      outerInterval = setInterval(() => {
        setOuterTimer((prevTimer) => {
          if (prevTimer === 0) {
            clearInterval(outerInterval);
            setShowTimeoutDialog(true);
            setPopupTimer(3);

            const deleteAnswerAndNavigate = async () => {
              try {
                await axios.post("/api/delete-answer", {
                  userId,
                  courseId,
                  quizId,
                });
              } catch (error) {
                console.error("Error deleting answer:", error);
              }
              setShowBar(true);
              navigate("/student-home");
            };

            setTimeout(deleteAnswerAndNavigate, 3000);
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(outerInterval);
  }, [quizEnded]);

  const handleReturnHome = () => {
    navigate("/student-home");
  };

  return (
    <div className="answer-quiz-container container-fluid">
      {countdownEnded ? (
        <>
          <div className="answer-quiz-first-row row">
            <div className="col-2"></div>
            <div className="col-8 text-center mt-4">
              <div className="answer-quiz-question-input w-100">
                {questions[selectedQuestionIndex].question_text}
              </div>
            </div>
            <div className="col-2 "></div>
          </div>

          <div className="answer-quiz-second-row row align-items-center">
            <div className="answer-quiz-timer col-2">
              <Timer key={timerKey} duration={30}></Timer>
            </div>
            <div className="col-8 text-center">
              <img
                src={questions[selectedQuestionIndex].image_url}
                alt={questions.title}
                className="answer-quiz-question-image"
              />
            </div>
            <div className="answer-quiz-show-answered-questions-container col-2">
              <div className="answer-quiz-show-answered-questions">
                <span className="answer-quiz-show-answered-number rounded-circle text-center">
                  {answeredQuestion}
                </span>
                <span className="answer-quiz-show-answered-text text-center">
                  Answers
                </span>
              </div>
            </div>
          </div>

          <div className="answer-quiz-third-row row">
            <div className="col-2"></div>
            <div className="col-8 text-center">
              <div className="row mb-3">
                <div className="col">
                  <div className="btn-group w-100">
                    <button
                      className={`answer-buttons btn btn-light d-flex align-items-center ${
                        isAnswerSelected === true ? "pe-none" : ""
                      } ${
                        isIncorrectAnswer && selectedAnswer === "1"
                          ? "bg-danger-subtle border border-danger border-opacity-50"
                          : ""
                      } ${
                        isCorrectAnswer && selectedAnswer === "1"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      } ${
                        selectedAnswer !== null &&
                        questions[selectedQuestionIndex].correct_ans === "1"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      }`}
                      style={{
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleAnswerSelection("1")}
                    >
                      <div className="d-flex align-items-center">
                        <FaTree
                          style={{
                            color: "#4caf50",
                            fontSize: "25px",
                            marginRight: "10px",
                          }}
                        />
                      </div>
                      <div className="answer-quiz-answers mx-auto">
                        {questions[selectedQuestionIndex].ans_1}
                      </div>
                      <div>
                        {isIncorrectAnswer && selectedAnswer === "1" ? (
                          <RxCross2 className="answer-cross" />
                        ) : isCorrectAnswer && selectedAnswer === "1" ? (
                          <TiTick className="answer-tick" />
                        ) : (
                          selectedAnswer !== null &&
                          questions[selectedQuestionIndex].correct_ans ===
                            1 && <TiTick className="answer-tick" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="col">
                  <div className="btn-group w-100">
                    <button
                      className={`answer-buttons btn btn-light d-flex align-items-center ${
                        isAnswerSelected === true ? "pe-none" : ""
                      } ${
                        isIncorrectAnswer && selectedAnswer === "2"
                          ? "bg-danger-subtle border border-danger border-opacity-50"
                          : ""
                      } ${
                        isCorrectAnswer && selectedAnswer === "2"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      } ${
                        selectedAnswer !== null &&
                        questions[selectedQuestionIndex].correct_ans === "2"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      }`}
                      style={{
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleAnswerSelection("2")}
                    >
                      <div className="d-flex align-items-center">
                        <FaCloud
                          style={{
                            color: "#03a9f4",
                            fontSize: "25px",
                            marginRight: "10px", // Adjust the margin for spacing
                          }}
                        />
                      </div>
                      <div className="answer-quiz-answers mx-auto">
                        {questions[selectedQuestionIndex].ans_2}
                      </div>
                      <div>
                        {isIncorrectAnswer && selectedAnswer === "2" ? (
                          <RxCross2 className="answer-cross" />
                        ) : isCorrectAnswer && selectedAnswer === "2" ? (
                          <TiTick className="answer-tick" />
                        ) : (
                          selectedAnswer !== null &&
                          questions[selectedQuestionIndex].correct_ans ===
                            "2" && <TiTick className="answer-tick" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="btn-group w-100">
                    <button
                      className={`answer-buttons btn btn-light d-flex align-items-center ${
                        isAnswerSelected === true ? "pe-none" : ""
                      } ${
                        isIncorrectAnswer && selectedAnswer === "3"
                          ? "bg-danger-subtle border border-danger border-opacity-50"
                          : ""
                      } ${
                        isCorrectAnswer && selectedAnswer === "3"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      } ${
                        selectedAnswer !== null &&
                        questions[selectedQuestionIndex].correct_ans === "3"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      }`}
                      style={{
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleAnswerSelection("3")}
                    >
                      <div className="d-flex align-items-center">
                        <FaStar
                          style={{
                            color: "#ffe550",
                            fontSize: "25px",
                            marginRight: "10px", // Adjust the margin for spacing
                          }}
                        />
                      </div>
                      <div className="answer-quiz-answers mx-auto">
                        {questions[selectedQuestionIndex].ans_3}
                      </div>
                      <div>
                        {isIncorrectAnswer && selectedAnswer === "3" ? (
                          <RxCross2 className="answer-cross" />
                        ) : isCorrectAnswer && selectedAnswer === "3" ? (
                          <TiTick className="answer-tick" />
                        ) : (
                          selectedAnswer !== null &&
                          questions[selectedQuestionIndex].correct_ans ===
                            "3" && <TiTick className="answer-tick" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="col">
                  <div className="btn-group w-100">
                    <button
                      className={`answer-buttons btn btn-light d-flex align-items-center ${
                        isAnswerSelected === true ? "pe-none" : ""
                      } ${
                        isIncorrectAnswer && selectedAnswer === "4"
                          ? "bg-danger-subtle border border-danger border-opacity-50"
                          : ""
                      } ${
                        isCorrectAnswer && selectedAnswer === "4"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      } ${
                        selectedAnswer !== null &&
                        questions[selectedQuestionIndex].correct_ans === "4"
                          ? "bg-success-subtle border border-success border-opacity-50"
                          : ""
                      }`}
                      style={{
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleAnswerSelection("4")}
                    >
                      <div className="d-flex align-items-center">
                        <FaSun
                          style={{
                            color: "orange",
                            fontSize: "25px",
                            marginRight: "10px",
                          }}
                        />
                      </div>
                      <div className="answer-quiz-answers mx-auto">
                        {questions[selectedQuestionIndex].ans_4}
                      </div>
                      <div>
                        {isIncorrectAnswer && selectedAnswer === "4" ? (
                          <RxCross2 className="answer-cross" />
                        ) : isCorrectAnswer && selectedAnswer === "4" ? (
                          <TiTick className="answer-tick" />
                        ) : (
                          selectedAnswer !== null &&
                          questions[selectedQuestionIndex].correct_ans ===
                            "4" && <TiTick className="answer-tick" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-2"></div>
          </div>
        </>
      ) : (
        <div className="circle-timer">
          <CircleTimer />
        </div>
      )}
      {earnedPoints !== null && (
        <EarnedPointsOverlay
          earnedPoints={earnedPoints}
          isCorrect={isCorrectAnswer}
        />
      )}
      {quizEnded ? (
        <div className="quiz-summary-overlay">
          <div className="quiz-summary-container">
            <div className="quiz-summary-icon">
              <FaRegThumbsUp />
            </div>
            <span className="fs-3 fw-medium">
              Quiz has ended<br></br>
            </span>
            <span className="fs-4 fw-medium">Better luck next time!</span>

            <div className="quiz-summary-results">
              <div className="mb-1">Total Points:</div>
              <div style={{ textAlign: "right" }}>{totalPoints}</div>
              <div className="mb-1">Total Questions:</div>
              <div style={{ textAlign: "right" }}>
                {correctAnswers + wrongAnswers}
              </div>
              <div className="mb-1">Correct Answers:</div>
              <div style={{ textAlign: "right" }}>{correctAnswers}</div>
              <div>Wrong Answers:</div>
              <div style={{ textAlign: "right" }}>{wrongAnswers}</div>
              <div>Exp gained:</div>
              <div style={{ textAlign: "right" }}>{expGained} exp</div>
            </div>

            <div className="mt-2">
              <button className="btn btn-primary" onClick={handleReturnHome}>
                Return to Home
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div
        className="delete-confirmation-overlay"
        style={{ display: showTimeoutDialog ? "block" : "none" }}
      />
      <ConfirmDialog
        className="delete-confirmation-popup"
        visible={showTimeoutDialog}
        draggable={false}
        closable={false}
        header={<div className="delete-confirmation-header">Reminder</div>}
        message={
          <div className="delete-confirmation-message">
            Oops! Time's up. You'll be redirected to the Home Page in{" "}
            {popupTimer} seconds.
          </div>
        }
        footer={<div className="mt-3"></div>}
      />
    </div>
  );
};

export default AnswerQuiz;
