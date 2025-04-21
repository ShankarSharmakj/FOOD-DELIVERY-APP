import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="container fade-in">
      <h1 class="page-title">Restaurants</h1>
      
      <div *ngIf="loading" class="text-center">
        <mat-spinner diameter="50" class="loading-spinner"></mat-spinner>
      </div>
      
      <div *ngIf="!loading" class="card-container">
        <mat-card *ngFor="let restaurant of restaurants" class="restaurant-card">
          <img mat-card-image [src]="restaurant.image" [alt]="restaurant.name" class="restaurant-image">
          <mat-card-content>
            <h2>{{ restaurant.name }}</h2>
            <mat-chip-set>
              <mat-chip>{{ restaurant.cuisineType }}</mat-chip>
              <mat-chip>{{ restaurant.rating }} ★</mat-chip>
            </mat-chip-set>
            <p>{{ restaurant.location }}</p>
            <p>Delivery time: {{ restaurant.deliveryTime }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/restaurants', restaurant.id]">VIEW MENU</button>
            <button mat-button color="accent" [routerLink]="['/order/new']" [queryParams]="{ restaurantId: restaurant.id }">ORDER NOW</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .restaurant-card {
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    }
    
    .restaurant-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .restaurant-image {
      height: 200px;
      object-fit: cover;
    }
    
    .loading-spinner {
      margin: 48px auto;
    }
    
    mat-card-content h2 {
      margin-bottom: 8px;
      color: var(--primary-dark);
    }
    
    mat-chip-set {
      margin-bottom: 8px;
    }
  `]
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
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
}