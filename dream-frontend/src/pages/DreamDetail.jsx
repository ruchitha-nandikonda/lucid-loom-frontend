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

  function formatDreamDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format as: "Jan 15, 2024 at 2:30 PM"
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    } catch (e) {
      console.error('Date formatting error:', e, dateString);
      return dateString;
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

  function getSymbolEmoji(symbol) {
    const symbolLower = symbol.toLowerCase().trim();
    const emojiMap = {
      // Knowledge & Learning
      'library': '📚', 'libraries': '📚',
      'book': '📖', 'books': '📖', 'page': '📄', 'pages': '📄',
      'title': '📝', 'titles': '📝',
      'knowledge': '🧠', 'know': '🧠',
      'learning': '📚', 'learn': '📚', 'study': '📚',
      'education': '🎓', 'school': '🏫',
      'wisdom': '🦉', 'wise': '🦉',
      
      // Self & Personal Growth
      'self-discovery': '🔍', 'self': '🪞', 'discovery': '🔍',
      'transformation': '🦋', 'transform': '🦋', 'change': '🔄',
      'growth': '🌱', 'grow': '🌱',
      'journey': '🗺️', 'path': '🛤️',
      
      // Uncertainty & Emotions
      'uncertainty': '❓', 'uncertain': '❓', 'unknown': '❓',
      'confusion': '😕', 'confused': '😕',
      'doubt': '🤔', 'question': '❓',
      
      // Nature
      'ocean': '🌊', 'sea': '🌊', 'water': '💧', 'wave': '🌊',
      'shark': '🦈', 'fish': '🐟', 'whale': '🐋', 'dolphin': '🐬',
      'bird': '🐦', 'eagle': '🦅', 'owl': '🦉', 'crow': '🐦‍⬛',
      'tree': '🌳', 'forest': '🌲', 'flower': '🌸', 'rose': '🌹',
      'moon': '🌙', 'sun': '☀️', 'star': '⭐', 'sky': '☁️',
      'fire': '🔥', 'flame': '🔥', 'lightning': '⚡', 'storm': '⛈️',
      'mountain': '⛰️', 'hill': '🏔️', 'valley': '🏞️',
      
      // Buildings & Structures
      'house': '🏠', 'building': '🏢', 'door': '🚪', 'window': '🪟',
      'car': '🚗', 'road': '🛣️', 'bridge': '🌉',
      
      // Animals
      'snake': '🐍', 'dragon': '🐉', 'tiger': '🐅', 'lion': '🦁',
      'cat': '🐱', 'dog': '🐶', 'wolf': '🐺', 'bear': '🐻',
      
      // Objects
      'key': '🗝️', 'lock': '🔒', 'gate': '🚧',
      'mirror': '🪞', 'glass': '🪟', 'crystal': '💎',
      'letter': '✉️',
      'heart': '❤️', 'love': '💕', 'kiss': '💋',
      'eye': '👁️', 'vision': '👁️',
      'hand': '✋', 'finger': '👉', 'touch': '✋',
      'foot': '🦶', 'walk': '🚶', 'run': '🏃',
      'flight': '✈️', 'fly': '🕊️', 'wing': '🪽',
      'death': '💀', 'skull': '💀', 'grave': '🪦',
      'baby': '👶', 'child': '🧒', 'person': '👤',
      'money': '💰', 'coin': '🪙', 'gold': '🪙',
      'food': '🍽️', 'apple': '🍎', 'bread': '🍞',
      'knife': '🔪', 'sword': '⚔️', 'weapon': '🗡️',
      'crown': '👑', 'king': '👑', 'queen': '👸',
      'ring': '💍', 'jewelry': '💎', 'diamond': '💎',
      'clock': '🕐', 'time': '⏰', 'hourglass': '⏳',
      'light': '💡', 'lamp': '🪔', 'candle': '🕯️',
      'dark': '🌑', 'shadow': '🌑', 'night': '🌙',
      'rain': '🌧️', 'snow': '❄️', 'ice': '🧊',
      'wind': '💨', 'air': '💨', 'breeze': '💨',
      'earth': '🌍', 'ground': '🌍', 'soil': '🌱',
      'blood': '🩸', 'red': '🔴', 'wound': '🩹',
    };
    
    // Try exact match first
    if (emojiMap[symbolLower]) {
      return emojiMap[symbolLower];
    }
    
    // Try partial match (check if symbol contains any key or vice versa)
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (symbolLower.includes(key) || key.includes(symbolLower)) {
        return emoji;
      }
    }
    
    // Try word-by-word matching for compound words
    const words = symbolLower.split(/[\s\-_]+/);
    for (const word of words) {
      if (emojiMap[word]) {
        return emojiMap[word];
      }
    }
    
    // Default emoji based on first letter or common patterns
    if (symbolLower.startsWith('lib') || symbolLower.includes('book')) return '📚';
    if (symbolLower.startsWith('know') || symbolLower.includes('learn')) return '🧠';
    if (symbolLower.startsWith('self') || symbolLower.includes('discover')) return '🔍';
    if (symbolLower.startsWith('transform') || symbolLower.includes('change')) return '🦋';
    if (symbolLower.startsWith('uncertain') || symbolLower.includes('unknown')) return '❓';
    if (symbolLower.startsWith('o')) return '🌊';
    if (symbolLower.startsWith('s')) return '⭐';
    if (symbolLower.startsWith('w')) return '💧';
    if (symbolLower.startsWith('f')) return '🔥';
    if (symbolLower.startsWith('d')) return '🌙';
    if (symbolLower.startsWith('l')) return '💡';
    if (symbolLower.startsWith('h')) return '🏠';
    if (symbolLower.startsWith('m')) return '🌙';
    if (symbolLower.startsWith('t')) return '🌳';
    
    return '🔮'; // Default symbol emoji
  }
  
  function getEmotionEmoji(emotion) {
    const emotionLower = emotion.toLowerCase().trim();
    const emojiMap = {
      'curiosity': '🔍', 'curious': '🔍',
      'wonder': '✨', 'wondering': '✨',
      'confusion': '😕', 'confused': '😕',
      'anticipation': '⏳', 'anticipate': '⏳',
      'fear': '😨', 'scared': '😱', 'afraid': '😨',
      'anxiety': '😰', 'anxious': '😰', 'worried': '😰',
      'joy': '😄', 'joyful': '😄',
      'happiness': '😊', 'happy': '😊',
      'sadness': '😢', 'sad': '😢',
      'anger': '😠', 'angry': '😠', 'mad': '😡',
      'peace': '☮️', 'peaceful': '☮️', 'calm': '😌',
      'excitement': '🤩', 'excited': '🤩',
      'love': '❤️', 'loving': '❤️',
      'surprise': '😲', 'surprised': '😲',
      'disgust': '🤢', 'disgusted': '🤢',
      'shame': '😳', 'ashamed': '😳',
      'guilt': '😔', 'guilty': '😔',
      'hope': '🌟', 'hopeful': '🌟',
      'despair': '😞', 'desperate': '😞',
      'loneliness': '😔', 'lonely': '😔',
      'contentment': '😌', 'content': '😌',
      'gratitude': '🙏', 'grateful': '🙏',
      'pride': '😎', 'proud': '😎',
      'envy': '😒', 'jealous': '😒',
      'relief': '😌', 'relieved': '😌',
      'embarrassment': '😳', 'embarrassed': '😳',
    };
    
    // Try exact match first
    if (emojiMap[emotionLower]) {
      return emojiMap[emotionLower];
    }
    
    // Try partial match
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (emotionLower.includes(key) || key.includes(emotionLower)) {
        return emoji;
      }
    }
    
    // Default based on emotion type
    if (emotionLower.includes('curious') || emotionLower.includes('wonder')) return '🔍';
    if (emotionLower.includes('happy') || emotionLower.includes('joy')) return '😄';
    if (emotionLower.includes('sad') || emotionLower.includes('sorrow')) return '😢';
    if (emotionLower.includes('angry') || emotionLower.includes('rage')) return '😠';
    if (emotionLower.includes('fear') || emotionLower.includes('scared')) return '😨';
    if (emotionLower.includes('love') || emotionLower.includes('affection')) return '❤️';
    if (emotionLower.includes('confus') || emotionLower.includes('uncertain')) return '😕';
    
    return '💭'; // Default emotion emoji
  }

  if (loading) return <p>Loading dream...</p>;
  if (!dream) return <p>Dream not found</p>;

  return (
    <div className="dream-detail-creative">
      {/* Floating background elements */}
      <div className="dream-detail-bg-elements">
        <div className="detail-blob blob-1"></div>
        <div className="detail-blob blob-2"></div>
      </div>

      <div className="dream-header-creative">
        <div className="dream-header-content">
          <div className="dream-title-wrapper">
            <span className="dream-title-icon">🌙</span>
            <h2 className="dream-title-creative">{dream.title}</h2>
          </div>
          <p className="dream-date-creative-detail">
            <span className="date-icon-detail">📅</span>
            {formatDreamDate(dream.created_at)}
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

      <div className="dream-original-creative">
        <div className="section-header-creative">
          <span className="section-icon">📝</span>
          <h3>Original Dream</h3>
        </div>
        {isEditing ? (
          <div className="edit-form-creative">
            <label className="edit-label-creative">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-input-creative"
            />
            <label className="edit-label-creative">Dream Text</label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={8}
              className="edit-textarea-creative"
            />
          </div>
        ) : (
          <div className="dream-text-creative">
            <p>{dream.raw_text}</p>
          </div>
        )}
      </div>

      {dream.interpretation && (
        <div className="dream-interpretation-creative">
          <div className="interpretation-header-creative">
            <div className="interpretation-title-wrapper">
              <span className="interpretation-icon-large">✨</span>
              <h3 className="interpretation-title-creative">Your dream, reimagined</h3>
            </div>
            <div className="interpretation-stats-creative">
              <span className="stat-badge-creative">
                <span className="stat-icon">🔮</span>
                {parseSymbols(dream.interpretation.symbols || '').length} symbols
              </span>
              <span className="stat-badge-creative">
                <span className="stat-icon">💗</span>
                {dream.interpretation.emotions ? dream.interpretation.emotions.split(/[,\n]/).filter(e => e.trim()).length : 0} emotions
              </span>
            </div>
          </div>
          
          <div className="interpretation-content-creative">
            <div className="narrative-section-creative">
              <div className="section-header-small">
                <span className="section-icon-small">📖</span>
                <h4>Poetic Narrative</h4>
              </div>
              <div className="narrative-text-creative">
                <p>{dream.interpretation.poetic_narrative}</p>
              </div>
            </div>

            <div className="meaning-section-creative">
              <div className="section-header-small">
                <span className="section-icon-small">💭</span>
                <h4>Meaning</h4>
              </div>
              <div className="meaning-text-creative">
                <p>{dream.interpretation.meaning}</p>
              </div>
            </div>
          </div>

          <div className="symbols-section-creative">
            <div className="section-header-small">
              <span className="section-icon-small">🔮</span>
              <h4>Symbols</h4>
            </div>
            <div className="symbols-list-creative">
              {parseSymbols(dream.interpretation.symbols).map((symbol, idx) => {
                const symbolEmoji = getSymbolEmoji(symbol);
                const colors = [
                  'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                  'linear-gradient(135deg, #a78bfa, #c084fc)',
                  'linear-gradient(135deg, #c084fc, #d946ef)',
                  'linear-gradient(135deg, #d946ef, #ec4899)',
                  'linear-gradient(135deg, #ec4899, #f472b6)'
                ];
                const color = colors[idx % colors.length];
                return (
                  <button
                    key={idx}
                    className={`symbol-button-creative ${selectedSymbol === symbol ? "active" : ""}`}
                    onClick={() => handleExplainSymbol(symbol)}
                    disabled={explaining}
                    style={{
                      background: selectedSymbol === symbol ? color : 'rgba(255, 255, 255, 0.5)',
                      borderColor: selectedSymbol === symbol ? 'transparent' : `rgba(${idx % 2 === 0 ? '99, 102, 241' : '236, 72, 153'}, 0.5)`,
                      color: selectedSymbol === symbol ? 'white' : '#0f172a',
                      animationDelay: `${idx * 0.1}s`
                    }}
                  >
                    <span className="symbol-icon-creative">{symbolEmoji}</span>
                    {symbol}
                    {selectedSymbol === symbol && <span className="symbol-sparkle">✨</span>}
                  </button>
                );
              })}
            </div>
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

          <div className="emotions-section-creative">
            <div className="section-header-small">
              <span className="section-icon-small">💗</span>
              <h4>Emotions</h4>
            </div>
            {dream.interpretation.emotions ? (
              <div className="emotions-visual-creative">
                {dream.interpretation.emotions.split(/[,\n]/)
                  .map((emo, idx) => {
                    const trimmed = emo.trim();
                    if (!trimmed) return null;
                    const emotionEmoji = getEmotionEmoji(trimmed);
                    const emotionColors = {
                      'fear': '#ef4444', 'anxiety': '#f97316', 'joy': '#10b981',
                      'happiness': '#10b981', 'sadness': '#3b82f6', 'anger': '#dc2626',
                      'peace': '#8b5cf6', 'wonder': '#fbbf24', 'confusion': '#6b7280',
                      'excitement': '#ec4899', 'calm': '#06b6d4', 'love': '#f472b6',
                      'curiosity': '#8b5cf6', 'anticipation': '#a78bfa'
                    };
                    const color = emotionColors[trimmed.toLowerCase()] || '#6366f1';
                    return (
                      <span 
                        key={idx} 
                        className="emotion-tag-creative" 
                        style={{ 
                          background: `linear-gradient(135deg, ${color}40, ${color}20)`,
                          borderColor: color,
                          color: color,
                          animationDelay: `${idx * 0.1}s`
                        }}
                      >
                        <span className="emotion-sparkle">{emotionEmoji}</span>
                        {trimmed}
                      </span>
                    );
                  })
                  .filter(item => item !== null)}
              </div>
            ) : (
              <p className="no-emotions-creative">No emotions recorded</p>
            )}
          </div>

          {dream.interpretation.image_url && (
            <div className="dream-image-section-creative">
              <div className="section-header-small">
                <span className="section-icon-small">🖼️</span>
                <h4>Dream Image</h4>
              </div>
              <div className="dream-image-wrapper-creative">
                <img
                  src={dream.interpretation.image_url}
                  alt="Dream interpretation"
                  className="dream-image-creative"
                />
                <div className="dream-image-glow"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Style Rewrite Section */}
      <div className="dream-rewrite-creative">
        <div className="section-header-creative">
          <span className="section-icon">🎭</span>
          <div>
            <h3>Transform Your Dream</h3>
            <p className="rewrite-description-creative">
              Reimagine your dream in different narrative styles
            </p>
          </div>
        </div>

        <div className="style-buttons-creative">
          {STYLES.map((style) => (
            <button
              key={style.value}
              className={`style-button-creative ${selectedStyle === style.value ? "active" : ""}`}
              onClick={() => handleRewrite(style.value)}
              disabled={rewriting}
            >
              <span className="style-icon-creative">{style.icon}</span>
              <span className="style-label-creative">{style.label}</span>
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
              <div className="transformed-version">
                <div className="rewritten-text">{rewritten.rewritten_narrative}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

