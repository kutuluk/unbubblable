/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pjson = path.resolve(root, 'package.json');

try {
  const pkg = JSON.parse(fs.readFileSync(pjson, 'utf8'));
  console.log(`Build ${pkg.build} успешно скомпилирован`);
} catch (err) {
  console.log(err);
  process.exit(1);
}
