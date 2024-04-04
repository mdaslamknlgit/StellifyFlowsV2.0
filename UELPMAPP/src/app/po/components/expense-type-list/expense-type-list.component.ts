import { ExpenseType } from './../../models/expense-type.model';
import { ExpenseTypeService } from './../../services/expense-type-api-service';
import { FormBuilder, Validators, FormGroup,FormControl } from "@angular/forms";
import { Component, OnInit ,ViewChild} from '@angular/core';
import { SharedService } from "../../../shared/services/shared.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SessionStorageService } from "../../../shared/services/sessionstorage.service";
import { ConfirmationService } from "primeng/primeng";
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, UserDetails } from "../../../shared/models/shared.model";
import { FullScreen } from "../../../shared/shared";
import { Router } from '@angular/router';


@Component({
  selector: 'app-expense-type-list',
  templateUrl: './expense-type-list.component.html',
  styleUrls: ['./expense-type-list.component.css'],
  providers: [ExpenseTypeService]
})
export class ExpenseTypeListComponent  {
  @ViewChild('rightPanel') rightPanelRef;
  expenseTypeListCols: any[];
  hideText: boolean = true;
  hideInput: boolean = false;
  leftSection: boolean = false;
  rightSection: boolean = false;
  scrollbarOptions: any;
  expenseTypeList: Array<ExpenseType> = [];
  expenseTypeForm: FormGroup;
  selectedExpenseType: ExpenseType;
  expenseTypeListPagerConfig: PagerConfig;
  isSearchApplied: boolean = false;
  totalRecords: number = 0;
  filteredExpenseType: Array<ExpenseType> = [];
  serviceCategorySearchKey: string = "";
  errorMessage: string = Messages.NoRecordsToDisplay;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  expenseTypeSearchKey: string = "";
  public innerWidth: any;
  showfilters:boolean=false;
    showfilterstext:string="Hide List" ;

  constructor(private formBuilderObj: FormBuilder,
    private router: Router,
    private expenseTypeServiceObj: ExpenseTypeService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService) {

    this.expenseTypeListPagerConfig = new PagerConfig();
    this.selectedExpenseType = new ExpenseType();
    this.expenseTypeListPagerConfig.RecordsToSkip = 0;
    this.expenseTypeListPagerConfig.RecordsToFetch = 500;
    this.expenseTypeForm = this.formBuilderObj.group({
      'ExpenseTypeName':[0, { validators: [Validators.required, this.noWhitespaceValidator]}],
      'ExpenseTypeDescription': ["", { validators: [Validators.required, this.noWhitespaceValidator]}],
      'ExpenseTypeId': [0]
    });
  }

  ngOnInit() {
    this.getExpenseTypes(0);
    this.expenseTypeListCols = [
      { field: 'ExpenseTypeName', header: 'Expense Type Name', width: '500px' },
      { field: 'ExpenseTypeDescription', header: 'Description', width: '200px' },
      { field: '', header: 'Action', width: '100px'  },
  ];
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getExpenseTypes(selectedExpenseTypeId: number) {
     
    let expenseTypeInput = {
      Search: "",
      Skip: this.expenseTypeListPagerConfig.RecordsToSkip,
      Take: this.expenseTypeListPagerConfig.RecordsToFetch
    };
    this.expenseTypeServiceObj.getExpenseTypes(expenseTypeInput)
      .subscribe((data: { ExpenseTypes: Array<ExpenseType>, TotalRecords: number }) => {
        this.expenseTypeList = data.ExpenseTypes;
        this.expenseTypeListPagerConfig.TotalRecords = data.TotalRecords;
        if (this.expenseTypeList.length > 0) {
          // if (selectedExpenseTypeId == 0) {
          //   this.onRecordSelection(this.expenseTypeList[0].ExpenseTypeId);
          // }
          // else {
          //   this.onRecordSelection(selectedExpenseTypeId);
          // }
        }
        else {
          this.addRecord();
        }
      });
  }

  GetAllExpenseTypes(searchString: string): void {
    let expenseTypeDisplayInput = {
      Search: searchString,
      Skip: this.expenseTypeListPagerConfig.RecordsToSkip,
      Take: this.expenseTypeListPagerConfig.RecordsToFetch
    };
    this.expenseTypeServiceObj.getExpenseTypes(expenseTypeDisplayInput)
      .subscribe((data: { ExpenseTypes: Array<ExpenseType>, TotalRecords: number }) => {
         
        this.expenseTypeList = data.ExpenseTypes;
        this.filteredExpenseType = this.expenseTypeList;
        this.totalRecords = data.TotalRecords;
        if (this.filteredExpenseType.length > 0) {
          this.selectedExpenseType = this.filteredExpenseType[0];
        }
        else {
          this.hideText = true;
          this.hideInput = false;
        }
      });
  }

  // onRecordSelection(selectedExpenseTypeId: number) {
  //   this.split();
  //   this.expenseTypeServiceObj.getExpenseTypeDetails(selectedExpenseTypeId)
  //     .subscribe((data: ExpenseType) => {
  //       this.selectedExpenseType = data;
  //       this.expenseTypeForm.patchValue(data);
  //       this.hideText = true;
  //       this.hideInput = false;

  //     }, () => {

  //     });
  // }
  addRecord() { 
    this.router.navigate([`/po/expensetype/${0}`]);
    }
  resetFilters()
  {
    this.expenseTypeSearchKey="";
    this.getExpenseTypes(0);
  }
  RedirectExpenseType(selectedExpenseTypeId: number) {
    // this.split();
    // this.expenseTypeServiceObj.getExpenseTypeDetails(selectedExpenseTypeId)
    //   .subscribe((data: ExpenseType) => {
    //     this.selectedExpenseType = data;
    //     this.expenseTypeForm.patchValue(data);
    //     this.hideText = true;
    //     this.hideInput = false;

    //   }, () => {

    //   });
    this.router.navigate([`/po/expensetype/${selectedExpenseTypeId}`]);
  }


    hidefilter(){
      this.innerWidth = window.innerWidth;       
      if(this.innerWidth < 550){      
      $(".filter-scroll tr").click(function() {       
      $(".leftdiv").addClass("hideleftcol");
      $(".rightPanel").addClass("showrightcol");  
      $(".rightcol-scrroll").height("100%");  
        }); 
       }
    }

    editRecord() {
      //setting this variable to false so as to show the category details in edit mode
      this.hideInput = true;
      this.hideText = false;
      this.expenseTypeForm.reset();
      this.expenseTypeForm.setErrors(null);
      this.expenseTypeForm.patchValue(this.selectedExpenseType);
    }

    cancelRecord() {
      
        this.hideInput = false;
        this.hideText = true;      
      this.selectedExpenseType = this.expenseTypeList[0];
    }

    saveRecord() {
     
      let formStatus = this.expenseTypeForm.status;
      let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
      if (formStatus != "INVALID") {
  
        let expenseTypeDetails: ExpenseType = this.expenseTypeForm.value;
        expenseTypeDetails.CreatedBy = userDetails.UserID;
  
        if (this.selectedExpenseType.ExpenseTypeId == 0 || this.selectedExpenseType.ExpenseTypeId == null) {
          this.expenseTypeServiceObj.createExpenseType(expenseTypeDetails)
            .subscribe((savedRecordId: number) => {
              this.hideText = true;
              this.hideInput = false;
              this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: Messages.SavedSuccessFully,
                MessageType: MessageTypes.Success
              });
              this.getExpenseTypes(savedRecordId);
            },
              (data: HttpErrorResponse) => {
                if (data.error.Message == ResponseStatusTypes.Duplicate) {
                  this.showDuplicateMessage();
                }
              });
        }
        else {
          this.expenseTypeServiceObj.updateExpenseType(expenseTypeDetails)
            .subscribe((response) => {
              this.hideText = true;
              this.hideInput = false;
              this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: Messages.UpdatedSuccessFully,
                MessageType: MessageTypes.Success
              });
              this.getExpenseTypes(expenseTypeDetails.ExpenseTypeId);
            },
              (data: HttpErrorResponse) => {
                if (data.error.Message == ResponseStatusTypes.Duplicate) {
                  this.showDuplicateMessage();
                }
              });
        }
      }
      else {
        Object.keys(this.expenseTypeForm.controls).forEach((key: string) => {
          if (this.expenseTypeForm.controls[key].status == "INVALID" && this.expenseTypeForm.controls[key].touched == false) {
            this.expenseTypeForm.controls[key].markAsTouched();
          }
        });
      }
    }
    showDuplicateMessage() {
      this.expenseTypeForm.get('ExpenseTypeName').setErrors({ 'Duplicate': true });
    }
     

    onClickedOutside(e: Event) {
     // this.showfilters= false; 
      if(this.showfilters == false){ 
       // this.showfilterstext="Show List"
    }
    }
  split() {
  this.showfilters=!this.showfilters;
  if(this.showfilters == true){ 
  this.showfilterstext="Hide List" 
  }
  else{
    this.showfilterstext="Show List2" 
  }
  }

    deleteRecord() {

      let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
      let recordId = this.selectedExpenseType.ExpenseTypeId;
      this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header: Messages.DeletePopupHeader,
        accept: () => {
  
          this.expenseTypeServiceObj.deleteExpenseType(recordId, userDetails.UserID).subscribe((data) => {
            if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.ExpenseTypeValidationMessage,
              MessageType: MessageTypes.Error
            
            });
          }
          else
          {
              this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success
            
            });
          }
            
            this.getExpenseTypes(0);
          });
  
        },
        reject: () => {
        }
      });
    }
     
  
    showLeftCol(event)
    {
     $(".leftdiv").removeClass("hideleftcol");  
     $(".rightPanel").removeClass("showrightcol");  
    }
  
    showFullScreen() {
      this.innerWidth = window.innerWidth;       
   if(this.innerWidth > 1000){ 
      FullScreen(this.rightPanelRef.nativeElement);
   }
    }
    splite() {
      this.leftSection = !this.leftSection;
      this.rightSection = !this.rightSection;
    }
    pageChange(currentPageNumber: any) {
      this.expenseTypeListPagerConfig.RecordsToSkip = this.expenseTypeListPagerConfig.RecordsToFetch * (currentPageNumber - 1);
      this.getExpenseTypes(0);
      this.showfilters =false;
      this.showfilterstext="Hide List" ;
    }
    onSearch(event: any) {
      if (event.target.value != "") {
  
        this.GetAllExpenseTypes(event.target.value);
  
      }
      else {
        //this.isSearchApplied = false;
        this.getExpenseTypes(0);
      }
    }

}
