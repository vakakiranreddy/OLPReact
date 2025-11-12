import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Form, Alert } from 'react-bootstrap'
import { userNotificationService, type UserNotification } from '../services/userNotificationService'
import { broadcastNotificationService, type BroadcastNotification } from '../services/broadcastNotificationService'

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const [personalNotifs, broadcastNotifs] = await Promise.all([
        userNotificationService.getMyNotifications(),
        broadcastNotificationService.getAllBroadcasts()
      ])
      setNotifications(personalNotifs)
      setBroadcasts(broadcastNotifs)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadNotifications()
      return
    }

    try {
      if (activeTab === 'personal') {
        const results = await userNotificationService.searchMyNotifications(searchTerm)
        setNotifications(results)
      } else {
        const results = await broadcastNotificationService.searchBroadcasts(searchTerm)
        setBroadcasts(results)
      }
    } catch (error) {
      console.error('Error searching notifications:', error)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await userNotificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading notifications...</div>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Notifications</h2>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '250px' }}
              />
              <Button variant="outline-primary" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal ({notifications.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'broadcasts' ? 'active' : ''}`}
                onClick={() => setActiveTab('broadcasts')}
              >
                Announcements ({broadcasts.length})
              </button>
            </li>
          </ul>

          {/* Personal Notifications */}
          {activeTab === 'personal' && (
            <div>
              {notifications.length === 0 ? (
                <Alert variant="info">No personal notifications found.</Alert>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <Card key={notification.id} className={`mb-3 ${!notification.isRead ? 'border-primary' : ''}`}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h6 className="mb-0 me-2">{notification.title}</h6>
                              {!notification.isRead && (
                                <Badge bg="primary" className="me-2">New</Badge>
                              )}
                              {notification.applicationId && (
                                <Badge bg="secondary">App #{notification.applicationId}</Badge>
                              )}
                            </div>
                            <p className="text-muted mb-2">{notification.message}</p>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(notification.createdDate)}
                            </small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Broadcast Notifications */}
          {activeTab === 'broadcasts' && (
            <div>
              {broadcasts.length === 0 ? (
                <Alert variant="info">No announcements found.</Alert>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map(broadcast => (
                    <Card key={broadcast.id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h6 className="mb-0 me-2">{broadcast.title}</h6>
                              <Badge bg={broadcast.isActive ? 'success' : 'secondary'}>
                                {broadcast.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-muted mb-2">{broadcast.message}</p>
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              By {broadcast.createdBy} • 
                              <i className="bi bi-clock ms-2 me-1"></i>
                              {formatDate(broadcast.createdDate)}
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default NotificationsPage