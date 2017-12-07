FROM kutuluk/unbubblable:buildpack as builder

WORKDIR $GOPATH/src/github.com/kutuluk
RUN git clone https://github.com/kutuluk/unbubblable \
    && cd unbubblable \
    && npm install \
    && npm run pbuild \
    && go get -d github.com/kutuluk/unbubblable/server \
    && npm run build

FROM debian:stretch
WORKDIR /app/server
COPY --from=builder /go/src/github.com/kutuluk/unbubblable/server/server .
#COPY --from=builder /go/src/github.com/kutuluk/unbubblable/server/data ./data
COPY --from=builder /go/src/github.com/kutuluk/unbubblable/public ../public

RUN mkdir data

EXPOSE 8080

ENTRYPOINT ./server

