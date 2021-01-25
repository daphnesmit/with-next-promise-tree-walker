const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  'with-next-promise-tree-walker',
]);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins(
  [
    withTM,
    withBundleAnalyzer,
  ]
);
