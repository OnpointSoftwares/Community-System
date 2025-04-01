import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Form, Badge, Spinner, Alert as BootstrapAlert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faFilter, faSort, faExclamationTriangle, faInfoCircle, faCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

const Alerts = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date_desc');
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');

  useEffect(() => {
    // Fetch zones for the filter (only for leaders and admins)
    const fetchZones = async () => {
      try {
        if (user.role === 'leader') {
          const res = await axios.get(`/api/leaders/${user.id}/zones`);
          setZones(res.data.data);
        } else if (user.role === 'admin') {
          // Admins can see all zones
          const res = await axios.get('/api/zones');
          setZones(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
      }
    };

    if (user.role === 'leader' || user.role === 'admin') {
      fetchZones();
    }
  }, [user]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/api/alerts';
        
        // Add filter parameters
        const params = [];
        
        if (filter !== 'all') {
          params.push(`priority=${filter}`);
        }
        
        if (selectedZone) {
          params.push(`zone=${selectedZone}`);
        }
        
        // Add sorting
        const [sortField, sortDirection] = sort.split('_');
        params.push(`sort=${sortField}`);
        params.push(`order=${sortDirection}`);
        
        // Add parameters to URL
        if (params.length > 0) {
          url += '?' + params.join('&');
        }
        
        const res = await axios.get(url);
        setAlerts(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading alerts. Please try again.');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter, sort, selectedZone]);

  // Get priorit icon based on priority level
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low':
        return <FontAwesomeIcon icon={faInfoCircle} className="text-info" />;
      case 'medium':
        return <FontAwesomeIcon icon={faExclamationCircle} className="text-warning" />;
      case 'high':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />;
      case 'urgent':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="text-info" />;
    }
  };

  // Get badge variant based on priority level
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'urgent':
        return 'danger';
      default:
        return 'info';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <FontAwesomeIcon icon={faBell} className="me-3" />
          Alerts
        </h1>
        
        {(user.role === 'leader' || user.role === 'admin') && (
          <Button as={Link} to="/alerts/create" variant="primary">
            <FontAwesomeIcon icon={faBell} className="me-2" />
            Create Alert
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Priority</Form.Label>
                <Form.Select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            {(user.role === 'leader' || user.role === 'admin') && (
              <Col md={4}>
                <Form.Group className="mb-3 mb-md-0">
                  <Form.Label>Zone</Form.Label>
                  <Form.Select 
                    value={selectedZone} 
                    onChange={(e) => setSelectedZone(e.target.value)}
                  >
                    <option value="">All Zones</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            
            <Col md={user.role === 'household' ? 8 : 4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Sort By</Form.Label>
                <Form.Select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="priority_desc">Highest Priority First</option>
                  <option value="priority_asc">Lowest Priority First</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading alerts...</span>
          </Spinner>
        </div>
      ) : error ? (
        <BootstrapAlert variant="danger">
          {error}
        </BootstrapAlert>
      ) : alerts.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FontAwesomeIcon icon={faCheck} size="3x" className="text-success mb-3" />
            <h4>No Alerts Found</h4>
            <p className="text-muted">
              There are no alerts matching your selected filters.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {alerts.map((alert) => (
            <Card key={alert._id} className="mb-4 alert-card">
              <Card.Header className={`bg-${getPriorityBadge(alert.priority)} bg-opacity-10 d-flex justify-content-between align-items-center`}>
                <div>
                  <span className="me-2">
                    {getPriorityIcon(alert.priority)}
                  </span>
                  <Badge bg={getPriorityBadge(alert.priority)} className="text-uppercase">
                    {alert.priority}
                  </Badge>
                </div>
                <small className="text-muted">
                  {formatDate(alert.createdAt)}
                </small>
              </Card.Header>
              <Card.Body>
                <Card.Title>{alert.title}</Card.Title>
                <Card.Text>
                  {alert.message}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Sent by: {alert.createdBy?.name || 'Admin'}
                    </small>
                    {alert.zone && (
                      <Badge bg="secondary" className="ms-2">
                        {alert.zone?.name || 'Unknown Zone'}
                      </Badge>
                    )}
                  </div>
                  {(user.role === 'leader' || user.role === 'admin') && (
                    <Button 
                      as={Link} 
                      to={`/alerts/${alert._id}`} 
                      variant="outline-primary" 
                      size="sm"
                    >
                      View Details
                    </Button>
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

export default Alerts;
