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

// 简化的is_default验证函数
const validateIs_default = (is_default: any, required = false) => {
  if (is_default === undefined || is_default === null || is_default === '') {
    if (required) {
      return { valid: false, error: 'is_default是必填字段', code: 'REQUIRED_IS_DEFAULT_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedIs_default = parseInt(is_default, 10)
  if (isNaN(parsedIs_default)) {
    return {
      valid: false,
      error: `is_default必须是数字，收到的值: "${is_default}"`,
      code: 'INVALID_IS_DEFAULT_FORMAT'
    }
  }

  return { valid: true, value: parsedIs_default }
}



export const getAddressService = (page = 0, pageSize = 10) => {
  const getAddressQuery = `query ($page: Int, $pageSize: Int) { address(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id user_id receiver_name receiver_phone province city district detail_address is_default
        } 
      } 
    }`

  return getLocalGraphql(getAddressQuery, {
    page,
    pageSize
  })
}

export const searchAddressByIdService = (id: number) => {
  const searchAddressByIdQuery = `query ($id: Int) { addressGet(id: $id){
      id user_id receiver_name receiver_phone province city district detail_address is_default
    }
  }`

  return getLocalGraphql(searchAddressByIdQuery, {
    id
  })
}

export const searchAddressService = (page = 0, pageSize = 10, data: any) => {
  const {  } = data



  const searchAddressQuery = `query ($page: Int, $pageSize: Int, $data: AddressSearchInput) { 
    addressSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id user_id receiver_name receiver_phone province city district detail_address is_default
      } 
    }
  }`

  return getLocalGraphql(searchAddressQuery, {
    page,
    pageSize,
    data: {

    }
  })
}

export const addAddressService = (data: any) => {
  const { user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default } = data

  // 验证必填user_id
  const user_idValidation = validateUser_id(user_id, true)
  if (!user_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: user_idValidation.error,
      code: user_idValidation.code
    })
  }

  // 验证必填is_default
  const is_defaultValidation = validateIs_default(is_default, true)
  if (!is_defaultValidation.valid) {
    return Promise.reject({
      error: true,
      message: is_defaultValidation.error,
      code: is_defaultValidation.code
    })
  }



  const addAddressQuery = `mutation ($data: AddressAddInput) { addressAdd(data: $data) }`

  return getLocalGraphql(addAddressQuery, {
    data: {
      user_id: user_idValidation.value,
      receiver_name,
      receiver_phone,
      province,
      city,
      district,
      detail_address,
      is_default: is_defaultValidation.value
    }
  })
}

export const updateAddressService = (id: number, data: any) => {
  const { user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default } = data

  // 验证必填user_id
  const user_idValidation = validateUser_id(user_id, true)
  if (!user_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: user_idValidation.error,
      code: user_idValidation.code
    })
  }

  // 验证必填is_default
  const is_defaultValidation = validateIs_default(is_default, true)
  if (!is_defaultValidation.valid) {
    return Promise.reject({
      error: true,
      message: is_defaultValidation.error,
      code: is_defaultValidation.code
    })
  }



  const updateAddressQuery = `mutation ($id: Int, $data: AddressAddInput) { addressUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateAddressQuery, {
    id,
    data: {
      user_id: user_idValidation.value,
      receiver_name,
      receiver_phone,
      province,
      city,
      district,
      detail_address,
      is_default: is_defaultValidation.value
    }
  })
}

export const deleteAddressService = (id: number) => {
  const deleteAddressQuery = `mutation ($id: Int) { addressDelete(id: $id) }`

  return getLocalGraphql(deleteAddressQuery, {
    id
  })
}

export const batchAddAddressService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ user_id: number; receiver_name: any; receiver_phone: any; province: any; city: any; district: any; detail_address: any; is_default: number }> = []

  for (let i = 0; i < datas.length; i++) {
    const { user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default } = datas[i]

    const user_idValidation = validateUser_id(user_id, true)
    if (!user_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${user_idValidation.error}`,
        code: user_idValidation.code
      })
    }

    const is_defaultValidation = validateIs_default(is_default, true)
    if (!is_defaultValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${is_defaultValidation.error}`,
        code: is_defaultValidation.code
      })
    }

    validatedDatas.push({
      user_id: user_idValidation.value!,
    receiver_name,
    receiver_phone,
    province,
    city,
    district,
    detail_address,
    is_default: is_defaultValidation.value!
    })
  }

  const batchAddAddressQuery = `mutation ($datas: [AddressAddInput]) { addressBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddAddressQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteAddressService = (ids: any) => {
  const batchDeleteAddressQuery = `mutation ($ids: [Int]) { addressBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteAddressQuery, {
    ids
  })
}
