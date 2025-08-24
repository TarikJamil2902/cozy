import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

   private apiURL = "http://localhost:8080/api/cart";


   constructor(private httpClient: HttpClient, private storageService: StorageService) { }

    add(user: any) {
      return this.httpClient.post(this.apiURL, user)
    }

    updateData(user: any) {
      return this.httpClient.put(this.apiURL + "/" + user.id, user)
    }

    getAll() {
      return this.httpClient.get(this.apiURL);
    }

    getByID(id: any) {
      return this.httpClient.get(this.apiURL + "/" + id);
    }

    deleteByID(id: any) {
      return this.httpClient.delete(this.apiURL + "/" + id);
    }

 


}
