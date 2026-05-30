# open_command_screen.ps1
# Opens the FBIVAN Command Grid in a new Chrome window on Display 1 (TV, X=0,Y=0, 1920x1080)
# Does NOT kill existing Chrome windows — just opens a new one on the TV.

$URL = "http://localhost:8123/local/ha-launch.html"
$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# --new-window          : forces a new window (not a tab in existing Chrome)
# --window-position=0,0 : places the window at top-left of Display 1 (TV)
# --window-size=1920,1080 : sets initial size to full 1080p
# --start-maximized     : maximizes the window on that display
# --app                 : strips Chrome UI (address bar, tabs) for kiosk-like look
#                         Remove --app if you want normal Chrome chrome

Start-Process -FilePath $ChromePath -ArgumentList @(
    "--new-window",
    "--window-position=0,0",
    "--window-size=1920,1080",
    "--start-maximized",
    $URL
)
