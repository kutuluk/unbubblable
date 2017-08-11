import { h, render, Component } from "preact";

class LogItem extends Component {
  render({ time, source, msg }, state) {
    // Укорачиваем время
    const timeShort = time.slice(11, -4);
    //time = time.slice(11, -1);
    const timeMicro = time.slice(-4, -1);

    // Задаем класс иконки в зависимости от источника
    //let icon = `glyphicon ${source == "client" ? "glyphicon-user" : "glyphicon-hdd"}`;
    let icon = `fa ${source == "client" ? "fa-user-circle-o" : "fa-server"} fa-lg`;

    // Получаем уровень сообщения
    let level = msg.slice(0, msg.indexOf(" "));
    msg = msg.slice(msg.indexOf(" "));

    const levels = {
      TRACE: "info",
      DEBUG: "info",
      INFO: "success",
      WARN: "warning",
      ERROR: "danger"
    };
    // Задаем класс метки уровня в зависимости от уровня сообщения
    let levelClass = `label label-${levels[level]}`;

    // Задаем класс метки времени в зависимости от источника сообщения
    let timeClass = `label label-${source == "client" ? "default" : "primary"}`;

    // Вычленяем имя логгера
    let r = msg.slice(2, msg.indexOf(")"));
    msg = msg.slice(msg.indexOf(")") + 3);

    //msg = msg.replace("\n", "<br />&nbsp;&nbsp;");

    // Вычленяем первую строчку сообщения
    let line = msg.split("\n")[0];

    return (
      <div>
        <samp>
          <span class={timeClass}>{timeShort}<small>.{timeMicro}</small></span>&nbsp;
          <span class={levelClass}><span class={icon} aria-hidden="true" />&nbsp;{r}</span>
          <small>
            &nbsp;{line}
          </small>
        </samp>
      </div>
    );
  }
}

class LogList extends Component {
  render(props, state) {
    return (
      <div>
        <div>Session:{props.session}</div>
        <div>Offset:{props.offset}</div>
        {props.logs.map(log => (
          <LogItem key={log.time + log.source} time={log.time} source={log.source} msg={log.msg} />
        ))}
      </div>
    );
  }
}

function fetchWithTimeout(url, timeout, options) {
  return Promise.race([
    fetch(url, options),
    //new Promise(function(resolve, reject) {
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), timeout);
    })
  ]);
}

/*
let xhr = new XMLHttpRequest();

xhr.open("GET", "http://localhost:8080/log", true);
xhr.send();

xhr.onload = () => {
  let d = JSON.parse(xhr.responseText);
  render(<Log session={d.session} logs={d.logs} />, document.getElementById("container"));
};
*/

fetchWithTimeout("http://localhost:8080/log", 1000, {
  credentials: "same-origin"
})
  .then(response => response.json())
  .then(data => {
    const logs = data.logs.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      }
      return 1;
    });
    render(<LogList offset={data.offset} session={data.session} logs={logs} />, document.getElementById("container"));
  })
  .catch(error => {
    console.log(error);
  });
