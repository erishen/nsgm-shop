import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Card, Typography, Spin, Alert, Pagination, Breadcrumb, Button } from "antd";
import { HomeOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../../client/layout/shop-layout";
import ShopProductCard from "@/components/ShopProductCard";
import { getProductService } from "@/service/product/manage";
import { searchCategoryByIdService } from "@/service/category/manage";
import Link from "next/link";

const { Title, Paragraph } = Typography;

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
}

const CategoryProductsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation(["shop", "common"]);
  
  const [category, setCategory] = useState<Category | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const categoryId = parseInt(id as string);
        
        // 获取分类信息
        const categoryResponse = await searchCategoryByIdService(categoryId);
        if (categoryResponse?.data?.categoryGet) {
          setCategory(categoryResponse.data.categoryGet);
        } else {
          // 如果API不存在，使用模拟数据
          setCategory({
            id: categoryId,
            name: `分类 ${categoryId}`,
            icon: "",
            parent_id: 0,
            sort_order: 0,
            status: "active",
          });
        }
        
        // 获取所有产品
        const productResponse = await getProductService(0, 100); // 获取足够多的产品
        if (productResponse?.data?.product?.items) {
          const allProducts = productResponse.data.product.items || [];
          
          // 过滤出当前分类的产品
          const categoryProducts = allProducts.filter((p: Product) => p.category_id === categoryId);
          setFilteredProducts(categoryProducts);
          setTotalCount(categoryProducts.length);
        }
      } catch (err: any) {
        console.error("获取数据失败:", err);
        setError(err.message || "未知错误");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // 计算当前页显示的产品
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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

  if (error || !category) {
    return (
      <ShopLayout>
        <Alert
          message={t("common:error")}
          description={error || "分类不存在"}
          type="error"
          showIcon
          style={{ margin: "20px" }}
        />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/shop">
            <Button type="primary" icon={<HomeOutlined />}>
              返回首页
            </Button>
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      {/* 面包屑导航 */}
      <div style={{ marginBottom: "24px" }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/shop">
              <HomeOutlined /> {t("shop:layout.menu.home")}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/shop/products">
              {t("shop:layout.menu.products")}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {category.name}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* 分类标题 */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <Title level={2}>
          <ShoppingOutlined /> {category.name}
        </Title>
        <Paragraph type="secondary">
          {category.icon && <span>{category.icon} </span>}
          分类ID: {category.id} | 状态: {category.status}
        </Paragraph>
        <Paragraph>
          共 {totalCount} 件商品
        </Paragraph>
      </div>

      {filteredProducts.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Title level={3}>该分类下暂无商品</Title>
          <Paragraph type="secondary">
            当前分类下没有商品，请浏览其他分类。
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              <Link href="/shop">
                <Button type="primary">返回首页</Button>
              </Link>
            </Col>
            <Col>
              <Link href="/shop/products">
                <Button>浏览所有商品</Button>
              </Link>
            </Col>
          </Row>
        </Card>
      ) : (
        <>
          {/* 商品列表 */}
          <Row gutter={[16, 24]}>
            {currentProducts.map((product) => (
              <Col xs={12} sm={8} md={6} key={product.id}>
                <ShopProductCard product={product} />
              </Col>
            ))}
          </Row>
          
          {/* 分页 */}
          {filteredProducts.length > pageSize && (
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} / ${total} 件商品`
                }
              />
            </div>
          )}
        </>
      )}
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

CategoryProductsPage.displayName = "CategoryProductsPage";

export default CategoryProductsPage;