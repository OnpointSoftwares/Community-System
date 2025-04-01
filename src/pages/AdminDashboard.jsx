import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Form, Alert, Table, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faMapMarkerAlt, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [zones, setZones] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const zoneSchema = Yup.object().shape({
    name: Yup.string().required('Zone name is required'),
    location: Yup.string().required('Location is required'),
    description: Yup.string(),
    leader: Yup.string().required('A leader must be assigned to the zone')
  });

  useEffect(() => {
    // Fetch zones and available leaders when component mounts
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all zones
        const zonesRes = await axios.get('/api/nyumbakumi/zones', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Get all leaders
        const leadersRes = await axios.get('/api/leaders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setZones(zonesRes.data.data || []);
        setLeaders(leadersRes.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenZoneModal = (zone = null) => {
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  const handleCloseZoneModal = () => {
    setSelectedZone(null);
    setShowZoneModal(false);
  };

  const handleCreateZone = async (values, { setSubmitting, resetForm }) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (selectedZone) {
        // Update existing zone
        await axios.put(`/api/nyumbakumi/zones/${selectedZone._id}`, values, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Create new zone
        await axios.post('/api/nyumbakumi/zones', values, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      // Refresh zones list
      const zonesRes = await axios.get('/api/nyumbakumi/zones', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setZones(zonesRes.data.data || []);
      resetForm();
      handleCloseZoneModal();
    } catch (err) {
      console.error('Error saving zone:', err);
      setError('Error saving zone: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/nyumbakumi/zones/${zoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh zones list
      const zonesRes = await axios.get('/api/nyumbakumi/zones', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setZones(zonesRes.data.data || []);
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError('Error deleting zone: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <Button variant="primary" onClick={() => handleOpenZoneModal()}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Create Zone
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header as="h5">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              Nyumba Kumi Zones
            </Card.Header>
            <Card.Body>
              {zones.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Zone Name</th>
                      <th>Location</th>
                      <th>Leader</th>
                      <th>Households</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map(zone => (
                      <tr key={zone._id}>
                        <td>{zone.name}</td>
                        <td>{zone.location}</td>
                        <td>{zone.leader?.name || 'Unassigned'}</td>
                        <td>{zone.households?.length || 0}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenZoneModal(zone)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteZone(zone._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p>No zones have been created yet.</p>
                  <Button variant="primary" onClick={() => handleOpenZoneModal()}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create First Zone
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Zone Management Modal */}
      <Modal show={showZoneModal} onHide={handleCloseZoneModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedZone ? 'Edit Zone' : 'Create New Zone'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: selectedZone?.name || '',
            location: selectedZone?.location || '',
            description: selectedZone?.description || '',
            leader: selectedZone?.leader?._id || ''
          }}
          validationSchema={zoneSchema}
          onSubmit={handleCreateZone}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Zone Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                    placeholder="Enter zone name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.location && errors.location}
                    placeholder="Enter zone location"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && errors.description}
                    placeholder="Enter zone description"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Assign Leader</Form.Label>
                  <Form.Select
                    name="leader"
                    value={values.leader}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.leader && errors.leader}
                  >
                    <option value="">Select a leader</option>
                    {leaders.map(leader => (
                      <option key={leader._id} value={leader._id}>
                        {leader.name} ({leader.email})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.leader}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseZoneModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : selectedZone ? 'Update Zone' : 'Create Zone'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
