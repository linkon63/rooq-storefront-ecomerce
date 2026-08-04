export interface ProductItem {
  id: string | number;
  name: string;
  description: string;
  thumbnail: string;
  price_min: number;
  price_max: number;
  brand: string;
  category_name: string;
  option_values: string[];
  total_stock_count: number;
  categories: string[];
  price: number;
  category: string;
  discount: number;
}

export interface OptionGroup {
  name: string;
  options: {
    value: string;
    label: string;
    count: number;
  }[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface State {
  viewLayout: string;
  productLimit: number;
  sortBy: string;
}

export interface CurrentRefinements {
  categories: string[];
  brands: string[];
  price: string[];
  options: string[];
  query: string;
}
