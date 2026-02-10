module.exports = {
    query: `
        product(page: Int, pageSize: Int): Products
        productGet(id: Int): Product
        productBatchGet(ids: [Int]): [Product]
        productSearch(page: Int, pageSize: Int, data: ProductSearchInput): Products
    `,
    mutation: `
        productAdd(data: ProductAddInput): Int
        productBatchAdd(datas: [ProductAddInput]): Int
        productUpdate(id: Int, data: ProductAddInput): Boolean
        productDelete(id: Int): Boolean
        productBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Product {
            id: Int
            name: String
            description: String
            price: Float
            original_price: Float
            category_id: Int
            stock: Int
            image_url: String
            images: String
            sales: Int
            status: String
        }

        type Products {
            totalCounts: Int
            items: [Product]
        }

        input ProductAddInput {
            name: String
            description: String
            price: Float
            original_price: Float
            category_id: Int
            stock: Int
            image_url: String
            images: String
            sales: Int
            status: String
        }

        input ProductSearchInput {
            name: String
            category_id: Int
        }
    `
}