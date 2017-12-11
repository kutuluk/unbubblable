/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const exec = require('child_process').exec;

const root = path.resolve(__dirname, '..');

// Version generate
const pjson = `${root}/package.json`;
const js = `${root}/client/version.js`;
const go = `${root}/server/version.go`;
const df = `${root}/docker/app/Dockerfile`;

try {
  const pkg = JSON.parse(fs.readFileSync(pjson, 'utf8'));

  let jsContent = 'export default {\n';
  jsContent += `  version: '${pkg.version}',\n`;
  jsContent += `  build: ${pkg.build},\n`;
  jsContent += `  date: '${pkg.date}',\n`;
  jsContent += '};\n';
  fs.writeFileSync(js, jsContent);

  let goContent = 'package main\n';
  goContent += '// Версия сборки\n';
  goContent += 'const (\n';
  goContent += `  VERSION = "${pkg.version}"\n`;
  goContent += `  BUILD = "${pkg.build}"\n`;
  goContent += `  DATE = "${pkg.date}"\n`;
  goContent += ')\n';
  fs.writeFileSync(go, goContent);

  const dfContent = fs
    .readFileSync(df, 'utf8')
    .split('\n')
    .map(line => line.replace(/(ENV BUILD )\d+/, `$1${pkg.build}`))
    .join('\n');
  fs.writeFileSync(df, dfContent);
} catch (err) {
  console.log(err);
  process.exit(1);
}

// Remove
fs.removeSync(`${root}/server/protocol`);
fs.removeSync(`${root}/server/server.exe`);

// Protoc
const dest = path.resolve(root, './server/protocol');
fs.ensureDirSync(dest);

const cmd =
  'protoc --go_out=import_path=protocol:./server ./protocol/*/*.proto ./protocol/*/*/*.proto';

exec(cmd, { cwd: root }, (errExec) => {
  if (errExec) {
    console.log(errExec);
    process.exit(1);
  } else {
    glob(`${root}/server/protocol/*`, {}, (errDel, dels) => {
      if (errDel) {
        console.log(errDel);
        process.exit(1);
      } else {
        glob(`${root}/server/protocol/**/*.*`, {}, (err, files) => {
          if (err) {
            console.log(err);
            process.exit(1);
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
