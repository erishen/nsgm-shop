module.exports = {
    query: `
        address(page: Int, pageSize: Int): Addresss
        addressGet(id: Int): Address
        addressBatchGet(ids: [Int]): [Address]
        addressSearch(page: Int, pageSize: Int, data: AddressSearchInput): Addresss
    `,
    mutation: `
        addressAdd(data: AddressAddInput): Int
        addressBatchAdd(datas: [AddressAddInput]): Int
        addressUpdate(id: Int, data: AddressAddInput): Boolean
        addressDelete(id: Int): Boolean
        addressBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Address {
            id: Int
            user_id: Int
            receiver_name: String
            receiver_phone: String
            province: String
            city: String
            district: String
            detail_address: String
            is_default: Int
        }

        type Addresss {
            totalCounts: Int
            items: [Address]
        }

        input AddressAddInput {
            user_id: Int
            receiver_name: String
            receiver_phone: String
            province: String
            city: String
            district: String
            detail_address: String
            is_default: Int
        }

        input AddressSearchInput {
            name: String
        }
    `
}