import loglevel from 'loglevel';
import { h, render } from 'preact';
import LogList from './components/loglist.jsx';

function fetchWithTimeout(timeout, url, options) {
  return new Promise((resolve, reject) => {
    setTimeout(reject, timeout);
    fetch(url, options).then(resolve, reject);
  });
}

/*
function fetchWithTimeout(timeout, url, options) {
  return Promise.race([
    fetch(url, options),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    }),
  ]);
}
*/

fetchWithTimeout(1000, '/log', { credentials: 'same-origin' })
  .then(response => response.json())
  .then((data) => {
    const logs = data.logs.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      }
      return 1;
    });
    render(
      <LogList offset={data.offset} connect={data.connect} logs={logs} />,
      document.getElementById('container'),
    );
  })
  .catch((error) => {
    loglevel.getLogger('logs').error(error);
  });
