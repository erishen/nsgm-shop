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
} from '@/styled/user/manage'
import { useDispatch, useSelector } from 'react-redux'
import {
  addUser,
  modUser,
  delUser,
  updateSSRUser,
  searchUser,
  batchDelUser,
} from '@/redux/user/manage/actions'
import { getUserService } from '@/service/user/manage'
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

const Page = ({ user }) => {
  const { t } = useTranslation(['common', 'user'])
  const router = useRouter()
  const antdLocale = getAntdLocale(router.locale || 'zh-CN')
  const dispatch = useDispatch<AppDispatch>()
  const [isModalVisiable, setIsModalVisible] = useState(false)
  const [modalId, setModalId] = useState(0)
  const [modalUsername, setModalUsername] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalNickname, setModalNickname] = useState('')
  const [modalReal_name, setModalReal_name] = useState('')
  const [modalAvatar, setModalAvatar] = useState('')
  const [modalPhone, setModalPhone] = useState('')
  const [modalEmail, setModalEmail] = useState('')
  const [modalStatus, setModalStatus] = useState('')
  const [searchUsername, setSearchUsername] = useState('')
  const [batchDelIds, setBatchDelIds] = useState([])

  const keyTitles = {
    username: t('user:user.fields.username'),
    password: t('user:user.fields.password'),
    nickname: t('user:user.fields.nickname'),
    real_name: t('user:user.fields.real_name'),
    avatar: t('user:user.fields.avatar'),
    phone: t('user:user.fields.phone'),
    email: t('user:user.fields.email'),
    status: t('user:user.fields.status')
  }

  useEffect(() => {
    dispatch(updateSSRUser(user))
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

  const userManage = useSelector((state: RootState) => state.userManage)

  if (!userManage.firstLoadFlag) {
    user = userManage.user
  }

  const safeUser = user || { totalCounts: 0, items: [] }
  const { totalCounts, items: userItems } = _.cloneDeep(safeUser)

  _.each(userItems, (item) => {
    const { id } = item
    item.key = id
  })

  const dataSource = userItems
  const columns: any = [
    {
      title: t('user:user.fields.username'),
      dataIndex: 'username',
      key: 'username',
      sorter: (a: any, b: any) => a.username.length - b.username.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('user:user.fields.nickname'),
      dataIndex: 'nickname',
      key: 'nickname',
      sorter: (a: any, b: any) => a.nickname.length - b.nickname.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('user:user.fields.avatar'),
      dataIndex: 'avatar',
      key: 'avatar',
      sorter: (a: any, b: any) => a.avatar.length - b.avatar.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('user:user.fields.phone'),
      dataIndex: 'phone',
      key: 'phone',
      sorter: (a: any, b: any) => a.phone.length - b.phone.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('user:user.fields.email'),
      dataIndex: 'email',
      key: 'email',
      sorter: (a: any, b: any) => a.email.length - b.email.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('user:user.fields.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      showSorterTooltip: false
    },
    {
      title: t('user:user.fields.actions'),
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
                updateUser(record)
              }}
            >
              {t('user:user.buttons.edit')}
            </RoundedButton>
            <RoundedButton
              danger
              size="small"
              onClick={() => {
                const { id } = record
                deleteUser(id)
              }}
            >
              {t('user:user.buttons.delete')}
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

  const createUser = () => {
    setModalId(0)
    setModalUsername('')
    setModalPassword('')
    setModalNickname('')
    setModalReal_name('')
    setModalAvatar('')
    setModalPhone('')
    setModalEmail('')
    setModalStatus('')
    showModal()
  }

  const updateUser = (record: any) => {
    const { id, username, password, nickname, real_name, avatar, phone, email, status } = record

    setModalId(id)
    setModalUsername(username)
    setModalPassword(password)
    setModalNickname(nickname)
    setModalReal_name(real_name)
    setModalAvatar(avatar)
    setModalPhone(phone)
    setModalEmail(email)
    setModalStatus(status)
    showModal()
  }

  const deleteUser = (id: number) => {
    Modal.confirm({
      title: t('common:common.warning'),
      content: t('user:user.messages.confirmDelete'),
      okText: t('user:user.buttons.confirm'),
      cancelText: t('user:user.buttons.cancel'),
      onOk: () => {
        dispatch(delUser(id))
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
      username: handleXSS(modalUsername),
      password: handleXSS(modalPassword),
      nickname: handleXSS(modalNickname),
      real_name: handleXSS(modalReal_name),
      avatar: handleXSS(modalAvatar),
      phone: handleXSS(modalPhone),
      email: handleXSS(modalEmail),
      status: handleXSS(modalStatus)
    }



    const checkResult = checkModalObj(modalObj)

    if (!checkResult) {
      if (modalId == 0) {
        // 新增
        dispatch(addUser(modalObj))
      } else {
        dispatch(modUser(modalId, modalObj))
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
    const searchData = { username: handleXSS(searchUsername) }
    dispatch(searchUser(0, pageSize, searchData))
  }

  const exportUser = () => {
    if (userItems.length > 0) {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('User')
      const jsonData = _.map(userItems, (item) => _.omit(item, ['key']))

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
        { header: '用户名', key: 'header1', width: 30 },
        { header: '昵称', key: 'header2', width: 30 },
        { header: '头像', key: 'header3', width: 30 },
        { header: '手机号', key: 'header4', width: 30 },
        { header: '邮箱', key: 'header5', width: 30 },
        { header: '状态', key: 'header6', width: 30 }
      ]

      wb.xlsx
        .writeBuffer()
        .then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          saveAs(blob, 'User.xlsx')
        })
        .catch(() => {
          // 导出失败
        })
    } else {
      message.info(t('user:user.messages.noData'))
    }
  }

  const uploadProps = createCSRFUploadProps('/rest/user/import', {
    name: 'file',
    onSuccess: (fileName) => {
      message.success(`${fileName} ${t('user:user.messages.uploadSuccess')}`)
      window.location.reload()
    },
    onError: (fileName) => {
      message.error(`${fileName} ${t('user:user.messages.uploadFailed')}`)
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        message.error(t('user:user.messages.onlyExcel'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error(t('user:user.messages.fileSizeLimit'))
        return false
      }
      return true
    }
  })

  const batchDeleteUser = () => {
    if (batchDelIds.length > 0) {
      Modal.confirm({
        title: t('common:common.warning'),
        content: t('user:user.messages.confirmBatchDelete'),
        okText: t('user:user.buttons.confirm'),
        cancelText: t('user:user.buttons.cancel'),
        onOk: () => {
          dispatch(batchDelUser(batchDelIds))
          Modal.destroyAll()
        }
      })
    } else {
      message.info(t('user:user.messages.noDataBatchDelete'))
    }
  }

  return (
    <Container>
      <GlobalStyle />
      <div className="page-title">{t('user:user.title')}</div>
      <ConfigProvider locale={antdLocale}>
        <SearchRow>
          <Space size="middle" wrap>
            <Space size="small">
              <StyledButton type="primary" onClick={createUser} $primary>
                <IconWrapper className="fa fa-plus"></IconWrapper>
                {t('user:user.buttons.add')}
              </StyledButton>
              <StyledInput
                value={searchUsername}
                placeholder={t('user:user.placeholders.enterUsername')}
                allowClear
                onChange={(e) => setSearchUsername(e.target.value)}
                onPressEnter={doSearch}
              />
              <StyledButton type="primary" onClick={doSearch} $primary>
                <IconWrapper className="fa fa-search"></IconWrapper>
                {t('user:user.buttons.search')}
              </StyledButton>
            </Space>
            <Space size="small">
              <StyledButton onClick={exportUser} icon={<UploadOutlined rotate={180} />} $export>
                {t('user:user.buttons.export')}
              </StyledButton>
              <Upload {...uploadProps}>
                <StyledButton icon={<UploadOutlined />} $import>
                  {t('user:user.buttons.import')}
                </StyledButton>
              </Upload>
              <StyledButton danger onClick={batchDeleteUser} $danger>
                {t('user:user.buttons.batchDelete')}
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
            showTotal: (total) => t('user:user.pagination.total', { total }),
            onChange: (page, pageSize) => {
              const searchData = { username: handleXSS(searchUsername) }
              dispatch(searchUser(page - 1, pageSize, searchData))
            },
            className: 'styled-pagination'
          }}
        />
        <Modal
          title={
            <ModalTitle>
              {modalId == 0 ? t('user:user.modal.addTitle') : t('user:user.modal.editTitle')}
            </ModalTitle>
          }
          open={isModalVisiable}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={t('user:user.buttons.confirm')}
          cancelText={t('user:user.buttons.cancel')}
          centered
          maskClosable={false}
          destroyOnHidden
          okButtonProps={{ className: 'rounded-button' }}
          cancelButtonProps={{ className: 'rounded-button' }}
        >
          <ModalContainer>
            <div className="line">
              <label>{keyTitles.username}：</label>
              <ModalInput
                value={modalUsername}
                placeholder={t('user:user.placeholders.inputUsername')}
                allowClear
                autoFocus
                onChange={(e) => setModalUsername(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.password}：</label>
              <ModalInput
                value={modalPassword}
                placeholder={t('user:user.placeholders.inputPassword')}
                allowClear
                
                onChange={(e) => setModalPassword(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.nickname}：</label>
              <ModalInput
                value={modalNickname}
                placeholder={t('user:user.placeholders.inputNickname')}
                allowClear
                
                onChange={(e) => setModalNickname(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.real_name}：</label>
              <ModalInput
                value={modalReal_name}
                placeholder={t('user:user.placeholders.inputReal_name')}
                allowClear
                
                onChange={(e) => setModalReal_name(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.avatar}：</label>
              <ModalInput
                value={modalAvatar}
                placeholder={t('user:user.placeholders.inputAvatar')}
                allowClear
                
                onChange={(e) => setModalAvatar(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.phone}：</label>
              <ModalInput
                value={modalPhone}
                placeholder={t('user:user.placeholders.inputPhone')}
                allowClear
                
                onChange={(e) => setModalPhone(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.email}：</label>
              <ModalInput
                value={modalEmail}
                placeholder={t('user:user.placeholders.inputEmail')}
                allowClear
                
                onChange={(e) => setModalEmail(e.target.value)}
              />
            </div>
            <div className="line">
              <label>{keyTitles.status}：</label>
              <ModalInput
                value={modalStatus}
                placeholder={t('user:user.placeholders.inputStatus')}
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

  let user = null

  await getUserService(0, pageSize).then((res: any) => {
    const { data } = res
    user = data.user
  })

  const { locale } = context
  const translations = await serverSideTranslations(locale || 'zh-CN', ['common', 'user', 'layout', 'login'])

  return {
    props: {
      user,
      ...translations
    }
  }
}

export default Page