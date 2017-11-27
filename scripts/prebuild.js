/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const exec = require('child_process').exec;

const root = path.resolve(__dirname, '..');

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
