import { useState, useEffect } from 'react'
import { ConfigProvider, Modal, Space, Upload, message } from 'antd'
import {
  Container,
  SearchRow,
  ModalContainer,
  StyledButton,
  StyledTable,
  ModalTitle,
  ModalInput,
  IconWrapper,
  RoundedButton,
  GlobalStyle,
} from '@/styled/address/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addAddress,
  modAddress,
  delAddress,
  updateSSRAddress,
  searchAddress,
  batchDelAddress,
} from '@/redux/address/manage/actions'
import { getAddressService } from '@/service/address/manage'
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

const Page = ({ address }) => {
  const { t } = useTranslation(['common', 'address'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalUser_id, setModalUser_id] = useState('')
  const [modalReceiver_name, setModalReceiver_name] = useState('')
  const [modalReceiver_phone, setModalReceiver_phone] = useState('')
  const [modalProvince, setModalProvince] = useState('')
  const [modalCity, setModalCity] = useState('')
  const [modalDistrict, setModalDistrict] = useState('')
  const [modalDetail_address, setModalDetail_address] = useState('')
  const [modalIs_default, setModalIs_default] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    user_id: t('address:address.fields.user_id'),
    receiver_name: t('address:address.fields.receiver_name'),
    receiver_phone: t('address:address.fields.receiver_phone'),
    province: t('address:address.fields.province'),
    city: t('address:address.fields.city'),
    district: t('address:address.fields.district'),
    detail_address: t('address:address.fields.detail_address'),
    is_default: t('address:address.fields.is_default')
  }

  useEffect(() => {
    dispatch(updateSSRAddress(address))
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

  const addressManage = useSelector((state: RootState) => state.addressManage)

  if (!addressManage.firstLoadFlag) {
    address = addressManage.address
  }

  const safeAddress = address || { totalCounts: 0, items: [] }
  const { totalCounts, items: addressItems } = _.cloneDeep(safeAddress)

  _.each(addressItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = addressItems
  const columns: any = [
    {
      title: t('address:address.fields.user_id'),
      dataIndex: 'user_id',
      key: 'user_id',
      sorter: (a: any, b: any) => a.user_id - b.user_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('address:address.fields.receiver_name'),
      dataIndex: 'receiver_name',
      key: 'receiver_name',
      sorter: (a: any, b: any) => a.receiver_name.length - b.receiver_name.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('address:address.fields.receiver_phone'),
      dataIndex: 'receiver_phone',
      key: 'receiver_phone',
      sorter: (a: any, b: any) => a.receiver_phone.length - b.receiver_phone.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('address:address.fields.province'),
      dataIndex: 'province',
      key: 'province',
      sorter: (a: any, b: any) => a.province.length - b.province.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('address:address.fields.city'),
      dataIndex: 'city',
      key: 'city',
      sorter: (a: any, b: any) => a.city.length - b.city.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('address:address.fields.district'),
      dataIndex: 'district',
      key: 'district',
      sorter: (a: any, b: any) => a.district.length - b.district.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('address:address.fields.is_default'),
      dataIndex: 'is_default',
      key: 'is_default',
      sorter: (a: any, b: any) => a.is_default - b.is_default,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('address:address.fields.actions'),
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
                updateAddress(record)
              }}
            >
              {t('address:address.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteAddress(id)
              }}
            >
              {t('address:address.buttons.delete')}
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

  const createAddress = () => {
    setModalId(0)
    setModalUser_id('')
    setModalReceiver_name('')
    setModalReceiver_phone('')
    setModalProvince('')
    setModalCity('')
    setModalDistrict('')
    setModalDetail_address('')
    setModalIs_default('')
    showModal()
  }

  const updateAddress = (record: any) => {
    const { id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default } = record

    setModalId(id)
    setModalUser_id(user_id)
    setModalReceiver_name(receiver_name)
    setModalReceiver_phone(receiver_phone)
    setModalProvince(province)
    setModalCity(city)
    setModalDistrict(district)
    setModalDetail_address(detail_address)
    setModalIs_default(is_default)
    showModal()
  }

  const deleteAddress = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('address:address.messages.confirmDelete'),
      okText: t('address:address.buttons.confirm'),
      cancelText: t('address:address.buttons.cancel'),
      onOk: () => {
        dispatch(delAddress(id))
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
      receiver_name: handleXSS(modalReceiver_name),
      receiver_phone: handleXSS(modalReceiver_phone),
      province: handleXSS(modalProvince),
      city: handleXSS(modalCity),
      district: handleXSS(modalDistrict),
      detail_address: handleXSS(modalDetail_address),
      is_default: handleXSS(modalIs_default)
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

    // 验证is_default
    const is_defaultValue = modalObj.is_default
    if (is_defaultValue !== undefined && is_defaultValue !== null && is_defaultValue !== '') {
      const parsedIs_default = parseInt(is_defaultValue, 10)
      if (isNaN(parsedIs_default)) {
        message.error(`is_default必须是数字，当前值: "${is_defaultValue}"`)
        return
      }
      modalObj.is_default = parsedIs_default
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addAddress(modalObj))
      } else {
        dispatch(modAddress(modalId, modalObj))
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
    dispatch(searchAddress(0, pageSize, searchData))
  }

  const exportAddress = () => {
    if (addressItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Address')
      const jsonData = _.map(addressItems, (item) => _.omit(item, ['key']))

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
        { header: '收货人', key: 'header2', width: 30 },
        { header: '收货电话', key: 'header3', width: 30 },
        { header: '省份', key: 'header4', width: 30 },
        { header: '城市', key: 'header5', width: 30 },
        { header: '区县', key: 'header6', width: 30 },
        { header: '是否默认', key: 'header7', width: 15 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Address.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('address:address.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/address/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('address:address.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('address:address.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('address:address.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('address:address.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteAddress = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('address:address.messages.confirmBatchDelete'),
        okText: t('address:address.buttons.confirm'),
        cancelText: t('address:address.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelAddress(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('address:address.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('address:address.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createAddress} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('address:address.buttons.add')}
              </StyledButton>
              
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('address:address.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportAddress} icon={<UploadOutlined rotate={180} />} $export>
                {t('address:address.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('address:address.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteAddress} $danger>
                {t('address:address.buttons.batchDelete')}
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
            showTotal: (total) => t('address:address.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = {}
              dispatch(searchAddress(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('address:address.modal.addTitle') : t('address:address.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('address:address.buttons.confirm')}
          cancelText={t('address:address.buttons.cancel')}
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
                placeholder={t('address:address.placeholders.inputUser_id')}
                allowClear
                autoFocus
                onChange={(e) => setModalUser_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.receiver_name}：</label>
              <ModalInput
                value={modalReceiver_name}
                placeholder={t('address:address.placeholders.inputReceiver_name')}
                allowClear
                
                onChange={(e) => setModalReceiver_name(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.receiver_phone}：</label>
              <ModalInput
                value={modalReceiver_phone}
                placeholder={t('address:address.placeholders.inputReceiver_phone')}
                allowClear
                
                onChange={(e) => setModalReceiver_phone(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.province}：</label>
              <ModalInput
                value={modalProvince}
                placeholder={t('address:address.placeholders.inputProvince')}
                allowClear
                
                onChange={(e) => setModalProvince(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.city}：</label>
              <ModalInput
                value={modalCity}
                placeholder={t('address:address.placeholders.inputCity')}
                allowClear
                
                onChange={(e) => setModalCity(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.district}：</label>
              <ModalInput
                value={modalDistrict}
                placeholder={t('address:address.placeholders.inputDistrict')}
                allowClear
                
                onChange={(e) => setModalDistrict(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.detail_address}：</label>
              <ModalInput
                value={modalDetail_address}
                placeholder={t('address:address.placeholders.inputDetail_address')}
                allowClear
                
                onChange={(e) => setModalDetail_address(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.is_default}：</label>
              <ModalInput
                value={modalIs_default}
                placeholder={t('address:address.placeholders.inputIs_default')}
                allowClear
                
                onChange={(e) => setModalIs_default(e.target.value)}
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

  let address = null

  await getAddressService(0, pageSize).then((res: any) => {
    const { data } = res
    address = data.address
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'address', 'layout', 'login'])

  return {
    props: {
      address,
      ...translations
    }
  }
}

export default Page