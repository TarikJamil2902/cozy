import { Component, OnInit } from '@angular/core';
import { OrderService } from '../service/order.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-order-create',
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss']
})
export class OrderCreateComponent implements OnInit {

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    // Initialization logic here if needed, e.g. loading data for the form or setting up default values.
  }

  orderForm: FormGroup = new FormGroup({
    customerName: new FormControl(),
    orderDate: new FormControl(),
    totalAmount: new FormControl(),
  });

  save(): void {
    // Confirm order creation with the user
    const isConfirmed = window.confirm('Are you sure you want to create this order?');
    if (isConfirmed) {
      console.log(this.orderForm.value);

      // Call the order service to save the order
      this.orderService.createOrder(this.orderForm.value).subscribe(
        (res: any) => {
          console.log('Order created successfully!', res);
          // Navigate to another page after successful order creation
          this.router.navigateByUrl('/home');
        },
        (err: any) => {
          console.error('Error creating order', err);
          alert('Error while creating the order. Please try again!');
        }
      );
    }
  }
}
