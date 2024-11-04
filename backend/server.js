const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("./axios");

const port = 3500;
const app = express();
const secretKey = "ykykyk";
app.use(express.static("uploads"));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [loginResult] = await db.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (loginResult.length > 0) {
      const user = loginResult[0];
      const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "1h" });
      return res.json({
        id: user.id,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error processing login results:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const [usersData] = await db.execute("SELECT * FROM users");

    res.status(200).json(usersData); // Send the user data as a JSON response
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Send an error response if something goes wrong
  }
});

app.get("/get-action-logs/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [logsData] = await db.execute(
      "SELECT * FROM action_logs WHERE user_id = ? ORDER BY time DESC",
      [userId]
    );

    res.status(200).json(logsData); // Send the user data as a JSON response
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Send an error response if something goes wrong
  }
});

app.get("/get-student-tracking/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetching data from the database
    const [isLevelUpData] = await db.execute(
      "SELECT is_level_up, level FROM level_tracking WHERE user_id = ?",
      [userId]
    );

    const [levelTrackingData] = await db.execute(
      "SELECT level FROM users WHERE id = ?",
      [userId]
    );

    const [pointTrackingData] = await db.execute(
      "SELECT total_points FROM users WHERE id = ?",
      [userId]
    );

    const [correctAnsTrackingData] = await db.execute(
      "SELECT correct_answer_number FROM summary WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({
      isLevelUp: isLevelUpData[0].is_level_up,
      level: isLevelUpData[0].level,
      currentLevel: levelTrackingData[0].level,
      totalPoints: pointTrackingData[0].total_points,
      correctAnswers: correctAnsTrackingData[0].correct_answer_number,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" }); // Send an error response if something goes wrong
  }
});

app.post("/award-badges/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { levelBadge, pointBadge, correctAnsBadge } = req.body;

    let badgesInserted = false; // Initialize variable to track badge insertion

    // Award badges and update badgesInserted variable accordingly
    badgesInserted =
      (await awardUniqueBadgesToUser(userId, levelBadge)) || badgesInserted;
    badgesInserted =
      (await awardUniqueBadgesToUser(userId, pointBadge)) || badgesInserted;
    badgesInserted =
      (await awardUniqueBadgesToUser(userId, correctAnsBadge)) ||
      badgesInserted;

    res
      .status(200)
      .json({ message: "Badges awarded successfully", badgesInserted });
  } catch (error) {
    console.error("Error awarding badges:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

async function awardUniqueBadgesToUser(userId, badges) {
  let badgeInserted = false; // Variable to track if any badge was inserted

  for (const badge of badges) {
    // Check if the user already has the badge
    const badgeExists = await isBadgeAwarded(userId, badge);
    if (!badgeExists) {
      // If the badge is not awarded yet, insert it into the user_badge table
      await db.execute(
        "INSERT INTO user_badge (user_id, badge_id) VALUES (?, ?)",
        [userId, badge]
      );
      badgeInserted = true; // Set badgeInserted to true if badge was inserted
    }
  }

  return badgeInserted; // Return the status of badge insertion
}

async function isBadgeAwarded(userId, badgeId) {
  const [rows] = await db.execute(
    "SELECT * FROM user_badge WHERE user_id = ? AND badge_id = ?",
    [userId, badgeId]
  );
  return rows.length > 0;
}

app.get("/get-user-badges/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Query the database to get the badge URLs and descriptions for the user
    const [userBadges] = await db.query(
      "SELECT badge_id FROM user_badge WHERE user_id = ?",
      [userId]
    );
    console.log(userBadges);

    const badges = [];

    for (const userBadge of userBadges) {
      const [retrievedBadges] = await db.query(
        "SELECT badge_url, badge_desc FROM badges WHERE id = ?",
        [userBadge.badge_id]
      );

      if (retrievedBadges.length > 0) {
        const { badge_url, badge_desc } = retrievedBadges[0];
        badges.push({ badge_url, badge_desc });
      }
    }

    res.json({ userBadges: badges });
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const [userCountRows] = await db.execute(
      "SELECT COUNT(*) AS count FROM users WHERE is_student = 1"
    );
    const userCount = userCountRows[0].count;

    let leaderboardRanking = null;
    if (role === "1") {
      leaderboardRanking = userCount + 1;
    }

    const [rows, fields] = await db.execute(
      "INSERT INTO users (username, email, password, is_student, total_points, current_points, avatar_id, leaderboard_ranking, level, level_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [username, email, password, role, 0, 0, 1, leaderboardRanking, 0, 0]
    );

    const [newUserRow] = await db.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    const newUser = newUserRow[0].id;

    await db.execute(
      "INSERT INTO time_ranking (user_id, time, ranking) VALUES (?, CURRENT_TIMESTAMP(), ?)",
      [newUser, leaderboardRanking]
    );

    await db.execute(
      "INSERT INTO level_tracking (user_id, is_level_up, level) VALUES (?, ?, ?)",
      [newUser, 0, 0]
    );

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [userRows, userFields] = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length > 0) {
      const user = userRows[0];

      // Extract avatar ID from user data
      const avatarId = user.avatar_id;

      // Query avatar table to get image URL based on avatar ID
      const [avatarRows, avatarFields] = await db.execute(
        "SELECT * FROM avatars WHERE id = ?",
        [avatarId]
      );

      if (avatarRows.length > 0) {
        const avatar = avatarRows[0];
        const userDetails = {
          id: user.id,
          username: user.username,
          email: user.email,
          isStudent: user.is_student,
          totalPoints: user.total_points,
          currentPoints: user.current_points,
          avatar: avatar.image_url, // Assuming 'url' is the column name in the avatar table storing the image URL
        };

        res.status(200).json(userDetails);
      } else {
        res.status(404).json({ message: "Avatar not found for the user" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password } = req.body;

    await db.execute(
      "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?",
      [username, email, password, userId]
    );

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-participated-course-number/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [userRows, userFields] = await db.execute(
      "SELECT COUNT(*) AS count FROM student_course WHERE user_id = ?",
      [userId]
    );

    const count = userRows[0].count;
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-avatars/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch avatars of type 0
    const [typeZeroAvatars] = await db.execute(
      "SELECT * FROM avatars WHERE type = 0"
    );

    // Fetch avatars purchased by the user
    const [userPurchasedAvatars] = await db.execute(
      "SELECT ua.avatar_id, a.* FROM user_avatar ua JOIN avatars a ON ua.avatar_id = a.id WHERE ua.user_id = ?",
      [userId]
    );

    // Concatenate the two arrays to get all avatars
    const avatars = [...typeZeroAvatars, ...userPurchasedAvatars];

    if (avatars.length > 0) {
      res.status(200).json(avatars); // Return all avatars
    } else {
      res.status(404).json({ message: "Avatar data not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-leaderboard", async (req, res) => {
  try {
    const [userRows, userFields] = await db.execute(
      "SELECT u.id, u.username, u.email, u.is_student, u.level, a.image_url AS avatar FROM users u LEFT JOIN avatars a ON u.avatar_id = a.id WHERE u.is_student = 1 ORDER BY u.level DESC, u.level_points DESC"
    );

    if (userRows.length > 0) {
      const userDetails = userRows.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        isStudent: user.is_student,
        level: user.level,
        avatar: user.avatar,
      }));

      res.status(200).json(userDetails);
    } else {
      res.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/update-avatar/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { avatarId } = req.body;

  try {
    await db.execute("UPDATE users SET avatar_id = ? WHERE id = ?", [
      avatarId,
      userId,
    ]);
    res.status(200).json({ message: "Avatar updated successfully" });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-points/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows, fields] = await db.execute(
      "SELECT current_points, avatar_id, level, level_points FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length > 0) {
      const currentPoints = rows[0].current_points;
      const avatarId = rows[0].avatar_id;
      const level = rows[0].level;
      const levelPoints = rows[0].level_points;

      // Query avatar table to get image URL based on avatar ID
      const [avatarRows, avatarFields] = await db.execute(
        "SELECT * FROM avatars WHERE id = ?",
        [avatarId]
      );

      if (avatarRows.length > 0) {
        const imageUrl = avatarRows[0].image_url;
        res.status(200).json({ currentPoints, imageUrl, level, levelPoints });
      } else {
        res.status(404).json({ message: "Avatar not found" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Example endpoint for fetching quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    // Fetch quiz data from the database
    const [rows, fields] = await db.execute("SELECT * FROM quizzes");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/courses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows, fields] = await db.execute(
      `
      SELECT 
        courses.*,
        COALESCE(qc_counts.activity_count, 0) AS quiz_activity_count,
        COALESCE(dc_counts.activity_count, 0) AS document_activity_count,
        COALESCE(vc_counts.activity_count, 0) AS video_activity_count,
        COALESCE(qc_counts.activity_count, 0) + COALESCE(dc_counts.activity_count, 0) + COALESCE(vc_counts.activity_count, 0) AS total_activity_count,
        CASE WHEN student_course.user_id IS NULL THEN 'Not Participated' ELSE 'Participated' END AS participate_status
      FROM 
          courses
      LEFT JOIN 
          (SELECT course_id, COUNT(*) AS activity_count FROM course_quiz GROUP BY course_id) AS qc_counts ON courses.id = qc_counts.course_id
      LEFT JOIN 
          (SELECT course_id, COUNT(*) AS activity_count FROM course_document GROUP BY course_id) AS dc_counts ON courses.id = dc_counts.course_id
      LEFT JOIN 
          (SELECT course_id, COUNT(*) AS activity_count FROM course_video GROUP BY course_id) AS vc_counts ON courses.id = vc_counts.course_id
      LEFT JOIN 
          student_course ON courses.id = student_course.course_id AND student_course.user_id = ?
      ORDER BY
          courses.title ASC;  
    `,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching courses with activities:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update your server code to include this endpoint
app.get("/api/questions/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const [rows, fields] = await db.execute(
      `SELECT
                Quizzes.id AS quiz_id,
                Quizzes.title AS quiz_title,
                Quizzes.desc AS quiz_desc,
                Quizzes.create_date AS quiz_create_date,
                Quizzes.image_url AS quiz_image_url,
                Quizzes.opr AS quiz_opr,
                Questions.id,
                Questions.title,
                Questions.ans_1,
                Questions.ans_2,
                Questions.ans_3,
                Questions.ans_4,
                Questions.image_url AS image_url,
                Questions.difficulty AS difficulty,
                Questions.correct_ans as correct_answer,
                Questions.quiz_id
            FROM
                Quizzes
            JOIN
                Questions ON Quizzes.id = Questions.quiz_id
            WHERE
                Quizzes.id = ?`,
      [quizId]
    );

    if (rows.length > 0) {
      const questions = rows;
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "No questions found for the quiz" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello, this is the root path!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/api/image-id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id FROM images");
    if (rows.length > 0) {
      const imageIds = rows.map((row) => row.id);
      res.status(200).json({ imageIds });
    } else {
      res.status(404).json({ message: "No image IDs found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-summary/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.execute("SELECT * FROM summary WHERE user_id = ?", [
      userId,
    ]);
    if (rows.length > 0) {
      const summaryData = rows[0]; // Assuming only one row per user
      res.status(200).json({ summaryData });
    } else {
      res.status(404).json({ message: "Summary data not found for the user" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-summary", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM summary");
    res.json(rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-time-ranking/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.execute(
      "SELECT * FROM time_ranking WHERE user_id = ?",
      [userId]
    );
    if (rows.length > 0) {
      res.status(200).json({ timeRankingData: rows }); // Return all rows for the user
    } else {
      res
        .status(404)
        .json({ message: "Time ranking data not found for the user" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-time-correct-ans/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.execute(
      "SELECT * FROM time_correct_ans WHERE user_id = ?",
      [userId]
    );
    if (rows.length > 0) {
      res.status(200).json({ timeCorrectAnsData: rows }); // Return all rows for the user
    } else {
      res
        .status(404)
        .json({ message: "Time correct answer data not found for the user" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-time-attempts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.execute(
      "SELECT * FROM time_attempts WHERE user_id = ?",
      [userId]
    );
    if (rows.length > 0) {
      res.status(200).json({ timeAttemptsData: rows }); // Return all rows for the user
    } else {
      res
        .status(404)
        .json({ message: "Time correct answer data not found for the user" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.execute("SELECT * FROM summary WHERE user_id = ?", [
      userId,
    ]);
    if (rows.length > 0) {
      const summaryData = rows[0]; // Assuming only one row per user
      console.log(summaryData);
      res.status(200).json({ summaryData });
    } else {
      res.status(404).json({ message: "Summary data not found for the user" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/add-quiz", async (req, res) => {
  try {
    const { title, desc, create_date, image_url, opr, questions } = req.body;
    console.log(req.body);

    // Create the quiz
    const [quizResult] = await db.execute(
      "INSERT INTO quizzes (title, `desc`, create_date, image_url, opr) VALUES (?, ?, ?, ?, ?)",
      [title, desc, create_date, image_url, opr]
    );

    const quizId = quizResult.insertId;

    await Promise.all(
      questions.map(async (question) => {
        await db.execute(
          "INSERT INTO questions (title, ans_1, ans_2, ans_3, ans_4, difficulty, correct_ans, image_url, quiz_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            question.question_text,
            question.ans_1,
            question.ans_2,
            question.ans_3,
            question.ans_4,
            question.difficulty,
            question.correct_answer,
            question.image_url,
            quizId,
          ]
        );
      })
    );

    res.status(200).json({
      success: true,
      message: "Quiz and questions added successfully",
    });
  } catch (error) {
    console.error("Error adding quiz and questions:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.post("/api/participate-course", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Inserting into student_course table
    await db.execute(
      "INSERT INTO student_course (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );

    // Checking if the user exists in the summary table
    const [selectedRows] = await db.execute(
      "SELECT * FROM summary WHERE user_id = ?",
      [userId]
    );

    if (selectedRows.length > 0) {
      // If the user exists, update the participated_course_number
      await db.execute(
        "UPDATE summary SET participated_course_number = participated_course_number + 1 WHERE user_id = ?",
        [userId]
      );
    } else {
      await db.execute(
        "INSERT INTO summary (user_id, participated_course_number, correct_answer_number, wrong_answer_number, attempted_question_number, highest_point, time_used, total_time) VALUES (?, 1, 0, 0, 0, 0, 0, 0)",
        [userId]
      );
    }

    await db.execute(
      "INSERT INTO action_logs (user_id, time, event, course_id) VALUES (?, NOW(), ?, ?)",
      [userId, "Participate In Course", courseId]
    );

    res.status(200).json({
      success: true,
      message: "Participated in course successfully",
    });
  } catch (error) {
    console.error("Error participating in course:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.post("/submit-answer", async (req, res) => {
  try {
    const { userId, courseId, quizId, questionId, answer, points } = req.body;

    const [existingAnswerRows] = await db.execute(
      "SELECT * FROM quiz_answer WHERE user_id = ? AND course_id = ? AND quiz_id = ? AND question_id = ?",
      [userId, courseId, quizId, questionId]
    );

    if (existingAnswerRows.length > 0) {
      await db.execute(
        "INSERT INTO quiz_answer (time, user_id, course_id, quiz_id, question_id, selected_answer, points, attempt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          0,
          userId,
          courseId,
          quizId,
          questionId,
          answer,
          points,
          existingAnswerRows[0].attempt + 1,
        ]
      );
    } else {
      await db.execute(
        "INSERT INTO quiz_answer (time, user_id, course_id, quiz_id, question_id, selected_answer, points, attempt) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
        [0, userId, courseId, quizId, questionId, answer, points]
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Answer submitted successfully" });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/update-chart-data", async (req, res) => {
  try {
    const {
      userId,
      totalPoints,
      correctAnswers,
      totalQuestions,
      currentTimeUsed,
    } = req.body;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    const [timeCorrectRow] = await db.execute(
      "SELECT * FROM time_correct_ans WHERE user_id = ? and time = ?",
      [userId, currentDate]
    );

    if (timeCorrectRow.length === 0) {
      await db.execute(
        "INSERT INTO time_correct_ans (user_id, time, correct_question_number, total_attempted_question) VALUES (?, ?, ?, ?)",
        [userId, currentDate, correctAnswers, totalQuestions]
      );
    } else {
      await db.execute(
        "UPDATE time_correct_ans SET correct_question_number = correct_question_number + ?, total_attempted_question = total_attempted_question + ? WHERE user_id = ? AND time = ?",
        [correctAnswers, totalQuestions, userId, currentDate]
      );
    }

    const [timeAttemptsRow] = await db.execute(
      "SELECT * FROM time_attempts WHERE user_id = ? and time = ?",
      [userId, currentTimeUsed]
    );

    if (timeAttemptsRow.length === 0) {
      await db.execute(
        "INSERT INTO time_attempts (user_id, time, attempted_number) VALUES (?, ?, ?)",
        [userId, currentTimeUsed, totalQuestions]
      );
    } else {
      await db.execute(
        "UPDATE time_attempts SET attempted_number = attempted_number + ? WHERE user_id = ? AND time = ?",
        [totalQuestions, userId, currentTimeUsed]
      );
    }

    const retrievedTotalPoints = await db.execute(
      "SELECT total_points FROM users WHERE id = ?",
      [userId]
    );

    const retrievedCurrentPoints = await db.execute(
      "SELECT current_points FROM users WHERE id = ?",
      [userId]
    );

    if (retrievedTotalPoints.length > 0 && retrievedCurrentPoints.length > 0) {
      const previousTotalPoints = retrievedTotalPoints[0][0].total_points;
      const newTotalPoints = previousTotalPoints + totalPoints;
      const previousCurrentPoints = retrievedCurrentPoints[0][0].current_points;
      const newCurrentPoints = previousCurrentPoints + totalPoints;
      const levelPoints = Math.ceil(totalPoints / 2);

      await db.execute(
        "UPDATE users SET total_points = ?, current_points = ?, level_points = level_points + ? WHERE id = ?",
        [newTotalPoints, newCurrentPoints, levelPoints, userId]
      );

      await axios.post("http://localhost:3500/update-ranking");

      res.status(200).json();
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/insert-answer-quiz-action-log", async (req, res) => {
  try {
    const { userId, courseId, quizId } = req.body;
    await db.execute(
      "INSERT INTO action_logs (user_id, time, event, course_id, quiz_id) VALUES (?, NOW(), ?, ?, ?)",
      [userId, "Start Answering Quiz", courseId, quizId]
    );
  } catch (error) {
    console.error("Error inserting action log:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/update-ranking", async (req, res) => {
  try {
    const [students] = await db.execute(
      "SELECT id, level_points, level FROM users WHERE is_student = 1 ORDER BY level_points DESC"
    );

    // Process level_points and level for each user
    for (let i = 0; i < students.length; i++) {
      const userId = students[i].id;
      let levelPoints = students[i].level_points;
      let level = students[i].level;

      // Subtract 100 from level_points and increment level by 1 until level_points is less than 100
      while (levelPoints >= 100) {
        levelPoints -= 100;
        level += 1;
      }

      // Update user's level_points and level in the database
      await db.execute(
        "UPDATE users SET level_points = ?, level = ? WHERE id = ?",
        [levelPoints, level, userId]
      );
    }

    // Update ranking based on level
    const [updatedStudents] = await db.execute(
      "SELECT id, level FROM users WHERE is_student = 1 ORDER BY level DESC"
    );

    for (let i = 0; i < updatedStudents.length; i++) {
      const userId = updatedStudents[i].id;
      const newRanking = i + 1;
      const student = students.find((student) => student.id === userId);
      const updatedStudent = updatedStudents.find(
        (student) => student.id === userId
      );
      const isStudentLevelUp = updatedStudent.level !== student.level ? 1 : 0;
      await db.execute(
        "UPDATE users SET leaderboard_ranking = ? WHERE id = ?",
        [newRanking, userId]
      );

      await db.execute(
        "INSERT INTO time_ranking (user_id, time, ranking) VALUES (?, CURRENT_TIMESTAMP(), ?)",
        [userId, newRanking]
      );

      if (isStudentLevelUp == 1) {
        await db.execute(
          "UPDATE level_tracking SET is_level_up = 1, level = ? WHERE user_id = ?",
          [updatedStudent.level, userId]
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Leaderboard and summary table updated successfully",
    });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/reset-level-tracking", async (req, res) => {
  try {
    await db.execute("UPDATE level_tracking SET is_level_up = 0, level = 0");

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating level tracking:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/update-summary", async (req, res) => {
  try {
    const {
      userId,
      quizId,
      correctAnswers,
      wrongAnswers,
      totalQuestions,
      totalPoints,
      timeUsed,
      totalTime,
    } = req.body;

    const [existingSummary] = await db.execute(
      "SELECT * FROM summary WHERE user_id = ?",
      [userId]
    );

    if (existingSummary.length === 0) {
      await db.execute(
        "INSERT INTO summary (user_id, correct_answer_number, wrong_answer_number, attempted_question_number, highest_point, time_used, total_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          userId,
          correctAnswers,
          wrongAnswers,
          totalQuestions,
          totalPoints,
          timeUsed,
          totalTime,
        ]
      );
    } else {
      const currentHighestPoint = existingSummary[0].highest_point;
      if (totalPoints > currentHighestPoint) {
        await db.execute(
          "UPDATE summary SET correct_answer_number = correct_answer_number + ?, wrong_answer_number = wrong_answer_number + ?, attempted_question_number = attempted_question_number + ?, highest_point = ?, time_used = time_used + ?, total_time = total_time + ? WHERE user_id = ?",
          [
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            totalPoints,
            timeUsed,
            totalTime,
            userId,
          ]
        );
      } else {
        await db.execute(
          "UPDATE summary SET correct_answer_number = correct_answer_number + ?, wrong_answer_number = wrong_answer_number + ?, attempted_question_number = attempted_question_number + ?, time_used = time_used + ?, total_time = total_time + ? WHERE user_id = ?",
          [
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            timeUsed,
            totalTime,
            userId,
          ]
        );
      }
    }

    await db.execute(
      "INSERT INTO action_logs (user_id, time, event, quiz_id, correct_ans, wrong_ans) VALUES (?, NOW(), ?, ?, ?, ?)",
      [userId, "Completed Quiz", quizId, correctAnswers, wrongAnswers]
    );

    await db.execute(
      "UPDATE quiz_answer SET time = NOW() WHERE user_id = ? AND quiz_id = ? AND time = '0'",
      [userId, quizId]
    );

    res
      .status(200)
      .json({ success: true, message: "Summary updated successfully" });
  } catch (error) {
    console.error("Error updating summary:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/api/delete-answer", async (req, res) => {
  try {
    const { userId, courseId, quizId } = req.body;

    console.log(userId, courseId, quizId);

    const [existingAnswerRows] = await db.execute(
      "SELECT * FROM quiz_answer WHERE user_id = ? AND course_id = ? AND quiz_id = ?",
      [userId, courseId, quizId]
    );

    if (existingAnswerRows.length > 0) {
      await db.execute(
        "DELETE FROM quiz_answer WHERE user_id = ? AND course_id = ? AND quiz_id = ?",
        [userId, courseId, quizId]
      );
    }

    res.status(200).json({
      success: true,
      message: "Quiz answer submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/api/student-courses", async (req, res) => {
  try {
    const { userId } = req.query;

    const [rows, fields] = await db.execute(
      `
      SELECT 
        courses.*,
        COUNT(DISTINCT course_quiz.id) AS activity_number
      FROM 
        courses
      LEFT JOIN 
        course_quiz ON courses.id = course_quiz.course_id
      LEFT JOIN 
        student_course ON courses.id = student_course.course_id
      WHERE 
        student_course.user_id = ?
      GROUP BY 
        courses.id;
    `,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching courses with activities:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update the endpoint for updating quizzes and questions
app.put("/api/update-quiz/:quizId", async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { title, desc, image_url, questions } = req.body;

    // Update quiz details
    await db.execute(
      "UPDATE quizzes SET title = ?, `desc` = ?, image_url = ? WHERE id = ?",
      [title, desc, image_url, quizId]
    );

    await Promise.all(
      questions.map(async (question) => {
        if (question.id) {
          // Check if the question ID exists in the database
          const [existingQuestionRows] = await db.execute(
            "SELECT id FROM questions WHERE id = ?",
            [question.id]
          );

          if (existingQuestionRows.length > 0) {
            // If the question ID exists, update the existing row
            await db.execute(
              "UPDATE questions SET title = ?, ans_1 = ?, ans_2 = ?, ans_3 = ?, ans_4 = ?, difficulty = ?, correct_ans = ?, image_url = ? WHERE id = ?",
              [
                question.title,
                question.ans_1,
                question.ans_2,
                question.ans_3,
                question.ans_4,
                question.difficulty,
                question.correct_answer,
                question.image_url,
                question.id,
              ]
            );
          } else {
            // If the question ID does not exist, insert a new row
            const [insertResult] = await db.execute(
              "INSERT INTO questions (title, ans_1, ans_2, ans_3, ans_4, difficulty, correct_ans, image_url, quiz_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                question.title,
                question.ans_1,
                question.ans_2,
                question.ans_3,
                question.ans_4,
                question.difficulty,
                question.correct_answer,
                question.image_url,
                quizId,
              ]
            );
            question.id = insertResult.insertId; // Assign the new question ID
          }
        } else {
          // If the question ID is null, insert a new row
          const [insertResult] = await db.execute(
            "INSERT INTO questions (title, ans_1, ans_2, ans_3, ans_4, difficulty, correct_ans, image_url, quiz_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              question.title,
              question.ans_1,
              question.ans_2,
              question.ans_3,
              question.ans_4,
              question.difficulty,
              question.correct_answer,
              question.image_url,
              quizId,
            ]
          );
          question.id = insertResult.insertId; // Assign the new question ID
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Quiz and questions updated successfully",
    });
  } catch (error) {
    console.error("Error updating quiz and questions:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/api/get-latest-question-id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT MAX(id) as latestId FROM questions"
    );

    if (rows.length > 0 && rows[0].latestId !== null) {
      const latestId = rows[0].latestId + 1;
      console.log(latestId);
      res.status(200).json({ latestId });
    } else {
      res.status(200).json({ latestId: 1 });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Backend code
app.post("/api/save-course", async (req, res) => {
  try {
    const {
      courseTitle,
      courseDesc,
      addedQuizzes,
      addedDocuments,
      addedVideos,
      username,
    } = req.body;
    console.log(courseTitle, courseDesc);

    const [courseResult] = await db.execute(
      "INSERT INTO courses (title, `desc`, create_date, opr, participant) VALUES (?, ?, NOW(), ?, ?)",
      [courseTitle, courseDesc, username, 0]
    );
    const courseId = courseResult.insertId;
    await Promise.all(
      addedQuizzes.map(async (quiz) => {
        await db.execute(
          "INSERT INTO course_quiz (quiz_id, course_id) VALUES (?, ?)",
          [quiz.id, courseId]
        );
      })
    );

    await Promise.all(
      addedDocuments.map(async (document) => {
        await db.execute(
          "INSERT INTO course_document (document_id, course_id) VALUES (?, ?)",
          [document.id, courseId]
        );
      })
    );

    await Promise.all(
      addedVideos.map(async (video) => {
        await db.execute(
          "INSERT INTO course_video (video_id, course_id) VALUES (?, ?)",
          [video.id, courseId]
        );
      })
    );

    res.status(200).json({
      success: true,
      message: "Course saved successfully",
    });
  } catch (error) {
    console.error("Error saving course:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/api/update-course/:courseId", async (req, res) => {
  try {
    const {
      courseId,
      courseDesc,
      courseTitle,
      addedQuizzes,
      addedDocuments,
      addedVideos,
    } = req.body;
    console.log(req.body);

    // Update course title
    await db.execute("UPDATE courses SET title = ?, `desc` = ? WHERE id = ?", [
      courseTitle,
      courseDesc,
      courseId,
    ]);

    // Delete existing course_quiz entries for the course
    await db.execute("DELETE FROM course_quiz WHERE course_id = ?", [courseId]);
    await db.execute("DELETE FROM course_document WHERE course_id = ?", [
      courseId,
    ]);
    await db.execute("DELETE FROM course_video WHERE course_id = ?", [
      courseId,
    ]);

    // Insert updated course_quiz entries
    await Promise.all(
      addedQuizzes.map(async (quiz) => {
        await db.execute(
          "INSERT INTO course_quiz (quiz_id, course_id) VALUES (?, ?)",
          [quiz.id, courseId]
        );
      })
    );

    await Promise.all(
      addedDocuments.map(async (document) => {
        await db.execute(
          "INSERT INTO course_document (document_id, course_id) VALUES (?, ?)",
          [document.id, courseId]
        );
      })
    );

    await Promise.all(
      addedVideos.map(async (video) => {
        await db.execute(
          "INSERT INTO course_video (video_id, course_id) VALUES (?, ?)",
          [video.id, courseId]
        );
      })
    );

    res.status(200).json({
      success: true,
      message: "Course saved successfully",
    });
  } catch (error) {
    console.error("Error saving course:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Backend code
app.get("/api/course-details/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // Fetch course details and associated quizzes from the database
    const [courseDetails] = await db.execute(
      "SELECT * FROM courses WHERE id = ?",
      [courseId]
    );

    const [quizzes] = await db.execute(
      "SELECT q.* FROM quizzes q JOIN course_quiz qc ON q.id = qc.quiz_id WHERE qc.course_id = ?",
      [courseId]
    );

    const [documents] = await db.execute(
      "SELECT d.* FROM documents d JOIN course_document cd ON d.id = cd.document_id WHERE cd.course_id = ?",
      [courseId]
    );

    const [videos] = await db.execute(
      "SELECT q.* FROM videos q JOIN course_video qc ON q.id = qc.video_id WHERE qc.course_id = ?",
      [courseId]
    );

    res.status(200).json({
      success: true,
      courseDetails: courseDetails[0],
      quizzes: quizzes,
      documents: documents,
      videos: videos,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Add this endpoint for deleting a quiz
app.delete("/api/delete-quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    // Check if the quiz exists
    const [quizRows] = await db.execute("SELECT * FROM quizzes WHERE id = ?", [
      quizId,
    ]);

    if (quizRows.length === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Delete the quiz from the quizzes table
    await db.execute("DELETE FROM quizzes WHERE id = ?", [quizId]);

    // Delete associated questions from the questions table
    await db.execute("DELETE FROM questions WHERE quiz_id = ?", [quizId]);

    // Delete quiz associations from the course_quiz table
    await db.execute("DELETE FROM course_quiz WHERE quiz_id = ?", [quizId]);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.delete("/delete-document/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    // Check if the quiz exists
    const [documentRows] = await db.execute(
      "SELECT * FROM documents WHERE id = ?",
      [documentId]
    );

    if (documentRows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the quiz from the quizzes table
    await db.execute("DELETE FROM documents WHERE id = ?", [documentId]);

    // Delete quiz associations from the course_quiz table
    await db.execute("DELETE FROM course_document WHERE document_id = ?", [
      documentId,
    ]);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.delete("/delete-video/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    // Check if the quiz exists
    const [videoRows] = await db.execute("SELECT * FROM videos WHERE id = ?", [
      videoId,
    ]);

    if (videoRows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the quiz from the quizzes table
    await db.execute("DELETE FROM videos WHERE id = ?", [videoId]);

    // Delete quiz associations from the course_quiz table
    await db.execute("DELETE FROM course_video WHERE video_id = ?", [videoId]);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Add this endpoint for deleting a quiz
app.delete("/api/delete-course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    await db.execute("DELETE FROM course_quiz WHERE course_id = ?", [courseId]);
    await db.execute("DELETE FROM courses WHERE id = ?", [courseId]);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/get-course-title/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const [courseTitle] = await db.execute(
      "SELECT title FROM courses WHERE id = ?",
      [courseId]
    );

    res.status(200).json({
      courseTitle,
    });
  } catch (error) {
    console.error("Error fetching course title:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/get-quiz-title-and-answer/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const [quizTitle] = await db.execute(
      "SELECT title FROM quizzes WHERE id = ?",
      [quizId]
    );

    const [courseIdResult] = await db.execute(
      "SELECT course_id FROM course_quiz WHERE quiz_id = ?",
      [quizId]
    );

    if (courseIdResult.length === 0) {
      // Handle case where courseId is not found
      throw new Error("Course ID not found for quiz ID: " + quizId);
    }

    const courseId = courseIdResult[0].course_id;

    const [quizCourseTitleResult] = await db.execute(
      "SELECT title FROM courses WHERE id = ?",
      [courseId]
    );

    if (quizCourseTitleResult.length === 0) {
      // Handle case where quizCourseTitle is not found
      throw new Error("Course title not found for course ID: " + courseId);
    }

    const quizCourseTitle = quizCourseTitleResult[0].title;

    res.status(200).json({
      quizTitle,
      quizCourseTitle,
    });
  } catch (error) {
    console.error("Error fetching quiz title:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/get-user-answer-by-time/:time", async (req, res) => {
  try {
    const { time } = req.params;
    const [userSelectedAnswers] = await db.query(
      "SELECT * FROM quiz_answer WHERE time = ?",
      [time]
    );
    res.json(userSelectedAnswers);
  } catch (error) {
    console.error("Error fetching user selected answers:", error);
    res.status(500).json({ error: "Failed to fetch user selected answers" });
  }
});

app.get("/get-all-student", async (req, res) => {
  try {
    const [studentsData] = await db.query(
      "SELECT * FROM users WHERE is_student = 1"
    );
    res.json(studentsData);
  } catch (error) {
    console.error("Error fetching user selected answers:", error);
    res.status(500).json({ error: "Failed to fetch user selected answers" });
  }
});

app.get("/get-shop-items/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [itemsData] = await db.query(
      `
      SELECT a.*
      FROM avatars a
      LEFT JOIN user_avatar ua ON a.id = ua.avatar_id AND ua.user_id = ?
      WHERE a.type != 0 AND ua.id IS NULL
    `,
      [userId]
    );

    res.json(itemsData);
  } catch (error) {
    console.error("Error fetching shop items:", error);
    res.status(500).json({ error: "Failed to fetch shop items" });
  }
});

app.post("/purchase-item/:userId/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Check if the user has enough points to purchase the item
    const [userPointsRows] = await db.execute(
      "SELECT current_points FROM users WHERE id = ?",
      [userId]
    );

    const userCurrentPoints = userPointsRows[0].current_points;

    const [itemPriceRows] = await db.execute(
      "SELECT price FROM avatars WHERE id = ?",
      [itemId]
    );

    const itemPrice = itemPriceRows[0].price;

    // If the user's current points are less than the item's price, send an error response
    if (userCurrentPoints < itemPrice) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points to purchase the item",
      });
    }

    // Proceed with the purchase if the user has enough points
    await db.execute(
      "INSERT INTO user_avatar (user_id, avatar_id) VALUES (?, ?)",
      [userId, itemId]
    );

    await db.execute(
      "UPDATE users SET current_points = current_points - ? WHERE id = ?",
      [itemPrice, userId]
    );

    res.status(200).json({
      success: true,
      message: "Item purchased successfully",
    });
  } catch (error) {
    console.error("Error purchasing item:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/add-document", async (req, res) => {
  try {
    const { title, url } = req.body;
    console.log(req.body);
    await db.execute(
      "INSERT INTO documents (title, document_url) VALUES (?, ?)",
      [title, url]
    );
    res.status(200).json({
      success: true,
      message: "Document inserted successfully",
    });
  } catch (error) {
    console.error("Error inserting document:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.post("/add-video", async (req, res) => {
  try {
    const { title, url } = req.body;
    console.log(req.body);
    await db.execute("INSERT INTO videos (title, video_url) VALUES (?, ?)", [
      title,
      url,
    ]);
    res.status(200).json({
      success: true,
      message: "Video inserted successfully",
    });
  } catch (error) {
    console.error("Error inserting video:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/get-documents", async (req, res) => {
  try {
    const [documentsData] = await db.query("SELECT * FROM documents");
    res.json(documentsData);
  } catch (error) {
    console.error("Error fetching documents data:", error);
    res.status(500).json({ error: "Failed to fetch documents data" });
  }
});

app.get("/get-videos", async (req, res) => {
  try {
    const [videosData] = await db.query("SELECT * FROM videos");
    res.json(videosData);
  } catch (error) {
    console.error("Error fetching videos data:", error);
    res.status(500).json({ error: "Failed to fetch videos data" });
  }
});
