import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import GoldMedal from "../img/gold-medal.png";
import SilverMedal from "../img/silver-medal.png";
import BronzeMedal from "../img/bronze-medal.png";

export default function Profiles({ userId }) {
  const [leaderboards, setLeaderboards] = useState([]);
  const [userRank, setUserRank] = useState(null); // State to store user's rank

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get("/get-leaderboard"); // Adjust the endpoint as per your backend setup
        const leaderboardData = response.data;
        setLeaderboards(leaderboardData);

        const userIndex = leaderboardData.findIndex(
          (item) => item.id === userId
        );
        setUserRank(userIndex !== -1 ? userIndex + 1 : null); // Add 1 to convert index to rank, set to null if user not found
        setUserRank(userIndex !== -1 ? userIndex + 1 : null); // Add 1 to convert index to rank, set to null if user not found
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div id="profile">
      {userRank !== null && (
        <div className="flex user-rank-container">
          <div className="user-rank-bar">Your Rank : {userRank}</div>
        </div>
      )}
      {leaderboards.map((leaderboard, index) => (
        <div className="flex" key={index}>
          {index === 0 && (
            <img src={GoldMedal} alt="Gold Medal" className="gold-medal" />
          )}
          {index === 1 && (
            <img
              src={SilverMedal}
              alt="Silver Medal"
              className="silver-medal"
            />
          )}
          {index === 2 && (
            <img
              src={BronzeMedal}
              alt="Bronze Medal"
              className="bronze-medal"
            />
          )}
          {index >= 3 && <div className="place-index">{index + 1}</div>}
          <div className="item">
            <div className="info">
              <div className="avatar">
                <img
                  src={leaderboard.avatar}
                  alt="Avatar"
                  className="avatar-img"
                />
              </div>
              <div className="details">
                <span className="fs-5 fw-medium">{leaderboard.username}</span>
                <span className="email">{leaderboard.email}</span>
              </div>
            </div>
          </div>

          <div
            className="score"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "130px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="board-pts">Level</span>
              <span className="me-1" style={{ minWidth: "40px" }}>
                {leaderboard.level}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
