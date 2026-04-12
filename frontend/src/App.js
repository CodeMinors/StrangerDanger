import { useState, useCallback } from "react";
import "@/App.css";
import PlatformScreen from "@/components/PlatformScreen";
import ChatScreen from "@/components/ChatScreen";
import ResultScreen from "@/components/ResultScreen";
import Toast from "@/components/Toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [screen, setScreen] = useState("platform");
  const [sessionId, setSessionId] = useState(null);
  const [platformType, setPlatformType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const startChat = useCallback(async (platform) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/start-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform_type: platform }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to start chat");
      }
      const data = await res.json();
      setSessionId(data.session_id);
      setPlatformType(platform);
      setMessages([
        { role: "assistant", content: data.initial_message, timestamp: new Date().toISOString() },
      ]);
      setCurrentAnalysis(null);
      setScreen("chat");
      showToast("Chat started. Practice safe chatting.");
    } catch (e) {
      showToast(e.message || "Failed to start chat", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const sendMessage = useCallback(async (message) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to send message");
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message, timestamp: new Date().toISOString() },
        data.bot_response,
      ]);
      setCurrentAnalysis(data.analysis);
    } catch (e) {
      showToast(e.message || "Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  const endChat = useCallback(async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/end-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to end chat");
      }
      const data = await res.json();
      setResultData(data);
      setScreen("result");
    } catch (e) {
      showToast(e.message || "Failed to end chat", "error");
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  const resetToStart = useCallback(() => {
    setScreen("platform");
    setSessionId(null);
    setPlatformType(null);
    setMessages([]);
    setCurrentAnalysis(null);
    setResultData(null);
  }, []);

  return (
    <div data-testid="app-root">
      {toast && <Toast message={toast.message} type={toast.type} />}
      {screen === "platform" && (
        <PlatformScreen onSelect={startChat} loading={loading} />
      )}
      {screen === "chat" && (
        <ChatScreen
          platformType={platformType}
          messages={messages}
          analysis={currentAnalysis}
          onSend={sendMessage}
          onEnd={endChat}
          loading={loading}
        />
      )}
      {screen === "result" && (
        <ResultScreen data={resultData} onRestart={resetToStart} />
      )}
    </div>
  );
}

export default App;
