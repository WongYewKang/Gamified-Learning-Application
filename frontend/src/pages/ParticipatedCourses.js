import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "./Courses.css";
import CourseDetails from "./CourseDetails"; // Import the new component for displaying questions
import { FaRegUserCircle } from "react-icons/fa";

const ParticipatedCourses = ({
  userId,
  setShowBar,
  isStudent,
  setInAnswerQuiz,
}) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/student-courses`, {
          params: { userId: userId },
        });
        const formattedCourses = response.data.map((course) => ({
          ...course,
          create_date: new Date(course.create_date).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          ),
        }));
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses with activities:", error);
      }
    };

    fetchData();
  }, []);

  const handleViewCourseDetails = async (courseId) => {
    setSelectedCourse(courseId);
  };

  return (
    <div>
      {selectedCourse ? (
        <CourseDetails
          userId={userId}
          setShowBar={setShowBar}
          courseId={selectedCourse}
          isStudent={isStudent}
          setInAnswerQuiz={setInAnswerQuiz}
          fromParticipatedCourses={true}
        />
      ) : (
        <div className="vh-100">
          <div className="mt-5 d-flex align-items-center justify-content-center">
            <div className="courses-container bg-white p-5 border border-black rounded">
              <div className="course-title">
                <span className="fs-1 fw-medium">My Courses</span>
                <div className="course-title-decoration"></div>
              </div>
              {courses.length > 0 ? (
                <table className="table table-striped table-hover table-bordered bdr mt-5">
                  <thead>
                    <tr>
                      <th className="th-first-column">Course Name</th>
                      <th>Author</th>
                      <th>Last Edit Date</th>
                      <th>Number of Activities</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {courses.map((course) => (
                      <tr
                        key={course.course_id}
                        onClick={() => handleViewCourseDetails(course.id)}
                      >
                        <td className="td-first-column">{course.title}</td>
                        <td>
                          <FaRegUserCircle className="me-2 mb-1" />
                          {course.opr}
                        </td>
                        <td className="course-last-edit-date">
                          {course.create_date}
                        </td>
                        <td className="course-activities-number">
                          {course.activity_number}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center fs-5 mt-5">
                  Looks like you haven't participated in any courses yet...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipatedCourses;
