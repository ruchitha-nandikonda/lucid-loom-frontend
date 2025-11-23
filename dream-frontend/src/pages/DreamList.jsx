import { useEffect, useMemo, useState } from "react";
import { fetchDreams, regenerateDream } from "../api";
import { Link } from "react-router-dom";

export default function DreamList() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState(new Set());
  const [regenerating, setRegenerating] = useState(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDreams();
        setDreams(res.data);
      } catch (e) {
        console.error(e);
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
    return set.toArray().slice(0, 40).sort();
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
        if (isNaN(date.getTime())) return;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = (months[monthKey] || 0) + 1;
      } catch (e) {
        console.error("Error processing date:", e);
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
      <div>
        <h2>Your dream journal is empty</h2>
        <Link to="/new" className="button-primary">
          Add your first dream
        </Link>
      </div>
    );

  return (
    <div>
      <div className="dream-list-header">
        <h2>My Dreams</h2>
      </div>

      {/* Visual Timeline */}
      {timelineData && timelineData.length > 0 && (
        <div className="timeline-visual">
          <div className="timeline-header">
            <h3>📅 Dream Timeline</h3>
            <span className="timeline-summary">
              {dreams.length} {dreams.length === 1 ? 'dream' : 'dreams'} across {timelineData.length} {timelineData.length === 1 ? 'month' : 'months'}
            </span>
          </div>
          <div className="timeline-bar">
            {timelineData.map((item, idx) => {
              if (!item || !item.count) return null;
              const counts = timelineData.map(d => d.count || 0).filter(c => c > 0);
              const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 10;
              const monthName = item.month ? new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }) : '';
              return (
                <div key={idx} className="timeline-item" title={`${item.month}: ${item.count} ${item.count === 1 ? 'dream' : 'dreams'}`}>
                  <div className="timeline-bar-wrapper">
                    <div 
                      className="timeline-bar-fill" 
                      style={{ 
                        height: `${Math.max(height, 10)}%`,
                        background: `linear-gradient(to top, #6366f1, #8b5cf6)`
                      }}
                    >
                      <span className="timeline-count-badge">{item.count}</span>
                    </div>
                  </div>
                  <div className="timeline-label">{monthName}</div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      )}
      <div className="list-controls">
        <input
          className="search-input"
          placeholder="Search title, text, symbols, emotions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {allTags.length > 0 && (
        <div className="tag-row">
          {allTags.map((t) => (
            <button
              key={t}
              className={`tag ${activeTags.has(t) ? "active" : ""}`}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
          {activeTags.size > 0 && (
            <button className="tag clear" onClick={() => setActiveTags(new Set())}>
              clear
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="dream-date" style={{ marginTop: 12 }}>
          No dreams match your filters.
        </p>
      ) : (
        <div className="dream-grid">
          {filtered.map((d) => {
            const thumb = d?.interpretation?.image_url;
            const preview = d?.interpretation?.poetic_narrative?.slice(0, 120);
            const needsRegen = !d.interpretation || !thumb;
            const isRegenerating = regenerating.has(d.id);
            return (
              <div key={d.id} className="dream-card-wrapper">
                <Link to={`/dreams/${d.id}`} className="dream-card">
                  {thumb ? (
                    <img src={thumb} alt="" className="dream-thumb" />
                  ) : (
                    <div className="dream-thumb placeholder">No image</div>
                  )}
                  <div className="dream-card-body">
                    <h3>{d.title}</h3>
                    <p className="dream-date">
                      {new Date(d.created_at).toLocaleString()}
                    </p>
                    {preview && <p className="dream-preview">{preview}…</p>}
                  </div>
                </Link>
                {needsRegen && (
                  <button
                    className="btn-regenerate-small"
                    onClick={(e) => handleRegenerate(d.id, e)}
                    disabled={isRegenerating}
                    title="Regenerate AI interpretation and image"
                  >
                    {isRegenerating ? "🔄..." : "🔄"}
                  </button>
                )}
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

