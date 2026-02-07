import { getLocalGraphql } from '@/utils/fetch'
import _ from 'lodash'

// 简化的user_id验证函数
const validateUser_id = (user_id: any, required = false) => {
  if (user_id === undefined || user_id === null || user_id === '') {
    if (required) {
      return { valid: false, error: 'user_id是必填字段', code: 'REQUIRED_USER_ID_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedUser_id = parseInt(user_id, 10)
  if (isNaN(parsedUser_id)) {
    return {
      valid: false,
      error: `user_id必须是数字，收到的值: "${user_id}"`,
      code: 'INVALID_USER_ID_FORMAT'
    }
  }

  return { valid: true, value: parsedUser_id }
}



export const getOrderService = (page = 0, pageSize = 10) => {
  const getOrderQuery = `query ($page: Int, $pageSize: Int) { order(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id order_no user_id total_amount pay_amount status pay_status pay_type pay_time ship_time express_company express_no receiver_name receiver_phone receiver_address remark
        } 
      } 
    }`

  return getLocalGraphql(getOrderQuery, {
    page,
    pageSize
  })
}

export const searchOrderByIdService = (id: number) => {
  const searchOrderByIdQuery = `query ($id: Int) { orderGet(id: $id){
      id order_no user_id total_amount pay_amount status pay_status pay_type pay_time ship_time express_company express_no receiver_name receiver_phone receiver_address remark
    }
  }`

  return getLocalGraphql(searchOrderByIdQuery, {
    id
  })
}

export const searchOrderService = (page = 0, pageSize = 10, data: any) => {
  const { order_no } = data



  const searchOrderQuery = `query ($page: Int, $pageSize: Int, $data: OrderSearchInput) { 
    orderSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id order_no user_id total_amount pay_amount status pay_status pay_type pay_time ship_time express_company express_no receiver_name receiver_phone receiver_address remark
      } 
    }
  }`

  return getLocalGraphql(searchOrderQuery, {
    page,
    pageSize,
    data: {
      order_no
    }
  })
}

export const addOrderService = (data: any) => {
  const { order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark } = data

  // 验证必填user_id
  const user_idValidation = validateUser_id(user_id, true)
  if (!user_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: user_idValidation.error,
      code: user_idValidation.code
    })
  }



  const addOrderQuery = `mutation ($data: OrderAddInput) { orderAdd(data: $data) }`

  return getLocalGraphql(addOrderQuery, {
    data: {
      order_no,
      user_id: user_idValidation.value,
      total_amount,
      pay_amount,
      status,
      pay_status,
      pay_type,
      express_company,
      express_no,
      receiver_name,
      receiver_phone,
      receiver_address,
      remark
    }
  })
}

export const updateOrderService = (id: number, data: any) => {
  const { order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark } = data

  // 验证必填user_id
  const user_idValidation = validateUser_id(user_id, true)
  if (!user_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: user_idValidation.error,
      code: user_idValidation.code
    })
  }



  const updateOrderQuery = `mutation ($id: Int, $data: OrderAddInput) { orderUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateOrderQuery, {
    id,
    data: {
      order_no,
      user_id: user_idValidation.value,
      total_amount,
      pay_amount,
      status,
      pay_status,
      pay_type,
      express_company,
      express_no,
      receiver_name,
      receiver_phone,
      receiver_address,
      remark
    }
  })
}

export const deleteOrderService = (id: number) => {
  const deleteOrderQuery = `mutation ($id: Int) { orderDelete(id: $id) }`

  return getLocalGraphql(deleteOrderQuery, {
    id
  })
}

export const batchAddOrderService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ order_no: any; user_id: number; total_amount: any; pay_amount: any; status: any; pay_status: any; pay_type: any; express_company: any; express_no: any; receiver_name: any; receiver_phone: any; receiver_address: any; remark: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark } = datas[i]

    const user_idValidation = validateUser_id(user_id, true)
    if (!user_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${user_idValidation.error}`,
        code: user_idValidation.code
      })
    }

    validatedDatas.push({
      order_no,
    user_id: user_idValidation.value!,
    total_amount,
    pay_amount,
    status,
    pay_status,
    pay_type,
    express_company,
    express_no,
    receiver_name,
    receiver_phone,
    receiver_address,
    remark
    })
  }

  const batchAddOrderQuery = `mutation ($datas: [OrderAddInput]) { orderBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddOrderQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteOrderService = (ids: any) => {
  const batchDeleteOrderQuery = `mutation ($ids: [Int]) { orderBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteOrderQuery, {
    ids
  })
}
