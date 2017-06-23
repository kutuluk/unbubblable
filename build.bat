@echo off

set MAJOR=0
set MINOR=7
set PATCH=0

set BUILDFILE=build.txt
for /F "delims=" %%i in (%BUILDFILE%) do set BUILD=%%i
set /a BUILD+=1
del %BUILDFILE%
echo %BUILD% >> %BUILDFILE%
set t=%TIME:~0,8%

set VERSIONGOFILE=server\version.go
del %VERSIONGOFILE%
echo package main>> %VERSIONGOFILE%
echo // Версия сборки>> %VERSIONGOFILE%
echo const (>> %VERSIONGOFILE%
echo   VERSION = "%MAJOR%.%MINOR%.%PATCH%">> %VERSIONGOFILE%
echo   BUILD = "%BUILD%">> %VERSIONGOFILE%
echo   BUILD_DATE = "%DATE% %t%">> %VERSIONGOFILE%
echo )>> %VERSIONGOFILE%

set VERSIONJSFILE=client\version.js
del %VERSIONJSFILE%
echo export default {>> %VERSIONJSFILE%
echo   version: '%MAJOR%.%MINOR%.%PATCH%',>> %VERSIONJSFILE%
echo   build: '%BUILD%',>> %VERSIONJSFILE%
echo   date: '%DATE% %t%',>> %VERSIONJSFILE%
echo };>> %VERSIONJSFILE%

@echo on

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

echo Build %BUILD% compiled

cd server
start server.exe
cd ..