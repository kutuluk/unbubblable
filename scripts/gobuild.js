/* eslint-disable no-console */

const path = require('path');
const exec = require('child_process').execFile;

const root = path.resolve(__dirname, '..');

exec('go', ['build'], { cwd: path.resolve(root, './server') }, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
