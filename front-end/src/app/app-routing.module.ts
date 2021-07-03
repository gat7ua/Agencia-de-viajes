import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {PrivateTComponent} from './components/private-t/private-t.component';
import {PublicTComponent} from './components/public-t/public-t.component';
import {SigninComponent} from './components/signin/signin.component';
import {SignupComponent} from './components/signup/signup.component';

import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/publict',
    pathMatch: 'full'
  },
  {
    path: 'publict',
    component: PublicTComponent
  },
  {
    path: 'privatet',
    component: PrivateTComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
