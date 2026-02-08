import { useState, useEffect, ReactNode, FC } from "react";
import { Layout, Menu, Input, Button, Badge, Space, Dropdown, Typography, Row, Col } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Title, Paragraph } = Typography;

interface ShopLayoutProps {
  children: ReactNode;
}

  const ShopLayout: FC<ShopLayoutProps> = ({ children }) => {
  const { t } = useTranslation(["shop", "common", "layout"]);
  const router = useRouter();

  // 固定初始值为0，避免hydration不匹配
  const [cartCount, setCartCount] = useState(0);
  const [showCartBadge, setShowCartBadge] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [headerReady, setHeaderReady] = useState(false);

  // 客户端挂载后再读取购物车数量
  useEffect(() => {
    const getCartCount = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const items = JSON.parse(savedCart);
          return items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        }
      } catch (err) {
        console.error("获取购物车数量失败:", err);
      }
      return 0;
    };
    
    // 初始读取
    const count = getCartCount();
    setCartCount(count);
    
    // 延迟显示购物车徽标，避免布局抖动
    const timer = setTimeout(() => {
      setShowCartBadge(true);
    }, 300);
    
    // Header 完全就绪
    const headerTimer = setTimeout(() => {
      setHeaderReady(true);
    }, 100);

    // 监听 localStorage 变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart" || e.key === null) {
        const newCount = getCartCount();
        setCartCount(newCount);
        // 如果有新数量，重新触发显示动画
        if (newCount !== count) {
          setShowCartBadge(false);
          setTimeout(() => setShowCartBadge(true), 50);
        }
      }
    };

    // 监听自定义事件（用于同一页面内更新）
    const handleCartUpdate = () => {
      const newCount = getCartCount();
      setCartCount(newCount);
      // 如果有新数量，重新触发显示动画
      if (newCount !== count) {
        setShowCartBadge(false);
        setTimeout(() => setShowCartBadge(true), 50);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cart-updated", handleCartUpdate);
      clearTimeout(timer);
      clearTimeout(headerTimer);
    };
  }, []);

  const onSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/shop/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const menuItems = [
    {
      key: "home",
      label: (
        <Link href="/shop">
          <HomeOutlined /> {t("shop:layout.menu.home")}
        </Link>
      ),
    },
    {
      key: "categories",
      label: (
        <Link href="/shop/categories">
          <AppstoreOutlined /> {t("shop:layout.menu.categories")}
        </Link>
      ),
    },
    {
      key: "products",
      label: (
        <Link href="/shop/products">
          <ShoppingOutlined /> {t("shop:layout.menu.products")}
        </Link>
      ),
    },
    {
      key: "deals",
      label: (
        <Link href="/shop/deals">
          <ShoppingOutlined /> {t("shop:layout.menu.deals")}
        </Link>
      ),
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("shop:layout.userMenu.profile"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: t("shop:layout.userMenu.orders"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <UserOutlined />,
      label: t("shop:layout.userMenu.logout"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      {headerReady ? (
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "white",
            borderBottom: "1px solid #f0f0f0",
            padding: "12px 24px",
            height: "auto",
            minWidth: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", minHeight: "48px", width: "100%" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", minWidth: "180px" }}>
              <Link href="/shop" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <div
                  style={{
                    background: "#1890ff",
                    borderRadius: "6px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                  }}
                >
                  <ShoppingOutlined style={{ color: "white", fontSize: "20px" }} />
                </div>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#1890ff", whiteSpace: "nowrap" }}>
                  NSGM Shop
                </span>
              </Link>
            </div>

            {/* 搜索框 */}
            <div style={{ flex: 1, maxWidth: "500px", margin: "0 24px", display: "flex", alignItems: "center", minWidth: 0 }}>
              <Search
                placeholder={t("shop:layout.searchPlaceholder")}
                enterButton={<SearchOutlined />}
                size="large"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={onSearch}
                style={{ width: "100%" }}
              />
            </div>

            {/* 右侧菜单 */}
            <Space size="large" align="center" style={{ minWidth: "300px", flexShrink: 0 }}>
              {/* 语言切换 */}
              <LanguageSwitcher size="small" />

              {/* 购物车 - 使用浮动层延迟展示避免抖动 */}
              <Link href="/shop/cart" style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
                <Badge 
                  count={cartCount} 
                  size="small" 
                  style={{ 
                    opacity: showCartBadge ? 1 : 0,
                    transform: showCartBadge ? 'scale(1)' : 'scale(0.8)',
                    transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    zIndex: 10,
                  }}
                >
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
                    size="large"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <span style={{ marginLeft: "4px" }}>{t("shop:layout.cart")}</span>
                  </Button>
                </Badge>
              </Link>

              {/* 用户菜单 */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button
                  type="text"
                  icon={<UserOutlined style={{ fontSize: "20px" }} />}
                  size="large"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={{ marginLeft: "4px" }}>{t("shop:layout.account")}</span>
                </Button>
              </Dropdown>
            </Space>
          </div>

          {/* 二级导航菜单 */}
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={[router.pathname.split("/")[2] || "home"]}
            style={{
              borderBottom: "none",
              background: "transparent",
              width: "100%",
              justifyContent: "center",
            }}
          />
        </Header>
      ) : (
        /* Header 占位符 - 保持布局稳定 */
        <div style={{ 
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
          padding: "12px 24px",
          height: "120px",
          minWidth: "100%",
          visibility: "hidden"
        }} />
      )}

      {/* 主要内容 */}
      <Content style={{ background: "#f5f5f5" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
          {children}
        </div>
      </Content>

      {/* 页脚 */}
      <Footer style={{ background: "#001529", color: "rgba(255, 255, 255, 0.65)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8} style={{ marginBottom: "16px" }}>
              <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
                NSGM Shop
              </Title>
              <Paragraph style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                {t("shop:layout.footer.description")}
              </Paragraph>
            </Col>
            <Col xs={24} sm={8} style={{ marginBottom: "16px" }}>
              <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
                {t("shop:layout.footer.quickLinks")}
              </Title>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "8px" }}>
                  <Link href="/shop/about" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                    {t("shop:layout.footer.about")}
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link href="/shop/contact" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                    {t("shop:layout.footer.contact")}
                  </Link>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Link href="/shop/faq" style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                    {t("shop:layout.footer.faq")}
                  </Link>
                </li>
              </ul>
            </Col>
            <Col xs={24} sm={8} style={{ marginBottom: "16px" }}>
              <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
                {t("shop:layout.footer.contactInfo")}
              </Title>
              <Paragraph style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                Email: support@nsgm-shop.com
              </Paragraph>
              <Paragraph style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                Phone: +86 138 0013 8000
              </Paragraph>
            </Col>
          </Row>
          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              marginTop: "24px",
              paddingTop: "24px",
              textAlign: "center",
            }}
          >
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.45)", margin: 0 }}>
              © {new Date().getFullYear()} NSGM Shop. {t("shop:layout.footer.allRightsReserved")}
            </Paragraph>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default ShopLayout;