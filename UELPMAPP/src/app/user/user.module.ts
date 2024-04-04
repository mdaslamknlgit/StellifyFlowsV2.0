import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { UserRoutingModule } from './user-routing.module';
import { DialogModule } from "primeng/dialog";
import { UserLayoutComponent } from './components/user-layout/user-layout.component';
import { LoginComponent } from './components/login/login.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,     
    SharedModule,
    PerfectScrollbarModule,
    NgbModule,
    MalihuScrollbarModule,
     MatSlideToggleModule,   
    MatCheckboxModule,
    UserRoutingModule,
    DialogModule
  ],
  declarations: [ UserLayoutComponent, LoginComponent, ForgetPasswordComponent]
})
export class UserModule { }
