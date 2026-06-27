/**
 * Moxfield / EDHREC / MTG Arena / Archidekt など主要サービスのデッキリスト形式を解析し
 * カード名の一覧（重複なし）を返す。
 *
 * 対応フォーマット例:
 *   "4 Lightning Bolt"
 *   "4 Lightning Bolt (M21) 165"
 *   "1x Sol Ring"
 *   "1 Delver of Secrets // Insectile Aberration"  → "Delver of Secrets" に正規化
 */
export function parseDeckList(text: string): string[] {
  const names = new Set<string>()

  for (let line of text.split('\n')) {
    line = line.trim()
    if (!line) continue

    // "// comment" 行か DFC 名に含まれる "//" の処理
    // "//" が行頭 → コメント行なのでスキップ
    // "//" が途中 → DFC 区切りなので前半だけを使う（"4 Delver of Secrets // ..." → "Delver of Secrets"）
    if (line.startsWith('//')) continue
    const dfcSep = line.indexOf(' // ')
    if (dfcSep !== -1) line = line.slice(0, dfcSep).trim()

    // セクションヘッダーをスキップ
    if (/^(Deck|Sideboard|Commander|Companion|Maybeboard|About)$/i.test(line)) continue

    // 枚数プレフィックスを除去: "4 " or "4x "
    const withQty = line.match(/^\d+x?\s+(.+)$/)
    let name = withQty ? withQty[1] : line

    // セット記号と収録番号を除去: "(M21) 165" or "(M21)"
    name = name.replace(/\s+\([A-Z0-9]{2,6}\)(\s+\d+)?/, '').trim()
    // フォイルマーカーを除去: "*F*" "*FOIL*"
    name = name.replace(/\s+\*[A-Z]+\*$/, '').trim()

    if (name.length >= 2) names.add(name)
  }

  return [...names]
}
