import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, OrderCreate, OrderStatusUpdate } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  createOrder(order: OrderCreate): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order, this.httpOptions).pipe(
      catchError(this.handleError<Order>('createOrder'))
    );
  }

  getOrder(id: number): Observable<Order> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Order>(url).pipe(
      catchError(this.handleError<Order>(`getOrder id=${id}`))
    );
  }

  updateOrderStatus(id: number, statusUpdate: OrderStatusUpdate): Observable<Order> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Order>(url, statusUpdate, this.httpOptions).pipe(
      catchError(this.handleError<Order>('updateOrderStatus'))
    );
  }

  cancelOrder(id: number): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<{ message: string }>(url, this.httpOptions).pipe(
      catchError(this.handleError<{ message: string }>('cancelOrder', { message: 'Failed to cancel order' }))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
