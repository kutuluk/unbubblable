/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Version inc
const pjson = `${root}/package.json`;

fs.readFile(pjson, 'utf8', (readErr, data) => {
  if (readErr) {
    console.log(readErr);
  } else {
    try {
      const pkg = JSON.parse(data);
      pkg.build += 1;
      pkg.date = new Date().toISOString();

      const pjsonContent = JSON.stringify(pkg, null, 2);

      fs.writeFile(pjson, pjsonContent, 'utf8', (err) => {
        console.log(err || `Build ${pkg.build} started`);
      });
    } catch (err) {
      console.log(err);
    }
  }
});
