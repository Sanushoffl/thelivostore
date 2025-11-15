import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Title from '../components/Title'

const Profile = () => {
    const { navigate, backendUrl, token } = useContext(ShopContext)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profileImage: null
    })
    const [previewImage, setPreviewImage] = useState('')

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchUserProfile()
    }, [token])

    const fetchUserProfile = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } })
            if (response.data.success) {
                setUser(response.data.user)
                setFormData({
                    name: response.data.user.name || '',
                    email: response.data.user.email || '',
                    profileImage: null
                })
                setPreviewImage(response.data.user.profileImage || '')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({ ...prev, profileImage: file }))
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const updateData = new FormData()
            updateData.append('name', formData.name)
            updateData.append('email', formData.email)
            if (formData.profileImage) {
                updateData.append('profileImage', formData.profileImage)
            }

            const response = await axios.post(backendUrl + '/api/user/updateProfile', updateData, {
                headers: { token }
            })

            if (response.data.success) {
                toast.success(response.data.message)
                setUser(response.data.user)
                setIsEditing(false)
                setFormData(prev => ({ ...prev, profileImage: null }))
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to update profile')
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            profileImage: null
        })
        setPreviewImage(user?.profileImage || '')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] py-8">
            <div className="text-2xl mb-8">
                <Title text1={'MY'} text2={'PROFILE'} />
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    {!isEditing ? (
                        // View Mode
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <img
                                    src={user?.profileImage || 'https://via.placeholder.com/150'}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                            </div>
                            
                            <div className="text-center w-full">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {user?.name || 'User'}
                                </h2>
                                <p className="text-gray-600 mb-6">{user?.email || 'No email'}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded hover:bg-gray-300 transition"
                                >
                                    View Orders
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={previewImage || user?.profileImage || 'https://via.placeholder.com/150'}
                                        alt="Profile Preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500">Click icon to change profile picture</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile

