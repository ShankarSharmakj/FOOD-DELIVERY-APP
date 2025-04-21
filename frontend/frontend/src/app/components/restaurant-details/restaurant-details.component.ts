import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Restaurant, MenuItem } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';


@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant-details.component.html',
  styleUrls: ['./restaurant-details.component.scss'],
})
export class RestaurantDetailsComponent implements OnInit {
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  selectedItemIds: Set<number> = new Set();
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/restaurants']);
      return;
    }

    this.restaurantService.getRestaurant(id).subscribe({
      next: (restaurant) => {
        this.restaurant = restaurant;
        this.fetchMenuItems(id);
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
        this.snackBar.open('Failed to load restaurant details', 'Close', { duration: 3000 });
      }
    });
  }

  fetchMenuItems(restaurantId: number): void {
    this.restaurantService.getMenuItems(restaurantId).subscribe({
      next: (items) => {
        this.menuItems = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
        this.snackBar.open('Failed to load menu items', 'Close', { duration: 3000 });
      }
    });
  }

  toggleItemSelection(itemId: number): void {
    if (this.selectedItemIds.has(itemId)) {
      this.selectedItemIds.delete(itemId);
    } else {
      this.selectedItemIds.add(itemId);
    }
  }

  isSelected(itemId: number): boolean {
    return this.selectedItemIds.has(itemId);
  }

  proceedToCheckout(): void {
    if (!this.restaurant || this.selectedItemIds.size === 0) {
      this.snackBar.open('Please select at least one menu item.', 'Close', { duration: 3000 });
      return;
    }

    const queryParams = {
      restaurantId: this.restaurant.id,
      items: JSON.stringify(Array.from(this.selectedItemIds))
    };

    this.router.navigate(['/order/new'], { queryParams });
  }
}
