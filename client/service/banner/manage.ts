import { getLocalGraphql } from '@/utils/fetch'
import _ from 'lodash'

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



export const getBannerService = (page = 0, pageSize = 10) => {
  const getBannerQuery = `query ($page: Int, $pageSize: Int) { banner(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id title image_url link_url sort_order status
        } 
      } 
    }`

  return getLocalGraphql(getBannerQuery, {
    page,
    pageSize
  })
}

export const searchBannerByIdService = (id: number) => {
  const searchBannerByIdQuery = `query ($id: Int) { bannerGet(id: $id){
      id title image_url link_url sort_order status
    }
  }`

  return getLocalGraphql(searchBannerByIdQuery, {
    id
  })
}

export const searchBannerService = (page = 0, pageSize = 10, data: any) => {
  const { title } = data



  const searchBannerQuery = `query ($page: Int, $pageSize: Int, $data: BannerSearchInput) { 
    bannerSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id title image_url link_url sort_order status
      } 
    }
  }`

  return getLocalGraphql(searchBannerQuery, {
    page,
    pageSize,
    data: {
      title
    }
  })
}

export const addBannerService = (data: any) => {
  const { title, image_url, link_url, sort_order, status } = data

  // 验证必填sort_order
  const sort_orderValidation = validateSort_order(sort_order, true)
  if (!sort_orderValidation.valid) {
    return Promise.reject({
      error: true,
      message: sort_orderValidation.error,
      code: sort_orderValidation.code
    })
  }



  const addBannerQuery = `mutation ($data: BannerAddInput) { bannerAdd(data: $data) }`

  return getLocalGraphql(addBannerQuery, {
    data: {
      title,
      image_url,
      link_url,
      sort_order: sort_orderValidation.value,
      status
    }
  })
}

export const updateBannerService = (id: number, data: any) => {
  const { title, image_url, link_url, sort_order, status } = data

  // 验证必填sort_order
  const sort_orderValidation = validateSort_order(sort_order, true)
  if (!sort_orderValidation.valid) {
    return Promise.reject({
      error: true,
      message: sort_orderValidation.error,
      code: sort_orderValidation.code
    })
  }



  const updateBannerQuery = `mutation ($id: Int, $data: BannerAddInput) { bannerUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateBannerQuery, {
    id,
    data: {
      title,
      image_url,
      link_url,
      sort_order: sort_orderValidation.value,
      status
    }
  })
}

export const deleteBannerService = (id: number) => {
  const deleteBannerQuery = `mutation ($id: Int) { bannerDelete(id: $id) }`

  return getLocalGraphql(deleteBannerQuery, {
    id
  })
}

export const batchAddBannerService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ title: any; image_url: any; link_url: any; sort_order: number; status: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { title, image_url, link_url, sort_order, status } = datas[i]

    const sort_orderValidation = validateSort_order(sort_order, true)
    if (!sort_orderValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${sort_orderValidation.error}`,
        code: sort_orderValidation.code
      })
    }

    validatedDatas.push({
      title,
    image_url,
    link_url,
    sort_order: sort_orderValidation.value!,
    status
    })
  }

  const batchAddBannerQuery = `mutation ($datas: [BannerAddInput]) { bannerBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddBannerQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteBannerService = (ids: any) => {
  const batchDeleteBannerQuery = `mutation ($ids: [Int]) { bannerBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteBannerQuery, {
    ids
  })
}
