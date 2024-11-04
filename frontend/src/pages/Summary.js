import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // Import axios for making HTTP requests
import "./Summary.css";
import { FaRegQuestionCircle } from "react-icons/fa";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";
import { IoMdTime } from "react-icons/io";
import { FaRegBookmark, FaCircleXmark, FaCircleCheck } from "react-icons/fa6";
import Chart from "chart.js/auto";
import "chartjs-adapter-moment";

const Summary = ({ userId }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [percentageCorrect, setPercentageCorrect] = useState("");
  const [averageTimeUsed, setAverageTimeUsed] = useState("");
  const [timeRankingData, setTimeRankingData] = useState("");
  const [timeCorrectAnsData, setTimeCorrectAnsData] = useState("");
  const [timeAttemptsData, setTimeAttemptsData] = useState("");
  const [actionLogs, setActionLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userSelectedAnswers, setUserSelectedAnswers] = useState([]);
  const actionsPerPage = 3;

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await axios.get(`/get-summary/${userId}`);
        setSummaryData(response.data.summaryData);
      } catch (error) {
        console.error("Failed to fetch summary data:", error);
      }
    };

    const fetchTimeRankingData = async () => {
      try {
        const response = await axios.get(`/get-time-ranking/${userId}`);
        setTimeRankingData(response.data.timeRankingData);
      } catch (error) {
        console.error("Failed to fetch time ranking data:", error);
      }
    };

    const fetchTimeCorrectAnsData = async () => {
      try {
        const response = await axios.get(`/get-time-correct-ans/${userId}`);
        setTimeCorrectAnsData(response.data.timeCorrectAnsData);
      } catch (error) {
        console.error("Failed to fetch time ranking data:", error);
      }
    };

    const fetchTimeAttemptsData = async () => {
      try {
        const response = await axios.get(`/get-time-attempts/${userId}`);
        setTimeAttemptsData(response.data.timeAttemptsData);
      } catch (error) {
        console.error("Failed to fetch time attempts data:", error);
      }
    };

    const fetchActionLogs = async () => {
      try {
        const response = await axios.get(`/get-action-logs/${userId}`);
        const logsData = response.data;
        console.log("logsData", logsData);

        for (const log of logsData) {
          if (log.quiz_id) {
            const quizResponse = await axios.get(
              `/get-quiz-title-and-answer/${log.quiz_id}`
            );
            const quizTitle = quizResponse.data.quizTitle[0].title; // Access the title property correctly
            const quizCourseTitle = quizResponse.data.quizCourseTitle; // Access the title property correctly
            log.quizTitle = quizTitle;
            log.quizCourseTitle = quizCourseTitle;
          }
          if (log.course_id) {
            const courseResponse = await axios.get(
              `/get-course-title/${log.course_id}`
            );
            const courseTitle = courseResponse.data.courseTitle[0].title; // Access the title property correctly
            log.courseTitle = courseTitle;
          }
          if (userSelectedAnswers !== null) {
            const selectedAnswersResponse = await axios.get(
              `/get-user-answer-by-time/${log.time}`
            );
            const userSelectedAnswers = selectedAnswersResponse.data;
            console.log(selectedAnswersResponse.data);
            log.userSelectedAnswers = userSelectedAnswers;
          }
        }

        setActionLogs(logsData);
        console.log(logsData);
      } catch (error) {
        console.error("Error fetching action logs:", error);
      }
    };

    fetchSummaryData();
    fetchTimeRankingData();
    fetchTimeCorrectAnsData();
    fetchTimeAttemptsData();
    fetchActionLogs();
  }, [userId]);

  useEffect(() => {
    if (summaryData) {
      const calculatedPercentageCorrect = Math.ceil(
        (summaryData.correct_answer_number /
          summaryData.attempted_question_number) *
          100
      );
      const calculatedAverageTimeUsed = Math.ceil(
        summaryData.time_used / summaryData.attempted_question_number
      );

      setPercentageCorrect(calculatedPercentageCorrect);
      setAverageTimeUsed(calculatedAverageTimeUsed);

      const doughnutCtx = document.getElementById("doughnutChart");

      let doughnutChart = new Chart(doughnutCtx, {
        type: "doughnut",
        data: {
          labels: ["Correct Answers", "Wrong Answers"],
          datasets: [
            {
              data: [
                summaryData ? summaryData.correct_answer_number : 0,
                summaryData ? summaryData.wrong_answer_number : 0,
              ],
              backgroundColor: ["rgb(75, 192, 192)", "rgb(255, 99, 132)"],
              hoverOffset: 4,
            },
          ],
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        },
      });

      return () => {
        doughnutChart.destroy();
      };
    }
  }, [summaryData]);

  useEffect(() => {
    if (timeRankingData.length > 0) {
      const timeLabels = timeRankingData.map((data) => data.time);
      const rankingValues = timeRankingData.map((data) => data.ranking);

      const lineCtx = document.getElementById("lineChart");

      let lineChart = new Chart(lineCtx, {
        type: "line",
        data: {
          labels: timeLabels,
          datasets: [
            {
              label: "Student Ranking Over Time",
              data: rankingValues,
              borderColor: "rgb(54, 162, 235)",
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
                displayFormats: {
                  day: "MMM DD",
                },
              },
              title: {
                display: true,
                text: "Time",
              },
            },
            y: {
              title: {
                display: true,
                text: "Ranking",
              },
              beginAtZero: true,
            },
          },
          aspectRatio: 2.5 / 2.5, // Set the aspect ratio (width/height), adjust as needed
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "User Ranking Over Time", // Specify your desired title here
              font: {
                size: 20, // Adjust the font size as needed
              },
              padding: {
                bottom: 30, // Add bottom margin (adjust as needed)
              },
            },
          },
        },
      });

      return () => {
        lineChart.destroy();
      };
    }
  }, [timeRankingData]);

  useEffect(() => {
    if (timeCorrectAnsData) {
      const timeLabels = timeCorrectAnsData.map((data) => data.time);
      const correctQuestionNumbers = timeCorrectAnsData.map(
        (data) => data.correct_question_number
      );
      const totalAttemptedNumbers = timeCorrectAnsData.map(
        (data) => data.total_attempted_question
      );

      const barCtx = document.getElementById("barChart");

      let barChart = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: timeLabels,
          datasets: [
            {
              label: "Correct Questions",
              data: correctQuestionNumbers,
              backgroundColor: "#50e3c2",
            },
            {
              label: "Questions Attempted",
              data: totalAttemptedNumbers,
              backgroundColor: "#ffd350",
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: [
                "Number of Correct Answer and",
                "Questions Attempted Over Time",
              ],
              font: {
                size: 18, // Adjust the font size as needed
              },
              padding: {
                bottom: 10, // Add bottom margin (adjust as needed)
              },
              maxLines: 2, // Allow the title to wrap onto multiple lines
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Time",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Number of Questions",
              },
            },
          },
          aspectRatio: 2.5 / 2.5, // Set the aspect ratio (width/height), adjust as needed
        },
      });

      return () => {
        barChart.destroy();
      };
    }
  }, [timeCorrectAnsData]);

  useEffect(() => {
    if (timeAttemptsData) {
      const timeLabels = timeAttemptsData.map((data) => data.time);
      const questionCounts = timeAttemptsData.map(
        (data) => data.attempted_number
      );

      const scatterCtx = document.getElementById("scatterChart");

      let scatterChart = new Chart(scatterCtx, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Number of Questions",
              data: timeLabels.map((time, index) => ({
                x: time,
                y: questionCounts[index],
              })),
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: ["Number of Questions", "Attempted Over Time"],
              font: {
                size: 18,
                weight: "bold",
              },
              padding: {
                bottom: 30,
              },
            },
          },
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              title: {
                display: true,
                text: "Time (seconds)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Number of Question Attempted",
              },
              beginAtZero: true,
            },
          },
          aspectRatio: 2.5 / 2.5, // Set the aspect ratio (width/height), adjust as needed
        },
      });

      return () => {
        scatterChart.destroy();
      };
    }
  }, [timeAttemptsData]);

  function getDoughnutChartDetailsText() {
    if (percentageCorrect >= 80) {
      return (
        <div className="doughnut-chart-details-text">
          <span className="green fw-bold">Excellent Answer Correctness</span>
          <span className="doughnut-chart-details-text-bottom">
            Great Work! Congratulations on your remarkable improvement! Keep up
            the excellent work and strive for even greater success!
          </span>
        </div>
      );
    } else if (percentageCorrect >= 30) {
      return (
        <div className="doughnut-chart-details-text">
          <span className="yellow fw-bold">Good Answer Accuracy</span>
          <span className="doughnut-chart-details-text-bottom">
            You're doing great! Stay determined and focused. Every challenge you
            overcome makes you stronger. Keep going!
          </span>
        </div>
      );
    } else {
      return (
        <div className="doughnut-chart-details-text">
          <span className="red fw-bold">Below Average Answer Precision</span>
          <span className="doughnut-chart-details-text-bottom">
            Practice makes perfect! Stay strong, determined, and have faith in
            yourself. Success is closer than you think, so keep pushing forward!
          </span>
        </div>
      );
    }
  }

  const indexOfLastAction = currentPage * actionsPerPage;
  const indexOfFirstAction = indexOfLastAction - actionsPerPage;
  const currentActions = actionLogs.slice(
    indexOfFirstAction,
    indexOfLastAction
  );

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Function to add ordinal indicators
    const getOrdinalIndicator = (day) => {
      if (day >= 11 && day <= 13) {
        return "th";
      }
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const ordinalIndicator = getOrdinalIndicator(day);

    return (
      <span>
        <span className="date">
          <span>{day}</span>
          <span className="ordinal">{ordinalIndicator}</span>
          {` ${month} ${year}`}
        </span>
        <span className="time">{`${hours}:${
          minutes < 10 ? "0" + minutes : minutes
        }`}</span>
      </span>
    );
  };

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-md-5">
          <div className="bg-white p-4 border rounded h-100">
            <div className="d-flex align-items-center mb-3">
              <span className="text-black fw-bold fs-3">
                Summary Information
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <div>
                <FaRegBookmark className="me-2 fs-5 text-body-secondary" />
                <span className="fw-semibold">Total Course Participated</span>
              </div>
              <div>
                {summaryData ? summaryData.participated_course_number : "-"}
              </div>
            </div>
            <hr className="mb-3" />
            <div className="d-flex justify-content-between">
              <div>
                <FaRegQuestionCircle className="me-2 fs-5 text-primary" />
                <span className="fw-semibold">Total Questions Attempted</span>
              </div>
              <div>
                {summaryData ? summaryData.attempted_question_number : "-"}
              </div>
            </div>
            <hr className="mb-3" />
            <div className="d-flex justify-content-between">
              <div>
                <BiCheckCircle className="me-2 fs-5 text-success" />
                <span className="fw-semibold">Total Correct Answers</span>
              </div>
              <div>{summaryData ? summaryData.correct_answer_number : "-"}</div>
            </div>
            <hr className="mb-3" />
            <div className="d-flex justify-content-between">
              <div>
                <BiXCircle className="me-2 fs-5 text-danger" />
                <span className="fw-semibold">Total Wrong Answers</span>
              </div>
              <div>{summaryData ? summaryData.wrong_answer_number : "-"}</div>
            </div>
            <hr className="mb-3" />
            <div className="d-flex justify-content-between">
              <div>
                <IoMdTime className="me-2 fs-5 text-warning" />
                <span className="fw-semibold">
                  Average Time Used For Each Question
                </span>
              </div>
              <div>{summaryData ? `${averageTimeUsed} seconds` : "-"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="bg-white p-4 border rounded h-100">
            {!summaryData ? (
              <div className="doughnut-chart-details-text">
                <span className="text-muted">No data available yet...</span>
              </div>
            ) : (
              <div className="doughnut-chart-details">
                <div className="doughnut-chart-details">
                  <canvas
                    className="doughnut-chart"
                    id="doughnutChart"
                  ></canvas>
                  <div className="circle">
                    {summaryData && (
                      <div className="circle-details">
                        <span
                          className={`percentage ${
                            percentageCorrect >= 80
                              ? "green"
                              : percentageCorrect >= 30
                              ? "yellow"
                              : "red"
                          }`}
                        >
                          {percentageCorrect}%
                        </span>
                        <span className="correct-text">Correct</span>
                      </div>
                    )}
                  </div>
                  {summaryData && getDoughnutChartDetailsText()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-4">
          <div className="bg-white p-5 border rounded h-100">
            <canvas id="barChart"></canvas>
          </div>
        </div>
        <div className="col-4">
          <div className="bg-white p-5 border rounded h-100">
            <canvas id="lineChart"></canvas>
          </div>
        </div>
        <div className="col-4">
          <div className="bg-white p-5 border rounded h-100">
            <canvas id="scatterChart"></canvas>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="bg-white p-5 border rounded h-100">
            <div className="d-flex align-items-center mb-3">
              <span className="text-black fw-bold fs-3">Progress</span>
            </div>
            {currentActions.length === 0 ? (
              <div className="text-center fs-5 mt-3">No activity yet...</div>
            ) : (
              currentActions.map((log) => (
                <div key={log.id} className="action-log">
                  {log.courseTitle && log.event === "Participate In Course" && (
                    <div>
                      <div className="action-log-item">
                        <div className="action-log-time-label">
                          {formatDateTime(log.time)}
                        </div>
                      </div>
                      <div className="action-log-item">
                        <div className="action-log-label me-2">
                          Participate in
                        </div>
                        <div className="action-log-value me-2">
                          {log.courseTitle}
                        </div>
                        <div className="action-log-label"> course</div>
                      </div>
                    </div>
                  )}
                  {log.quizTitle && log.event === "Start Answering Quiz" && (
                    <div>
                      <div className="action-log-item">
                        <div className="action-log-time-label">
                          {formatDateTime(log.time)}
                        </div>
                      </div>
                      <div className="action-log-item">
                        <div className="action-log-label me-2">
                          Start answering
                        </div>
                        <div className="action-log-value me-2">
                          {log.quizTitle}
                        </div>
                        <div className="action-log-label me-2"> quiz in</div>
                        <div className="action-log-value me-2">
                          {log.courseTitle}
                        </div>
                        <div className="action-log-label"> course</div>
                      </div>
                    </div>
                  )}
                  {log.quizTitle && log.event === "Completed Quiz" && (
                    <div>
                      <div className="action-log-item">
                        <div className="action-log-time-label">
                          {formatDateTime(log.time)}
                        </div>
                      </div>
                      <div className="action-log-item">
                        <div className="action-log-label me-2">
                          Complete answer all questions in
                        </div>
                        <div className="action-log-value me-2">
                          {log.quizTitle}
                        </div>
                        <div className="action-log-label me-2"> quiz in</div>
                        <div className="action-log-value me-2">
                          {log.quizCourseTitle}
                        </div>
                        <div className="action-log-label"> course</div>
                      </div>
                      <div className="action-log-item">
                        <FaCircleCheck className="me-1 text-success" />
                        <div className="action-log-label me-2">
                          Correct Answers :
                        </div>
                        <div className="action-log-value">
                          {log.correct_ans}
                        </div>
                      </div>
                      <div className="action-log-item mb-4">
                        <FaCircleXmark className="me-1 text-danger" />
                        <div className="action-log-label me-2">
                          Wrong Answers :
                        </div>
                        <div className="action-log-value">{log.wrong_ans}</div>
                      </div>
                      <div className="action-log-item-selected-ans-div">
                        {log.userSelectedAnswers &&
                          log.userSelectedAnswers.map((answer, index) => (
                            <div
                              className="action-log-item-selected-ans"
                              key={answer.id}
                            >
                              <div className="action-log-label me-2">
                                Question {index + 1}
                              </div>
                              <div className="me-2">
                                Selected Answer :{" "}
                                <span className="action-log-value">
                                  {answer.selected_answer}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {actionLogs.length > actionsPerPage && (
              <nav>
                <ul className="pagination justify-content-center">
                  {Array.from(
                    { length: Math.ceil(actionLogs.length / actionsPerPage) },
                    (_, index) => (
                      <li
                        key={index}
                        className={`page-item ${
                          currentPage === index + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          onClick={() => paginate(index + 1)}
                          className="page-link"
                        >
                          {index + 1}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-5"></div>
    </div>
  );
};

export default Summary;
