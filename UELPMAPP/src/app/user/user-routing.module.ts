import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserLayoutComponent } from './components/user-layout/user-layout.component';
import { LoginComponent } from './components/login/login.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
const routes: Routes = [
  {
    path: '', component: UserLayoutComponent,  
    children: [
       
      {
        path: 'login',
        component: LoginComponent      
      },    
      {
        path: 'forgetpassword',
        component: ForgetPasswordComponent      
      }, 
         
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
