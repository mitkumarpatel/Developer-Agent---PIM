import assert from 'node:assert/strict';
import { test } from 'node:test';
import { transformPimProduct } from './transform.js';

test('maps PIM payload to Commerce product and stock item', () => {
  const result = transformPimProduct({
    sku: 'ABC-1',
    name: 'Widget',
    description: 'A widget',
    price: 12.5,
    stock: 3,
    attributes: { color: 'red' },
  });

  assert.equal(result.product.sku, 'ABC-1');
  assert.equal(result.product.name, 'Widget');
  assert.equal(result.stockItem.qty, 3);
  assert.equal(result.stockItem.is_in_stock, true);
  assert.deepEqual(result.product.custom_attributes, [{ attribute_code: 'color', value: 'red' }]);
});
