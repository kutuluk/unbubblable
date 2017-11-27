FROM kutuluk/unbubblable:buildpack as builder

WORKDIR $GOPATH/src/github.com/kutuluk
RUN git clone https://github.com/kutuluk/unbubblable \
    && cd unbubblable \
    && npm install \
    && npm run pbuild \
    && go get -d github.com/kutuluk/unbubblable/server \
    && npm run build

FROM alpine:latest
WORKDIR /app
COPY --from=builder /go/src/github.com/kutuluk/unbubblable/server .
COPY --from=builder /go/src/github.com/kutuluk/unbubblable/public .
WORKDIR server

EXPOSE 8080

ENTRYPOINT ["./server"]