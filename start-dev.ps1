param(
  [int]$ServerPort = 5000,
  [int]$ClientPort = 5173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList @(
  "-NoProfile",
  "-Command",
  "cd `"$root\\server`"; npm run dev"
)

Start-Process powershell -ArgumentList @(
  "-NoProfile",
  "-Command",
  "cd `"$root\\client`"; npm run dev"
)

Start-Sleep -Seconds 2
Start-Process "http://localhost:$ClientPort/login"

