import { useEffect, useRef, useState } from "react";
import { createDream, fetchDream } from "../api";
import { useNavigate } from "react-router-dom";

export default function NewDream() {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [generateImage, setGenerateImage] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const wsRef = useRef(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    setLoading(true);
    setStatus(generateImage ? "Weaving your dream…" : "Analyzing your dream…");
    setResult(null);
    try {
      const res = await createDream(title, rawText, generateImage);
      const created = res.data;
      console.log("✅ Dream created:", created.id);
      setResult(created); // initially without interpretation
      
      // open websocket to listen for completion
      // Use the API URL to construct WebSocket URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      // Determine WebSocket protocol
      // CRITICAL: If page is HTTPS (Vercel), MUST use wss:// (secure WebSocket)
      // Otherwise browsers will block the connection (Mixed Content error)
      const isPageHttps = window.location.protocol === "https:";
      const isApiHttps = apiUrl.startsWith("https");
      
      // Always use wss:// if page is HTTPS (required for Vercel)
      // Use wss:// if API is HTTPS, ws:// if API is HTTP and page is HTTP
      const wsProtocol = (isPageHttps || isApiHttps) ? "wss:" : "ws:";
      
      // Extract host from API URL (remove http:// or https:// and trailing slash)
      let wsHost = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
      
      // Remove port if it's the default HTTP/HTTPS port (80/443)
      // But keep custom ports like :8000 for localhost
      if (wsHost.includes("localhost") || wsHost.includes("127.0.0.1")) {
        // Keep port for localhost
      } else {
        // Remove default ports for production
        wsHost = wsHost.replace(/:80$/, "").replace(/:443$/, "");
      }
      
      const wsUrl = `${wsProtocol}//${wsHost}/ws/dream-status/${created.id}`;
      console.log("🔌 Connecting to WebSocket:", wsUrl);
      console.log("🔍 API URL:", apiUrl);
      console.log("🔍 Page protocol:", window.location.protocol);
      console.log("🔍 Using protocol:", wsProtocol);
      
      try {
        wsRef.current = new WebSocket(wsUrl);
      } catch (error) {
        console.error("❌ WebSocket connection error:", error);
        // Continue with polling fallback
      }
      
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
            // Check if there's an error message in the interpretation
            if (fresh.data.interpretation.meaning && fresh.data.interpretation.meaning.includes("⚠️")) {
              setStatus("⚠️ " + fresh.data.interpretation.meaning);
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
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
    <div className="new-dream-wrapper-creative">
      {/* Floating background elements */}
      <div className="new-dream-bg-elements">
        <div className="new-dream-blob blob-1"></div>
        <div className="new-dream-blob blob-2"></div>
      </div>

      <div className="new-dream-form-creative">
        <div className="form-header-creative">
          <span className="form-icon-large">✨</span>
          <h2 className="form-title-creative">Describe your dream</h2>
          <p className="form-subtitle-creative">Capture the essence of your nighttime journey</p>
        </div>
        <form onSubmit={handleSubmit} className="dream-form-creative">
          <div className="form-group-creative">
            <label className="form-label-creative">
              <span className="label-icon">📝</span>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Flying through a mirror forest"
              className="form-input-creative"
              required
            />
          </div>

          <div className="form-group-creative">
            <label className="form-label-creative">
              <span className="label-icon">💭</span>
              Dream details
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              placeholder="Write what you remember from your dream..."
              className="form-textarea-creative"
              required
            />
          </div>

          <div className="checkbox-group-creative">
            <label htmlFor="generateImage" className="checkbox-label-creative">
              <input
                type="checkbox"
                id="generateImage"
                checked={generateImage}
                onChange={(e) => setGenerateImage(e.target.checked)}
                className="checkbox-input-creative"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                <span className="checkbox-icon">🖼️</span>
                Generate image
              </span>
            </label>
          </div>
          
          {!generateImage && (
            <div className="tip-box-creative">
              <span className="tip-icon">💡</span>
              <div className="tip-content">
                <strong>Tip:</strong> You'll still get full AI interpretation (narrative, meaning, symbols, emotions) - just without the image.
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-button-creative">
            <span className="button-icon">{loading ? "🔄" : "✨"}</span>
            <span>{loading ? "Interpreting..." : "Interpret my dream"}</span>
          </button>
        </form>
        {status && (
          <div className="status-message-creative">
            <span className="status-icon">⏳</span>
            <p>{status}</p>
          </div>
        )}
      </div>

      {result && result.interpretation && (
        <div className="new-dream-result-creative">
          {result.interpretation.meaning && result.interpretation.meaning.includes("⚠️") ? (
            <div className="error-card" style={{ marginTop: "1rem", padding: "1rem", background: "#7f1d1d", borderRadius: "8px" }}>
              <h3 style={{ color: "#fca5a5", marginTop: 0 }}>⚠️ Configuration Error</h3>
              <p style={{ color: "#fee2e2", whiteSpace: "pre-line" }}>{result.interpretation.meaning}</p>
              <p style={{ color: "#fca5a5", marginTop: "1rem", fontSize: "0.9rem" }}>
                <strong>To fix:</strong> Add your GROQ_API_KEY to <code>dream-backend/.env</code> and restart the backend server.
                <br />
                Get a free API key from: <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd" }}>https://console.groq.com/</a>
              </p>
            </div>
          ) : (
            <>
              <h3>Your dream, reimagined</h3>
              <p>{result.interpretation.poetic_narrative}</p>

              <h4>Meaning</h4>
              <p>{result.interpretation.meaning}</p>
            </>
          )}

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

