::cd proto
::protoc --go_out=../server *.proto
::cd ..

::cd proto
::protoc --go_out=../server UnProtos/Data/*.proto
::protoc --go_out=../server UnProtos/Messaging/*.proto
::protoc --go_out=../server UnProtos/Messaging/Requests/*.proto
::protoc --go_out=../server UnProtos/Messaging/Responses/*.proto
::cd ..

cd proto
protoc --go_out=import_prefix=github.com/kutuluk/unbubblable/server/:../server ./protocol/*.proto
protoc --go_out=import_prefix=github.com/kutuluk/unbubblable/server/:../server ./protocol/**/*.proto
call replace-in-file "github.com/kutuluk/unbubblable/server/github.com/golang/protobuf/proto" "github.com/golang/protobuf/proto" ../server/protocol/*.go
call replace-in-file "github.com/kutuluk/unbubblable/server/github.com/golang/protobuf/proto" "github.com/golang/protobuf/proto" ../server/protocol/**/*.go
cd ..

cd server
go build
cd ..

::call pbjs -t json ./proto/UnProtos/Data/* ./proto/UnProtos/Messaging/* ./proto/UnProtos/Messaging/Requests/* ./proto/UnProtos/Messaging/Responses/* -o ./public/js/Unprotos.json
::call pbjs -t static-module -w es6 ./proto/UnProtos/Data/* ./proto/UnProtos/Messaging/* ./proto/UnProtos/Messaging/Requests/* ./proto/UnProtos/Messaging/Responses/* -o ./client/Unprotos.js

::copy .\proto\protocol.proto .\public\js\protocol.proto
::call pbjs -t static-module -w es6 ./proto/protocol.proto ./proto/vec3.proto -o ./client/protocol.js
call pbjs -t static-module -w es6 ./proto/protocol/protocol.proto ./proto/protocol/Data/Vec3.proto -o ./client/protocol.js
call browserify ./client/main.js -o ./public/js/app.js

cd server
start server.exe
::start http://localhost:8080
cd ..