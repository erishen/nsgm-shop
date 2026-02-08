import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Spin, Alert, Select, Button, Pagination } from "antd";
import { FireOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../client/layout/shop-layout";
import ShopProductCard from "@/components/ShopProductCard";
import { getProductService } from "@/service/product/manage";

const { Title, Paragraph } = Typography;
const { Option } = Select;

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

const DealsPage = () => {
  const { t } = useTranslation(["shop", "common"]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState<string>("discountHighToLow");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("开始获取商品数据...");
        // 获取所有商品，因为需要计算折扣
        const productResponse = await getProductService(0, 1000); // 获取足够多的产品，假设不超过1000
        console.log("API响应:", productResponse);
        
        if (productResponse?.data?.product?.items) {
          const allProducts = productResponse.data.product.items;
          console.log("所有商品:", allProducts.length, "个");
          
          // 过滤出有折扣的商品，确保价格是数字
          const deals = allProducts.filter(p => {
            const original = Number(p.original_price);
            const current = Number(p.price);
            return !isNaN(original) && !isNaN(current) && original > current;
          });
          console.log("特价商品:", deals.length, "个");
          console.log("特价商品详情:", deals);
          
          setProducts(deals);
          setTotalCount(deals.length);
          applySort(deals, sortBy);
        } else {
          console.warn("API响应中没有商品数据:", productResponse);
          setProducts([]);
          setTotalCount(0);
          setFilteredProducts([]);
        }
      } catch (err: any) {
        console.error("获取数据失败:", err);
        setError(err.message || "未知错误");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 调试：检查翻译
  useEffect(() => {
    console.log("翻译检查 - productList.sort:", t("shop:productList.sort"));
    console.log("翻译检查 - hotDeals.sortBy.discountHighToLow:", t("shop:hotDeals.sortBy.discountHighToLow"));
    console.log("翻译检查 - hotDeals.sortBy.discountLowToHigh:", t("shop:hotDeals.sortBy.discountLowToHigh"));
    console.log("翻译检查 - productList.sortBy.priceLowToHigh:", t("shop:productList.sortBy.priceLowToHigh"));
  }, [t]);

  // 计算折扣百分比
  const calculateDiscount = (original: number, price: number) => {
    if (original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  };

  // 排序函数
  const applySort = (items: Product[], sortType: string) => {
    let sorted = [...items];
    switch (sortType) {
      case "discountHighToLow":
        sorted.sort((a, b) => calculateDiscount(b.original_price, b.price) - calculateDiscount(a.original_price, a.price));
        break;
      case "discountLowToHigh":
        sorted.sort((a, b) => calculateDiscount(a.original_price, a.price) - calculateDiscount(b.original_price, b.price));
        break;
      case "priceLowToHigh":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceHighToLow":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "salesHighToLow":
        sorted.sort((a, b) => b.sales - a.sales);
        break;
      case "newest":
        // 假设id越大越新
        sorted.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  };

  useEffect(() => {
    if (products.length > 0) {
      applySort(products, sortBy);
    }
  }, [sortBy, products]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // 分页切片
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading && products.length === 0) {
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
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <FireOutlined /> {t("shop:hotDeals.title")}
        </Title>
        <Paragraph type="secondary">
          {totalCount} {t("shop:hotDeals.results")}
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 侧边栏排序 */}
        <Col xs={24} md={6}>
          <Card title={<><SortAscendingOutlined /> {t("shop:productList.sort")}</>}>
            <Select
              style={{ width: "100%" }}
              value={sortBy}
              onChange={setSortBy}
            >
              <Option value="discountHighToLow">
                {t("shop:hotDeals.sortBy.discountHighToLow", "折扣从高到低")}
              </Option>
              <Option value="discountLowToHigh">
                {t("shop:hotDeals.sortBy.discountLowToHigh", "折扣从低到高")}
              </Option>
              <Option value="priceLowToHigh">
                {t("shop:productList.sortBy.priceLowToHigh", "价格从低到高")}
              </Option>
              <Option value="priceHighToLow">
                {t("shop:productList.sortBy.priceHighToLow", "价格从高到低")}
              </Option>
              <Option value="salesHighToLow">
                {t("shop:productList.sortBy.salesHighToLow", "销量从高到低")}
              </Option>
              <Option value="newest">
                {t("shop:productList.sortBy.newest", "最新上架")}
              </Option>
            </Select>
          </Card>

          {/* 折扣说明 */}
          <Card style={{ marginTop: "16px" }}>
            <Title level={5}>{t("shop:hotDeals.info")}</Title>
            <Paragraph type="secondary">
              {t("shop:hotDeals.description")}
            </Paragraph>
          </Card>
        </Col>

        {/* 商品列表 */}
        <Col xs={24} md={18}>
          {paginatedProducts.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <Title level={3}>{t("shop:hotDeals.noDeals")}</Title>
              <Paragraph type="secondary">
                {t("shop:hotDeals.noDealsDescription")}
              </Paragraph>
              <Button type="primary" onClick={() => window.location.reload()}>
                {t("common:refresh")}
              </Button>
            </Card>
          ) : (
            <>
              <Row gutter={[16, 24]}>
                {paginatedProducts.map((product) => (
                  <Col xs={12} sm={8} md={6} key={product.id}>
                    <ShopProductCard product={product} />
                  </Col>
                ))}
              </Row>
              
              {/* 分页 */}
              <div style={{ marginTop: "32px", textAlign: "center" }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} / ${total} ${t("shop:hotDeals.results")}`
                  }
                />
              </div>
            </>
          )}
        </Col>
      </Row>
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

DealsPage.displayName = "DealsPage";

export default DealsPage;