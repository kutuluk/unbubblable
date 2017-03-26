FROM buildpack-deps:jessie-scm

# Установка Golang

ENV GOLANG_VERSION 1.8
ENV GOLANG_DOWNLOAD_URL https://golang.org/dl/go$GOLANG_VERSION.linux-amd64.tar.gz
ENV GOLANG_DOWNLOAD_SHA256 53ab94104ee3923e228a2cb2116e5e462ad3ebaeea06ff04463479d7f12d27ca
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

RUN curl -fsSL "$GOLANG_DOWNLOAD_URL" -o golang.tar.gz && \
    echo "$GOLANG_DOWNLOAD_SHA256  golang.tar.gz" | sha256sum -c - && \
    tar -C /usr/local -xzf golang.tar.gz && \
    rm golang.tar.gz && \
    mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

# Установка Google Protobuf

ENV PROTOBUF_VERSION=3.2.0
ENV PROTOBUF_DOWNLOAD_URL https://github.com/google/protobuf/archive/v${PROTOBUF_VERSION}.tar.gz

RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf \
    automake \
    libtool \
    curl \
    make \
    g++ \
    unzip \
    && rm -rf /var/lib/apt/lists/* && \
    curl -L $PROTOBUF_DOWNLOAD_URL | tar xz && \
    cd /protobuf-${PROTOBUF_VERSION} && \
            ./autogen.sh && \
            ./configure --prefix=/usr && \
            make && \
            make check && \
            make install && \
            ldconfig && \
    cd .. && \
    rm -rf ./protobuf-${PROTOBUF_VERSION} && \
    go get -ldflags "-w -s" github.com/golang/protobuf/protoc-gen-go && \
    install -c $GOPATH/bin/* /usr/bin/ && \
    rm -rf $GOPATH/bin/*

# Установка node.js

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 7.7.4

RUN apt-get update && apt-get install -y --no-install-recommends \
        xz-utils \
        && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# gpg keys listed at https://github.com/nodejs/node#release-team
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs
