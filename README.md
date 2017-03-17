# Unbubblable
Браузерная Shoot-em-up MMO, вдохновленная [Realm Of The Mad God](http://www.realmofthemadgod.com/).

* Сервер на Golang.
* Клиент на [three.js](https://threejs.org/).
* Коннект по протоколу Websocket посредством [Protobuf](https://developers.google.com/protocol-buffers/).

##Установка

Установить Google Protobuf (скопировать protoc в директорию %GOPATH%/bin)
```
https://github.com/google/protobuf/releases/latest
```

Загрузить репозитории
```
go get github.com/kutuluk/unbubblable

go get -u github.com/golang/protobuf/proto
go get -u github.com/golang/protobuf/protoc-gen-go
```

Установить [node.js](https://nodejs.org)

Запустить в корневой папке:

```
npm install protobufjs -g
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
