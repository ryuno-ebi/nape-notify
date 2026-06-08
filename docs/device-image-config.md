# デバイス画像の設定

Nape Notify v0.1.6以降では、通知内に表示するデバイス画像をローカル画像ファイルで差し替えられます。

画像を設定しない場合は、アプリ内蔵の軽量SVG表示にフォールバックします。配布版にはKeychron Launcher由来の画像や生成画像は同梱していません。

## 設定ファイル

以下のファイルを作成します。

```text
%APPDATA%\nape-notify\config.json
```

通常は次のパスです。

```text
C:\Users\<ユーザー名>\AppData\Roaming\nape-notify\config.json
```

例:

```json
{
  "deviceImagePath": "C:\\Users\\Ryunosuke\\Pictures\\nape-pro.png",
  "deviceImageBaseAngle": 0
}
```

## 設定項目

`deviceImagePath`

通知に表示する画像ファイルの絶対パスです。PNG、JPG、WebPなどElectron/Chromiumが表示できる画像を指定できます。

`deviceImageBaseAngle`

画像の基準角度です。画像の正面方向がアプリ上の0度と一致しない場合に補正します。

例えば、画像が225度向きの状態を正面として作られている場合は以下のように指定します。

```json
{
  "deviceImagePath": "C:\\Users\\Ryunosuke\\Pictures\\nape-pro.png",
  "deviceImageBaseAngle": 225
}
```

## 動作

- `deviceImagePath` が未設定、空、または読み込めない場合はSVG表示に戻ります。
- 画像は1枚だけ使い、検出した角度に応じてCSSで回転します。
- 画像ファイルはアプリにコピーされません。
- Web上の画像URLではなく、ローカルファイルパスを指定してください。
- 設定ファイルはアプリ起動時に読み込まれるため、変更後はNape Notifyを終了して再起動してください。

## 反映されない場合

`%APPDATA%\nape-notify\logs\nape-notify.log` を確認してください。

以下のようなログが手がかりになります。

- `config:loaded`: 設定ファイルを読み込みました。
- `config:not-found`: 設定ファイルが見つかりません。
- `config:error`: JSONの形式不備や読み込みエラーが発生しています。

また、古いPortable EXEを起動していると現在の設定仕様と一致しない場合があります。Releaseから取得した最新バージョンを起動しているか確認してください。

## 注意

他社サービスや他社製品ページから取得した画像を使う場合は、利用条件や著作権に注意してください。

公開配布やOSSとして扱う場合は、権利関係を確認できる自作画像、許諾済み画像、またはライセンス上利用可能な画像を指定する運用を推奨します。
