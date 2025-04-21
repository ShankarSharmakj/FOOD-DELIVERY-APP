import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { Restaurant } from '../../core/models/restaurant.model';
import { OrderItem } from '../../core/models/order.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  template: `
    <div class="container fade-in">
      <h1 class="page-title">Place Order</h1>
      
      <div *ngIf="loading" class="text-center">
        <mat-spinner diameter="50" class="loading-spinner"></mat-spinner>
      </div>
      
      <div *ngIf="!loading">
        <mat-stepper [linear]="true" #stepper>
          <!-- Restaurant Selection Step -->
          <mat-step [completed]="!!selectedRestaurant">
            <ng-template matStepLabel>Select Restaurant</ng-template>
            <form [formGroup]="restaurantForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Restaurant</mat-label>
                <mat-select formControlName="restaurantId" required (selectionChange)="onRestaurantChange($event.value)">
                  <mat-option *ngFor="let restaurant of restaurants" [value]="restaurant.id">
                    {{ restaurant.name }} - {{ restaurant.cuisineType }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="restaurantForm.get('restaurantId')?.invalid">
                  Please select a restaurant
                </mat-error>
              </mat-form-field>
            </form>
            
            <div class="step-navigation">
              <button mat-button routerLink="/restaurants">View All Restaurants</button>
              <button mat-button matStepperNext color="primary" [disabled]="!selectedRestaurant">Next</button>
            </div>
          </mat-step>
          
          <!-- Menu Items Selection Step -->
          <mat-step [completed]="orderForm.get('items')?.valid">
            <ng-template matStepLabel>Select Items</ng-template>
            <form [formGroup]="orderForm" *ngIf="selectedRestaurant">
              <h2>{{ selectedRestaurant.name }} Menu</h2>
              
              <div formArrayName="items">
                <mat-card *ngFor="let category of menuCategories" class="menu-category-card">
                  <mat-card-header>
                    <mat-card-title>{{ category }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div *ngFor="let item of getMenuItemsByCategory(category)" class="menu-item">
                      <div class="menu-item-details">
                        <h3>{{ item.name }}</h3>
                        <p>{{ item.description }}</p>
                        <p class="price">{{ item.price | currency }}</p>
                      </div>
                      <div class="menu-item-actions">
                        <button 
                          mat-icon-button 
                          color="primary" 
                          (click)="addItemToOrder(item)"
                          aria-label="Add to order"
                        >
                          <mat-icon>add_circle</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <mat-error *ngIf="orderForm.get('items')?.invalid && orderForm.get('items')?.touched">
                  Your order must contain at least one item
                </mat-error>
              </div>
              
              <mat-card *ngIf="orderItems.length > 0" class="order-summary-card">
                <mat-card-header>
                  <mat-card-title>Your Order</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div *ngFor="let item of orderItems; let i = index" class="order-item">
                    <div class="order-item-details">
                      <span>{{ item.name }} x {{ item.quantity }}</span>
                      <span class="order-item-price">{{ item.price * item.quantity | currency }}</span>
                    </div>
                    <div class="order-item-actions">
                      <button mat-icon-button (click)="adjustItemQuantity(i, -1)">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                      <button mat-icon-button (click)="adjustItemQuantity(i, 1)">
                        <mat-icon>add_circle</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="removeItem(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="order-total">
                    <span>Total:</span>
                    <span>{{ calculateTotal() | currency }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </form>
            
            <div class="step-navigation">
              <button mat-button matStepperPrevious>Back</button>
              <button 
                mat-button 
                matStepperNext 
                color="primary" 
                [disabled]="!orderForm.get('items')?.valid"
              >
                Next
              </button>
            </div>
          </mat-step>
          
          <!-- Delivery Address Step -->
          <mat-step>
            <ng-template matStepLabel>Delivery Details</ng-template>
            <form [formGroup]="orderForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Delivery Address</mat-label>
                <textarea 
                  matInput 
                  formControlName="deliveryAddress" 
                  required 
                  rows="3"
                  placeholder="Enter your full delivery address"
                ></textarea>
                <mat-error *ngIf="orderForm.get('deliveryAddress')?.hasError('required')">
                  Delivery address is required
                </mat-error>
              </mat-form-field>
              
              <div class="order-summary">
                <h3>Order Summary</h3>
                <p><strong>Restaurant:</strong> {{ selectedRestaurant?.name }}</p>
                <p><strong>Items:</strong> {{ orderItems.length }}</p>
                <p><strong>Total:</strong> {{ calculateTotal() | currency }}</p>
              </div>
            </form>
            
            <div class="step-navigation">
              <button mat-button matStepperPrevious>Back</button>
              <button 
                mat-raised-button 
                color="primary"
                [disabled]="orderForm.invalid" 
                (click)="placeOrder()"
              >
                Place Order
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      margin: 48px auto;
    }
    
    .step-navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
    }
    
    .menu-category-card {
      margin-bottom: 24px;
    }
    
    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .menu-item-details {
      flex: 1;
    }
    
    .menu-item-details h3 {
      margin: 0;
      font-size: 1rem;
    }
    
    .menu-item-details p {
      margin: 4px 0;
      color: var(--text-secondary);
    }
    
    .menu-item-details .price {
      font-weight: bold;
      color: var(--primary-dark);
    }
    
    .order-summary-card {
      margin-top: 24px;
      margin-bottom: 24px;
      background-color: #f9f9f9;
    }
    
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .order-item-details {
      flex: 1;
      display: flex;
      justify-content: space-between;
    }
    
    .order-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 1.1rem;
      margin-top: 16px;
    }
    
    .order-summary {
      margin-top: 24px;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
  `]
})
export class OrderFormComponent implements OnInit {
  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | undefined;
  menuCategories: string[] = [];
  loading = true;
  
  restaurantForm: FormGroup;
  orderForm: FormGroup;
  orderItems: OrderItem[] = [];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private orderService: OrderService
  ) {
    this.restaurantForm = this.fb.group({
      restaurantId: ['', Validators.required]
    });
    
    this.orderForm = this.fb.group({
      items: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      deliveryAddress: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRestaurants();
    
    // Check for restaurant ID in query params
    this.route.queryParamMap.subscribe(params => {
      const restaurantId = Number(params.get('restaurantId'));
      if (restaurantId) {
        this.restaurantForm.patchValue({ restaurantId });
        this.onRestaurantChange(restaurantId);
      }
    });
  }

  loadRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading restaurants', err);
        this.loading = false;
      }
    });
  }

  onRestaurantChange(restaurantId: number): void {
    this.restaurantService.getRestaurantById(restaurantId).subscribe({
      next: (restaurant) => {
        this.selectedRestaurant = restaurant;
        if (restaurant) {
          this.extractMenuCategories();
        }
      },
      error: (err) => {
        console.error('Error loading restaurant details', err);
      }
    });
  }

  extractMenuCategories(): void {
    if (this.selectedRestaurant && this.selectedRestaurant.menu) {
      this.menuCategories = Array.from(
        new Set(this.selectedRestaurant.menu.map(item => item.category))
      );
    }
  }

  getMenuItemsByCategory(category: string): any[] {
    if (!this.selectedRestaurant || !this.selectedRestaurant.menu) {
      return [];
    }
    
    return this.selectedRestaurant.menu.filter(item => item.category === category);
  }

  addItemToOrder(menuItem: any): void {
    // Check if the item is already in the order
    const existingItemIndex = this.orderItems.findIndex(item => item.menuItemId === menuItem.id);
    
    if (existingItemIndex !== -1) {
      // If item exists, increase quantity
      this.adjustItemQuantity(existingItemIndex, 1);
    } else {
      // Add new item to order
      const newItem: OrderItem = {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      };
      
      this.orderItems.push(newItem);
      
      // Update the FormArray
      const itemsFormArray = this.orderForm.get('items') as FormArray;
      itemsFormArray.push(this.fb.control(newItem));
    }
  }

  adjustItemQuantity(index: number, change: number): void {
    const newQuantity = this.orderItems[index].quantity + change;
    
    if (newQuantity > 0) {
      this.orderItems[index].quantity = newQuantity;
    } else {
      this.removeItem(index);
    }
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
    
    // Update the FormArray
    const itemsFormArray = this.orderForm.get('items') as FormArray;
    itemsFormArray.removeAt(index);
  }

  calculateTotal(): number {
    return this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  placeOrder(): void {
    if (this.orderForm.valid && this.selectedRestaurant) {
      const totalPrice = this.calculateTotal();
      
      const order = {
        restaurant: this.selectedRestaurant,
        items: this.orderItems,
        totalPrice,
        deliveryAddress: this.orderForm.get('deliveryAddress')?.value
      };
      
      this.orderService.createOrder(order).subscribe({
        next: (createdOrder) => {
          this.router.navigate(['/order', createdOrder.id]);
        },
        error: (err) => {
          console.error('Error creating order', err);
        }
      });
    }
  }
}