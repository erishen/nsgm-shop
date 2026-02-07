module.exports = {
    query: `
        order_item(page: Int, pageSize: Int): Order_items
        order_itemGet(id: Int): Order_item
        order_itemBatchGet(ids: [Int]): [Order_item]
        order_itemSearch(page: Int, pageSize: Int, data: Order_itemSearchInput): Order_items
    `,
    mutation: `
        order_itemAdd(data: Order_itemAddInput): Int
        order_itemBatchAdd(datas: [Order_itemAddInput]): Int
        order_itemUpdate(id: Int, data: Order_itemAddInput): Boolean
        order_itemDelete(id: Int): Boolean
        order_itemBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Order_item {
            id: Int
            order_id: Int
            product_id: Int
            product_name: String
            product_image: String
            price: Float
            quantity: Int
            subtotal: Float
        }

        type Order_items {
            totalCounts: Int
            items: [Order_item]
        }

        input Order_itemAddInput {
            order_id: Int
            product_id: Int
            product_name: String
            product_image: String
            price: Float
            quantity: Int
            subtotal: Float
        }

        input Order_itemSearchInput {
            product_name: String
        }
    `
}