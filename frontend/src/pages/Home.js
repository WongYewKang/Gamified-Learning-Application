import "./Home.css";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { IoGameController, IoBulb, IoTrophy } from "react-icons/io5";
import { FaCrown } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-container">
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
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center fs-5"
              onClick={handleClick}
            >
              <FaPaperPlane className="me-2" /> <span>Get Started</span>
            </button>
          </div>
        </div>
      </div>

      <div className="home-divisions container-fluid">
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

export default Home;
