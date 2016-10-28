protoc --go_out=./server ./proto/*.proto
cd server
go build
cd ..
browserify ./client/main.js -o ./public/js/app.js
