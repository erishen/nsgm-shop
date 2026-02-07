import { getLocalGraphql } from '@/utils/fetch'
import _ from 'lodash'

// 简化的parent_id验证函数
const validateParent_id = (parent_id: any, required = false) => {
  if (parent_id === undefined || parent_id === null || parent_id === '') {
    if (required) {
      return { valid: false, error: 'parent_id是必填字段', code: 'REQUIRED_PARENT_ID_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedParent_id = parseInt(parent_id, 10)
  if (isNaN(parsedParent_id)) {
    return {
      valid: false,
      error: `parent_id必须是数字，收到的值: "${parent_id}"`,
      code: 'INVALID_PARENT_ID_FORMAT'
    }
  }

  return { valid: true, value: parsedParent_id }
}

// 简化的sort_order验证函数
const validateSort_order = (sort_order: any, required = false) => {
  if (sort_order === undefined || sort_order === null || sort_order === '') {
    if (required) {
      return { valid: false, error: 'sort_order是必填字段', code: 'REQUIRED_SORT_ORDER_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedSort_order = parseInt(sort_order, 10)
  if (isNaN(parsedSort_order)) {
    return {
      valid: false,
      error: `sort_order必须是数字，收到的值: "${sort_order}"`,
      code: 'INVALID_SORT_ORDER_FORMAT'
    }
  }

  return { valid: true, value: parsedSort_order }
}



export const getCategoryService = (page = 0, pageSize = 10) => {
  const getCategoryQuery = `query ($page: Int, $pageSize: Int) { category(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id name icon parent_id sort_order status
        } 
      } 
    }`

  return getLocalGraphql(getCategoryQuery, {
    page,
    pageSize
  })
}

export const searchCategoryByIdService = (id: number) => {
  const searchCategoryByIdQuery = `query ($id: Int) { categoryGet(id: $id){
      id name icon parent_id sort_order status
    }
  }`

  return getLocalGraphql(searchCategoryByIdQuery, {
    id
  })
}

export const searchCategoryService = (page = 0, pageSize = 10, data: any) => {
  const { name } = data



  const searchCategoryQuery = `query ($page: Int, $pageSize: Int, $data: CategorySearchInput) { 
    categorySearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id name icon parent_id sort_order status
      } 
    }
  }`

  return getLocalGraphql(searchCategoryQuery, {
    page,
    pageSize,
    data: {
      name
    }
  })
}

export const addCategoryService = (data: any) => {
  const { name, icon, parent_id, sort_order, status } = data

  // 验证必填parent_id
  const parent_idValidation = validateParent_id(parent_id, true)
  if (!parent_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: parent_idValidation.error,
      code: parent_idValidation.code
    })
  }

  // 验证必填sort_order
  const sort_orderValidation = validateSort_order(sort_order, true)
  if (!sort_orderValidation.valid) {
    return Promise.reject({
      error: true,
      message: sort_orderValidation.error,
      code: sort_orderValidation.code
    })
  }



  const addCategoryQuery = `mutation ($data: CategoryAddInput) { categoryAdd(data: $data) }`

  return getLocalGraphql(addCategoryQuery, {
    data: {
      name,
      icon,
      parent_id: parent_idValidation.value,
      sort_order: sort_orderValidation.value,
      status
    }
  })
}

export const updateCategoryService = (id: number, data: any) => {
  const { name, icon, parent_id, sort_order, status } = data

  // 验证必填parent_id
  const parent_idValidation = validateParent_id(parent_id, true)
  if (!parent_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: parent_idValidation.error,
      code: parent_idValidation.code
    })
  }

  // 验证必填sort_order
  const sort_orderValidation = validateSort_order(sort_order, true)
  if (!sort_orderValidation.valid) {
    return Promise.reject({
      error: true,
      message: sort_orderValidation.error,
      code: sort_orderValidation.code
    })
  }



  const updateCategoryQuery = `mutation ($id: Int, $data: CategoryAddInput) { categoryUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateCategoryQuery, {
    id,
    data: {
      name,
      icon,
      parent_id: parent_idValidation.value,
      sort_order: sort_orderValidation.value,
      status
    }
  })
}

export const deleteCategoryService = (id: number) => {
  const deleteCategoryQuery = `mutation ($id: Int) { categoryDelete(id: $id) }`

  return getLocalGraphql(deleteCategoryQuery, {
    id
  })
}

export const batchAddCategoryService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ name: any; icon: any; parent_id: number; sort_order: number; status: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { name, icon, parent_id, sort_order, status } = datas[i]

    const parent_idValidation = validateParent_id(parent_id, true)
    if (!parent_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${parent_idValidation.error}`,
        code: parent_idValidation.code
      })
    }

    const sort_orderValidation = validateSort_order(sort_order, true)
    if (!sort_orderValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${sort_orderValidation.error}`,
        code: sort_orderValidation.code
      })
    }

    validatedDatas.push({
      name,
    icon,
    parent_id: parent_idValidation.value!,
    sort_order: sort_orderValidation.value!,
    status
    })
  }

  const batchAddCategoryQuery = `mutation ($datas: [CategoryAddInput]) { categoryBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddCategoryQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteCategoryService = (ids: any) => {
  const batchDeleteCategoryQuery = `mutation ($ids: [Int]) { categoryBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteCategoryQuery, {
    ids
  })
}
