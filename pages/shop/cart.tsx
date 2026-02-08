import { useState, useEffect } from "react";
import { Card, Button, Row, Col, Typography, Image, InputNumber, Empty, Divider, message } from "antd";
import { ShoppingCartOutlined, DeleteOutlined, ArrowLeftOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../client/layout/shop-layout";
import Link from "next/link";

const { Title, Text } = Typography;

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  quantity: number;
  stock: number;
}

const CartPage = () => {
  const { t } = useTranslation(["shop", "common"]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 模拟从 localStorage 或 API 获取购物车数据
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const items = JSON.parse(savedCart);
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("加载购物车失败:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock) } : item
    );
    setCartItems(updatedItems);
    saveCart(updatedItems);
  };

  const removeItem = (id: number) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedItems);
    saveCart(updatedItems);
    message.success("商品已从购物车移除");
  };

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    message.success("购物车已清空");
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + ((item.original_price || item.price) - item.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading && !mounted) {
    return (
      <ShopLayout>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <ShoppingOutlined style={{ fontSize: "48px", color: "#ccc" }} />
          <Title level={3} style={{ marginTop: "20px", color: "#999" }}>
            加载中...
          </Title>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: "24px" }}>
          <Link href="/shop">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: "16px" }}>
              {t("shop:cart.backToShop")}
            </Button>
          </Link>
          <Title level={2} style={{ margin: "0 0 8px 0" }}>
            <ShoppingCartOutlined /> {t("shop:cart.title")}
          </Title>
          <Text type="secondary">
            {t("shop:cart.itemCount", { count: totalItems })}
          </Text>
        </div>

        {cartItems.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "80px 40px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} style={{ color: "#999", marginBottom: "16px" }}>
                    {t("shop:cart.empty")}
                  </Title>
                  <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
                    {t("shop:cart.emptyDescription")}
                  </Text>
                  <Link href="/shop/products">
                    <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                      {t("shop:cart.continueShopping")}
                    </Button>
                  </Link>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* 购物车商品列表 */}
            <Col xs={24} lg={16}>
              <Card>
                {cartItems.map((item) => (
                  <div key={item.id}>
                    <Row gutter={16} align="middle">
                      <Col xs={6} sm={4}>
                        <Link href={`/shop/product/${item.productId}`}>
                          <Image
                            src={item.image_url || "/images/placeholder.jpg"}
                            alt={item.name}
                            width={100}
                            height={100}
                            style={{
                              objectFit: "cover",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          />
                        </Link>
                      </Col>
                      <Col xs={18} sm={14}>
                        <Link href={`/shop/product/${item.productId}`}>
                          <Title level={5} style={{ marginBottom: "8px", cursor: "pointer" }}>
                            {item.name}
                          </Title>
                        </Link>
                        <Row align="middle" justify="space-between">
                          <Col>
                            <Text strong style={{ color: "#ff4d4f", fontSize: "18px" }}>
                              ¥{item.price.toFixed(2)}
                            </Text>
                            {item.original_price && item.original_price > item.price && (
                              <Text delete style={{ marginLeft: "8px", color: "#999", fontSize: "14px" }}>
                                ¥{item.original_price.toFixed(2)}
                              </Text>
                            )}
                          </Col>
                          <Col>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              库存: {item.stock}
                            </Text>
                          </Col>
                        </Row>
                      </Col>
                      <Col xs={24} sm={6}>
                        <Row gutter={8} align="middle" justify="end">
                          <Col>
                            <InputNumber
                              min={1}
                              max={item.stock}
                              value={item.quantity}
                              onChange={(value) => updateQuantity(item.id, value || 1)}
                              style={{ width: "80px" }}
                              size="small"
                            />
                          </Col>
                          <Col>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeItem(item.id)}
                              size="small"
                            >
                              {t("shop:cart.remove")}
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Divider style={{ margin: "16px 0" }} />
                  </div>
                ))}
              </Card>
            </Col>

            {/* 订单摘要 */}
            <Col xs={24} lg={8}>
              <Card>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  {t("shop:cart.orderSummary")}
                </Title>

                <Row justify="space-between" style={{ marginBottom: "12px" }}>
                  <Text>{t("shop:cart.subtotal")} ({totalItems} {t("shop:cart.items")})</Text>
                  <Text strong>¥{subtotal.toFixed(2)}</Text>
                </Row>

                {totalDiscount > 0 && (
                  <Row justify="space-between" style={{ marginBottom: "12px" }}>
                    <Text type="success">{t("shop:cart.discount")}</Text>
                    <Text type="success" strong>
                      -¥{totalDiscount.toFixed(2)}
                    </Text>
                  </Row>
                )}

                <Divider />

                <Row justify="space-between" style={{ marginBottom: "24px" }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {t("shop:cart.total")}
                  </Title>
                  <Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
                    ¥{subtotal.toFixed(2)}
                  </Title>
                </Row>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ marginBottom: "12px" }}
                  onClick={() => message.info("结算功能开发中...")}
                >
                  {t("shop:cart.checkout")}
                </Button>

                <Button
                  type="default"
                  block
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                >
                  {t("shop:cart.clearCart")}
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </ShopLayout>
  );
};

export const getServerSideProps = async ({ locale }) => {
  const currentLocale = locale || "zh-CN";
  
  const path = require("path");
  const i18nConfig = {
    i18n: {
      defaultLocale: "zh-CN",
      locales: ["zh-CN", "en-US", "ja-JP"],
    },
    localePath: path.resolve(process.cwd(), "public/locales"),
  };

  return {
    props: {
      ...(await serverSideTranslations(currentLocale, ["common", "shop", "layout"], i18nConfig)),
    },
  };
};

CartPage.displayName = "CartPage";

export default CartPage;
