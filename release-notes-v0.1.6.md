## Nape Notify v0.1.6

角度通知のデバイス表示を汎用化したリリースです。

### Highlights

- デバイス画像をアプリに同梱せず、外部画像パスから読み込めるように変更
- 画像未設定時は軽量SVGのデバイス表示にフォールバック
- `deviceImageBaseAngle` による画像の基準角度補正に対応
- Keychron Launcher由来の参照画像はReleaseに含めていません

### Optional Config

任意で以下の設定ファイルを作ると、通知内のデバイス画像を差し替えられます。

```text
%APPDATA%\nape-notify\config.json
```

例:

```json
{
  "deviceImagePath": "C:\\Users\\Ryunosuke\\Pictures\\nape-pro.png",
  "deviceImageBaseAngle": 0
}
```

### Downloads

- `NapeNotify-0.1.6-portable-exe-only.zip`
  - 展開して `NapeNotify-0.1.6-portable.exe` を起動してください。
- `NapeNotify-0.1.6-win-unpacked.7z`
  - サイズ優先版です。展開後、フォルダ内の `Nape Notify.exe` を起動してください。

### Notes

- 未署名アプリのため、Windows SmartScreenの警告が表示される場合があります。
- Keychron LauncherをChrome上で開き、Nape Proと接続した状態で利用してください。

### SHA256

```text
79BCABB9A068BB92513AED7DE3646B5A047861A6D6C587EF3CB844297C8E9621  NapeNotify-0.1.6-portable-exe-only.zip
B82E09D89D51DDCAED79292EDBFA2DC45FA442B8B831D7026070D5EE0BCB15AA  NapeNotify-0.1.6-win-unpacked.7z
```
