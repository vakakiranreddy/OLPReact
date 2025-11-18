import React, { useState, useEffect } from 'react'
import { userService, type AdminRegisterReviewerDto } from '../../services/userService'
import type { UserResponse, DepartmentResponse, Department } from '../../types'

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<number | undefined>()
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>()
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState<AdminRegisterReviewerDto>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 1,
    departmentId: undefined
  })

  const roles = [
    { value: 0, label: 'Applicant' },
    { value: 1, label: 'Reviewer' },
    { value: 2, label: 'DepartmentHead' },
    { value: 3, label: 'Admin' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { users: usersData, departments: deptData } = await userService.getUsersWithDepartments()
      
      setUsers(usersData)
      setDepartments(deptData.map((dept: Department) => ({
        id: dept.departmentId,
        name: dept.departmentName,
        description: dept.description || '',
        isActive: dept.isActive ?? true,
        createdAt: dept.createdAt || ''
      })))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const filteredUsers = await userService.getUsersWithFilters(selectedRole, selectedDepartment, searchTerm)
      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedRole(undefined)
    setSelectedDepartment(undefined)
    loadData()
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const result = await userService.adminCreateUserAndGetList(newUser)
      setUsers(result.users)
      setDepartments(result.departments.map((dept: any) => ({
        id: dept.departmentId,
        name: dept.departmentName,
        description: dept.description || '',
        isActive: dept.isActive ?? true,
        createdAt: dept.createdAt || ''
      })))
      setShowCreateUser(false)
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 1,
        departmentId: undefined
      })
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setCreatingUser(false)
    }
  }

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      if (isActive) {
        const result = await userService.deactivateUserAndGetList(userId)
        setUsers(result.users)
        setDepartments(result.departments.map((dept: any) => ({
          id: dept.departmentId,
          name: dept.departmentName,
          description: dept.description || '',
          isActive: dept.isActive ?? true,
          createdAt: dept.createdAt || ''
        })))
      } else {
        const result = await userService.activateUserAndGetList(userId)
        setUsers(result.users)
        setDepartments(result.departments.map((dept: any) => ({
          id: dept.departmentId,
          name: dept.departmentName,
          description: dept.description || '',
          isActive: dept.isActive ?? true,
          createdAt: dept.createdAt || ''
        })))
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const getRoleName = (role: number) => {
    return roles.find(r => r.value === role)?.label || 'Unknown'
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>User Management</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateUser(true)}
            >
              <i className="fas fa-plus me-2"></i>Create User
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-4 col-md-12">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-lg-2 col-md-4">
                  <select
                    className="form-select form-select-sm"
                    value={selectedRole !== undefined ? selectedRole.toString() : ''}
                    onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">All Roles</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-3 col-md-4">
                  <select
                    className="form-select form-select-sm"
                    value={selectedDepartment !== undefined ? selectedDepartment.toString() : ''}
                    onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2 col-md-2 col-6">
                  <button className="btn btn-outline-primary w-100" onClick={handleSearch}>
                    Search
                  </button>
                </div>
                <div className="col-lg-1 col-md-2 col-6">
                  <button className="btn btn-outline-secondary w-100" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Users Cards */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {users.map(user => (
                <div key={user.userId} className="col-md-6 col-lg-4 col-xl-3">
                  <div className="card">
                    <div className="card-body p-3">
                      <div className="text-center mb-3">
                        {user.profileImage ? (
                          <img 
                            src={`data:image/jpeg;base64,${user.profileImage}`}
                            alt="Profile"
                            className="rounded-circle"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-light text-dark d-flex align-items-center justify-content-center mx-auto"
                            style={{ width: '48px', height: '48px', fontSize: '18px', fontWeight: 'bold' }}
                          >
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                        )}
                        <h6 className="card-title mt-2 mb-0">{user.firstName} {user.lastName}</h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <small className="text-muted">Role: </small>
                          <span className={`fw-medium ${
                            user.role === 3 ? 'text-danger' : 
                            user.role === 2 ? 'text-warning' : 
                            user.role === 1 ? 'text-info' : 'text-secondary'
                          }`}>
                            {getRoleName(user.role)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-telephone text-muted me-1"></i>
                          <small>{user.phoneNumber}</small>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center flex-grow-1 me-2">
                          <i className="bi bi-envelope text-muted me-1"></i>
                          <small className="text-truncate">{user.email}</small>
                        </div>
                        <button
                          className={`btn btn-xs ${user.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleUserStatus(user.userId, user.isActive)}
                          style={{fontSize: '10px', padding: '2px 8px'}}
                        >
                          {user.isActive ? 'Deact' : 'Act'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New User</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateUser(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newUser.phoneNumber}
                        onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select form-select-sm"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: Number(e.target.value)})}
                        required
                      >
                        {roles.filter(role => role.value !== 0).map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select form-select-sm"
                        value={newUser.departmentId || ''}
                        onChange={(e) => setNewUser({...newUser, departmentId: e.target.value ? Number(e.target.value) : undefined})}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateUser(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={creatingUser}>
                    {creatingUser ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement