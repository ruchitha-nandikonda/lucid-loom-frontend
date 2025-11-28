import { useEffect, useState, useMemo } from "react";
import { fetchAnalytics } from "../api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helper function to get symbol emoji (same as DreamDetail)
function getSymbolEmoji(symbol) {
  const symbolLower = symbol.toLowerCase().trim();
  const emojiMap = {
    'library': '📚', 'libraries': '📚',
    'book': '📖', 'books': '📖', 'page': '📄',
    'title': '📝', 'titles': '📝',
    'knowledge': '🧠', 'know': '🧠',
    'self-discovery': '🔍', 'self': '🪞', 'discovery': '🔍',
    'transformation': '🦋', 'transform': '🦋', 'change': '🔄',
    'uncertainty': '❓', 'uncertain': '❓', 'unknown': '❓',
    'ocean': '🌊', 'sea': '🌊', 'water': '💧', 'wave': '🌊',
    'shark': '🦈', 'sharks': '🦈', 'fish': '🐟',
    'fear': '😨', 'scared': '😱', 'afraid': '😨',
    'peace': '☮️', 'peaceful': '☮️', 'calm': '😌', 'calmness': '😌',
  };
  
  if (emojiMap[symbolLower]) return emojiMap[symbolLower];
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (symbolLower.includes(key) || key.includes(symbolLower)) {
      return emoji;
    }
  }
  
  return '🔮';
}

// Helper function to get emotion emoji (same as DreamDetail)
function getEmotionEmoji(emotion) {
  const emotionLower = emotion.toLowerCase().trim();
  const emojiMap = {
    'curiosity': '🔍', 'curious': '🔍',
    'wonder': '✨', 'wondering': '✨',
    'confusion': '😕', 'confused': '😕',
    'anticipation': '⏳', 'anticipate': '⏳',
    'fear': '😨', 'scared': '😱', 'afraid': '😨',
    'joy': '😄', 'joyful': '😄',
    'happiness': '😊', 'happy': '😊',
    'sadness': '😢', 'sad': '😢',
    'anger': '😠', 'angry': '😠',
    'peace': '☮️', 'peaceful': '☮️', 'calm': '😌',
    'excitement': '🤩', 'excited': '🤩',
    'love': '❤️', 'loving': '❤️',
    'awe': '😲', 'hopeful': '🌟', 'hope': '🌟',
    'caution': '⚠️', 'apprehension': '😰',
  };
  
  if (emojiMap[emotionLower]) return emojiMap[emotionLower];
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (emotionLower.includes(key) || key.includes(emotionLower)) {
      return emoji;
    }
  }
  
  return '💭';
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAnalytics();
      console.log("Analytics response:", res.data);
      
      // Validate response structure
      if (!res.data) {
        throw new Error("Invalid response from server");
      }
      
      setData(res.data);
      setRetryCount(0); // Reset retry count on success
    } catch (e) {
      console.error("Analytics error:", e);
      const errorMsg = e.response?.data?.detail || e.message || "Failed to load analytics. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadAnalytics();
  };

  // Extract data safely (hooks must be called before early returns)
  const { total_dreams, dreams_with_images, top_symbols, top_emotions, dreams_with_dates, dreams_by_day: legacy_dreams_by_day } = data || {};
  
  // Group dreams by local day (convert UTC to user's timezone)
  // This hook MUST be called before any early returns
  const dreams_by_day = useMemo(() => {
    // Handle legacy format (if backend hasn't been updated yet)
    if (legacy_dreams_by_day && Array.isArray(legacy_dreams_by_day)) {
      return legacy_dreams_by_day;
    }
    
    // Handle new format with timezone conversion
    if (!dreams_with_dates || !Array.isArray(dreams_with_dates) || dreams_with_dates.length === 0) {
      return [];
    }
    
    try {
      const dayGroups = {};
      
      dreams_with_dates.forEach(dream => {
        try {
          // Parse the ISO string and convert to local timezone
          if (!dream.created_at) return;
          
          const date = new Date(dream.created_at);
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dream.created_at);
            return;
          }
          
          // Get local date string (YYYY-MM-DD)
          const localDateStr = date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
          
          if (!localDateStr) {
            console.warn('Failed to format date:', date);
            return;
          }
          
          if (dayGroups[localDateStr]) {
            dayGroups[localDateStr] += dream.count || 1;
          } else {
            dayGroups[localDateStr] = dream.count || 1;
          }
        } catch (err) {
          console.error('Error processing dream date:', err, dream);
        }
      });
      
      // Convert to array and sort by date
      const dailyData = Object.entries(dayGroups)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day));
      
      // Return last 30 days if more than 30
      return dailyData.length > 30 ? dailyData.slice(-30) : dailyData;
    } catch (err) {
      console.error('Error processing dreams_by_day:', err);
      return [];
    }
  }, [dreams_with_dates, legacy_dreams_by_day]);

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="analytics-page-creative">
        <div className="analytics-loading-creative">
          <div className="loading-spinner-creative">
            <span className="spinner-icon">📊</span>
          </div>
          <p className="loading-text-creative">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page-creative">
        <div className="analytics-error-creative">
          <span className="error-icon-large">⚠️</span>
          <h3 className="error-title-creative">Failed to Load Analytics</h3>
          <p className="error-message-creative">{error}</p>
          <button onClick={handleRetry} className="retry-button-creative">
            <span className="retry-icon">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-page-creative">
        <div className="analytics-error-creative">
          <span className="error-icon-large">📊</span>
          <h3 className="error-title-creative">No Data Available</h3>
          <p className="error-message-creative">Unable to load analytics data. Please try again.</p>
          <button onClick={handleRetry} className="retry-button-creative">
            <span className="retry-icon">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page-creative">
      {/* Floating background elements */}
      <div className="analytics-bg-elements">
        <div className="analytics-blob blob-1"></div>
        <div className="analytics-blob blob-2"></div>
        <div className="analytics-blob blob-3"></div>
      </div>

      <div className="analytics-header-creative">
        <div className="header-icon-wrapper">
          <span className="header-icon-large">📊</span>
        </div>
        <h2 className="analytics-title-creative">Dream Analytics</h2>
        <p className="analytics-subtitle-creative">Visual insights into your dream journal</p>
      </div>

      {/* Summary Cards */}
      <div className="analytics-cards-creative">
        <div className="analytics-card-simple" style={{ animationDelay: '0s' }}>
          <div className="card-icon-simple">
            <span>🌙</span>
          </div>
          <div className="card-info-simple">
            <h3 className="card-label-simple">Total Dreams</h3>
            <p className="card-number-simple">{total_dreams}</p>
          </div>
        </div>
        <div className="analytics-card-simple" style={{ animationDelay: '0.1s' }}>
          <div className="card-icon-simple">
            <span>🖼️</span>
          </div>
          <div className="card-info-simple">
            <h3 className="card-label-simple">With Images</h3>
            <p className="card-number-simple">{dreams_with_images}</p>
            {total_dreams > 0 && (
              <p className="card-percentage-simple">
                {Math.round((dreams_with_images / total_dreams) * 100)}%
              </p>
            )}
          </div>
        </div>
        <div className="analytics-card-simple" style={{ animationDelay: '0.2s' }}>
          <div className="card-icon-simple">
            <span>🔮</span>
          </div>
          <div className="card-info-simple">
            <h3 className="card-label-simple">Unique Symbols</h3>
            <p className="card-number-simple">{top_symbols.length}</p>
          </div>
        </div>
        <div className="analytics-card-simple" style={{ animationDelay: '0.3s' }}>
          <div className="card-icon-simple">
            <span>💗</span>
          </div>
          <div className="card-info-simple">
            <h3 className="card-label-simple">Emotions Tracked</h3>
            <p className="card-number-simple">{top_emotions.length}</p>
          </div>
        </div>
      </div>

      {/* Top Emotions */}
      {top_emotions.length > 0 && (
        <div className="analytics-section-creative">
          <div className="section-header-creative">
            <span className="section-icon">💗</span>
            <h3>Top Emotions</h3>
          </div>
          <div className="emotions-list-shine">
            {top_emotions.slice(0, 3).map((item, idx) => {
              const emotionEmoji = getEmotionEmoji(item.emotion);
              const maxCount = top_emotions[0].count;
              const percentage = (item.count / maxCount) * 100;
              const gradients = [
                'linear-gradient(135deg, #ec4899, #f472b6, #fb7185)',
                'linear-gradient(135deg, #8b5cf6, #a78bfa, #c084fc)',
                'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)',
              ];
              const gradient = gradients[idx % gradients.length];
              const solidColors = ['#ec4899', '#8b5cf6', '#6366f1'];
              const solidColor = solidColors[idx % solidColors.length];
              
              return (
                <div key={idx} className="emotion-item-shine" style={{ animationDelay: `${idx * 0.15}s` }}>
                  <div className="emotion-glow-effect" style={{ background: gradient }}></div>
                  <div className="emotion-emoji-shine" style={{ background: gradient }}>
                    <span>{emotionEmoji}</span>
                  </div>
                  <div className="emotion-content-shine">
                    <div className="emotion-header-shine">
                      <span className="emotion-name-shine">{item.emotion}</span>
                    </div>
                    <div className="emotion-bar-shine">
                      <div 
                        className="emotion-fill-shine"
                        style={{ 
                          width: `${percentage}%`,
                          background: gradient
                        }}
                      >
                        <div className="fill-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Symbols - Vertical Bar Graph */}
      {top_symbols.length > 0 && (
        <div className="analytics-section-creative">
          <div className="section-header-creative">
            <span className="section-icon">🔮</span>
            <h3>Top Symbols</h3>
          </div>
          <div className="symbols-bar-graph-vertical">
            {top_symbols.slice(0, 7).map((item, idx) => {
              const symbolEmoji = getSymbolEmoji(item.symbol);
              const maxCount = top_symbols[0].count;
              const percentage = (item.count / maxCount) * 100;
              const height = 60 + (percentage / 100) * 200; // Height between 60px and 260px
              const colors = [
                'linear-gradient(180deg, #ec4899, #f472b6)',
                'linear-gradient(180deg, #8b5cf6, #a78bfa)',
                'linear-gradient(180deg, #6366f1, #818cf8)',
                'linear-gradient(180deg, #d946ef, #e879f9)',
                'linear-gradient(180deg, #f472b6, #fb7185)',
                'linear-gradient(180deg, #a78bfa, #c084fc)',
                'linear-gradient(180deg, #818cf8, #a5b4fc)',
              ];
              const gradient = colors[idx % colors.length];
              
              return (
                <div key={idx} className="symbol-bar-vertical-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="bar-vertical-container">
                    <div 
                      className="bar-vertical-fill"
                      style={{ 
                        height: `${height}px`,
                        background: gradient
                      }}
                    >
                      <div className="bar-vertical-shine"></div>
                    </div>
                  </div>
                  <div className="bar-vertical-label">
                    <span className="bar-vertical-emoji">{symbolEmoji}</span>
                    <span className="bar-vertical-name">{item.symbol}</span>
                    <span className="bar-vertical-count">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Daily Trends - Timeline Visualization */}
      {dreams_by_day && dreams_by_day.length > 0 ? (
        <div className="analytics-section-creative-enhanced">
          <div className="section-header-creative-enhanced">
            <div className="section-icon-wrapper-enhanced">
              <span className="section-icon-enhanced">📅</span>
            </div>
            <div>
              <h3 className="section-title-enhanced">Dreams by Day</h3>
              <p className="section-subtitle-enhanced">Your dream journal activity over time</p>
            </div>
          </div>
          <div className="timeline-visualization">
            {dreams_by_day.map((item, idx) => {
              const date = new Date(item.day);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();
              const monthName = date.toLocaleDateString('en-US', { month: 'short' });
              const maxCount = Math.max(...dreams_by_day.map(d => d.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const height = 40 + (percentage / 100) * 200; // Height between 40px and 240px
              const colors = [
                '#ec4899', '#8b5cf6', '#6366f1', '#d946ef', '#f472b6', '#a78bfa'
              ];
              const color = colors[idx % colors.length];
              const isLast = idx === dreams_by_day.length - 1;
              
              return (
                <div key={idx} className="timeline-item-wrapper">
                  <div className="timeline-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="timeline-dot" style={{ backgroundColor: color }}>
                      <span className="timeline-count">{item.count}</span>
                    </div>
                    <div 
                      className="timeline-bar"
                      style={{ 
                        height: `${height}px`,
                        backgroundColor: color,
                        opacity: 0.8
                      }}
                    />
                    {!isLast && (
                      <div className="timeline-connector" style={{ backgroundColor: color }} />
                    )}
                  </div>
                  <div className="timeline-label">
                    <span className="timeline-day">{dayName}</span>
                    <span className="timeline-date">{dayNumber}</span>
                    <span className="timeline-month">{monthName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="analytics-section-creative-enhanced">
          <div className="section-header-creative-enhanced">
            <div className="section-icon-wrapper-enhanced">
              <span className="section-icon-enhanced">📅</span>
            </div>
            <div>
              <h3 className="section-title-enhanced">Dreams by Day</h3>
              <p className="section-subtitle-enhanced">Your dream journal activity over time</p>
            </div>
          </div>
          <div className="analytics-empty-section">
            <p>No daily data available yet. Start logging your dreams to see daily trends!</p>
          </div>
        </div>
      )}

      {total_dreams === 0 && (
        <div className="analytics-empty">
          <p>No dreams yet. Start logging your dreams to see analytics!</p>
        </div>
      )}
    </div>
  );
}

