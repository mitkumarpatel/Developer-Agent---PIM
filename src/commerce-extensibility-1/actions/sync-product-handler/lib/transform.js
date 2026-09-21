export function transformPimProduct(payload) {
  const product = {
    sku: payload.sku,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    custom_attributes: Array.isArray(payload.attributes)
      ? payload.attributes
      : Object.entries(payload.attributes || {}).map(([attribute_code, value]) => ({ attribute_code, value })),
  };

  const stockItem = {
    sku: payload.sku,
    qty: payload.stock,
    is_in_stock: Number(payload.stock) > 0,
  };

  return { product, stockItem };
}
