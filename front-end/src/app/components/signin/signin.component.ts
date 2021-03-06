import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  user = {
    user: '',
    password: ''
  }

  constructor(private authService : AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  signIn() {
    this.authService.signin(this.user).subscribe(
      res => {
        console.log(res)
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', this.user.user);
        this.router.navigate(['/privatet'])
      },
      err => console.log(err)
    )
  }
}
