export interface ScryfallImageUris {
  small: string
  normal: string
  large: string
  png?: string
}

export interface ScryfallCardFace {
  name: string
  oracle_text?: string
  printed_name?: string
  printed_text?: string
  image_uris?: ScryfallImageUris
}

export interface ScryfallCard {
  id: string
  name: string
  lang: string
  oracle_text?: string
  printed_name?: string
  printed_text?: string
  image_uris?: ScryfallImageUris
  card_faces?: ScryfallCardFace[]
}

export interface ScryfallError {
  object: 'error'
  code: string
  status: number
  details: string
}
