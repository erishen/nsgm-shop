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
} from '@/styled/payment/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addPayment,
  modPayment,
  delPayment,
  updateSSRPayment,
  searchPayment,
  batchDelPayment,
} from '@/redux/payment/manage/actions'
import { getPaymentService } from '@/service/payment/manage'
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

const Page = ({ payment }) => {
  const { t } = useTranslation(['common', 'payment'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalOrder_id, setModalOrder_id] = useState('')
  const [modalOrder_no, setModalOrder_no] = useState('')
  const [modalTransaction_id, setModalTransaction_id] = useState('')
  const [modalPay_type, setModalPay_type] = useState('')
  const [modalAmount, setModalAmount] = useState('')
  const [modalStatus, setModalStatus] = useState('')
  const [modalRemark, setModalRemark] = useState('')
  const [searchOrder_no, setSearchOrder_no] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    order_id: t('payment:payment.fields.order_id'),
    order_no: t('payment:payment.fields.order_no'),
    transaction_id: t('payment:payment.fields.transaction_id'),
    pay_type: t('payment:payment.fields.pay_type'),
    amount: t('payment:payment.fields.amount'),
    status: t('payment:payment.fields.status'),
    remark: t('payment:payment.fields.remark')
  }

  useEffect(() => {
    dispatch(updateSSRPayment(payment))
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

  const paymentManage = useSelector((state: RootState) => state.paymentManage)

  if (!paymentManage.firstLoadFlag) {
    payment = paymentManage.payment
  }

  const safePayment = payment || { totalCounts: 0, items: [] }
  const { totalCounts, items: paymentItems } = _.cloneDeep(safePayment)

  _.each(paymentItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = paymentItems
  const columns: any = [
    {
      title: t('payment:payment.fields.order_id'),
      dataIndex: 'order_id',
      key: 'order_id',
      sorter: (a: any, b: any) => a.order_id - b.order_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('payment:payment.fields.order_no'),
      dataIndex: 'order_no',
      key: 'order_no',
      sorter: (a: any, b: any) => a.order_no.length - b.order_no.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('payment:payment.fields.transaction_id'),
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      sorter: (a: any, b: any) => a.transaction_id.length - b.transaction_id.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('payment:payment.fields.pay_type'),
      dataIndex: 'pay_type',
      key: 'pay_type',
      sorter: (a: any, b: any) => a.pay_type.length - b.pay_type.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('payment:payment.fields.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center' as const,
      width: 100
    },
    {
      title: t('payment:payment.fields.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('payment:payment.fields.pay_time'),
      dataIndex: 'pay_time',
      key: 'pay_time',
      render: (text: string) => text ? formatDateTime(text) : '-'
    },
    {
      title: t('payment:payment.fields.callback_time'),
      dataIndex: 'callback_time',
      key: 'callback_time',
      render: (text: string) => text ? formatDateTime(text) : '-'
    },
    {
      title: t('payment:payment.fields.actions'),
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
                updatePayment(record)
              }}
            >
              {t('payment:payment.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deletePayment(id)
              }}
            >
              {t('payment:payment.buttons.delete')}
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

  const createPayment = () => {
    setModalId(0)
    setModalOrder_id('')
    setModalOrder_no('')
    setModalTransaction_id('')
    setModalPay_type('')
    setModalAmount('')
    setModalStatus('')
    setModalRemark('')
    showModal()
  }

  const updatePayment = (record: any) => {
    const { id, order_id, order_no, transaction_id, pay_type, amount, status, remark } = record

    setModalId(id)
    setModalOrder_id(order_id)
    setModalOrder_no(order_no)
    setModalTransaction_id(transaction_id)
    setModalPay_type(pay_type)
    setModalAmount(amount)
    setModalStatus(status)
    setModalRemark(remark)
    showModal()
  }

  const deletePayment = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('payment:payment.messages.confirmDelete'),
      okText: t('payment:payment.buttons.confirm'),
      cancelText: t('payment:payment.buttons.cancel'),
      onOk: () => {
        dispatch(delPayment(id))
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
      order_no: handleXSS(modalOrder_no),
      transaction_id: handleXSS(modalTransaction_id),
      pay_type: handleXSS(modalPay_type),
      amount: handleXSS(modalAmount),
      status: handleXSS(modalStatus),
      remark: handleXSS(modalRemark)
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

    // 验证amount
    const amountValue = modalObj.amount
    if (amountValue !== undefined && amountValue !== null && amountValue !== '') {
      const parsedAmount = parseFloat(amountValue)
      if (isNaN(parsedAmount)) {
        message.error(`amount必须是数字，当前值: "${amountValue}"`)
        return
      }
      modalObj.amount = parsedAmount
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addPayment(modalObj))
      } else {
        dispatch(modPayment(modalId, modalObj))
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
    dispatch(searchPayment(0, pageSize, searchData))
  }

  const exportPayment = () => {
    if (paymentItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Payment')
      const jsonData = _.map(paymentItems, (item) => _.omit(item, ['key']))

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
        { header: '订单编号', key: 'header2', width: 30 },
        { header: '第三方交易号', key: 'header3', width: 30 },
        { header: '支付方式', key: 'header4', width: 30 },
        { header: '支付金额', key: 'header5', width: 30 },
        { header: '支付状态', key: 'header6', width: 30 },
        { header: '支付时间', key: 'header7', width: 30 },
        { header: '回调时间', key: 'header8', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Payment.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('payment:payment.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/payment/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('payment:payment.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('payment:payment.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('payment:payment.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('payment:payment.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeletePayment = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('payment:payment.messages.confirmBatchDelete'),
        okText: t('payment:payment.buttons.confirm'),
        cancelText: t('payment:payment.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelPayment(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('payment:payment.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('payment:payment.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createPayment} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('payment:payment.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchOrder_no}
                placeholder={t('payment:payment.placeholders.enterOrder_no')}
                allowClear
                onChange={(e) => setSearchOrder_no(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('payment:payment.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportPayment} icon={<UploadOutlined rotate={180} />} $export>
                {t('payment:payment.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('payment:payment.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeletePayment} $danger>
                {t('payment:payment.buttons.batchDelete')}
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
            showTotal: (total) => t('payment:payment.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { order_no: handleXSS(searchOrder_no) }
              dispatch(searchPayment(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('payment:payment.modal.addTitle') : t('payment:payment.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('payment:payment.buttons.confirm')}
          cancelText={t('payment:payment.buttons.cancel')}
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
                placeholder={t('payment:payment.placeholders.inputOrder_id')}
                allowClear
                autoFocus
                onChange={(e) => setModalOrder_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.order_no}：</label>
              <ModalInput
                value={modalOrder_no}
                placeholder={t('payment:payment.placeholders.inputOrder_no')}
                allowClear
                
                onChange={(e) => setModalOrder_no(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.transaction_id}：</label>
              <ModalInput
                value={modalTransaction_id}
                placeholder={t('payment:payment.placeholders.inputTransaction_id')}
                allowClear
                
                onChange={(e) => setModalTransaction_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.pay_type}：</label>
              <ModalInput
                value={modalPay_type}
                placeholder={t('payment:payment.placeholders.inputPay_type')}
                allowClear
                
                onChange={(e) => setModalPay_type(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.amount}：</label>
              <ModalInput
                value={modalAmount}
                placeholder={t('payment:payment.placeholders.inputAmount')}
                allowClear
                
                onChange={(e) => setModalAmount(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.status}：</label>
              <ModalInput
                value={modalStatus}
                placeholder={t('payment:payment.placeholders.inputStatus')}
                allowClear
                
                onChange={(e) => setModalStatus(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.remark}：</label>
              <ModalInput
                value={modalRemark}
                placeholder={t('payment:payment.placeholders.inputRemark')}
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

  let payment = null

  await getPaymentService(0, pageSize).then((res: any) => {
    const { data } = res
    payment = data.payment
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'payment', 'layout', 'login'])

  return {
    props: {
      payment,
      ...translations
    }
  }
}

export default Page