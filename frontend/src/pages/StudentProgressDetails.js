import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // Import axios for making HTTP requests
import "./Summary.css";
import "chartjs-adapter-moment";
import { FaCircleXmark, FaCircleCheck } from "react-icons/fa6";

const StudentProgressDetails = ({ studentId, studentName }) => {
  const [actionLogs, setActionLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userSelectedAnswers, setUserSelectedAnswers] = useState([]);
  const actionsPerPage = 3;

  useEffect(() => {
    const fetchActionLogs = async () => {
      try {
        const response = await axios.get(`/get-action-logs/${studentId}`);
        const logsData = response.data;

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

    fetchActionLogs();
  }, []);

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
    <div>
      {actionLogs.length === 0 ? (
        <div className="container-md vh-100">
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="bg-white p-5 border rounded overflow-auto">
                <div className="d-flex align-items-center mb-3">
                  <span className="text-black fw-bold fs-3">
                    Student Progress for{" "}
                    <span className="text-primary fw-bold fs-3">
                      {studentName}
                    </span>
                  </span>
                </div>
                <div
                  className="fs-5 text-center"
                  style={{ marginTop: "100px", marginBottom: "100px" }}
                >
                  Student did not have any record of activity yet...
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-md vh-75">
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="bg-white p-5 border rounded overflow-auto">
                <div className="d-flex align-items-center mb-3">
                  <span className="text-black fw-bold fs-3">
                    Student Progress for{" "}
                    <span className="text-primary fw-bold fs-3">
                      {studentName}
                    </span>
                  </span>
                </div>
                {currentActions.map((log) => (
                  <div key={log.id} className="action-log">
                    {log.courseTitle &&
                      log.event === "Participate In Course" && (
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
                          <div className="action-log-value">
                            {log.wrong_ans}
                          </div>
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
                ))}

                {actionLogs.length > actionsPerPage && (
                  <nav>
                    <ul className="pagination justify-content-center">
                      {Array.from(
                        {
                          length: Math.ceil(actionLogs.length / actionsPerPage),
                        },
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
        </div>
      )}
      <div className="row" style={{ marginTop: "500px" }}></div>
    </div>
  );
};

export default StudentProgressDetails;
