import { getLocalGraphql } from '@/utils/fetch'
import _ from 'lodash'



export const getUserService = (page = 0, pageSize = 10) => {
  const getUserQuery = `query ($page: Int, $pageSize: Int) { user(page: $page, pageSize: $pageSize) { 
        totalCounts items { 
          id username password nickname real_name avatar phone email status
        } 
      } 
    }`

  return getLocalGraphql(getUserQuery, {
    page,
    pageSize
  })
}

export const searchUserByIdService = (id: number) => {
  const searchUserByIdQuery = `query ($id: Int) { userGet(id: $id){
      id username password nickname real_name avatar phone email status
    }
  }`

  return getLocalGraphql(searchUserByIdQuery, {
    id
  })
}

export const searchUserService = (page = 0, pageSize = 10, data: any) => {
  const { username, nickname, phone } = data



  const searchUserQuery = `query ($page: Int, $pageSize: Int, $data: UserSearchInput) { 
    userSearch(page: $page, pageSize: $pageSize, data: $data) {
      totalCounts items { 
        id username password nickname real_name avatar phone email status
      } 
    }
  }`

  return getLocalGraphql(searchUserQuery, {
    page,
    pageSize,
    data: {
      username,
      nickname,
      phone
    }
  })
}

export const addUserService = (data: any) => {
  const { username, password, nickname, real_name, avatar, phone, email, status } = data



  const addUserQuery = `mutation ($data: UserAddInput) { userAdd(data: $data) }`

  return getLocalGraphql(addUserQuery, {
    data: {
      username,
      password,
      nickname,
      real_name,
      avatar,
      phone,
      email,
      status
    }
  })
}

export const updateUserService = (id: number, data: any) => {
  const { username, password, nickname, real_name, avatar, phone, email, status } = data



  const updateUserQuery = `mutation ($id: Int, $data: UserAddInput) { userUpdate(id: $id, data: $data) }`

  return getLocalGraphql(updateUserQuery, {
    id,
    data: {
      username,
      password,
      nickname,
      real_name,
      avatar,
      phone,
      email,
      status
    }
  })
}

export const deleteUserService = (id: number) => {
  const deleteUserQuery = `mutation ($id: Int) { userDelete(id: $id) }`

  return getLocalGraphql(deleteUserQuery, {
    id
  })
}

export const batchAddUserService = (datas: any) => {
  // 验证批量数据
  const validatedDatas: Array<{ username: any; password: any; nickname: any; real_name: any; avatar: any; phone: any; email: any; status: any }> = []

  for (let i = 0; i < datas.length; i++) {
    const { username, password, nickname, real_name, avatar, phone, email, status } = datas[i]

    validatedDatas.push({
      username,
    password,
    nickname,
    real_name,
    avatar,
    phone,
    email,
    status
    })
  }

  const batchAddUserQuery = `mutation ($datas: [UserAddInput]) { userBatchAdd(datas: $datas) }`

  return getLocalGraphql(batchAddUserQuery, {
    datas: validatedDatas
  })
}

export const batchDeleteUserService = (ids: any) => {
  const batchDeleteUserQuery = `mutation ($ids: [Int]) { userBatchDelete(ids: $ids) }`

  return getLocalGraphql(batchDeleteUserQuery, {
    ids
  })
}
