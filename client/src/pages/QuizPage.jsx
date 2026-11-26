import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import QuizQuestion from "@/components/quizzes/QuizQuestion";

function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then((res) => {
        setQuiz(res.data.quiz);
        setAnswers(res.data.quiz.questions.map(() => null));
      })
      .catch(() => setError("This quiz could not be found."));

    api
      .get(`/quizzes/${id}/attempts`)
      .then((res) => setAttempts(res.data.attempts))
      .catch(() => {});
  }, [id]);

  const selectAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  };

  const answeredCount = answers.filter((a) => a !== null).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await api.post(`/quizzes/${id}/attempts`, { answers });
      setResults(res.data.results);
      setAttempt(res.data.attempt);
      setAttempts((prev) => [res.data.attempt, ...prev]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Could not submit your answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResults(null);
    setAttempt(null);
    setShowRaw(false);
    setAnswers(quiz.questions.map(() => null));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <Link to="/dashboard" className="text-sm underline">← Dashboard</Link>

      {error && <p role="alert" className="text-destructive">{error}</p>}

      {!quiz && !error && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {quiz && (
        <>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>

          {attempt && (
            <div className="border rounded-lg p-4 bg-muted" role="status">
              <p className="text-lg font-semibold">
                You scored {attempt.score} out of {attempt.total}
              </p>
              <Button className="mt-3" variant="outline" onClick={retry}>Try again</Button>
            </div>
          )}

          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <QuizQuestion
                key={q._id}
                index={i}
                data={q}
                selected={answers[i]}
                onSelect={(option) => selectAnswer(i, option)}
                result={results?.[i]}
              />
            ))}
          </div>

          {!results && (
            <div className="space-y-2">
              {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
              <Button
                className="w-full"
                disabled={submitting || answeredCount < quiz.questions.length}
                onClick={handleSubmit}
              >
                {submitting ? "Checking answers..." : `Submit answers (${answeredCount}/${quiz.questions.length})`}
              </Button>
            </div>
          )}

          {results && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setShowRaw((s) => !s)}>
                {showRaw ? "Hide raw JSON" : "View raw JSON"}
              </Button>
              {showRaw && (
                <pre className="mt-2 p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                  {JSON.stringify(
                    results.map(({ question, options, correctIndex, explanation, page }) => ({
                      question, options, correctIndex, explanation, page,
                    })),
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          )}

          <section>
            <h2 className="font-semibold mb-2">Your attempts</h2>
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet. Answer every question and submit.</p>
            ) : (
              <ul className="divide-y border rounded-lg">
                {attempts.map((a) => (
                  <li key={a._id} className="flex justify-between p-3 text-sm">
                    <span>{new Date(a.createdAt).toLocaleString("en-GB")}</span>
                    <span className="font-medium">{a.score}/{a.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default QuizPage;