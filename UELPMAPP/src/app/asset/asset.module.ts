import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AssetRoutingModule } from './asset-routing.module';
import { AssetLayoutComponent } from './components/asset-layout/asset-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,     
    SharedModule,
    AssetRoutingModule
  ],
  declarations: [AssetLayoutComponent, DashboardComponent]
})
export class AssetModule { }
