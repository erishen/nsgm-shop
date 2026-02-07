module.exports = {
    query: `
        category(page: Int, pageSize: Int): Categorys
        categoryGet(id: Int): Category
        categoryBatchGet(ids: [Int]): [Category]
        categorySearch(page: Int, pageSize: Int, data: CategorySearchInput): Categorys
    `,
    mutation: `
        categoryAdd(data: CategoryAddInput): Int
        categoryBatchAdd(datas: [CategoryAddInput]): Int
        categoryUpdate(id: Int, data: CategoryAddInput): Boolean
        categoryDelete(id: Int): Boolean
        categoryBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Category {
            id: Int
            name: String
            icon: String
            parent_id: Int
            sort_order: Int
            status: String
        }

        type Categorys {
            totalCounts: Int
            items: [Category]
        }

        input CategoryAddInput {
            name: String
            icon: String
            parent_id: Int
            sort_order: Int
            status: String
        }

        input CategorySearchInput {
            name: String
        }
    `
}