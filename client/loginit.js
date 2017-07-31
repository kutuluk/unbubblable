import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import remote from 'loglevel-plugin-remote';

// https://learn.javascript.ru/cookie
// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

loglevel.enableAll();

remote.apply(loglevel, { clear: 2 });

const session = getCookie('session');

prefix.apply(loglevel, {
  template: `<${session}> [%t] %l (%n):`,
  timestampFormatter: date => date.toISOString(),
});

export default session;
