import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const SubCategories = ({ token }) => {

  const [subCategories, setSubCategories] = useState([])
  const [newSubCategory, setNewSubCategory] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/subCategory/list')
      if (response.data.success) {
        setSubCategories(response.data.subCategories)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const addSubCategory = async (e) => {
    e.preventDefault()
    if (!newSubCategory.trim()) {
      toast.error('Please enter a subCategory name')
      return
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/subCategory/add',
        { name: newSubCategory },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        setNewSubCategory('')
        await fetchSubCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const updateSubCategory = async (id) => {
    if (!editingName.trim()) {
      toast.error('Please enter a subCategory name')
      return
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/subCategory/update',
        { id, name: editingName },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        setEditingId(null)
        setEditingName('')
        await fetchSubCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const removeSubCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subCategory?')) {
      return
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/subCategory/remove',
        { id },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchSubCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const startEditing = (id, name) => {
    setEditingId(id)
    setEditingName(name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  useEffect(() => {
    fetchSubCategories()
  }, [])

  return (
    <>
      <p className='mb-4 text-xl font-semibold'>Manage SubCategories (Types)</p>
      
      {/* Add New SubCategory Form */}
      <form onSubmit={addSubCategory} className='mb-6 p-4 border rounded'>
        <p className='mb-2 font-medium'>Add New SubCategory</p>
        <div className='flex gap-2'>
          <input
            type="text"
            value={newSubCategory}
            onChange={(e) => setNewSubCategory(e.target.value)}
            placeholder="Enter subCategory name (e.g., Topwear)"
            className='flex-1 px-3 py-2 border rounded'
            required
          />
          <button type="submit" className='px-4 py-2 bg-black text-white rounded'>
            Add
          </button>
        </div>
      </form>

      {/* SubCategories List */}
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[3fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Name</b>
          <b className='text-center'>Action</b>
        </div>

        {subCategories.length === 0 ? (
          <p className='text-gray-500 py-4'>No subCategories found. Add one above.</p>
        ) : (
          subCategories.map((item, index) => (
            <div
              className='grid grid-cols-[3fr_1fr] items-center gap-2 py-2 px-2 border text-sm'
              key={index}
            >
              {editingId === item._id ? (
                <div className='flex gap-2'>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className='flex-1 px-2 py-1 border rounded'
                  />
                  <button
                    onClick={() => updateSubCategory(item._id)}
                    className='px-3 py-1 bg-green-600 text-white rounded text-xs'
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className='px-3 py-1 bg-gray-400 text-white rounded text-xs'
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p>{item.name}</p>
              )}
              <div className='flex gap-2 justify-center'>
                {editingId !== item._id && (
                  <>
                    <button
                      onClick={() => startEditing(item._id, item.name)}
                      className='px-3 py-1 bg-blue-600 text-white rounded text-xs'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeSubCategory(item._id)}
                      className='px-3 py-1 bg-red-600 text-white rounded text-xs'
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default SubCategories

