# start container
#docker run -d --name=unbubblable --restart=always --publish 80:8080/tcp kutuluk/unbubblable:app
docker run  -it --rm --name unbubblable --publish 80:8080/tcp kutuluk/unbubblable:app

