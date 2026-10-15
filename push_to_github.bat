@echo off
title Snippets Hub - GitHub Push
cd /d "%~dp0"
cls
echo ========================================================
echo   Snippets Hub - Pushing to GitHub
echo ========================================================
echo Repository: https://github.com/Digraj-asthana/Snippets-Hub.git
echo Branch:     main
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS! All project files pushed to GitHub.
    echo ========================================================
) else (
    echo ========================================================
    echo   Authentication or push failed (Error code %ERRORLEVEL%).
    echo   If prompted, sign in via browser or personal access token.
    echo ========================================================
)
echo.
pause
