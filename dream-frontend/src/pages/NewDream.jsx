import { useEffect, useRef, useState } from "react";
import { createDream, fetchDream } from "../api";
import { useNavigate } from "react-router-dom";

export default function NewDream() {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [generateImage, setGenerateImage] = useState(false); // Default to false to save money
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const wsRef = useRef(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    setLoading(true);
    setStatus(generateImage ? "Weaving your dream…" : "Analyzing your dream (no image to save $0.04)…");
    setResult(null);
    try {
      const res = await createDream(title, rawText, generateImage);
      const created = res.data;
      console.log("✅ Dream created:", created.id);
      setResult(created); // initially without interpretation
      
      // open websocket to listen for completion
      // Use the API URL to construct WebSocket URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
      const wsHost = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const wsUrl = `${wsProtocol}//${wsHost}/ws/dream-status/${created.id}`;
      console.log("🔌 Connecting to WebSocket:", wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      
      // Fallback: poll for completion if WebSocket fails
      let pollCount = 0;
      const maxPolls = 20; // 20 * 3 seconds = 60 seconds max
      const pollInterval = setInterval(async () => {
        pollCount++;
        if (pollCount > maxPolls) {
          clearInterval(pollInterval);
          setStatus("Taking longer than expected... Please refresh the page.");
          return;
        }
        try {
          const fresh = await fetchDream(created.id);
          if (fresh.data?.interpretation) {
            setResult(fresh.data);
            setStatus("");
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (e) {
          // Keep polling
        }
      }, 3000); // Poll every 3 seconds
      
      wsRef.current.onmessage = async (msg) => {
        try {
          const payload = JSON.parse(msg.data);
          if (payload?.message) {
            setStatus(payload.message);
          }
          if (payload?.status === "done") {
            clearInterval(pollInterval);
            const fresh = await fetchDream(created.id);
            setResult(fresh.data);
            setStatus("");
            setLoading(false);
          }
        } catch {}
      };
      wsRef.current.onclose = () => {
        // Polling will continue as fallback
      };
      wsRef.current.onerror = () => {
        // Polling will continue as fallback
      };
    } catch (e) {
      console.error("Dream creation error:", e);
      const errorMessage = e.response?.data?.detail || e.message || "Something went wrong. Try again.";
      
      // Check if it's an API key issue
      if (errorMessage.includes("API key") || errorMessage.includes("OpenAI")) {
        alert(`AI Configuration Error: ${errorMessage}\n\nPlease configure your OpenAI API key in the backend .env file.`);
      } else {
        alert(`Error: ${errorMessage}`);
      }
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, []);

  return (
    <div className="new-dream-wrapper">
      <div className="new-dream-form">
        <h2>Describe your dream</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Flying through a mirror forest"
            required
          />

          <label>Dream details</label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            placeholder="Write what you remember from your dream..."
            required
          />

          <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="generateImage"
              checked={generateImage}
              onChange={(e) => setGenerateImage(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="generateImage" style={{ cursor: "pointer", fontSize: "0.9rem", color: "#9ca3af" }}>
              Generate image {generateImage ? "($0.04 cost)" : "(saves $0.04)"}
            </label>
          </div>
          
          {!generateImage && (
            <div style={{ 
              marginBottom: "1rem", 
              padding: "0.75rem", 
              background: "#1f2933", 
              borderRadius: "8px",
              fontSize: "0.85rem",
              color: "#9ca3af"
            }}>
              💡 <strong>Tip:</strong> You'll still get full AI interpretation (narrative, meaning, symbols, emotions) - just without the image. Save $0.04 per dream!
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Interpreting..." : "Interpret my dream"}
          </button>
        </form>
        {status && <p className="dream-date" style={{marginTop: 8}}>{status}</p>}
      </div>

      {result && result.interpretation && (
        <div className="new-dream-result">
          <h3>Your dream, reimagined</h3>
          <p>{result.interpretation.poetic_narrative}</p>

          <h4>Meaning</h4>
          <p>{result.interpretation.meaning}</p>

          <h4>Symbols</h4>
          <p>{result.interpretation.symbols}</p>

          <h4>Emotions</h4>
          <p>{result.interpretation.emotions}</p>

          {result.interpretation.image_url && (
            <>
              <h4>Dream image</h4>
              <img
                src={result.interpretation.image_url}
                alt="Dream interpretation"
                className="dream-image"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

