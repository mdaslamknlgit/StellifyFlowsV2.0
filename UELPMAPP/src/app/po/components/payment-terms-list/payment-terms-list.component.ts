import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentTermsService } from "../../services/payment-terms.service";
import { PaymentTerm } from "../../models/payment-terms.model";
import { FullScreen, PrintScreen } from '../../../shared/shared';
import { PagerConfig, ResponseStatusTypes, Messages, MessageTypes, UserDetails} from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { ConfirmationService, SortEvent } from 'primeng/primeng';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-payment-terms-list',
    templateUrl: './payment-terms-list.component.html',
    styleUrls: ['./payment-terms-list.component.css'],
    providers: [PaymentTermsService]
})
export class PaymentTermsListComponent implements OnInit {
    public selectedItems: any[];
    SelectedContacts: string = '';
    TotalSelectedContacts: number = 0;
    ExportTotalContacts:boolean=false;
    
    hideText: boolean = true;
    hideInput: boolean = false;
    leftSection: boolean = false;
    rightsection: boolean = false;
    scrollbarOptions: any;
    paymentTermsList: Array<PaymentTerm> = [];
    paymentTermsListCols:any[];
    paymentTermForm: FormGroup;
    selectedPaymentTerms: PaymentTerm;
    paymentTermPagerConfig: PagerConfig;
    isSearchApplied: boolean = false;
    filterMessage: string = "";
    initDone = false;
    CompanyId: number;
    isFilterApplied: boolean = false;
    paymenttermFilterInfoForm: FormGroup;
    filteredPaymentTerm: Array<PaymentTerm> = [];
    @ViewChild("Code") nameInput: ElementRef;
    @ViewChild('rightPanel') rightPanelRef;
    totalRecords: number = 0;
    errorMessage: string = Messages.NoRecordsToDisplay;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    userDetails: UserDetails;
    currentPage: number = 1;
    public innerWidth: any;
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;
    constructor(private formBuilderObj: FormBuilder,
        private router: Router,
        private paymentTermObj: PaymentTermsService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        private confirmationServiceObj: ConfirmationService,
        private renderer: Renderer) {

        this.paymentTermPagerConfig = new PagerConfig();
        this.selectedPaymentTerms = new PaymentTerm();
        this.paymentTermPagerConfig.RecordsToSkip = 0;
        this.paymentTermPagerConfig.RecordsToFetch = 25;
        this.CompanyId = this.sessionService.getCompanyId();
        this.paymentTermForm = this.formBuilderObj.group({
            'Code': ["", [Validators.required, Validators.maxLength(50)]],
            'NoOfDays': [0, [Validators.required, Validators.min(0)]],
            'Description': ["", Validators.required],
            'PaymentTermsId': [0]
        });

        this.paymenttermFilterInfoForm = this.formBuilderObj.group({
            Code: [''],
            Days: ['']
        });

        this.initDone = true;
        this.userDetails = <UserDetails>this.sessionService.getUser();

    }
    ngOnInit() {

        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "paymentterms")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }
        
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.selectedPaymentTerms = new PaymentTerm();
                this.CompanyId = data;
                //getting the purchase orders list..
                this.getPaymentTerms(0);
            });

         this.getPaymentTerms(0);


         this.showfilters =true;
    this.showfilterstext="Hide List" ;

    }

    getPaymentTerms(selectedPaymentTermId: number) {
        let purchaseOrderDisplayInput = {
            Search: "",
            CompanyId: this.CompanyId,
            Skip: this.paymentTermPagerConfig.RecordsToSkip,
            Take: this.paymentTermPagerConfig.RecordsToFetch
        };     
        this.paymentTermObj.getPaymentTerms(purchaseOrderDisplayInput)
            .subscribe((data: { PaymentTerms: Array<PaymentTerm>, TotalRecords: number }) => {
                if (data != null) {                              
                    this.paymentTermsList = data.PaymentTerms;
                    this.paymentTermPagerConfig.TotalRecords = data.TotalRecords;
                    if (this.paymentTermsList.length > 0) {
                        // if (selectedPaymentTermId === 0) {
                        //     this.onRecordSelection(this.paymentTermsList[0].PaymentTermsId);
                        // }
                        // else {
                        //     this.onRecordSelection(selectedPaymentTermId);
                        // }
                    }
                    else {
                        this.addRecord();
                    }
                }
            });
    }

    onSearch(event: any) {
        if (event.target.value != "") {

            this.isSearchApplied = true;
            this.GetAllSearchPaymentterm(event.target.value);

        }
        else {
            this.isSearchApplied = false;
            this.getPaymentTerms(0);
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
        let Days = "";
        let Code = "";
        this.filterMessage = "";

        if (this.paymenttermFilterInfoForm.get('Code').value != "") {
            Code = this.paymenttermFilterInfoForm.get('Code').value;
        }
        if (this.paymenttermFilterInfoForm.get('Days').value != "") {
            Days = this.paymenttermFilterInfoForm.get('Days').value;
        }

        if (Days === '' && Code === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        if (Days != '' && Code != '') {
            this.filteredPaymentTerm = this.paymentTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1 && x.NoOfDays === Number(Days));
        }

        if (Days != '' && Code === '') {
            this.filteredPaymentTerm = this.paymentTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1);
        }

        if (Days != '' && Code != '') {
            this.filteredPaymentTerm = this.paymentTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1 && x.NoOfDays === Number(Days));
        }

        if (Days != '' && Code === '') {
            this.filteredPaymentTerm = this.paymentTermsList.filter(x => x.NoOfDays === Number(Days));
        }

        if (Days === '' && Code != '') {
            this.filteredPaymentTerm = this.paymentTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1);
        }

        if (this.filteredPaymentTerm.length > 0) {
            this.totalRecords = this.filteredPaymentTerm.length;
            this.paymentTermsList = this.filteredPaymentTerm;
            this.selectedPaymentTerms = this.paymentTermsList[0];
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }

        }
        else {
            this.filterMessage = "No matching records are found";
            this.filteredPaymentTerm = this.paymentTermsList;
            this.totalRecords = this.filteredPaymentTerm.length;
            if (this.filteredPaymentTerm.length > 0) {
                this.selectedPaymentTerms = this.paymentTermsList[0];
            }
        }
    }

    resetFilters() {
        this.paymenttermFilterInfoForm.get('Code').setValue("");
        this.paymenttermFilterInfoForm.get('Days').setValue("");
        this.filterMessage = "";
        this.filteredPaymentTerm = this.paymentTermsList;
        this.totalRecords = this.filteredPaymentTerm.length;
        if (this.filteredPaymentTerm.length > 0) {
            this.getPaymentTerms(0);
        }
        else {
            this.hideText = true;
            this.hideInput = false;
        }
        this.isFilterApplied = false;
        if (this.nameInput != undefined) {
            this.nameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus'); // NEW VERSION
        }

    }



    GetAllSearchPaymentterm(searchString: string): void {

        let purchaseOrderDisplayInput = {
            Search: searchString,
            CompanyId: this.CompanyId,
            Skip: 0,
            Take: this.paymentTermPagerConfig.RecordsToFetch
        };

        this.paymentTermObj.getAllpaymentTerms(purchaseOrderDisplayInput)
            .subscribe((data: { PaymentTerms: Array<PaymentTerm>, TotalRecords: number }) => {
                this.paymentTermsList = data.PaymentTerms;
                this.filteredPaymentTerm = this.paymentTermsList;
                this.totalRecords = data.TotalRecords;
                if (this.paymentTermsList.length > 0) {
                    this.selectedPaymentTerms = this.paymentTermsList[0];
                }
                else {
                    this.hideText = true;
                    this.hideInput = false;
                }
            });
    }
    ClickEdit(PaytermTermId:any)
    {
        this.router.navigate([`/po/paymentterms/${'EDIT'}/${PaytermTermId}`]);
    }
    onRecordSelection(paymentTermsId: number) {
        this.split();
           this.paymentTermObj.getPaymentTermDetails(paymentTermsId)
            .subscribe((data: PaymentTerm) => {
                if (data != null) {                 
                    this.selectedPaymentTerms = null;
                    this.selectedPaymentTerms = data;
                    this.paymentTermForm.patchValue(data);
                }

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
    trimSpaces() {
        this.paymentTermForm.get('Description').setValue(this.paymentTermForm.get('Description').value.trim());
    }
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.hideInput = true;
        this.hideText = false;
        this.paymentTermForm.reset();
        this.paymentTermForm.setErrors(null);
        this.paymentTermForm.patchValue(this.selectedPaymentTerms);
     

    }
    saveRecord() {
        let purchaseOrderFormStatus = this.paymentTermForm.status;
        if (purchaseOrderFormStatus != "INVALID") {
            let paymentTermDetails: PaymentTerm = this.paymentTermForm.value;
            paymentTermDetails.CompanyId = this.sessionService.getCompanyId();
            if (paymentTermDetails.PaymentTermsId > 0) {
                paymentTermDetails.UpdatedBy = this.userDetails.UserID;
                this.paymentTermObj.updatePaymentTerm(paymentTermDetails).subscribe(
                    (data: any) => {                    
                        this.hideText = true;
                        this.hideInput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });                       
                        this.getPaymentTerms(paymentTermDetails.PaymentTermsId);


                    });
                // this.paymentTermObj.updatePaymentTerm(paymentTermDetails)
                //     .subscribe((response) => {
                //         this.hideText = true;
                //         this.hideInput = false;
                //         this.sharedServiceObj.showMessage({
                //             ShowMessage: true,
                //             Message: Messages.UpdatedSuccessFully,
                //             MessageType: MessageTypes.Success
                //         });
                //         debugger;
                //         this.getPaymentTerms(paymentTermDetails.PaymentTermsId);
                //     });
                    // }, (data: HttpErrorResponse) => {

                    //     if (data.error.Message == ResponseStatusTypes.Duplicate) {
                    //         this.showDuplicateMessage();
                    //     }
                    // });
            }
            else {
                paymentTermDetails.CreatedBy = this.userDetails.UserID;
                this.paymentTermObj.createPaymentTerm(paymentTermDetails)
                    .subscribe((savedRecordId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getPaymentTerms(savedRecordId);
                    }, (data: HttpErrorResponse) => {
                        if (data.error.Message == ResponseStatusTypes.Duplicate) {
                            this.showDuplicateMessage();
                        }
                    });

            }
        }
        else {
            Object.keys(this.paymentTermForm.controls).forEach((key: string) => {
                if (this.paymentTermForm.controls[key].status === "INVALID"
                    && this.paymentTermForm.controls[key].touched == false) {
                    this.paymentTermForm.controls[key].markAsTouched();
                }
            });
        }
    }
    showDuplicateMessage() {
        this.paymentTermForm.get('Code').setErrors({ 'duplicate': true });
    }
    onClickedOutside(e: Event) {
       // this.showfilters= false; 
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

    ClickBack(e)
    {
        //this.router.navigate([`/admin/currencieslist/${this.getRandomInt(100)}`]);
        this.paymentTermForm.reset();
        this.paymentTermForm.setErrors(null);
        if (this.paymentTermsList.length > 0 && this.selectedPaymentTerms != undefined && this.selectedPaymentTerms.PaymentTermsId != undefined) {
            this.onRecordSelection(this.selectedPaymentTerms.PaymentTermsId);
            //setting this variable to true so as to show the purchase details
            this.hideInput = false;
            this.hideText = true;
        }
    }
    cancelRecord() {
        //setting this variable to true so as to show the purchase details
        this.paymentTermForm.reset();
        this.paymentTermForm.setErrors(null);
        if (this.paymentTermsList.length > 0 && this.selectedPaymentTerms != undefined && this.selectedPaymentTerms.PaymentTermsId != undefined) {
            this.onRecordSelection(this.selectedPaymentTerms.PaymentTermsId);
            //setting this variable to true so as to show the purchase details
            this.hideInput = false;
            this.hideText = true;
        }
        // else if(this.paymentTermsList.length > 0)
        // {
        //     this.onRecordSelection(this.paymentTermsList[0].PaymentTermsId);
        // }
        else {
            this.hideInput = false;
            this.hideText = true;
        }
    }
    addRecord() {

        // this.innerWidth = window.innerWidth;
        // if (this.innerWidth < 550) {
        //     $(".leftdiv").addClass("hideleftcol");
        //     $(".rightPanel").addClass("showrightcol");
        // }

        // this.hideText = false;
        // this.hideInput = true;
        // // this.selectedPaymentTerms = new PaymentTerm();
        // this.paymentTermForm.reset();
        // this.paymentTermForm.setErrors(null);
        // this.showfilters = false;
        // this.showfilterstext = "Show List";

    }
    ClickNew(e)
    {
        this.router.navigate([`/po/paymentterms/${'NEW'}/${0}`]);
    }
    deleteRecord() {

        let recordId = this.selectedPaymentTerms.PaymentTermsId;
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {

                this.paymentTermObj.deletePaymentTerm(recordId).subscribe((data) => {

                    if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.PaymentValidationMessage,
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
                    this.getPaymentTerms(0);
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
    onPrintScreen(event: any) {
        let windowObj = event.view;
        this.paymentTermObj.convertToPdf().subscribe((data: string) => {
            PrintScreen(data, windowObj, "", "Payment Terms");
        });
    }
    pageChange(currentPageNumber: any) {
        this.paymentTermPagerConfig.RecordsToSkip = this.paymentTermPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getPaymentTerms(0);
        this.showfilters =false;
        this.showfilterstext="Hide List" ;
    }
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result = null;
            if (value1 == null && value2 != null)
                result = -1;
            else if (value1 != null && value2 == null)
                result = 1;
            else if (value1 == null && value2 == null)
                result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string')
                result = value1.localeCompare(value2);
            else
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

            return (event.order * result);
        });
    }

    sortTableData(event) {
        event.data.sort((data1, data2) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result = null;
            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string')
                result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order * result;
        });
    }
    onRowUnselect(event) {
        let i = 0;
        this.SelectedContacts = "";
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedContacts == "") {
                this.SelectedContacts = this.selectedItems[i].Id;
            }
            else {
                this.SelectedContacts = this.SelectedContacts + "," + this.selectedItems[i].Id;
            }
        }
        this.TotalSelectedContacts = this.selectedItems.length;
        if(this.TotalSelectedContacts==0)
        {
            this.SelectedContacts="";
        }
        //alert("Un Selected Leads : " + this.SelectedContacts + "\n Total Un Selected Leads : " + this.TotalSelectedContacts);
    }

    onRowSelect(event) {
        let i = 0;
        this.SelectedContacts = "";
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedContacts == "") {
                this.SelectedContacts = this.selectedItems[i].Id;
            }
            else {
                this.SelectedContacts = this.SelectedContacts + "," + this.selectedItems[i].Id;
            }
        }
        this.TotalSelectedContacts = this.selectedItems.length;
        //alert("Selected Leads : " + this.SelectedContacts + "\n Total Selected Leads : " + this.TotalSelectedContacts);
    }
}
