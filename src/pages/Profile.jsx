import React, { useState, useContext, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faLock, faShield, faSave, faTimesCircle, faIdCard } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

// Profile form validation schema
const profileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/, 'Phone number must be between 10-15 digits'),
  currentPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Current password is required to set new password')
    }),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Please confirm your new password')
    })
});

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setInitialDataLoading(true);
        
        // Get user profile data
        const res = await axios.get(`/api/users/${user.id}`);
        
        setProfileData({
          name: res.data.data.name || '',
          email: res.data.data.email || '',
          phoneNumber: res.data.data.phoneNumber || '',
          role: res.data.data.role || 'household',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        setInitialDataLoading(false);
      } catch (err) {
        setError('Error loading profile data. Please try again.');
        setInitialDataLoading(false);
      }
    };

    if (user && user.id) {
      fetchUserProfile();
    }
  }, [user]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare data - only include password fields if newPassword is provided
      const updateData = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber
      };
      
      if (values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }
      
      // Update profile
      const res = await axios.put(`/api/users/${user.id}`, updateData);
      
      // Update context with the new user data
      updateUser({
        ...user,
        name: values.name,
        email: values.email
      });
      
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setLoading(false);
      setSubmitting(false);
    } catch (err) {
      if (err.response?.data?.error === 'Invalid current password') {
        setFieldError('currentPassword', 'Current password is incorrect');
      } else if (err.response?.data?.error === 'Email already in use') {
        setFieldError('email', 'This email is already in use');
      } else {
        setError(
          err.response?.data?.message || 'Failed to update profile. Please try again.'
        );
      }
      
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (initialDataLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">
        <FontAwesomeIcon icon={faUser} className="me-3" />
        My Profile
      </h1>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header as="h5">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Profile Information
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                  {success}
                </Alert>
              )}
              
              {profileData && (
                <Formik
                  initialValues={profileData}
                  validationSchema={profileSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    resetForm
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faUser} className="me-2" />
                              Full Name
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={values.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.name && errors.name}
                              placeholder="Your full name"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faIdCard} className="me-2" />
                              Role
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={values.role === 'household' ? 'Household Member' : 
                                     values.role === 'leader' ? 'Nyumba Kumi Leader' : 'Admin'}
                              disabled
                              className="bg-light"
                            />
                            <Form.Text muted>
                              Role cannot be changed. Contact an administrator if needed.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                              Email Address
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.email && errors.email}
                              placeholder="Your email address"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FontAwesomeIcon icon={faPhone} className="me-2" />
                              Phone Number
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="phoneNumber"
                              value={values.phoneNumber}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.phoneNumber && errors.phoneNumber}
                              placeholder="Your phone number"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.phoneNumber}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <hr className="my-4" />
                      
                      <h5 className="mb-3">
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        Change Password
                      </h5>
                      <p className="text-muted mb-4">
                        Leave these fields blank if you don't want to change your password.
                      </p>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="currentPassword"
                              value={values.currentPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.currentPassword && errors.currentPassword}
                              placeholder="Enter your current password"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.currentPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="newPassword"
                              value={values.newPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.newPassword && errors.newPassword}
                              placeholder="Enter new password"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.newPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={values.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.confirmPassword && errors.confirmPassword}
                              placeholder="Confirm new password"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button
                          variant="outline-secondary"
                          className="me-2"
                          onClick={() => {
                            resetForm();
                            setError(null);
                            setSuccess(null);
                          }}
                          disabled={isSubmitting || loading}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting || loading}
                        >
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faSave} className="me-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header as="h5">
              <FontAwesomeIcon icon={faShield} className="me-2" />
              Account Security
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <Badge bg="success" className="rounded-circle p-2">
                    <FontAwesomeIcon icon={faCheck} />
                  </Badge>
                </div>
                <div>
                  <h6 className="mb-0">Email Verified</h6>
                  <small className="text-muted">Your email has been verified</small>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <Badge bg="warning" className="rounded-circle p-2">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                  </Badge>
                </div>
                <div>
                  <h6 className="mb-0">Two-Factor Authentication</h6>
                  <small className="text-muted">Not enabled (Coming soon)</small>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <Badge bg="info" className="rounded-circle p-2">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </Badge>
                </div>
                <div>
                  <h6 className="mb-0">Last Login</h6>
                  <small className="text-muted">Today at {new Date().toLocaleTimeString()}</small>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {user.role === 'household' && user.householdId && (
            <Card className="mb-4">
              <Card.Header as="h5">
                <FontAwesomeIcon icon={faHome} className="me-2" />
                My Household
              </Card.Header>
              <Card.Body>
                <p className="mb-3">
                  You are registered as a member of a household in the community system.
                </p>
                <Button 
                  as={Link} 
                  to={`/households/${user.householdId}`} 
                  variant="outline-primary" 
                  className="w-100"
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  View Household Details
                </Button>
              </Card.Body>
            </Card>
          )}
          
          {user.role === 'leader' && (
            <Card className="mb-4">
              <Card.Header as="h5">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                My Zones
              </Card.Header>
              <Card.Body>
                <p className="mb-3">
                  You are registered as a Nyumba Kumi leader in the community system.
                </p>
                <Button 
                  as={Link} 
                  to="/leader-dashboard" 
                  variant="outline-primary" 
                  className="w-100"
                >
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  Go to Leader Dashboard
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

// Add missing icon imports
import { faCheck, faExclamationCircle, faInfoCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default Profile;
