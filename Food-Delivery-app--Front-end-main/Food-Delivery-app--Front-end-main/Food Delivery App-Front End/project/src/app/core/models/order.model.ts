import { Restaurant } from './restaurant.model';

export interface Order {
  id: number;
  restaurant: Restaurant;
  items: OrderItem[];
  totalPrice: number;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: Date;
  estimatedDeliveryTime?: Date;
}

export interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Preparing = 'Preparing',
  OutForDelivery = 'Out for Delivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}