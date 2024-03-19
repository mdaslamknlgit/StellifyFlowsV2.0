import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from "@angular/material/table";
import { TableModule } from "primeng/table";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { SharedModule } from '../shared/shared.module';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryLayoutComponent } from './components/inventory-layout/inventory-layout.component';
import { ItemMasterOldComponent } from './components/item-master-old/item-master-old.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {  CostCenterListComponent } from './components/cost-center-list/cost-center-list.component';
import {  ItemTypesListComponent } from './components/item-types-list/item-types-list.component';
import { StockReceiptComponent } from './components/stock-receipt/stock-receipt.component';
import { BarCodeComponent } from './components/bar-code/bar-code.component';
import { LocationTransferComponent } from './components/location-transfer/location-transfer.component';
import { InventoryAdjComponent } from './components/inventory-adj/inventory-adj.component';
import { ReportsComponent } from './components/reports/reports.component';
import { InventoryRequestComponent } from './components/inventory-request/inventory-request.component';
import { InventoryRequestApprovalComponent } from './components/inventory-request-approval/inventory-request-approval.component';
import { InventoryRecieptComponent } from './components/inventory-reciept/inventory-reciept.component';
import { InventoryInspectionComponent } from './components/inventory-inspection/inventory-inspection.component';
import { ItemsListingComponent } from './components/items-listing/items-listing.component';
import { TransforApprovalsComponent } from './components/transfor-approvals/transfor-approvals.component';
import { ItemsAdjustmentComponent } from './components/items-adjustment/items-adjustment.component';
import { AdjustmentApprovalsComponent } from './components/adjustment-approvals/adjustment-approvals.component';
import { InventoryDisposalRequestesComponent } from './components/inventory-disposal-requestes/inventory-disposal-requestes.component';
import { DisposalApprovalsComponent } from './components/disposal-approvals/disposal-approvals.component';
import { CycleCountComponent } from './components/cycle-count/cycle-count.component';
import { ConfirmDialogModule } from "primeng/confirmdialog";

// Import ngx-barcode module
import { NgxBarcodeModule } from 'ngx-barcode';
import { ItemMasterListComponent } from './components/item-master-list/item-master-list.component';
import { ItemMasterComponent } from './components/item-master/item-master.component';
import { MeasurementUnitListComponent } from './components/measurement-unit-list/measurement-unit-list.component';
import { MeasurementUnitComponent } from './components/measurement-unit/measurement-unit.component';
import { ItemCategoryOldComponent } from './components/item-category-old/item-category-old.component';
import { ItemCategoryListComponent } from './components/item-category-list/item-category-list.component';
import { AppCustomMaterialModuleModule } from '../shared/app-custom-material-module/app-custom-material-module.module';
import { ItemCategoryComponent } from './components/item-category/item-category.component';
import { BlockUIModule } from 'ng-block-ui';
import { ItemTypesOldComponent } from './components/item-types-old/item-types-old.component';
import { CostCentreOldComponent } from './components/cost-centre-old/cost-centre-old.component';
import { ItemTypesComponent } from './components/item-types/item-types.component';
import { CostCenterComponent  } from './components/cost-center/cost-center.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    TableModule,//prime ng table module
    ReactiveFormsModule,
    SharedModule,
    InventoryRoutingModule,
    PerfectScrollbarModule,
    NgbModule,
    MalihuScrollbarModule,
    MatSlideToggleModule,
    MatTableModule,
    ConfirmDialogModule,
    NgxBarcodeModule,
    AppCustomMaterialModuleModule,
    BlockUIModule.forRoot(),


  ],
  exports: [
    MatSlideToggleModule
  ],

  declarations: [InventoryLayoutComponent, ItemMasterOldComponent, ItemMasterListComponent,
    ItemMasterComponent,
    DashboardComponent, CostCentreOldComponent, CostCenterListComponent,CostCenterComponent,
    MeasurementUnitListComponent, MeasurementUnitComponent,
    ItemCategoryOldComponent, ItemCategoryListComponent,ItemCategoryComponent,
    ItemTypesOldComponent,
    ItemTypesListComponent, ItemTypesComponent,
    StockReceiptComponent, BarCodeComponent,
    LocationTransferComponent,
    InventoryAdjComponent,
    ReportsComponent,

    InventoryRequestComponent, InventoryRequestApprovalComponent, InventoryRecieptComponent,
    InventoryInspectionComponent, ItemsListingComponent, TransforApprovalsComponent, ItemsAdjustmentComponent,
    AdjustmentApprovalsComponent, InventoryDisposalRequestesComponent, DisposalApprovalsComponent, CycleCountComponent]

})
export class InventoryModule {


}
