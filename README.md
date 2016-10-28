# Unbubblable
Браузерная Shoot-em-up MMO, вдохновленная [Realm Of The Mad God](http://www.realmofthemadgod.com/).

* Сервер на Golang.
* Клиент на [three.js](https://threejs.org/).
* Коннект по протоколу Websocket посредством [Protobuf](https://developers.google.com/protocol-buffers/).

##Установка

Загрузить репозиторий
```
go get github.com/kutuluk/unbubblable
```

Установить [node.js](https://nodejs.org)

Запустить в корневой папке:

```
npm install --global browserify
npm install --save-dev babel-cli babel-preset-es2015 babelify
```

Сборка из корня:

```
protoc --go_out=./server ./proto/*.proto
cd server
go build
cd ..
copy .\proto\protocol.proto .\public\js\protocol.proto
browserify ./client/main.js -o ./public/js/app.js
```
