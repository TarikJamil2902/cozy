import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../_services/cart.service';

// Interface for product data
export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
  discount?: number;
  colors?: string[];
  sizes?: string[];
  description?: string;
  createdAt?: Date;
}

interface Feature {
  title: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userName: string = '';
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  isLoading: boolean = true;
  
  features: Feature[] = [
    { title: 'Free Shipping', icon: 'https://i.postimg.cc/PrN2Y6Cv/f1.png' },
    { title: 'Online Order', icon: 'https://i.postimg.cc/qvycxW4q/f2.png' },
    { title: 'Save Money', icon: 'https://i.postimg.cc/1Rdphyz4/f3.png' },
    { title: 'Promotions', icon: 'https://i.postimg.cc/GpYc2JFZ/f4.png' },
    { title: 'Happy Sell', icon: 'https://i.postimg.cc/4yFCwmv6/f5.png' },
    { title: '24/7 Support', icon: 'https://i.postimg.cc/gJN1knTC/f6.png' }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Get user name from localStorage
    const user = localStorage.getItem('user');
    this.userName = user ? JSON.parse(user).name || 'Guest' : 'Guest';
    
    // Load products
    this.loadProducts();
  }

  private loadProducts(): void {
    // Mock featured products data
    this.featuredProducts = [
      {
        id: 1,
        name: 'Carton Astronaut T-Shirt',
        brand: 'Adidas',
        price: 8195.00,
        image: 'https://i.postimg.cc/hG1hqqK6/n1.jpg',
        category: 'T-Shirts',
        rating: 4.5,
        inStock: true,
        discount: 20,
        colors: ['White', 'Black'],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Comfortable cotton t-shirt with astronaut print',
        createdAt: new Date('2025-07-15')
      },
      {
        id: 2,
        name: 'Carton Leave T-Shirt',
        brand: 'Adidas',
        price: 4595.00,
        image: 'https://i.postimg.cc/2yhT2kvb/f2.jpg',
        category: 'T-Shirts',
        rating: 4.0,
        inStock: true,
        colors: ['White'],
        sizes: ['S', 'M', 'L'],
        description: 'Casual t-shirt with leaf print',
        createdAt: new Date('2025-08-10')
      },
      {
        id: 3,
        name: 'Rose Multicolor T-Shirt',
        brand: 'Adidas',
        price: 4195.00,
        image: 'https://i.postimg.cc/KYjcC3sk/n3.jpg',
        category: 'T-Shirts',
        rating: 4.2,
        inStock: true,
        discount: 15,
        colors: ['Multicolor'],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Colorful t-shirt with rose pattern',
        createdAt: new Date('2025-08-20')
      }
    ];

    // Set new arrivals (last 3 products marked as new)
    this.newArrivals = [...this.featuredProducts]
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 3);

    this.isLoading = false;
  }

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };

    this.cartService.add(cartItem).subscribe({
      next: () => this.showNotification(`Added ${product.name} to cart`),
      error: (error: Error) => {
        console.error('Error adding to cart:', error);
        this.showNotification('Failed to add to cart', 'error');
      }
    });
  }

  addToWishlist(product: Product): void {
    // Implementation depends on your wishlist service
    console.log('Added to wishlist:', product);
    this.showNotification('Added to wishlist');
  }

  isNewArrival(product: Product): boolean {
    if (!product.createdAt) return false;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return product.createdAt > oneMonthAgo;
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  getRatingStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return Array(fullStars).fill(1).concat(hasHalfStar ? [0.5] : []);
  }

  getDiscountedPrice(price: number, discount?: number): number {
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  }
}
