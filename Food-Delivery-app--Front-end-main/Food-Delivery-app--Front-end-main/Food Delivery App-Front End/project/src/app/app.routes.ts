import { Routes } from '@angular/router';
import { RestaurantListComponent } from './restaurant/restaurant-list/restaurant-list.component';
import { RestaurantDetailsComponent } from './restaurant/restaurant-details/restaurant-details.component';
import { OrderFormComponent } from './order/order-form/order-form.component';
import { OrderTrackingComponent } from './order/order-tracking/order-tracking.component';

export const routes: Routes = [
  { path: '', redirectTo: '/restaurants', pathMatch: 'full' },
  { path: 'restaurants', component: RestaurantListComponent },
  { path: 'restaurants/:id', component: RestaurantDetailsComponent },
  { path: 'order/new', component: OrderFormComponent },
  { path: 'order/:id', component: OrderTrackingComponent },
  { path: '**', redirectTo: '/restaurants' }
];