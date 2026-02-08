import { useState } from "react";

import { Row, Col, Card, Typography, Spin, Alert, Button, Image, Divider, Tabs, Rate, Input, Form, message, InputNumber } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../../client/layout/shop-layout";
import ShopProductCard from "@/components/ShopProductCard";
import { searchProductByIdService } from "@/service/product/manage";
import { getProductService } from "@/service/product/manage";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category_id: number;
  stock: number;
  image_url: string;
  images: string[];
  sales: number;
  status: string;
}

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductDetailPageProps {
  product: Product | null;
  relatedProducts: Product[];
  reviews: Review[];
}

const ProductDetailPage = ({ product: initialProduct, relatedProducts: initialRelatedProducts, reviews: initialReviews }: ProductDetailPageProps) => {
  const { t } = useTranslation(["shop", "common"]);

  const [product] = useState<Product | null>(initialProduct);
  const [relatedProducts] = useState<Product[]>(initialRelatedProducts);
  const [reviews] = useState<Review[]>(initialReviews);
  const [loading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>(initialProduct?.image_url || "");

  const handleAddToCart = () => {
    if (!product) return;

    try {
      // 从 localStorage 获取当前购物车
      const savedCart = localStorage.getItem("cart");
      let cartItems: any[] = savedCart ? JSON.parse(savedCart) : [];

      // 检查商品是否已在购物车中
      const existingItemIndex = cartItems.findIndex(item => item.productId === product.id);

      if (existingItemIndex > -1) {
        // 商品已存在，更新数量
        cartItems[existingItemIndex].quantity = Math.min(
          cartItems[existingItemIndex].quantity + quantity,
          product.stock
        );
        message.success("购物车商品数量已更新");
      } else {
        // 商品不存在，添加新商品
        const cartId = Date.now(); // 使用时间戳作为临时 ID
        cartItems.push({
          id: cartId,
          productId: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
          quantity: quantity,
          stock: product.stock,
        });
        message.success(t("shop:productDetail.addToCartSuccess"));
      }

      // 保存到 localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));

      // 触发自定义事件，通知其他组件更新购物车数量
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("添加到购物车失败:", err);
      message.error("添加到购物车失败，请重试");
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // TODO: 实现立即购买逻辑
    console.log("立即购买:", { productId: product.id, quantity });
    message.info("立即购买功能开发中...");
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("链接已复制到剪贴板");
    }
  };

  if (loading) {
    return (
      <ShopLayout>
        <div style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spin size="large" />
        </div>
      </ShopLayout>
    );
  }

  if (!product) {
    return (
      <ShopLayout>
        <Alert
          message={t("common:error")}
          description="商品不存在"
          type="error"
          showIcon
          style={{ margin: "20px" }}
        />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/shop/products">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              {t("shop:productDetail.backToList")}
            </Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  const discountPercentage = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <ShopLayout>
      {/* 返回和分享按钮 */}
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Link href="/shop/products">
              <Button icon={<ArrowLeftOutlined />}>
                {t("shop:productDetail.backToList")}
              </Button>
            </Link>
          </Col>
          <Col>
            <Button icon={<ShareAltOutlined />} onClick={handleShare}>
              {t("shop:productDetail.share")}
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[32, 32]}>
        {/* 商品图片 */}
        <Col xs={24} md={12}>
          <Card style={{ marginBottom: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <Image
                src={selectedImage || product.image_url || "/images/placeholder.jpg"}
                alt={product.name}
                style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
                preview={false}
              />
            </div>
          </Card>
          
          {/* 缩略图列表 */}
          {product.images && product.images.length > 0 && (
            <Row gutter={[8, 8]} justify="center">
              <Col>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    border: selectedImage === product.image_url ? "2px solid #1890ff" : "1px solid #d9d9d9",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedImage(product.image_url)}
                >
                  <img
                    src={product.image_url || "/images/placeholder.jpg"}
                    alt="主图"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </Col>
              {product.images.map((img, index) => (
                <Col key={index}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      border: selectedImage === img ? "2px solid #1890ff" : "1px solid #d9d9d9",
                      borderRadius: "4px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img}
                      alt={`图片 ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* 商品信息 */}
        <Col xs={24} md={12}>
          <div style={{ marginBottom: "24px" }}>
            <Title level={2}>{product.name}</Title>
            <Paragraph type="secondary">{product.description}</Paragraph>
          </div>

          {/* 价格和折扣 */}
          <div style={{ marginBottom: "24px" }}>
            <Row align="middle" gutter={16}>
              <Col>
                <Text strong style={{ fontSize: "28px", color: discountPercentage > 0 ? "#ff4d4f" : "#333" }}>
                  ¥{product.price}
                </Text>
              </Col>
              {discountPercentage > 0 && (
                <>
                  <Col>
                    <Text delete style={{ fontSize: "18px", color: "#999" }}>
                      ¥{product.original_price}
                    </Text>
                  </Col>
                  <Col>
                    <div
                      style={{
                        background: "#ff4d4f",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {discountPercentage}% OFF
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </div>

          {/* 商品信息表格 */}
          <Card style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>{t("shop:productDetail.sku")}: </Text>
                <Text>#{product.id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>{t("shop:productDetail.category")}: </Text>
                <Text>分类 {product.category_id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>{t("shop:productDetail.stock")}: </Text>
                <Text type={isOutOfStock ? "danger" : "success"}>
                  {isOutOfStock ? t("shop:product.outOfStock") : `${product.stock} ${t("shop:product.inStock")}`}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>{t("shop:product.sales")}: </Text>
                <Text>{product.sales || 0}</Text>
              </Col>
            </Row>
          </Card>

          {/* 购买选项 */}
          <Card style={{ marginBottom: "24px" }}>
            <Title level={5}>{t("shop:product.quantity")}</Title>
            <Row gutter={16} align="middle" style={{ marginBottom: "16px" }}>
              <Col>
                <InputNumber
                  min={1}
                  max={product?.stock}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  disabled={isOutOfStock}
                />
              </Col>
              <Col flex="auto">
                <Text type="secondary">
                  {isOutOfStock 
                    ? t("shop:product.outOfStock") 
                    : `${product.stock} ${t("shop:product.inStock")}`}
                </Text>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  block
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  style={{
                    background: discountPercentage > 0 ? "#ff4d4f" : "#1890ff",
                    borderColor: discountPercentage > 0 ? "#ff4d4f" : "#1890ff",
                  }}
                >
                  {t("shop:product.addToCart")}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="default"
                  size="large"
                  block
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                >
                  {t("shop:product.buyNow")}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 标签页：描述、规格、评价 */}
      <div style={{ marginTop: "32px" }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={t("shop:productDetail.descriptionTitle")} key="1">
            <Card>
              <Title level={4}>{t("shop:productDetail.descriptionTitle")}</Title>
              <Paragraph>{product.description}</Paragraph>
              <Paragraph>
                商品编号: {product.id} | 分类ID: {product.category_id} | 状态: {product.status}
              </Paragraph>
            </Card>
          </TabPane>
          
          <TabPane tab={t("shop:productDetail.specificationsTitle")} key="2">
            <Card>
              <Title level={4}>{t("shop:productDetail.specificationsTitle")}</Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>商品名称</Text>
                  <Paragraph>{product.name}</Paragraph>
                </Col>
                <Col span={12}>
                  <Text strong>价格</Text>
                  <Paragraph>¥{product.price} {discountPercentage > 0 && `(原价: ¥${product.original_price})`}</Paragraph>
                </Col>
                <Col span={12}>
                  <Text strong>库存状态</Text>
                  <Paragraph type={isOutOfStock ? "danger" : "success"}>
                    {isOutOfStock ? t("shop:product.outOfStock") : t("shop:product.inStock")}
                  </Paragraph>
                </Col>
                <Col span={12}>
                  <Text strong>销量</Text>
                  <Paragraph>{product.sales || 0}</Paragraph>
                </Col>
              </Row>
            </Card>
          </TabPane>
          
          <TabPane tab={t("shop:productDetail.reviewsTitle")} key="3">
            <Card>
              <Title level={4}>{t("shop:productDetail.reviewsTitle")}</Title>
              
              {/* 评价统计 */}
              <div style={{ marginBottom: "24px", padding: "16px", background: "#f5f5f5", borderRadius: "4px" }}>
                <Row align="middle" gutter={16}>
                  <Col>
                    <Title level={2} style={{ margin: 0 }}>5.0</Title>
                  </Col>
                  <Col>
                    <Rate disabled defaultValue={5} />
                    <Paragraph type="secondary">基于 {reviews.length} 条评价</Paragraph>
                  </Col>
                </Row>
              </div>
              
              {/* 评价列表 */}
              {reviews.map((review) => (
                <div key={review.id} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #f0f0f0" }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: "8px" }}>
                    <Col>
                      <Text strong>{review.user}</Text>
                    </Col>
                    <Col>
                      <Text type="secondary">{review.date}</Text>
                    </Col>
                  </Row>
                  <Rate disabled defaultValue={review.rating} style={{ marginBottom: "8px" }} />
                  <Paragraph>{review.comment}</Paragraph>
                </div>
              ))}
              
              {/* 写评价表单 */}
              <Divider />
              <Title level={5}>{t("shop:productDetail.writeReview")}</Title>
              <Form layout="vertical">
                <Form.Item label={t("shop:productDetail.rating")}>
                  <Rate />
                </Form.Item>
                <Form.Item label="评价内容">
                  <TextArea rows={4} placeholder="分享您的使用体验..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary">提交评价</Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* 相关商品 */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: "48px" }}>
          <Divider orientation="left">
            <Title level={3}>{t("shop:productDetail.relatedProductsTitle")}</Title>
          </Divider>
          <Row gutter={[16, 24]}>
            {relatedProducts.map((relatedProduct) => (
              <Col xs={12} sm={8} md={6} key={relatedProduct.id}>
                <ShopProductCard product={relatedProduct} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </ShopLayout>
  );
};

export const getServerSideProps = async ({ locale, params }: { locale: string; params?: { id?: string } }) => {
  const currentLocale = locale || "zh-CN";
  const productId = params?.id ? parseInt(params.id) : 0;

  const path = require("path");
  const i18nConfig = {
    i18n: {
      defaultLocale: "zh-CN",
      locales: ["zh-CN", "en-US", "ja-JP"],
    },
    localePath: path.resolve(process.cwd(), "public/locales"),
  };

  // 在服务端获取初始数据
  let product: Product | null = null;
  let relatedProducts: Product[] = [];
  let reviews: Review[] = [];

  try {
    // 获取商品详情
    const productResponse = await searchProductByIdService(productId);
    if (productResponse?.data?.productGet) {
      product = productResponse.data.productGet;

      // 获取相关商品（同分类的商品）
      const relatedResponse = await getProductService(0, 8);
      if (relatedResponse?.data?.product?.items) {
        // 过滤掉当前商品，并取同分类的商品
        relatedProducts = relatedResponse.data.product.items
          .filter((p: Product) => p.id !== productId && p.category_id === (product?.category_id || 0))
          .slice(0, 4);
      }

      // 模拟获取评价数据
      reviews = [
        { id: 1, user: "张三", rating: 5, comment: "商品质量很好，发货速度快，非常满意！", date: "2025-01-15" },
        { id: 2, user: "李四", rating: 4, comment: "性价比高，包装完好，会再次购买。", date: "2025-01-10" },
        { id: 3, user: "王五", rating: 5, comment: "与描述一致，使用体验很好。", date: "2025-01-05" },
      ];
    }
  } catch (error) {
    console.error("服务端获取数据失败:", error);
  }

  return {
    props: {
      ...(await serverSideTranslations(currentLocale, ["common", "shop", "layout"], i18nConfig)),
      product,
      relatedProducts,
      reviews,
    },
  };
};

ProductDetailPage.displayName = "ProductDetailPage";

export default ProductDetailPage;