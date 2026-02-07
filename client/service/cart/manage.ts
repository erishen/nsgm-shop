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

// 简化的selected验证函数
const validateSelected = (selected: any, required = false) => {
  if (selected === undefined || selected === null || selected === '') {
    if (required) {
      return { valid: false, error: 'selected是必填字段', code: 'REQUIRED_SELECTED_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedSelected = parseInt(selected, 10)
  if (isNaN(parsedSelected)) {
    return {
      valid: false,
      error: `selected必须是数字，收到的值: "${selected}"`,
      code: 'INVALID_SELECTED_FORMAT'
    }
  }

  return { valid: true, value: parsedSelected }
}



export const getCartService = (page = 0, pageSize = 10) => {
  const getCartQuery = `query ($page: Int, $pageSize: Int) { cart(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id user_id product_id product_name product_image price quantity selected
        } 
      } 
    }`

  return getLocalGraphql(getCartQuery, {
    page,
    pageSize
  })
}

export const searchCartByIdService = (id: number) => {
  const searchCartByIdQuery = `query ($id: Int) { cartGet(id: $id){
      id user_id product_id product_name product_image price quantity selected
    }
  }`

  return getLocalGraphql(searchCartByIdQuery, {
    id
  })
}

export const searchCartService = (page = 0, pageSize = 10, data: any) => {
  const {  } = data



  const searchCartQuery = `query ($page: Int, $pageSize: Int, $data: CartSearchInput) { 
    cartSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id user_id product_id product_name product_image price quantity selected
      } 
    }
  }`

  return getLocalGraphql(searchCartQuery, {
    page,
    pageSize,
    data: {

    }
  })
}

export const addCartService = (data: any) => {
  const { user_id, product_id, product_name, product_image, price, quantity, selected } = data

  // 验证必填user_id
  const user_idValidation = validateUser_id(user_id, true)
  if (!user_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: user_idValidation.error,
      code: user_idValidation.code
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

  // 验证必填selected
  const selectedValidation = validateSelected(selected, true)
  if (!selectedValidation.valid) {
    return Promise.reject({
      error: true,
      message: selectedValidation.error,
      code: selectedValidation.code
    })
  }



  const addCartQuery = `mutation ($data: CartAddInput) { cartAdd(data: $data) }`

  return getLocalGraphql(addCartQuery, {
    data: {
      user_id: user_idValidation.value,
      product_id: product_idValidation.value,
      product_name,
      product_image,
      price,
      quantity: quantityValidation.value,
      selected: selectedValidation.value
    }
  })
}

export const updateCartService = (id: number, data: any) => {
  const { user_id, product_id, product_name, product_image, price, quantity, selected } = data

  // 验证必填user_id
  const user_idValidation = validateUser_id(user_id, true)
  if (!user_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: user_idValidation.error,
      code: user_idValidation.code
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

  // 验证必填selected
  const selectedValidation = validateSelected(selected, true)
  if (!selectedValidation.valid) {
    return Promise.reject({
      error: true,
      message: selectedValidation.error,
      code: selectedValidation.code
    })
  }



  const updateCartQuery = `mutation ($id: Int, $data: CartAddInput) { cartUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateCartQuery, {
    id,
    data: {
      user_id: user_idValidation.value,
      product_id: product_idValidation.value,
      product_name,
      product_image,
      price,
      quantity: quantityValidation.value,
      selected: selectedValidation.value
    }
  })
}

export const deleteCartService = (id: number) => {
  const deleteCartQuery = `mutation ($id: Int) { cartDelete(id: $id) }`

  return getLocalGraphql(deleteCartQuery, {
    id
  })
}

export const batchAddCartService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ user_id: number; product_id: number; product_name: any; product_image: any; price: any; quantity: number; selected: number }> = []

  for (let i = 0; i < datas.length; i++) {
    const { user_id, product_id, product_name, product_image, price, quantity, selected } = datas[i]

    const user_idValidation = validateUser_id(user_id, true)
    if (!user_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${user_idValidation.error}`,
        code: user_idValidation.code
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

    const selectedValidation = validateSelected(selected, true)
    if (!selectedValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${selectedValidation.error}`,
        code: selectedValidation.code
      })
    }

    validatedDatas.push({
      user_id: user_idValidation.value!,
    product_id: product_idValidation.value!,
    product_name,
    product_image,
    price,
    quantity: quantityValidation.value!,
    selected: selectedValidation.value!
    })
  }

  const batchAddCartQuery = `mutation ($datas: [CartAddInput]) { cartBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddCartQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteCartService = (ids: any) => {
  const batchDeleteCartQuery = `mutation ($ids: [Int]) { cartBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteCartQuery, {
    ids
  })
}
