import { h, Component } from 'preact';

class LogItem extends Component {
  render({ log }) {
    const { time, source, body } = log;

    // time = time.slice(11, -1);
    // const date = time.slice(0, 9);

    // Укорачиваем время
    const timeShort = time.slice(11, -4);
    const timeMicro = time.slice(-4, -1);

    // Задаем класс иконки в зависимости от источника
    const icon = `fa ${source === 'client' ? 'fa-user-circle-o' : 'fa-server'} fa-lg`;

    // Задаем класс метки уровня в зависимости от уровня сообщения
    const levelClasses = ['info', 'info', 'success', 'warning', 'danger'];
    const levelClass = `label label-${levelClasses[body.level]}`;

    // Задаем класс метки времени в зависимости от источника сообщения
    const timeClass = `label label-${source === 'client' ? 'default' : 'primary'}`;

    return (
      <div>
        <samp>
          <span class={timeClass}>{timeShort}<small>.{timeMicro}</small></span>&nbsp;
          <span class={levelClass}>
            <span class={icon} aria-hidden="true" />&nbsp;{body.logger}
          </span>
          <small>
            &nbsp;{body.text}
          </small>
        </samp>
      </div>
    );
  }
}

export default class LogList extends Component {
  render({ connect, offset, logs }) {
    return (
      <div>
        <div>Connect:{connect}</div>
        <div>Offset:{offset}</div>
        {logs.map(log => <LogItem key={log.time + log.source} log={log} />)}
      </div>
    );
  }
}
