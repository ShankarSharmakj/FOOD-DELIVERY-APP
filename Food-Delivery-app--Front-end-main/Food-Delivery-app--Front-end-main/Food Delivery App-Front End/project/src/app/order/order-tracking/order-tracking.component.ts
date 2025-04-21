import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Order, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container fade-in">
      <button mat-button color="primary" routerLink="/restaurants" class="back-button">
        <mat-icon>arrow_back</mat-icon> Back to Restaurants
      </button>
      
      <h1 class="page-title">Track Order</h1>
      
      <div *ngIf="loading" class="text-center">
        <mat-spinner diameter="50" class="loading-spinner"></mat-spinner>
      </div>
      
      <div *ngIf="!loading && order">
        <mat-card class="order-card">
          <mat-card-header>
            <mat-card-title>Order #{{ order.id }}</mat-card-title>
            <mat-card-subtitle>{{ order.createdAt | date:'medium' }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="order-status-container">
              <h2>Order Status</h2>
              
              <mat-stepper [linear]="false" [selectedIndex]="getStatusIndex()" class="status-stepper">
                <mat-step [completed]="isStatusCompleted(OrderStatus.Pending)" [editable]="false">
                  <ng-template matStepLabel>Order Received</ng-template>
                </mat-step>
                <mat-step [completed]="isStatusCompleted(OrderStatus.Preparing)" [editable]="false">
                  <ng-template matStepLabel>Preparing</ng-template>
                </mat-step>
                <mat-step [completed]="isStatusCompleted(OrderStatus.OutForDelivery)" [editable]="false">
                  <ng-template matStepLabel>Out for Delivery</ng-template>
                </mat-step>
                <mat-step [completed]="order.status === OrderStatus.Delivered" [editable]="false">
                  <ng-template matStepLabel>Delivered</ng-template>
                </mat-step>
              </mat-stepper>
              
              <div class="current-status">
                <h3>
                  Current Status: 
                  <span [ngClass]="'status-' + order.status.toLowerCase().replace(' ', '-')">
                    {{ order.status }}
                  </span>
                </h3>
                
                <button 
                  *ngIf="canCancelOrder()" 
                  mat-raised-button 
                  color="warn" 
                  (click)="cancelOrder()"
                >
                  Cancel Order
                </button>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="order-details">
              <h2>Order Details</h2>
              
              <div class="restaurant-info">
                <h3>{{ order.restaurant.name }}</h3>
                <p>{{ order.restaurant.location }}</p>
              </div>
              
              <div class="order-items">
                <h3>Items</h3>
                <div *ngFor="let item of order.items" class="order-item">
                  <span>{{ item.name }} x {{ item.quantity }}</span>
                  <span>{{ item.price * item.quantity | currency }}</span>
                </div>
                <div class="order-total">
                  <span>Total</span>
                  <span>{{ order.totalPrice | currency }}</span>
                </div>
              </div>
              
              <div class="delivery-address">
                <h3>Delivery Address</h3>
                <p>{{ order.deliveryAddress }}</p>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/order/new">
              <mat-icon>add</mat-icon> New Order
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="!loading && !order" class="text-center">
        <h2>Order not found</h2>
        <button mat-raised-button color="primary" routerLink="/restaurants">View Restaurants</button>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      margin: 48px auto;
    }
    
    .order-card {
      margin-bottom: 24px;
    }
    
    .order-status-container {
      margin-bottom: 24px;
    }
    
    .current-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
    }
    
    .order-details {
      margin-top: 24px;
    }
    
    .restaurant-info, .order-items, .delivery-address {
      margin-bottom: 24px;
    }
    
    .order-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .order-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
    
    .back-button {
      margin-bottom: 16px;
    }
    
    /* Status colors */
    .status-pending {
      color: var(--accent-color);
    }
    
    .status-preparing {
      color: var(--warning-color);
    }
    
    .status-out-for-delivery {
      color: var(--primary-color);
    }
    
    .status-delivered {
      color: var(--success-color);
    }
    
    .status-cancelled {
      color: var(--error-color);
    }
  `]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: Order | undefined;
  loading = true;
  refreshSubscription: Subscription | undefined;
  
  // Make enum available in template
  OrderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = Number(params.get('id'));
      if (orderId) {
        this.loadOrder(orderId);
        this.setupRefresh(orderId);
      } else {
        this.router.navigate(['/restaurants']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order', err);
        this.loading = false;
      }
    });
  }

  setupRefresh(orderId: number): void {
    // Refresh order status every 10 seconds
    this.refreshSubscription = interval(10000).pipe(
      switchMap(() => this.orderService.getOrderById(orderId))
    ).subscribe({
      next: (order) => {
        this.order = order;
      },
      error: (err) => {
        console.error('Error refreshing order', err);
      }
    });
  }

  getStatusIndex(): number {
    if (!this.order) return 0;
    
    switch (this.order.status) {
      case OrderStatus.Pending:
        return 0;
      case OrderStatus.Preparing:
        return 1;
      case OrderStatus.OutForDelivery:
        return 2;
      case OrderStatus.Delivered:
        return 3;
      case OrderStatus.Cancelled:
        return 0; // If cancelled, show at the beginning
      default:
        return 0;
    }
  }

  isStatusCompleted(status: OrderStatus): boolean {
    if (!this.order) return false;
    
    if (this.order.status === OrderStatus.Cancelled) {
      return false;
    }
    
    const statusOrder = [
      OrderStatus.Pending,
      OrderStatus.Preparing,
      OrderStatus.OutForDelivery,
      OrderStatus.Delivered
    ];
    
    const currentIndex = statusOrder.indexOf(this.order.status);
    const statusIndex = statusOrder.indexOf(status);
    
    return currentIndex > statusIndex;
  }

  canCancelOrder(): boolean {
    if (!this.order) return false;
    
    return this.order.status === OrderStatus.Pending || 
           this.order.status === OrderStatus.Preparing;
  }

  cancelOrder(): void {
    if (!this.order) return;
    
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder) {
          this.order = updatedOrder;
        }
      },
      error: (err) => {
        console.error('Error cancelling order', err);
      }
    });
  }
}