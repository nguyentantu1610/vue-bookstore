export default interface Product {
  product_id: string;
  name: string;
  author: string;
  translator: string;
  supplier_id: string;
  publisher_name: string;
  publish_year: string;
  category_id: string;
  weight: string;
  cover_size: string;
  pages: string;
  description: string;
  price: number | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  url?: string;
}
