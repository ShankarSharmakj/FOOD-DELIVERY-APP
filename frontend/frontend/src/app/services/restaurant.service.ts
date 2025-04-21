import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Restaurant, MenuItem } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = '/api/restaurants';

  constructor(private http: HttpClient) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Restaurant[]>('getRestaurants', []))
      );
  }

  getRestaurant(id: number): Observable<Restaurant> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Restaurant>(url)
      .pipe(
        catchError(this.handleError<Restaurant>(`getRestaurant id=${id}`))
      );
  }

  getMenuItems(restaurantId: number): Observable<MenuItem[]> {
    const url = `${this.apiUrl}/${restaurantId}/menu`;
    return this.http.get<MenuItem[]>(url)
      .pipe(
        catchError(this.handleError<MenuItem[]>(`getMenuItems for restaurant id=${restaurantId}`, []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
