import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentList from "@/components/documents/DocumentList";
import UploadForm from "@/components/documents/UploadForm";
import ChatList from "@/components/chat/ChatList";
import VoiceAssistant from "@/components/voice/VoiceAssistant";
import GeneratorForm from "@/components/study/GeneratorForm";
import DeckList from "@/components/flashcards/DeckList";
import QuizList from "@/components/quizzes/QuizList";
import TaskBoard from "@/components/tasks/TaskBoard";
import StudyPlanner from "@/components/agent/StudyPlanner";

const TABS = [
  { value: "plan", label: "Study plan" },
  { value: "chat", label: "Chat" },
  { value: "voice", label: "Voice" },
  { value: "flashcards", label: "Flashcards" },
  { value: "quizzes", label: "Quizzes" },
  { value: "documents", label: "Documents" },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab = TABS.some((t) => t.value === requested) ? requested : "plan";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskRefresh, setTaskRefresh] = useState(0);
  const refreshTasks = useCallback(() => setTaskRefresh((n) => n + 1), []);

  useEffect(() => {
    api
      .get("/documents")
      .then((res) => setDocuments(res.data.documents))
      .catch(() => setError("Could not load your documents. Please refresh the page."))
      .finally(() => setLoading(false));
  }, []);

  const openTab = (value) => setSearchParams({ tab: value }, { replace: true });

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch {
      alert("Could not delete the document. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">DevMentor</p>
          <h1 className="text-2xl font-bold truncate">Welcome, {user?.name}</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>Log out</Button>
      </header>

      {!loading && documents.length === 0 && tab !== "documents" && (
        <div className="mt-4 border rounded-lg p-3 text-sm flex flex-wrap items-center gap-2">
          <span>Start by uploading a PDF of your study notes.</span>
          <Button size="sm" variant="outline" onClick={() => openTab("documents")}>Upload a document</Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={openTab} className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="plan" className="mt-6 space-y-4">
          <StudyPlanner onTasksChanged={refreshTasks} />
          <TaskBoard refreshKey={taskRefresh} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          {!loading && <ChatList documents={documents} />}
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          {!loading && <VoiceAssistant documents={documents} />}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-6 space-y-4">
          {!loading && (
            <GeneratorForm
              documents={documents}
              endpoint="/flashcards/generate"
              getPath={(data) => `/flashcards/${data.deck._id}`}
              idPrefix="fc"
              buttonText="Generate flashcards"
              loadingText="Generating flashcards..."
            />
          )}
          <DeckList />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6 space-y-4">
          {!loading && (
            <GeneratorForm
              documents={documents}
              endpoint="/quizzes/generate"
              getPath={(data) => `/quizzes/${data.quiz._id}`}
              idPrefix="quiz"
              buttonText="Generate quiz"
              loadingText="Generating quiz..."
            />
          )}
          <QuizList />
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-6">
          <UploadForm onUploaded={handleUploaded} />
          <DocumentList documents={documents} loading={loading} error={error} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Dashboard;