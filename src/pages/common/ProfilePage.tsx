import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { userService, type UpdateUserDto } from '../../services/userService'
import { updateUser } from '../../app/store/slices/authSlice'
import { showSuccess, showError } from '../../app/store/slices/notificationSlice'
import type { UserResponse } from '../../types'
import type { AppDispatch } from '../../app/store'

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updateData, setUpdateData] = useState<UpdateUserDto>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await userService.getProfile()
      setUser(profileData)
      dispatch(updateUser({ profileImage: profileData.profileImage }))
      setUpdateData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        email: profileData.email
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedUser = await userService.updateProfile(updateData)
      setUser(updatedUser)
      dispatch(updateUser(updatedUser))
      setIsEditing(false)
      dispatch(showSuccess('Profile updated successfully!'))
    } catch (error) {
      console.error('Error updating profile:', error)
      dispatch(showError('Failed to update profile'))
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await userService.uploadProfileImage(selectedFile)
      // Reload profile to get updated image data
      await loadProfile()
      setSelectedFile(null)
      dispatch(showSuccess('Profile image updated successfully!'))
    } catch (error) {
      console.error('Error uploading image:', error)
      dispatch(showError('Failed to upload image'))
    } finally {
      setUploading(false)
    }
  }



  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Failed to load profile</div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Edit Profile</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center">
                  <div className="mb-3">
                    {user.profileImage ? (
                      <img
                        src={`data:image/jpeg;base64,${user.profileImage}`}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{ width: '150px', height: '150px', fontSize: '48px' }}
                      >
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    {selectedFile && (
                      <button
                        className="btn btn-primary btn-sm mt-2"
                        onClick={handleImageUpload}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="col-md-8">
                  {!isEditing ? (
                    <div>
                      <div className="mb-3">
                        <label className="form-label"><strong>Name:</strong></label>
                        <p>{user.firstName} {user.lastName}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label"><strong>Email:</strong></label>
                        <p>{user.email}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label"><strong>Phone:</strong></label>
                        <p>{user.phoneNumber}</p>
                      </div>
                      {user.departmentName && (
                        <div className="mb-3">
                          <label className="form-label"><strong>Department:</strong></label>
                          <p>{user.departmentName}</p>
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label"><strong>Member Since:</strong></label>
                        <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile}>
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={updateData.firstName}
                          onChange={(e) => setUpdateData({...updateData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={updateData.lastName}
                          onChange={(e) => setUpdateData({...updateData, lastName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={updateData.email}
                          onChange={(e) => setUpdateData({...updateData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={updateData.phoneNumber}
                          onChange={(e) => setUpdateData({...updateData, phoneNumber: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setIsEditing(false)
                            setUpdateData({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              phoneNumber: user.phoneNumber,
                              email: user.email
                            })
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage