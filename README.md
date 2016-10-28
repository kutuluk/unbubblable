# Unbubblable
Браузерная Shoot-em-up MMO, вдохновленная [Realm Of The Mad God](http://www.realmofthemadgod.com/).

Серверная часть на Golang.

Клиентская часть на [three.js](https://threejs.org/).

Соединение между клиентом и сервером по протоколу Websocket посредством [Protobuf](https://developers.google.com/protocol-buffers/).

##Установка

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
copy ./proto/protocol.proto ./public/js/protocol.proto
browserify ./client/main.js -o ./public/js/app.js
```
