import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Food Delivery</span>
      <span class="toolbar-spacer"></span>
      <button mat-icon-button aria-label="Restaurants" routerLink="/restaurants">
        <mat-icon>restaurant</mat-icon>
      </button>
      <button mat-icon-button aria-label="Place Order" routerLink="/order/new">
        <mat-icon>add_shopping_cart</mat-icon>
      </button>
    </mat-toolbar>
    
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    
    mat-toolbar {
      margin-bottom: 16px;
    }
  `]
})
export class AppComponent {
  title = 'Food Delivery';
}