app.post("/api/submit-answer", async (req, res) => {
  try {
    console.log("executed");
    const {
      userId,
      courseId,
      quizId,
      questionId,
      answer,
      lastQues,
      points,
      totalPoints,
      currentTimeUsed,
    } = req.body;

    const [existingAnswerRows] = await db.execute(
      "SELECT * FROM quiz_answer WHERE user_id = ? AND course_id = ? AND quiz_id = ? AND question_id = ?",
      [userId, courseId, quizId, questionId]
    );

    if (existingAnswerRows.length > 0) {
      await db.execute(
        "UPDATE quiz_answer SET selected_answer = ?, points = ? WHERE user_id = ? AND course_id = ? AND quiz_id = ? AND question_id = ?",
        [answer, points, userId, courseId, quizId, questionId]
      );
    } else {
      await db.execute(
        "INSERT INTO quiz_answer (user_id, course_id, quiz_id, question_id, selected_answer, points) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, courseId, quizId, questionId, answer, points]
      );
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    const [timeCorrectRow] = await db.execute(
      "SELECT * FROM time_correct_ans WHERE user_id = ? and time = ?",
      [userId, currentDate]
    );

    if (timeCorrectRow.length === 0 && points !== 0) {
      await db.execute(
        "INSERT INTO time_correct_ans (user_id, time, correct_question_number, total_attempted_question) VALUES (?, ?, ?, ?)",
        [userId, currentDate, 1, 1]
      );
    } else if (timeCorrectRow.length === 0 && points === 0) {
      // Insert new record for incorrect attempt
      await db.execute(
        "INSERT INTO time_correct_ans (user_id, time, correct_question_number, total_attempted_question) VALUES (?, ?, ?, ?)",
        [userId, currentDate, 0, 1]
      );
    } else if (timeCorrectRow.length > 0 && points !== 0) {
      // Update existing record for correct attempt
      await db.execute(
        "UPDATE time_correct_ans SET correct_question_number = correct_question_number + 1, total_attempted_question = total_attempted_question + 1 WHERE user_id = ? AND time = ?",
        [userId, currentDate]
      );
    } else {
      await db.execute(
        "UPDATE time_correct_ans SET total_attempted_question = total_attempted_question + 1 WHERE user_id = ? AND time = ?",
        [userId, currentDate]
      );
    }

    const [timeAttempsRow] = await db.execute(
      "SELECT * FROM time_attempts WHERE user_id = ? and time = ?",
      [userId, currentTimeUsed]
    );

    if (timeAttempsRow.length === 0) {
      // Insert new record for correct attempt
      await db.execute(
        "INSERT INTO time_attempts (user_id, time, attempted_number) VALUES (?, ?, ?)",
        [userId, currentTimeUsed, 1]
      );
    } else {
      await db.execute(
        "UPDATE time_attempts SET attempted_number = attempted_number + 1 WHERE user_id = ? AND time = ?",
        [userId, currentTimeUsed]
      );
    }

    if (lastQues) {
      const retrievedTotalPoints = await db.execute(
        "SELECT total_points FROM users WHERE id = ?",
        [userId]
      );

      const retrievedCurrentPoints = await db.execute(
        "SELECT current_points FROM users WHERE id = ?",
        [userId]
      );

      if (
        retrievedTotalPoints.length > 0 &&
        retrievedCurrentPoints.length > 0
      ) {
        const previousTotalPoints = retrievedTotalPoints[0][0].total_points;
        const newTotalPoints = previousTotalPoints + totalPoints;
        const previousCurrentPoints =
          retrievedCurrentPoints[0][0].current_points;
        const newCurrentPoints = previousCurrentPoints + totalPoints;

        await db.execute(
          "UPDATE users SET total_points = ?, current_points = ? WHERE id = ?",
          [newTotalPoints, newCurrentPoints, userId]
        );

        await axios.post("http://localhost:3500/update-ranking");

        res.status(200).json();
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
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
    const { userId, quizId } = req.body;
    await db.execute(
      "INSERT INTO action_logs (user_id, time, event, quiz_id) VALUES (?, NOW(), ?, ?)",
      [userId, "Start Answering Quiz", quizId]
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
