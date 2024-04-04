import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { FullScreen } from '../../../shared/shared';
import { PagerConfig, UserDetails, Messages, MessageTypes, ResponseStatusTypes } from '../../../shared/models/shared.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { DepreciationService } from '../../services/depreciation.service';
import { Depreciation } from '../../models/depreciation.model';

@Component({
  selector: 'app-depreciation',
  templateUrl: './depreciation.component.html',
  styleUrls: ['./depreciation.component.css'],
  providers:[DepreciationService]
})
export class DepreciationComponent implements OnInit {

depreciationsList:Array<Depreciation>=[];
selectedRecordDetails:Depreciation;
depreciationPagerConfig:PagerConfig;
showLeftPanelLoadingIcon:boolean=false;
showRightPanelLoadingIcon:boolean=false;
depreciationForm:FormGroup;
hideText: boolean=true;
hideInput: boolean=false;
leftSection:boolean=false;
rightSection:boolean=false;
scrollbarOptions:any;
currentPage:number=1;
searchKey:string="";
errorMessage: string = Messages.NoRecordsToDisplay;
@ViewChild('rightPanel') rightPanelRef;

constructor(private depreciationServiceObj:DepreciationService,
            private formBuilderObj:FormBuilder,
            public sessionService: SessionStorageService,
            private sharedServiceObj:SharedService,
            private confirmationServiceObj:ConfirmationService) {

  this.depreciationPagerConfig = new PagerConfig();
  this.selectedRecordDetails = new Depreciation();
  this.depreciationPagerConfig.RecordsToSkip = 0;
  this.depreciationPagerConfig.RecordsToFetch = 10;
  this.depreciationForm = this.formBuilderObj.group({
    'DepreciationId':[""],
    'Name':["",[Validators.required]],
    'Description':[0]
  });
}

ngOnInit() {

  this.getDepreciations(0);
}

showFullScreen(){
  FullScreen(this.rightPanelRef.nativeElement);
}

getDepreciations(depreciationId:number)
{
  let input = {
    Skip:this.depreciationPagerConfig.RecordsToSkip,
    Take:this.depreciationPagerConfig.RecordsToFetch
  };
  this.showLeftPanelLoadingIcon = true;
  this.depreciationServiceObj.getDepreciations(input).subscribe((data:{ Depreciations:Array<Depreciation> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.depreciationsList = data.Depreciations;
      this.depreciationPagerConfig.TotalRecords = data.TotalRecords;
      if(this.depreciationsList.length > 0)
      {
        if(depreciationId > 0)
        {
          this.onRecordSelection(depreciationId);
        }
        else
        {
          this.onRecordSelection(this.depreciationsList[0].DepreciationId);
        }
      }
      else
      {
        this.selectedRecordDetails = new Depreciation();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

searchForDepreciations()
{
  let input = {
    Skip:this.depreciationPagerConfig.RecordsToSkip,
    Take:this.depreciationPagerConfig.RecordsToFetch,
    Search:this.searchKey
  };
  this.showLeftPanelLoadingIcon = true;
  this.depreciationServiceObj.searchDepreciation(input).subscribe((data:{ Depreciations:Array<Depreciation> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.depreciationsList = data.Depreciations;
      this.depreciationPagerConfig.TotalRecords = data.TotalRecords;
      if(this.depreciationsList.length > 0)
      {
        this.onRecordSelection(this.depreciationsList[0].DepreciationId);
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

onRecordSelection(depreciationId:number)
{
  this.showRightPanelLoadingIcon  = true;
  this.depreciationServiceObj.getDepreciationDetails(depreciationId)
      .subscribe((data:Depreciation)=>{
        if (data != null)
        {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.depreciationForm.patchValue(data);
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
  this.depreciationForm.patchValue(this.selectedRecordDetails);
}
cancelRecord(){ 
  this.hideText=true;
  this.hideInput=false;
}
clearForm()
{
  this.depreciationForm.reset();
}
saveRecord()
{
  let status = this.depreciationForm.status;
  if(status!="INVALID")
  {
    let depreciationData:Depreciation = this.depreciationForm.value;
    let userDetails = <UserDetails>this.sessionService.getUser();
    depreciationData.CreatedBy = userDetails.UserID;
    if(depreciationData.DepreciationId==null||depreciationData.DepreciationId==0)
    {
      depreciationData.DepreciationId = 0;
      this.depreciationServiceObj.createDepreciation(depreciationData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.SavedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.depreciationPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getDepreciations(0);

      },(data:HttpErrorResponse)=>{       
          if(data.error.Message==ResponseStatusTypes.Duplicate)
          {
            this.showDuplicateMessage();
          }
      });
    }
    else
    {
      this.depreciationServiceObj.updateDepreciation(depreciationData).subscribe((data)=>{

        this.sharedServiceObj.showMessage({
            ShowMessage:true,
            Message:Messages.UpdatedSuccessFully,
            MessageType:MessageTypes.Success
        });
        this.depreciationPagerConfig.RecordsToSkip = 0;
        this.currentPage = 1;
        this.getDepreciations(0);

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
      Object.keys(this.depreciationForm.controls).forEach((key:string) => {
          if(this.depreciationForm.controls[key].status=="INVALID" && this.depreciationForm.controls[key].touched==false)
          {
            this.depreciationForm.controls[key].markAsTouched();
          }
      });  
  }
}
showDuplicateMessage()
{
  this.depreciationForm.get('Name').setErrors({'duplicate':true});
}
split(){ 
  this.leftSection= !this.leftSection;
  this.rightSection= !this.rightSection;
}
onSearch(event: any) {
  if (event.target.value != "") {
      this.searchForDepreciations();
  }
  else {
    this.getDepreciations(0);
  }
}
pageChange(currentPageNumber:number)
{
  this.depreciationPagerConfig.RecordsToSkip = this.depreciationPagerConfig.RecordsToFetch*(currentPageNumber-1);
  if(this.searchKey==null||this.searchKey=="")
  {
    this.getDepreciations(0);
  }
  else
  {
    this.searchForDepreciations();
  }
}
deleteRecord()
{
  let recordId:number = this.selectedRecordDetails.DepreciationId;
  let userDetails = <UserDetails >this.sessionService.getUser();
  this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header:Messages.DeletePopupHeader,
      accept: () => {     

        this.depreciationServiceObj.deleteDepreciation(recordId, userDetails.UserID).subscribe((data)=>{
              this.sharedServiceObj.showMessage({
                  ShowMessage:true,
                  Message:Messages.DeletedSuccessFully,
                  MessageType:MessageTypes.Success
              });
              this.getDepreciations(0);
        });
        
      },
      reject: () => {
      }
  });
}

}
