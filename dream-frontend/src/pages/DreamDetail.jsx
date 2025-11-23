import { useEffect, useState } from "react";
import { fetchDream, rewriteDream, explainSymbol, updateDream, deleteDream, regenerateDream } from "../api";
import { useParams, useNavigate } from "react-router-dom";

const STYLES = [
  { value: "horror", label: "Horror", icon: "👻" },
  { value: "sci-fi", label: "Sci-Fi", icon: "🚀" },
  { value: "children", label: "Children's Story", icon: "🧸" },
  { value: "fantasy", label: "Fantasy", icon: "✨" },
  { value: "noir", label: "Noir", icon: "🕵️" },
  { value: "poetic", label: "Poetic", icon: "📜" },
];

export default function DreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [rewritten, setRewritten] = useState(null);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [symbolExplanation, setSymbolExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDream(id);
        setDream(res.data);
        setEditTitle(res.data.title);
        setEditText(res.data.raw_text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateDream(id, editTitle, editText);
      setDream(res.data);
      setIsEditing(false);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to update dream");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteDream(id);
      navigate("/");
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to delete dream");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleRegenerate() {
    if (!window.confirm("This will regenerate the AI interpretation and image. Continue?")) {
      return;
    }
    setRegenerating(true);
    setRegenerateError("");
    try {
      await regenerateDream(id);
      // Reload the dream after a short delay to see the update
      setTimeout(async () => {
        try {
          const res = await fetchDream(id);
          setDream(res.data);
        } catch (e) {
          console.error("Failed to reload dream:", e);
        }
        setRegenerating(false);
      }, 3000);
    } catch (e) {
      setRegenerateError(e.response?.data?.detail || "Failed to regenerate dream");
      setRegenerating(false);
    }
  }

  async function handleRewrite(style) {
    setSelectedStyle(style);
    setRewriting(true);
    setRewriteError("");
    setRewritten(null);
    try {
      const res = await rewriteDream(id, style);
      setRewritten(res.data);
    } catch (e) {
      const errorMsg = e.response?.data?.detail || e.message || "Failed to rewrite dream";
      // Provide helpful message for API key errors
      if (errorMsg.includes("API key") || errorMsg.includes("OpenAI")) {
        setRewriteError(
          "⚠️ OpenAI API key not configured.\n\n" +
          "To fix this:\n" +
          "1. Run: ./setup-api-key.sh\n" +
          "2. Or edit dream-backend/.env\n" +
          "3. Set: OPENAI_API_KEY=sk-your-key-here\n" +
          "4. Restart backend server"
        );
      } else {
        setRewriteError(errorMsg);
      }
    } finally {
      setRewriting(false);
    }
  }

  async function handleExplainSymbol(symbol) {
    setSelectedSymbol(symbol);
    setExplaining(true);
    setExplainError("");
    setSymbolExplanation(null);
    try {
      const res = await explainSymbol(symbol);
      setSymbolExplanation(res.data);
    } catch (e) {
      setExplainError(e.response?.data?.detail || "Failed to explain symbol");
    } finally {
      setExplaining(false);
    }
  }

  function parseSymbols(symbolsText) {
    if (!symbolsText) return [];
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(symbolsText);
      if (typeof parsed === 'object' && parsed !== null) {
        // It's a JSON object, return the keys (symbol names)
        return Object.keys(parsed);
      }
    } catch (e) {
      // Not JSON, treat as plain text
    }
    // Fallback to splitting as comma-separated text
    return symbolsText
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  if (loading) return <p>Loading dream...</p>;
  if (!dream) return <p>Dream not found</p>;

  return (
    <div className="dream-detail">
      <div className="dream-header">
        <div>
          <h2>{dream.title}</h2>
          <p className="dream-date">
            {new Date(dream.created_at).toLocaleString()}
          </p>
        </div>
        <div className="dream-actions">
          {!isEditing ? (
            <>
              {(!dream.interpretation || !dream.interpretation.image_url) && (
                <button 
                  className="btn-regenerate" 
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  title="Regenerate AI interpretation and image"
                >
                  {regenerating ? "🔄 Processing..." : "🔄 Regenerate"}
                </button>
              )}
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
                🗑️ Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "💾 Save"}
              </button>
              <button className="btn-cancel" onClick={() => {
                setIsEditing(false);
                setEditTitle(dream.title);
                setEditText(dream.raw_text);
              }}>
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {regenerateError && (
        <div className="error-card">
          <p className="error-text">{regenerateError}</p>
        </div>
      )}

      {regenerating && (
        <div className="regenerate-status">
          <p>🔄 Regenerating AI interpretation and image... This may take a moment.</p>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm">
          <p>Are you sure you want to delete this dream? This action cannot be undone.</p>
          <div className="delete-actions">
            <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
            <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="dream-original">
        <h3>Original Dream</h3>
        {isEditing ? (
          <div className="edit-form">
            <label>Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-input"
            />
            <label>Dream Text</label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={8}
              className="edit-textarea"
            />
          </div>
        ) : (
          <p>{dream.raw_text}</p>
        )}
      </div>

      {dream.interpretation && (
        <div className="dream-interpretation">
          <div className="interpretation-header">
            <h3>✨ Your dream, reimagined</h3>
            <div className="interpretation-stats">
              <span className="stat-badge">
                {parseSymbols(dream.interpretation.symbols || '').length} symbols
              </span>
              <span className="stat-badge">
                {dream.interpretation.emotions ? dream.interpretation.emotions.split(/[,\n]/).filter(e => e.trim()).length : 0} emotions
              </span>
            </div>
          </div>
          
          <div className="interpretation-content">
            <div className="narrative-section">
              <h4>📖 Poetic Narrative</h4>
              <p className="narrative-text">{dream.interpretation.poetic_narrative}</p>
            </div>

            <div className="meaning-section">
              <h4>💭 Meaning</h4>
              <p className="meaning-text">{dream.interpretation.meaning}</p>
            </div>
          </div>

          <h4>Symbols</h4>
          <div className="symbols-list">
            {parseSymbols(dream.interpretation.symbols).map((symbol, idx) => {
              const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#d946ef', '#ec4899'];
              const color = colors[idx % colors.length];
              return (
                <button
                  key={idx}
                  className={`symbol-button ${selectedSymbol === symbol ? "active" : ""}`}
                  onClick={() => handleExplainSymbol(symbol)}
                  disabled={explaining}
                  style={{
                    background: selectedSymbol === symbol ? color : 'transparent',
                    borderColor: color,
                    color: selectedSymbol === symbol ? 'white' : color
                  }}
                >
                  <span className="symbol-icon">🔮</span>
                  {symbol}
                </button>
              );
            })}
          </div>
          
          {explaining && selectedSymbol && (
            <div className="symbol-explaining">
              <p>Explaining "{selectedSymbol}"...</p>
            </div>
          )}

          {explainError && (
            <p className="error-text">{explainError}</p>
          )}

          {symbolExplanation && symbolExplanation.symbol === selectedSymbol && (
            <div className="symbol-explanation">
              <h5>📚 {symbolExplanation.symbol} - Symbol Encyclopedia</h5>
              
              <div className="explanation-section">
                <h6>General Meaning</h6>
                <p>{symbolExplanation.general_meaning}</p>
              </div>

              <div className="explanation-section">
                <h6>Psychological Interpretation</h6>
                <p>{symbolExplanation.psychological}</p>
              </div>

              <div className="explanation-section">
                <h6>Cultural & Mythological Associations</h6>
                <p>{symbolExplanation.cultural}</p>
              </div>

              <div className="explanation-section">
                <h6>Personal Context</h6>
                <p>{symbolExplanation.personal_context}</p>
              </div>
            </div>
          )}

          <h4>Emotions</h4>
          {dream.interpretation.emotions ? (
            <div className="emotions-visual">
              {dream.interpretation.emotions.split(/[,\n]/)
                .map((emo, idx) => {
                  const trimmed = emo.trim();
                  if (!trimmed) return null;
                  const emotionColors = {
                    'fear': '#ef4444', 'anxiety': '#f97316', 'joy': '#10b981',
                    'happiness': '#10b981', 'sadness': '#3b82f6', 'anger': '#dc2626',
                    'peace': '#8b5cf6', 'wonder': '#fbbf24', 'confusion': '#6b7280',
                    'excitement': '#ec4899', 'calm': '#06b6d4', 'love': '#f472b6'
                  };
                  const color = emotionColors[trimmed.toLowerCase()] || '#6366f1';
                  return (
                    <span key={idx} className="emotion-tag" style={{ background: color + '20', borderColor: color, color }}>
                      {trimmed}
                    </span>
                  );
                })
                .filter(item => item !== null)}
            </div>
          ) : (
            <p>No emotions recorded</p>
          )}

          {dream.interpretation.image_url && (
            <>
              <h4>Dream image</h4>
              <img
                src={dream.interpretation.image_url}
                alt="Dream interpretation"
                className="dream-image"
              />
            </>
          )}
        </div>
      )}

      {/* Style Rewrite Section */}
      <div className="dream-rewrite">
        <h3>Transform Your Dream</h3>
        <p className="rewrite-description">
          Reimagine your dream in different narrative styles
        </p>

        <div className="style-buttons">
          {STYLES.map((style) => (
            <button
              key={style.value}
              className={`style-button ${selectedStyle === style.value ? "active" : ""}`}
              onClick={() => handleRewrite(style.value)}
              disabled={rewriting}
            >
              <span className="style-icon">{style.icon}</span>
              <span className="style-label">{style.label}</span>
            </button>
          ))}
        </div>

        {rewriting && (
          <div className="rewrite-loading">
            <p>Rewriting your dream as {STYLES.find(s => s.value === selectedStyle)?.label}...</p>
          </div>
        )}

        {rewriteError && (
          <div className="error-card">
            <p className="error-text" style={{ whiteSpace: "pre-line" }}>
              {rewriteError}
            </p>
          </div>
        )}

        {rewritten && rewritten.rewritten_narrative && (
          <div className="rewrite-result">
            <div className="rewrite-header">
              <h4>
                {STYLES.find(s => s.value === rewritten.style)?.icon}{" "}
                {STYLES.find(s => s.value === rewritten.style)?.label} Version
              </h4>
              <div className="style-badge" style={{
                background: rewritten.style === 'horror' ? '#7f1d1d' :
                           rewritten.style === 'sci-fi' ? '#1e3a8a' :
                           rewritten.style === 'fantasy' ? '#581c87' :
                           rewritten.style === 'noir' ? '#1f2937' :
                           rewritten.style === 'children' ? '#7c2d12' : '#4c1d95'
              }}>
                {STYLES.find(s => s.value === rewritten.style)?.label || rewritten.style}
              </div>
            </div>
            <div className="rewrite-comparison">
              <div className="original-version">
                <h5>Original</h5>
                <p className="dream-text-compact">{dream?.raw_text || ''}</p>
              </div>
              <div className="arrow">→</div>
              <div className="transformed-version">
                <h5>Transformed</h5>
                <p className="rewritten-text">{rewritten.rewritten_narrative}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

