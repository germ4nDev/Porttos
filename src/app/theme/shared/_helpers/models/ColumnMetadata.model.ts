export interface ColumnMetadata {
  name: string
  header: string
  type:
    | 'number'
    | 'price'
    | 'date'
    | 'avatar'
    | 'image'
    | 'capture'
    | 'color_chip'
    | 'text'
    | 'estado'
    | 'array_text'
    | 'array_tags'
    | 'unknown'
    | any
  isSortable?: boolean
}

export type ColumnMetadataType =
  | 'number'
  | 'price'
  | 'date'
  | 'avatar'
  | 'image'
  | 'capture'
  | 'color_chip'
  | 'estado'
  | 'array_text'
  | 'array_tags'
  | 'unknown'
  | any

export interface ColumnMetadata {
  name: string
  header: string
  type:
    | 'number'
    | 'price'
    | 'date'
    | 'avatar'
    | 'image'
    | 'capture'
    | 'color_chip'
    | 'text'
    | 'estado'
    | 'array_text'
    | 'array_tags'
    | 'unknown'
    | any
  isSortable?: boolean
}
