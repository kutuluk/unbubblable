rd server\protocol /q /s

protoc --go_out=import_path=protocol:./server ./protocol/*/*.proto ./protocol/*/*/*.proto

cd server

del server.exe

copy protocol\Data\*.* protocol\
copy protocol\Messaging\*.* protocol\
copy protocol\Messaging\Request\*.* protocol\
copy protocol\Messaging\Response\*.* protocol\
copy protocol\Messaging\Messages\*.* protocol\

go build

cd ..

call pbjs -t static-module -w es6 ./protocol/Messaging/*.proto ./protocol/Messaging/Messages/*.proto ./protocol/Messaging/Response/*.proto ./protocol/Messaging/Request/*.proto ./protocol/Data/*.proto -o ./client/protocol.js
call browserify ./client/main.js -o ./public/js/app.js

cd server
start server.exe
::start http://localhost:8080
cd ..