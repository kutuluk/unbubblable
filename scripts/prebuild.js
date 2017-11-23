/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const exec = require('child_process').execFile;

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

// Remove
fs.removeSync(`${root}/server/protocol`);
fs.removeSync(`${root}/server/server.exe`);

// Protoc
const dest = path.resolve(root, './server/protocol');
fs.ensureDirSync(dest);

const args = [
  '--go_out=import_path=protocol:./server',
  './protocol/*/*.proto',
  './protocol/*/*/*.proto',
];

exec('protoc', args, (errExec) => {
  if (errExec) {
    console.log(errExec);
  } else {
    glob(`${root}/server/protocol/*`, {}, (errDel, dels) => {
      if (errDel) {
        console.log(errDel);
      } else {
        glob(`${root}/server/protocol/**/*.*`, {}, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            files.forEach((file) => {
              fs.copySync(file, `${root}/server/protocol/${path.basename(file)}`);
            });
            dels.forEach((dir) => {
              fs.removeSync(dir);
            });
          }
        });
      }
    });
  }
});
