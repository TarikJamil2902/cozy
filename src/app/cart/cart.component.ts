import { Component, OnInit } from '@angular/core';
import { CartService } from '../service/cart.service';
import { Router } from '@angular/router';
import { StorageService } from '../service/storage.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  shippingFee: number = 100;
  voucherCode: string = '';
  discount: number = 0;
  cart: any[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
    private storageService: StorageService
  ) {}
  get subtotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  ngOnInit(): void {
    this.cartService.getAll().subscribe((cartItems: any) => {
      this.cart = cartItems;
    });
  }

  // Calculate the total price (subtotal + shipping fee - discount)
  get total(): number {
    const cartTotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    return cartTotal + this.shippingFee - this.discount;
  }

  // Apply voucher discount
  applyVoucher(): void {
    const voucher = this.voucherCode.trim().toUpperCase();
    if (voucher === 'DISCOUNT10') {
      this.discount = 100; // Apply a 100 currency unit discount
    } else {
      this.discount = 0;
      alert('Invalid voucher code');
    }
  }

  // Remove an item from the cart
  removeFromCart(index: number, item: any): void {
    this.cart.splice(index, 1);  // Remove item from cart array
    this.cartService.deleteByID(item.id).subscribe(() => {
      console.log(`Item with id ${item.id} removed from the cart.`);
    });
  }

  // Increase the quantity of a product in the cart
  increaseQuantity(index: number): void {
    this.cart[index].quantity += 1;
    this.updateTotal();
  }

  // Decrease the quantity of a product in the cart
  decreaseQuantity(index: number): void {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity -= 1;
    }
    this.updateTotal();
  }

  // Update total when quantity changes
  updateTotal(): void {
    // Total is automatically updated when quantity changes via 'get total'
  }

  // Proceed to checkout if the user is logged in, otherwise navigate to login page
  checkout(): void {
    if (this.storageService.isLoggedIn()) {
      this.router.navigateByUrl('/orderCreate');
    } else {
      this.router.navigateByUrl('/log-in');
    }
  }

  // Select a package (currently just retrieves all cart items)
  selectPackage(packageData: any): void {
    this.cartService.getAll();
    this.checkout();
  }
}
