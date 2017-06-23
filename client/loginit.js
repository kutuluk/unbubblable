import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import remote from 'loglevel-plugin-remote';

loglevel.enableAll();

remote.apply(loglevel, { clear: 2 });

prefix.apply(loglevel, {
  template: '[%t] %l (%n):',
});

// prefix(loglevel);
// loglevel.error('prefixed message');
