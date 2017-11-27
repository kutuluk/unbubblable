/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Version
const pjson = `${root}/package.json`;
const js = `${root}/client/version.js`;
const go = `${root}/server/version.go`;

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

      let jsContent = 'export default {\n';
      jsContent += `  version: '${pkg.version}',\n`;
      jsContent += `  build: ${pkg.build},\n`;
      jsContent += `  date: '${pkg.date}',\n`;
      jsContent += '};\n';

      fs.writeFile(js, jsContent, 'utf8', (err) => {
        if (err) console.log(err);
      });

      let goContent = 'package main\n';
      goContent += '// Версия сборки\n';
      goContent += 'const (\n';
      goContent += `  VERSION = "${pkg.version}"\n`;
      goContent += `  BUILD = "${pkg.build}"\n`;
      goContent += `  DATE = "${pkg.date}"\n`;
      goContent += ')\n';

      fs.writeFile(go, goContent, 'utf8', (err) => {
        if (err) console.log(err);
      });
    } catch (err) {
      console.log(err);
    }
  }
});
