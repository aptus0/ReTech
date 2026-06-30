@echo off
title ReTech KeyGen Builder
color 0A

echo ========================================================
echo ReTech KeyGen (LicenseGenerator.cs) Derleyici Basliyor...
echo ========================================================

:: .NET Framework yolunu bul
set "CSC_PATH=%windir%\Microsoft.NET\Framework\v4.0.30319\csc.exe"

if not exist "%CSC_PATH%" (
    echo [HATA] csc.exe bulunamadi. Windows sisteminde .NET Framework 4.0 yuklu degil.
    pause
    exit /b
)

echo [BİLGİ] C# Derleyicisi (csc.exe) bulundu.
echo [BİLGİ] LicenseGenerator.cs derleniyor...

"%CSC_PATH%" /target:exe /out:ReTech_KeyGen.exe LicenseGenerator.cs

if %errorlevel% neq 0 (
    echo [HATA] Derleme sirasinda bir hata olustu!
    pause
    exit /b
)

echo.
echo ========================================================
echo [BASARILI] ReTech_KeyGen.exe basariyla olusturuldu!
echo ========================================================
echo.
pause
