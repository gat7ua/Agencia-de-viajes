import { Component, OnInit } from '@angular/core';
import { TasksService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-public-t',
  templateUrl: './public-t.component.html',
  styleUrls: ['./public-t.component.css']
})
export class PublicTComponent implements OnInit {

  coches = []
  vuelos = []
  habitaciones = []

  constructor(private tasksService: TasksService) { }

  ngOnInit(): void {
    this.tasksService.getCoches().subscribe(
      res => {
        console.log(res)
        this.coches = res;
      },
      err => console.log(err)
    )
    this.tasksService.getVuelos().subscribe(
      res => {
        console.log(res)
        this.vuelos = res;
      },
      err => console.log(err)
    )
    this.tasksService.getHoteles().subscribe(
      res => {
        console.log(res)
        this.habitaciones = res;
      },
      err => console.log(err)
    )
  }

}
