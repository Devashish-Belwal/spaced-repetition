@echo off
title Spaced Repetition Flashcards
cd /d "%~dp0"

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Flashcards Spaced Repetition server with Python...
    python server.py
    goto end
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Flashcards Spaced Repetition server with Node.js...
    node server.js
    goto end
)

echo Neither Python nor Node.js found in PATH.
echo Opening index.html directly...
start index.html

:end
pause
