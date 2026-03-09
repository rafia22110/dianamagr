const { performance } = require('perf_hooks');

const items = Array.from({ length: 24 }, (_, i) => ({
  storage_path: `path/to/image_${i}.jpg`
}));

const baseUrl = "https://example.com";

function testInterpolation() {
  const start = performance.now();
  for (let iter = 0; iter < 100000; iter++) {
    const result = items.map(img => ({
      ...img,
      url: img.storage_path ? `${baseUrl}/api/storage/buckets/diana-images/objects/${encodeURIComponent(img.storage_path)}` : undefined
    }));
  }
  const end = performance.now();
  return end - start;
}

function testConcatenation() {
  const start = performance.now();
  for (let iter = 0; iter < 100000; iter++) {
    const prefix = `${baseUrl}/api/storage/buckets/diana-images/objects/`;
    const result = items.map(img => ({
      ...img,
      url: img.storage_path ? prefix + encodeURIComponent(img.storage_path) : undefined
    }));
  }
  const end = performance.now();
  return end - start;
}

const time1 = testInterpolation();
const time2 = testConcatenation();

console.log(`Interpolation: ${time1.toFixed(2)}ms`);
console.log(`Concatenation: ${time2.toFixed(2)}ms`);
