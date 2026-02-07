module.exports = {
    query: `
        order(page: Int, pageSize: Int): Orders
        orderGet(id: Int): Order
        orderBatchGet(ids: [Int]): [Order]
        orderSearch(page: Int, pageSize: Int, data: OrderSearchInput): Orders
    `,
    mutation: `
        orderAdd(data: OrderAddInput): Int
        orderBatchAdd(datas: [OrderAddInput]): Int
        orderUpdate(id: Int, data: OrderAddInput): Boolean
        orderDelete(id: Int): Boolean
        orderBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Order {
            id: Int
            order_no: String
            user_id: Int
            total_amount: Float
            pay_amount: Float
            status: String
            pay_status: String
            pay_type: String
            pay_time: String
            ship_time: String
            express_company: String
            express_no: String
            receiver_name: String
            receiver_phone: String
            receiver_address: String
            remark: String
        }

        type Orders {
            totalCounts: Int
            items: [Order]
        }

        input OrderAddInput {
            order_no: String
            user_id: Int
            total_amount: Float
            pay_amount: Float
            status: String
            pay_status: String
            pay_type: String
            express_company: String
            express_no: String
            receiver_name: String
            receiver_phone: String
            receiver_address: String
            remark: String
        }

        input OrderSearchInput {
            order_no: String
        }
    `
}