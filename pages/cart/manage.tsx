import React, { useState, useEffect } from 'react'
import { ConfigProvider, Modal, Space, Upload, message } from 'antd'
import {
  Container,
  SearchRow,
  ModalContainer,
  StyledButton,
  StyledInput,
  StyledTable,
  ModalTitle,
  ModalInput,
  IconWrapper,
  RoundedButton,
  GlobalStyle,
} from '@/styled/cart/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addCart,
  modCart,
  delCart,
  updateSSRCart,
  searchCart,
  batchDelCart,
} from '@/redux/cart/manage/actions'
import { getCartService } from '@/service/cart/manage'
import { RootState, AppDispatch } from '@/redux/store'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import { getAntdLocale } from '@/utils/i18n'
import { useRouter } from 'next/router'
import { handleXSS, checkModalObj } from '@/utils/common'
import { UploadOutlined } from '@ant-design/icons'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { createCSRFUploadProps } from '@/utils/fetch'

const pageSize = 100

const Page = ({ cart }) => {
  const { t } = useTranslation(['common', 'cart'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalUser_id, setModalUser_id] = useState('')
  const [modalProduct_id, setModalProduct_id] = useState('')
  const [modalProduct_name, setModalProduct_name] = useState('')
  const [modalProduct_image, setModalProduct_image] = useState('')
  const [modalPrice, setModalPrice] = useState('')
  const [modalQuantity, setModalQuantity] = useState('')
  const [modalSelected, setModalSelected] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    user_id: t('cart:cart.fields.user_id'),
    product_id: t('cart:cart.fields.product_id'),
    product_name: t('cart:cart.fields.product_name'),
    product_image: t('cart:cart.fields.product_image'),
    price: t('cart:cart.fields.price'),
    quantity: t('cart:cart.fields.quantity'),
    selected: t('cart:cart.fields.selected')
  }

  useEffect(() => {
    dispatch(updateSSRCart(cart))
  }, [dispatch])

  useEffect(() => {
    // 管理弹窗打开时的滚动条显示
    if (isModalVisiable) {
      // 记录原始样式
      const originalStyle = window.getComputedStyle(document.body).overflow
      const originalPaddingRight = window.getComputedStyle(document.body).paddingRight

      // 设置定时器，在 Modal 设置样式后覆盖
      const timer = setTimeout(() => {
        document.body.style.overflow = 'auto'
        document.body.style.paddingRight = '0px'
      }, 0)

      return () => {
        clearTimeout(timer)
        // 清理时恢复原始样式
        document.body.style.overflow = originalStyle
        document.body.style.paddingRight = originalPaddingRight
      }
    }

    // 当弹窗关闭时，不需要清理函数
    return undefined
  }, [isModalVisiable])

  const cartManage = useSelector((state: RootState) => state.cartManage)

  if (!cartManage.firstLoadFlag) {
    cart = cartManage.cart
  }

  const safeCart = cart || { totalCounts: 0, items: [] }
  const { totalCounts, items: cartItems } = _.cloneDeep(safeCart)

  _.each(cartItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = cartItems
  const columns: any = [
    {
      title: t('cart:cart.fields.user_id'),
      dataIndex: 'user_id',
      key: 'user_id',
      sorter: (a: any, b: any) => a.user_id - b.user_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('cart:cart.fields.product_id'),
      dataIndex: 'product_id',
      key: 'product_id',
      sorter: (a: any, b: any) => a.product_id - b.product_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('cart:cart.fields.product_name'),
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a: any, b: any) => a.product_name.length - b.product_name.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('cart:cart.fields.product_image'),
      dataIndex: 'product_image',
      key: 'product_image',
      sorter: (a: any, b: any) => a.product_image.length - b.product_image.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('cart:cart.fields.price'),
      dataIndex: 'price',
      key: 'price',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('cart:cart.fields.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: any, b: any) => a.quantity - b.quantity,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('cart:cart.fields.selected'),
      dataIndex: 'selected',
      key: 'selected',
      sorter: (a: any, b: any) => a.selected - b.selected,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('cart:cart.fields.actions'),
      dataIndex: '',
      width: 140,
      align: 'center' as const,
      fixed: 'right',
      render: (_: any, record: any) => {
        return (
          <Space size="small">
            <RoundedButton
              type="primary"
              size="small"
              onClick={() => {
                updateCart(record)
              }}
            >
              {t('cart:cart.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteCart(id)
              }}
            >
              {t('cart:cart.buttons.delete')}
            </RoundedButton>
          </Space>
        )
      }
    }
  ]

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setBatchDelIds(selectedRowKeys)
    }
  }

  const createCart = () => {
    setModalId(0)
    setModalUser_id('')
    setModalProduct_id('')
    setModalProduct_name('')
    setModalProduct_image('')
    setModalPrice('')
    setModalQuantity('')
    setModalSelected('')
    showModal()
  }

  const updateCart = (record: any) => {
    const { id, user_id, product_id, product_name, product_image, price, quantity, selected } = record

    setModalId(id)
    setModalUser_id(user_id)
    setModalProduct_id(product_id)
    setModalProduct_name(product_name)
    setModalProduct_image(product_image)
    setModalPrice(price)
    setModalQuantity(quantity)
    setModalSelected(selected)
    showModal()
  }

  const deleteCart = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('cart:cart.messages.confirmDelete'),
      okText: t('cart:cart.buttons.confirm'),
      cancelText: t('cart:cart.buttons.cancel'),
      onOk: () => {
        dispatch(delCart(id))
        Modal.destroyAll()
      }
    })
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const getMessageTitle = (key: string) => {
    let result = keyTitles[key]
    if (result == undefined) result = key
    return result
  }

  const handleOk = () => {
  const modalObj: any = {
      user_id: handleXSS(modalUser_id),
      product_id: handleXSS(modalProduct_id),
      product_name: handleXSS(modalProduct_name),
      product_image: handleXSS(modalProduct_image),
      price: handleXSS(modalPrice),
      quantity: handleXSS(modalQuantity),
      selected: handleXSS(modalSelected)
    }

    // 验证user_id
    const user_idValue = modalObj.user_id
    if (user_idValue !== undefined && user_idValue !== null && user_idValue !== '') {
      const parsedUser_id = parseInt(user_idValue, 10)
      if (isNaN(parsedUser_id)) {
        message.error(`user_id必须是数字，当前值: "${user_idValue}"`)
        return
      }
      modalObj.user_id = parsedUser_id
    }

    // 验证product_id
    const product_idValue = modalObj.product_id
    if (product_idValue !== undefined && product_idValue !== null && product_idValue !== '') {
      const parsedProduct_id = parseInt(product_idValue, 10)
      if (isNaN(parsedProduct_id)) {
        message.error(`product_id必须是数字，当前值: "${product_idValue}"`)
        return
      }
      modalObj.product_id = parsedProduct_id
    }

    // 验证quantity
    const quantityValue = modalObj.quantity
    if (quantityValue !== undefined && quantityValue !== null && quantityValue !== '') {
      const parsedQuantity = parseInt(quantityValue, 10)
      if (isNaN(parsedQuantity)) {
        message.error(`quantity必须是数字，当前值: "${quantityValue}"`)
        return
      }
      modalObj.quantity = parsedQuantity
    }

    // 验证selected
    const selectedValue = modalObj.selected
    if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
      const parsedSelected = parseInt(selectedValue, 10)
      if (isNaN(parsedSelected)) {
        message.error(`selected必须是数字，当前值: "${selectedValue}"`)
        return
      }
      modalObj.selected = parsedSelected
    }

    // 验证price
    const priceValue = modalObj.price
    if (priceValue !== undefined && priceValue !== null && priceValue !== '') {
      const parsedPrice = parseFloat(priceValue)
      if (isNaN(parsedPrice)) {
        message.error(`price必须是数字，当前值: "${priceValue}"`)
        return
      }
      modalObj.price = parsedPrice
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addCart(modalObj))
      } else {
        dispatch(modCart(modalId, modalObj))
      }

      setIsModalVisible(false)
    } else {
      message.info(getMessageTitle(checkResult.key) + checkResult.reason)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const doSearch = () => {
    const searchData = {}
    dispatch(searchCart(0, pageSize, searchData))
  }

  const exportCart = () => {
    if (cartItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Cart')
      const jsonData = _.map(cartItems, (item) => _.omit(item, ['key']))

      // 提取表头
      const headers = Object.keys(jsonData[0])

      // 将 JSON 数据转换为二维数组
      const data = [headers, ...jsonData.map((item) => headers.map((header) => item[header]))]

      // 将数据写入工作表
      ws.addRows(data)

      // 设置表头样式加粗
      ws.getRow(1).eachCell((cell) => {
        cell.font = { bold: true }
      })

      // 设置列宽
      ws.columns = [
        { header: '用户ID', key: 'header1', width: 15 },
        { header: '商品ID', key: 'header2', width: 15 },
        { header: '商品名称', key: 'header3', width: 30 },
        { header: '商品图片', key: 'header4', width: 30 },
        { header: '单价', key: 'header5', width: 30 },
        { header: '数量', key: 'header6', width: 15 },
        { header: '是否选中', key: 'header7', width: 15 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Cart.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('cart:cart.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/cart/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('cart:cart.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('cart:cart.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('cart:cart.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('cart:cart.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteCart = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('cart:cart.messages.confirmBatchDelete'),
        okText: t('cart:cart.buttons.confirm'),
        cancelText: t('cart:cart.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelCart(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('cart:cart.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('cart:cart.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createCart} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('cart:cart.buttons.add')}
              </StyledButton>
              
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('cart:cart.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportCart} icon={<UploadOutlined rotate={180} />} $export>
                {t('cart:cart.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('cart:cart.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteCart} $danger>
                {t('cart:cart.buttons.batchDelete')}
              </StyledButton>
            </Space>
          </Space>
        </SearchRow>
        <StyledTable
          rowSelection={{
            type: 'checkbox',
            ...rowSelection
          }}
          dataSource={dataSource}
          columns={columns}
          bordered
          rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
          pagination={{
            total: totalCounts,
            pageSize: pageSize,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => t('cart:cart.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = {}
              dispatch(searchCart(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('cart:cart.modal.addTitle') : t('cart:cart.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('cart:cart.buttons.confirm')}
          cancelText={t('cart:cart.buttons.cancel')}
          centered
          maskClosable={false}
          destroyOnHidden
          okButtonProps={{ className: 'rounded-button' }}
          cancelButtonProps={{ className: 'rounded-button' }}
        >
          <ModalContainer>
            <div className="line">
              <label>{keyTitles.user_id}：</label>
              <ModalInput
                value={modalUser_id}
                placeholder={t('cart:cart.placeholders.inputUser_id')}
                allowClear
                autoFocus
                onChange={(e) => setModalUser_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.product_id}：</label>
              <ModalInput
                value={modalProduct_id}
                placeholder={t('cart:cart.placeholders.inputProduct_id')}
                allowClear
                
                onChange={(e) => setModalProduct_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.product_name}：</label>
              <ModalInput
                value={modalProduct_name}
                placeholder={t('cart:cart.placeholders.inputProduct_name')}
                allowClear
                
                onChange={(e) => setModalProduct_name(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.product_image}：</label>
              <ModalInput
                value={modalProduct_image}
                placeholder={t('cart:cart.placeholders.inputProduct_image')}
                allowClear
                
                onChange={(e) => setModalProduct_image(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.price}：</label>
              <ModalInput
                value={modalPrice}
                placeholder={t('cart:cart.placeholders.inputPrice')}
                allowClear
                
                onChange={(e) => setModalPrice(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.quantity}：</label>
              <ModalInput
                value={modalQuantity}
                placeholder={t('cart:cart.placeholders.inputQuantity')}
                allowClear
                
                onChange={(e) => setModalQuantity(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.selected}：</label>
              <ModalInput
                value={modalSelected}
                placeholder={t('cart:cart.placeholders.inputSelected')}
                allowClear
                
                onChange={(e) => setModalSelected(e.target.value)}
              />
            </div>
          </ModalContainer>
        </Modal>
      </ConfigProvider>
    </Container>
  )
}

export async function getServerSideProps(context) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations')

  let cart = null

  await getCartService(0, pageSize).then((res: any) => {
    const { data } = res
    cart = data.cart
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'cart', 'layout', 'login'])

  return {
    props: {
      cart,
      ...translations
    }
  }
}

export default Page