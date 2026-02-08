import { Row, Col, Card, Typography, Carousel } from "antd";
import { ShoppingOutlined, FireOutlined, StarOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../client/layout/shop-layout";
import { getBannerService } from "@/service/banner/manage";
import { getProductService } from "@/service/product/manage";
import { getCategoryService } from "@/service/category/manage";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;

interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
}

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

interface Category {
  id: number;
  name: string;
  icon: string;
  parent_id: number;
  sort_order: number;
  status: string;
  product_count?: number;
}

interface ShopHomePageProps {
  banners: Banner[];
  featuredProducts: Product[];
  categories: Category[];
}

const ShopHomePage = ({ banners, featuredProducts, categories }: ShopHomePageProps) => {
  const { t } = useTranslation(["shop", "common"]);

  return (
    <ShopLayout>
      {/* 轮播图区域 */}
      <div style={{ marginBottom: "40px", position: "relative", zIndex: 1 }}>
        <Carousel 
          autoplay={false} 
          effect="scrollx" 
          style={{ borderRadius: "8px", overflow: "hidden" }}
          dotPosition="bottom"
        >
          {banners.map((banner) => (
            <div key={banner.id}>
              <Link href={banner.link_url || "/shop"}>
                <div
                  style={{
                    backgroundImage: `url(${banner.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "400px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                      padding: "20px",
                      color: "white",
                    }}
                  >
                    <Title level={3} style={{ color: "white", margin: 0 }}>
                      {banner.title}
                    </Title>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 商品分类 */}
      {categories.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <Title level={2}>
            <ShoppingOutlined /> {t("shop:categories.title")}
          </Title>
          <Row gutter={[16, 16]}>
            {categories.slice(0, 6).map((category) => (
              <Col xs={12} sm={8} md={4} key={category.id}>
                <Link href={`/shop/category/${category.id}`}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: "100px",
                          background: "#f0f2f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ShoppingOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={category.name}
                      style={{ textAlign: "center" }}
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 热门商品 */}
      {featuredProducts.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <Title level={2}>
            <FireOutlined /> {t("shop:featuredProducts.title")}
          </Title>
          <Row gutter={[16, 24]}>
            {featuredProducts.map((product) => (
            <Col xs={12} sm={8} md={6} key={product.id}>
              <Link href={`/shop/product/${product.id}`}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: "200px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={product.image_url || "/images/placeholder.jpg"}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {product.original_price > product.price && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            background: "#ff4d4f",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          {Math.round(
                            ((product.original_price - product.price) /
                              product.original_price) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                    </div>
                  }
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <>
                        <div style={{ marginBottom: "8px" }}>
                          <Text strong style={{ color: "#ff4d4f", fontSize: "18px" }}>
                            ¥{product.price}
                          </Text>
                          {product.original_price > product.price && (
                            <Text
                              delete
                              style={{ marginLeft: "8px", color: "#999", fontSize: "14px" }}
                            >
                              ¥{product.original_price}
                            </Text>
                          )}
                        </div>
                        <div>
                          <StarOutlined style={{ color: "#faad14", marginRight: "4px" }} />
                          <Text type="secondary">{product.sales || 0} 已售</Text>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Link>
            </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 特色区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: "40px" }}>
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <FireOutlined /> {t("shop:features.hotDeals.title")}
              </>
            }
          >
            <Paragraph>{t("shop:features.hotDeals.description")}</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <StarOutlined /> {t("shop:features.newArrivals.title")}
              </>
            }
          >
            <Paragraph>{t("shop:features.newArrivals.description")}</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <ShoppingOutlined /> {t("shop:features.freeShipping.title")}
              </>
            }
          >
            <Paragraph>{t("shop:features.freeShipping.description")}</Paragraph>
          </Card>
        </Col>
      </Row>
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

  // 在服务端获取数据
  let banners: Banner[] = [];
  let featuredProducts: Product[] = [];
  let categories: Category[] = [];

  try {
    // 获取轮播图
    const bannerResponse = await getBannerService(0, 5);
    if (bannerResponse?.data?.banner?.items) {
      banners = bannerResponse.data.banner.items;
    }
    
    // 获取热门商品（取前8个）
    const productResponse = await getProductService(0, 8);
    if (productResponse?.data?.product?.items) {
      featuredProducts = productResponse.data.product.items;
    }
    
    // 获取商品分类
    const categoryResponse = await getCategoryService(0, 10);
    if (categoryResponse?.data?.category?.items) {
      categories = categoryResponse.data.category.items;
    }
  } catch (error) {
    console.error("服务端获取数据失败:", error);
  }

  return {
    props: {
      ...(await serverSideTranslations(currentLocale, ["common", "shop", "layout"], i18nConfig)),
      banners,
      featuredProducts,
      categories,
    },
  };
};

ShopHomePage.displayName = "ShopHomePage";

export default ShopHomePage;