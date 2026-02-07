module.exports = {
    query: `
        cart(page: Int, pageSize: Int): Carts
        cartGet(id: Int): Cart
        cartBatchGet(ids: [Int]): [Cart]
        cartSearch(page: Int, pageSize: Int, data: CartSearchInput): Carts
    `,
    mutation: `
        cartAdd(data: CartAddInput): Int
        cartBatchAdd(datas: [CartAddInput]): Int
        cartUpdate(id: Int, data: CartAddInput): Boolean
        cartDelete(id: Int): Boolean
        cartBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Cart {
            id: Int
            user_id: Int
            product_id: Int
            product_name: String
            product_image: String
            price: Float
            quantity: Int
            selected: Int
        }

        type Carts {
            totalCounts: Int
            items: [Cart]
        }

        input CartAddInput {
            user_id: Int
            product_id: Int
            product_name: String
            product_image: String
            price: Float
            quantity: Int
            selected: Int
        }

        input CartSearchInput {
            name: String
        }
    `
}