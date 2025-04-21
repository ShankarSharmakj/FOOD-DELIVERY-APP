import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Order, OrderStatus } from '../models/order.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private nextOrderId = 1;

  constructor(private snackBar: MatSnackBar) { }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getOrderById(id: number): Observable<Order | undefined> {
    return this.getOrders().pipe(
      map(orders => orders.find(order => order.id === id))
    );
  }

  createOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Observable<Order> {
    const newOrder: Order = {
      ...order,
      id: this.nextOrderId++,
      status: OrderStatus.Pending,
      createdAt: new Date(),
    };
    
    this.orders = [...this.orders, newOrder];
    this.ordersSubject.next(this.orders);
    
    // Simulate order status progression
    this.simulateOrderProgression(newOrder.id);
    
    this.snackBar.open('Order placed successfully!', 'Close', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });
    
    return of(newOrder).pipe(delay(500));
  }

  cancelOrder(id: number): Observable<Order | undefined> {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex !== -1) {
      const order = this.orders[orderIndex];
      
      if (order.status === OrderStatus.Pending || order.status === OrderStatus.Preparing) {
        order.status = OrderStatus.Cancelled;
        this.orders = [...this.orders];
        this.ordersSubject.next(this.orders);
        
        this.snackBar.open('Order cancelled successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        
        return of(order).pipe(delay(300));
      } else {
        this.snackBar.open('Cannot cancel order that is out for delivery or delivered', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
        return of(undefined);
      }
    }
    
    return of(undefined);
  }

  private simulateOrderProgression(orderId: number): void {
    // Simulating order status changes
    setTimeout(() => {
      this.updateOrderStatus(orderId, OrderStatus.Preparing);
      
      setTimeout(() => {
        this.updateOrderStatus(orderId, OrderStatus.OutForDelivery);
        
        setTimeout(() => {
          this.updateOrderStatus(orderId, OrderStatus.Delivered);
        }, 60000); // 1 minute to delivery
      }, 60000); // 1 minute to out for delivery
    }, 30000); // 30 seconds to preparing
  }

  private updateOrderStatus(orderId: number, status: OrderStatus): void {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1 && this.orders[orderIndex].status !== OrderStatus.Cancelled) {
      this.orders[orderIndex].status = status;
      this.orders = [...this.orders];
      this.ordersSubject.next(this.orders);
      
      this.snackBar.open(`Order #${orderId} is now ${status}!`, 'Close', {
        duration: 3000
      });
    }
  }
}