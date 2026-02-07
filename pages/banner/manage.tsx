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
} from '@/styled/banner/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addBanner,
  modBanner,
  delBanner,
  updateSSRBanner,
  searchBanner,
  batchDelBanner,
} from '@/redux/banner/manage/actions'
import { getBannerService } from '@/service/banner/manage'
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

const Page = ({ banner }) => {
  const { t } = useTranslation(['common', 'banner'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalTitle, setModalTitle] = useState('')
  const [modalImage_url, setModalImage_url] = useState('')
  const [modalLink_url, setModalLink_url] = useState('')
  const [modalSort_order, setModalSort_order] = useState('')
  const [modalStatus, setModalStatus] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    title: t('banner:banner.fields.title'),
    image_url: t('banner:banner.fields.image_url'),
    link_url: t('banner:banner.fields.link_url'),
    sort_order: t('banner:banner.fields.sort_order'),
    status: t('banner:banner.fields.status')
  }

  useEffect(() => {
    dispatch(updateSSRBanner(banner))
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

  const bannerManage = useSelector((state: RootState) => state.bannerManage)

  if (!bannerManage.firstLoadFlag) {
    banner = bannerManage.banner
  }

  const safeBanner = banner || { totalCounts: 0, items: [] }
  const { totalCounts, items: bannerItems } = _.cloneDeep(safeBanner)

  _.each(bannerItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = bannerItems
  const columns: any = [
    {
      title: t('banner:banner.fields.title'),
      dataIndex: 'title',
      key: 'title',
      sorter: (a: any, b: any) => a.title.length - b.title.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('banner:banner.fields.image_url'),
      dataIndex: 'image_url',
      key: 'image_url',
      sorter: (a: any, b: any) => a.image_url.length - b.image_url.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('banner:banner.fields.link_url'),
      dataIndex: 'link_url',
      key: 'link_url',
      sorter: (a: any, b: any) => a.link_url.length - b.link_url.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('banner:banner.fields.sort_order'),
      dataIndex: 'sort_order',
      key: 'sort_order',
      sorter: (a: any, b: any) => a.sort_order - b.sort_order,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('banner:banner.fields.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('banner:banner.fields.actions'),
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
                updateBanner(record)
              }}
            >
              {t('banner:banner.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteBanner(id)
              }}
            >
              {t('banner:banner.buttons.delete')}
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

  const createBanner = () => {
    setModalId(0)
    setModalTitle('')
    setModalImage_url('')
    setModalLink_url('')
    setModalSort_order('')
    setModalStatus('')
    showModal()
  }

  const updateBanner = (record: any) => {
    const { id, title, image_url, link_url, sort_order, status } = record

    setModalId(id)
    setModalTitle(title)
    setModalImage_url(image_url)
    setModalLink_url(link_url)
    setModalSort_order(sort_order)
    setModalStatus(status)
    showModal()
  }

  const deleteBanner = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('banner:banner.messages.confirmDelete'),
      okText: t('banner:banner.buttons.confirm'),
      cancelText: t('banner:banner.buttons.cancel'),
      onOk: () => {
        dispatch(delBanner(id))
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
      title: handleXSS(modalTitle),
      image_url: handleXSS(modalImage_url),
      link_url: handleXSS(modalLink_url),
      sort_order: handleXSS(modalSort_order),
      status: handleXSS(modalStatus)
    }

    // 验证sort_order
    const sort_orderValue = modalObj.sort_order
    if (sort_orderValue !== undefined && sort_orderValue !== null && sort_orderValue !== '') {
      const parsedSort_order = parseInt(sort_orderValue, 10)
      if (isNaN(parsedSort_order)) {
        message.error(`sort_order必须是数字，当前值: "${sort_orderValue}"`)
        return
      }
      modalObj.sort_order = parsedSort_order
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addBanner(modalObj))
      } else {
        dispatch(modBanner(modalId, modalObj))
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
    const searchData = { title: handleXSS(searchTitle) }
    dispatch(searchBanner(0, pageSize, searchData))
  }

  const exportBanner = () => {
    if (bannerItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Banner')
      const jsonData = _.map(bannerItems, (item) => _.omit(item, ['key']))

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
        { header: '标题', key: 'header1', width: 30 },
        { header: '图片', key: 'header2', width: 30 },
        { header: '链接', key: 'header3', width: 30 },
        { header: '排序', key: 'header4', width: 15 },
        { header: '状态', key: 'header5', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Banner.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('banner:banner.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/banner/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('banner:banner.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('banner:banner.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('banner:banner.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('banner:banner.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteBanner = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('banner:banner.messages.confirmBatchDelete'),
        okText: t('banner:banner.buttons.confirm'),
        cancelText: t('banner:banner.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelBanner(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('banner:banner.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('banner:banner.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createBanner} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('banner:banner.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchTitle}
                placeholder={t('banner:banner.placeholders.enterTitle')}
                allowClear
                onChange={(e) => setSearchTitle(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('banner:banner.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportBanner} icon={<UploadOutlined rotate={180} />} $export>
                {t('banner:banner.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('banner:banner.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteBanner} $danger>
                {t('banner:banner.buttons.batchDelete')}
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
            showTotal: (total) => t('banner:banner.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { title: handleXSS(searchTitle) }
              dispatch(searchBanner(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('banner:banner.modal.addTitle') : t('banner:banner.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('banner:banner.buttons.confirm')}
          cancelText={t('banner:banner.buttons.cancel')}
          centered
          maskClosable={false}
          destroyOnHidden
          okButtonProps={{ className: 'rounded-button' }}
          cancelButtonProps={{ className: 'rounded-button' }}
        >
          <ModalContainer>
            <div className="line">
              <label>{keyTitles.title}：</label>
              <ModalInput
                value={modalTitle}
                placeholder={t('banner:banner.placeholders.inputTitle')}
                allowClear
                autoFocus
                onChange={(e) => setModalTitle(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.image_url}：</label>
              <ModalInput
                value={modalImage_url}
                placeholder={t('banner:banner.placeholders.inputImage_url')}
                allowClear
                
                onChange={(e) => setModalImage_url(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.link_url}：</label>
              <ModalInput
                value={modalLink_url}
                placeholder={t('banner:banner.placeholders.inputLink_url')}
                allowClear
                
                onChange={(e) => setModalLink_url(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.sort_order}：</label>
              <ModalInput
                value={modalSort_order}
                placeholder={t('banner:banner.placeholders.inputSort_order')}
                allowClear
                
                onChange={(e) => setModalSort_order(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.status}：</label>
              <ModalInput
                value={modalStatus}
                placeholder={t('banner:banner.placeholders.inputStatus')}
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

  let banner = null

  await getBannerService(0, pageSize).then((res: any) => {
    const { data } = res
    banner = data.banner
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'banner', 'layout', 'login'])

  return {
    props: {
      banner,
      ...translations
    }
  }
}

export default Page