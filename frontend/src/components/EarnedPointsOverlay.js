// EarnedPointsOverlay.jsx
import React from "react";
import "./EarnedPointsOverlay.css"; // Replace with your actual stylesheet path
import CorrectImage from "../img/correct-answer.png";
import IncorrectImage from "../img/incorrect-answer.png";

const EarnedPointsOverlay = ({ earnedPoints, isCorrect }) => (
  <div className="earned-points-overlay">
    <div className="earned-points-message">
      {isCorrect ? (
        <>
          <p
            style={{ color: "#0bb15e", fontSize: "22px" }}
            className="fw-bolder"
          >
            Awesome! You are correct.
          </p>
          <img
            src={CorrectImage}
            alt="Congratulations"
            className="earned-points-image"
          />
          <p style={{ fontSize: "18px" }}>
            You have earned{" "}
            <span style={{ color: "green", fontSize: "25px" }}>
              {earnedPoints}
            </span>{" "}
            points.
          </p>
        </>
      ) : (
        <>
          <p
            style={{ color: "#e74c3c", fontSize: "22px" }}
            className="fw-bolder"
          >
            Oops! You are incorrect.
          </p>
          <img
            src={IncorrectImage}
            alt="Try Again"
            className="earned-points-image"
          />
          <p style={{ fontSize: "18px" }}>Great Try!</p>
        </>
      )}
    </div>
  </div>
);

export default EarnedPointsOverlay;
