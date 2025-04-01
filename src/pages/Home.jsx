import React, { useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faBell, faStar, faSignInAlt, faUserPlus, faTachometerAlt, 
         faShieldAlt, faHandshake, faChartLine } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import './Home.css'; // We'll create this file for styling

const Home = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Set up scroll animation for elements
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section with Modern Gradient */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="position-relative">
          <div className="hero-content text-center text-md-start">
            <div className="hero-text-container animate-on-scroll">
              <h1 className="hero-title">Welcome to <span className="gradient-text">Nyumba Kumi</span></h1>
              <p className="hero-subtitle">
                Connecting communities, enhancing security, and building stronger neighborhoods together
              </p>
              <div className="hero-buttons mt-4">
                {!user ? (
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-md-start">
                    <Button 
                      as={Link} 
                      to="/register" 
                      variant="primary" 
                      size="lg" 
                      className="hero-button pulse-effect"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                      Join Now
                    </Button>
                    <Button 
                      as={Link} 
                      to="/login" 
                      variant="outline-light" 
                      size="lg" 
                      className="hero-button-alt"
                    >
                      <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                      Login
                    </Button>
                  </div>
                ) : (
                  <Button 
                    as={Link} 
                    to={user.role === 'leader' ? '/leader-dashboard' : '/dashboard'} 
                    variant="primary" 
                    size="lg" 
                    className="hero-button pulse-effect"
                  >
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </div>
            <div className="hero-shape-1"></div>
            <div className="hero-shape-2"></div>
          </div>
        </Container>
      </div>

      <Container>
        {/* Features Section */}
        <section className="features-section py-5">
          <h2 className="section-title text-center mb-5 animate-on-scroll">Our <span className="gradient-text">Features</span></h2>
          <Row className="g-4">
            <Col md={3} sm={6}>
              <Card className="feature-card h-100 animate-on-scroll">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon-container mb-4">
                    <FontAwesomeIcon icon={faHome} className="feature-icon" />
                  </div>
                  <Card.Title>Household Management</Card.Title>
                  <Card.Text>
                    Register and manage households in your community with ease.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="feature-card h-100 animate-on-scroll" data-delay="200">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon-container mb-4 warning-gradient">
                    <FontAwesomeIcon icon={faBell} className="feature-icon" />
                  </div>
                  <Card.Title>Alerts System</Card.Title>
                  <Card.Text>
                    Send important alerts and announcements to community members.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="feature-card h-100 animate-on-scroll" data-delay="400">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon-container mb-4 success-gradient">
                    <FontAwesomeIcon icon={faStar} className="feature-icon" />
                  </div>
                  <Card.Title>Ratings & Reviews</Card.Title>
                  <Card.Text>
                    Rate households based on various categories to improve community standards.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="feature-card h-100 animate-on-scroll" data-delay="600">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="feature-icon-container mb-4 info-gradient">
                    <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                  </div>
                  <Card.Title>Leader Dashboard</Card.Title>
                  <Card.Text>
                    Comprehensive tools for Nyumba Kumi leaders to manage their zones.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Call to Action Section */}
        {!user && (
          <section className="cta-section py-5 animate-on-scroll">
            <Card className="cta-card border-0">
              <div className="cta-gradient"></div>
              <Card.Body className="text-center py-5 position-relative">
                <h2 className="text-white mb-3">Join Our Community Today</h2>
                <p className="text-white lead mb-4">
                  Register now to become a part of our community system and enjoy all the benefits.
                </p>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="light" 
                  size="lg" 
                  className="cta-button px-4 shadow"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Register Now
                </Button>
              </Card.Body>
            </Card>
          </section>
        )}

        {/* Stats Section */}
        <section className="stats-section py-5 animate-on-scroll">
          <h2 className="section-title text-center mb-5">Our <span className="gradient-text">Impact</span></h2>
          <Row className="g-4 text-center">
            <Col md={4}>
              <div className="stat-card">
                <div className="stat-icon-container mb-3 primary-gradient">
                  <FontAwesomeIcon icon={faHandshake} className="stat-icon" />
                </div>
                <h3 className="stat-number">1,000+</h3>
                <p className="stat-description">Households Registered</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card">
                <div className="stat-icon-container mb-3 success-gradient">
                  <FontAwesomeIcon icon={faShieldAlt} className="stat-icon" />
                </div>
                <h3 className="stat-number">50+</h3>
                <p className="stat-description">Nyumba Kumi Zones</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card">
                <div className="stat-icon-container mb-3 info-gradient">
                  <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
                </div>
                <h3 className="stat-number">30%</h3>
                <p className="stat-description">Security Improvement</p>
              </div>
            </Col>
          </Row>
        </section>

        {/* About Section */}
        <section className="about-section py-5">
          <h2 className="section-title text-center mb-5 animate-on-scroll">About <span className="gradient-text">Nyumba Kumi</span></h2>
          <Row className="g-4">
            <Col md={6} className="animate-on-scroll">
              <Card className="about-card h-100">
                <Card.Body>
                  <h4 className="mb-3 gradient-text">What is Nyumba Kumi?</h4>
                  <p>
                    Nyumba Kumi is a community policing initiative that encourages citizens to be aware
                    of their neighbors and report any suspicious activities to enhance security in 
                    the neighborhood.
                  </p>
                  <p>
                    Our system helps Nyumba Kumi leaders to effectively manage their zones,
                    communicate with households, and improve community safety.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="animate-on-scroll" data-delay="200">
              <Card className="about-card h-100">
                <Card.Body>
                  <h4 className="mb-3 gradient-text">How It Works</h4>
                  <div className="d-flex mb-4">
                    <div className="me-3">
                      <div className="step-number">
                        1
                      </div>
                    </div>
                    <div>
                      <h5>Register</h5>
                      <p>Sign up as a household member or Nyumba Kumi leader.</p>
                    </div>
                  </div>
                  <div className="d-flex mb-4">
                    <div className="me-3">
                      <div className="step-number">
                        2
                      </div>
                    </div>
                    <div>
                      <h5>Connect</h5>
                      <p>Get connected to your community zone and neighbors.</p>
                    </div>
                  </div>
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="step-number">
                        3
                      </div>
                    </div>
                    <div>
                      <h5>Engage</h5>
                      <p>Receive alerts, participate in community activities, and more.</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default Home;
