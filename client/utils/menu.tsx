import { BookOutlined, SolutionOutlined } from '@ant-design/icons'

// 统一的菜单配置函数，支持可选的多语言翻译
export const getMenuConfig = (t?: (key: string) => string) => {
  let key = 1

  return [
    {
      key: (++key).toString(),
      text: '', // 空目录不显示，为了使用 SolutionOutlined 而不报错
      url: '/',
      icon: <SolutionOutlined rev={undefined} />,
      subMenus: null,
    },
    {
      key: (++key).toString(),
      text: t ? t('layout:layout.menu.introduction') : '介绍',
      url: '/',
      icon: <BookOutlined rev={undefined} />,
      subMenus: null,
    },
    {
    // category_manage_start
    key: (++key).toString(),
    text: 'category',
    url: '/category/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/category/manage'
      }
    ]
    // category_manage_end
  },
  {
    // product_manage_start
    key: (++key).toString(),
    text: 'product',
    url: '/product/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/product/manage'
      }
    ]
    // product_manage_end
  },
  {
    // user_manage_start
    key: (++key).toString(),
    text: 'user',
    url: '/user/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/user/manage'
      }
    ]
    // user_manage_end
  },
  {
    // address_manage_start
    key: (++key).toString(),
    text: 'address',
    url: '/address/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/address/manage'
      }
    ]
    // address_manage_end
  },
  {
    // order_manage_start
    key: (++key).toString(),
    text: 'order',
    url: '/order/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/order/manage'
      }
    ]
    // order_manage_end
  },
  {
    // order_item_manage_start
    key: (++key).toString(),
    text: 'order_item',
    url: '/order_item/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/order_item/manage'
      }
    ]
    // order_item_manage_end
  },
  {
    // banner_manage_start
    key: (++key).toString(),
    text: 'banner',
    url: '/banner/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/banner/manage'
      }
    ]
    // banner_manage_end
  },
  {
    // cart_manage_start
    key: (++key).toString(),
    text: 'cart',
    url: '/cart/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/cart/manage'
      }
    ]
    // cart_manage_end
  },
  {
    // payment_manage_start
    key: (++key).toString(),
    text: 'payment',
    url: '/payment/manage',
    icon: <SolutionOutlined rev={undefined} />,
    subMenus: [
      {
        key: `${key}_1`,
        text: 'manage',
        url: '/payment/manage'
      }
    ]
    // payment_manage_end
  },
  /*{
    key: (++key).toString(),
      text: t ? t('layout:layout.menu.template') : '',
      url: '/template/manage',
      icon: <SolutionOutlined rev={undefined} />,
      subMenus: [
        {
          key: `${key}_1`,
          text: t ? t('layout:layout.menu.template1') : '',
          url: '/template/manage',
        },
      ],
    }*/
  ]
}

// 默认导出不传翻译函数，使用中文
export default getMenuConfig()
