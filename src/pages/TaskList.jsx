import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faFilter, faTasks, faSort, faCheck, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';
import './TaskList.css';

const TaskList = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      let queryParams = '';
      if (filters.status) queryParams += `status=${filters.status}&`;
      if (filters.priority) queryParams += `priority=${filters.priority}&`;
      if (filters.category) queryParams += `category=${filters.category}&`;
      
      const response = await axios.get(`/api/tasks?${queryParams}`);
      setTasks(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Error loading tasks: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchTasks();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
    });
    setShowFilters(false);
    fetchTasks();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks(); // Refresh the list
    } catch (err) {
      setError('Error updating task status: ' + (err.response?.data?.message || err.message));
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
      case 'cleanliness': return '🧹';
      case 'security': return '🔒';
      case 'community_participation': return '👥';
      case 'maintenance': return '🔧';
      default: return '📝';
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h1>
          <FontAwesomeIcon icon={faTasks} className="me-2" />
          Tasks Management
        </h1>
        {user.role === 'leader' && (
          <Link to="/tasks/create" className="btn btn-primary create-task-btn">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Create Task
          </Link>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="task-filter-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={8}>
              <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </Col>
            <Col md={6} lg={4} className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                className="filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Filters
              </Button>
              <Button 
                variant="outline-secondary" 
                className="ms-2 filter-btn"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Col>
          </Row>

          {showFilters && (
            <div className="filters-container mt-3">
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Priority</Form.Label>
                    <Form.Select 
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    >
                      <option value="">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select 
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                    >
                      <option value="">All Categories</option>
                      <option value="cleanliness">Cleanliness</option>
                      <option value="security">Security</option>
                      <option value="community_participation">Community Participation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {filteredTasks.length === 0 ? (
        <div className="no-tasks-container">
          <div className="text-center py-5">
            <h3>No tasks found</h3>
            <p>There are no tasks matching your criteria.</p>
            {user.role === 'leader' && (
              <Link to="/tasks/create" className="btn btn-outline-primary mt-3">
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Create First Task
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="task-card">
              <Card.Header className={`task-card-header priority-${task.priority}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg={getPriorityColor(task.priority)} className="priority-badge">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </Badge>
                  <Badge bg={getStatusColor(task.status)} className="status-badge">
                    {task.status.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="category-icon mb-2">{getCategoryIcon(task.category)}</div>
                <Card.Title className="task-title">{task.title}</Card.Title>
                <Card.Text className="task-description">{task.description}</Card.Text>
                
                <div className="task-meta">
                  <div className="task-meta-item">
                    <span className="meta-label">Assigned To:</span>
                    <span className="meta-value">{task.assignedTo?.name || 'Unknown'}</span>
                  </div>
                  <div className="task-meta-item">
                    <span className="meta-label">Due Date:</span>
                    <span className="meta-value">{formatDate(task.dueDate)}</span>
                  </div>
                  {task.completedAt && (
                    <div className="task-meta-item">
                      <span className="meta-label">Completed:</span>
                      <span className="meta-value">{formatDate(task.completedAt)}</span>
                    </div>
                  )}
                  {task.rating !== undefined && task.rating !== null && (
                    <div className="task-meta-item">
                      <span className="meta-label">Rating:</span>
                      <span className="meta-value rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon 
                            key={i} 
                            icon={faStar} 
                            className={i < task.rating ? 'star-filled' : 'star-empty'} 
                          />
                        ))}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="task-actions mt-3">
                  <Link to={`/tasks/${task._id}`} className="btn btn-sm btn-outline-primary">
                    View Details
                  </Link>
                  
                  {user.role === 'household' && task.status !== 'completed' && (
                    <Button 
                      variant="sm" 
                      className="btn-outline-success ms-2"
                      onClick={() => handleStatusChange(task._id, 'completed')}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Mark Complete
                    </Button>
                  )}
                  
                  {user.role === 'leader' && task.status === 'completed' && !task.rating && (
                    <Link 
                      to={`/tasks/${task._id}/rate`} 
                      className="btn btn-sm btn-outline-warning ms-2"
                    >
                      <FontAwesomeIcon icon={faStar} className="me-1" />
                      Rate Task
                    </Link>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
