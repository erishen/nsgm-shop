module.exports = {
    query: `
        payment(page: Int, pageSize: Int): Payments
        paymentGet(id: Int): Payment
        paymentBatchGet(ids: [Int]): [Payment]
        paymentSearch(page: Int, pageSize: Int, data: PaymentSearchInput): Payments
    `,
    mutation: `
        paymentAdd(data: PaymentAddInput): Int
        paymentBatchAdd(datas: [PaymentAddInput]): Int
        paymentUpdate(id: Int, data: PaymentAddInput): Boolean
        paymentDelete(id: Int): Boolean
        paymentBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Payment {
            id: Int
            order_id: Int
            order_no: String
            transaction_id: String
            pay_type: String
            amount: Float
            status: String
            pay_time: String
            callback_time: String
            remark: String
        }

        type Payments {
            totalCounts: Int
            items: [Payment]
        }

        input PaymentAddInput {
            order_id: Int
            order_no: String
            transaction_id: String
            pay_type: String
            amount: Float
            status: String
            remark: String
        }

        input PaymentSearchInput {
            order_no: String
            transaction_id: String
        }
    `
}