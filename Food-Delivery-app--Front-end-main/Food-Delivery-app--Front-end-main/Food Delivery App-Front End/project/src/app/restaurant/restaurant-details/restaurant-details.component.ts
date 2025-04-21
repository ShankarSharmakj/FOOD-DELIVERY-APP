import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Restaurant, MenuItem } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container fade-in">
      <button mat-button color="primary" (click)="goBack()" class="back-button">
        <mat-icon>arrow_back</mat-icon> Back to Restaurants
      </button>
      
      <div *ngIf="loading" class="text-center">
        <mat-spinner diameter="50" class="loading-spinner"></mat-spinner>
      </div>
      
      <div *ngIf="!loading && restaurant">
        <div class="restaurant-header">
          <img [src]="restaurant.image" [alt]="restaurant.name" class="restaurant-banner">
          <div class="restaurant-info">
            <h1 class="page-title">{{ restaurant.name }}</h1>
            <mat-chip-set>
              <mat-chip>{{ restaurant.cuisineType }}</mat-chip>
              <mat-chip>{{ restaurant.rating }} ★</mat-chip>
              <mat-chip>{{ restaurant.deliveryTime }}</mat-chip>
            </mat-chip-set>
            <p>{{ restaurant.location }}</p>
          </div>
        </div>
        
        <h2>Menu</h2>
        
        <div *ngFor="let category of menuCategories" class="menu-category">
          <h3>{{ category }}</h3>
          <mat-divider></mat-divider>
          
          <mat-card *ngFor="let item of getMenuItemsByCategory(category)" class="menu-item-card">
            <mat-card-content>
              <div class="menu-item-info">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
              </div>
              <div class="menu-item-price">
                <span>{{ item.price | currency }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="order-button-container">
          <button mat-raised-button color="accent" [routerLink]="['/order/new']" [queryParams]="{ restaurantId: restaurant.id }">
            <mat-icon>add_shopping_cart</mat-icon> Place Order
          </button>
        </div>
      </div>
      
      <div *ngIf="!loading && !restaurant" class="text-center">
        <h2>Restaurant not found</h2>
        <button mat-raised-button color="primary" routerLink="/restaurants">View All Restaurants</button>
      </div>
    </div>
  `,
  styles: [`
    .restaurant-banner {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .restaurant-info {
      margin-bottom: 32px;
    }
    
    .menu-category {
      margin-bottom: 24px;
    }
    
    .menu-item-card {
      margin-bottom: 16px;
    }
    
    .menu-item-card mat-card-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .menu-item-info {
      flex: 1;
    }
    
    .menu-item-info h4 {
      margin: 0;
      color: var(--text-primary);
    }
    
    .menu-item-info p {
      color: var(--text-secondary);
      margin-top: 4px;
    }
    
    .menu-item-price {
      font-weight: bold;
      color: var(--primary-dark);
      font-size: 1.1rem;
    }
    
    .order-button-container {
      margin-top: 32px;
      text-align: center;
    }
    
    .back-button {
      margin-bottom: 16px;
    }
    
    .loading-spinner {
      margin: 48px auto;
    }
  `]
})
export class RestaurantDetailsComponent implements OnInit {
  restaurant: Restaurant | undefined;
  loading = true;
  menuCategories: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const restaurantId = Number(params.get('id'));
      if (restaurantId) {
        this.loadRestaurant(restaurantId);
      } else {
        this.router.navigate(['/restaurants']);
      }
    });
  }

  loadRestaurant(id: number): void {
    this.loading = true;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.extractMenuCategories();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading restaurant details', err);
        this.loading = false;
      }
    });
  }

  extractMenuCategories(): void {
    if (this.restaurant && this.restaurant.menu) {
      // Create a Set to store unique categories, then convert back to array
      this.menuCategories = Array.from(
        new Set(this.restaurant.menu.map(item => item.category))
      );
    }
  }

  getMenuItemsByCategory(category: string): MenuItem[] {
    if (!this.restaurant || !this.restaurant.menu) {
      return [];
    }
    
    return this.restaurant.menu.filter(item => item.category === category);
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }
}