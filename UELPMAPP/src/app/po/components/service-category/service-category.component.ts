import { Component, ViewChild } from "@angular/core";
import { FormBuilder, Validators, FormGroup,FormControl } from "@angular/forms";
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, UserDetails } from "../../../shared/models/shared.model";
import { FullScreen } from "../../../shared/shared";
import { ConfirmationService } from "primeng/primeng";
import { ServiceCategory } from "../../models/service-category.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ServiceCategoryService } from "../../services/service-category.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SessionStorageService } from "../../../shared/services/sessionstorage.service";

@Component({
  selector: "app-service-category",
  templateUrl: "./service-category.component.html",
  styleUrls: ["./service-category.component.css"],
  providers: [ServiceCategoryService]
})
export class ServiceCategoryComponent {
  @ViewChild('rightPanel') rightPanelRef;
  hideText: boolean = true;
  hideInput: boolean = false;
  leftSection: boolean = false;
  rightSection: boolean = false;
  scrollbarOptions: any;
  serviceCategoriesList: Array<ServiceCategory> = [];
  serviceCategoryForm: FormGroup;
  selectedServiceCategory: ServiceCategory;
  serviceCategoryListPagerConfig: PagerConfig;
  isSearchApplied: boolean = false;
  totalRecords: number = 0;
  filteredServiceCategory: Array<ServiceCategory> = [];
  serviceCategorySearchKey: string = "";
  errorMessage: string = Messages.NoRecordsToDisplay;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  public innerWidth: any;
  showfilters:boolean=true;
  showfilterstext:string="Hide List" ;
  constructor(private formBuilderObj: FormBuilder,
    private serviceCategoryServiceObj: ServiceCategoryService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService) {

    this.serviceCategoryListPagerConfig = new PagerConfig();
    this.selectedServiceCategory = new ServiceCategory();
    this.serviceCategoryListPagerConfig.RecordsToSkip = 0;
    this.serviceCategoryListPagerConfig.RecordsToFetch = 10;
    this.serviceCategoryForm = this.formBuilderObj.group({
      'CategoryName':[0, { validators: [Validators.required, this.noWhitespaceValidator]}],
      'CategoryDescription': ["", { validators: [Validators.required, this.noWhitespaceValidator]}],
      'ServiceCategoryId': [0]
    });
  }
  ngOnInit() {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "servicecategory")[0];
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
    }
    else{
      this.newPermission = true;     
      this.editPermission = true;     
      this.deletePermission = true;  
    }
    
    this.getServiceCategories(0);
    this.showfilters =false;
    this.showfilterstext="Hide List" ;
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }


  getServiceCategories(selectedServiceCategoryId: number) {
    let supplierCategoryInput = {
      Search: "",
      Skip: this.serviceCategoryListPagerConfig.RecordsToSkip,
      Take: this.serviceCategoryListPagerConfig.RecordsToFetch
    };
    this.serviceCategoryServiceObj.getServiceCategories(supplierCategoryInput)
      .subscribe((data: { ServiceCategories: Array<ServiceCategory>, TotalRecords: number }) => {
        this.serviceCategoriesList = data.ServiceCategories;
        this.serviceCategoryListPagerConfig.TotalRecords = data.TotalRecords;
        if (this.serviceCategoriesList.length > 0) {
          if (selectedServiceCategoryId == 0) {
            this.onRecordSelection(this.serviceCategoriesList[0].ServiceCategoryId);
          }
          else {
            this.onRecordSelection(selectedServiceCategoryId);
          }
        }
        else {
          this.addRecord();
        }
      });
  }


  GetAllServiceCategories(searchString: string): void {
    let purchaseOrderDisplayInput = {
      Search: searchString,
      Skip: this.serviceCategoryListPagerConfig.RecordsToSkip,
      Take: this.serviceCategoryListPagerConfig.RecordsToFetch
    };
    this.serviceCategoryServiceObj.getServiceCategories(purchaseOrderDisplayInput)
      .subscribe((data: { ServiceCategories: Array<ServiceCategory>, TotalRecords: number }) => {
        this.serviceCategoriesList = data.ServiceCategories;
        this.filteredServiceCategory = this.serviceCategoriesList;
        this.totalRecords = data.TotalRecords;
        if (this.filteredServiceCategory.length > 0) {
          this.selectedServiceCategory = this.filteredServiceCategory[0];
        }
        else {
          this.hideText = true;
          this.hideInput = false;
        }
      });
  }

  onSearch(event: any) {
    if (event.target.value != "") {

      this.GetAllServiceCategories(event.target.value);

    }
    else {
      //this.isSearchApplied = false;
      this.getServiceCategories(0);
    }
  }


  onRecordSelection(selectedSupplierCategoryId: number) {  
   this.split();
    this.serviceCategoryServiceObj.getServiceCategoryDetails(selectedSupplierCategoryId)
      .subscribe((data: ServiceCategory) => {
        this.selectedServiceCategory = data;
        this.serviceCategoryForm.patchValue(data);
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
    this.serviceCategoryForm.reset();
    this.serviceCategoryForm.setErrors(null);
    this.serviceCategoryForm.patchValue(this.selectedServiceCategory);
  }
  saveRecord() {
    let formStatus = this.serviceCategoryForm.status;
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    if (formStatus != "INVALID") {

      let serviceCategoryDetails: ServiceCategory = this.serviceCategoryForm.value;
      serviceCategoryDetails.CreatedBy = userDetails.UserID;

      if (this.selectedServiceCategory.ServiceCategoryId == 0 || this.selectedServiceCategory.ServiceCategoryId == null) {
        this.serviceCategoryServiceObj.createServiceCategory(serviceCategoryDetails)
          .subscribe((savedRecordId: number) => {
            this.hideText = true;
            this.hideInput = false;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SavedSuccessFully,
              MessageType: MessageTypes.Success
            });
            this.getServiceCategories(savedRecordId);
          },
            (data: HttpErrorResponse) => {
              if (data.error.Message == ResponseStatusTypes.Duplicate) {
                this.showDuplicateMessage();
              }
            });
      }
      else {
        this.serviceCategoryServiceObj.updateServiceCategory(serviceCategoryDetails)
          .subscribe((response) => {
            this.hideText = true;
            this.hideInput = false;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.UpdatedSuccessFully,
              MessageType: MessageTypes.Success
            });
            this.getServiceCategories(serviceCategoryDetails.ServiceCategoryId);
          },
            (data: HttpErrorResponse) => {
              if (data.error.Message == ResponseStatusTypes.Duplicate) {
                this.showDuplicateMessage();
              }
            });
      }
    }
    else {
      Object.keys(this.serviceCategoryForm.controls).forEach((key: string) => {
        if (this.serviceCategoryForm.controls[key].status == "INVALID" && this.serviceCategoryForm.controls[key].touched == false) {
          this.serviceCategoryForm.controls[key].markAsTouched();
        }
      });
    }
  }
  showDuplicateMessage() {
    this.serviceCategoryForm.get('CategoryName').setErrors({ 'Duplicate': true });
  }
  onClickedOutside(e: Event) {
  //  this.showfilters= false; 
    if(this.showfilters == false){ 
    //  this.showfilterstext="Show List"
  }
  }
  split(){ 
    this.showfilters=!this.showfilters;
    if(this.showfilters == true){ 
    this.showfilterstext="Hide List" 
    }
    else{
      this.showfilterstext="Show List" 
    }
  }
  cancelRecord() {
    // this.serviceCategoryForm.reset();
    // this.serviceCategoryForm.setErrors(null);
    // if (this.serviceCategoriesList.length > 0) {
    //   this.onRecordSelection(0);
      //setting this variable to true so as to show the purchase details
      this.hideInput = false;
      this.hideText = true;
    // }
    // else {
    //   this.hideInput = null;
    //   this.hideText = null;
    // }
    this.selectedServiceCategory = this.serviceCategoriesList[0];
  }
  addRecord() {
 
  this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }

    this.hidefilter();
    this.hideText = false;
    this.hideInput = true;
    this.selectedServiceCategory = new ServiceCategory();
    this.serviceCategoryForm.reset();
    this.serviceCategoryForm.setErrors(null);
    this.showfilters =false;
    this.showfilterstext="Show List" ;
  }
  deleteRecord() {

    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    let recordId = this.selectedServiceCategory.ServiceCategoryId;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {

        this.serviceCategoryServiceObj.deleteServiceCategory(recordId, userDetails.UserID).subscribe((data) => {
          if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.ValidationMessage,
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
          this.getServiceCategories(0);
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
    this.serviceCategoryListPagerConfig.RecordsToSkip = this.serviceCategoryListPagerConfig.RecordsToFetch * (currentPageNumber - 1);
    this.getServiceCategories(0);
  }
} 