import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';

interface FeedbackButtonsProps {
  conversationId: string;
  clientId: string;
  question: string;
  answer: string;
  userId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function FeedbackButtons({ 
  conversationId, 
  clientId, 
  question, 
  answer, 
  userId 
}: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async (feedbackType: 'thumbs_up' | 'thumbs_down', feedbackComment?: string) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          client_id: clientId,
          question,
          answer,
          feedback_type: feedbackType,
          comment: feedbackComment || null,
          user_id: userId || null,
        }),
      });

      if (response.ok) {
        setFeedback(feedbackType);
        setShowCommentModal(false);
        setComment('');
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleThumbsUp = () => {
    if (feedback === 'thumbs_up') return;
    submitFeedback('thumbs_up');
  };

  const handleThumbsDown = () => {
    if (feedback === 'thumbs_down') return;
    setShowCommentModal(true);
  };

  const handleCommentSubmit = () => {
    submitFeedback('thumbs_down', comment);
  };

  return (
    <>
      <div className="feedback-buttons">
        <button
          className={`feedback-btn thumbs-up ${feedback === 'thumbs_up' ? 'active' : ''}`}
          onClick={handleThumbsUp}
          disabled={submitting || feedback === 'thumbs_up'}
          title="This answer was helpful"
        >
          <ThumbsUp size={16} />
        </button>
        <button
          className={`feedback-btn thumbs-down ${feedback === 'thumbs_down' ? 'active' : ''}`}
          onClick={handleThumbsDown}
          disabled={submitting || feedback === 'thumbs_down'}
          title="This answer was not helpful"
        >
          <ThumbsDown size={16} />
        </button>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-card feedback-modal">
            <div className="modal-header">
              <div className="modal-title">
                <MessageCircle size={20} />
                <span>Help us improve</span>
              </div>
              <button 
                className="modal-close"
                onClick={() => setShowCommentModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>What could be better about this response?</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please share your feedback to help us improve..."
                rows={4}
                className="feedback-textarea"
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button
                className="submit-button"
                onClick={handleCommentSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}