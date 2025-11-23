import { useState } from "react";
import { analyzePatterns } from "../api";

export default function PatternAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await analyzePatterns();
      setAnalysis(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to analyze patterns");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pattern-analysis-page">
      <h2>Dream Pattern Analysis</h2>
      <p className="pattern-description">
        Discover hidden patterns across all your dreams. This AI-powered analysis will identify
        recurring themes, emotional trends, and personal insights from your dream journal.
      </p>

      {!analysis && !loading && (
        <div className="pattern-start">
          <button onClick={handleAnalyze} className="button-primary" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
            🔍 Analyze My Dream Patterns
          </button>
          <p className="pattern-note">
            You need at least 2 dreams to analyze patterns. The more dreams you have, the deeper the insights!
          </p>
        </div>
      )}

      {loading && (
        <div className="pattern-loading">
          <p>🔮 Analyzing your dreams...</p>
          <p className="pattern-loading-sub">This may take a moment as we examine all your dreams.</p>
        </div>
      )}

      {error && (
        <div className="error-card">
          <p className="error-text">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="pattern-results">
          <div className="pattern-section">
            <h3>🎯 Recurring Themes</h3>
            <p>{analysis.recurring_themes}</p>
          </div>

          <div className="pattern-section">
            <h3>💭 Emotional Patterns</h3>
            <p>{analysis.emotional_patterns}</p>
          </div>

          <div className="pattern-section">
            <h3>🔮 Symbol Patterns</h3>
            <p>{analysis.symbol_patterns}</p>
          </div>

          <div className="pattern-section">
            <h3>⏰ Temporal Insights</h3>
            <p>{analysis.temporal_insights}</p>
          </div>

          <div className="pattern-section">
            <h3>🌱 Personal Growth</h3>
            <p>{analysis.personal_growth}</p>
          </div>

          <div className="pattern-section highlight">
            <h3>💡 Recommendations</h3>
            <p>{analysis.recommendations}</p>
          </div>

          <button onClick={handleAnalyze} className="button-primary" style={{ marginTop: "2rem" }}>
            🔄 Re-analyze Patterns
          </button>
        </div>
      )}
    </div>
  );
}

