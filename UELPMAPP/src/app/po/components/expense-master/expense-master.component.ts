import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { PagerConfig, Messages, UserDetails, MessageTypes, ResponseStatusTypes, Location } from '../../../shared/models/shared.model';
import { ExpenseMaster, ExpensesType } from '../../models/expense-master.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ExpenseMasterService } from '../../services/expense-master.service';
import { FullScreen } from '../../../shared/shared';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-expense-master',
  templateUrl: './expense-master.component.html',
  styleUrls: ['./expense-master.component.css'],
  providers:[ExpenseMasterService]
})
export class ExpenseMasterComponent implements OnInit {

@ViewChild('rightPanel') rightPanelRef;
@ViewChild('assetCategory') private assetCategoryRef: any;
hideText: boolean=true;
hideInput: boolean=false;
leftSection:boolean=false;
rightSection:boolean=false;
scrollbarOptions:any;
expenseMasterPagerConfig:PagerConfig;
expenseMasterForm:FormGroup;
expenseFilterForm:FormGroup;
showLeftPanelLoadingIcon:boolean=false;
selectedRecordDetails:ExpenseMaster;
expensesList:Array<ExpenseMaster> = [];
expenseTypes:Array<ExpensesType> = [];
departments:Location[] = [];
showRightPanelLoadingIcon:boolean =false;
currentPage:number =1;
searchKey:string="";
filterMessage: string = "";
showFilterPopUp:boolean=false;
isFilterApplied: boolean = false;
errorMessage = Messages.NoRecordsToDisplay;
public innerWidth: any;
constructor(private formBuilderObj:FormBuilder,
            public sessionService: SessionStorageService,
            private sharedServiceObj:SharedService,
            private confirmationServiceObj:ConfirmationService,
            private renderer:Renderer,
            private expenseMaterServiceObj:ExpenseMasterService) {

  this.expenseMasterPagerConfig = new PagerConfig();
  this.expenseMasterPagerConfig.RecordsToSkip = 0;
  this.expenseMasterPagerConfig.RecordsToFetch = 10;
  this.expenseMasterForm = this.formBuilderObj.group({
    'ExpensesMasterId':[0],
    'ExpensesDetail':["",Validators.required],
    'ExpensesTypeId':[0,[Validators.required]],
    'LocationID':[null,[Validators.required]]
  });
  this.expenseFilterForm = this.formBuilderObj.group({
    'ExpensesTypeId':[0],
    'LocationID':[""]
  });
}

ngOnInit() {
  this.selectedRecordDetails = new ExpenseMaster();
  this.getDepartments();
  this.getExpenseTypes();
  this.getExpenseMasters(0);
}

getExpenseMasters(expenseMasterId:number)
{
  let input = {
    Skip:this.expenseMasterPagerConfig.RecordsToSkip,
    Take:this.expenseMasterPagerConfig.RecordsToFetch
  };
  this.showLeftPanelLoadingIcon = true;
  this.expenseMaterServiceObj.getExpenseMaster(input)
      .subscribe((data:{ Expenses:Array<ExpenseMaster> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.expensesList = data.Expenses;
      this.expenseMasterPagerConfig.TotalRecords = data.TotalRecords;
      if(this.expensesList.length > 0)
      {
        if(expenseMasterId > 0)
        {
          this.onRecordSelection(expenseMasterId);
        }
        else
        {
          this.onRecordSelection(this.expensesList[0].ExpensesMasterId);
        }
      }
      else
      {
        this.selectedRecordDetails = new ExpenseMaster();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

getExpenseTypes()
{
  this.sharedServiceObj.getExpenseTypes()
  .subscribe((data:Array<ExpensesType>)=>{
    this.expenseTypes = data
  });
}

getDepartments()
{
  this.sharedServiceObj.getDepartments()
      .subscribe((data:Location[])=>{
          this.departments = data;
      });
}
searchForExpenseMaster(expenseTypeId:number=0,departmentId:number=0)
{
  let input = {
    Skip:this.expenseMasterPagerConfig.RecordsToSkip,
    Take:this.expenseMasterPagerConfig.RecordsToFetch,
    Search:this.searchKey==null?"":this.searchKey,
    ExpensesTypeId:expenseTypeId==null?0:expenseTypeId,
    DepartmentId:departmentId==null?0:departmentId
  };
  this.showLeftPanelLoadingIcon = true;
  this.expenseMaterServiceObj.searchExpenseMaster(input)
      .subscribe((data:{ Expenses:Array<ExpenseMaster> ,TotalRecords:number })=>{
          this.showFilterPopUp = false;
          this.showLeftPanelLoadingIcon = false;
          if(data.Expenses.length > 0)
          {
            this.expensesList = data.Expenses;
            this.expenseMasterPagerConfig.TotalRecords = data.TotalRecords;
            this.onRecordSelection(this.expensesList[0].ExpensesMasterId);
          }
          else 
          {
            this.showFilterPopUp = true;
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
  let status = this.expenseMasterForm.status;
  if(status!="INVALID")
  {
    let assetMasterData:ExpenseMaster = this.expenseMasterForm.value;
    let userDetails = <UserDetails>this.sessionService.getUser();
    assetMasterData.CreatedBy = userDetails.UserID;
    if(assetMasterData.ExpensesMasterId==null||assetMasterData.ExpensesMasterId==0)
    {
      assetMasterData.ExpensesMasterId = 0;

      this.expenseMaterServiceObj.createExpenseMaster(assetMasterData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.SavedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.expenseMasterPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getExpenseMasters(0);

      },(data:HttpErrorResponse)=>{       
          if(data.error.Message==ResponseStatusTypes.Duplicate)
          {
            this.showDuplicateMessage();
          }
      });
    }
    else
    {
      this.expenseMaterServiceObj.updateExpenseMaster(assetMasterData).subscribe((data)=>{
        this.sharedServiceObj.showMessage({
            ShowMessage:true,
            Message:Messages.UpdatedSuccessFully,
            MessageType:MessageTypes.Success
        });
        this.expenseMasterPagerConfig.RecordsToSkip = 0;
        this.currentPage = 1;
        this.getExpenseMasters(0);

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
      Object.keys(this.expenseMasterForm.controls).forEach((key:string) => {
          if(this.expenseMasterForm.controls[key].status=="INVALID" && this.expenseMasterForm.controls[key].touched==false)
          {
            this.expenseMasterForm.controls[key].markAsTouched();
          }
      });  
  }
}

showDuplicateMessage()
{
  this.expenseMasterForm.get('ExpensesDetail').setErrors({'duplicate':true});
}

editRecord()
{
  this.hideText = false;
  this.hideInput = true;
  this.clearForm();
  this.expenseMasterForm.patchValue(this.selectedRecordDetails);
}

clearForm()
{
  this.expenseMasterForm.reset();
  this.expenseMasterForm.setErrors(null);
}

onRecordSelection(expenseMasterId:number)
{
  this.showRightPanelLoadingIcon  = true;
  this.expenseMaterServiceObj.getExpenseMasterDetails(expenseMasterId)
      .subscribe((data:ExpenseMaster)=>{
        if (data != null)
        {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.expenseMasterForm.patchValue(data);
        }
        this.hideText=true;
        this.hideInput=false;

      },()=>{
        this.showRightPanelLoadingIcon = false;
      });
}

showFullScreen(){
  this.innerWidth = window.innerWidth;       
 
 if(this.innerWidth > 1000){ 
  FullScreen(this.rightPanelRef.nativeElement);
 }
 
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
  let recordId:number = this.selectedRecordDetails.ExpensesMasterId;
  let userDetails = <UserDetails>this.sessionService.getUser();
  this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header:Messages.DeletePopupHeader,
      accept: () => {     

        this.expenseMaterServiceObj.deleteExpenseMaster(recordId, userDetails.UserID).subscribe((data)=>{
              this.sharedServiceObj.showMessage({
                  ShowMessage:true,
                  Message:Messages.DeletedSuccessFully,
                  MessageType:MessageTypes.Success
              });
              this.getExpenseMasters(0);
        });
        
      },
      reject: () => {
      }
  });
}

onSearch(event: any) {
  if (event.target.value != "") {
      // if (event.target.value.length >= 3) {
        this.searchForExpenseMaster();
      //}
  }
  else {
    this.getExpenseMasters(0);
  }
}

pageChange(currentPageNumber:number)
{
  this.expenseMasterPagerConfig.RecordsToSkip = this.expenseMasterPagerConfig.RecordsToFetch*(currentPageNumber-1);
  if(this.searchKey==null||this.searchKey=="")
  {
    this.getExpenseMasters(0);
  }
  else
  {
    this.searchForExpenseMaster();
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
  this.expenseFilterForm.reset();
  this.filterMessage = "";
  this.isFilterApplied = false;
  this.getExpenseMasters(0);
  if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
  }
}

filterData() {      
  let expenseTypeId:number = 0;
  let departmentId:number = 0;
  this.filterMessage = "";
  if (this.expenseFilterForm.get('ExpensesTypeId').value != null) {
    expenseTypeId = this.expenseFilterForm.get('ExpensesTypeId').value;
  }
  if (this.expenseFilterForm.get('LocationID').value != "") {
    departmentId = this.expenseFilterForm.get('LocationID').value;
  }
  if ((expenseTypeId === 0 || expenseTypeId==null) && (departmentId == 0||departmentId == null)) {
      if (open) {
          this.filterMessage = "Please select any filter criteria";
      }
      return;
  }
  this.isFilterApplied = true;
  this.searchForExpenseMaster(expenseTypeId,departmentId);
}
}
