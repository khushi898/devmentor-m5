import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const STATUS_TEXT = {
  idle: "Tap the microphone and ask a question about your documents.",
  recording: "Recording… tap the button again to stop.",
  transcribing: "Transcribing your question…",
  thinking: "Thinking…",
  speaking: "Speaking the answer…",
};

const MAX_RECORDING_MS = 30000;

function VoiceAssistant({ documents }) {
  const [status, setStatus] = useState("idle");
  const [documentId, setDocumentId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const readyDocs = documents.filter((doc) => doc.status === "ready");

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      setStatus("idle");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    setStatus("speaking");
    window.speechSynthesis.speak(utterance);
  };

  const handleRecordingStop = async (scopeId) => {
    clearTimeout(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());

    const blob = new Blob(chunksRef.current, { type: recorderRef.current.mimeType });
    if (blob.size < 1000) {
      setError("That recording was too short. Hold on a little longer and try again.");
      setStatus("idle");
      return;
    }

    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
    const formData = new FormData();
    formData.append("audio", blob, `question.${ext}`);

    try {
      setStatus("transcribing");
      const t = await api.post("/voice/transcribe", formData);
      setTranscript(t.data.text);

      setStatus("thinking");
      const a = await api.post("/voice/answer", { question: t.data.text, documentId: scopeId || undefined });
      setAnswer(a.data.answer);
      setSources(a.data.sources);

      speak(a.data.answer);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setAnswer("");
    setSources([]);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording isn't supported in this browser. Please try Chrome, Edge or Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      const scopeId = documentId;
      recorder.onstop = () => handleRecordingStop(scopeId);
      recorderRef.current = recorder;

      recorder.start();
      setStatus("recording");
      timerRef.current = setTimeout(() => recorder.state === "recording" && recorder.stop(), MAX_RECORDING_MS);
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Microphone access is blocked. Click the lock icon in the address bar, allow the microphone, then try again."
          : "Could not start the microphone. Check it is connected and try again."
      );
      setStatus("idle");
    }
  };

  const handleButton = () => {
    if (status === "idle") startRecording();
    else if (status === "recording") recorderRef.current?.stop();
    else if (status === "speaking") {
      window.speechSynthesis.cancel();
      setStatus("idle");
    }
  };

  const busy = status === "transcribing" || status === "thinking";

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-doc">Ask about</Label>
        <select
          id="voice-doc"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          disabled={status !== "idle"}
          className="w-full h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All my documents</option>
          {readyDocs.map((doc) => (
            <option key={doc._id} value={doc._id}>{doc.title}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        <Button
          type="button"
          size="icon"
          onClick={handleButton}
          disabled={busy || readyDocs.length === 0}
          aria-label={status === "recording" ? "Stop recording" : status === "speaking" ? "Stop speaking" : "Start recording"}
          className={`h-16 w-16 rounded-full ${status === "recording" ? "bg-destructive hover:bg-destructive/90" : ""}`}
        >
          {status === "recording" && <Square className="h-6 w-6" />}
          {busy && <Loader2 className="h-6 w-6 animate-spin" />}
          {status === "speaking" && <Volume2 className="h-6 w-6" />}
          {status === "idle" && <Mic className="h-6 w-6" />}
        </Button>
        <p className="text-sm text-muted-foreground text-center" role="status" aria-live="polite">
          {readyDocs.length === 0 ? "Upload a PDF first to use voice mode." : STATUS_TEXT[status]}
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {transcript && (
        <div className="text-sm">
          <p className="font-medium">You asked:</p>
          <p className="text-muted-foreground">{transcript}</p>
        </div>
      )}

      {answer && (
        <div className="text-sm space-y-2">
          <p className="font-medium">DevMentor:</p>
          <p>{answer}</p>
          {sources.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Sources: {sources.map((s) => `${s.title}, page ${s.page}`).join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;