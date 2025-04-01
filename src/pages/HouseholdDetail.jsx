import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Badge, Tabs, Tab, Form, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faStar, faPhone, faEnvelope, faMapMarkerAlt, faPencilAlt, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

// Rating form validation schema
const ratingSchema = Yup.object().shape({
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot be more than 5'),
  category: Yup.string()
    .required('Category is required'),
  comment: Yup.string()
    .max(500, 'Comment cannot exceed 500 characters')
});

const HouseholdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [household, setHousehold] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingError, setRatingError] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(null);

  useEffect(() => {
    const fetchHouseholdData = async () => {
      try {
        setLoading(true);
        
        // Get household details
        const householdRes = await axios.get(`/api/households/${id}`);
        setHousehold(householdRes.data.data);
        
        // Get ratings for this household
        const ratingsRes = await axios.get(`/api/ratings?household=${id}`);
        setRatings(ratingsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error loading household details');
        setLoading(false);
      }
    };

    fetchHouseholdData();
  }, [id]);

  // Handle rating submission
  const handleSubmitRating = async (values, { resetForm }) => {
    try {
      setRatingLoading(true);
      setRatingError(null);
      setRatingSuccess(null);
      
      // Add household ID to the values
      values.household = id;
      
      // Submit the rating
      await axios.post('/api/ratings', values);
      
      // Refresh ratings list
      const ratingsRes = await axios.get(`/api/ratings?household=${id}`);
      setRatings(ratingsRes.data.data);
      
      // Refresh household to get updated average rating
      const householdRes = await axios.get(`/api/households/${id}`);
      setHousehold(householdRes.data.data);
      
      // Reset form and show success message
      resetForm();
      setRatingSuccess('Rating submitted successfully!');
      setRatingLoading(false);
    } catch (err) {
      setRatingError(
        err.response?.data?.message || 'Failed to submit rating. Please try again.'
      );
      setRatingLoading(false);
    }
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    return (
      <div className="rating-stars d-inline-block">
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Button 
        variant="outline-secondary" 
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Households
      </Button>

      {/* Household header */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="mb-1">
                    <FontAwesomeIcon icon={faHome} className="me-3 text-primary" />
                    {household.address}
                  </h1>
                  <p className="text-muted mb-2">House #: {household.houseNumber}</p>
                  
                  <div className="mb-3">
                    <Badge bg="info" className="me-2">
                      {household.nyumbaKumiZone?.name || 'No Zone Assigned'}
                    </Badge>
                    <Badge bg="secondary">
                      {household.numOfResidents} Resident{household.numOfResidents !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div className="me-2">Average Rating:</div>
                    {renderRatingStars(household.averageRating)}
                    <span className="ms-2">({household.averageRating.toFixed(1)})</span>
                  </div>
                </div>
                
                {/* Edit buttons for admin */}
                {user.role === 'admin' && (
                  <div>
                    <Button 
                      as={Link} 
                      to={`/households/${id}/edit`} 
                      variant="outline-primary" 
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
                      Edit
                    </Button>
                    <Button variant="outline-danger">
                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Content tabs */}
      <Tabs defaultActiveKey="details" className="mb-4">
        {/* Details Tab */}
        <Tab eventKey="details" title="Household Details">
          <Row>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header as="h5">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Primary Contact
                </Card.Header>
                <Card.Body>
                  <p><strong>Name:</strong> {household.user?.name || 'Not Assigned'}</p>
                  <p>
                    <FontAwesomeIcon icon={faPhone} className="me-2 text-secondary" />
                    {household.user?.phoneNumber || 'N/A'}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                    {household.user?.email || 'N/A'}
                  </p>
                  <p><strong>Joined:</strong> {household.user?.createdAt 
                    ? formatDate(household.user.createdAt) 
                    : 'N/A'}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header as="h5">
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Household Information
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Address:</strong> {household.address}</p>
                      <p><strong>House Number:</strong> {household.houseNumber}</p>
                      <p><strong>Number of Residents:</strong> {household.numOfResidents}</p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Location:</strong> 
                        <span className="ms-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-danger" />
                          {household.location?.coordinates 
                            ? `${household.location.coordinates[1]}, ${household.location.coordinates[0]}`
                            : 'N/A'}
                        </span>
                      </p>
                      <p><strong>Zone:</strong> {household.nyumbaKumiZone?.name || 'N/A'}</p>
                      <p><strong>Added:</strong> {formatDate(household.createdAt)}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        {/* Ratings Tab */}
        <Tab eventKey="ratings" title="Ratings & Reviews">
          <Row>
            {/* Rating Form (Only visible to leaders) */}
            {(user.role === 'leader' || user.role === 'admin') && (
              <Col md={4}>
                <Card className="mb-4">
                  <Card.Header as="h5">
                    <FontAwesomeIcon icon={faStar} className="me-2" />
                    Rate Household
                  </Card.Header>
                  <Card.Body>
                    {ratingSuccess && (
                      <Alert variant="success" onClose={() => setRatingSuccess(null)} dismissible>
                        {ratingSuccess}
                      </Alert>
                    )}
                    
                    {ratingError && (
                      <Alert variant="danger" onClose={() => setRatingError(null)} dismissible>
                        {ratingError}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        rating: 3,
                        category: 'general',
                        comment: ''
                      }}
                      validationSchema={ratingSchema}
                      onSubmit={handleSubmitRating}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        setFieldValue
                      }) => (
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <div className="mb-2">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i}
                                  className="rating-input"
                                  style={{ 
                                    cursor: 'pointer', 
                                    fontSize: '2rem', 
                                    color: i < values.rating ? '#ffc107' : '#e4e5e9',
                                    marginRight: '5px'
                                  }}
                                  onClick={() => setFieldValue('rating', i + 1)}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {touched.rating && errors.rating && (
                              <div className="text-danger">{errors.rating}</div>
                            )}
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                              name="category"
                              value={values.category}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.category && errors.category}
                            >
                              <option value="general">General</option>
                              <option value="cleanliness">Cleanliness</option>
                              <option value="security">Security</option>
                              <option value="community_participation">Community Participation</option>
                              <option value="noise_level">Noise Level</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.category}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Comment (Optional)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="comment"
                              value={values.comment}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.comment && errors.comment}
                              placeholder="Add a comment about this rating"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.comment}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100"
                            disabled={ratingLoading}
                          >
                            {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  </Card.Body>
                </Card>
              </Col>
            )}
            
            {/* Ratings List */}
            <Col md={user.role === 'leader' || user.role === 'admin' ? 8 : 12}>
              <Card className="mb-4">
                <Card.Header as="h5">
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Ratings & Reviews
                </Card.Header>
                <Card.Body>
                  {ratings.length > 0 ? (
                    <div>
                      {ratings.map((rating) => (
                        <Card key={rating._id} className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="mb-2">
                                  {renderRatingStars(rating.rating)}
                                  <Badge 
                                    bg="secondary" 
                                    className="ms-2 text-capitalize"
                                  >
                                    {rating.category.replace('_', ' ')}
                                  </Badge>
                                </div>
                                {rating.comment && (
                                  <p className="mb-1">{rating.comment}</p>
                                )}
                              </div>
                              <div className="text-end">
                                <p className="text-muted mb-1">
                                  By: {rating.ratedBy?.name || 'System'}
                                </p>
                                <small className="text-muted">
                                  {formatDate(rating.createdAt)}
                                </small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted py-3">
                      No ratings available for this household yet.
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default HouseholdDetail;
