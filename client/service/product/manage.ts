import { getLocalGraphql } from '@/utils/fetch'
import _ from 'lodash'

// 简化的category_id验证函数
const validateCategory_id = (category_id: any, required = false) => {
  if (category_id === undefined || category_id === null || category_id === '') {
    if (required) {
      return { valid: false, error: 'category_id是必填字段', code: 'REQUIRED_CATEGORY_ID_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedCategory_id = parseInt(category_id, 10)
  if (isNaN(parsedCategory_id)) {
    return {
      valid: false,
      error: `category_id必须是数字，收到的值: "${category_id}"`,
      code: 'INVALID_CATEGORY_ID_FORMAT'
    }
  }

  return { valid: true, value: parsedCategory_id }
}

// 简化的stock验证函数
const validateStock = (stock: any, required = false) => {
  if (stock === undefined || stock === null || stock === '') {
    if (required) {
      return { valid: false, error: 'stock是必填字段', code: 'REQUIRED_STOCK_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedStock = parseInt(stock, 10)
  if (isNaN(parsedStock)) {
    return {
      valid: false,
      error: `stock必须是数字，收到的值: "${stock}"`,
      code: 'INVALID_STOCK_FORMAT'
    }
  }

  return { valid: true, value: parsedStock }
}

// 简化的sales验证函数
const validateSales = (sales: any, required = false) => {
  if (sales === undefined || sales === null || sales === '') {
    if (required) {
      return { valid: false, error: 'sales是必填字段', code: 'REQUIRED_SALES_MISSING' }
    }
    return { valid: true, value: undefined }
  }

  const parsedSales = parseInt(sales, 10)
  if (isNaN(parsedSales)) {
    return {
      valid: false,
      error: `sales必须是数字，收到的值: "${sales}"`,
      code: 'INVALID_SALES_FORMAT'
    }
  }

  return { valid: true, value: parsedSales }
}



export const getProductService = (page = 0, pageSize = 10) => {
  const getProductQuery = `query ($page: Int, $pageSize: Int) { product(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id name description price original_price category_id stock image_url images sales status
        } 
      } 
    }`

  return getLocalGraphql(getProductQuery, {
    page,
    pageSize
  })
}

export const searchProductByIdService = (id: number) => {
  const searchProductByIdQuery = `query ($id: Int) { productGet(id: $id){
      id name description price original_price category_id stock image_url images sales status
    }
  }`

  return getLocalGraphql(searchProductByIdQuery, {
    id
  })
}

export const searchProductService = (page = 0, pageSize = 10, data: any) => {
  const { name } = data



  const searchProductQuery = `query ($page: Int, $pageSize: Int, $data: ProductSearchInput) { 
    productSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id name description price original_price category_id stock image_url images sales status
      } 
    }
  }`

  return getLocalGraphql(searchProductQuery, {
    page,
    pageSize,
    data: {
      name
    }
  })
}

export const addProductService = (data: any) => {
  const { name, description, price, original_price, category_id, stock, image_url, images, sales, status } = data

  // 验证必填category_id
  const category_idValidation = validateCategory_id(category_id, true)
  if (!category_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: category_idValidation.error,
      code: category_idValidation.code
    })
  }

  // 验证必填stock
  const stockValidation = validateStock(stock, true)
  if (!stockValidation.valid) {
    return Promise.reject({
      error: true,
      message: stockValidation.error,
      code: stockValidation.code
    })
  }

  // 验证必填sales
  const salesValidation = validateSales(sales, true)
  if (!salesValidation.valid) {
    return Promise.reject({
      error: true,
      message: salesValidation.error,
      code: salesValidation.code
    })
  }



  const addProductQuery = `mutation ($data: ProductAddInput) { productAdd(data: $data) }`

  return getLocalGraphql(addProductQuery, {
    data: {
      name,
      description,
      price,
      original_price,
      category_id: category_idValidation.value,
      stock: stockValidation.value,
      image_url,
      images,
      sales: salesValidation.value,
      status
    }
  })
}

export const updateProductService = (id: number, data: any) => {
  const { name, description, price, original_price, category_id, stock, image_url, images, sales, status } = data

  // 验证必填category_id
  const category_idValidation = validateCategory_id(category_id, true)
  if (!category_idValidation.valid) {
    return Promise.reject({
      error: true,
      message: category_idValidation.error,
      code: category_idValidation.code
    })
  }

  // 验证必填stock
  const stockValidation = validateStock(stock, true)
  if (!stockValidation.valid) {
    return Promise.reject({
      error: true,
      message: stockValidation.error,
      code: stockValidation.code
    })
  }

  // 验证必填sales
  const salesValidation = validateSales(sales, true)
  if (!salesValidation.valid) {
    return Promise.reject({
      error: true,
      message: salesValidation.error,
      code: salesValidation.code
    })
  }



  const updateProductQuery = `mutation ($id: Int, $data: ProductAddInput) { productUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateProductQuery, {
    id,
    data: {
      name,
      description,
      price,
      original_price,
      category_id: category_idValidation.value,
      stock: stockValidation.value,
      image_url,
      images,
      sales: salesValidation.value,
      status
    }
  })
}

export const deleteProductService = (id: number) => {
  const deleteProductQuery = `mutation ($id: Int) { productDelete(id: $id) }`

  return getLocalGraphql(deleteProductQuery, {
    id
  })
}

export const batchAddProductService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ name: any; description: any; price: any; original_price: any; category_id: number; stock: number; image_url: any; images: any; sales: number; status: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { name, description, price, original_price, category_id, stock, image_url, images, sales, status } = datas[i]

    const category_idValidation = validateCategory_id(category_id, true)
    if (!category_idValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${category_idValidation.error}`,
        code: category_idValidation.code
      })
    }

    const stockValidation = validateStock(stock, true)
    if (!stockValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${stockValidation.error}`,
        code: stockValidation.code
      })
    }

    const salesValidation = validateSales(sales, true)
    if (!salesValidation.valid) {
      return Promise.reject({
        error: true,
        message: `第 ${i + 1} 条数据: ${salesValidation.error}`,
        code: salesValidation.code
      })
    }

    validatedDatas.push({
      name,
    description,
    price,
    original_price,
    category_id: category_idValidation.value!,
    stock: stockValidation.value!,
    image_url,
    images,
    sales: salesValidation.value!,
    status
    })
  }

  const batchAddProductQuery = `mutation ($datas: [ProductAddInput]) { productBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddProductQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteProductService = (ids: any) => {
  const batchDeleteProductQuery = `mutation ($ids: [Int]) { productBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteProductQuery, {
    ids
  })
}
