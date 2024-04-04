import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, UserDetails } from '../../../shared/models/shared.model';
import { FullScreen } from '../../../shared/shared';
import { SharedService } from '../../../shared/services/shared.service';
import { SupplierCategory } from "../../models/supplier-category.model";
import { SupplierCategoryService } from "../../services/supplier-category.service";
import { ConfirmationService } from 'primeng/primeng';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
  selector: 'app-supplier-category',
  templateUrl: './supplier-category.component.html',
  styleUrls: ['./supplier-category.component.css'],
  providers: [SupplierCategoryService]
})
export class SupplierCategoryComponent implements OnInit {

  hideText: boolean = true;
  hideInput: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  scrollbarOptions: any;
  supplierCategoriesList: Array<SupplierCategory> = [];
  supplierCategoryForm: FormGroup;
  selectedSupplierCategory: SupplierCategory;
  supplierCategoryListPagerConfig: PagerConfig;
  isSearchApplied: boolean = false;
  totalRecords: number = 0;
  suplliercategorySearchKey: string = "";
  filteredSuppliercategory: Array<SupplierCategory> = [];
  errorMessage: string = Messages.NoRecordsToDisplay;
  @ViewChild('rightPanel') rightPanelRef;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  showfilters:boolean=false;
    showfilterstext:string="Show List" ;
  public innerWidth: any;
  constructor(private formBuilderObj: FormBuilder,
    private supplierCategoryServiceObj: SupplierCategoryService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService) {

    this.supplierCategoryListPagerConfig = new PagerConfig();
    this.selectedSupplierCategory = new SupplierCategory();
    this.supplierCategoryListPagerConfig.RecordsToSkip = 0;
    this.supplierCategoryListPagerConfig.RecordsToFetch = 10;
    this.supplierCategoryForm = this.formBuilderObj.group({
      'CategoryText': [0, { validators: [Validators.required, this.noWhitespaceValidator]}],
      'Description': ["", { validators: [Validators.required, this.noWhitespaceValidator]}],
      'SupplierCategoryID': [0]
    });
  }
  ngOnInit() {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "suppliercategories")[0];
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.deletePermission = true;
    }

    this.getSupplierCategories(0);
    this.showfilters =false;
    this.showfilterstext="Hide List" ;
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getSupplierCategories(selectedSupplierCategoryId: number) {
    let supplierCategoryInput = {
      Search: "",
      Skip: this.supplierCategoryListPagerConfig.RecordsToSkip,
      Take: this.supplierCategoryListPagerConfig.RecordsToFetch
    };
    this.supplierCategoryServiceObj.getSupplierCategories(supplierCategoryInput)
      .subscribe((data: { SupplierCategory: Array<SupplierCategory>, TotalRecords: number }) => {
        this.supplierCategoriesList = data.SupplierCategory;
        this.supplierCategoryListPagerConfig.TotalRecords = data.TotalRecords;
        if (this.supplierCategoriesList.length > 0) {
          if (selectedSupplierCategoryId == 0) {
            this.onRecordSelection(this.supplierCategoriesList[0].SupplierCategoryID);
          }
          else {
            this.onRecordSelection(selectedSupplierCategoryId);
          }
        }
        else {
          this.addRecord();
        }
      });
  }


  GetAllSupplierCategories(searchString: string): void {

    let purchaseOrderDisplayInput = {
      Search: searchString,
      Skip: this.supplierCategoryListPagerConfig.RecordsToSkip,
      Take: this.supplierCategoryListPagerConfig.RecordsToFetch
    };

    this.supplierCategoryServiceObj.getSupplierCategories(purchaseOrderDisplayInput)
      .subscribe((data: { SupplierCategory: Array<SupplierCategory>, TotalRecords: number }) => {
        this.supplierCategoriesList = data.SupplierCategory;
        this.filteredSuppliercategory = this.supplierCategoriesList;
        this.totalRecords = data.TotalRecords;
        if (this.supplierCategoriesList.length > 0) {
          this.selectedSupplierCategory = this.supplierCategoriesList[0];
        }
        else {
          this.hideText = true;
          this.hideInput = false;
        }
      });
  }

  onSearch(event: any) {
    if (event.target.value != "") {

      this.supplierCategoryListPagerConfig.RecordsToSkip = 0;
      this.GetAllSupplierCategories(event.target.value);

    }
    else {
      //this.isSearchApplied = false;
      this.getSupplierCategories(0);
    }
  }



  onRecordSelection(selectedSupplierCategoryId: number) {
  this.split();
    this.supplierCategoryServiceObj.getSupplierCategoryDetails(selectedSupplierCategoryId)
      .subscribe((data: SupplierCategory) => {

        this.selectedSupplierCategory = data;
        this.supplierCategoryForm.patchValue(data);
        this.hideText = true;
        this.hideInput = false;

      }, () => {

      });
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
    this.supplierCategoryForm.reset();
    this.supplierCategoryForm.setErrors(null);
    this.supplierCategoryForm.patchValue(this.selectedSupplierCategory);
  }
  saveRecord() {
    let purchaseOrderFormStatus = this.supplierCategoryForm.status;
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    if (purchaseOrderFormStatus != "INVALID") {
      let paymentTermDetails: SupplierCategory = this.supplierCategoryForm.value;
      paymentTermDetails.CreatedBy = userDetails.UserID;
      if (this.selectedSupplierCategory.SupplierCategoryID == 0 || this.selectedSupplierCategory.SupplierCategoryID == null) {
        this.supplierCategoryServiceObj.createSupplierCategory(paymentTermDetails)
          .subscribe((savedRecordId: number) => {
            this.hideText = true;
            this.hideInput = false;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SavedSuccessFully,
              MessageType: MessageTypes.Success
            });
            this.getSupplierCategories(savedRecordId);
          }, (data: HttpErrorResponse) => {
            if (data.error.Message == ResponseStatusTypes.Duplicate) {
              this.showDuplicateMessage();
            }
          });
      }
      else {
        this.supplierCategoryServiceObj.updateSupplierCategory(paymentTermDetails)
          .subscribe((response) => {
            this.hideText = true;
            this.hideInput = false;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.UpdatedSuccessFully,
              MessageType: MessageTypes.Success
            });
            this.getSupplierCategories(paymentTermDetails.SupplierCategoryID);
          },
            (data: HttpErrorResponse) => {
              if (data.error.Message == ResponseStatusTypes.Duplicate) {
                this.showDuplicateMessage();
              }
            });
      }
    }
    else {
      Object.keys(this.supplierCategoryForm.controls).forEach((key: string) => {
        if (this.supplierCategoryForm.controls[key].status == "INVALID" && this.supplierCategoryForm.controls[key].touched == false) {
          this.supplierCategoryForm.controls[key].markAsTouched();
        }
      });
    }
  }
  showDuplicateMessage() {
    this.supplierCategoryForm.get('CategoryText').setErrors({ 'Duplicate': true });
  }
  onClickedOutside(e: Event) {
  //  this.showfilters= false; 
    if(this.showfilters == false){ 
    //  this.showfilterstext="Show List"
  }
  }
  split() {
    this.showfilters=!this.showfilters;
    if(this.showfilters == true){ 
    this.showfilterstext="Hide List" 
    }
    else{
      this.showfilterstext="Show List" 
    }
  }
  cancelRecord() {
    this.hideText = true;
    this.hideInput = false;
    this.selectedSupplierCategory = this.supplierCategoriesList[0];
  }
  addRecord() {

    this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }
  
    this.hideText = false;
    this.hideInput = true;
    this.selectedSupplierCategory = new SupplierCategory();
    this.supplierCategoryForm.reset();
    this.supplierCategoryForm.setErrors(null);
    this.supplierCategoryForm.patchValue(this.selectedSupplierCategory);
    this.showfilters =false;
    this.showfilterstext="Show List" ;
  }
  deleteRecord() {
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    let recordId = this.selectedSupplierCategory.SupplierCategoryID;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {

        this.supplierCategoryServiceObj.deleteSupplierCategory(recordId, userDetails.UserID).subscribe((data) => {
          if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SupplierCategoryValidationMessage,
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
          this.getSupplierCategories(0);
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
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }
  pageChange(currentPageNumber: any) {
    this.supplierCategoryListPagerConfig.RecordsToSkip = this.supplierCategoryListPagerConfig.RecordsToFetch * (currentPageNumber - 1);

    if (this.suplliercategorySearchKey != null && this.suplliercategorySearchKey != "") {
      this.GetAllSupplierCategories(this.suplliercategorySearchKey);
    }
    else {
      this.getSupplierCategories(0);
    }
  }
}
