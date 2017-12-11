/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Version inc
const pjson = `${root}/package.json`;

try {
  const pkg = JSON.parse(fs.readFileSync(pjson, 'utf8'));

  pkg.build += 1;
  pkg.version = `0.8.${pkg.build}`;
  pkg.date = new Date().toISOString();
  const pjsonContent = JSON.stringify(pkg, null, 2);

  fs.writeFileSync(pjson, pjsonContent);
  console.log(`Build ${pkg.build} started`);
} catch (err) {
  console.log(err);
  process.exit(1);
}
