# Keychron Launcher DOM Provider

`ChromeKeychronLauncherDomProvider` は、すでに開かれている Keychron Launcher のタブを Chrome DevTools Protocol 経由で監視する Provider です。

## CDP が必要な理由

通常の Windows デスクトップアプリは、普通に起動した Chrome タブの DOM を直接読むことができません。

`https://launcher.keychron.com/` の DOM を観測するには、Chrome 側でローカルの DevTools エンドポイントを公開する必要があります。

Chrome を remote debugging 有効で起動します。

```powershell
& "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="$env:LOCALAPPDATA\NapeNotifyChromeProfile"
```

その Chrome ウィンドウで Keychron Launcher を開き、Nape Pro に接続してください。

```text
https://launcher.keychron.com/#/trackball/key
```

Provider は以下のエンドポイントから Keychron Launcher のタブを探します。

```text
http://127.0.0.1:9222/json
```

ポートを変えたい場合は、環境変数で指定できます。

```powershell
$env:NAPE_NOTIFY_CHROME_DEBUG_PORT = "9223"
```

## 取得する状態

Layer:

```js
document.querySelector(
  '.layer-list li.active.selected, .layer-list li.selected, .layer-list li.active'
)?.textContent?.trim()
```

Angle は、角度ポップアップが開いている場合は以下を優先します。

```js
document.querySelector('.gear-list li.active')?.textContent?.trim()
```

角度ポップアップが閉じている場合は、トラックボール画像の回転角をフォールバックとして使います。

```js
document
  .querySelector('.diagrams-mask img')
  ?.getAttribute('style')
  ?.match(/rotate\(([-0-9.]+)deg\)/i)
```

## フォールバック挙動

アプリ起動時、Nape Notify はまず `ChromeKeychronLauncherDomProvider` を試します。

短時間内に Chrome CDP または Keychron Launcher のタブが見つからない場合は、`MockProvider` にフォールバックします。これにより、Chrome 監視が使えない状態でもトレイアイコンとオーバーレイ通知の挙動を確認できます。

ログは以下に出力されます。

```text
%APPDATA%\nape-notify\logs\nape-notify.log
```
