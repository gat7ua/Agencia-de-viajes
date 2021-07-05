import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  miIp = "192.168.1.95";
  miPuerto = "2000";
  private URL = `https://${this.miIp}:${this.miPuerto}/api`;

  constructor(private http: HttpClient, private authService: AuthService) { }

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
    return this.http.get<any>(this.URL + `/reserva/${this.authService.getUser()}`);
  }

  postReserva(item: any) {
    return this.http.post<any>(this.URL + `/${item.prov}/reserva/`, item);
  }

  deleteReserva(item: any) {
    return this.http.delete<any>(this.URL + `/${item.prov}/reserva/${this.authService.getUser()}/${item.id}`);
  }
}
