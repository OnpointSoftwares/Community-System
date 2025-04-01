import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencilAlt, faTrash, faStar, faCheck, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tasks/${id}`);
      setTask(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Error loading task: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`/api/tasks/${id}`, { status: newStatus });
      
      // If the task is being marked as completed, show the rating modal
      if (newStatus === 'completed') {
        setShowRatingModal(true);
      }
      
      fetchTask(); // Refresh the task
    } catch (err) {
      setError('Error updating task status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      navigate('/tasks');
    } catch (err) {
      setError('Error deleting task: ' + (err.response?.data?.message || err.message));
      setShowDeleteModal(false);
    }
  };

  const ratingSchema = Yup.object().shape({
    rating: Yup.number()
      .required('Rating is required')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot be more than 5'),
    feedback: Yup.string()
      .required('Feedback is required')
      .min(10, 'Feedback must be at least 10 characters')
      .max(300, 'Feedback cannot be more than 300 characters'),
    rateHousehold: Yup.boolean()
      .default(true)
  });

  const handleRateTask = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      // Rate the task
      await axios.put(`/api/tasks/${id}/rate`, {
        rating: values.rating,
        feedback: values.feedback
      }, { headers });
      
      // If user chose to rate the household, create a household rating as well
      if (values.rateHousehold && task.assignedTo) {
        // Get the category from the task
        const category = task.category || 'general';
        
        // Create a rating for the household based on task completion quality
        await axios.post('/api/ratings', {
          household: task.assignedTo._id || task.assignedTo,
          rating: values.rating,
          comment: `Rating based on task completion: ${task.title}. ${values.feedback}`,
          category: category
        }, { headers });
      }
      
      setShowRatingModal(false);
      fetchTask(); // Refresh the task
    } catch (err) {
      console.error('Error rating task:', err);
      setError('Error rating task: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'overdue': return 'danger';
      default: return 'dark';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cleanliness': return 'ud83euddf9';
      case 'security': return 'ud83dudd12';
      case 'community_participation': return 'ud83dudc65';
      case 'maintenance': return 'ud83dudd27';
      default: return 'ud83dudcdd';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        {error}
        <div className="mt-3">
          <Button variant="outline-primary" onClick={() => navigate('/tasks')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Tasks
          </Button>
        </div>
      </Alert>
    );
  }

  if (!task) {
    return (
      <Alert variant="warning" className="my-3">
        Task not found
        <div className="mt-3">
          <Button variant="outline-primary" onClick={() => navigate('/tasks')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Tasks
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="task-detail-container">
      <div className="task-detail-header">
        <Button 
          variant="outline-primary" 
          className="back-button"
          onClick={() => navigate('/tasks')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Tasks
        </Button>

        {(user.role === 'leader' || user.role === 'admin') && (
          <div className="task-actions">
            <Button 
              variant="outline-danger" 
              className="ms-2"
              onClick={() => setShowDeleteModal(true)}
            >
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Delete
            </Button>
            <Button 
              variant="outline-primary" 
              className="ms-2"
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
              Edit
            </Button>
          </div>
        )}
      </div>

      <Card className="task-detail-card">
        <Card.Header className={`task-detail-card-header priority-${task.priority}`}>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <Badge bg={getPriorityColor(task.priority)} className="priority-badge me-2">
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </Badge>
              <Badge bg={getStatusColor(task.status)} className="status-badge">
                {task.status.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
            </div>
            <div className="task-category mt-2 mt-sm-0">
              <span className="category-icon me-2">{getCategoryIcon(task.category)}</span>
              <span className="category-name">
                {task.category.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Card.Title className="task-title mb-4">{task.title}</Card.Title>
          
          <Row className="task-info mb-4">
            <Col md={6} className="task-info-col">
              <div className="info-item">
                <span className="info-label">Assigned To:</span>
                <span className="info-value">{task.assignedTo?.name || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Assigned By:</span>
                <span className="info-value">{task.assignedBy?.name || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Due Date:</span>
                <span className="info-value">{formatDate(task.dueDate)}</span>
              </div>
            </Col>
            <Col md={6} className="task-info-col">
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">{formatDate(task.createdAt)}</span>
              </div>
              {task.completedAt && (
                <div className="info-item">
                  <span className="info-label">Completed:</span>
                  <span className="info-value">{formatDate(task.completedAt)}</span>
                </div>
              )}
              {task.updatedAt && (
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">{formatDate(task.updatedAt)}</span>
                </div>
              )}
            </Col>
          </Row>

          <div className="task-description mb-4">
            <h5>Description</h5>
            <p>{task.description}</p>
          </div>

          {/* Rating section - only visible if task is completed and has been rated */}
          {task.rating !== undefined && task.rating !== null && (
            <div className="task-rating mb-4">
              <h5>Task Rating</h5>
              <div className="rating-stars mb-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon 
                    key={i} 
                    icon={faStar} 
                    className={i < task.rating ? 'star-filled' : 'star-empty'} 
                    size="lg"
                  />
                ))}
                <span className="rating-value ms-2">{task.rating}/5</span>
              </div>
              {task.feedback && (
                <div className="feedback-box">
                  <h6>Feedback:</h6>
                  <p className="feedback-text">{task.feedback}</p>
                </div>
              )}
            </div>
          )}

          <div className="task-status-actions mt-4">
            {/* Task actions for household users */}
            {user.role === 'household' && task.status !== 'completed' && (
              <div>
                <h5>Update Task Status</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {task.status !== 'in_progress' && (
                    <Button 
                      variant="outline-primary"
                      onClick={() => handleStatusChange('in_progress')}
                    >
                      <FontAwesomeIcon icon={faHourglassHalf} className="me-2" />
                      Mark In Progress
                    </Button>
                  )}
                  <Button 
                    variant="outline-success"
                    onClick={() => handleStatusChange('completed')}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    Mark as Completed
                  </Button>
                </div>
              </div>
            )}

            {/* Task rating button for leaders */}
            {(user.role === 'leader' || user.role === 'admin') && 
             task.status === 'completed' && 
             (task.rating === undefined || task.rating === null) && (
              <div className="mt-4">
                <Button 
                  variant="warning"
                  onClick={() => setShowRatingModal(true)}
                >
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Rate this Task
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rate Task Performance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ rating: 3, feedback: '', rateHousehold: true }}
            validationSchema={ratingSchema}
            onSubmit={handleRateTask}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating (0-5)</Form.Label>
                  <div className="star-rating-input">
                    {[...Array(5)].map((_, index) => (
                      <FontAwesomeIcon 
                        key={index}
                        icon={faStar} 
                        className={index < values.rating ? 'star-filled' : 'star-empty'}
                        onClick={() => setFieldValue('rating', index + 1)}
                        size="2x"
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  {touched.rating && errors.rating && (
                    <div className="text-danger">{errors.rating}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="feedback"
                    value={values.feedback}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.feedback && errors.feedback}
                    placeholder="Provide detailed feedback on the task completion"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.feedback}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="rateHousehold"
                    name="rateHousehold"
                    label="Also rate the household based on this task completion"
                    checked={values.rateHousehold}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    This will create a rating for the household in the same category as the task.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end mt-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowRatingModal(false)}
                    className="me-2"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTask}>
            Delete Task
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskDetail;
