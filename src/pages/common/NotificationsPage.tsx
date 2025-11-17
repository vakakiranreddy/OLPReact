import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Form, Alert } from 'react-bootstrap'
import { userNotificationService, type UserNotification } from '../../services/userNotificationService'
import { broadcastNotificationService, type BroadcastNotification } from '../../services/broadcastNotificationService'

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
      const { userNotifications, broadcastNotifications } = await userNotificationService.getAllNotifications()
      setNotifications(userNotifications)
      setBroadcasts(broadcastNotifications)
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

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await userNotificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId))
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
                    <Card key={notification.notificationId} className="mb-3 shadow-sm border-0">
                      <Card.Body className="p-0">
                        <div className="p-3 d-flex justify-content-between align-items-center" style={{backgroundColor: '#e3f2fd'}}>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-normal" style={{color: '#1565c0'}}>{notification.title}</h6>
                            {notification.applicationId && (
                              <Badge bg="secondary" className="small">App #{notification.applicationId}</Badge>
                            )}
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.notificationId)}
                            style={{backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #dc3545'}}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                        <div className="p-3">
                          <p className="mb-1 small text-dark">{notification.message}</p>
                          <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(notification.createdAt)}
                          </p>
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
                    <Card key={broadcast.broadcastId} className="mb-3 shadow-sm border-0">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="mb-2 p-2 rounded" style={{backgroundColor: '#e3f2fd'}}>
                              <h6 className="mb-0 fw-normal" style={{color: '#1565c0'}}>{broadcast.title}</h6>
                            </div>
                            <div className="mb-3">
                              <p className="mb-1 small text-dark">{broadcast.message}</p>
                              <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>
                                <i className="bi bi-person me-1"></i>
                                By {broadcast.createdBy} • 
                                <i className="bi bi-clock ms-2 me-1"></i>
                                {formatDate(broadcast.createdAt)}
                              </p>
                            </div>
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