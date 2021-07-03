import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  miIp = "192.168.1.95";
  miPuerto = "2000";
  private URL = `https://${this.miIp}:${this.miPuerto}/api`;

  constructor(private http: HttpClient) { }

  getVuelos() {
    return this.http.get<any>(this.URL + '/vuelo/vuelosDisponibles');
  }

  getCoches() {
    return this.http.get<any>(this.URL + '/coche/cochesDisponibles');
  }

  getHoteles() {
    return this.http.get<any>(this.URL + '/hotel/habitacionesDisponibles');
  }

  getReservas() {

  }
}
