import React, { useEffect, useState } from "react";
import "./Home.css";
import { FaPaperPlane } from "react-icons/fa";
import { IoGameController, IoBulb, IoTrophy } from "react-icons/io5";
import axios from "../api/axios"; // Import axios for making HTTP requests
import { FaCrown } from "react-icons/fa";

const StudentHome = ({ userId, setInAnswerQuiz }) => {
  const [currentLevel, setCurrentLevel] = useState("");
  const [badgesInserted, setBadgesInserted] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [showLevelUpText, setShowLevelUpText] = useState(false);
  const [showAwardBadgeText, setShowAwardBadgeText] = useState(false);

  useEffect(() => {
    const fetchLevelTracking = async () => {
      try {
        // Fetch user tracking data
        const response = await axios.get("/get-student-tracking/" + userId);
        const { isLevelUp, level, currentLevel, totalPoints, correctAnswers } =
          response.data;

        // Update state with fetched data
        setCurrentLevel(level);

        if (isLevelUp === 1) {
          setShowLevelUpText(true);
          setShowOverlay(true);
          setTimeout(() => {
            setShowLevelUpText(false);
            setShowOverlay(false);
          }, 3000);
        }

        const levelBadge = [];
        const pointBadge = [];
        const correctAnsBadge = [];

        if (currentLevel >= 100) {
          levelBadge.push(3);
        } else if (currentLevel >= 50) {
          levelBadge.push(2);
        } else if (currentLevel >= 10) {
          levelBadge.push(1);
        }

        if (totalPoints >= 1500) {
          pointBadge.push(6);
        } else if (totalPoints >= 1000) {
          pointBadge.push(5);
        } else if (totalPoints >= 500) {
          pointBadge.push(4);
        }

        if (correctAnswers >= 100) {
          correctAnsBadge.push(9);
        } else if (correctAnswers >= 50) {
          correctAnsBadge.push(8);
        } else if (correctAnswers >= 10) {
          correctAnsBadge.push(7);
        }

        // Award badges and get the response
        const awardResponse = await axios.post("/award-badges/" + userId, {
          levelBadge,
          pointBadge,
          correctAnsBadge,
        });

        const { badgesInserted } = awardResponse.data;

        setBadgesInserted(badgesInserted);

        if (badgesInserted) {
          setShowAwardBadgeText(true);
          setShowOverlay(true);
          setTimeout(() => {
            setShowAwardBadgeText(false);
            setShowOverlay(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching level tracking data:", error);
      }
    };

    fetchLevelTracking();
    setInAnswerQuiz(false);

    setTimeout(async () => {
      try {
        await axios.post("/reset-level-tracking");
      } catch (error) {
        console.error("Error resetting level tracking:", error);
      }
    }, 3000);
  }, []);

  return (
    <div className="home-container">
      {showOverlay && (
        <div className="home-overlay">
          <div className="home-overlay-content">
            <FaCrown className="home-crown" />
            <h1>Congratulations !</h1>
            {showLevelUpText && (
              <div className="home-overlay-text">
                You have leveled up! Current level:
                <span className="fs-5 text-primary"> {currentLevel}</span>
              </div>
            )}
            {showAwardBadgeText && (
              <div className="home-overlay-award-text">
                You have acquired new badges! Please check your profile.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-12">
          <div className="home-background"></div>
          <div className="home-header">
            <div className="home-header-title">
              GAMIFIED LEARNING APPLICATION
            </div>
            <div className="home-header-text">
              Welcome to our Gamified Learning Application! Embark on an
              exciting educational journey where learning meets play. Our
              innovative platform combines the thrill of gaming with the depth
              of educational content, creating a unique and engaging experience
              for learners of all ages. Whether you're a student seeking to
              enhance your academic skills or an enthusiast eager to explore new
              topics, our Gamified Learning Application is designed to make
              education enjoyable.
            </div>
          </div>
        </div>
      </div>

      <div className="student-home-divisions container-fluid">
        <div className="row">
          <div className="col-1"></div>
          <div className="home-divisions-contents col text-light">
            <IoGameController className="home-game-icon" />
            <div className="home-divisions-title">Gamified Lessons</div>
            <div className="mb-5">
              Acquire knowledge through engaging exercises, challenges, and
              projects meticulously designed by experts in the field of
              education and supported by thorough research.
            </div>
          </div>
          <div className="home-divisions-contents col text-light">
            <IoBulb className="home-bulb-icon" />
            <div className="home-divisions-title">Learning Adventures</div>
            <div className="mb-5">
              Embark on a dynamic learning journey where you actively engage
              with hands-on challenges and real-world scenarios. This immersive
              approach allows you to seamlessly apply acquired knowledge.
            </div>
          </div>
          <div className="home-divisions-contents col text-light">
            <IoTrophy className="home-trophy-icon" />
            <div className="home-divisions-title">Leaderboards</div>
            <div className="mb-5">
              Engage in friendly competition with your fellow learners and
              elevate your position in the rankings by successfully completing
              exercises, overcoming challenges, and mastering projects.
            </div>
          </div>
          <div className="col-1"></div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
