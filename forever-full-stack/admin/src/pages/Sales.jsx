import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Sales = ({ token }) => {

  const [salesData, setSalesData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSalesData = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/sales-analytics',
        {},
        { headers: { token } }
      )

      if (response.data.success) {
        setSalesData(response.data)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSalesData()
    }
  }, [token])

  if (loading) {
    return <div>Loading sales data...</div>
  }

  if (!salesData) {
    return <div>No sales data available</div>
  }

  return (
    <div>
      <h3 className='mb-6 text-2xl font-semibold'>Sales Analytics</h3>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <p className='text-gray-600 text-sm mb-2'>Total Sales</p>
          <p className='text-3xl font-bold text-blue-700'>{currency}{salesData.totalSales.toFixed(2)}</p>
        </div>
        <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
          <p className='text-gray-600 text-sm mb-2'>Total Orders</p>
          <p className='text-3xl font-bold text-green-700'>{salesData.totalOrders}</p>
        </div>
        <div className='bg-purple-50 border border-purple-200 rounded-lg p-6'>
          <p className='text-gray-600 text-sm mb-2'>Products Sold</p>
          <p className='text-3xl font-bold text-purple-700'>{salesData.productSales.length}</p>
        </div>
      </div>

      {/* Product Sales Table */}
      <div className='border rounded-lg overflow-hidden'>
        <div className='bg-gray-100 border-b px-4 py-3'>
          <h4 className='font-semibold text-lg'>Sales by Product</h4>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Product</th>
                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Image</th>
                <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>Quantity Sold</th>
                <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>Total Revenue</th>
                <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>Orders</th>
              </tr>
            </thead>
            <tbody>
              {salesData.productSales.length === 0 ? (
                <tr>
                  <td colSpan="5" className='px-4 py-8 text-center text-gray-500'>
                    No sales data available
                  </td>
                </tr>
              ) : (
                salesData.productSales.map((product, index) => (
                  <tr key={index} className='border-b hover:bg-gray-50'>
                    <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                      {product.productName}
                    </td>
                    <td className='px-4 py-3'>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.productName} 
                          className='w-16 h-16 object-cover rounded'
                        />
                      ) : (
                        <div className='w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400'>
                          No Image
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-3 text-right text-sm text-gray-700'>
                      {product.totalQuantity}
                    </td>
                    <td className='px-4 py-3 text-right text-sm font-semibold text-gray-900'>
                      {currency}{product.totalRevenue.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm text-gray-700'>
                      {product.orderCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Sales

