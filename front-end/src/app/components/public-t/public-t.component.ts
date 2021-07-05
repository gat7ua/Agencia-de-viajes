import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TasksService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-public-t',
  templateUrl: './public-t.component.html',
  styleUrls: ['./public-t.component.css']
})

export class PublicTComponent implements OnInit {

  coches: any = [];
  vuelos: any = [];
  habitaciones: any = [];

  item = {
    prov: '',
    id: ''
  }

  constructor(public tasksService: TasksService, public authService: AuthService) { }

  ngOnInit(): void {
    this.tasksService.getCoches().subscribe(
      res => {
        console.log(res)
        this.coches = res.elemento
      },
      err => console.log(err)
    )
    this.tasksService.getVuelos().subscribe(
      res => {
        console.log(res)
        this.vuelos = res.elemento;
      },
      err => console.log(err)
    )
    this.tasksService.getHoteles().subscribe(
      res => {
        console.log(res)
        this.habitaciones = res.elemento;
      },
      err => console.log(err)
    )
  }

  reserva() {
    if (!this.authService.loggedIn()) {
      return;
    }
    console.log(this.item);
    this.authService.reservar(this.item).subscribe(
      res => {
        console.log(res);
        if (this.item.prov == 'coche') {
          var con = 0;
          for (let c of this.coches) {
            if (c.id == this.item.id) {
              this.coches.splice(con);
              break;
            }
            con++;
          }
        }
        else if (this.item.prov == 'vuelo') {
          var con = 0;
          for (let c of this.vuelos) {
            if (c.id == this.item.id) {
              this.vuelos.splice(con);
              break;
            }
            con++;
          }
        }
        else if (this.item.prov == 'hotel') {
          var con = 0;
          for (let c of this.habitaciones) {
            if (c.id == this.item.id) {
              this.habitaciones.splice(con);
              break;
            }
            con++;
          }
        }
        this.item = { prov: '', id: '' };
      },
      err => console.log(err)
    )
    window.location.reload();
  }  
}
