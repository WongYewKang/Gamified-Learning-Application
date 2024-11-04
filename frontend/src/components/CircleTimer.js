import React, { useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./CircleTimer.css"; // Replace with your actual stylesheet path

const RenderTime = ({ remainingTime }) => {
  const currentTime = useRef(remainingTime);
  const prevTime = useRef(null);
  const isNewTimeFirstTick = useRef(false);
  const [, setOneLastRerender] = useState(0);

  if (currentTime.current !== remainingTime) {
    isNewTimeFirstTick.current = true;
    prevTime.current = currentTime.current;
    currentTime.current = remainingTime;
  } else {
    isNewTimeFirstTick.current = false;
  }

  // force one last re-render when the time is over to trigger the last animation
  if (remainingTime === 0) {
    setTimeout(() => {
      setOneLastRerender((val) => val + 1);
    }, 20);
  }

  const isTimeUp = isNewTimeFirstTick.current;

  return (
    <div className="time-wrapper">
      <div key={remainingTime} className={`time ${isTimeUp ? "up" : ""}`}>
        {remainingTime === 3 && <div className="timer-text">Ready</div>}
        {remainingTime === 2 && <div className="timer-text">Set</div>}
        {remainingTime <= 1 && <div className="timer-text">Go!</div>}
        <div className="timer-countdown">
          {remainingTime === 3 && (
            <span style={{ fontSize: "40px", color: "#00d084" }}>
              {remainingTime}
            </span>
          )}
          {remainingTime === 2 && (
            <span style={{ fontSize: "40px", color: "#fccb00" }}>
              {remainingTime}
            </span>
          )}
          {remainingTime <= 1 && (
            <span style={{ fontSize: "40px", color: "#f44e3b" }}>
              {remainingTime}
            </span>
          )}
          <div style={{ fontSize: "20px", color: "white" }}>seconds</div>
        </div>
      </div>

      {prevTime.current !== null && (
        <div
          key={prevTime.current}
          className={`time ${!isTimeUp ? "down" : ""}`}
        >
          {prevTime.current}
        </div>
      )}
    </div>
  );
};

const CircleTimer = () => {
  return (
    <CountdownCircleTimer
      isPlaying
      duration={3}
      colors={["#00d084", "#00d084", "#fccb00", "#f44e3b"]} // Green, Yellow, Red
      colorsTime={[3, 2, 1, 0]} // Corresponding times for each color
    >
      {RenderTime}
    </CountdownCircleTimer>
  );
};

export default CircleTimer;
