import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus, faSignOutAlt, faUser, faBell, faHome, faTachometerAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="navbar shadow-sm mb-4 sticky-top" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand d-flex align-items-center">
          <div className="logo d-flex justify-content-center align-items-center rounded-circle bg-gradient-primary" style={{ width: '40px', height: '40px' }}>
            <FontAwesomeIcon icon={faHome} className="text-white" size="lg" />
          </div>
          <span className="brand-text ms-2 fw-bold fs-5">Nyumba Kumi</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={NavLink} to="/" end className="mx-2 position-relative">
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Home
            </Nav.Link>

            {user ? (
              <>
                {user.role === 'leader' && (
                  <Nav.Link as={NavLink} to="/leader/dashboard" className="mx-2">
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Dashboard
                  </Nav.Link>
                )}

                {user.role === 'household' && (
                  <Nav.Link as={NavLink} to="/dashboard" className="mx-2">
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Dashboard
                  </Nav.Link>
                )}

                <Nav.Link as={NavLink} to="/households" className="mx-2">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  Households
                </Nav.Link>

                <Nav.Link as={NavLink} to="/alerts" className="mx-2">
                  <FontAwesomeIcon icon={faBell} className="me-2" />
                  Alerts
                </Nav.Link>

                <Dropdown as={Nav.Item} className="ms-2">
                  <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center p-0 bg-transparent border-0">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-gradient-primary text-white"
                         style={{ width: '36px', height: '36px', fontSize: '16px', transition: 'transform 0.2s' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="d-none d-lg-inline ms-2 fw-medium">{user.name?.split(' ')[0] || 'User'}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end" className="shadow-sm border-0 mt-2">
                    <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="mx-2">
                  <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                  Login
                </Nav.Link>
                <Nav.Item>
                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    className="ms-2 my-1 my-lg-0 rounded-pill px-3"
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Register
                  </Button>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
