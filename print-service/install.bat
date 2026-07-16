@echo off
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Bu kurulum dosyasini Yonetici olarak calistirmalisiniz. Lutfen sag tiklayip "Yonetici Olarak Calistir" deyin.
    pause
    exit /b
)

set SERVICE_NAME=EnvanzoPrintService
set INSTALL_DIR=C:\EnvanzoPrintService

echo Kurulum Basliyor...

if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
)

echo Dosyalar kopyalaniyor...
copy /Y "EnvanzoPrintService.exe" "%INSTALL_DIR%\EnvanzoPrintService.exe"

echo Servis durduruluyor ve siliniyor (Varsa)...
sc stop "%SERVICE_NAME%"
sc delete "%SERVICE_NAME%"

echo Servis yukleniyor...
sc create "%SERVICE_NAME%" binPath= "%INSTALL_DIR%\EnvanzoPrintService.exe" start= auto

echo Servis baslatiliyor...
sc start "%SERVICE_NAME%"

echo Kurulum Tamamlandi! Envanzo Print Service artik arka planda calisiyor.
pause
