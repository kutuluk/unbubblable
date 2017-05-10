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

call yarn run protocol
call yarn run webpack

cd server
start server.exe
cd ..