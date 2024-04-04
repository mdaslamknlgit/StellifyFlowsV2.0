import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { NgxBarcodeModule } from 'ngx-barcode';
import { SharedModule } from '../shared/shared.module';
import { FixedassetsRoutingModule } from './fixedassets-routing.module';
import { FixedassetsLayoutComponent } from './components/fixedassets-layout/fixedassets-layout.component';
import { AssetCategoryComponent } from './components/asset-category/asset-category.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssetsTypesComponent } from './components/assets-types/assets-types.component';
import { AssetsComponent } from './components/assets/assets.component';
import { AssetsMasterComponent } from './components/asset-master/assets-master.component';
import { AssetsRegisterComponent } from './components/assets-register/assets-register.component';
import { AssetsTransferComponent } from './components/assets-transfer/assets-transfer.component';
import { AssetsDisposalComponent } from './components/assets-disposal/assets-disposal.component';
import { DepreciationManagementComponent } from './components/depreciation-management/depreciation-management.component';
import { DepreciationComponent } from "./components/depreciation/depreciation.component";
import { AssetPostingDetailsComponent } from "./components/asset-posting-details/asset-posting-details.component";

@NgModule({
  imports: [
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule, 
    CommonModule,
    DialogModule,
    SharedModule,
    TableModule,
    FixedassetsRoutingModule,
    NgbModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,
    NgxBarcodeModule
  ],
  declarations: [FixedassetsLayoutComponent,AssetCategoryComponent,
     DashboardComponent, AssetsTypesComponent, 
     AssetsComponent, AssetsMasterComponent,
     AssetsRegisterComponent, AssetsTransferComponent, 
     AssetsDisposalComponent,  DepreciationManagementComponent,
     DepreciationComponent,AssetPostingDetailsComponent]
})
export class FixedassetsModule { 


}
