export interface Order {
  id: number;
  customer_name: string;
  restaurant_id: number;
  items: number[]; // Stored as JSON string in backend
  status: string;
}

export interface OrderCreate {
  customer_name: string;
  restaurant_id: number;
  items: number[]; // Send as array, backend will JSON.stringify
  status: string;
}

export interface OrderStatusUpdate {
  status: string;
}
