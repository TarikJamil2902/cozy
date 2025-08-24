import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChekoutService } from '../service/chekout.service';
import { CartService } from '../service/cart.service';  // Assuming a CartService to fetch cart data

@Component({
  selector: 'app-cheakout',
  templateUrl: './cheakout.component.html',
  styleUrls: ['./cheakout.component.scss']
})
export class CheakoutComponent implements OnInit {
  format: string = 'pdf';  // Default format (can be changed by user)
  id: any = 4;   // Example ID (consider passing actual order ID or something dynamic)
  
  shippingFee: number = 100;
  voucherCode: string = '';
  discount: number = 0;
  cart: any[] = [];

  cheakoutForm: FormGroup;

  constructor(
    private chekoutService: ChekoutService,
    private cartService: CartService,  // Assuming CartService is used to get cart items
    private router: Router
  ) {
    this.cheakoutForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('', [Validators.required]),
      street: new FormControl('', [Validators.required]),
      postal: new FormControl('', [Validators.required]),
      division: new FormControl('', [Validators.required]),
      shipping: new FormControl('', [Validators.required]),
      card: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    // Fetch cart data (you might want to get the cart from a service)
    this.cartService.getAll().subscribe((cartItems: any) => {
      this.cart = cartItems;
    });
  }

  // Calculate the subtotal based on cart items
  get subtotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Calculate the total price (subtotal + shipping fee - discount)
  get total(): number {
    return this.subtotal + this.shippingFee - this.discount;
  }

  // Apply voucher discount if valid
  applyVoucher(): void {
    const voucher = this.voucherCode.trim().toUpperCase();
    if (voucher === 'DISCOUNT10') {
      this.discount = 100;  // Apply a 100 currency unit discount
    } else {
      this.discount = 0;
      alert('Invalid voucher code');
    }
  }

  // Save the checkout form data and proceed with payment
  save(): void {
    if (this.cheakoutForm.invalid) {
      alert('Please fill all the required fields!');
      return;
    }

    console.log(this.cheakoutForm.value);

    // Send payment details to the server
    this.chekoutService.addPayment(this.cheakoutForm.value).subscribe((res: any) => {
      this.router.navigateByUrl('/chekoutList');  // Navigate to the checkout list or confirmation page
    });
  }

  // Handle successful payment
  pay(): void {
    alert('Payment Successful!!');
    // You could redirect to a confirmation page, for example:
    this.router.navigateByUrl('/paymentConfirmation');
  }

  // Show confirmation message after payment
  message(): void {
    alert('Payment confirmed successfully!');
  }
}
