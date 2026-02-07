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

// 简化的product_id验证函数
const validateProduct_id = (product_id: any, required = false) => {
  if (product_id === undefined || product_id === null || product_id === '') {
    if (required) {
      return { valid: false, error: 'product_id是必填字段', code: 'REQUIRED_PRODUCT_ID_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedProduct_id = parseInt(product_id, 10)
  if (isNaN(parsedProduct_id)) {
    return {
      valid: false,
      error: `product_id必须是数字，收到的值: "${product_id}"`,
      code: 'INVALID_PRODUCT_ID_FORMAT'
    }
  }

  return { valid: true, value: parsedProduct_id }
}

// 简化的quantity验证函数
const validateQuantity = (quantity: any, required = false) => {
  if (quantity === undefined || quantity === null || quantity === '') {
    if (required) {
      return { valid: false, error: 'quantity是必填字段', code: 'REQUIRED_QUANTITY_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedQuantity = parseInt(quantity, 10)
  if (isNaN(parsedQuantity)) {
    return {
      valid: false,
      error: `quantity必须是数字，收到的值: "${quantity}"`,
      code: 'INVALID_QUANTITY_FORMAT'
    }
  }

  return { valid: true, value: parsedQuantity }
}



export const getOrder_itemService = (page = 0, pageSize = 10) => {
  const getOrder_itemQuery = `query ($page: Int, $pageSize: Int) { order_item(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id order_id product_id product_name product_image price quantity subtotal
        } 
      } 
    }`

  return getLocalGraphql(getOrder_itemQuery, {
    page,
    pageSize
  })
}

export const searchOrder_itemByIdService = (id: number) => {
  const searchOrder_itemByIdQuery = `query ($id: Int) { order_itemGet(id: $id){
      id order_id product_id product_name product_image price quantity subtotal
    }
  }`

  return getLocalGraphql(searchOrder_itemByIdQuery, {
    id
  })
}

export const searchOrder_itemService = (page = 0, pageSize = 10, data: any) => {
  const { product_name } = data



  const searchOrder_itemQuery = `query ($page: Int, $pageSize: Int, $data: Order_itemSearchInput) { 
    order_itemSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id order_id product_id product_name product_image price quantity subtotal
      } 
    }
  }`

  return getLocalGraphql(searchOrder_itemQuery, {
    page,
    pageSize,
    data: {
      product_name
    }
  })
}

export const addOrder_itemService = (data: any) => {
  const { order_id, product_id, product_name, product_image, price, quantity, subtotal } = data

  // 验证必填order_id
  const order_idValidation = validateOrder_id(order_id, true)
  if (!order_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: order_idValidation.error,
      code: order_idValidation.code
    })
  }

  // 验证必填product_id
  const product_idValidation = validateProduct_id(product_id, true)
  if (!product_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: product_idValidation.error,
      code: product_idValidation.code
    })
  }

  // 验证必填quantity
  const quantityValidation = validateQuantity(quantity, true)
  if (!quantityValidation.valid) {
    return Promise.reject({
      error: true,
      message: quantityValidation.error,
      code: quantityValidation.code
    })
  }



  const addOrder_itemQuery = `mutation ($data: Order_itemAddInput) { order_itemAdd(data: $data) }`

  return getLocalGraphql(addOrder_itemQuery, {
    data: {
      order_id: order_idValidation.value,
      product_id: product_idValidation.value,
      product_name,
      product_image,
      price,
      quantity: quantityValidation.value,
      subtotal
    }
  })
}

export const updateOrder_itemService = (id: number, data: any) => {
  const { order_id, product_id, product_name, product_image, price, quantity, subtotal } = data

  // 验证必填order_id
  const order_idValidation = validateOrder_id(order_id, true)
  if (!order_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: order_idValidation.error,
      code: order_idValidation.code
    })
  }

  // 验证必填product_id
  const product_idValidation = validateProduct_id(product_id, true)
  if (!product_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: product_idValidation.error,
      code: product_idValidation.code
    })
  }

  // 验证必填quantity
  const quantityValidation = validateQuantity(quantity, true)
  if (!quantityValidation.valid) {
    return Promise.reject({
      error: true,
      message: quantityValidation.error,
      code: quantityValidation.code
    })
  }



  const updateOrder_itemQuery = `mutation ($id: Int, $data: Order_itemAddInput) { order_itemUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateOrder_itemQuery, {
    id,
    data: {
      order_id: order_idValidation.value,
      product_id: product_idValidation.value,
      product_name,
      product_image,
      price,
      quantity: quantityValidation.value,
      subtotal
    }
  })
}

export const deleteOrder_itemService = (id: number) => {
  const deleteOrder_itemQuery = `mutation ($id: Int) { order_itemDelete(id: $id) }`

  return getLocalGraphql(deleteOrder_itemQuery, {
    id
  })
}

export const batchAddOrder_itemService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ order_id: number; product_id: number; product_name: any; product_image: any; price: any; quantity: number; subtotal: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { order_id, product_id, product_name, product_image, price, quantity, subtotal } = datas[i]

    const order_idValidation = validateOrder_id(order_id, true)
    if (!order_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${order_idValidation.error}`,
        code: order_idValidation.code
      })
    }

    const product_idValidation = validateProduct_id(product_id, true)
    if (!product_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${product_idValidation.error}`,
        code: product_idValidation.code
      })
    }

    const quantityValidation = validateQuantity(quantity, true)
    if (!quantityValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${quantityValidation.error}`,
        code: quantityValidation.code
      })
    }

    validatedDatas.push({
      order_id: order_idValidation.value!,
    product_id: product_idValidation.value!,
    product_name,
    product_image,
    price,
    quantity: quantityValidation.value!,
    subtotal
    })
  }

  const batchAddOrder_itemQuery = `mutation ($datas: [Order_itemAddInput]) { order_itemBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddOrder_itemQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteOrder_itemService = (ids: any) => {
  const batchDeleteOrder_itemQuery = `mutation ($ids: [Int]) { order_itemBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteOrder_itemQuery, {
    ids
  })
}
