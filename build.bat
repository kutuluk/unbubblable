rd server\protocol /q /s

cd proto
protoc --go_out=import_path=protocol:../server ./protocol/*.proto ./protocol/*/*.proto ./protocol/*/*/*.proto
cd ..

cd server

copy protocol\Data\*.* protocol\
copy protocol\Messaging\*.* protocol\
copy protocol\Messaging\Request\*.* protocol\
copy protocol\Messaging\Response\*.* protocol\

go build

cd ..

call pbjs -t static-module -w es6 ./proto/protocol/Messaging/*.proto ./proto/protocol/Messaging/Response/*.proto ./proto/protocol/Messaging/Request/*.proto ./proto/protocol/Data/*.proto ./proto/protocol/protocol.proto -o ./client/protocol.js
call browserify ./client/main.js -o ./public/js/app.js

cd server
start server.exe
::start http://localhost:8080
cd ..