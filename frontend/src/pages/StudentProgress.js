import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import StudentProgressDetails from "./StudentProgressDetails";
import "./StudentProgress.css";

const StudentProgress = () => {
  const [studentsData, setStudentsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(null);
  const [studentProgressVisible, setStudentProgressVisible] = useState(false); // Set initial state to false

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await axios.get(`/get-all-student`);
        setStudentsData(studentsResponse.data);
        console.log(studentsResponse.data);

        const summaryResponse = await axios.get(`/get-summary`);
        setSummaryData(summaryResponse.data); // Assuming summaryData is an object with a 'rows' property
        console.log(summaryResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (studentId, name) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(name);
    setStudentProgressVisible(true);
  };

  const studentDataWithSummary = studentsData?.map((student) => {
    const matchedSummaryData = summaryData?.find(
      (summary) => summary.user_id === student.id
    );
    return {
      ...student,
      summaryData: matchedSummaryData,
    };
  });

  return (
    <div>
      {studentProgressVisible ? (
        <StudentProgressDetails
          studentId={selectedStudentId}
          studentName={selectedStudentName}
        />
      ) : (
        <div className="vh-100">
          <div className="mt-5 d-flex align-items-center justify-content-center">
            <div className="courses-container bg-white p-5 border border-black rounded">
              <div className="course-title">
                <span className="fs-1 fw-medium">Students List</span>
                <div className="course-title-decoration"></div>
              </div>
              {studentDataWithSummary && studentDataWithSummary.length > 0 ? (
                <table className="table table-striped table-hover mt-5">
                  <thead className="table-light">
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Total Course Participated</th>
                      <th>Total Questions Attempted</th>
                      <th>Total Correct Answers</th>
                      <th>Total Wrong Answers</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {studentDataWithSummary.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() =>
                          handleRowClick(student.id, student.username)
                        }
                      >
                        <td>{student.username}</td>
                        <td>{student.email}</td>
                        <td>
                          {student.summaryData
                            ? student.summaryData.participated_course_number ||
                              "-"
                            : "-"}
                        </td>
                        <td>
                          {student.summaryData
                            ? student.summaryData.attempted_question_number ||
                              "-"
                            : "-"}
                        </td>
                        <td>
                          {student.summaryData
                            ? student.summaryData.correct_answer_number || "-"
                            : "-"}
                        </td>
                        <td>
                          {student.summaryData
                            ? student.summaryData.wrong_answer_number || "-"
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center fs-5 mt-5">
                  No student registered yet...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
