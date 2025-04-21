import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.scss'],
  standalone: false
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;
  error = false;

  constructor(
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getRestaurants();
  }

  getRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurants()
      .subscribe({
        next: (restaurants) => {
          this.restaurants = restaurants;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          this.snackBar.open('Failed to load restaurants. Please try again later.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Error fetching restaurants:', error);
        }
      });
  }

  viewRestaurant(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }
}
