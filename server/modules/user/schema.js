module.exports = {
    query: `
        user(page: Int, pageSize: Int): Users
        userGet(id: Int): User
        userBatchGet(ids: [Int]): [User]
        userSearch(page: Int, pageSize: Int, data: UserSearchInput): Users
    `,
    mutation: `
        login(username: String, password: String): String
        userAdd(data: UserAddInput): Int
        userBatchAdd(datas: [UserAddInput]): Int
        userUpdate(id: Int, data: UserAddInput): Boolean
        userDelete(id: Int): Boolean
        userBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type User {
            id: Int
            username: String
            password: String
            nickname: String
            real_name: String
            avatar: String
            phone: String
            email: String
            status: String
        }

        type Users {
            totalCounts: Int
            items: [User]
        }

        input UserAddInput {
            username: String
            password: String
            nickname: String
            real_name: String
            avatar: String
            phone: String
            email: String
            status: String
        }

        input UserSearchInput {
            username: String
            nickname: String
            phone: String
        }
    `
}