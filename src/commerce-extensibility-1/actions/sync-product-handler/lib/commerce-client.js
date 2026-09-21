export function createCommerceClient({ apiClient }) {
  return {
    async saveProduct(product) {
      return apiClient.put(`/V1/products/${encodeURIComponent(product.sku)}`, { product });
    },
    async saveStockItem(stockItem) {
      return apiClient.put(`/V1/products/${encodeURIComponent(stockItem.sku)}/stockItems/1`, { stockItem });
    },
  };
}
