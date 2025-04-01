import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer mt-auto py-5 bg-dark text-white">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Nyumba Kumi Community</h5>
            <p className="text-muted">
              Empowering communities through better connection and communication.
            </p>
            <div className="social-icons mt-3">
              <a href="#" className="text-white me-3"><FaFacebook size={20} /></a>
              <a href="#" className="text-white me-3"><FaTwitter size={20} /></a>
              <a href="#" className="text-white me-3"><FaInstagram size={20} /></a>
              <a href="#" className="text-white"><FaLinkedin size={20} /></a>
            </div>
          </Col>

          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-decoration-none text-muted">About Us</a></li>
              <li><a href="/services" className="text-decoration-none text-muted">Services</a></li>
              <li><a href="/contact" className="text-decoration-none text-muted">Contact Us</a></li>
              <li><a href="/privacy" className="text-decoration-none text-muted">Privacy Policy</a></li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="mb-3">Newsletter</h5>
            <p className="text-muted">Subscribe to our newsletter for updates.</p>
            <Form>
              <Form.Group className="mb-3">
                <Form.Control type="email" placeholder="Enter your email" />
              </Form.Group>
              <Button variant="primary" className="w-100">Subscribe</Button>
            </Form>
          </Col>
        </Row>

        <Row className="mt-4 pt-3 border-top">
          <Col className="text-center">
            <p className="mb-0 text-muted">
              &copy; {currentYear} Nyumba Kumi System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>

      <Button
        variant="primary"
        onClick={scrollToTop}
        className="position-fixed bottom-0 end-0 m-3 rounded-circle"
        style={{ width: '40px', height: '40px' }}
      >
        <FaArrowUp />
      </Button>
    </footer>
  );
};

export default Footer;
