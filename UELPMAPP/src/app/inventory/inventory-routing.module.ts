import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { ItemMasterListComponent } from './components/item-master-list/item-master-list.component';
import { ItemMasterComponent } from './components/item-master/item-master.component';
import { MeasurementUnitListComponent } from './components/measurement-unit-list/measurement-unit-list.component';
import { MeasurementUnitComponent } from './components/measurement-unit/measurement-unit.component';
import { ItemCategoryOldComponent } from './components/item-category-old/item-category-old.component';
import { ItemCategoryListComponent } from './components/item-category-list/item-category-list.component';
import { ItemCategoryComponent } from './components/item-category/item-category.component';
import { ItemTypesOldComponent } from './components/item-types-old/item-types-old.component';
import { CostCentreOldComponent } from './components/cost-centre-old/cost-centre-old.component';
import { ItemTypesComponent } from './components/item-types/item-types.component';
import { CostCenterComponent } from './components/cost-center/cost-center.component';
const routes: Routes = [
  {
    path: '', component: InventoryLayoutComponent,  
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent     
      },
      {
        path: 'uom',
        component: MeasurementUnitListComponent      
      },
      {
        path: 'itemcategoryold',
        component: ItemCategoryOldComponent      
      }, 
      {
        path: 'itemcategory',
        component: ItemCategoryListComponent      
      }, 
      {
        path: 'itemcategory/:mode/:Id',
        component: ItemCategoryComponent
      }, 
      {
        path: 'itemtypesold',
        component: ItemTypesOldComponent      
      }, 
      {
        path: 'itemtypes',
        component: ItemTypesListComponent      
      }, 
      {
        path: 'itemtypes/:mode/:Id',
        component: ItemTypesComponent      
      }, 
      {
        path: 'itemmasterold',
        component: ItemMasterOldComponent      
      }, 
      {
        path: 'itemmaster',
        component: ItemMasterListComponent      
      }, 
      {
        path: 'itemmaster/:mode/:Id/:ReturnEntity',
        component: ItemMasterComponent      
      },   
      {
        path: 'uom/:mode/:Id/:ReturnEntity',
        component: MeasurementUnitComponent      
      },   
      {
        path: 'costcentreold',
        component: CostCentreOldComponent      
      }, 
     {
        path: 'costcenter',
        component: CostCenterListComponent      
      }, 
      {
        path: 'costcenter/:mode/:Id',
        component: CostCenterComponent      
      }, 

      {
        path: 'stockreceipt',
        component: StockReceiptComponent      
      }, 
      {
        path: 'barcode',
        component: BarCodeComponent      
      }, 
      {
        path: 'location/:type',
        component: LocationTransferComponent      
      },
      {
        path: 'inventoryadj',
        component: InventoryAdjComponent      
      }, 
      {
        path: 'inventoryrequest',
        component: InventoryRequestComponent      
      }, 
      
      {
        path: 'inventoryrequestapproval',
        component: InventoryRequestApprovalComponent      
      },  
      {
        path: 'inventoryreciept',
        component: InventoryRecieptComponent      
      }, 
      {
        path: 'inventoryinspection',
        component: InventoryInspectionComponent      
      }, 
      {
        path: 'itemlisting',
        component: ItemsListingComponent      
      },
      
      {
        path: 'itemsadjustment',
        component: ItemsAdjustmentComponent      
      }, 
      {
        path: 'adjustmentapproval',
        component: AdjustmentApprovalsComponent      
      }, 
      {
        path: 'adjustmentapproval',
        component: AdjustmentApprovalsComponent      
      }, 
      {
        path: 'disposalrequest',
        component: InventoryDisposalRequestesComponent      
      }, 
      {
        path: 'disposalapprovals',
        component: DisposalApprovalsComponent      
      }, 
      {
        path: 'cyclecount',
        component: CycleCountComponent      
      },   
      // {
      //   path: 'userprofile',
      //   component: UserProfileComponent      
      // },      
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
