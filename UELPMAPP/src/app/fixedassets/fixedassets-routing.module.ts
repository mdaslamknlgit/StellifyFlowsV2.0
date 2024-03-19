import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FixedassetsLayoutComponent } from './components/fixedassets-layout/fixedassets-layout.component';
import { AssetCategoryComponent } from './components/asset-category/asset-category.component';
import { AssetsTypesComponent } from './components/assets-types/assets-types.component';
import { AssetsComponent } from './components/assets/assets.component';
import { AssetsMasterComponent } from './components/asset-master/assets-master.component';
import { AssetsRegisterComponent } from './components/assets-register/assets-register.component';
import { AssetsTransferComponent } from './components/assets-transfer/assets-transfer.component';
import { AssetsDisposalComponent } from './components/assets-disposal/assets-disposal.component';
import { DepreciationManagementComponent } from './components/depreciation-management/depreciation-management.component';
import { DepreciationComponent } from "./components/depreciation/depreciation.component";

const routes: Routes = [
  {
    path: '', component: FixedassetsLayoutComponent,  
    children: [

      {
        path: 'assetcategory',
        component: AssetCategoryComponent     
      },  
       {
        path: 'assettypes',
        component: AssetsTypesComponent     
      },
      {
        path: 'assets',
        component: AssetsComponent     
      },
      {
        path: 'assetmaster',
        component: AssetsMasterComponent     
      },
      {
        path: 'assetregister',
        component: AssetsRegisterComponent     
      },
      {
        path: 'assettransfer/:type',
        component: AssetsTransferComponent     
      },
      {
        path: 'assetdisposal/:type',
        component: AssetsDisposalComponent,   
      },
      {
        path: 'assetdepreciation/:type',
        component: DepreciationManagementComponent     
      },
      {
        path:'depreciation',
        component:DepreciationComponent
      },
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
export class FixedassetsRoutingModule { }
