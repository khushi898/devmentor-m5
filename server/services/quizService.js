export const validAnswers = (quiz, answers) =>
  Array.isArray(answers) &&
  answers.length === quiz.questions.length &&
  answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3);

export const gradeQuiz = (quiz, answers) => {
  const results = quiz.questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    selected: answers[i],
    correctIndex: q.correctIndex,
    correct: answers[i] === q.correctIndex,
    explanation: q.explanation,
    page: q.page,
  }));
  return { results, score: results.filter((r) => r.correct).length, total: quiz.questions.length };
};

export const publicQuizView = (quiz) => ({
  title: quiz.title,
  questions: quiz.questions.map((q) => ({ _id: q._id, question: q.question, options: q.options, page: q.page })),
});