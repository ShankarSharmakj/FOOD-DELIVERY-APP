import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Restaurant, CuisineType } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Pizza Palace',
      location: '123 Main St',
      cuisineType: CuisineType.Italian,
      rating: 4.5,
      deliveryTime: '30-45 min',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      menu: [
        {
          id: 101,
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and basil',
          price: 12.99,
          category: 'Pizza'
        },
        {
          id: 102,
          name: 'Pepperoni Pizza',
          description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
          price: 14.99,
          category: 'Pizza'
        },
        {
          id: 103,
          name: 'Spaghetti Carbonara',
          description: 'Spaghetti with eggs, cheese, pancetta, and black pepper',
          price: 13.99,
          category: 'Pasta'
        }
      ]
    },
    {
      id: 2,
      name: 'Taj Mahal',
      location: '456 Oak Ave',
      cuisineType: CuisineType.Indian,
      rating: 4.7,
      deliveryTime: '40-55 min',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
      menu: [
        {
          id: 201,
          name: 'Butter Chicken',
          description: 'Chicken in a creamy tomato sauce',
          price: 15.99,
          category: 'Main Course'
        },
        {
          id: 202,
          name: 'Vegetable Biryani',
          description: 'Fragrant rice dish with vegetables and spices',
          price: 13.99,
          category: 'Rice'
        },
        {
          id: 203,
          name: 'Garlic Naan',
          description: 'Flatbread with garlic and butter',
          price: 3.99,
          category: 'Bread'
        }
      ]
    },
    {
      id: 3,
      name: 'Golden Dragon',
      location: '789 Maple Rd',
      cuisineType: CuisineType.Chinese,
      rating: 4.2,
      deliveryTime: '25-40 min',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      menu: [
        {
          id: 301,
          name: 'Kung Pao Chicken',
          description: 'Spicy chicken with peanuts and vegetables',
          price: 14.99,
          category: 'Main Course'
        },
        {
          id: 302,
          name: 'Vegetable Spring Rolls',
          description: 'Crispy rolls filled with vegetables',
          price: 6.99,
          category: 'Appetizers'
        },
        {
          id: 303,
          name: 'Beef with Broccoli',
          description: 'Stir-fried beef with broccoli in a savory sauce',
          price: 15.99,
          category: 'Main Course'
        }
      ]
    }
  ];

  constructor() { }

  getRestaurants(): Observable<Restaurant[]> {
    // Simulate API call with delay
    return of(this.restaurants).pipe(delay(500));
  }

  getRestaurantById(id: number): Observable<Restaurant | undefined> {
    const restaurant = this.restaurants.find(r => r.id === id);
    // Simulate API call with delay
    return of(restaurant).pipe(delay(300));
  }
}