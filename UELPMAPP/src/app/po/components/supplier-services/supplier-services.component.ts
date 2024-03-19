import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { PagerConfig, Messages, MessageTypes, ServiceCategory, ResponseStatusTypes, UserDetails, SupplierCategory } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { SupplierServicesService } from "../../services/supplier-service.service";
import { SupplierServices } from "../../models/supplier-service.model";
import { FullScreen } from '../../../shared/shared';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-supplier-services',
    templateUrl: './supplier-services.component.html',
    styleUrls: ['./supplier-services.component.css'],
    providers: [SupplierServicesService]
})
export class SupplierServicesComponent implements OnInit {

    hidetext: boolean = true;
    hideInput: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    scrollbarOptions: any;
    supplierServicesList: Array<SupplierServices> = [];
    supplierServicesForm: FormGroup;
    selectedSupplierCategory: SupplierServices;
    supplierServicesListPagerConfig: PagerConfig;
    serviceCategoriesList: Array<ServiceCategory> = [];
    supplierCategoriesList: Array<SupplierCategory> = [];
    isSearchApplied: boolean = false;
    filterMessage: string = "";
    totalRecords: number = 0;
    serviceCategroies = [];
    initDone = false;
    isFilterApplied: boolean = false;
    supplierServiceFilterInfoForm: FormGroup;
    filteredSupplierService: Array<SupplierServices> = [];
    errorMessage: string = Messages.NoRecordsToDisplay;
    @ViewChild("ServiceName") nameInput: ElementRef;
    @ViewChild('rightPanel') rightPanelRef;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    public innerWidth: any;
    showfilters:boolean=true;
    showfilterstext:string="Show List" ;
    constructor(private formBuilderObj: FormBuilder,
        private supplierServicesServiceObj: SupplierServicesService,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private renderer: Renderer,
        public sessionService: SessionStorageService) {

        this.supplierServicesListPagerConfig = new PagerConfig();
        this.selectedSupplierCategory = new SupplierServices();
        this.supplierServicesListPagerConfig.RecordsToSkip = 0;
        this.supplierServicesListPagerConfig.RecordsToFetch = 10;
        this.supplierServicesForm = this.formBuilderObj.group({
            'ServiceName': ["", { validators: [Validators.required, this.noWhitespaceValidator]}],
            'ServiceDescription': ["", { validators: [Validators.required, this.noWhitespaceValidator]}],
            'ServiceCategory': [0,{ validators: [Validators.required, this.noWhitespaceValidator]}],
            "SupplierServiceID": [0]
        });

        this.supplierServiceFilterInfoForm = this.formBuilderObj.group({
            ServiceName: [''],
            ServiceCategory: ['']
        });
        this.initDone = true;

    }

    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierservices")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }

        this.getSupplierServices(0);
        this.getServiceCategories();
        this.getSupplierCategory();

        this.showfilters =false;
        this.showfilterstext="Hide List" ;

    }

    public noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
      }
    

    getServiceCategories() {
        this.sharedServiceObj.getServiceCategroies().subscribe((data: Array<ServiceCategory>) => {
            this.serviceCategoriesList = data;
        }, () => {

        });
    }
    getSupplierCategory() {
        this.sharedServiceObj.getServiceCategoriesList().subscribe((data: Array<ServiceCategory>) => {
            this.serviceCategoriesList = data;
        }, () => {

        });
    }

    getSupplierServices(selectedSupplierCategoryId: number) {
        let supplierCategoryInput = {
            Search: "",
            Skip: this.supplierServicesListPagerConfig.RecordsToSkip,
            Take: this.supplierServicesListPagerConfig.RecordsToFetch
        };
        this.supplierServicesServiceObj.getSupplierServices(supplierCategoryInput)
            .subscribe((data: { SupplierServices: Array<SupplierServices>, TotalRecords: number }) => {
                this.supplierServicesList = data.SupplierServices;
                this.supplierServicesListPagerConfig.TotalRecords = data.TotalRecords;
                if (this.supplierServicesList.length > 0) {
                    if (selectedSupplierCategoryId == 0) {
                        this.onRecordSelection(this.supplierServicesList[0].SupplierServiceID);
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

    GetAllSearchSupplierService(searchString: string): void {

        let SupplierServiceDisplayInput = {
            Search: searchString,
            Skip: 0,
            Take: this.supplierServicesListPagerConfig.RecordsToFetch
        };

        this.supplierServicesServiceObj.getAllSupplierService(SupplierServiceDisplayInput)
            .subscribe((data: { SupplierServices: Array<SupplierServices>, TotalRecords: number }) => {
                this.supplierServicesList = data.SupplierServices;
                this.filteredSupplierService = this.supplierServicesList;
                this.totalRecords = data.TotalRecords;
                if (this.supplierServicesList.length > 0) {
                    this.selectedSupplierCategory = this.supplierServicesList[0];
                }
                else {
                    this.hidetext = true;
                    this.hideInput = false;
                }
            });
    }



    onSearch(event: any) {
        if (event.target.value != "") {
            this.isSearchApplied = true;
            this.GetAllSearchSupplierService(event.target.value);

        }
        else {
            this.isSearchApplied = false;
            this.getSupplierServices(0);
        }
    }

    openDialog() {
        this.initDone = true;
        this.nameInput.nativeElement.focus();
        this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus');
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    filterData() {
        let Name = "";
        let category = "";
        this.filterMessage = "";

        if (this.supplierServiceFilterInfoForm.get('ServiceName').value != "") {
            Name = this.supplierServiceFilterInfoForm.get('ServiceName').value;
        }
        if (this.supplierServiceFilterInfoForm.get('ServiceCategory').value != "") {

            category = this.supplierServiceFilterInfoForm.get('ServiceCategory').value;
            console.log("Category", category);
        }

        if (Name === '' && category === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        if (Name != '' && category != '') {
            this.filteredSupplierService = this.supplierServicesList.filter(x => x.ServiceName.toLowerCase().indexOf(Name.toLowerCase()) !== -1 && x.ServiceCategoryName === category);
        }

        if (Name != '' && category === '') {
            this.filteredSupplierService = this.supplierServicesList.filter(x => x.ServiceName.toLowerCase().indexOf(Name.toLowerCase()) !== -1);
        }

        if (Name === '' && category != '') {
            this.filteredSupplierService = this.supplierServicesList.filter(x => x.ServiceCategoryName === category);
        }

        if (this.filteredSupplierService.length > 0) {
            this.totalRecords = this.filteredSupplierService.length;
            this.supplierServicesList = this.filteredSupplierService;
            this.selectedSupplierCategory = this.supplierServicesList[0];
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }

        }
        else {
            this.filterMessage = "No matching records are found";
            this.filteredSupplierService = this.supplierServicesList;
            this.totalRecords = this.filteredSupplierService.length;
            if (this.filteredSupplierService.length > 0) {
                this.selectedSupplierCategory = this.supplierServicesList[0];
            }
        }
    }



    resetFilters() {
        this.supplierServiceFilterInfoForm.get('ServiceName').setValue("");
        this.supplierServiceFilterInfoForm.get('ServiceCategory').setValue("");
        this.filterMessage = "";
        this.filteredSupplierService = this.supplierServicesList;
        this.totalRecords = this.filteredSupplierService.length;
        if (this.filteredSupplierService.length > 0) {
            this.getSupplierServices(0);
        }
        else {
            this.hidetext = true;
            this.hideInput = false;
        }
        this.isFilterApplied = false;
        if (this.nameInput != undefined) {
            this.nameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus'); // NEW VERSION
        }

    }


    onRecordSelection(selectedSupplierCategoryId: number) {
       this.split();
        this.supplierServicesServiceObj.getSupplierServiceDetails(selectedSupplierCategoryId)
            .subscribe((data: SupplierServices) => {

                this.selectedSupplierCategory = data;
                this.supplierServicesForm.patchValue(data);
                this.hidetext = true;
                this.hideInput = false;

            }, () => {

            });
    }

    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.hideInput = true;
        this.hidetext = false;
        this.supplierServicesForm.reset();
        this.supplierServicesForm.setErrors(null);
        this.supplierServicesForm.patchValue(this.selectedSupplierCategory);
    }

    saveRecord() {
        let purchaseOrderFormStatus = this.supplierServicesForm.status;
        if (purchaseOrderFormStatus != "INVALID") {
            let paymentTermDetails: SupplierServices = this.supplierServicesForm.value;
            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            paymentTermDetails.CreatedBy = userDetails.UserID;
            if (this.selectedSupplierCategory.SupplierServiceID == 0 || this.selectedSupplierCategory.SupplierServiceID == null) {
                this.supplierServicesServiceObj.createSupplierService(paymentTermDetails)
                    .subscribe((savedRecordId: number) => {
                        this.hidetext = true;
                        this.hideInput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getSupplierServices(savedRecordId);
                    }, (data: HttpErrorResponse) => {
                        if (data.error.Message == ResponseStatusTypes.Duplicate) {
                            this.showDuplicateMessage();
                        }
                    });
            }
            else {
                this.supplierServicesServiceObj.updateSupplierService(paymentTermDetails)
                    .subscribe((response) => {
                        this.hidetext = true;
                        this.hideInput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getSupplierServices(paymentTermDetails.SupplierServiceID);
                    }, (data: HttpErrorResponse) => {
                        if (data.error.Message == ResponseStatusTypes.Duplicate) {
                            this.showDuplicateMessage();
                        }
                    });
            }
        }
        else {
            Object.keys(this.supplierServicesForm.controls).forEach((key: string) => {
                if (this.supplierServicesForm.controls[key].status == "INVALID" && this.supplierServicesForm.controls[key].touched == false) {
                    this.supplierServicesForm.controls[key].markAsTouched();
                }
            });
        }
    }
    showDuplicateMessage() {
        this.supplierServicesForm.get('ServiceName').setErrors({ 'Duplicate': true });
    }
    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
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
      this.showfilterstext="Show List" 
    }
    }

    cancelRecord() {
        this.hidetext = true;
        this.hideInput = false;
        this.selectedSupplierCategory = this.supplierServicesList[0];
    }

    addRecord() {
        this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }
  
        this.hidetext = false;
        this.hideInput = true;
        this.selectedSupplierCategory = new SupplierServices();
        this.supplierServicesForm.reset();
        this.supplierServicesForm.setErrors(null);
        this.showfilters =false;
    this.showfilterstext="Show List" ;
    }

    deleteRecord() {
        let recordId = this.selectedSupplierCategory.SupplierServiceID;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {

                this.supplierServicesServiceObj.deleteSupplierService(recordId, userDetails.UserID).subscribe((data) => {
                        if(data==true)
                        {
                            this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SupplierValidationMessage,
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
                    this.getSupplierServices(0);
                });

            },
            reject: () => {
            }
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
    pageChange(currentPageNumber: any) {
        this.supplierServicesListPagerConfig.RecordsToSkip = this.supplierServicesListPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getSupplierServices(0);
        this.showfilters =false;
        this.showfilterstext="Hide List" ;
    }
}
