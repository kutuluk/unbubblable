FROM kutuluk/unbubblable:builder

# Компиляция серверной части

RUN git clone https://github.com/kutuluk/unbubblable $GOPATH/src/github.com/kutuluk/unbubblable && \
    go get -u github.com/golang/protobuf/proto && \
    go get -u github.com/gorilla/websocket && \
    go get -u github.com/go-gl/mathgl/mgl64 && \
    cd $GOPATH/src/github.com/kutuluk/unbubblable && \
    protoc --go_out=import_path=protocol:./server ./protocol/*/*.proto ./protocol/*/*/*.proto && \
    cd server && \
    cp -r protocol/Data/*.go protocol/ && \
    cp -r protocol/Messaging/*.go protocol/ && \
    cp -r protocol/Messaging/Request/*.go protocol/ && \
    cp -r protocol/Messaging/Response/*.go protocol/ && \
    cp -r protocol/Messaging/Messages/*.go protocol/ && \
    go build

# Компиляция клиентской части

RUN cd $GOPATH/src/github.com/kutuluk/unbubblable && \
    npm install protobufjs && \
    npm install protobufjs -g && \
    npm install browserify -g && \
    npm install babel-preset-es2015 babelify && \
    pbjs -t static-module -w es6 ./protocol/Messaging/*.proto ./protocol/Messaging/Messages/*.proto ./protocol/Messaging/Response/*.proto ./protocol/Messaging/Request/*.proto ./protocol/Data/*.proto -o ./client/protocol.js && \
    browserify ./client/main.js -o ./public/js/app.js

EXPOSE 8080

WORKDIR $GOPATH/src/github.com/kutuluk/unbubblable/server

ENTRYPOINT ["/go/src/github.com/kutuluk/unbubblable/server/server"]
