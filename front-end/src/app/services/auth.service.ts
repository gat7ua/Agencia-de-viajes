import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import { SigninComponent } from '../components/signin/signin.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  miIp = "192.168.1.95";
  miPuerto = "2000";
  private URL = `https://${this.miIp}:${this.miPuerto}/api`;

  constructor(private http: HttpClient, private router: Router) { }

  signup(user: any){
    return this.http.post<any>(this.URL + '/registrar', user);
  }

  signin(user: any){ 
    return this.http.post<any>(this.URL + `/identificar/${user.user}`, user);
  }

  loggedIn(){
    return !!localStorage.getItem('token');
  }
  
  getToken(){
    return 'buenaonda';
  }

  getUser(){
    return localStorage.getItem('user');
  }

  reservar(item: any) {
    return this.http.post<any>(this.URL + `/${item.prov}/reserva/${this.getUser()}/${item.id}`, item);
  }

  logOut(){
    localStorage.removeItem('token');
    this.router.navigate(['/publict']);
  }
}
