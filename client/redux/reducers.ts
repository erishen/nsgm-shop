//import { templateManageReducer } from './template/manage/reducers'
import { categoryManageReducer } from './category/manage/reducers'
import { productManageReducer } from './product/manage/reducers'
import { userManageReducer } from './user/manage/reducers'
import { addressManageReducer } from './address/manage/reducers'
import { orderManageReducer } from './order/manage/reducers'
import { order_itemManageReducer } from './order_item/manage/reducers'
import { bannerManageReducer } from './banner/manage/reducers'
import { cartManageReducer } from './cart/manage/reducers'
import { paymentManageReducer } from './payment/manage/reducers'

export default {
  //templateManage: templateManageReducer,
  paymentManage: paymentManageReducer,
  cartManage: cartManageReducer,
  bannerManage: bannerManageReducer,
  order_itemManage: order_itemManageReducer,
  orderManage: orderManageReducer,
  addressManage: addressManageReducer,
  userManage: userManageReducer,
  productManage: productManageReducer,
  categoryManage: categoryManageReducer,
}
