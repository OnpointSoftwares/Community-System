import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMapMarkerAlt, faPlusCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

const HouseholdCreate = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validation schema
  const householdSchema = Yup.object().shape({
    address: Yup.string()
      .required('Address is required')
      .max(200, 'Address cannot be more than 200 characters'),
    houseNumber: Yup.string()
      .required('House number is required')
      .max(50, 'House number cannot be more than 50 characters'),
    numOfResidents: Yup.number()
      .required('Number of residents is required')
      .positive('Must be a positive number')
      .integer('Must be a whole number'),
    nyumbaKumiZone: Yup.string()
      .required('Please select a zone')
  });

  // Initial form values
  const initialValues = {
    address: '',
    houseNumber: '',
    numOfResidents: '',
    nyumbaKumiZone: ''
  };

  // Fetch zones on component mount
  useEffect(() => {
    // Only admins and leaders can create households
    if (user?.role !== 'leader' && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    const fetchZones = async () => {
      try {
        setLoading(true);
        // Set the authorization header with the token
        const token = localStorage.getItem('token');
        
        let zonesData = [];
        
        if (user?.role === 'leader') {
          // Leaders can only access their assigned zones
          const zonesRes = await axios.get(`/api/leaders/${user._id}/zones`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          zonesData = zonesRes.data.data || [];
        } else {
          // Use public endpoint for all non-leader users
          const zonesRes = await axios.get('/api/nyumbakumi/zones/public');
          zonesData = zonesRes.data.data || [];
        }
        
        setZones(zonesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching zones:', err);
        setError('Error loading zones: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchZones();
  }, [user, navigate]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Explicitly convert numOfResidents to a number
      const householdData = {
        ...values,
        numOfResidents: Number(values.numOfResidents)
      };
      
      const response = await axios.post('/api/households', householdData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Household created:', response.data);
      
      resetForm();
      setLoading(false);
      
      // Redirect to the households list
      navigate('/households');
    } catch (err) {
      console.error('Error creating household:', err);
      setError('Error creating household: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faHome} className="me-2" />
        Create New Household
      </h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={householdSchema}
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
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        Address
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.address && errors.address}
                        placeholder="Enter physical address"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.address}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faHome} className="me-2" />
                        House Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="houseNumber"
                        value={values.houseNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.houseNumber && errors.houseNumber}
                        placeholder="Enter house number"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.houseNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Number of Residents
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="numOfResidents"
                        value={values.numOfResidents}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.numOfResidents && errors.numOfResidents}
                        placeholder="Enter number of residents"
                        min="1"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.numOfResidents}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        Zone
                      </Form.Label>
                      <Form.Select
                        name="nyumbaKumiZone"
                        value={values.nyumbaKumiZone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.nyumbaKumiZone && errors.nyumbaKumiZone}
                        disabled={loading || zones.length === 0}
                      >
                        <option value="">Select a zone</option>
                        {zones.map(zone => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name} ({zone.location})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.nyumbaKumiZone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/households')} 
                    className="me-md-2"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || isSubmitting}
                  >
                    <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                    {loading ? 'Creating...' : 'Create Household'}
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

export default HouseholdCreate;
