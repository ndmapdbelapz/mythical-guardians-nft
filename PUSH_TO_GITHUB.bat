@echo off
cd /d "%~dp0"
echo ===================================================
echo Pushing Mythical Guardians NFT to GitHub...
echo Target: https://github.com/ndmapdbelapz/mythical-guardians-nft
echo ===================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Repository successfully pushed to GitHub!
) else (
    echo [NOTE] If the repository does not exist yet, make sure you created
    echo 'mythical-guardians-nft' as a Public repository at https://github.com/new
)
echo.
pause
