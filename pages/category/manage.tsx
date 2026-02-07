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
} from '@/styled/category/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addCategory,
  modCategory,
  delCategory,
  updateSSRCategory,
  searchCategory,
  batchDelCategory,
} from '@/redux/category/manage/actions'
import { getCategoryService } from '@/service/category/manage'
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

const Page = ({ category }) => {
  const { t } = useTranslation(['common', 'category'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalName, setModalName] = useState('')
  const [modalIcon, setModalIcon] = useState('')
  const [modalParent_id, setModalParent_id] = useState('')
  const [modalSort_order, setModalSort_order] = useState('')
  const [modalStatus, setModalStatus] = useState('')
  const [searchName, setSearchName] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    name: t('category:category.fields.name'),
    icon: t('category:category.fields.icon'),
    parent_id: t('category:category.fields.parent_id'),
    sort_order: t('category:category.fields.sort_order'),
    status: t('category:category.fields.status')
  }

  useEffect(() => {
    dispatch(updateSSRCategory(category))
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

  const categoryManage = useSelector((state: RootState) => state.categoryManage)

  if (!categoryManage.firstLoadFlag) {
    category = categoryManage.category
  }

  const safeCategory = category || { totalCounts: 0, items: [] }
  const { totalCounts, items: categoryItems } = _.cloneDeep(safeCategory)

  _.each(categoryItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = categoryItems
  const columns: any = [
    {
      title: t('category:category.fields.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.length - b.name.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('category:category.fields.icon'),
      dataIndex: 'icon',
      key: 'icon',
      sorter: (a: any, b: any) => a.icon.length - b.icon.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('category:category.fields.parent_id'),
      dataIndex: 'parent_id',
      key: 'parent_id',
      sorter: (a: any, b: any) => a.parent_id - b.parent_id,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('category:category.fields.sort_order'),
      dataIndex: 'sort_order',
      key: 'sort_order',
      sorter: (a: any, b: any) => a.sort_order - b.sort_order,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false,
      align: 'center' as const,
      width: 100
    },
    {
      title: t('category:category.fields.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('category:category.fields.actions'),
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
                updateCategory(record)
              }}
            >
              {t('category:category.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteCategory(id)
              }}
            >
              {t('category:category.buttons.delete')}
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

  const createCategory = () => {
    setModalId(0)
    setModalName('')
    setModalIcon('')
    setModalParent_id('')
    setModalSort_order('')
    setModalStatus('')
    showModal()
  }

  const updateCategory = (record: any) => {
    const { id, name, icon, parent_id, sort_order, status } = record

    setModalId(id)
    setModalName(name)
    setModalIcon(icon)
    setModalParent_id(parent_id)
    setModalSort_order(sort_order)
    setModalStatus(status)
    showModal()
  }

  const deleteCategory = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('category:category.messages.confirmDelete'),
      okText: t('category:category.buttons.confirm'),
      cancelText: t('category:category.buttons.cancel'),
      onOk: () => {
        dispatch(delCategory(id))
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
      icon: handleXSS(modalIcon),
      parent_id: handleXSS(modalParent_id),
      sort_order: handleXSS(modalSort_order),
      status: handleXSS(modalStatus)
    }

    // 验证parent_id
    const parent_idValue = modalObj.parent_id
    if (parent_idValue !== undefined && parent_idValue !== null && parent_idValue !== '') {
      const parsedParent_id = parseInt(parent_idValue, 10)
      if (isNaN(parsedParent_id)) {
        message.error(`parent_id必须是数字，当前值: "${parent_idValue}"`)
        return
      }
      modalObj.parent_id = parsedParent_id
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
        dispatch(addCategory(modalObj))
      } else {
        dispatch(modCategory(modalId, modalObj))
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
    dispatch(searchCategory(0, pageSize, searchData))
  }

  const exportCategory = () => {
    if (categoryItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Category')
      const jsonData = _.map(categoryItems, (item) => _.omit(item, ['key']))

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
        { header: '分类名称', key: 'header1', width: 30 },
        { header: '分类图标', key: 'header2', width: 30 },
        { header: '父分类ID', key: 'header3', width: 15 },
        { header: '排序', key: 'header4', width: 15 },
        { header: '状态', key: 'header5', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'Category.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('category:category.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/category/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('category:category.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('category:category.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('category:category.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('category:category.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteCategory = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('category:category.messages.confirmBatchDelete'),
        okText: t('category:category.buttons.confirm'),
        cancelText: t('category:category.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelCategory(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('category:category.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('category:category.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createCategory} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('category:category.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchName}
                placeholder={t('category:category.placeholders.enterName')}
                allowClear
                onChange={(e) => setSearchName(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('category:category.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportCategory} icon={<UploadOutlined rotate={180} />} $export>
                {t('category:category.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('category:category.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteCategory} $danger>
                {t('category:category.buttons.batchDelete')}
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
            showTotal: (total) => t('category:category.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { name: handleXSS(searchName) }
              dispatch(searchCategory(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('category:category.modal.addTitle') : t('category:category.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('category:category.buttons.confirm')}
          cancelText={t('category:category.buttons.cancel')}
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
                placeholder={t('category:category.placeholders.inputName')}
                allowClear
                autoFocus
                onChange={(e) => setModalName(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.icon}：</label>
              <ModalInput
                value={modalIcon}
                placeholder={t('category:category.placeholders.inputIcon')}
                allowClear
                
                onChange={(e) => setModalIcon(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.parent_id}：</label>
              <ModalInput
                value={modalParent_id}
                placeholder={t('category:category.placeholders.inputParent_id')}
                allowClear
                
                onChange={(e) => setModalParent_id(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.sort_order}：</label>
              <ModalInput
                value={modalSort_order}
                placeholder={t('category:category.placeholders.inputSort_order')}
                allowClear
                
                onChange={(e) => setModalSort_order(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.status}：</label>
              <ModalInput
                value={modalStatus}
                placeholder={t('category:category.placeholders.inputStatus')}
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

  let category = null

  await getCategoryService(0, pageSize).then((res: any) => {
    const { data } = res
    category = data.category
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'category', 'layout', 'login'])

  return {
    props: {
      category,
      ...translations
    }
  }
}

export default Page