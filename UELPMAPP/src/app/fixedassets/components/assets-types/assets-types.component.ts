import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { FullScreen } from '../../../shared/shared';
import { AssetTypes } from '../../models/asset-type.model';
import { PagerConfig, UserDetails, Messages, MessageTypes, ResponseStatusTypes } from '../../../shared/models/shared.model';
import { AssetTypeService } from '../../services/asset-type.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-assets-types',
  templateUrl: './assets-types.component.html',
  styleUrls: ['./assets-types.component.css'],
  providers:[AssetTypeService]
})
export class AssetsTypesComponent implements OnInit {

assetTypesList:Array<AssetTypes>=[];
selectedRecordDetails:AssetTypes;
assetTypePagerConfig:PagerConfig;
showLeftPanelLoadingIcon:boolean=false;
showRightPanelLoadingIcon:boolean=false;
assetTypesForm:FormGroup;
hideText: boolean=true;
hideInput: boolean=false;
leftSection:boolean=false;
rightSection:boolean=false;
scrollbarOptions:any;
currentPage:number=1;
searchKey:string="";
errorMessage: string = Messages.NoRecordsToDisplay;
@ViewChild('rightPanel') rightPanelRef;
newPermission: boolean;
editPermission: boolean;
deletePermission: boolean;
constructor(private assetTypeServiceObj:AssetTypeService,
            private formBuilderObj:FormBuilder,
            public sessionService: SessionStorageService,
            private sharedServiceObj:SharedService,
            private confirmationServiceObj:ConfirmationService) {

  this.assetTypePagerConfig = new PagerConfig();
  this.selectedRecordDetails = new AssetTypes();
  this.assetTypePagerConfig.RecordsToSkip = 0;
  this.assetTypePagerConfig.RecordsToFetch = 5;
  this.assetTypesForm = this.formBuilderObj.group({
    'AssetTypeId':[""],
    'AssetType':["",[Validators.required]],
    'Description':[0]
  });
}

ngOnInit() {
  let roleAccessLevels = this.sessionService.getRolesAccess();
  if (roleAccessLevels != null && roleAccessLevels.length > 0) { 
    let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "assettypes")[0];     
    this.newPermission = formRole.IsAdd;
    this.editPermission = formRole.IsEdit;
    this.deletePermission = formRole.IsDelete;
  }
  else{
    this.newPermission = true;     
    this.editPermission = true;
    this.deletePermission = true;    
  }
  
  this.getAssetTypes(0);
}

showFullScreen(){
  FullScreen(this.rightPanelRef.nativeElement);
}

getAssetTypes(costCentreId:number)
{
  let input = {
    Skip:this.assetTypePagerConfig.RecordsToSkip,
    Take:this.assetTypePagerConfig.RecordsToFetch
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetTypeServiceObj.getAssetType(input).subscribe((data:{ AssetTypes:Array<AssetTypes> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetTypesList = data.AssetTypes;
      this.assetTypePagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetTypesList.length > 0)
      {
        if(costCentreId > 0)
        {
          this.onRecordSelection(costCentreId);
        }
        else
        {
          this.onRecordSelection(this.assetTypesList[0].AssetTypeId);
        }
      }
      else
      {
        this.selectedRecordDetails = new AssetTypes();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

searchForAssetTypes()
{
  let input = {
    Skip:this.assetTypePagerConfig.RecordsToSkip,
    Take:this.assetTypePagerConfig.RecordsToFetch,
    Search:this.searchKey
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetTypeServiceObj.searchAssetTypes(input).subscribe((data:{ AssetTypes:Array<AssetTypes> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetTypesList = data.AssetTypes;
      this.assetTypePagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetTypesList.length > 0)
      {
        this.onRecordSelection(this.assetTypesList[0].AssetTypeId);
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

onRecordSelection(assetTypeId:number)
{
  this.showRightPanelLoadingIcon  = true;
  this.assetTypeServiceObj.getAssetTypeDetails(assetTypeId)
      .subscribe((data:AssetTypes)=>{
        if (data != null)
        {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.assetTypesForm.patchValue(data);
        }
        this.hideText=true;
        this.hideInput=false;

      },()=>{
        this.showRightPanelLoadingIcon = false;
      });
}

addRecord(){
  this.hideText=false;
  this.hideInput=true;
  this.clearForm();
}
editRecord()
{
  this.hideText = false;
  this.hideInput = true;
  this.clearForm();
  this.assetTypesForm.patchValue(this.selectedRecordDetails);
}
cancelRecord(){ 
  this.hideText=true;
  this.hideInput=false;
}
clearForm()
{
  this.assetTypesForm.reset();
}
saveRecord()
{
  let status = this.assetTypesForm.status;
  if(status!="INVALID")
  {
    let assetTypeData:AssetTypes = this.assetTypesForm.value;
    let userDetails = <UserDetails>this.sessionService.getUser();
    assetTypeData.CreatedBy = userDetails.UserID;
    if(assetTypeData.AssetTypeId==null||assetTypeData.AssetTypeId==0)
    {
      assetTypeData.AssetTypeId = 0;
      this.assetTypeServiceObj.createAssetType(assetTypeData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.SavedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.assetTypePagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getAssetTypes(0);

      },(data:HttpErrorResponse)=>{       
          if(data.error.Message==ResponseStatusTypes.Duplicate)
          {
            this.showDuplicateMessage();
          }
      });
    }
    else
    {
      this.assetTypeServiceObj.updateAssetType(assetTypeData).subscribe((data)=>{

        this.sharedServiceObj.showMessage({
            ShowMessage:true,
            Message:Messages.UpdatedSuccessFully,
            MessageType:MessageTypes.Success
        });
        this.assetTypePagerConfig.RecordsToSkip = 0;
        this.currentPage = 1;
        this.getAssetTypes(0);

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
      Object.keys(this.assetTypesForm.controls).forEach((key:string) => {
          if(this.assetTypesForm.controls[key].status=="INVALID" && this.assetTypesForm.controls[key].touched==false)
          {
            this.assetTypesForm.controls[key].markAsTouched();
          }
      });  
  }
}
showDuplicateMessage()
{
  this.assetTypesForm.get('AssetType').setErrors({'duplicate':true});
}
split(){ 
  this.leftSection= !this.leftSection;
  this.rightSection= !this.rightSection;
}
onSearch(event: any) {
  if (event.target.value != "") {
      this.searchForAssetTypes();
  }
  else {
    this.getAssetTypes(0);
  }
}
pageChange(currentPageNumber:number)
{
  this.assetTypePagerConfig.RecordsToSkip = this.assetTypePagerConfig.RecordsToFetch*(currentPageNumber-1);
  if(this.searchKey==null||this.searchKey=="")
  {
    this.getAssetTypes(0);
  }
  else
  {
    this.searchForAssetTypes();
  }
}
deleteRecord()
{
  let recordId:number = this.selectedRecordDetails.AssetTypeId;
  let userDetails = <UserDetails >this.sessionService.getUser();
  this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header:Messages.DeletePopupHeader,
      accept: () => {     

        this.assetTypeServiceObj.deleteAssetType(recordId, userDetails.UserID).subscribe((data)=>{
              this.sharedServiceObj.showMessage({
                  ShowMessage:true,
                  Message:Messages.DeletedSuccessFully,
                  MessageType:MessageTypes.Success
              });
              this.getAssetTypes(0);
        });
        
      },
      reject: () => {
      }
  });
}

}
