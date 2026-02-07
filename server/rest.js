const express = require('express')
const dayjs = require('dayjs')
const sso = require('./apis/sso')
//const template = require('./apis/template')
const payment = require('./apis/payment')
const cart = require('./apis/cart')
const banner = require('./apis/banner')
const order_item = require('./apis/order_item')
const order = require('./apis/order')
const address = require('./apis/address')
const user = require('./apis/user')
const product = require('./apis/product')
const category = require('./apis/category')
const router = express.Router()

router.use((req, res, next) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
    console.log(dayjs().format('YYYY-MM-DD HH:mm:ss') + ' ' + fullUrl)
    next()
})

router.use('/sso', sso)

//router.use('/template', template)
router.use('/payment', payment)
router.use('/cart', cart)
router.use('/banner', banner)
router.use('/order_item', order_item)
router.use('/order', order)
router.use('/address', address)
router.use('/user', user)
router.use('/product', product)
router.use('/category', category)
router.get('/*', (req, res) => {
    res.statusCode = 200
    res.json({ name: 'REST' })
})

module.exports = router
