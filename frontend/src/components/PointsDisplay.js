import React, { useState, useEffect } from "react";
import { FaCrown } from "react-icons/fa";
import "./PointsDisplay.css";

const PointsDisplay = ({ currentPoints }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="points-container border rounded-pill"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`points-icon ${hovered ? "hovered" : ""}`}>
        <FaCrown />
      </div>
      <div className={`points-value ${hovered ? "hovered" : ""}`}>
        {currentPoints}pts
      </div>
    </div>
  );
};

export default PointsDisplay;
