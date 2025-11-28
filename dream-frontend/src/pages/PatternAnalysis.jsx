import { useState } from "react";
import { analyzePatterns } from "../api";

export default function PatternAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function renderLines(text) {
    // Handle null, undefined, or empty string
    if (!text || (typeof text === 'string' && text.trim() === '')) {
      return <p className="pattern-line">No content available.</p>;
    }
    
    // Ensure text is a string
    const textStr = String(text).trim();
    if (!textStr) {
      return <p className="pattern-line">No content available.</p>;
    }
    
    // First try splitting by newlines
    let segments = textStr.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    
    // If no newlines, try splitting by sentences
    if (segments.length === 0 || segments.length === 1) {
      segments = textStr
        .split(/(?<=[.!?])\s+/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
    
    // If still no segments, use the whole text
    if (segments.length === 0) {
      segments = [textStr];
    }
    
    return segments.map((line, idx) => (
      <p key={idx} className="pattern-line">{line}</p>
    ));
  }

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await analyzePatterns();
      console.log("Pattern analysis response:", res.data);
      setAnalysis(res.data);
    } catch (e) {
      console.error("Pattern analysis error:", e);
      setError(e.response?.data?.detail || "Failed to analyze patterns");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pattern-analysis-page-creative">
      {/* Floating background elements */}
      <div className="pattern-bg-elements">
        <div className="pattern-blob blob-1"></div>
        <div className="pattern-blob blob-2"></div>
      </div>

      <div className="pattern-header-creative">
        <div className="pattern-icon-wrapper">
          <span className="pattern-icon-large">🔮</span>
        </div>
        <h2 className="pattern-title-creative">Dream Pattern Analysis</h2>
        <p className="pattern-description-creative">
          Discover hidden patterns across all your dreams. This AI-powered analysis will identify
          recurring themes, emotional trends, and personal insights from your dream journal.
        </p>
      </div>

      {!analysis && !loading && (
        <div className="pattern-start-creative">
          <div className="start-cards-grid">
            <div className="feature-card-pattern">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🎯</span>
              </div>
              <h3 className="feature-title">Recurring Themes</h3>
              <p className="feature-description">Discover patterns that appear across your dreams</p>
            </div>
            <div className="feature-card-pattern">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">💭</span>
              </div>
              <h3 className="feature-title">Emotional Journey</h3>
              <p className="feature-description">Track how your emotions evolve in your dreams</p>
            </div>
            <div className="feature-card-pattern">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔮</span>
              </div>
              <h3 className="feature-title">Symbol Insights</h3>
              <p className="feature-description">Understand the deeper meaning of recurring symbols</p>
            </div>
            <div className="feature-card-pattern">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🌱</span>
              </div>
              <h3 className="feature-title">Personal Growth</h3>
              <p className="feature-description">See how your dreams reflect your inner journey</p>
            </div>
          </div>
          <div className="start-card-creative">
            <div className="start-icon-wrapper">
              <span className="start-icon">✨</span>
            </div>
            <h3 className="start-title">Ready to Discover Your Patterns?</h3>
            <p className="start-description">
              Our AI will analyze all your dreams to uncover hidden patterns, recurring themes, and meaningful insights.
            </p>
            <button onClick={handleAnalyze} className="analyze-button-creative">
              <span className="button-icon">🔍</span>
              <span>Analyze My Dream Patterns</span>
            </button>
            <p className="pattern-note-creative">
              💡 You need at least 2 dreams to analyze patterns. The more dreams you have, the deeper the insights!
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="pattern-loading-creative">
          <div className="loading-spinner-creative">
            <span className="spinner-icon">🔮</span>
          </div>
          <p className="loading-text-creative">Analyzing your dreams...</p>
          <p className="pattern-loading-sub-creative">This may take a moment as we examine all your dreams.</p>
        </div>
      )}

      {error && (
        <div className="error-card-creative">
          <span className="error-icon">⚠️</span>
          <p className="error-text-creative">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="pattern-results-creative">
          <div className="results-header-creative">
            <h3 className="results-title">Your Dream Pattern Insights</h3>
            <p className="results-subtitle">AI-powered analysis of your dream journal</p>
          </div>

          <div className="pattern-sections-grid">
            <div 
              className="pattern-section-creative"
              style={{ animationDelay: '0s' }}
            >
              <div className="pattern-section-header">
                <div className="section-icon-bg" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                  <span className="pattern-section-icon">🎯</span>
                </div>
                <h3>Recurring Themes</h3>
              </div>
              <div className="pattern-content-creative">
                {renderLines(analysis.recurring_themes)}
              </div>
            </div>

            <div 
              className="pattern-section-creative"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="pattern-section-header">
                <div className="section-icon-bg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                  <span className="pattern-section-icon">💭</span>
                </div>
                <h3>Emotional Patterns</h3>
              </div>
              <div className="pattern-content-creative">
                {renderLines(analysis.emotional_patterns)}
              </div>
            </div>

            <div 
              className="pattern-section-creative"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="pattern-section-header">
                <div className="section-icon-bg" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                  <span className="pattern-section-icon">🔮</span>
                </div>
                <h3>Symbol Patterns</h3>
              </div>
              <div className="pattern-content-creative">
                {renderLines(analysis.symbol_patterns)}
              </div>
            </div>

            <div 
              className="pattern-section-creative"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="pattern-section-header">
                <div className="section-icon-bg" style={{ background: 'linear-gradient(135deg, #d946ef, #e879f9)' }}>
                  <span className="pattern-section-icon">⏰</span>
                </div>
                <h3>Temporal Insights</h3>
              </div>
              <div className="pattern-content-creative">
                {renderLines(analysis.temporal_insights)}
              </div>
            </div>

            <div 
              className="pattern-section-creative"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="pattern-section-header">
                <div className="section-icon-bg" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                  <span className="pattern-section-icon">🌱</span>
                </div>
                <h3>Personal Growth</h3>
              </div>
              <div className="pattern-content-creative">
                {renderLines(analysis.personal_growth)}
              </div>
            </div>

            <div 
              className="pattern-section-creative highlight-creative"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="pattern-section-header">
                <div className="section-icon-bg" style={{ background: 'linear-gradient(135deg, #fbbf24, #fcd34d)' }}>
                  <span className="pattern-section-icon">💡</span>
                </div>
                <h3>Recommendations</h3>
              </div>
              <div className="pattern-content-creative">
                {renderLines(analysis.recommendations)}
              </div>
            </div>
          </div>

          <div className="reanalyze-section">
            <button onClick={handleAnalyze} className="reanalyze-button-creative">
              <span className="button-icon">🔄</span>
              <span>Re-analyze Patterns</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

