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
} from '@/styled/order/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addOrder,
  modOrder,
  delOrder,
  updateSSROrder,
  searchOrder,
  batchDelOrder,
} from '@/redux/order/manage/actions'
import { getOrderService } from '@/service/order/manage'
import { RootState, AppDispatch } from '@/redux/store'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import { getAntdLocale, formatDateTime } from '@/utils/i18n'
import { useRouter } from 'next/router'
import { handleXSS, checkModalObj } from '@/utils/common'
import { UploadOutlined } from '@ant-design/icons'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { createCSRFUploadProps } from '@/utils/fetch'

const pageSize = 100

const Page = ({ order }) => {
  const { t } = useTranslation(['common', 'order'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalOrder_no, setModalOrder_no] = useState('')
  const [modalUser_id, setModalUser_id] = useState('')
  const [modalTotal_amount, setModalTotal_amount] = useState('')
  const [modalPay_amount, setModalPay_amount] = useState('')
  const [modalStatus, setModalStatus] = useState('')
  const [modalPay_status, setModalPay_status] = useState('')
  const [modalPay_type, setModalPay_type] = useState('')
  const [modalExpress_company, setModalExpress_company] = useState('')
  const [modalExpress_no, setModalExpress_no] = useState('')
  const [modalReceiver_name, setModalReceiver_name] = useState('')
  const [modalReceiver_phone, setModalReceiver_phone] = useState('')
  const [modalReceiver_address, setModalReceiver_address] = useState('')
  const [modalRemark, setModalRemark] = useState('')
  const [searchOrder_no, setSearchOrder_no] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    order_no: t('order:order.fields.order_no'),
    user_id: t('order:order.fields.user_id'),
    total_amount: t('order:order.fields.total_amount'),
    pay_amount: t('order:order.fields.pay_amount'),
    status: t('order:order.fields.status'),
    pay_status: t('order:order.fields.pay_status'),
    pay_type: t('order:order.fields.pay_type'),
    express_company: t('order:order.fields.express_company'),
    express_no: t('order:order.fields.express_no'),
    receiver_name: t('order:order.fields.receiver_name'),
    receiver_phone: t('order:order.fields.receiver_phone'),
    receiver_address: t('order:order.fields.receiver_address'),
    remark: t('order:order.fields.remark')
  }

  useEffect(() => {
    dispatch(updateSSROrder(order))
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

  const orderManage = useSelector((state: RootState) => state.orderManage)

  if (!orderManage.firstLoadFlag) {
    order = orderManage.order
  }

  // 确保 order 不为 null，提供默认值
  const safeOrder = order || { totalCounts: 0, items: [] }
  const { totalCounts, items: orderItems } = _.cloneDeep(safeOrder)

  _.each(orderItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = orderItems
  const columns: any = [
    {
      title: t('order:order.fields.order_no'),
      dataIndex: 'order_no',
      key: 'order_no',
      sorter: (a: any, b: any) => a.order_no.length - b.order_no.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.user_id'),
      dataIndex: 'user_id',
      key: 'user_id',
      sorter: (a: any, b: any) => a.user_id - b.user_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order:order.fields.total_amount'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order:order.fields.pay_amount'),
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('order:order.fields.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.pay_status'),
      dataIndex: 'pay_status',
      key: 'pay_status',
      sorter: (a: any, b: any) => a.pay_status.length - b.pay_status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.pay_type'),
      dataIndex: 'pay_type',
      key: 'pay_type',
      sorter: (a: any, b: any) => a.pay_type.length - b.pay_type.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.pay_time'),
      dataIndex: 'pay_time',
      key: 'pay_time',
      render: (text: string) => text ? formatDateTime(text) : '-'
    },
    {
      title: t('order:order.fields.ship_time'),
      dataIndex: 'ship_time',
      key: 'ship_time',
      render: (text: string) => text ? formatDateTime(text) : '-'
    },
    {
      title: t('order:order.fields.express_company'),
      dataIndex: 'express_company',
      key: 'express_company',
      sorter: (a: any, b: any) => a.express_company.length - b.express_company.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.express_no'),
      dataIndex: 'express_no',
      key: 'express_no',
      sorter: (a: any, b: any) => a.express_no.length - b.express_no.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.receiver_name'),
      dataIndex: 'receiver_name',
      key: 'receiver_name',
      sorter: (a: any, b: any) => a.receiver_name.length - b.receiver_name.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.receiver_phone'),
      dataIndex: 'receiver_phone',
      key: 'receiver_phone',
      sorter: (a: any, b: any) => a.receiver_phone.length - b.receiver_phone.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('order:order.fields.actions'),
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
                updateOrder(record)
              }}
            >
              {t('order:order.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteOrder(id)
              }}
            >
              {t('order:order.buttons.delete')}
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

  const createOrder = () => {
    setModalId(0)
    setModalOrder_no('')
    setModalUser_id('')
    setModalTotal_amount('')
    setModalPay_amount('')
    setModalStatus('')
    setModalPay_status('')
    setModalPay_type('')
    setModalExpress_company('')
    setModalExpress_no('')
    setModalReceiver_name('')
    setModalReceiver_phone('')
    setModalReceiver_address('')
    setModalRemark('')
    showModal()
  }

  const updateOrder = (record: any) => {
    const { id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark } = record

    setModalId(id)
    setModalOrder_no(order_no)
    setModalUser_id(user_id)
    setModalTotal_amount(total_amount)
    setModalPay_amount(pay_amount)
    setModalStatus(status)
    setModalPay_status(pay_status)
    setModalPay_type(pay_type)
    setModalExpress_company(express_company)
    setModalExpress_no(express_no)
    setModalReceiver_name(receiver_name)
    setModalReceiver_phone(receiver_phone)
    setModalReceiver_address(receiver_address)
    setModalRemark(remark)
    showModal()
  }

  const deleteOrder = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('order:order.messages.confirmDelete'),
      okText: t('order:order.buttons.confirm'),
      cancelText: t('order:order.buttons.cancel'),
      onOk: () => {
        dispatch(delOrder(id))
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
      order_no: handleXSS(modalOrder_no),
      user_id: handleXSS(modalUser_id),
      total_amount: handleXSS(modalTotal_amount),
      pay_amount: handleXSS(modalPay_amount),
      status: handleXSS(modalStatus),
      pay_status: handleXSS(modalPay_status),
      pay_type: handleXSS(modalPay_type),
      express_company: handleXSS(modalExpress_company),
      express_no: handleXSS(modalExpress_no),
      receiver_name: handleXSS(modalReceiver_name),
      receiver_phone: handleXSS(modalReceiver_phone),
      receiver_address: handleXSS(modalReceiver_address),
      remark: handleXSS(modalRemark)
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

    // 验证total_amount
    const total_amountValue = modalObj.total_amount
    if (total_amountValue !== undefined && total_amountValue !== null && total_amountValue !== '') {
      const parsedTotal_amount = parseFloat(total_amountValue)
      if (isNaN(parsedTotal_amount)) {
        message.error(`total_amount必须是数字，当前值: "${total_amountValue}"`)
        return
      }
      modalObj.total_amount = parsedTotal_amount
    }

    // 验证pay_amount
    const pay_amountValue = modalObj.pay_amount
    if (pay_amountValue !== undefined && pay_amountValue !== null && pay_amountValue !== '') {
      const parsedPay_amount = parseFloat(pay_amountValue)
      if (isNaN(parsedPay_amount)) {
        message.error(`pay_amount必须是数字，当前值: "${pay_amountValue}"`)
        return
      }
      modalObj.pay_amount = parsedPay_amount
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addOrder(modalObj))
      } else {
        dispatch(modOrder(modalId, modalObj))
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
    const searchData = { order_no: handleXSS(searchOrder_no) }
    dispatch(searchOrder(0, pageSize, searchData))
  }

  const exportOrder = () => {
    if (orderItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Order')
      const jsonData = _.map(orderItems, (item) => _.omit(item, ['key']))

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
        { header: '订单编号', key: 'header1', width: 30 },
        { header: '用户ID', key: 'header2', width: 15 },
        { header: '订单总额', key: 'header3', width: 30 },
        { header: '实付金额', key: 'header4', width: 30 },
        { header: '订单状态', key: 'header5', width: 30 },
        { header: '支付状态', key: 'header6', width: 30 },
        { header: '支付方式', key: 'header7', width: 30 },
        { header: '支付时间', key: 'header8', width: 30 },
        { header: '发货时间', key: 'header9', width: 30 },
        { header: '快递公司', key: 'header10', width: 30 },
        { header: '快递单号', key: 'header11', width: 30 },
        { header: '收货人', key: 'header12', width: 30 },
        { header: '收货电话', key: 'header13', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Order.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('order:order.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/order/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('order:order.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('order:order.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('order:order.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('order:order.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteOrder = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('order:order.messages.confirmBatchDelete'),
        okText: t('order:order.buttons.confirm'),
        cancelText: t('order:order.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelOrder(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('order:order.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('order:order.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createOrder} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('order:order.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchOrder_no}
                placeholder={t('order:order.placeholders.enterOrder_no')}
                allowClear
                onChange={(e) => setSearchOrder_no(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('order:order.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportOrder} icon={<UploadOutlined rotate={180} />} $export>
                {t('order:order.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('order:order.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteOrder} $danger>
                {t('order:order.buttons.batchDelete')}
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
            showTotal: (total) => t('order:order.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { order_no: handleXSS(searchOrder_no) }
              dispatch(searchOrder(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('order:order.modal.addTitle') : t('order:order.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('order:order.buttons.confirm')}
          cancelText={t('order:order.buttons.cancel')}
          centered
          maskClosable={false}
          destroyOnHidden
          okButtonProps={{ className: 'rounded-button' }}
          cancelButtonProps={{ className: 'rounded-button' }}
        >
          <ModalContainer>
            <div className="line">
              <label>{keyTitles.order_no}：</label>
              <ModalInput
                value={modalOrder_no}
                placeholder={t('order:order.placeholders.inputOrder_no')}
                allowClear
                autoFocus
                onChange={(e) => setModalOrder_no(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.user_id}：</label>
              <ModalInput
                value={modalUser_id}
                placeholder={t('order:order.placeholders.inputUser_id')}
                allowClear
                
                onChange={(e) => setModalUser_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.total_amount}：</label>
              <ModalInput
                value={modalTotal_amount}
                placeholder={t('order:order.placeholders.inputTotal_amount')}
                allowClear
                
                onChange={(e) => setModalTotal_amount(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.pay_amount}：</label>
              <ModalInput
                value={modalPay_amount}
                placeholder={t('order:order.placeholders.inputPay_amount')}
                allowClear
                
                onChange={(e) => setModalPay_amount(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.status}：</label>
              <ModalInput
                value={modalStatus}
                placeholder={t('order:order.placeholders.inputStatus')}
                allowClear
                
                onChange={(e) => setModalStatus(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.pay_status}：</label>
              <ModalInput
                value={modalPay_status}
                placeholder={t('order:order.placeholders.inputPay_status')}
                allowClear
                
                onChange={(e) => setModalPay_status(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.pay_type}：</label>
              <ModalInput
                value={modalPay_type}
                placeholder={t('order:order.placeholders.inputPay_type')}
                allowClear
                
                onChange={(e) => setModalPay_type(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.express_company}：</label>
              <ModalInput
                value={modalExpress_company}
                placeholder={t('order:order.placeholders.inputExpress_company')}
                allowClear
                
                onChange={(e) => setModalExpress_company(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.express_no}：</label>
              <ModalInput
                value={modalExpress_no}
                placeholder={t('order:order.placeholders.inputExpress_no')}
                allowClear
                
                onChange={(e) => setModalExpress_no(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.receiver_name}：</label>
              <ModalInput
                value={modalReceiver_name}
                placeholder={t('order:order.placeholders.inputReceiver_name')}
                allowClear
                
                onChange={(e) => setModalReceiver_name(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.receiver_phone}：</label>
              <ModalInput
                value={modalReceiver_phone}
                placeholder={t('order:order.placeholders.inputReceiver_phone')}
                allowClear
                
                onChange={(e) => setModalReceiver_phone(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.receiver_address}：</label>
              <ModalInput
                value={modalReceiver_address}
                placeholder={t('order:order.placeholders.inputReceiver_address')}
                allowClear
                
                onChange={(e) => setModalReceiver_address(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.remark}：</label>
              <ModalInput
                value={modalRemark}
                placeholder={t('order:order.placeholders.inputRemark')}
                allowClear
                
                onChange={(e) => setModalRemark(e.target.value)}
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

  let order = null

  await getOrderService(0, pageSize).then((res: any) => {
    const { data } = res
    order = data.order
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'order', 'layout', 'login'])

  return {
    props: {
      order,
      ...translations
    }
  }
}

export default Page