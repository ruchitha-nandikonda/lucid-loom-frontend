import { useEffect, useState } from "react";
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

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAnalytics();
        setData(res.data);
      } catch (e) {
        setError("Failed to load analytics");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return <p>No data available</p>;

  const { total_dreams, dreams_with_images, top_symbols, top_emotions, dreams_by_month } = data;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Dream Analytics</h2>
        <p className="analytics-subtitle">Visual insights into your dream journal</p>
      </div>

      {/* Summary Cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>Total Dreams</h3>
          <p className="analytics-number">{total_dreams}</p>
        </div>
        <div className="analytics-card">
          <h3>With Images</h3>
          <p className="analytics-number">{dreams_with_images}</p>
          <p className="analytics-subtext">
            {total_dreams > 0
              ? `${Math.round((dreams_with_images / total_dreams) * 100)}%`
              : "0%"}
          </p>
        </div>
        <div className="analytics-card">
          <h3>Unique Symbols</h3>
          <p className="analytics-number">{top_symbols.length}</p>
        </div>
        <div className="analytics-card">
          <h3>Emotions Tracked</h3>
          <p className="analytics-number">{top_emotions.length}</p>
        </div>
      </div>

      {/* Top Symbols */}
      {top_symbols.length > 0 && (
        <div className="analytics-section">
          <h3>Top Symbols</h3>
          <div className="analytics-list">
            {top_symbols.map((item, idx) => (
              <div key={idx} className="analytics-item">
                <div className="analytics-item-label">{item.symbol}</div>
                <div className="analytics-item-bar">
                  <div
                    className="analytics-item-fill"
                    style={{
                      width: `${(item.count / top_symbols[0].count) * 100}%`,
                    }}
                  />
                </div>
                <div className="analytics-item-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Emotions */}
      {top_emotions.length > 0 && (
        <div className="analytics-section">
          <h3>Top Emotions</h3>
          <div className="analytics-list">
            {top_emotions.map((item, idx) => (
              <div key={idx} className="analytics-item">
                <div className="analytics-item-label">{item.emotion}</div>
                <div className="analytics-item-bar">
                  <div
                    className="analytics-item-fill"
                    style={{
                      width: `${(item.count / top_emotions[0].count) * 100}%`,
                    }}
                  />
                </div>
                <div className="analytics-item-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trends - Bar Chart */}
      {dreams_by_month.length > 0 && (
        <div className="analytics-section">
          <h3>Dreams by Month</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dreams_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1020",
                    border: "1px solid #1f2933",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Trends - Line Chart */}
      {dreams_by_month.length > 0 && (
        <div className="analytics-section">
          <h3>Dream Trend Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dreams_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1020",
                    border: "1px solid #1f2933",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#a78bfa", r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Trends - Area Chart */}
      {dreams_by_month.length > 0 && (
        <div className="analytics-section">
          <h3>Dream Activity (Area Chart)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dreams_by_month}>
                <defs>
                  <linearGradient id="colorDreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1020",
                    border: "1px solid #1f2933",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorDreams)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Symbols - Pie Chart */}
      {top_symbols.length > 0 && (
        <div className="analytics-section">
          <h3>Symbol Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={top_symbols.slice(0, 8).map((item) => ({
                    name: item.symbol,
                    value: item.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {top_symbols.slice(0, 8).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        "#6366f1",
                        "#8b5cf6",
                        "#a78bfa",
                        "#c084fc",
                        "#d946ef",
                        "#ec4899",
                        "#f472b6",
                        "#fbbf24",
                      ][index % 8]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1020",
                    border: "1px solid #1f2933",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Emotions - Pie Chart */}
      {top_emotions.length > 0 && (
        <div className="analytics-section">
          <h3>Emotion Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={top_emotions.map((item) => ({
                    name: item.emotion,
                    value: item.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {top_emotions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        "#ef4444",
                        "#f97316",
                        "#fbbf24",
                        "#10b981",
                        "#3b82f6",
                        "#8b5cf6",
                        "#ec4899",
                      ][index % 7]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1020",
                    border: "1px solid #1f2933",
                    borderRadius: "8px",
                    color: "#e5e7eb",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
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

