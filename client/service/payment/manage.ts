import { getLocalGraphql } from '@/utils/fetch'
import _ from 'lodash'

// 简化的order_id验证函数
const validateOrder_id = (order_id: any, required = false) => {
  if (order_id === undefined || order_id === null || order_id === '') {
    if (required) {
      return { valid: false, error: 'order_id是必填字段', code: 'REQUIRED_ORDER_ID_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedOrder_id = parseInt(order_id, 10)
  if (isNaN(parsedOrder_id)) {
    return {
      valid: false,
      error: `order_id必须是数字，收到的值: "${order_id}"`,
      code: 'INVALID_ORDER_ID_FORMAT'
    }
  }

  return { valid: true, value: parsedOrder_id }
}



export const getPaymentService = (page = 0, pageSize = 10) => {
  const getPaymentQuery = `query ($page: Int, $pageSize: Int) { payment(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id order_id order_no transaction_id pay_type amount status pay_time callback_time remark
        } 
      } 
    }`

  return getLocalGraphql(getPaymentQuery, {
    page,
    pageSize
  })
}

export const searchPaymentByIdService = (id: number) => {
  const searchPaymentByIdQuery = `query ($id: Int) { paymentGet(id: $id){
      id order_id order_no transaction_id pay_type amount status pay_time callback_time remark
    }
  }`

  return getLocalGraphql(searchPaymentByIdQuery, {
    id
  })
}

export const searchPaymentService = (page = 0, pageSize = 10, data: any) => {
  const { order_no, transaction_id } = data



  const searchPaymentQuery = `query ($page: Int, $pageSize: Int, $data: PaymentSearchInput) { 
    paymentSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id order_id order_no transaction_id pay_type amount status pay_time callback_time remark
      } 
    }
  }`

  return getLocalGraphql(searchPaymentQuery, {
    page,
    pageSize,
    data: {
      order_no,
      transaction_id
    }
  })
}

export const addPaymentService = (data: any) => {
  const { order_id, order_no, transaction_id, pay_type, amount, status, remark } = data

  // 验证必填order_id
  const order_idValidation = validateOrder_id(order_id, true)
  if (!order_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: order_idValidation.error,
      code: order_idValidation.code
    })
  }



  const addPaymentQuery = `mutation ($data: PaymentAddInput) { paymentAdd(data: $data) }`

  return getLocalGraphql(addPaymentQuery, {
    data: {
      order_id: order_idValidation.value,
      order_no,
      transaction_id,
      pay_type,
      amount,
      status,
      remark
    }
  })
}

export const updatePaymentService = (id: number, data: any) => {
  const { order_id, order_no, transaction_id, pay_type, amount, status, remark } = data

  // 验证必填order_id
  const order_idValidation = validateOrder_id(order_id, true)
  if (!order_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: order_idValidation.error,
      code: order_idValidation.code
    })
  }



  const updatePaymentQuery = `mutation ($id: Int, $data: PaymentAddInput) { paymentUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updatePaymentQuery, {
    id,
    data: {
      order_id: order_idValidation.value,
      order_no,
      transaction_id,
      pay_type,
      amount,
      status,
      remark
    }
  })
}

export const deletePaymentService = (id: number) => {
  const deletePaymentQuery = `mutation ($id: Int) { paymentDelete(id: $id) }`

  return getLocalGraphql(deletePaymentQuery, {
    id
  })
}

export const batchAddPaymentService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ order_id: number; order_no: any; transaction_id: any; pay_type: any; amount: any; status: any; remark: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { order_id, order_no, transaction_id, pay_type, amount, status, remark } = datas[i]

    const order_idValidation = validateOrder_id(order_id, true)
    if (!order_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${order_idValidation.error}`,
        code: order_idValidation.code
      })
    }

    validatedDatas.push({
      order_id: order_idValidation.value!,
    order_no,
    transaction_id,
    pay_type,
    amount,
    status,
    remark
    })
  }

  const batchAddPaymentQuery = `mutation ($datas: [PaymentAddInput]) { paymentBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddPaymentQuery, {
    datas: validatedDatas
  })
}

export const batchDeletePaymentService = (ids: any) => {
  const batchDeletePaymentQuery = `mutation ($ids: [Int]) { paymentBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeletePaymentQuery, {
    ids
  })
}
