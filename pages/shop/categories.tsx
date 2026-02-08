import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Spin, Alert } from "antd";
import { AppstoreOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../client/layout/shop-layout";
import { getCategoryService } from "@/service/category/manage";
import Link from "next/link";

const { Title, Paragraph } = Typography;

interface Category {
  id: number;
  name: string;
  icon: string;
  parent_id: number;
  sort_order: number;
  status: string;
  product_count?: number;
}

const CategoriesPage = () => {
  const { t } = useTranslation(["shop", "common"]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // 获取所有分类
        const categoryResponse = await getCategoryService(0, 100);
        if (categoryResponse?.data?.category?.items) {
          setCategories(categoryResponse.data.category.items);
        }
      } catch (err) {
        console.error("获取分类失败:", err);
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <ShopLayout>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
          <Paragraph>{t("common:loading")}</Paragraph>
        </div>
      </ShopLayout>
    );
  }

  if (error) {
    return (
      <ShopLayout>
        <Alert
          message={t("common:error")}
          description={error}
          type="error"
          showIcon
          style={{ margin: "20px" }}
        />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      {/* 页面标题 */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <Title level={2}>
          <AppstoreOutlined /> {t("shop:categories.title")}
        </Title>
        <Paragraph type="secondary">
          {t("shop:categories.description")}
        </Paragraph>
      </div>

      {categories.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Title level={3}>{t("shop:categories.noCategories")}</Title>
          <Paragraph type="secondary">
            当前没有可用的商品分类，请稍后再试。
          </Paragraph>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col xs={12} sm={8} md={6} key={category.id}>
              <Link href={`/shop/category/${category.id}`}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: "120px",
                        background: "#f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {category.icon ? (
                        <div
                          style={{
                            fontSize: "40px",
                            color: "#1890ff",
                          }}
                        >
                          {category.icon}
                        </div>
                      ) : (
                        <ShoppingOutlined style={{ fontSize: "40px", color: "#1890ff" }} />
                      )}
                    </div>
                  }
                >
                  <Card.Meta
                    title={category.name}
                    description={
                      <>
                        <Paragraph type="secondary" style={{ marginBottom: "4px" }}>
                          分类ID: {category.id}
                        </Paragraph>
                        <Paragraph type="secondary" style={{ margin: 0 }}>
                          {category.product_count || 0}件商品
                        </Paragraph>
                      </>
                    }
                    style={{ textAlign: "center" }}
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}

      {/* 分类统计信息 */}
      <div style={{ marginTop: "48px", padding: "24px", background: "#f5f5f5", borderRadius: "8px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                {categories.length}
              </Title>
              <Paragraph type="secondary">{t("shop:categories.totalCategories")}</Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                {categories.filter(c => c.status === "active").length}
              </Title>
              <Paragraph type="secondary">{t("shop:categories.activeCategories")}</Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ margin: 0, color: "#fa8c16" }}>
                {categories.reduce((total, c) => total + (c.product_count || 0), 0)}
              </Title>
              <Paragraph type="secondary">{t("shop:categories.totalProducts")}</Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </ShopLayout>
  );
};

export const getServerSideProps = async ({ locale }: { locale: string }) => {
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

CategoriesPage.displayName = "CategoriesPage";

export default CategoriesPage;