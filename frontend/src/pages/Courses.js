import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import axios from "../api/axios";
import "./Courses.css";
import CourseDetails from "./CourseDetails";

const Courses = ({
  userId,
  setShowBar,
  isStudent,
  fromParticipatedCourses,
}) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/courses/${userId}`);
        const coursesData = response.data;

        const uniqueCourses = [];
        const courseIdSet = new Set();

        coursesData.forEach((course) => {
          if (!courseIdSet.has(course.id)) {
            uniqueCourses.push(course);
            courseIdSet.add(course.id);
          }
        });

        const formattedCourses = uniqueCourses.map((course) => ({
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

        // Reorder courses based on participation status
        const sortedCourses = formattedCourses.sort((a, b) => {
          if (
            a.participate_status === "Participated" &&
            b.participate_status !== "Participated"
          ) {
            return -1;
          } else if (
            a.participate_status !== "Participated" &&
            b.participate_status === "Participated"
          ) {
            return 1;
          } else {
            return 0;
          }
        });

        setCourses(sortedCourses);
      } catch (error) {
        console.error("Error fetching courses with activities:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddCourse = () => {
    setShowBar(false);
    navigate("/add-course");
  };

  const handleViewCourseDetails = async (courseId) => {
    const selectedCourse = courses.find((course) => course.id === courseId);
    setSelectedCourse(selectedCourse);
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      {selectedCourse ? (
        <CourseDetails
          userId={userId}
          setShowBar={setShowBar}
          courseId={selectedCourse.id}
          isStudent={isStudent}
          fromParticipatedCourses={fromParticipatedCourses}
          participateStatus={selectedCourse.participate_status}
        />
      ) : (
        <div className="vh-100">
          <div class="mt-5 d-flex align-items-center justify-content-center">
            <div class="courses-container bg-white p-5 border border-black rounded">
              <div>
                <div className="course-title">
                  <span className="fs-1 fw-medium">Courses List</span>
                  <div className="course-title-decoration"></div>
                </div>
                {isStudent ? null : (
                  <div className="add-course-button">
                    <button
                      className="btn btn-primary"
                      onClick={handleAddCourse}
                    >
                      + Add Course
                    </button>
                  </div>
                )}
                {courses.length === 0 ? (
                  <p className="text-center fs-5 mt-3">
                    No course created yet...
                  </p>
                ) : (
                  <table
                    className={
                      isStudent
                        ? "table table-striped table-hover mt-5"
                        : "table table-striped table-hover"
                    }
                  >
                    <thead className="table-light">
                      <tr>
                        <th className="first-column">Course Name</th>
                        <th className="course-table-header">Author</th>
                        <th className="course-table-header">Last Edit Date</th>
                        <th className="course-table-header">
                          Number of Activities
                        </th>
                        {isStudent && <th>Participate Status</th>}
                      </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody className="table-group-divider">
                      {currentCourses.map((course) => (
                        <tr
                          key={course.course_id}
                          onClick={() => handleViewCourseDetails(course.id)}
                        >
                          <td className="first-column">{course.title}</td>
                          <td className="course-table-body">
                            <FaRegUserCircle className="me-2 mb-1" />
                            {course.opr}
                          </td>
                          <td className="course-table-body">
                            {course.create_date}
                          </td>
                          <td className="course-table-body">
                            {course.total_activity_count}
                          </td>
                          {isStudent && (
                            <td className="course-table-body">
                              {course.participate_status === "Participated" ? (
                                <span className="badge text-bg-success">
                                  Participated
                                </span>
                              ) : (
                                <span className="badge text-bg-danger">
                                  Not Participated
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <nav>
                  <ul className="pagination justify-content-end mt-3">
                    <li className="page-item">
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Previous"
                        onClick={handlePrevPage}
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => (
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
                    ))}
                    <li className="page-item">
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Next"
                        onClick={handleNextPage}
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
