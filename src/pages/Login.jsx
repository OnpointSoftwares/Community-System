import React, { useContext, useState } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-vh-100 d-flex align-items-center ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className={`shadow-lg ${darkMode ? 'bg-dark text-white' : ''}`}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <FontAwesomeIcon icon={faSignInAlt} className={`${darkMode ? 'text-primary' : 'text-primary'} mb-3`} size="2x" />
                  <h2 className="mb-2">Welcome Back</h2>
                  <p className={`${darkMode ? 'text-white-50' : 'text-muted'}`}>Sign in to access your account</p>
                </div>

                {error && (
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                  </Alert>
                )}

                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={loginSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          className={`${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                          placeholder="Enter your email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FontAwesomeIcon icon={faLock} className="me-2" />
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          className={`${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                          placeholder="Enter your password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-100 mb-3"
                      >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                      </Button>

                      <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />
                        <span className={`mx-3 ${darkMode ? 'text-white-50' : 'text-muted'}`}>OR</span>
                        <hr className="flex-grow-1" />
                      </div>

                      <div className="row g-2 mb-4">
                        <div className="col">
                          <Button variant="outline-secondary" className="w-100">
                            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" width={20} className="me-2" />
                            Google
                          </Button>
                        </div>
                        <div className="col">
                          <Button variant="outline-secondary" className="w-100">
                            <img src="https://www.svgrepo.com/show/448234/github.svg" alt="GitHub" width={20} className="me-2" />
                            GitHub
                          </Button>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className={`${darkMode ? 'text-white-50' : 'text-muted'}`}>
                          Don't have an account?{' '}
                          <Link to="/register" className="text-decoration-none">
                            Register
                          </Link>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Button
        variant={darkMode ? 'light' : 'dark'}
        onClick={() => setDarkMode(!darkMode)}
        className="position-fixed top-0 end-0 m-3"
      >
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </Button>
    </div>
  );
};

export default Login;
