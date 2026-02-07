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
} from '@/styled/product/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addProduct,
  modProduct,
  delProduct,
  updateSSRProduct,
  searchProduct,
  batchDelProduct,
} from '@/redux/product/manage/actions'
import { getProductService } from '@/service/product/manage'
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

const Page = ({ product }) => {
  const { t } = useTranslation(['common', 'product'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalName, setModalName] = useState('')
  const [modalDescription, setModalDescription] = useState('')
  const [modalPrice, setModalPrice] = useState('')
  const [modalOriginal_price, setModalOriginal_price] = useState('')
  const [modalCategory_id, setModalCategory_id] = useState('')
  const [modalStock, setModalStock] = useState('')
  const [modalImage_url, setModalImage_url] = useState('')
  const [modalImages, setModalImages] = useState('')
  const [modalSales, setModalSales] = useState('')
  const [modalStatus, setModalStatus] = useState('')
  const [searchName, setSearchName] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    name: t('product:product.fields.name'),
    description: t('product:product.fields.description'),
    price: t('product:product.fields.price'),
    original_price: t('product:product.fields.original_price'),
    category_id: t('product:product.fields.category_id'),
    stock: t('product:product.fields.stock'),
    image_url: t('product:product.fields.image_url'),
    images: t('product:product.fields.images'),
    sales: t('product:product.fields.sales'),
    status: t('product:product.fields.status')
  }

  useEffect(() => {
    dispatch(updateSSRProduct(product))
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

  const productManage = useSelector((state: RootState) => state.productManage)

  if (!productManage.firstLoadFlag) {
    product = productManage.product
  }

  const safeProduct = product || { totalCounts: 0, items: [] }
  const { totalCounts, items: productItems } = _.cloneDeep(safeProduct)

  _.each(productItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = productItems
  const columns: any = [
    {
      title: t('product:product.fields.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.length - b.name.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('product:product.fields.price'),
      dataIndex: 'price',
      key: 'price',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('product:product.fields.original_price'),
      dataIndex: 'original_price',
      key: 'original_price',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('product:product.fields.category_id'),
      dataIndex: 'category_id',
      key: 'category_id',
      sorter: (a: any, b: any) => a.category_id - b.category_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('product:product.fields.stock'),
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: any, b: any) => a.stock - b.stock,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('product:product.fields.image_url'),
      dataIndex: 'image_url',
      key: 'image_url',
      sorter: (a: any, b: any) => a.image_url.length - b.image_url.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('product:product.fields.sales'),
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a: any, b: any) => a.sales - b.sales,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('product:product.fields.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('product:product.fields.actions'),
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
                updateProduct(record)
              }}
            >
              {t('product:product.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteProduct(id)
              }}
            >
              {t('product:product.buttons.delete')}
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

  const createProduct = () => {
    setModalId(0)
    setModalName('')
    setModalDescription('')
    setModalPrice('')
    setModalOriginal_price('')
    setModalCategory_id('')
    setModalStock('')
    setModalImage_url('')
    setModalImages('')
    setModalSales('')
    setModalStatus('')
    showModal()
  }

  const updateProduct = (record: any) => {
    const { id, name, description, price, original_price, category_id, stock, image_url, images, sales, status } = record

    setModalId(id)
    setModalName(name)
    setModalDescription(description)
    setModalPrice(price)
    setModalOriginal_price(original_price)
    setModalCategory_id(category_id)
    setModalStock(stock)
    setModalImage_url(image_url)
    setModalImages(images)
    setModalSales(sales)
    setModalStatus(status)
    showModal()
  }

  const deleteProduct = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('product:product.messages.confirmDelete'),
      okText: t('product:product.buttons.confirm'),
      cancelText: t('product:product.buttons.cancel'),
      onOk: () => {
        dispatch(delProduct(id))
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
      name: handleXSS(modalName),
      description: handleXSS(modalDescription),
      price: handleXSS(modalPrice),
      original_price: handleXSS(modalOriginal_price),
      category_id: handleXSS(modalCategory_id),
      stock: handleXSS(modalStock),
      image_url: handleXSS(modalImage_url),
      images: handleXSS(modalImages),
      sales: handleXSS(modalSales),
      status: handleXSS(modalStatus)
    }

    // 验证category_id
    const category_idValue = modalObj.category_id
    if (category_idValue !== undefined && category_idValue !== null && category_idValue !== '') {
      const parsedCategory_id = parseInt(category_idValue, 10)
      if (isNaN(parsedCategory_id)) {
        message.error(`category_id必须是数字，当前值: "${category_idValue}"`)
        return
      }
      modalObj.category_id = parsedCategory_id
    }

    // 验证stock
    const stockValue = modalObj.stock
    if (stockValue !== undefined && stockValue !== null && stockValue !== '') {
      const parsedStock = parseInt(stockValue, 10)
      if (isNaN(parsedStock)) {
        message.error(`stock必须是数字，当前值: "${stockValue}"`)
        return
      }
      modalObj.stock = parsedStock
    }

    // 验证sales
    const salesValue = modalObj.sales
    if (salesValue !== undefined && salesValue !== null && salesValue !== '') {
      const parsedSales = parseInt(salesValue, 10)
      if (isNaN(parsedSales)) {
        message.error(`sales必须是数字，当前值: "${salesValue}"`)
        return
      }
      modalObj.sales = parsedSales
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

    // 验证original_price
    const original_priceValue = modalObj.original_price
    if (original_priceValue !== undefined && original_priceValue !== null && original_priceValue !== '') {
      const parsedOriginal_price = parseFloat(original_priceValue)
      if (isNaN(parsedOriginal_price)) {
        message.error(`original_price必须是数字，当前值: "${original_priceValue}"`)
        return
      }
      modalObj.original_price = parsedOriginal_price
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addProduct(modalObj))
      } else {
        dispatch(modProduct(modalId, modalObj))
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
    const searchData = { name: handleXSS(searchName) }
    dispatch(searchProduct(0, pageSize, searchData))
  }

  const exportProduct = () => {
    if (productItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Product')
      const jsonData = _.map(productItems, (item) => _.omit(item, ['key']))

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
        { header: '商品名称', key: 'header1', width: 30 },
        { header: '售价', key: 'header2', width: 30 },
        { header: '原价', key: 'header3', width: 30 },
        { header: '分类ID', key: 'header4', width: 15 },
        { header: '库存', key: 'header5', width: 15 },
        { header: '主图', key: 'header6', width: 30 },
        { header: '销量', key: 'header7', width: 15 },
        { header: '状态', key: 'header8', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Product.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('product:product.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/product/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('product:product.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('product:product.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('product:product.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('product:product.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteProduct = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('product:product.messages.confirmBatchDelete'),
        okText: t('product:product.buttons.confirm'),
        cancelText: t('product:product.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelProduct(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('product:product.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('product:product.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createProduct} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('product:product.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchName}
                placeholder={t('product:product.placeholders.enterName')}
                allowClear
                onChange={(e) => setSearchName(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('product:product.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportProduct} icon={<UploadOutlined rotate={180} />} $export>
                {t('product:product.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('product:product.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteProduct} $danger>
                {t('product:product.buttons.batchDelete')}
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
            showTotal: (total) => t('product:product.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { name: handleXSS(searchName) }
              dispatch(searchProduct(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('product:product.modal.addTitle') : t('product:product.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('product:product.buttons.confirm')}
          cancelText={t('product:product.buttons.cancel')}
          centered
          maskClosable={false}
          destroyOnHidden
          okButtonProps={{ className: 'rounded-button' }}
          cancelButtonProps={{ className: 'rounded-button' }}
        >
          <ModalContainer>
            <div className="line">
              <label>{keyTitles.name}：</label>
              <ModalInput
                value={modalName}
                placeholder={t('product:product.placeholders.inputName')}
                allowClear
                autoFocus
                onChange={(e) => setModalName(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.description}：</label>
              <ModalInput
                value={modalDescription}
                placeholder={t('product:product.placeholders.inputDescription')}
                allowClear
                
                onChange={(e) => setModalDescription(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.price}：</label>
              <ModalInput
                value={modalPrice}
                placeholder={t('product:product.placeholders.inputPrice')}
                allowClear
                
                onChange={(e) => setModalPrice(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.original_price}：</label>
              <ModalInput
                value={modalOriginal_price}
                placeholder={t('product:product.placeholders.inputOriginal_price')}
                allowClear
                
                onChange={(e) => setModalOriginal_price(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.category_id}：</label>
              <ModalInput
                value={modalCategory_id}
                placeholder={t('product:product.placeholders.inputCategory_id')}
                allowClear
                
                onChange={(e) => setModalCategory_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.stock}：</label>
              <ModalInput
                value={modalStock}
                placeholder={t('product:product.placeholders.inputStock')}
                allowClear
                
                onChange={(e) => setModalStock(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.image_url}：</label>
              <ModalInput
                value={modalImage_url}
                placeholder={t('product:product.placeholders.inputImage_url')}
                allowClear
                
                onChange={(e) => setModalImage_url(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.images}：</label>
              <ModalInput
                value={modalImages}
                placeholder={t('product:product.placeholders.inputImages')}
                allowClear
                
                onChange={(e) => setModalImages(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.sales}：</label>
              <ModalInput
                value={modalSales}
                placeholder={t('product:product.placeholders.inputSales')}
                allowClear
                
                onChange={(e) => setModalSales(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.status}：</label>
              <ModalInput
                value={modalStatus}
                placeholder={t('product:product.placeholders.inputStatus')}
                allowClear
                
                onChange={(e) => setModalStatus(e.target.value)}
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

  let product = null

  await getProductService(0, pageSize).then((res: any) => {
    const { data } = res
    product = data.product
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'product', 'layout', 'login'])

  return {
    props: {
      product,
      ...translations
    }
  }
}

export default Page