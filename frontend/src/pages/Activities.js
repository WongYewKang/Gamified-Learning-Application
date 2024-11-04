import React, { useState, useEffect } from "react";
import "./Activities.css";
import Quizzes from "./Quizzes";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "../api/axios"; // Import axios instance with your API URL
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import necessary Firebase storage functions
import { imageDb } from "../api/firebaseConfig"; // Import Firebase storage instance
import { FaTrashAlt } from "react-icons/fa";

const Activities = ({ setShowBar }) => {
  const [selectedType, setSelectedType] = useState("quizzes");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null); // State to store the item to be deleted
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false); // State to control the delete confirmation modal

  useEffect(() => {
    fetchDocuments();
    fetchVideos();
  }, [selectedType]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/get-documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get("/get-videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const renderDocuments = () => {
    if (documents.length === 0) {
      return <p className="fs-5mt-3">No document created yet...</p>;
    } else {
      return (
        <div className="documents-list-container">
          <div className="documents-list">
            {documents.map((document, index) => (
              <div
                key={index}
                className="border border-secondary-subtle rounded mb-3 p-4 d-flex justify-content-between"
              >
                <div>
                  {index + 1}. {document.title}
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

                <div className="d-flex align-items-center">
                  <FaTrashAlt
                    className="trash-icon"
                    onClick={() => {
                      setDeleteItem({ type: "document", id: document.id });
                      setConfirmDeleteModal(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const renderVideos = () => {
    if (videos.length === 0) {
      return <p className="fs-5mt-3">No video created yet...</p>;
    } else {
      return (
        <div className="videos-list-container">
          <div className="videos-list">
            {videos.map((video, index) => (
              <div
                key={index}
                className="border border-secondary-subtle rounded mb-3 p-4 d-flex justify-content-between"
              >
                <div>
                  {index + 1}. {video.title}
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

                <div className="d-flex align-items-center">
                  <FaTrashAlt
                    className="trash-icon"
                    onClick={() => {
                      setDeleteItem({ type: "video", id: video.id });
                      setConfirmDeleteModal(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const renderContent = () => {
    switch (selectedType) {
      case "quizzes":
        return (
          <Quizzes handleViewQuiz={handleViewQuiz} setShowBar={setShowBar} />
        );
      case "documents":
        return (
          <div className="p-5">
            <div className="quizzes-title-container">
              <span className="quizzes-title">Documents</span>
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                + Add
              </button>
            </div>
            {renderDocuments()}
          </div>
        );
      case "videos":
        return (
          <div className="p-5">
            <div className="quizzes-title-container">
              <span className="quizzes-title">Videos</span>
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                + Add
              </button>
            </div>
            {renderVideos()}
          </div>
        );
      default:
        return null;
    }
  };

  const handleViewQuiz = () => {
    setSidebarVisible(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setDocumentTitle("");
    setDocumentFile(null);
    setVideoTitle("");
    setVideoUrl("");
  };

  const handleDocumentUpload = async () => {
    try {
      const documentRef = ref(imageDb, `documents/${documentFile.name}`);

      await uploadBytes(documentRef, documentFile);

      const documentDownloadURL = await getDownloadURL(documentRef);

      await axios.post("/add-document", {
        title: documentTitle,
        url: documentDownloadURL,
      });

      alert("Document added successfully!");
      handleModalClose();
      setSelectedType("quizzes");
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const handleAddVideo = async () => {
    await axios.post("/add-video", {
      title: videoTitle,
      url: videoUrl,
    });
    alert("Video added successfully!");
    handleModalClose();
    setSelectedType("quizzes");
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteItem.type === "document") {
        await axios.delete(`/delete-document/${deleteItem.id}`);
        alert("Document deleted successfully!");
        fetchDocuments();
      } else if (deleteItem.type === "video") {
        await axios.delete(`/delete-video/${deleteItem.id}`);
        alert("Video deleted successfully!");
        fetchVideos(); // Refetch videos after deletion
      }
      setConfirmDeleteModal(false); // Close the confirmation modal after deletion
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="container mt-5">
      <Modal
        show={confirmDeleteModal}
        onHide={() => setConfirmDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this {deleteItem?.type}?
        </Modal.Body>
        <Modal.Footer>
          <button
            class="btn btn-outline-primary"
            onClick={() => setConfirmDeleteModal(false)}
          >
            Cancel
          </button>
          <button class="btn btn-outline-danger" onClick={handleConfirmDelete}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedType === "documents"
              ? "Add New Document"
              : "Add New Video"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedType === "documents" ? (
            <div>
              <div className="mb-3">
                <label htmlFor="documentTitle" className="form-label">
                  Document Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="documentTitle"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="documentFile" className="form-label">
                  Upload Document
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="documentFile"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label htmlFor="videoTitle" className="form-label">
                  Video Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="videoTitle"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="videoUrl" className="form-label">
                  Video URL
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={
              selectedType === "documents"
                ? handleDocumentUpload
                : handleAddVideo
            }
          >
            {selectedType === "documents" ? "Upload Document" : "Add Video"}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="bg-white p-5 border border-black rounded h-100">
            <div className="course-title">
              <span className="fs-1 fw-medium">Activities</span>
              <div className="course-title-decoration"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="bg-white p-5 border border-black rounded h-100 vh-100">
            {sidebarVisible && (
              <div className="activities-sidebar">
                <span className="activities-sidebar-header fs-5 fw-medium">
                  Activity Types
                </span>
                <ul>
                  <li
                    onClick={() => {
                      setSelectedType("quizzes");
                      setSidebarVisible(true);
                    }}
                    className={selectedType === "quizzes" ? "selected" : ""}
                  >
                    Quizzes
                  </li>
                  <li
                    onClick={() => {
                      setSelectedType("documents");
                      setSidebarVisible(true);
                    }}
                    className={selectedType === "documents" ? "selected" : ""}
                  >
                    Documents
                  </li>
                  <li
                    onClick={() => {
                      setSelectedType("videos");
                      setSidebarVisible(true);
                    }}
                    className={selectedType === "videos" ? "selected" : ""}
                  >
                    Videos
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-9 mb-4">
          <div className="bg-white border border-black rounded h-100 vh-100">
            <div className="activities-content">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;
