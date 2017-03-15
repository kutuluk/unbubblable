protoc --go_out=./server ./proto/*.proto

cd proto
protoc --go_out=../server UnProtos/Data/*.proto
protoc --go_out=../server UnProtos/Messaging/*.proto
protoc --go_out=../server UnProtos/Messaging/Requests/*.proto
protoc --go_out=../server UnProtos/Messaging/Responses/*.proto
cd ..

cd server
go build
cd ..

copy .\proto\protocol.proto .\public\js\protocol.proto
call pbjs -t json ./proto/UnProtos/Data/* ./proto/UnProtos/Messaging/* ./proto/UnProtos/Messaging/Requests/* ./proto/UnProtos/Messaging/Responses/* -o ./public/js/protocol.json
call pbjs -t static-module -w es6 ./proto/UnProtos/Data/* ./proto/UnProtos/Messaging/* ./proto/UnProtos/Messaging/Requests/* ./proto/UnProtos/Messaging/Responses/* -o ./client/protocol.js
call browserify ./client/main.js -o ./public/js/app.js
