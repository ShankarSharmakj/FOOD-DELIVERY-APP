export interface Restaurant {
  id: number;
  name: string;
  cuisine_type: string;
}

export interface MenuItem {
  id: number;
  restaurant_id?: number;
  name: string;
  description: string;
  price: number;
}
