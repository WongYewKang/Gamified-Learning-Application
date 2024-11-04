import React from "react";
import Board from "../components/Board";
import "./Leaderboard.css";

const Leaderboard = ({ userId }) => {
  return (
    <div className="board-container">
      <Board userId={userId} />
    </div>
  );
};

export default Leaderboard;
