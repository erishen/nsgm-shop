import { Card, Typography, Button, Badge } from "antd";
import { ShoppingCartOutlined, StarOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const { Meta } = Card;
const { Text, Paragraph } = Typography;

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

interface ShopProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  size?: "small" | "medium" | "large";
}

const ShopProductCard: React.FC<ShopProductCardProps> = ({
  product,
  showAddToCart = true,
  size = "medium",
}) => {
  const { t } = useTranslation(["shop", "common"]);
  
  const cardHeight = size === "small" ? 280 : size === "large" ? 400 : 320;
  const imageHeight = size === "small" ? 120 : size === "large" ? 220 : 150;
  
  const discountPercentage = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  
  const isOutOfStock = product.stock <= 0;
  
  return (
    <Badge.Ribbon
      text={`${discountPercentage}% OFF`}
      color="red"
      style={{ display: discountPercentage > 0 ? "block" : "none" }}
    >
      <Card
        hoverable
        style={{
          height: cardHeight,
          overflow: "hidden",
          position: "relative",
          border: isOutOfStock ? "1px solid #ff4d4f" : "1px solid #f0f0f0",
        }}
        cover={
          <div style={{ position: "relative" }}>
            <Link href={`/shop/product/${product.id}`}>
              <div
                style={{
                  height: imageHeight,
                  overflow: "hidden",
                  background: "#f5f5f5",
                }}
              >
                <img
                  src={product.image_url || "/images/placeholder.jpg"}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </div>
            </Link>
            {isOutOfStock && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text strong style={{ color: "white", fontSize: "18px" }}>
                  {t("shop:product.outOfStock")}
                </Text>
              </div>
            )}
          </div>
        }
      >
        <Meta
          title={
            <Link href={`/shop/product/${product.id}`}>
              <Paragraph
                ellipsis={{ rows: 1 }}
                style={{ margin: 0, fontSize: size === "small" ? "14px" : "16px" }}
              >
                {product.name}
              </Paragraph>
            </Link>
          }
          description={
            <div>
              {/* 价格区域 */}
              <div style={{ marginBottom: "8px" }}>
                <Text
                  strong
                  style={{
                    color: discountPercentage > 0 ? "#ff4d4f" : "#333",
                    fontSize: size === "small" ? "16px" : "18px",
                  }}
                >
                  ¥{product.price}
                </Text>
                {discountPercentage > 0 && (
                  <Text
                    delete
                    style={{
                      marginLeft: "8px",
                      color: "#999",
                      fontSize: size === "small" ? "12px" : "14px",
                    }}
                  >
                    ¥{product.original_price}
                  </Text>
                )}
              </div>
              
              {/* 销量和库存 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                <div>
                  <StarOutlined style={{ color: "#faad14", marginRight: "4px" }} />
                  <Text type="secondary">{product.sales || 0} {t("shop:product.sales")}</Text>
                </div>
                {product.stock > 0 && (
                  <div>
                    <Text type="secondary">
                      {t("shop:product.inStock")}: {product.stock}
                    </Text>
                  </div>
                )}
              </div>
              
              {/* 加入购物车按钮 */}
              {showAddToCart && !isOutOfStock && (
                <div style={{ marginTop: "12px" }}>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    block
                    size={size === "small" ? "small" : "middle"}
                    onClick={() => {
                      // TODO: 实现加入购物车逻辑
                      console.log("加入购物车:", product.id);
                    }}
                    style={{
                      background: discountPercentage > 0 ? "#ff4d4f" : "#1890ff",
                      borderColor: discountPercentage > 0 ? "#ff4d4f" : "#1890ff",
                    }}
                  >
                    {t("shop:product.addToCart")}
                  </Button>
                </div>
              )}
              
              {showAddToCart && isOutOfStock && (
                <div style={{ marginTop: "12px" }}>
                  <Button
                    type="default"
                    block
                    size={size === "small" ? "small" : "middle"}
                    disabled
                  >
                    {t("shop:product.outOfStock")}
                  </Button>
                </div>
              )}
            </div>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default ShopProductCard;