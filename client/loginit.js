import loglevel from 'loglevel';
// import prefix from 'loglevel-plugin-prefix';
import remote from 'loglevel-plugin-remote';

import time from './time';

loglevel.enableAll(false);
// loglevel.setLevel('warn', false);
// loglevel.setLevel('info', false);

remote.apply(loglevel, {
  token: undefined,
  timestamp: () => time.iso(),
  format(log) {
    // eslint-disable-next-line no-param-reassign
    log.level = log.level.value;
    return log;
  },
});

/*
prefix.apply(loglevel, {
  template: '[%t] %l (%n):',
  // timestampFormatter: date => date.toISOString(),
  timestampFormatter: () => time.iso(),
});
*/
