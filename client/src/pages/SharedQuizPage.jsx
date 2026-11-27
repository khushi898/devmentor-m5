import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import QuizQuestion from "@/components/quizzes/QuizQuestion";

function SharedQuizPage() {
  const { shareId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/public/quizzes/${shareId}`)
      .then((res) => {
        setQuiz(res.data.quiz);
        setAnswers(res.data.quiz.questions.map(() => null));
      })
      .catch((err) => setError(err.response?.data?.message || "This quiz could not be loaded."));
  }, [shareId]);

  const answeredCount = answers.filter((a) => a !== null).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await api.post(`/public/quizzes/${shareId}/check`, { answers });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Could not check your answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers(quiz.questions.map(() => null));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <p className="text-sm text-muted-foreground">Shared quiz · DevMentor</p>

      {error && (
        <div className="border rounded-lg p-6 text-center space-y-3">
          <p role="alert" className="text-destructive">{error}</p>
          <Link to="/register" className="text-sm underline">Create your own quizzes with DevMentor</Link>
        </div>
      )}

      {!quiz && !error && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {quiz && (
        <>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>

          {result && (
            <div className="border rounded-lg p-4 bg-muted" role="status">
              <p className="text-lg font-semibold">You scored {result.score} out of {result.total}</p>
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
                onSelect={(option) => setAnswers((prev) => prev.map((a, j) => (j === i ? option : a)))}
                result={result?.results[i]}
              />
            ))}
          </div>

          {!result && (
            <div className="space-y-2">
              {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
              <Button className="w-full" disabled={submitting || answeredCount < quiz.questions.length} onClick={handleSubmit}>
                {submitting ? "Checking answers..." : `Submit answers (${answeredCount}/${quiz.questions.length})`}
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Made with DevMentor. <Link to="/register" className="underline">Turn your own notes into quizzes</Link>
          </p>
        </>
      )}
    </div>
  );
}

export default SharedQuizPage;