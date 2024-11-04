import React, { useState, useEffect } from "react";
import "./Clock.css";

const Clock = (props) => {
  const [countdown, setCountdown] = useState(props.duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        const newCountdown = prevCountdown - 1;

        if (newCountdown <= 0) {
          clearInterval(interval); // Clear the interval when countdown reaches zero
          return 0; // Prevent negative countdown values
        }

        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [props.duration]);

  const countDivision = (props.duration - countdown) / props.duration;
  const degrees = countDivision * 360;
  const secondHalf = countDivision > 0.5 && "mask2";

  return (
    <div className="clock">
      <div
        className="rotator"
        style={{ transform: "rotate(" + degrees + "deg)" }}
      ></div>
      <div className={"mask " + secondHalf}></div>
      <div className="clock-text">
        <p>{countdown}</p>
      </div>
    </div>
  );
};

export default Clock;
