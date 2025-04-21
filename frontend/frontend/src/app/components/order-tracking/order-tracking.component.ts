import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  orderId: number = 0;
  loading = true;
  error = false;
  pollingSubscription: Subscription | null = null;
  canCancel = false;

  orderStatusSteps: string[] = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/restaurants']);
      return;
    }

    this.orderId = Number(id);
    this.loadOrderDetails();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        this.canCancel = this.canCancelOrder(order.status);
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.snackBar.open('Failed to load order details.', 'Close', { duration: 5000 });
      }
    });
  }

  startPolling(): void {
    this.pollingSubscription = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.orderService.getOrder(this.orderId))
      )
      .subscribe({
        next: (order) => {
          if (this.order && this.order.status !== order.status) {
            this.snackBar.open(`Order status updated to: ${order.status}`, 'Close', { duration: 3000 });
          }
          this.order = order;
          this.canCancel = this.canCancelOrder(order.status);
        },
        error: (error) => {
          console.error('Polling error:', error);
        }
      });
  }

  getStatusIndex(status: string): number {
    return this.orderStatusSteps.indexOf(status);
  }

  getProgressValue(status: string): number {
    const index = this.getStatusIndex(status);
    return (index / (this.orderStatusSteps.length - 1)) * 100;
  }

  canCancelOrder(status: string): boolean {
    return status === 'Pending' || status === 'Preparing';
  }

  cancelOrder(): void {
    if (!this.canCancel || !this.order) return;

    const confirmed = confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    this.orderService.cancelOrder(this.orderId).subscribe({
      next: () => {
        this.snackBar.open('Order cancelled.', 'Close', { duration: 3000 });
        this.router.navigate(['/restaurants']);
      },
      error: () => {
        this.snackBar.open('Failed to cancel order.', 'Close', { duration: 3000 });
      }
    });
  }

  placeNewOrder(): void {
    this.router.navigate(['/restaurants']);
  }
}
