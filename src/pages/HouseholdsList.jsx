import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Table, Badge, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHome, faStar, faFilter, faSort, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

const HouseholdsList = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const zoneId = queryParams.get('zone');

  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(zoneId || '');
  const [sortOrder, setSortOrder] = useState('name_asc');

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

    fetchZones();
  }, [user]);

  useEffect(() => {
    // Fetch households based on filters
    const fetchHouseholds = async () => {
      try {
        setLoading(true);
        
        let url = `/api/households?page=${currentPage}`;
        
        if (selectedZone) {
          url += `&zone=${selectedZone}`;
        }
        
        // Extract sort field and direction
        const [sortField, sortDirection] = sortOrder.split('_');
        url += `&sort=${sortField}&order=${sortDirection}`;
        
        const res = await axios.get(url);
        
        setHouseholds(res.data.data);
        setTotalPages(Math.ceil(res.data.count / 10)); // Assuming 10 items per page
        setLoading(false);
      } catch (err) {
        setError('Error loading households');
        setLoading(false);
      }
    };

    fetchHouseholds();
  }, [currentPage, selectedZone, sortOrder]);

  // Filter households based on search term
  const filteredHouseholds = searchTerm
    ? households.filter(household => 
        household.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : households;

  // Handle zone filter change
  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sort order change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Households</h1>
        {(user.role === 'admin' || user.role === 'leader') && (
          <Button as={Link} to="/households/new" variant="primary">
            <FontAwesomeIcon icon={faHome} className="me-2" />
            Add Household
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by address, house number, or name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faFilter} />
                  </InputGroup.Text>
                  <Form.Select 
                    value={selectedZone} 
                    onChange={handleZoneChange}
                  >
                    <option value="">All Zones</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.name}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSort} />
                  </InputGroup.Text>
                  <Form.Select 
                    value={sortOrder} 
                    onChange={handleSortChange}
                  >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="rating_desc">Rating (High to Low)</option>
                    <option value="rating_asc">Rating (Low to High)</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Households List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Card className="mb-4">
          <Card.Body className="text-center py-5 text-danger">
            {error}
          </Card.Body>
        </Card>
      ) : filteredHouseholds.length === 0 ? (
        <Card className="mb-4">
          <Card.Body className="text-center py-5">
            No households found matching your criteria.
          </Card.Body>
        </Card>
      ) : (
        <Card className="mb-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>House #</th>
                  <th>Address</th>
                  <th>Resident</th>
                  <th>Zone</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHouseholds.map((household) => (
                  <tr key={household._id}>
                    <td>{household.houseNumber}</td>
                    <td>{household.address}</td>
                    <td>{household.user?.name || 'N/A'}</td>
                    <td>
                      <Badge bg="info" className="rounded-pill">
                        {household.nyumbaKumiZone?.name || 'N/A'}
                      </Badge>
                    </td>
                    <td>
                      {renderRatingStars(household.averageRating)}
                      <span className="ms-2">({household.averageRating.toFixed(1)})</span>
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/households/${household._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View <FontAwesomeIcon icon={faChevronRight} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {[...Array(totalPages).keys()].map((_, index) => (
              <li 
                key={index}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HouseholdsList;
