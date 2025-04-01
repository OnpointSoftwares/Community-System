import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Form, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHome, faUser, faFilter, faSort, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

const Ratings = () => {
  const { user } = useContext(AuthContext);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    category: '',
    zone: '',
    rating: ''
  });
  const [sort, setSort] = useState('date_desc');
  const [zones, setZones] = useState([]);

  useEffect(() => {
    // Fetch zones for the filter
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
    const fetchRatings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/api/ratings';
        
        // Add filter parameters
        const params = [];
        
        if (filter.category) {
          params.push(`category=${filter.category}`);
        }
        
        if (filter.zone) {
          params.push(`zone=${filter.zone}`);
        }
        
        if (filter.rating) {
          params.push(`rating=${filter.rating}`);
        }
        
        // For household users, only show their ratings
        if (user.role === 'household') {
          params.push(`household=${user.householdId}`);
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
        setRatings(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading ratings. Please try again.');
        setLoading(false);
      }
    };

    fetchRatings();
  }, [filter, sort, user]);

  // Render rating stars
  const renderRatingStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < rating ? '#ffc107' : '#e4e5e9' }}>★</span>
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handler for filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faStar} className="me-3" />
        Ratings {user.role === 'household' ? 'Report' : 'Overview'}
      </h1>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Category
                </Form.Label>
                <Form.Select 
                  name="category"
                  value={filter.category} 
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="security">Security</option>
                  <option value="community_participation">Community Participation</option>
                  <option value="noise_level">Noise Level</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            {(user.role === 'leader' || user.role === 'admin') && (
              <Col md={3}>
                <Form.Group className="mb-3 mb-md-0">
                  <Form.Label>
                    <FontAwesomeIcon icon={faHome} className="me-2" />
                    Zone
                  </Form.Label>
                  <Form.Select 
                    name="zone"
                    value={filter.zone} 
                    onChange={handleFilterChange}
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
            
            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Rating
                </Form.Label>
                <Form.Select 
                  name="rating"
                  value={filter.rating} 
                  onChange={handleFilterChange}
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={user.role === 'household' ? 6 : 3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>
                  <FontAwesomeIcon icon={faSort} className="me-2" />
                  Sort By
                </Form.Label>
                <Form.Select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="rating_desc">Highest Rating First</option>
                  <option value="rating_asc">Lowest Rating First</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Ratings List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading ratings...</span>
          </Spinner>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : ratings.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FontAwesomeIcon icon={faStar} size="3x" className="text-secondary mb-3" />
            <h4>No Ratings Found</h4>
            <p className="text-muted">
              There are no ratings matching your selected filters.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Household</th>
                  <th>Rating</th>
                  <th>Category</th>
                  <th>Rated By</th>
                  <th>Date</th>
                  <th>Comment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr key={rating._id}>
                    <td>
                      <Link to={`/households/${rating.household?._id}`} className="text-decoration-none">
                        {rating.household?.address || 'Unknown'} 
                        {rating.household?.houseNumber && ` (#${rating.household.houseNumber})`}
                      </Link>
                    </td>
                    <td>{renderRatingStars(rating.rating)}</td>
                    <td>
                      <Badge bg="secondary" className="text-capitalize">
                        {rating.category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                        {rating.ratedBy?.name || 'System'}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-secondary" />
                        {formatDate(rating.createdAt)}
                      </div>
                    </td>
                    <td>
                      {rating.comment ? (
                        rating.comment.length > 30 
                          ? `${rating.comment.substring(0, 30)}...` 
                          : rating.comment
                      ) : (
                        <span className="text-muted">No comment</span>
                      )}
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/households/${rating.household?._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Ratings;
