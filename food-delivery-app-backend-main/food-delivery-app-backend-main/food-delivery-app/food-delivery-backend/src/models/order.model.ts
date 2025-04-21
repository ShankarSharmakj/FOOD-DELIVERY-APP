export interface Order {
    id?: number;
    restaurant_id: number;
    items: any; // can be array or object
    total_price: number;
    delivery_address: string;
    status?: "Pending" | "Preparing" | "Out for Delivery" | "Delivered";
    created_at?: Date;
  }
  