export default interface Product {
  product_id: string;
  name: string;
  author: string;
  translator: string;
  supplier_name: string;
  publisher_name: string;
  publish_year: string;
  category_name: string;
  weight: string;
  cover_size: string;
  pages: string;
  price: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  description: string;
  urls?: string;
}
