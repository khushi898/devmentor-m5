import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks,Trash2 } from "lucide-react";
import api from "@/api/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/quizzes")
      .then((res) => setQuizzes(res.data.quizzes))
      .catch(() => setError("Could not load your quizzes."))
      .finally(() => setLoading(false));
  }, []);

  const deleteQuiz=async(id)=>{
    if(!window.confirm("Deletethis quiz and its attempts?"));
    return;
    try{
        await api.delete(`/quizzes/${id}`);
        setQuizzes((prev)=>prev.filter((q)=>q._id==id));
    }catch{
        setError("Could not delete the quiz. Please try after");
    }
  };
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>;

  if (quizzes.length === 0) {
    return <p className="text-sm text-muted-foreground">No quizzes yet. Generate your first one above.</p>;
  }

  return (
    <ul className="space-y-2">
      {quizzes.map((quiz) => (
       <li key={quiz._id} className="flex items-center gap-2">
          <Link to={`/quizzes/${quiz._id}`} className="flex-1 min-w-0 flex items-center justify-between gap-3 border rounded-lg p-3 hover:bg-muted">
            <div className="flex items-center gap-3 min-w-0">
              <ListChecks className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="font-medium truncate">{quiz.title}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{quiz.total} questions</span>
          </Link>
          <Button variant="ghost" size="icon" aria-label={`Delete quiz ${quiz.title}`} onClick={() => deleteQuiz(quiz._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default QuizList;