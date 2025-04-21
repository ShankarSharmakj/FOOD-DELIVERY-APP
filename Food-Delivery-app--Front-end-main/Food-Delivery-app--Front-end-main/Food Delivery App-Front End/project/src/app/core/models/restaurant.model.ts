export interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisineType: CuisineType;
  rating: number;
  deliveryTime: string;
  image: string;
  menu: MenuItem[];
}

export enum CuisineType {
  Italian = 'Italian',
  Indian = 'Indian',
  Chinese = 'Chinese',
  Mexican = 'Mexican',
  American = 'American',
  Japanese = 'Japanese',
  Thai = 'Thai'
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}