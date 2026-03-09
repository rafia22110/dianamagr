const { performance } = require('perf_hooks');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchLinks() {
  await sleep(100);
  return [];
}

async function fetchGallery() {
  await sleep(100);
  return [];
}

async function fetchHero() {
  await sleep(100);
  return {};
}

async function fetchBook() {
  await sleep(100);
  return {};
}

async function HomePage_Waterfall() {
  await Promise.all([
    fetchHero(),
    fetchBook(),
    fetchGallery()
  ]);

  await fetchLinks();
}

async function HomePage_Parallel() {
  await Promise.all([
    fetchHero(),
    fetchBook(),
    fetchGallery(),
    fetchLinks()
  ]);
}

async function run() {
  let start = performance.now();
  await HomePage_Waterfall();
  const waterfallTime = performance.now() - start;
  console.log(`Waterfall: ${waterfallTime.toFixed(2)}ms`);

  start = performance.now();
  await HomePage_Parallel();
  const parallelTime = performance.now() - start;
  console.log(`Parallel: ${parallelTime.toFixed(2)}ms`);
}

run();
