import React, { useState, useEffect } from 'react'
import { broadcastNotificationService, type CreateBroadcastDto } from '../services/broadcastNotificationService'
import { userNotificationService, type CreateUserNotificationDto } from '../services/userNotificationService'
import { userService } from '../services/userService'
import type { UserResponse } from '../types'

const AdminNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'individual'>('broadcast')
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(false)
  
  // Broadcast notification state
  const [broadcastForm, setBroadcastForm] = useState<CreateBroadcastDto>({
    title: '',
    message: '',
    targetRole: undefined,
    targetDepartmentId: undefined
  })
  
  const [departments, setDepartments] = useState<{departmentId: number, departmentName: string}[]>([])
  
  // Individual notification state
  const [individualForm, setIndividualForm] = useState<CreateUserNotificationDto>({
    title: '',
    message: '',
    type: 0, // General notification type
    userId: 0,
    sendEmail: false
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([])

  const roles = [
    { value: 0, label: 'Applicant' },
    { value: 1, label: 'Reviewer' },
    { value: 2, label: 'DepartmentHead' },
    { value: 3, label: 'Admin' }
  ]

  useEffect(() => {
    loadUsers()
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const { departmentService } = await import('../services/departmentService')
      const deptData = await departmentService.getAll()
      setDepartments(deptData)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  useEffect(() => {
    const filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await broadcastNotificationService.createBroadcast(broadcastForm)
      setBroadcastForm({
        title: '',
        message: '',
        targetRole: undefined,
        targetDepartmentId: undefined
      })
      alert('Broadcast notification sent successfully!')
    } catch (error) {
      console.error('Error sending broadcast:', error)
      alert('Failed to send broadcast notification')
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userNotificationService.createNotification(individualForm)
      setIndividualForm({
        title: '',
        message: '',
        type: 0,
        userId: 0,
        sendEmail: false
      })
      alert('Individual notification sent successfully!')
    } catch (error) {
      console.error('Error sending individual notification:', error)
      alert('Failed to send individual notification')
    } finally {
      setLoading(false)
    }
  }

  const getRoleName = (role: number) => {
    return roles.find(r => r.value === role)?.label || 'Unknown'
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Send Notifications</h2>

          {/* Tab Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'broadcast' ? 'active' : ''}`}
                onClick={() => setActiveTab('broadcast')}
              >
                Broadcast Message
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'individual' ? 'active' : ''}`}
                onClick={() => setActiveTab('individual')}
              >
                Individual Message
              </button>
            </li>
          </ul>

          {/* Broadcast Tab */}
          {activeTab === 'broadcast' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Send Broadcast Notification</h5>
                    <small className="text-muted">Send message to all users or target specific roles/departments</small>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleBroadcastSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Target Role (Optional)</label>
                          <select
                            className="form-select"
                            value={broadcastForm.targetRole !== undefined ? broadcastForm.targetRole.toString() : ''}
                            onChange={(e) => setBroadcastForm({...broadcastForm, targetRole: e.target.value ? Number(e.target.value) : undefined})}
                          >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Target Department (Optional)</label>
                          <select
                            className="form-select"
                            value={broadcastForm.targetDepartmentId !== undefined ? broadcastForm.targetDepartmentId.toString() : ''}
                            onChange={(e) => setBroadcastForm({...broadcastForm, targetDepartmentId: e.target.value ? Number(e.target.value) : undefined})}
                          >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                              <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={broadcastForm.title}
                          onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Message</label>
                        <textarea
                          className="form-control"
                          rows={5}
                          value={broadcastForm.message}
                          onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Send Broadcast'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Individual Tab */}
          {activeTab === 'individual' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Send Individual Notification</h5>
                    <small className="text-muted">Send a personal message to a specific user</small>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleIndividualSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Search User</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Select User</label>
                        <select
                          className="form-select"
                          value={individualForm.userId}
                          onChange={(e) => setIndividualForm({...individualForm, userId: Number(e.target.value)})}
                          required
                        >
                          <option value={0}>Select a user...</option>
                          {filteredUsers.map(user => (
                            <option key={user.userId} value={user.userId}>
                              {user.firstName} {user.lastName} ({user.email}) - {getRoleName(user.role)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={individualForm.title}
                          onChange={(e) => setIndividualForm({...individualForm, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Message</label>
                        <textarea
                          className="form-control"
                          rows={5}
                          value={individualForm.message}
                          onChange={(e) => setIndividualForm({...individualForm, message: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="sendEmail"
                          checked={individualForm.sendEmail}
                          onChange={(e) => setIndividualForm({...individualForm, sendEmail: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="sendEmail">
                          Also send via email
                        </label>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading || individualForm.userId === 0}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminNotifications