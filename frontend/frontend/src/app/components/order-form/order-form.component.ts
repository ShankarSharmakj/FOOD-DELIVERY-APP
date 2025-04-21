import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Restaurant, MenuItem } from '../../models/restaurant.model';
import { OrderCreate } from '../../models/order.model';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  restaurants: Restaurant[] = [];
  menuItems: (MenuItem & { quantity: number })[] = [];
  selectedRestaurantId: number | null = null;
  loading = false;
  loadingRestaurants = true;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      customer_name: ['', Validators.required],
      restaurant: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRestaurants();

    this.route.queryParams.subscribe(params => {
      if (params['restaurantId']) {
        this.selectedRestaurantId = Number(params['restaurantId']);
        this.orderForm.get('restaurant')?.setValue(this.selectedRestaurantId);
      }
    });
  }

  loadRestaurants(): void {
    this.loadingRestaurants = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.loadingRestaurants = false;

        if (this.selectedRestaurantId) {
          this.onRestaurantChange();
        }
      },
      error: () => {
        this.loadingRestaurants = false;
        this.snackBar.open('Failed to load restaurants.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onRestaurantChange(): void {
    const restaurantId = this.orderForm.get('restaurant')?.value;
    if (!restaurantId) return;

    this.selectedRestaurantId = restaurantId;
    this.loading = true;

    this.restaurantService.getMenuItems(restaurantId).subscribe({
      next: (items) => {
        this.menuItems = items.map(item => ({ ...item, quantity: 0 }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load menu items.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  incrementQuantity(item: MenuItem & { quantity: number }): void {
    item.quantity++;
  }

  decrementQuantity(item: MenuItem & { quantity: number }): void {
    if (item.quantity > 0) item.quantity--;
  }

  getSelectedItemIds(): number[] {
    return this.menuItems
      .filter(item => item.quantity > 0)
      .flatMap(item => Array(item.quantity).fill(item.id));
  }

  getTotalPrice(): number {
    return this.menuItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  submitOrder(): void {
    if (this.orderForm.invalid) {
      this.snackBar.open('Please fill all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const itemIds = this.getSelectedItemIds();
    if (itemIds.length === 0) {
      this.snackBar.open('Select at least one item.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const order: OrderCreate = {
      customer_name: this.orderForm.value.customer_name,
      restaurant_id: this.orderForm.value.restaurant,
      items: itemIds,
      status: 'Pending'
    };

    this.submitting = true;
    this.orderService.createOrder(order).subscribe({
      next: (createdOrder) => {
        this.submitting = false;
        this.snackBar.open('Order placed!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/order', createdOrder.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.snackBar.open('Failed to place order.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error(err);
      }
    });
  }
}
