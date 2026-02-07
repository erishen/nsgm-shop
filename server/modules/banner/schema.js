module.exports = {
    query: `
        banner(page: Int, pageSize: Int): Banners
        bannerGet(id: Int): Banner
        bannerBatchGet(ids: [Int]): [Banner]
        bannerSearch(page: Int, pageSize: Int, data: BannerSearchInput): Banners
    `,
    mutation: `
        bannerAdd(data: BannerAddInput): Int
        bannerBatchAdd(datas: [BannerAddInput]): Int
        bannerUpdate(id: Int, data: BannerAddInput): Boolean
        bannerDelete(id: Int): Boolean
        bannerBatchDelete(ids: [Int]): Boolean
    `,
    subscription: ``,
    type: `
        type Banner {
            id: Int
            title: String
            image_url: String
            link_url: String
            sort_order: Int
            status: String
        }

        type Banners {
            totalCounts: Int
            items: [Banner]
        }

        input BannerAddInput {
            title: String
            image_url: String
            link_url: String
            sort_order: Int
            status: String
        }

        input BannerSearchInput {
            title: String
        }
    `
}