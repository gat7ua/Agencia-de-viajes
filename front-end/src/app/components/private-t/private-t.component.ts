import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TasksService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-private-t',
  templateUrl: './private-t.component.html',
  styleUrls: ['./private-t.component.css']
})
export class PrivateTComponent implements OnInit {

  reservas: any = [];

  prod = {
    id: '',
    prov: ''
  }

  constructor(private tasksService: TasksService, public authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    this.tasksService.getReservas().subscribe(
      res => {
        console.log(res)
        this.reservas = res;
      },
      err => console.log(err)
    )
  }

  borrarReserva() {
    this.tasksService.deleteReserva(this.prod).subscribe(
      res => {
        console.log(res);
        this.ngOnInit();
      },
      err => console.log(err)
    )
    console.log(this.prod);
  }

}
