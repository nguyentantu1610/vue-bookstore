export default interface Order {
  id: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: string;
}
