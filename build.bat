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

call npm run protocol-json-module
call npm run webpack
call npm run style

cd server
start server.exe
cd ..