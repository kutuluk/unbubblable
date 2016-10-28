protoc --go_out=./server ./proto/*.proto
cd server
go build
cd ..
copy .\proto\protocol.proto .\public\js\protocol.proto
browserify ./client/main.js -o ./public/js/app.js
