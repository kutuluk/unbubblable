/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pjson = path.resolve(root, 'package.json');

fs.readFile(pjson, 'utf8', (readErr, data) => {
  if (readErr) {
    console.log(readErr);
  } else {
    try {
      const pkg = JSON.parse(data);
      console.log(`Build ${pkg.build} успешно скомпилирован`);
    } catch (error) {
      console.log(error);
    }
  }
});
