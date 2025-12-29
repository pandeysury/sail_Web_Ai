import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Calendar, Filter } from 'lucide-react';

interface FeedbackStats {
  total_feedback: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
  thumbs_up_percentage: number;
  thumbs_down_percentage: number;
}

interface FeedbackItem {
  id: number;
  conversation_id: string;
  client_id: string;
  question: string;
  answer: string;
  feedback_type: 'thumbs_up' | 'thumbs_down';
  comment: string | null;
  created_at: string;
}

interface DashboardData {
  stats: FeedbackStats;
  feedback_items: FeedbackItem[];
  total_pages: number;
  current_page: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Dashboard({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'thumbs_up' | 'thumbs_down'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, [clientId, filter, page]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        client_id: clientId,
        page: page.toString(),
        page_size: '20'
      });
      
      if (filter !== 'all') {
        params.append('feedback_type', filter);
      }

      const response = await fetch(`${API_BASE_URL}/api/feedback/dashboard?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = data ? [
    { name: 'Positive', value: data.stats.thumbs_up_count, color: '#10b981' },
    { name: 'Negative', value: data.stats.thumbs_down_count, color: '#ef4444' }
  ] : [];

  const barData = data ? [
    { name: 'Thumbs Up', count: data.stats.thumbs_up_count, fill: '#10b981' },
    { name: 'Thumbs Down', count: data.stats.thumbs_down_count, fill: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div className="dashboard-overlay">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <TrendingUp size={24} />
            <h2>Feedback Dashboard</h2>
            <span className="client-label">{clientId}</span>
          </div>
          <button className="dashboard-close" onClick={onClose}>×</button>
        </div>

        {data && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">
                  <MessageSquare size={24} />
                </div>
                <div className="stat-content">
                  <h3>{data.stats.total_feedback}</h3>
                  <p>Total Feedback</p>
                </div>
              </div>
              
              <div className="stat-card positive">
                <div className="stat-icon">
                  <ThumbsUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>{data.stats.thumbs_up_count}</h3>
                  <p>Positive ({data.stats.thumbs_up_percentage.toFixed(1)}%)</p>
                </div>
              </div>
              
              <div className="stat-card negative">
                <div className="stat-icon">
                  <ThumbsDown size={24} />
                </div>
                <div className="stat-content">
                  <h3>{data.stats.thumbs_down_count}</h3>
                  <p>Negative ({data.stats.thumbs_down_percentage.toFixed(1)}%)</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Feedback Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Feedback Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filters */}
            <div className="dashboard-filters">
              <div className="filter-group">
                <Filter size={16} />
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                  <option value="all">All Feedback</option>
                  <option value="thumbs_up">Positive Only</option>
                  <option value="thumbs_down">Negative Only</option>
                </select>
              </div>
            </div>

            {/* Feedback List */}
            <div className="feedback-list">
              <h3>Recent Feedback</h3>
              <div className="feedback-items">
                {data.feedback_items.map((item) => (
                  <div key={item.id} className={`feedback-item ${item.feedback_type}`}>
                    <div className="feedback-header">
                      <div className="feedback-type">
                        {item.feedback_type === 'thumbs_up' ? 
                          <ThumbsUp size={16} /> : 
                          <ThumbsDown size={16} />
                        }
                        <span>{item.feedback_type === 'thumbs_up' ? 'Positive' : 'Negative'}</span>
                      </div>
                      <div className="feedback-date">
                        <Calendar size={14} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="feedback-content">
                      <p className="question"><strong>Q:</strong> {item.question}</p>
                      <p className="answer"><strong>A:</strong> {item.answer.substring(0, 100)}...</p>
                      {item.comment && (
                        <p className="comment"><strong>Comment:</strong> {item.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {page} of {data.total_pages}</span>
                  <button 
                    disabled={page === data.total_pages} 
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}