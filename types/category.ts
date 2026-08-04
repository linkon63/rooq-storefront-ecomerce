export interface CategoryMedia {
  original_url?: string
  collection_name?: string
  order_column?: number
}

export interface CategoryName {
  [key: string]: string | undefined
  en?: string
}

export interface Category {
  id: number | string
  name: CategoryName | string
  is_active?: boolean
  children?: Category[]
  media?: CategoryMedia[]
}
