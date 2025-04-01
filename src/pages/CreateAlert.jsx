import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

// Alert form validation schema
const alertSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  message: Yup.string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority level'),
  zone: Yup.string()
    .required('Zone is required')
});

const CreateAlert = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const zoneIdFromUrl = queryParams.get('zone');
  
  const { user } = useContext(AuthContext);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zonesLoading, setZonesLoading] = useState(true);

  // Check if user is authorized to create alerts
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'leader') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Fetch zones for the dropdown
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setZonesLoading(true);
        
        let zonesData = [];
        const token = localStorage.getItem('token');
        
        if (user?.role === 'leader') {
          // Leaders can only create alerts for their assigned zones
          const res = await axios.get(`/api/leaders/${user._id}/zones`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          zonesData = res.data.data;
        } else {
          // Use public endpoint for all non-leader users to avoid authorization issues
          const res = await axios.get('/api/nyumbakumi/zones/public');
          zonesData = res.data.data;
        }
        
        setZones(zonesData);
        setZonesLoading(false);
      } catch (err) {
        setError('Error loading zones. Please try again.');
        setZonesLoading(false);
      }
    };

    fetchZones();
  }, [user]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add the current user as the creator
      values.createdBy = user.id;
      
      await axios.post('/api/alerts', values);
      
      setLoading(false);
      
      // Redirect to alerts list
      navigate('/alerts', { 
        state: { success: true, message: 'Alert created successfully!' } 
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create alert. Please try again.'
      );
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (zonesLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Button 
        variant="outline-secondary" 
        className="mb-3"
        as={Link}
        to="/alerts"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Alerts
      </Button>
      
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faBell} className="me-3" />
        Create Alert
      </h1>
      
      <Card className="mb-4">
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={{
              title: '',
              message: '',
              priority: 'medium',
              zone: zoneIdFromUrl || (zones.length > 0 ? zones[0]._id : '')
            }}
            validationSchema={alertSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Alert Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.title && errors.title}
                    placeholder="Enter a clear, concise title"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.message && errors.message}
                    placeholder="Provide detailed information about the alert..."
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.message}
                  </Form.Control.Feedback>
                  <Form.Text muted>
                    Be clear, specific, and include any necessary instructions for residents.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Priority Level</Form.Label>
                  <div className="mb-2">
                    <span className="text-danger">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                      Use urgent priority sparingly for true emergencies only.
                    </span>
                  </div>
                  <Form.Select
                    name="priority"
                    value={values.priority}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.priority && errors.priority}
                  >
                    <option value="low">Low - General Information</option>
                    <option value="medium">Medium - Important Notice</option>
                    <option value="high">High - Immediate Attention Required</option>
                    <option value="urgent">Urgent - Emergency Situation</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.priority}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Zone</Form.Label>
                  <Form.Select
                    name="zone"
                    value={values.zone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.zone && errors.zone}
                  >
                    {zones.length > 0 ? (
                      zones.map((zone) => (
                        <option key={zone._id} value={zone._id}>
                          {zone.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No zones available</option>
                    )}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.zone}
                  </Form.Control.Feedback>
                  <Form.Text muted>
                    Select the zone where this alert applies
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    as={Link}
                    to="/alerts"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || loading || zones.length === 0}
                  >
                    {loading ? 'Creating Alert...' : 'Create Alert'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateAlert;
