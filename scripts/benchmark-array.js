const { performance } = require('perf_hooks');

function runBenchmark() {
  const ITERATIONS = 10_000_000;

  // Baseline: Creating array every time
  let start = performance.now();
  let dummy = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    const arr = [...Array(6)];
    dummy += arr.length;
  }
  let end = performance.now();
  const baselineTime = end - start;

  // Optimized: Using static array
  const staticArr = Array.from({ length: 6 });
  start = performance.now();
  dummy = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    const arr = staticArr;
    dummy += arr.length;
  }
  end = performance.now();
  const optimizedTime = end - start;

  console.log(`--- Benchmark Results (${ITERATIONS} iterations) ---`);
  console.log(`Baseline ([...Array(6)]): ${baselineTime.toFixed(2)} ms`);
  console.log(`Optimized (static array): ${optimizedTime.toFixed(2)} ms`);
  console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}% faster`);
}

runBenchmark();
