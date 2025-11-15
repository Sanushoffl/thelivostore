import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/order/delete',
        { orderId },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_0.5fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <div className='flex flex-col gap-2'>
                {order.items && order.items.length > 0 && order.items[0].image ? (
                  <img className='w-16 h-16 object-cover rounded' src={Array.isArray(order.items[0].image) ? order.items[0].image[0] : order.items[0].image} alt="" />
                ) : (
                  <img className='w-12' src={assets.parcel_icon} alt="" />
                )}
              </div>
              <div>
                <div className='flex flex-col gap-1'>
                  {order.items.map((item, index) => {
                    const itemImage = item.image ? (Array.isArray(item.image) ? item.image[0] : item.image) : null
                    return (
                      <div key={index} className='flex items-center gap-2 py-1'>
                        {itemImage && <img className='w-10 h-10 object-cover rounded' src={itemImage} alt={item.name} />}
                        <p>{item.name} x {item.quantity} <span className='text-gray-500'>{item.size}</span></p>
                      </div>
                    )
                  })}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : { order.payment ? 'Done' : 'Pending' }</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
              <div className='flex flex-col gap-2'>
                <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold text-xs'>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button 
                  onClick={() => deleteOrder(order._id)} 
                  className='bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600'
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders