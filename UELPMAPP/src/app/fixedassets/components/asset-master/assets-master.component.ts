import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService } from 'primeng/primeng';
import { FullScreen } from '../../../shared/shared';
import { PagerConfig, UserDetails, ResponseStatusTypes, Messages, MessageTypes, Suppliers } from '../../../shared/models/shared.model';
import { AssetMaster } from '../../models/asset-master.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { AssetCategories } from '../../models/asset-category.model';
import { AssetMasterService } from '../../services/asset-master.service';
import { AssetCategoryService } from "../../services/asset-category.service";
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-asset-master',
  templateUrl: './assets-master.component.html',
  styleUrls: ['./assets-master.component.css'],
  providers:[AssetMasterService,AssetCategoryService]
})
export class AssetsMasterComponent implements OnInit {

@ViewChild('rightPanel') rightPanelRef;
@ViewChild('assetCategory') private assetCategoryRef: any;
hideText: boolean=true;
hideInput: boolean=false;
leftSection:boolean=false;
rightSection:boolean=false;
scrollbarOptions:any;
assetMasterPagerConfig:PagerConfig;
assetMasterForm:FormGroup;
assetFilterForm:FormGroup;
showLeftPanelLoadingIcon:boolean=false;
selectedRecordDetails:AssetMaster;
assetsList:Array<AssetMaster>=[];
assetCategories:Array<AssetCategories>=[];
showRightPanelLoadingIcon:boolean =false;
currentPage:number =1;
searchKey:string="";
filterMessage: string = "";
showFilterPopUp:boolean=false;
isFilterApplied: boolean = false;
supplierGridColumns: Array<{ field: string, header: string }> = [];
linesToAdd:number=2;
gridSupplierRowId:number=0;
gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
errorMessage = Messages.NoRecordsToDisplay;

constructor(private formBuilderObj:FormBuilder,
            public sessionService: SessionStorageService,
            private sharedServiceObj:SharedService,
            private confirmationServiceObj:ConfirmationService,
            private renderer:Renderer,
            private assetEntryServiceObj:AssetMasterService,
            private assetCategoryServiceObj:AssetCategoryService) {

  this.assetMasterPagerConfig = new PagerConfig();
  this.assetMasterPagerConfig.RecordsToSkip = 0;
  this.assetMasterPagerConfig.RecordsToFetch = 10;
  this.assetMasterForm = this.formBuilderObj.group({
    'AssetId':[0],
    'AssetName':["",Validators.required],
    'AssetCategoryId':[0,[Validators.required]],
    'Warranty':[],
    'PreferredSuppliers':this.formBuilderObj.array([])
  });
  this.assetFilterForm = this.formBuilderObj.group({
    'AssetCategoryId':[0],
    'AssetName':[""]
  });
  this.supplierGridColumns = [
    { field: 'SNo', header: 'S.No' },
    { field: 'Name', header: 'Supplier Name' },
    { field: 'EmailId', header: 'Email' },
    { field: 'ContactNumber', header: 'Contact Number' }
];
}
initGridRows() {
  return this.formBuilderObj.group({
      'AssetPreferredSupplierId': 0,
      'AssetId':0,
      'Supplier':[null,Validators.required],
      "IsDeleted":[false]
  });
}

ngOnInit() {

  this.selectedRecordDetails = new AssetMaster();
  this.getAssetCategories();
  this.getAssets(0);
}

getAssets(assetId:number)
{
  let input = {
    Skip:this.assetMasterPagerConfig.RecordsToSkip,
    Take:this.assetMasterPagerConfig.RecordsToFetch
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetEntryServiceObj.getAssetMaster(input)
      .subscribe((data:{ Assets:Array<AssetMaster> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetsList = data.Assets;
      this.assetMasterPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetsList.length > 0)
      {
        if(assetId > 0)
        {
          this.onRecordSelection(assetId);
        }
        else
        {
          this.onRecordSelection(this.assetsList[0].AssetId);
        }
      }
      else
      {
        this.selectedRecordDetails = new AssetMaster();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

getAssetCategories()
{
  let inputRecord = {
    Skip:0,
    Take:0
  };
  this.assetCategoryServiceObj.searchAssetCategories(inputRecord)
  .subscribe((data:{ AssetCategories:Array<AssetCategories> ,TotalRecords:number })=>{
    this.assetCategories = data.AssetCategories;
  });
}

searchForAssets(assetCategoryId?:number,assetName?:string)
{
  let input = {
    Skip:this.assetMasterPagerConfig.RecordsToSkip,
    Take:this.assetMasterPagerConfig.RecordsToFetch,
    Search:this.searchKey==null?"":this.searchKey,
    AssetCategoryId:assetCategoryId==null?0:assetCategoryId,
    AssetName:assetName==null?"":assetName
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetEntryServiceObj.searchAssetMaster(input)
      .subscribe((data:{ Assets:Array<AssetMaster> ,TotalRecords:number })=>{

         this.showLeftPanelLoadingIcon = false;
          if(data.Assets.length > 0)
          {
             this.showFilterPopUp = false;
             this.assetsList = data.Assets;
             this.assetMasterPagerConfig.TotalRecords = data.TotalRecords;
             this.onRecordSelection(this.assetsList[0].AssetId);
          }
          else 
          {
            this.filterMessage = "No matching records are found";
          }
      },()=>{
        this.showLeftPanelLoadingIcon = false;
      });
}

addRecord(){
  this.hideText=false;
  this.hideInput=true;
  this.clearForm();
}

saveRecord()
{
  let status = this.assetMasterForm.status;
  if(status!="INVALID")
  {
    let assetMasterData:AssetMaster = this.assetMasterForm.value;
    let userDetails = <UserDetails>this.sessionService.getUser();
    assetMasterData.CreatedBy = userDetails.UserID;
    assetMasterData.PreferredSuppliers.forEach((data)=>{
      if(data.AssetId==null)
      {
        data.AssetId = 0;
      }
      if(data.AssetPreferredSupplierId==null)
      {
        data.AssetPreferredSupplierId=0;
      }
   });
    if(assetMasterData.AssetId==null||assetMasterData.AssetId==0)
    {
      assetMasterData.AssetId = 0;

      this.assetEntryServiceObj.createAssetMaster(assetMasterData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.SavedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.assetMasterPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getAssets(0);

      },(data:HttpErrorResponse)=>{       
          if(data.error.Message==ResponseStatusTypes.Duplicate)
          {
            this.showDuplicateMessage();
          }
      });
    }
    else
    {
      this.assetEntryServiceObj.updateAssetMaster(assetMasterData).subscribe((data)=>{

        this.sharedServiceObj.showMessage({
            ShowMessage:true,
            Message:Messages.UpdatedSuccessFully,
            MessageType:MessageTypes.Success
        });
        this.assetMasterPagerConfig.RecordsToSkip = 0;
        this.currentPage = 1;
        this.getAssets(0);
      },(data:HttpErrorResponse)=>{       
          if(data.error.Message==ResponseStatusTypes.Duplicate)
          {
            this.showDuplicateMessage();
          }
      });
    }
  }
  else
  {
      Object.keys(this.assetMasterForm.controls).forEach((key:string) => {
          if(this.assetMasterForm.controls[key].status=="INVALID" && this.assetMasterForm.controls[key].touched==false)
          {
            this.assetMasterForm.controls[key].markAsTouched();
          }
      });  
  }
}

showDuplicateMessage()
{
  this.assetMasterForm.get('AssetCategory').setErrors({'duplicate':true});
}

editRecord()
{
  this.hideText = false;
  this.hideInput = true;
  this.clearForm();
  this.addGridItem(this.selectedRecordDetails.PreferredSuppliers.length);
  this.assetMasterForm.patchValue(this.selectedRecordDetails);
  let itemGroupControl = <FormArray>this.assetMasterForm.controls['PreferredSuppliers'];
  for(let i=0;i<itemGroupControl.controls.length;i++)
  {
    itemGroupControl.controls[i].get('Supplier').disable();
  }
}

clearForm()
{
  this.assetMasterForm.reset();
  this.assetMasterForm.get('PreferredSuppliers').reset();
  this.assetMasterForm.setErrors(null);
  let prefferedSupplierControl = <FormArray>this.assetMasterForm.controls['PreferredSuppliers'];
  prefferedSupplierControl.controls = [];
  prefferedSupplierControl.controls.length = 0;
}

onRecordSelection(assetId:number)
{
  this.showRightPanelLoadingIcon  = true;
  this.assetEntryServiceObj.getAssetMasterDetails(assetId)
      .subscribe((data:AssetMaster)=>{
        if (data != null)
        {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.assetMasterForm.patchValue(data);
        }
        this.hideText=true;
        this.hideInput=false;

      },()=>{
        this.showRightPanelLoadingIcon = false;
      });
}

showFullScreen(){
  FullScreen(this.rightPanelRef.nativeElement);
}

split(){ 
  this.leftSection= !this.leftSection;
  this.rightSection= !this.rightSection;
}

cancelRecord(){ 
  this.hideText=true;
  this.hideInput=false;
}

deleteRecord()
{
  let recordId:number = this.selectedRecordDetails.AssetId;
  let userDetails = <UserDetails>this.sessionService.getUser();
  this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header:Messages.DeletePopupHeader,
      accept: () => {     

        this.assetEntryServiceObj.deleteAssetMaster(recordId, userDetails.UserID).subscribe((data)=>{
              this.sharedServiceObj.showMessage({
                  ShowMessage:true,
                  Message:Messages.DeletedSuccessFully,
                  MessageType:MessageTypes.Success
              });
              this.getAssets(0);
        });
        
      },
      reject: () => {
      }
  });
}

onSearch(event: any) {
  if (event.target.value != "") {
      // if (event.target.value.length >= 3) {
        this.searchForAssets();
      //}
  }
  else {
    this.getAssets(0);
  }
}

pageChange(currentPageNumber:number)
{
  this.assetMasterPagerConfig.RecordsToSkip = this.assetMasterPagerConfig.RecordsToFetch*(currentPageNumber-1);
  let assetFilterData =  this.assetFilterForm.value;
  if((this.searchKey==null||this.searchKey=="")
    &&(assetFilterData.AssetCategoryId === 0 || assetFilterData.AssetCategoryId ==null) && assetFilterData.AssetName=='')
  {
    this.getAssets(0);
  }
  else
  {
    this.searchForAssets(assetFilterData.AssetCategoryId,assetFilterData.AssetName);
  }
}

openDialog() {
  this.showFilterPopUp = true;
  if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
  }
}

resetData() {
  this.isFilterApplied = false;
  this.showFilterPopUp = true;
  this.resetFilters();
}

resetFilters() {
  this.assetFilterForm.reset();
  this.filterMessage = "";
  this.isFilterApplied = false;
  this.getAssets(0);
  if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
  }
}

filterData() {      
  let assetCategoryId = 0;
  let assetName = "";
  this.filterMessage = "";
  if (this.assetFilterForm.get('AssetCategoryId').value != null) {
    assetCategoryId = this.assetFilterForm.get('AssetCategoryId').value;
  }
  if (this.assetFilterForm.get('AssetName').value != "") {
    assetName = this.assetFilterForm.get('AssetName').value;
  }
  if ((assetCategoryId === 0 || assetCategoryId==null) && (assetName=='' || assetName === null)) {
      if (open) {
          this.filterMessage = "Please select any filter criteria";
      }
      return;
  }
  this.isFilterApplied = true;
  this.searchForAssets(assetCategoryId,assetName);
}

  //adding row to the grid..
  addGridItem(noOfLines: number) {
      let itemGroupControl = <FormArray>this.assetMasterForm.controls['PreferredSuppliers'];
      for (let i = 0; i < noOfLines; i++) {
          itemGroupControl.push(this.initGridRows());
      }
  }
  /**
   * to remove the grid item...
   */
  removeGridItem(rowIndex: number) {
    let itemGroupControl = <FormArray>this.assetMasterForm.controls['PreferredSuppliers'];

    if(itemGroupControl.controls[rowIndex].get('AssetPreferredSupplierId').value >0)
    {
      itemGroupControl.controls[rowIndex].patchValue({ IsDeleted:true })
    }
    else{
      itemGroupControl.removeAt(rowIndex);
    }  
  }

  //this method is used to format the content to be display in the autocomplete textbox after selection..
  supplierInputFormater = (x: Suppliers) => x.SupplierName;
  //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
  supplierSearch = (text$: Observable<string>) =>
      text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => {
              if (term == "") {
                  let itemGroupControl = <FormArray>this.assetMasterForm.controls['PreferredSuppliers'];
                  itemGroupControl.controls[this.gridSupplierRowId].reset();
                  return of([]);
              }
              return this.sharedServiceObj.getSuppliers({
                  searchKey: term,
                  supplierTypeId: 1,
                  CompanyId:this.sessionService.getCompanyId()
              }).pipe(
                  catchError(() => {
                      return of([]);
                  }))
          })
      );
    onItemSupplierClick(rowId:number)
    {
      this.gridSupplierRowId = rowId;
    }

}
