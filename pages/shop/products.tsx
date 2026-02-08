import { useState } from "react";
import { Row, Col, Card, Typography, Spin, Alert, Slider, Select, Button, InputNumber, Pagination } from "antd";
import { FilterOutlined, SortAscendingOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ShopLayout from "../../client/layout/shop-layout";
import ShopProductCard from "@/components/ShopProductCard";
import { getProductService } from "@/service/product/manage";
import { getCategoryService } from "@/service/category/manage";


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

interface Category {
  id: number;
  name: string;
  product_count: number;
}

interface ProductListPageProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialTotalCount: number;
}

const ProductListPage = ({ initialProducts, initialCategories, initialTotalCount }: ProductListPageProps) => {
  const { t } = useTranslation(["shop", "common"]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("default");

  // 获取商品数据（用于翻页和筛选）
  const fetchProducts = async (page: number, size: number) => {
    try {
      setLoading(true);
      const productResponse = await getProductService(page - 1, size);
      if (productResponse?.data?.product) {
        setProducts(productResponse.data.product.items || []);
        setTotalCount(productResponse.data.product.totalCounts || 0);
      }
    } catch (err: any) {
      console.error("获取数据失败:", err);
      setError(err.message || "未知错误");
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  const applyFilters = () => {
    // TODO: 实现筛选逻辑，调用带筛选条件的API
    console.log("应用筛选:", { selectedCategory, priceRange, sortBy });
    fetchProducts(currentPage, pageSize);
  };

  // 清除筛选
  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 10000]);
    setSortBy("default");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    const newPageSize = size || pageSize;
    if (size) setPageSize(newPageSize);
    fetchProducts(page, newPageSize);
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
        <Title level={2}>{t("shop:productList.title")}</Title>
        <Paragraph type="secondary">
          {totalCount} {t("shop:productList.results")}
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 侧边栏筛选 */}
        <Col xs={24} md={6}>
          <Card
            title={
              <>
                <FilterOutlined /> {t("shop:productList.filter")}
              </>
            }
            style={{ marginBottom: "24px" }}
          >
            {/* 分类筛选 */}
            <div style={{ marginBottom: "24px" }}>
              <Title level={5}>{t("shop:productList.category")}</Title>
              <Select
                style={{ width: "100%" }}
                placeholder={t("shop:productList.category")}
                value={selectedCategory}
                onChange={setSelectedCategory}
                allowClear
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name} ({category.product_count || 0})
                  </Option>
                ))}
              </Select>
            </div>

            {/* 价格区间筛选 */}
            <div style={{ marginBottom: "24px" }}>
              <Title level={5}>{t("shop:productList.priceRange")}</Title>
              <div style={{ marginBottom: "16px" }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <InputNumber
                      style={{ width: "100%" }}
                      value={priceRange[0]}
                      onChange={(value) => setPriceRange([value || 0, priceRange[1]])}
                      min={0}
                      max={10000}
                      prefix="¥"
                    />
                  </Col>
                  <Col span={12}>
                    <InputNumber
                      style={{ width: "100%" }}
                      value={priceRange[1]}
                      onChange={(value) => setPriceRange([priceRange[0], value || 10000])}
                      min={0}
                      max={10000}
                      prefix="¥"
                    />
                  </Col>
                </Row>
              </div>
              <Slider
                range
                min={0}
                max={10000}
                value={priceRange}
                onChange={(value) => setPriceRange(value as [number, number])}
                step={100}
              />
            </div>

            {/* 操作按钮 */}
            <Row gutter={8}>
              <Col span={12}>
                <Button type="primary" block onClick={applyFilters}>
                  {t("shop:productList.apply")}
                </Button>
              </Col>
              <Col span={12}>
                <Button block onClick={clearFilters}>
                  {t("shop:productList.clear")}
                </Button>
              </Col>
            </Row>
          </Card>

          {/* 排序选项 */}
          <Card title={<SortAscendingOutlined /> + " " + t("shop:productList.sort")}>
            <Select
              style={{ width: "100%" }}
              value={sortBy}
              onChange={setSortBy}
            >
              <Option value="default">{t("shop:productList.sortBy.default")}</Option>
              <Option value="priceLowToHigh">{t("shop:productList.sortBy.priceLowToHigh")}</Option>
              <Option value="priceHighToLow">{t("shop:productList.sortBy.priceHighToLow")}</Option>
              <Option value="salesHighToLow">{t("shop:productList.sortBy.salesHighToLow")}</Option>
              <Option value="newest">{t("shop:productList.sortBy.newest")}</Option>
            </Select>
          </Card>
        </Col>

        {/* 商品列表 */}
        <Col xs={24} md={18}>
          {products.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <Title level={3}>{t("shop:productList.noProducts")}</Title>
              <Paragraph type="secondary">
                {t("shop:productList.noProducts")}。请尝试调整筛选条件。
              </Paragraph>
              <Button type="primary" onClick={clearFilters}>
                {t("shop:productList.clear")}
              </Button>
            </Card>
          ) : (
            <>
              <Row gutter={[16, 24]}>
                {products.map((product) => (
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
                    `${range[0]}-${range[1]} / ${total} 件商品`
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

  // 在服务端获取初始数据
  let initialProducts: Product[] = [];
  let initialCategories: Category[] = [];
  let initialTotalCount = 0;

  try {
    // 获取商品分类
    const categoryResponse = await getCategoryService(0, 50);
    if (categoryResponse?.data?.category?.items) {
      initialCategories = categoryResponse.data.category.items;
    }

    // 获取商品列表（第一页）
    const productResponse = await getProductService(0, 12);
    if (productResponse?.data?.product) {
      initialProducts = productResponse.data.product.items || [];
      initialTotalCount = productResponse.data.product.totalCounts || 0;
    }
  } catch (error) {
    console.error("服务端获取数据失败:", error);
  }

  return {
    props: {
      ...(await serverSideTranslations(currentLocale, ["common", "shop", "layout"], i18nConfig)),
      initialProducts,
      initialCategories,
      initialTotalCount,
    },
  };
};

ProductListPage.displayName = "ProductListPage";

export default ProductListPage;