import { useEffect, useMemo, useState } from "react";
import { fetchDreams, regenerateDream, getToken, setAuthToken } from "../api";
import { Link, useNavigate } from "react-router-dom";

// Component to handle image loading with error state
function DreamImage({ imageUrl, dreamId, fallbackEmoji = '💭' }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageBlobUrl, setImageBlobUrl] = useState(null);

  useEffect(() => {
    // Reset error state when imageUrl changes
    setImageError(false);
    setImageLoading(true);
    
    // Clean up previous blob URL
    if (imageBlobUrl) {
      URL.revokeObjectURL(imageBlobUrl);
      setImageBlobUrl(null);
    }
    
    if (!imageUrl) {
      setImageLoading(false);
      return;
    }
    
    // If the URL is from Azure Blob Storage, fetch through proxy with auth
    if (imageUrl.includes('blob.core.windows.net') || imageUrl.includes('oaidalle')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const encodedUrl = encodeURIComponent(imageUrl);
      const proxyUrl = `${apiUrl}/api/images/proxy?url=${encodedUrl}`;
      
      // Fetch image as blob with authentication
      const token = getToken();
      fetch(proxyUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          setImageBlobUrl(blobUrl);
          setImageLoading(false);
          console.log('Image loaded successfully for dream', dreamId);
        })
        .catch(error => {
          console.error('Image failed to load for dream', dreamId, ':', error);
          setImageError(true);
          setImageLoading(false);
        });
    } else {
      // For non-Azure URLs, use directly
      setImageBlobUrl(imageUrl);
      setImageLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (imageBlobUrl && imageBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageBlobUrl);
      }
    };
  }, [imageUrl, dreamId]);

  if (!imageUrl || imageError) {
    return (
      <div className="dream-thumb-creative placeholder-creative">
        <span className="placeholder-icon-creative">{fallbackEmoji}</span>
        <span className="placeholder-text-creative">No image</span>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div className="dream-thumb-creative placeholder-creative" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <span className="placeholder-icon-creative">{fallbackEmoji}</span>
          <span className="placeholder-text-creative">Loading...</span>
        </div>
      )}
      {imageBlobUrl && !imageLoading && (
        <img 
          src={imageBlobUrl} 
          alt="" 
          className="dream-thumb-creative"
          onError={(e) => {
            console.error('Image render failed for dream', dreamId);
            setImageError(true);
          }}
        />
      )}
      <div className="dream-image-overlay"></div>
    </>
  );
}

export default function DreamList() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState(new Set());
  const [regenerating, setRegenerating] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        console.log("📋 Loading dreams...");
        const res = await fetchDreams();
        console.log("✅ Dreams loaded:", res.data?.length || 0, "dreams");
        setDreams(res.data || []);
      } catch (e) {
        console.error("❌ Error loading dreams:", e);
        console.error("❌ Error details:", e.response?.data);
        if (e.response?.status === 401 || e.response?.status === 403) {
          console.error("⚠️ Unauthorized - clearing token and redirecting to login");
          // Clear tokens and redirect to login
          setAuthToken(null);
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
          return;
        }
        setDreams([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function extractTags(d) {
    const tags = new Set();
    const sym = d?.interpretation?.symbols || "";
    const emo = d?.interpretation?.emotions || "";
    
    // Handle symbols - could be JSON string or plain text
    if (sym) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(sym);
        if (typeof parsed === 'object' && parsed !== null) {
          // It's a JSON object, extract keys (symbol names)
          Object.keys(parsed).forEach(key => {
            const cleanKey = key.trim().toLowerCase();
            if (cleanKey.length > 1) {
              tags.add(cleanKey);
            }
          });
        } else {
          // Not an object, treat as string
          throw new Error('Not an object');
        }
      } catch (e) {
        // Not JSON, treat as plain text
        sym
          .split(/[,/|;]+|\n/g)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
          .forEach((t) => {
            if (t.length > 1) tags.add(t);
          });
      }
    }
    
    // Handle emotions - should be comma-separated string
    if (emo) {
      emo
        .split(/[,/|;]+|\n/g)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .forEach((t) => {
          if (t.length > 1) tags.add(t);
        });
    }
    
    return Array.from(tags);
  }

  const allTags = useMemo(() => {
    const set = new HashSetShim();
    dreams.forEach((d) => {
      extractTags(d).forEach((t) => set.add(t));
    });
    return set.toArray().slice(0, 12).sort(); // Limit to 12 tags for better UI
  }, [dreams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const required = Array.from(activeTags);
    return dreams.filter((d) => {
      const titleMatch = d.title.toLowerCase().includes(q);
      const textMatch = d.raw_text?.toLowerCase().includes(q);
      const narrative = (d?.interpretation?.poetic_narrative || "").toLowerCase();
      const meaning = (d?.interpretation?.meaning || "").toLowerCase();
      const symbols = (d?.interpretation?.symbols || "").toLowerCase();
      const emotions = (d?.interpretation?.emotions || "").toLowerCase();
      const anyText =
        (q ? (titleMatch || textMatch || narrative.includes(q) || meaning.includes(q) || symbols.includes(q) || emotions.includes(q)) : true);
      if (!anyText) return false;
      if (required.length === 0) return true;
      const tags = new Set(extractTags(d));
      return required.every((t) => tags.has(t));
    });
  }, [dreams, search, activeTags]);

  // Calculate timeline data - MUST be before any early returns (React hooks rule)
  const timelineData = useMemo(() => {
    if (!dreams || dreams.length === 0) return [];
    const months = {};
    dreams.forEach(d => {
      if (!d || !d.created_at) return;
      try {
        const date = new Date(d.created_at);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", d.created_at);
          return;
        }
        // Use UTC methods to avoid timezone issues
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // getUTCMonth() returns 0-11
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        months[monthKey] = (months[monthKey] || 0) + 1;
      } catch (e) {
        console.error("Error processing date:", e, d.created_at);
      }
    });
    return Object.entries(months)
      .sort()
      .map(([month, count]) => ({ month, count }));
  }, [dreams]);

  function toggleTag(tag) {
    const next = new Set(activeTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setActiveTags(next);
  }

  function formatDreamDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format as: "Jan 15, 2024" (date only, no time to avoid timezone issues)
      // Or with time: "Jan 15, 2024 at 2:30 PM"
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

  function getMonthEmoji(monthName) {
    const monthEmojis = {
      'Jan': '❄️', 'Feb': '💝', 'Mar': '🌸', 'Apr': '🌷',
      'May': '🌺', 'Jun': '☀️', 'Jul': '🌻', 'Aug': '🌊',
      'Sep': '🍂', 'Oct': '🎃', 'Nov': '🍁', 'Dec': '🎄'
    };
    return monthEmojis[monthName] || '📅';
  }

  function getTagEmoji(tag) {
    const tagLower = tag.toLowerCase();
    const emojiMap = {
      'fear': '😨', 'anxiety': '😰', 'joy': '😄', 'happiness': '😊', 'sadness': '😢', 'anger': '😠',
      'peace': '☮️', 'wonder': '🤔', 'confusion': '😕', 'excitement': '🤩', 'calm': '😌', 'love': '❤️',
      'ocean': '🌊', 'sea': '🌊', 'water': '💧', 'wave': '🌊',
      'shark': '🦈', 'fish': '🐟', 'whale': '🐋', 'dolphin': '🐬',
      'bird': '🐦', 'eagle': '🦅', 'owl': '🦉', 'crow': '🐦‍⬛',
      'tree': '🌳', 'forest': '🌲', 'flower': '🌸', 'rose': '🌹',
      'moon': '🌙', 'sun': '☀️', 'star': '⭐', 'sky': '☁️',
      'fire': '🔥', 'flame': '🔥', 'lightning': '⚡', 'storm': '⛈️',
      'mountain': '⛰️', 'hill': '🏔️', 'valley': '🏞️',
      'house': '🏠', 'building': '🏢', 'door': '🚪', 'window': '🪟',
      'car': '🚗', 'road': '🛣️', 'bridge': '🌉',
      'snake': '🐍', 'dragon': '🐉', 'tiger': '🐅', 'lion': '🦁',
      'cat': '🐱', 'dog': '🐶', 'wolf': '🐺', 'bear': '🐻',
      'key': '🗝️', 'lock': '🔒', 'gate': '🚧',
      'mirror': '🪞', 'glass': '🪟', 'crystal': '💎',
      'book': '📖', 'page': '📄', 'letter': '✉️',
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
      'blood': '🩸', 'red': '🔴',
      'tear': '😢', 'cry': '😭',
      'smile': '😊', 'happy': '😄',
      'scared': '😱',
      'mad': '😡', 'rage': '😤',
    };
    
    // Try exact match first
    if (emojiMap[tagLower]) {
      return emojiMap[tagLower];
    }
    
    // Try partial match
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (tagLower.includes(key) || key.includes(tagLower)) {
        return emoji;
      }
    }
    
    // Default emoji based on first letter (avoid moon unless explicitly mentioned)
    if (tagLower.startsWith('f')) return '🔥';
    if (tagLower.startsWith('w')) return '💧';
    if (tagLower.startsWith('s')) return '⭐';
    if (tagLower.startsWith('d')) return '💎';
    if (tagLower.startsWith('l')) return '💡';
    if (tagLower.startsWith('h')) return '🏠';
    if (tagLower.startsWith('m')) return '🌳';
    if (tagLower.startsWith('t')) return '🌳';
    if (tagLower.startsWith('c')) return '💎';
    if (tagLower.startsWith('a')) return '⭐';
    if (tagLower.startsWith('n')) return '💫';
    if (tagLower.startsWith('b')) return '📖';
    if (tagLower.startsWith('p')) return '🌸';
    if (tagLower.startsWith('r')) return '🌹';
    if (tagLower.startsWith('e')) return '✨';
    if (tagLower.startsWith('g')) return '🌺';
    if (tagLower.startsWith('k')) return '🗝️';
    if (tagLower.startsWith('j')) return '🎉';
    if (tagLower.startsWith('o')) return '🌊';
    if (tagLower.startsWith('q')) return '👑';
    if (tagLower.startsWith('u')) return '🌌';
    if (tagLower.startsWith('v')) return '💫';
    if (tagLower.startsWith('x')) return '✨';
    if (tagLower.startsWith('y')) return '⭐';
    if (tagLower.startsWith('z')) return '✨';
    
    return '✨'; // Default sparkle emoji
  }

  function getDreamEmoji(dream) {
    // Combine all text from the dream to find the best matching emoji
    const allText = [
      dream.title || '',
      dream.raw_text || '',
      dream?.interpretation?.symbols || '',
      dream?.interpretation?.emotions || '',
      dream?.interpretation?.poetic_narrative || '',
    ].join(' ').toLowerCase();

    // Extract tags from the dream
    const tags = extractTags(dream);
    
    // Try to find emoji from tags first (most specific)
    // Check all tags, not just the first one
    // Only use moon if tag explicitly contains moon-related words
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      // Skip moon-related tags unless they're explicitly about moon
      if (tagLower.includes('moon') || tagLower.includes('lunar') || tagLower.includes('night')) {
        return '🌙';
      }
      const tagEmoji = getTagEmoji(tag);
      if (tagEmoji !== '✨' && tagEmoji !== '🌙') {
        return tagEmoji; // Return first non-default, non-moon emoji
      }
    }

    // Search for keywords in the combined text (prioritize more specific matches)
    const keywordMap = {
      // Water & Ocean
      'ocean': '🌊', 'sea': '🌊', 'water': '💧', 'wave': '🌊', 'beach': '🏖️', 'swimming': '🏊',
      'shark': '🦈', 'fish': '🐟', 'whale': '🐋', 'dolphin': '🐬',
      // Animals
      'bird': '🐦', 'eagle': '🦅', 'owl': '🦉', 'crow': '🐦‍⬛', 'flying': '🕊️',
      'snake': '🐍', 'dragon': '🐉', 'tiger': '🐅', 'lion': '🦁',
      'cat': '🐱', 'dog': '🐶', 'wolf': '🐺', 'bear': '🐻',
      // Nature
      'tree': '🌳', 'forest': '🌲', 'flower': '🌸', 'rose': '🌹', 'garden': '🌺',
      'mountain': '⛰️', 'hill': '🏔️', 'valley': '🏞️',
      // Celestial (only if explicitly mentioned)
      'sun': '☀️', 'star': '⭐', 'sky': '☁️',
      'moon': '🌙', 'lunar': '🌙', 'moonlight': '🌙',
      // Weather
      'fire': '🔥', 'flame': '🔥', 'lightning': '⚡', 'storm': '⛈️',
      'rain': '🌧️', 'snow': '❄️', 'ice': '🧊',
      'wind': '💨', 'air': '💨', 'breeze': '💨',
      // Buildings & Places
      'house': '🏠', 'building': '🏢', 'door': '🚪', 'window': '🪟', 'home': '🏠',
      'library': '📚', 'book': '📖', 'page': '📄', 'letter': '✉️',
      'car': '🚗', 'road': '🛣️', 'bridge': '🌉', 'driving': '🚗',
      // Emotions (only if strong presence)
      'fear': '😨', 'scared': '😱', 'anxiety': '😰', 'afraid': '😨', 'terrified': '😱',
      'joy': '😄', 'happy': '😊', 'happiness': '😊', 'excited': '🤩', 'celebrate': '🎉',
      'sad': '😢', 'sadness': '😢', 'cry': '😭', 'tear': '😢', 'depressed': '😢',
      'anger': '😠', 'mad': '😡', 'rage': '😤', 'furious': '😡',
      'peace': '☮️', 'calm': '😌', 'peaceful': '☮️', 'serene': '😌',
      'love': '❤️', 'heart': '❤️', 'kiss': '💋', 'romantic': '💕',
      // Objects
      'key': '🗝️', 'lock': '🔒', 'gate': '🚧',
      'mirror': '🪞', 'glass': '🪟', 'crystal': '💎',
      'eye': '👁️', 'vision': '👁️', 'see': '👁️', 'watching': '👁️',
      'hand': '✋', 'finger': '👉', 'touch': '✋',
      'foot': '🦶', 'walk': '🚶', 'run': '🏃', 'running': '🏃',
      'flight': '✈️', 'fly': '🕊️', 'wing': '🪽', 'flying': '✈️', 'airplane': '✈️',
      'death': '💀', 'skull': '💀', 'grave': '🪦',
      'baby': '👶', 'child': '🧒', 'person': '👤',
      'money': '💰', 'coin': '🪙', 'gold': '🪙',
      'food': '🍽️', 'apple': '🍎', 'bread': '🍞', 'eating': '🍽️',
      'knife': '🔪', 'sword': '⚔️', 'weapon': '🗡️',
      'crown': '👑', 'king': '👑', 'queen': '👸',
      'ring': '💍', 'jewelry': '💎', 'diamond': '💎',
      'clock': '🕐', 'time': '⏰', 'hourglass': '⏳',
      'light': '💡', 'lamp': '🪔', 'candle': '🕯️',
      'dark': '🌑', 'shadow': '🌑', 'darkness': '🌑',
      'earth': '🌍', 'ground': '🌍', 'soil': '🌱',
      'blood': '🩸', 'red': '🔴',
      // Common dream themes
      'lost': '🔍', 'searching': '🔍', 'finding': '🔍',
      'chasing': '🏃', 'running away': '🏃',
      'falling': '⬇️',
    };

    // Check for keywords in the text (prioritize longer/more specific matches)
    const sortedKeywords = Object.keys(keywordMap).sort((a, b) => b.length - a.length);
    for (const keyword of sortedKeywords) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(allText)) {
        return keywordMap[keyword];
      }
    }

    // Try partial matches if no exact word matches
    for (const keyword of sortedKeywords) {
      if (allText.includes(keyword)) {
        return keywordMap[keyword];
      }
    }

    // Only use moon if explicitly mentioned (moon, lunar, moonlight - but NOT just "night" or "dark")
    const moonKeywords = ['moon', 'lunar', 'moonlight', 'crescent moon', 'full moon'];
    const hasMoon = moonKeywords.some(keyword => allText.includes(keyword));
    if (hasMoon) {
      return '🌙';
    }

    // More varied defaults based on first letter (NO moon in fallbacks)
    const firstChar = (dream.title || '').toLowerCase().charAt(0);
    const letterEmojis = {
      'a': '⭐', 'b': '📖', 'c': '💎', 'd': '💭', 'e': '✨',
      'f': '🔥', 'g': '🌺', 'h': '🏠', 'i': '💡', 'j': '🎉',
      'k': '🗝️', 'l': '💡', 'm': '🌳', 'n': '💫', 'o': '🌊', // Changed 'n' from moon to star
      'p': '🌸', 'q': '👑', 'r': '🌹', 's': '⭐', 't': '🌳',
      'u': '🌌', 'v': '💫', 'w': '💧', 'x': '✨', 'y': '⭐', 'z': '✨'
    };
    
    if (firstChar && letterEmojis[firstChar]) {
      return letterEmojis[firstChar];
    }

    return '💭'; // Default dream emoji (not moon)
  }


  async function handleRegenerate(dreamId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Regenerate AI interpretation and image for this dream?")) {
      return;
    }
    setRegenerating(prev => new Set(prev).add(dreamId));
    try {
      await regenerateDream(dreamId);
      setTimeout(async () => {
        try {
          const res = await fetchDreams();
          setDreams(res.data);
        } catch (e) {
          console.error("Failed to reload dreams:", e);
        }
        setRegenerating(prev => {
          const next = new Set(prev);
          next.delete(dreamId);
          return next;
        });
      }, 3000);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to regenerate dream");
      setRegenerating(prev => {
        const next = new Set(prev);
        next.delete(dreamId);
        return next;
      });
    }
  }

  if (loading) return <p>Loading your dreams...</p>;

  if (dreams.length === 0)
    return (
      <div className="dream-list-page">
        <div className="empty-state-creative">
          <div className="empty-state-bg-animation">
            <div className="floating-emoji emoji-1">🌙</div>
            <div className="floating-emoji emoji-2">✨</div>
            <div className="floating-emoji emoji-3">💭</div>
            <div className="floating-emoji emoji-4">🔮</div>
            <div className="floating-emoji emoji-5">⭐</div>
            <div className="floating-emoji emoji-6">🌌</div>
          </div>
          
          <div className="empty-state-content">
            <div className="empty-state-icon-wrapper">
              <div className="empty-state-icon-glow"></div>
              <span className="empty-state-main-icon">🌌</span>
            </div>
            
            <h2 className="empty-state-title">
              <span className="title-line-1">Your Dream Journey</span>
              <span className="title-line-2">Begins Here</span>
            </h2>
            
            <p className="empty-state-description">
              Capture your dreams, explore their meanings, and discover patterns in your subconscious.
              <br />
              <span className="description-highlight">Start by adding your first dream!</span>
            </p>
            
            <div className="empty-state-features">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span className="feature-text">AI-Powered Analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🖼️</span>
                <span className="feature-text">Dream Visualizations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Pattern Insights</span>
              </div>
            </div>
            
            <Link to="/new" className="empty-state-cta-button">
              <span className="cta-icon">✨</span>
              <span className="cta-text">Create Your First Dream</span>
              <span className="cta-arrow">→</span>
            </Link>
            
            <div className="empty-state-tips">
              <p className="tips-title">💡 Quick Tips:</p>
              <ul className="tips-list">
                <li>Write down your dream as soon as you wake up</li>
                <li>Include details about emotions, colors, and symbols</li>
                <li>Our AI will help you understand the deeper meaning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="dream-list-page">
      {/* Floating background elements */}
      <div className="dream-list-bg-elements">
        <div className="floating-blob blob-1"></div>
        <div className="floating-blob blob-2"></div>
        <div className="floating-blob blob-3"></div>
      </div>

      <div className="dream-list-header-creative">
        <div className="header-content">
          <h2 className="dream-list-title">
            <span className="title-icon">🌙</span>
            <span className="title-text">My Dreams</span>
          </h2>
          <p className="dream-list-subtitle">
            {dreams.length} {dreams.length === 1 ? 'dream' : 'dreams'} captured in your journal
          </p>
        </div>
      </div>

      {/* Visual Timeline */}
      {timelineData && timelineData.length > 0 && (
        <div className="timeline-visual-creative-new">
          <div className="timeline-header-creative-new">
            <div className="timeline-icon-wrapper-new">
              <span className="timeline-icon-large-new">📅</span>
            </div>
            <div className="timeline-header-text-new">
              <h3 className="timeline-title-new">Dream Timeline</h3>
              <span className="timeline-summary-new">
                {dreams.length} {dreams.length === 1 ? 'dream' : 'dreams'} across {timelineData.length} {timelineData.length === 1 ? 'month' : 'months'}
              </span>
            </div>
          </div>
          <div className="timeline-pattern-creative-new">
            {timelineData.map((item, idx) => {
              if (!item || !item.count) return null;
              const counts = timelineData.map(d => d.count || 0).filter(c => c > 0);
              const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
              const width = maxCount > 0 ? (item.count / maxCount) * 100 : 10;
              
              // Fix month parsing - handle YYYY-MM format correctly
              let monthName = '';
              if (item.month) {
                try {
                  // Parse YYYY-MM format
                  const [year, month] = item.month.split('-');
                  const monthNum = parseInt(month, 10) - 1; // JavaScript months are 0-indexed
                  const date = new Date(parseInt(year, 10), monthNum, 1);
                  monthName = date.toLocaleDateString('en-US', { month: 'short' });
                } catch (e) {
                  // Fallback
                  monthName = item.month;
                }
              }
              
              const colors = [
                '#ec4899', '#f472b6', '#a78bfa', '#8b5cf6', '#c084fc', '#d946ef', '#6366f1'
              ];
              const color = colors[idx % colors.length];
              return (
                <div key={idx} className="timeline-pattern-item-new" title={`${item.month}: ${item.count} ${item.count === 1 ? 'dream' : 'dreams'}`}>
                  <div className="timeline-pattern-label-new">
                    <span className="month-emoji">{getMonthEmoji(monthName)}</span>
                    <span className="month-text">{monthName}</span>
                  </div>
                  <div className="timeline-pattern-bar-container-new">
                    <div 
                      className="timeline-pattern-bar-new" 
                      style={{ 
                        width: `${Math.max(width, 15)}%`,
                        background: `linear-gradient(90deg, ${color}, ${colors[(idx + 1) % colors.length]})`,
                        animationDelay: `${idx * 0.1}s`
                      }}
                    >
                      <span className="timeline-pattern-count-new">{item.count}</span>
                      <div className="timeline-bar-shine"></div>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      )}
      
      <div className="list-controls-creative">
        <div className="search-wrapper-creative">
          <span className="search-icon">🔍</span>
          <input
            className="search-input-creative"
            placeholder="Search title, text, symbols, emotions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-row-creative">
          <div className="tag-row-header">
            <span className="tag-icon">🏷️</span>
            <span className="tag-label">Filter by tags</span>
            {activeTags.size > 0 && (
              <button className="tag-clear-creative" onClick={() => setActiveTags(new Set())}>
                ✕ Clear all
              </button>
            )}
          </div>
          <div className="tag-container-creative">
            {allTags.map((t) => (
              <button
                key={t}
                className={`tag-creative ${activeTags.has(t) ? "active" : ""}`}
                onClick={() => toggleTag(t)}
                style={{
                  animationDelay: `${(allTags.indexOf(t) % 20) * 0.05}s`
                }}
              >
                <span className="tag-sparkle">{getTagEmoji(t)}</span>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="no-dreams-creative">
          <div className="no-dreams-icon">🌌</div>
          <h3>No dreams match your filters</h3>
          <p>Try adjusting your search or tags</p>
        </div>
      ) : (
        <div className="dream-grid-creative">
          {filtered.map((d, idx) => {
            const thumb = d?.interpretation?.image_url;
            const preview = d?.interpretation?.poetic_narrative?.slice(0, 120);
            const needsRegen = !d.interpretation || !thumb;
            const isRegenerating = regenerating.has(d.id);
            const dreamEmoji = getDreamEmoji(d);
            
            // Debug logging
            if (d.id && !thumb) {
              console.log('Dream', d.id, 'has no image_url:', {
                hasInterpretation: !!d.interpretation,
                interpretation: d.interpretation
              });
            }
            
            return (
              <div 
                key={d.id} 
                className="dream-card-wrapper-creative"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Link to={`/dreams/${d.id}`} className="dream-card-creative">
                  <div className="dream-card-image-wrapper">
                    <DreamImage imageUrl={thumb} dreamId={d.id} fallbackEmoji={dreamEmoji} />
                  </div>
                  <div className="dream-card-body-creative">
                    <h3 className="dream-card-title-creative">{d.title}</h3>
                    <p className="dream-date-creative">
                      <span className="date-icon">📅</span>
                      {formatDreamDate(d.created_at)}
                    </p>
                    {preview && (
                      <p className="dream-preview-creative">
                        <span className="preview-icon">💭</span>
                        {preview}…
                      </p>
                    )}
                  </div>
                  <div className="dream-card-glow"></div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Small helper to use Set but keep stable array yield for memoization
class HashSetShim {
  constructor() {
    this._set = new Set();
  }
  add(v) { this._set.add(v); }
  toArray() { return Array.from(this._set); }
}

