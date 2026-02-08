import { useState, useEffect } from 'react'
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
} from '@/styled/order_item/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addOrder_item,
  modOrder_item,
  delOrder_item,
  updateSSROrder_item,
  searchOrder_item,
  batchDelOrder_item,
} from '@/redux/order_item/manage/actions'
import { getOrder_itemService } from '@/service/order_item/manage'
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

const Page = ({ order_item }) => {
  const { t } = useTranslation(['common', 'order_item'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalOrder_id, setModalOrder_id] = useState('')
  const [modalProduct_id, setModalProduct_id] = useState('')
  const [modalProduct_name, setModalProduct_name] = useState('')
  const [modalProduct_image, setModalProduct_image] = useState('')
  const [modalPrice, setModalPrice] = useState('')
  const [modalQuantity, setModalQuantity] = useState('')
  const [modalSubtotal, setModalSubtotal] = useState('')
  const [searchProduct_name, setSearchProduct_name] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    order_id: t('order_item:order_item.fields.order_id'),
    product_id: t('order_item:order_item.fields.product_id'),
    product_name: t('order_item:order_item.fields.product_name'),
    product_image: t('order_item:order_item.fields.product_image'),
    price: t('order_item:order_item.fields.price'),
    quantity: t('order_item:order_item.fields.quantity'),
    subtotal: t('order_item:order_item.fields.subtotal')
  }

  useEffect(() => {
    dispatch(updateSSROrder_item(order_item))
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

  const order_itemManage = useSelector((state: RootState) => state.order_itemManage)

  if (!order_itemManage.firstLoadFlag) {
    order_item = order_itemManage.order_item
  }

  const safeOrder_item = order_item || { totalCounts: 0, items: [] }
  const { totalCounts, items: order_itemItems } = _.cloneDeep(safeOrder_item)

  _.each(order_itemItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = order_itemItems
  const columns: any = [
    {
      title: t('order_item:order_item.fields.order_id'),
      dataIndex: 'order_id',
      key: 'order_id',
      sorter: (a: any, b: any) => a.order_id - b.order_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order_item:order_item.fields.product_id'),
      dataIndex: 'product_id',
      key: 'product_id',
      sorter: (a: any, b: any) => a.product_id - b.product_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order_item:order_item.fields.product_name'),
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a: any, b: any) => a.product_name.length - b.product_name.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order_item:order_item.fields.product_image'),
      dataIndex: 'product_image',
      key: 'product_image',
      sorter: (a: any, b: any) => a.product_image.length - b.product_image.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order_item:order_item.fields.price'),
      dataIndex: 'price',
      key: 'price',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order_item:order_item.fields.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: any, b: any) => a.quantity - b.quantity,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order_item:order_item.fields.subtotal'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order_item:order_item.fields.actions'),
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
                updateOrder_item(record)
              }}
            >
              {t('order_item:order_item.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteOrder_item(id)
              }}
            >
              {t('order_item:order_item.buttons.delete')}
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

  const createOrder_item = () => {
    setModalId(0)
    setModalOrder_id('')
    setModalProduct_id('')
    setModalProduct_name('')
    setModalProduct_image('')
    setModalPrice('')
    setModalQuantity('')
    setModalSubtotal('')
    showModal()
  }

  const updateOrder_item = (record: any) => {
    const { id, order_id, product_id, product_name, product_image, price, quantity, subtotal } = record

    setModalId(id)
    setModalOrder_id(order_id)
    setModalProduct_id(product_id)
    setModalProduct_name(product_name)
    setModalProduct_image(product_image)
    setModalPrice(price)
    setModalQuantity(quantity)
    setModalSubtotal(subtotal)
    showModal()
  }

  const deleteOrder_item = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('order_item:order_item.messages.confirmDelete'),
      okText: t('order_item:order_item.buttons.confirm'),
      cancelText: t('order_item:order_item.buttons.cancel'),
      onOk: () => {
        dispatch(delOrder_item(id))
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
      order_id: handleXSS(modalOrder_id),
      product_id: handleXSS(modalProduct_id),
      product_name: handleXSS(modalProduct_name),
      product_image: handleXSS(modalProduct_image),
      price: handleXSS(modalPrice),
      quantity: handleXSS(modalQuantity),
      subtotal: handleXSS(modalSubtotal)
    }

    // 验证order_id
    const order_idValue = modalObj.order_id
    if (order_idValue !== undefined && order_idValue !== null && order_idValue !== '') {
      const parsedOrder_id = parseInt(order_idValue, 10)
      if (isNaN(parsedOrder_id)) {
        message.error(`order_id必须是数字，当前值: "${order_idValue}"`)
        return
      }
      modalObj.order_id = parsedOrder_id
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

    // 验证subtotal
    const subtotalValue = modalObj.subtotal
    if (subtotalValue !== undefined && subtotalValue !== null && subtotalValue !== '') {
      const parsedSubtotal = parseFloat(subtotalValue)
      if (isNaN(parsedSubtotal)) {
        message.error(`subtotal必须是数字，当前值: "${subtotalValue}"`)
        return
      }
      modalObj.subtotal = parsedSubtotal
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addOrder_item(modalObj))
      } else {
        dispatch(modOrder_item(modalId, modalObj))
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
    const searchData = { product_name: handleXSS(searchProduct_name) }
    dispatch(searchOrder_item(0, pageSize, searchData))
  }

  const exportOrder_item = () => {
    if (order_itemItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Order_item')
      const jsonData = _.map(order_itemItems, (item) => _.omit(item, ['key']))

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
        { header: '订单ID', key: 'header1', width: 15 },
        { header: '商品ID', key: 'header2', width: 15 },
        { header: '商品名称', key: 'header3', width: 30 },
        { header: '商品图片', key: 'header4', width: 30 },
        { header: '单价', key: 'header5', width: 30 },
        { header: '数量', key: 'header6', width: 15 },
        { header: '小计', key: 'header7', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Order_item.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('order_item:order_item.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/order_item/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('order_item:order_item.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('order_item:order_item.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('order_item:order_item.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('order_item:order_item.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteOrder_item = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('order_item:order_item.messages.confirmBatchDelete'),
        okText: t('order_item:order_item.buttons.confirm'),
        cancelText: t('order_item:order_item.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelOrder_item(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('order_item:order_item.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('order_item:order_item.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createOrder_item} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('order_item:order_item.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchProduct_name}
                placeholder={t('order_item:order_item.placeholders.enterProduct_name')}
                allowClear
                onChange={(e) => setSearchProduct_name(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('order_item:order_item.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportOrder_item} icon={<UploadOutlined rotate={180} />} $export>
                {t('order_item:order_item.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('order_item:order_item.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteOrder_item} $danger>
                {t('order_item:order_item.buttons.batchDelete')}
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
            showTotal: (total) => t('order_item:order_item.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { product_name: handleXSS(searchProduct_name) }
              dispatch(searchOrder_item(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('order_item:order_item.modal.addTitle') : t('order_item:order_item.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('order_item:order_item.buttons.confirm')}
          cancelText={t('order_item:order_item.buttons.cancel')}
          centered
          maskClosable={false}
          destroyOnHidden
          okButtonProps={{ className: 'rounded-button' }}
          cancelButtonProps={{ className: 'rounded-button' }}
        >
          <ModalContainer>
            <div className="line">
              <label>{keyTitles.order_id}：</label>
              <ModalInput
                value={modalOrder_id}
                placeholder={t('order_item:order_item.placeholders.inputOrder_id')}
                allowClear
                autoFocus
                onChange={(e) => setModalOrder_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.product_id}：</label>
              <ModalInput
                value={modalProduct_id}
                placeholder={t('order_item:order_item.placeholders.inputProduct_id')}
                allowClear
                
                onChange={(e) => setModalProduct_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.product_name}：</label>
              <ModalInput
                value={modalProduct_name}
                placeholder={t('order_item:order_item.placeholders.inputProduct_name')}
                allowClear
                
                onChange={(e) => setModalProduct_name(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.product_image}：</label>
              <ModalInput
                value={modalProduct_image}
                placeholder={t('order_item:order_item.placeholders.inputProduct_image')}
                allowClear
                
                onChange={(e) => setModalProduct_image(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.price}：</label>
              <ModalInput
                value={modalPrice}
                placeholder={t('order_item:order_item.placeholders.inputPrice')}
                allowClear
                
                onChange={(e) => setModalPrice(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.quantity}：</label>
              <ModalInput
                value={modalQuantity}
                placeholder={t('order_item:order_item.placeholders.inputQuantity')}
                allowClear
                
                onChange={(e) => setModalQuantity(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.subtotal}：</label>
              <ModalInput
                value={modalSubtotal}
                placeholder={t('order_item:order_item.placeholders.inputSubtotal')}
                allowClear
                
                onChange={(e) => setModalSubtotal(e.target.value)}
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

  let order_item = null

  await getOrder_itemService(0, pageSize).then((res: any) => {
    const { data } = res
    order_item = data.order_item
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'order_item', 'layout', 'login'])

  return {
    props: {
      order_item,
      ...translations
    }
  }
}

export default Page