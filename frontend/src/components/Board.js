import React from "react";
import Profiles from "./Profiles";
import "./Board.css";

export default function Board({ userId }) {
  return (
    <div className="board-container">
      <div className="board">
        <h1 className="fs-1 fw-medium">🏆 Leaderboard 🏆</h1>
        <div className="board-title-decoration"></div>
        <Profiles userId={userId}></Profiles>
      </div>
    </div>
  );
}
