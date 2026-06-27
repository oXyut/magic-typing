# MTG Typing

Magic: The Gathering のカード名・効果テキストをタイピングして腕を磨く、ブラウザで動くタイピングゲームです。

**▶ [プレイする](https://oxyut.github.io/magic-typing/)**

---

## 機能

- **カード名 / カードテキスト** の2モードに対応
- **カードプール指定** — スタンダード・パイオニア・モダン・レガシー・ヴィンテージ・パウパー・全フォーマット
- **レア度フィルター** — コモン / アンコモン / レア / 神話レア（複数選択可）
- **マイデッキモード** — Moxfield・MTG Arena・EDHREC・Archidekt などからエクスポートしたデッキリストをテキスト貼り付けまたは `.txt` ファイルでインポート。一巡するまで重複なし
- **制限時間** — 1分 / 2分 / 3分
- **サウンド** — 正解・不正解・カードクリア時の効果音（ON/OFF 切替可）
- **結果画面** — WPM・正確率・完了カード数・グレード（S〜D）

## 技術スタック

| 区分 | 内容 |
|---|---|
| フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite |
| スタイリング | CSS Modules |
| フォント | Cinzel / Cinzel Decorative (Google Fonts) |
| カードデータ | [Scryfall API](https://scryfall.com/docs/api) |
| サウンド | Web Audio API（外部ファイル不使用） |
| デプロイ | GitHub Pages (GitHub Actions) |

## ローカルで動かす

```bash
git clone https://github.com/oXyut/magic-typing.git
cd magic-typing
npm install
npm run dev
```

## デプロイ

`main` ブランチへ push すると GitHub Actions が自動でビルド・デプロイします。  
初回のみ Settings → Pages → Source を **GitHub Actions** に設定してください。

```bash
npm run build   # dist/ に出力
```

---

## 権利・免責事項

### Magic: The Gathering について

本プロジェクトは **Wizards of the Coast LLC のファンコンテンツポリシー** に基づく非公式のファン制作物です。  
Magic: The Gathering に関するすべてのカード名・効果テキスト・カードイラスト・セット名・ロゴ等は **Wizards of the Coast LLC および Hasbro, Inc.** の知的財産であり、同社が著作権・商標権を保有します。

> **Magic: The Gathering** is property of Wizards of the Coast LLC.  
> This project is unofficial Fan Content permitted under the [Wizards of the Coast Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy).  
> Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

本プロジェクトは **Wizards of the Coast LLC およびその関連会社とは一切関係なく**、非営利目的で制作されています。

### カードデータについて

カードデータは **[Scryfall](https://scryfall.com)** の API（[Scryfall API](https://scryfall.com/docs/api)）から取得しています。  
Scryfall は Magic: The Gathering の総合カードデータベースであり、API の利用にあたっては [Scryfall のご利用規約](https://scryfall.com/docs/api/lists) に従っています。

> Card data provided by **[Scryfall](https://scryfall.com)**.

### コードライセンス

本リポジトリのソースコード（カードデータ・イラストを除く）は **MIT License** のもとで公開しています。

```
MIT License

Copyright (c) 2025 oXyut

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
