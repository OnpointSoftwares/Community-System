import React, { useContext, useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHome, faStar, faUsers, faChartLine, faTasks, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../utils/AuthContext';
import axios from 'axios';

const LeaderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    householdsCount: 0,
    alertsCount: 0,
    ratingsCount: 0,
    tasksCount: 0,
    completedTasksCount: 0,
    averageZoneRating: 0
  });
  const [zones, setZones] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        // Get leader's zones - Use _id instead of id
        const zonesRes = await axios.get(`/api/leaders/${user._id}/zones`, { headers });
        const leaderZones = zonesRes.data.data;
        setZones(leaderZones);
        
        // Get all zone IDs assigned to this leader
        const zoneIds = leaderZones.map(zone => zone._id);
        
        // Fetch households count for these zones
        const householdsPromises = zoneIds.map(zoneId => 
          axios.get(`/api/households?nyumbaKumiZone=${zoneId}`, { headers })
        );
        const householdResults = await Promise.all(householdsPromises);
        const householdsCount = householdResults.reduce((total, res) => total + (res.data.count || 0), 0);
        
        // Fetch alerts count
        const alertsRes = await axios.get('/api/alerts', { headers });
        // Filter alerts for leader's zones only
        const leaderAlerts = alertsRes.data.data ? alertsRes.data.data.filter(alert => 
          zoneIds.includes(alert.nyumbaKumiZone)) : [];
        const alertsCount = leaderAlerts.length;
        
        // Fetch ratings for leader's zones
        const ratingsRes = await axios.get('/api/ratings', { headers });
        const leaderRatings = ratingsRes.data.data ? ratingsRes.data.data.filter(rating => {
          // Check if the rating's household is in one of the leader's zones
          // This is an approximation as we would need to fetch each household to check its zone
          return rating.user === user._id;
        }) : [];
        const ratingsCount = leaderRatings.length;
        
        // Calculate average zone rating
        let avgRating = 0;
        if (ratingsCount > 0) {
          const totalRating = leaderRatings.reduce((sum, rating) => sum + rating.rating, 0);
          avgRating = totalRating / ratingsCount;
        }
        
        // Fetch tasks assigned by this leader or for their zones
        const tasksRes = await axios.get('/api/tasks', { headers });
        // Filter for tasks created by this leader or assigned to households in their zones
        const leaderTasks = tasksRes.data.data ? tasksRes.data.data.filter(task => 
          task.user === user._id || zoneIds.includes(task.nyumbaKumiZone)
        ) : [];
        setRecentTasks(leaderTasks.slice(0, 5)); // Show only 5 most recent tasks
        
        // Calculate completed tasks
        const completedTasks = leaderTasks.filter(task => task.status === 'completed');
        
        // Set actual stats
        setStats({
          householdsCount,
          alertsCount,
          ratingsCount,
          tasksCount: leaderTasks.length,
          completedTasksCount: completedTasks.length,
          averageZoneRating: avgRating
        });
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error loading leader dashboard data');
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchLeaderData();
    }
  }, [user]);

  if (loading) {
    return <div className="text-center py-5">Loading leader dashboard...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h1>House Hold member Dashboard</h1>
        </div>
      
      <p className="lead mb-4">
        Welcome, Household member {user?.name}!
      </p>

      {/* Quick Actions */}
      <h4 className="mb-3">Quick Actions</h4>
      <Row>
     
        <Col md={3}>
          <Card className="mb-4 text-center p-3">
            <FontAwesomeIcon icon={faTasks} size="2x" className="mb-3 text-success" />
            <h5>Tasks</h5>
            <p className="mb-3">Assign and manage household tasks</p>
            <Button as={Link} to="/tasks" variant="outline-success" size="sm">
              View Tasks
            </Button>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4 text-center p-3">
            <FontAwesomeIcon icon={faBell} size="2x" className="mb-3 text-warning" />
            <h5>Alerts</h5>
            <p className="mb-3"> view community alerts</p>
            <Button as={Link} to="/alerts" variant="outline-warning" size="sm">
              View Alerts
            </Button>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4 text-center p-3">
            <FontAwesomeIcon icon={faStar} size="2x" className="mb-3 text-success" />
            <h5>Ratings</h5>
            <p className="mb-3">View and manage household ratings</p>
            <Button as={Link} to="/ratings" variant="outline-success" size="sm">
              View Ratings
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LeaderDashboard;
