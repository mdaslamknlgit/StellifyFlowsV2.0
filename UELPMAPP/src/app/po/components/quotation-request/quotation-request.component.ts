import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CostOfService, QuotationRequest, QuotationRequestDisplayResult, QuotationRequestList, QuotationFilterDisplayInput } from "../../models/quotation-request.model";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig, Suppliers, ItemMaster, MessageTypes, PurchaseOrderRequests, UserDetails, WorkFlowStatus } from "../../../shared/models/shared.model";
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { GridOperations, ResponseStatusTypes, Messages, Currency, PaymentTerms } from "../../../shared/models/shared.model";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { ValidateFileType, FullScreen, restrictMinus, getProcessId } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Supplier } from '../../models/supplier';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { QuotationRequestService } from '../../services/quotation-request.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { element } from 'protractor';
import { PORSearch, PurchaseOrderRequestList, PurchaseOrderRequestDetails } from '../../models/purchase-order-request.model';
@Component({
    selector: 'app-quotation-request',
    templateUrl: './quotation-request.component.html',
    styleUrls: ['./quotation-request.component.css'],
    providers: [QuotationRequestService, PurchaseOrderRequestService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class QuotationRequestComponent implements OnInit {
    QuotationRequestList: Array<QuotationRequestList> = [];
    quotationRequestPagerConfig: PagerConfig;
    quotationRequestGridConfig: PagerConfig;
    quotationForm: FormGroup;
    gridVendorColumns: Array<{ field: string, header: string }> = [];
    selectedQuotationRequestDetails: QuotationRequest;
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    departments: Location[] = [];
    purchaseorderrequestid: number;
    gridColumns: Array<{ field: string, header: string }> = [];
    suppliergridColumns: Array<{ field: string, header: string }> = [];
    recordInEditMode: number;
    operation: string;
    costOfServiceType: CostOfService[] = [];
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    uploadedFiles: Array<File> = [];
    leftsection: boolean = false;
    rightsection: boolean = false;
    slideactive: boolean = false;
    scrollbarOptions: any;
    showSupplierGridErrorMessage: boolean = false;
    showGridVendorErrorMessage: boolean = false;
    results: Suppliers[] = [];
    apiEndPoint: string;
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    linesToAdd1: number = 2;
    paymentTerms: PaymentTerms[] = [];
    measurementUnits: MeasurementUnit[] = [];
    deletedQuotationSupplierItems: Array<number> = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    qrFilterInfoForm: FormGroup;
    quotationRequestSearchKey: string;
    errorMessage: string = Messages.NoRecordsToDisplay;
    filterMessage: string = "";
    filteredSuppliers = [];
    initDone = false;
    initSettingsDone = true;
    isFilterApplied: boolean = false;
    gridSupplierRowId: number = -1;
    companyId: number = 0;
    selectedSupplierRowId: number = -1;
    deletedQuotationVendorItems: Array<number> = [];
    vendoruploadedFiles: Array<{ File: File, RowIndex: number }> = [];
    selectedFileRowIndex: number = 1;
    showLeftPanelLoadingIcon:boolean = false;
    showRightPanelLoadingIcon:boolean=false;   
    showGridErrorMessage: boolean =false;
    workFlowStatus:any;
    public innerWidth: any;
    @ViewChild('instructions') instructionsRef: ElementRef;
    @ViewChild('justifications') justificationsRef: ElementRef;
    @ViewChild('qrCode') private qrCodeRef: any;
  
    constructor(private purchaseOrderRequestObj: PurchaseOrderRequestService,
        private quotationRequestObj: QuotationRequestService,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        public sessionService: SessionStorageService,
        public route: ActivatedRoute,
        private routeObj:Router,
        private renderer: Renderer) {
        this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Item' },
            { field: 'ItemDescription', header: 'Description' },
            { field: 'MeasurementUnitID', header: 'UOM' },
            { field: 'ItemQty', header: 'Qty' }
        ]; 
        this.gridVendorColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Supplier Name' },
            { field: 'EmailId', header: 'Email' },
            { field: 'ContactNumber', header: 'Contact Number' },
            { field: 'QuotationAmount', header: 'Quotation Amount' },
            { field: 'IsMailSent',header:'Mail Sent'},
            { field: 'Attachment', header: 'Attachment' },
            { field: '', header: 'Choose' },
            { field: 'IsSelected', header: '' }
        ];
        this.apiEndPoint = environment.apiEndpoint;

        this.companyId = this.sessionService.getCompanyId();
        this.route.queryParams.subscribe((data)=>{
            console.log(data);
        });  
        this.workFlowStatus = WorkFlowStatus;
    }
    @ViewChild('rightPanel') rightPanelRef;

    ngOnInit() {

        this.quotationRequestPagerConfig = new PagerConfig();
        this.quotationRequestPagerConfig.RecordsToSkip = 0;
        this.quotationRequestPagerConfig.RecordsToFetch = 100;

        this.quotationRequestGridConfig = new PagerConfig();
        this.quotationRequestGridConfig.RecordsToSkip = 0;
        this.quotationRequestGridConfig.RecordsToFetch = 20;

        this.selectedQuotationRequestDetails = new QuotationRequest();

        this.quotationForm = this.formBuilderObj.group({
            'PORequest': ["", [Validators.required]],
            'QuotationVendorItems': this.formBuilderObj.array([]),
            'Remarks':[""]
        });
        
        this.sharedServiceObj.CompanyId$
        .subscribe((data)=>{
            this.companyId = data;
            this.GetQuotationsRequest(0);            
        });

        this.qrFilterInfoForm = this.formBuilderObj.group({
            QRCode: [''],
            PORCode:[''],
            SupplierCategory: ['']
        });
        //getting the list of cost of service types.
        this.purchaseOrderRequestObj.getCostOfServiceTypes()
            .subscribe((data: CostOfService[]) => {
                this.costOfServiceType = data;
            });
        this.purchaseOrderRequestObj.getDepartments()
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;
            });
        this.operation = GridOperations.Display;
        this.getPaymentTerms();
        this.GetQuotationsRequest(0);
        this.getMeasurementUnits();


        this.route.paramMap.subscribe((param: ParamMap) => {           
            if (param.get('id') != undefined) {                  
                console.log("Number", Number(param.get('id')));   
                         
            }
            else{
                  //getting the purchase orders list..
                  
            }          
        });
    }

    supplierCategoryInputFormater = (x: Suppliers) => x.SupplierName;

    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    supplierCategorySearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 1,
                    companyId:this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );



    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    // supplierSearch = (text$: Observable<string>) =>
    //     text$.pipe(
    //         debounceTime(300),
    //         distinctUntilChanged(),
    //         switchMap((term) => {
    //             if (term == "") {
    //                 let itemGroupControl = <FormArray>this.quotationForm.controls['QuotationRequestSupplier'];
    //                 itemGroupControl.controls[this.gridSupplierRowId].reset();
    //                 return of([]);
    //             }
    //             return this.sharedServiceObj.getSuppliers({
    //                 searchKey: term,
    //                 supplierTypeId: 1,
    //                 CompanyId:this.companyId
    //             }).pipe(
    //                 catchError(() => {
    //                     return of([]);
    //                 }))
    //         })
    //     );

        supplierItemSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
                    itemGroupControl.controls[this.selectedSupplierRowId].reset();
                    return of([]);
                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    CompanyId:this.companyId
                }).map((data: Array<Suppliers>) => {
                    
                    let gridData = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
                    gridData.controls.forEach((rowdata)=>{
                        let supplierRec:Supplier = rowdata.get('QuotationSupplier').value;
                        console.log("dss",supplierRec);
                        if(supplierRec!=undefined)
                        {
                            // let supplierIndex = data.findIndex(i=>i.SupplierId==supplierRec.SupplierId);
                            // data.splice(supplierIndex,1);
                             data  = data.filter(i=>i.SupplierId!=supplierRec.SupplierId);
                        }
                    });
                    return data;

                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

        onQuotationItemSupplierClick(rowId: number) {
            this.selectedSupplierRowId = rowId;
        }

    search(event) {
        let obj = {
            searchKey: event.query,
            supplierTypeId: 1
        }
        this.sharedServiceObj.getSuppliers(obj).subscribe((data: Suppliers[]) => {
            this.results = data;
        });

    }
    porInputFormater = (x: PurchaseOrderRequestList) =>((x.WorkFlowStatusId!=WorkFlowStatus.Draft)?x.PurchaseOrderRequestCode:x.DraftCode);
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    porSearch = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term =>
            this.purchaseOrderRequestObj.getAllSearchPurchaseOrdersRequest({
                Search:term,
                CompanyId:this.companyId
            }).map((data:Array<any>)=>{

                data.forEach((item,index)=>{
                    item.index= index;
                });
                 return data;
            }).pipe(
            catchError(() => {
                return of([]);
            }))
       )
    );
    onItemSupplierClick(rowId:number)
    {
      this.gridSupplierRowId = rowId;
    }
    getPaymentTerms()
    {
        this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId())
            .subscribe((data: PaymentTerms[]) => {
                this.paymentTerms = data;
            });
    }
    getMeasurementUnits() {
        this.sharedServiceObj.getUOMList()
            .subscribe((data: MeasurementUnit[]) => {
                this.measurementUnits = data;
            });
    }
    //to get  the purchase orders..
    GetQuotationsRequest(QuotationRequestIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let quotationRequestDisplayInput = {
            Skip: this.quotationRequestPagerConfig.RecordsToSkip,
            Take: this.quotationRequestPagerConfig.RecordsToFetch,
            CompanyId:this.companyId
        };
        this.showLeftPanelLoadingIcon=true;
        this.quotationRequestObj.getQuotationsRequest(quotationRequestDisplayInput)
            .subscribe((data: QuotationRequestDisplayResult) => {
                this.QuotationRequestList = data.QuotationRequest;
                this.quotationRequestPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon=false;
                if (this.QuotationRequestList.length > 0) {
                    if (QuotationRequestIdToBeSelected == 0) {
                        this.onRecordSelection(this.QuotationRequestList[0].QuotationRequestId);
                    }
                    else {
                        this.onRecordSelection(QuotationRequestIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon=false;
                this.hidetext = false;
                this.hideinput = true;
                
            });
    }

    filterData() {
        let qrCode = "";
        let porCode="";
        let supplierCategory = "";
        this.filterMessage = "";

        if (this.qrFilterInfoForm.get('QRCode').value != "") {
            qrCode = this.qrFilterInfoForm.get('QRCode').value;
        }

        if (this.qrFilterInfoForm.get('PORCode').value != "") {
            porCode = this.qrFilterInfoForm.get('PORCode').value;
        }

        if (this.qrFilterInfoForm.get('SupplierCategory').value != "") {
            supplierCategory = this.qrFilterInfoForm.get('SupplierCategory').value.SupplierName;
        }

        if (qrCode === '' && porCode==='' && supplierCategory === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        let quotationFilterDisplayInput: QuotationFilterDisplayInput = {
            Skip: this.quotationRequestPagerConfig.RecordsToSkip,
            Take: this.quotationRequestPagerConfig.RecordsToFetch,
            QuotationRequestFilter: qrCode,
            PurchaseOrderRequestCodeFilter: porCode,
            SupplierNameFilter: supplierCategory,
            CompanyId:this.companyId
        };
        //calling the service method to get the list of item categories...
        this.quotationRequestObj.getFilterQuotationRequest(quotationFilterDisplayInput)

            .subscribe((data: QuotationRequestDisplayResult) => {
                if ( data.TotalRecords > 0) {
                    this.isFilterApplied = true;
                    if (open) {
                        this.initDone = false;
                    }
                    this.quotationRequestPagerConfig.TotalRecords = data.TotalRecords;
                    this.QuotationRequestList = data.QuotationRequest;
                    this.onRecordSelection(this.QuotationRequestList[0].QuotationRequestId);
                }
                else {
                    this.filterMessage = "No matching records are found";
                    // this.addRecord();
                }
            }, (error) => {

                this.hidetext = false;
                this.hideinput = true;
                //remove this code after demo...
            });

    }
    //to get list of purchase orders..
    getAllSearchQuotationRequest(searchKey: string, quotationRequestIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let quotationRequestDisplayInput = {
            Skip: this.quotationRequestGridConfig.RecordsToSkip,
            Take: this.quotationRequestPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId:this.companyId
        };
        this.showLeftPanelLoadingIcon=true;
        this.quotationRequestObj.getAllSearchQuotationRequest(quotationRequestDisplayInput)
            .subscribe((data: QuotationRequestDisplayResult) => {
                this.QuotationRequestList = data.QuotationRequest;
                this.quotationRequestPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon=false;
                if (this.QuotationRequestList.length > 0) {
                    if (quotationRequestIdToBeSelected == 0) {
                        this.onRecordSelection(this.QuotationRequestList[0].QuotationRequestId);
                    }
                    else {
                        this.onRecordSelection(quotationRequestIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            },()=>{
                this.showLeftPanelLoadingIcon=false;
            });
    }

    openDialog() {
        this.initDone = true;
        if (this.qrCodeRef != undefined) {
            this.qrCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.qrCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.qrFilterInfoForm.get('QRCode').setValue("");
        this.qrFilterInfoForm.get('PORCode').setValue("");
        this.qrFilterInfoForm.get('SupplierCategory').setValue("");
        this.filterMessage = "";
        this.filteredSuppliers = this.QuotationRequestList;
        if (this.filteredSuppliers.length > 0) {
            this.GetQuotationsRequest(0);
        }

        this.isFilterApplied = false;
        if (this.qrCodeRef != undefined) {
            this.qrCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.qrCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(QuotationRequestId: number) {
        this.showRightPanelLoadingIcon=true;
        this.quotationRequestObj.getQuotationRequestDetails(QuotationRequestId)
            .subscribe((data: QuotationRequest) => {
                this.selectedQuotationRequestDetails = data;
               
                if (data.QuotationVendorItems == null) {
                    data.QuotationVendorItems = [];
                }
                this.operation = GridOperations.Display;
                this.quotationForm.patchValue(data);
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon=false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon=false;
            });

    }
    /**
     * this method will be called on the supplier dropdown change event.
     */
    onPORChange(event?: any) {
        if (event != null && event != undefined) {
            let itemObj = <PurchaseOrderRequestList> event.item;
            this.purchaseOrderRequestObj.getPurchaseOrderRequestDetails(itemObj.PurchaseOrderRequestId,getProcessId(itemObj.POTypeId))
            .subscribe((data: PurchaseOrderRequestDetails) => {
                this.purchaseorderrequestid = data.PurchaseOrderRequestId;
                this.selectedQuotationRequestDetails.PurchaseOrderRequest = data;
                this.selectedQuotationRequestDetails.PurchaseOrderRequestItems = data.PurchaseOrderRequestItems;    
            });
        }
    }
    onSupplierChange(event?: any) {
        
        let supplierDetails: Supplier;
        if (event != null && event != undefined) {
            supplierDetails = event.item;
        }
        else {
            supplierDetails = this.quotationForm.get('Supplier').value;
        }
        if (supplierDetails != undefined) {
            this.quotationForm.patchValue({
                "SupplierAddress": supplierDetails.BillingAddress1,
                "DeliveryAddress": supplierDetails.BillingAddress1,
                "ShippingFax": supplierDetails.BillingFax
            });
        }
        else {
            this.quotationForm.patchValue({
                "SupplierAddress": "",
                "DeliveryAddress": "",
                "ShippingFax": ""
            });
        }
    }
    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    itemMasterInputFormater = (x: ItemMaster) => x.ItemName;

    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    itemMasterSearch = (text$: Observable<string>) =>

        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getItemMasterByKey({
                    searchKey: term,
                    CompanyId:this.companyId,
                    LocationID: null
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            )
        );
    /**
     * this method will be called on "item master" autocomplete value selection.
     */


    // initGridRows() {
    //     return this.formBuilderObj.group({
    //         'QuotationRequestSupplierId': 0,
    //         'QuotationSupplier': [null, Validators.required],
    //         'y': [""],
    //         'BillingTelephone': [""],
    //         'IsMailSent':false,
    //         "IsModified": false
    //     });
    // }
    supplierSelection(eventData: any, index: number) {       
        
         let itemGroupControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
       
            itemGroupControl.controls[index].patchValue({
                SupplierEmail: eventData.item.SupplierEmail,
                BillingTelephone: eventData.item.BillingTelephone,
                QuotationAmount:0,
                IsMailSent:false,
                IsSelected:false,
                IsModified:false,
            });
        

    }
  

    addVendorGridItem(noOfLines: number) {
        
        let itemGroupVendorControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
        
       for (let i = 0; i < noOfLines; i++) {
            itemGroupVendorControl.push(this.initGridRows1());
        }
    }

    initGridRows1() {
        return this.formBuilderObj.group({
            'QuotationId': 0,
            'QuotationSupplier': [null, Validators.required],
            'QuotatedAmount': [0, [Validators.min(0)]],
            'SupplierEmail': [""],
            'BillingTelephone': [""],
            "IsMailSent":false,
            "IsSelected":false,
            "IsModified": false,
        });
    }

    /**
     * to hide the category details and show in add mode..
     */
    addRecord() {
        //setting this variable to false so as to show the purchase order details in edit mode
        this.hidetext = false;
        this.hideinput = true;
        this.selectedQuotationRequestDetails = new QuotationRequest();
        //resetting the purchase order form..
        this.quotationForm.reset();
        this.quotationForm.setErrors(null);
        this.showGridErrorMessage =false;
        let itemGroupVendorControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
        itemGroupVendorControl.controls = [];
        itemGroupVendorControl.controls.length = 0;
    
        this.quotationForm.patchValue({
            SupplierTypeID: "1",
            IsGstRequired: false
        });
    }
    showFullScreen() {
 this.innerWidth = window.innerWidth;
 if(this.innerWidth > 1000){  
  FullScreen(this.rightPanelRef.nativeElement);
 }
    }
    hideFullScreen() {
    }
    /**
     * to save the given purchase order details
     */
    saveRecord() {       
        
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let userid = userDetails.UserID;
        this.showSupplierGridErrorMessage = false;
        this.showGridVendorErrorMessage = false;
        let status: boolean = true;
        
        let itemGroupVendorControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
        
        let RemarksControl = this.quotationForm.get('Remarks');
        
        if(itemGroupVendorControl.length == 0)
        { 
            this.showGridVendorErrorMessage = true;
            return;
        }
        
        if(itemGroupVendorControl.length < 3 && (RemarksControl.value == "" || RemarksControl.value == null))
        {  
            RemarksControl.setErrors({ 'required':true }); 
            RemarksControl.markAsTouched();
            return;
        }
        else
        {
            RemarksControl.setErrors(null);
            RemarksControl.markAsUntouched();
        }
        let quotationFormStatus = this.quotationForm.status;

        if (quotationFormStatus != "INVALID") {
            //getting the purchase order form details...
            let quotationRequestDetails: QuotationRequest = this.quotationForm.value;
           
            quotationRequestDetails.QuotationVendorItems.forEach(i => {
                if (i.QuotationId > 0) {
                    let previousRecord1 = this.selectedQuotationRequestDetails.QuotationVendorItems.find(j => j.QuotationId == i.QuotationId);

                    if (i.QuotationSupplier.SupplierId != previousRecord1.QuotationSupplier.SupplierId ||
                        i.QuotatedAmount != previousRecord1.QuotatedAmount || previousRecord1.IsSelected != i.IsSelected) {
                        i.IsModified = true;
                        
                    }
                  
                }
                else {
                    i.QuotationId = 0;
                }
            });
            this.showGridErrorMessage =false;
            quotationRequestDetails.PurchaseOrderRequestId = this.purchaseorderrequestid;
            quotationRequestDetails.CreatedBy = userid;
            quotationRequestDetails.Remarks = this.quotationForm.get('Remarks').value;
            quotationRequestDetails.CompanyId = this.sessionService.getCompanyId();
            
            quotationRequestDetails.QuotationVendorItems = quotationRequestDetails.QuotationVendorItems.filter(i => i.QuotationId == 0 || i.QuotationId == null || i.IsModified == true);

            if (this.selectedQuotationRequestDetails.QuotationRequestId == 0 || this.selectedQuotationRequestDetails.QuotationRequestId == null) {
                this.quotationRequestObj.createQuotationRequest(quotationRequestDetails, this.vendoruploadedFiles)
                    .subscribe((qId: number) => {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.purchaseorderrequestid = 0;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.vendoruploadedFiles.length = 0;
                        this.vendoruploadedFiles = [];
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.GetQuotationsRequest(qId);                        
                        this.showSupplierGridErrorMessage = false;
                        this.showGridVendorErrorMessage = false;
                        this.hideFullScreen();
                    });
            }
            else {
                quotationRequestDetails.QuotationRequestId = this.selectedQuotationRequestDetails.QuotationRequestId;
                quotationRequestDetails.PurchaseOrderRequestId = this.selectedQuotationRequestDetails.PurchaseOrderRequestId;
                quotationRequestDetails.deletedQuotationSupplierItems = this.deletedQuotationSupplierItems;
                quotationRequestDetails.QuotationVendorItemsToDelete = this.deletedQuotationVendorItems;
                quotationRequestDetails.QuotationAttachment = this.selectedQuotationRequestDetails.QuotationAttachment.filter(i => i.IsDelete == true);
                quotationRequestDetails.QuotationAttachmentUpdateRowId=this.selectedQuotationRequestDetails.QuotationAttachment.filter(i => i.IsDelete != true);
                quotationRequestDetails.QuotationAttachmentDelete = this.selectedQuotationRequestDetails.QuotationAttachmentDelete;
                quotationRequestDetails.QuotationAttachmentUpdateRowId=this.selectedQuotationRequestDetails.QuotationAttachmentUpdateRowId;
                this.quotationRequestObj.updateQuotationRequest(quotationRequestDetails, this.vendoruploadedFiles)
                    .subscribe((response) => {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.vendoruploadedFiles.length = 0;
                        this.vendoruploadedFiles = [];
                        this.deletedQuotationSupplierItems = [];
                        this.deletedQuotationSupplierItems.length = 0;
                        this.deletedQuotationVendorItems = [];
                        this.deletedQuotationVendorItems.length = 0;  
                        this.selectedQuotationRequestDetails.QuotationAttachmentDelete = [];
                        this.selectedQuotationRequestDetails.QuotationAttachmentDelete.length = 0;                                                
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.GetQuotationsRequest(quotationRequestDetails.QuotationRequestId);                       
                        this.showSupplierGridErrorMessage = false;
                        this.showGridVendorErrorMessage = false;
                        this.hideFullScreen();
                    });
            }
        }
        else {
            Object.keys(this.quotationForm.controls).forEach((key: string) => {
                if (this.quotationForm.controls[key].status == "INVALID" && this.quotationForm.controls[key].touched == false) {
                    this.quotationForm.controls[key].markAsTouched();
                }
            });
           
            let itemVendorGroupControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
            itemVendorGroupControl.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {

                    let itemVendorGroupControl = controlObj.get(key);
                    if (itemVendorGroupControl.status == "INVALID" && itemVendorGroupControl.touched == false) {
                        itemVendorGroupControl.markAsTouched();
                    }
                });
            });

        }
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord(){
        //setting this variable to true so as to show the purchase details
        this.quotationForm.reset();
        this.quotationForm.setErrors(null);
        if(this.QuotationRequestList.length > 0 && this.selectedQuotationRequestDetails!=undefined)
        {
            if(this.selectedQuotationRequestDetails.QuotationRequestId==undefined||this.selectedQuotationRequestDetails.QuotationRequestId==0)
            {
                this.onRecordSelection(this.QuotationRequestList[0].QuotationRequestId);
            }
            else{
            this.onRecordSelection(this.selectedQuotationRequestDetails.QuotationRequestId);
            }
            //setting this variable to true so as to show the purchase details
            this.hideinput = false;
            this.hidetext = true;
        }
        else
        {
            this.hideinput =null;
            this.hidetext =null;
        }
        this.uploadedFiles.length=0;
        this.uploadedFiles = [];
        this.vendoruploadedFiles.length = 0;
        this.vendoruploadedFiles = [];
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
        this.hideFullScreen();
    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let recordId = this.selectedQuotationRequestDetails.QuotationRequestId;
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.quotationRequestObj.deleteQuotationRequest(recordId, userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    this.GetQuotationsRequest(0);
                });
            },
            reject: () => {
            }
        });
    }
    /**
     * to show the purchase order details in edit mode....
     */
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.hideinput = true;
        this.hidetext = false;
        //resetting the item category form.
        this.quotationForm.reset();
        this.quotationForm.get('PORequest').setValue(this.selectedQuotationRequestDetails.PurchaseOrderRequestId);
       
        this.quotationForm.get('QuotationVendorItems').reset();
        this.quotationForm.setErrors(null);
        
        
        let itemGroupVendorControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
        itemGroupVendorControl.controls = [];
        itemGroupVendorControl.controls.length = 0;
       
        this.addVendorGridItem(this.selectedQuotationRequestDetails.QuotationVendorItems.length);
        this.quotationForm.patchValue(this.selectedQuotationRequestDetails);
    }
    split() {
        this.leftsection = !this.leftsection;
        this.rightsection = !this.rightsection;
    }
    matselect(event) {
        if (event.checked == true) {
            this.slideactive = true;
        }
        else {
            this.slideactive = false;
        }
    }
    /**
     * this method will be called on currency change event...
     */

    //to get the sub totalprice..
    getSubTotal() {
        let itemGroupControl = <FormArray>this.quotationForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data => {
                subTotal = subTotal + data.get('ItemQty').value * data.get('Unitprice').value;
            });
            return subTotal;
        }
    }
    //getting the total tax..
    getTotalTax(taxRate: number) {
        let totalTax = (this.getSubTotal() * taxRate) / 100;
        return totalTax;
    }
    //to get total price..
    calculateTotalPrice() {
        let subTotal = this.getSubTotal();
        this.quotationForm.get('SubTotal').setValue(subTotal);
        let discount = this.quotationForm.get('Discount').value;
        let shippingCharges = this.quotationForm.get('ShippingCharges').value;
        let OtherCharges = this.quotationForm.get('OtherCharges').value;
        let totalTax = this.getTotalTax(this.quotationForm.get('TaxRate').value);
        this.quotationForm.get('TotalTax').setValue(totalTax);
        let totalPrice = (subTotal - discount) + totalTax + shippingCharges + OtherCharges;
        this.quotationForm.get('TotalAmount').setValue(totalPrice);
    }
    /**
     * this method will be called on file upload change event...
     */
    onFileUploadChange(event: any) {
        let files: FileList = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                this.uploadedFiles.push(fileItem);
            }
            else {
                event.preventDefault();
                break;
            }
        }
    }
    /**
     * this method will be called on file close icon click event..
     */
    onFileClose(fileIndex: number) {
        this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
    }
    //for custome sort
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1;
            let value2;
            if (event.field == "Name") {
                value1 = data1["Item"]["ItemName"];
                value2 = data2["Item"]["ItemName"];
            }
            else if (event.field == "MeasurementUnitID") {
                value1 = data1["Item"]["MeasurementUnitCode"];
                value2 = data2["Item"]["MeasurementUnitCode"];
            }
            else if (event.field == "ItemTotal") {
                value1 = data1["ItemQty"] * data1["Unitprice"];
                value2 = data2["ItemQty"] * data2["Unitprice"];
            }
            else {
                value1 = data1[event.field];
                value2 = data2[event.field];
            }
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

    //this method will be called on date picker focus event..
    onDatePickerFocus(element: NgbInputDatepicker, event: any) {
        if (!element.isOpen()) {
            element.open();
        }
    }
    //
    onSearchInputChange(event: any) {
        if (this.quotationRequestSearchKey != "") {
           
                this.getAllSearchQuotationRequest(this.quotationRequestSearchKey, 0);
           
        }
        else {
            this.GetQuotationsRequest(0);
        }
    }
    onPaymentTermChange(event: any) {
        let paymentTermId = this.quotationForm.get('PaymentTermId').value;
        this.quotationForm.get('PaymentTerms').setValue(this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description);
    }
    onSearchClick() {
        if (this.quotationRequestSearchKey != "") {
           
                this.getAllSearchQuotationRequest(this.quotationRequestSearchKey, 0);
           
        }
        else {
            this.GetQuotationsRequest(0);
        }
    }
    pageChange(currentPageNumber: any) {
        this.quotationRequestPagerConfig.RecordsToSkip = this.quotationRequestPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.GetQuotationsRequest(0);
    }

    onPrintScreen(event: any) {
        if(this.selectedQuotationRequestDetails.QuotationRequestId > 0){      
            let pdfDocument = this.quotationRequestObj.printDetails(this.selectedQuotationRequestDetails.QuotationRequestId, this.companyId);
            pdfDocument.subscribe((data) => {
                let result = new Blob([data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(result);
                let tab = window.open();
                tab.location.href = fileUrl;
            });
        }
    }
    
    sendMailtoSuppliers() {
            let result = <Observable<Array<any>>>this.quotationRequestObj.sendQuotationRequestMailtoSuppliers(this.selectedQuotationRequestDetails.QuotationRequestId, this.companyId);
            result.subscribe((data) => {
                if (data) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.EmailResponse,
                        MessageType: MessageTypes.Success
                    });
                    this.selectedQuotationRequestDetails.QuotationVendorItems.forEach((data)=>{

                        data.IsMailSent = true;
                    });
                    this.selectedQuotationRequestDetails.QuotationVendorItems = this.selectedQuotationRequestDetails.QuotationVendorItems.filter((data,index)=>index>-1);
                }
            });
            
            this.GetQuotationsRequest(this.selectedQuotationRequestDetails.QuotationRequestId);
            

    }

   

    removeVendorGridItem(rowIndex: number) {   
        
        console.log("Delete is working",rowIndex);
        let itemGroupVendorControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
        let QuotationId = itemGroupVendorControl.controls[rowIndex].get('QuotationId').value;
        if (QuotationId > 0) {
            this.deletedQuotationVendorItems.push(QuotationId);
        
        this.selectedQuotationRequestDetails.QuotationAttachment.forEach(data=>{
            
                if(data.RowId==rowIndex)
                {
                    data.IsDelete =true;
                }else{
                    data.IsDelete =false;
                }               

        });
        console.log( this.vendoruploadedFiles);
        if (this.selectedQuotationRequestDetails.QuotationAttachmentDelete == null) {
            this.selectedQuotationRequestDetails.QuotationAttachmentDelete = [];
        }
        // this.selectedQuotationRequestDetails.QuotationAttachmentDelete.push(this.selectedQuotationRequestDetails.QuotationAttachment[rowIndex]);
        this.selectedQuotationRequestDetails.QuotationAttachmentDelete=this.selectedQuotationRequestDetails.QuotationAttachment.filter(i => i.IsDelete == true);
        this.selectedQuotationRequestDetails.QuotationAttachment = this.selectedQuotationRequestDetails.QuotationAttachment.filter(i => i.IsDelete != true).map((data,index)=>{
            
            if(data.RowId> rowIndex){
                data.RowId = data.RowId-1;
            }
             return data;
        });       
        this.selectedQuotationRequestDetails.QuotationAttachmentUpdateRowId=this.selectedQuotationRequestDetails.QuotationAttachment;
    }
    else {
        this.vendoruploadedFiles = this.vendoruploadedFiles.filter(data=>data.RowIndex!=rowIndex);

        this.vendoruploadedFiles.forEach((element,index) => {           
            if(element.RowIndex > rowIndex)
            {
                element.RowIndex = (element.RowIndex-1);
            }
        });


    }
        itemGroupVendorControl.removeAt(rowIndex);
        console.log(this.selectedQuotationRequestDetails.QuotationAttachment);
        console.log(this.selectedQuotationRequestDetails.QuotationAttachmentDelete);
    }

    onVendorFileClose(fileIndex: number) {
        this.vendoruploadedFiles = this.vendoruploadedFiles.filter((file, index) => index != fileIndex);
    }

    quotationAttachmentDelete(SelectedIndex: number) {
        let attachmentRecord = this.selectedQuotationRequestDetails.QuotationAttachment[SelectedIndex];
        if (this.selectedQuotationRequestDetails.QuotationAttachmentDelete == null) {
            this.selectedQuotationRequestDetails.QuotationAttachmentDelete = [];
        }
        this.selectedQuotationRequestDetails.QuotationAttachmentDelete.push(this.selectedQuotationRequestDetails.QuotationAttachment[SelectedIndex]);
        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                attachmentRecord.IsDelete = true;
                this.selectedQuotationRequestDetails.QuotationAttachment = this.selectedQuotationRequestDetails.QuotationAttachment.filter(i => i.IsDelete != true);
            },
            reject: () => {
            }
        });

    }

    onFileVendorUploadChange(event: any) {      
        
        let files: FileList = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                this.vendoruploadedFiles.push({ File: fileItem, RowIndex: this.selectedFileRowIndex });
                try {
                    let selectedRow = this.selectedQuotationRequestDetails.QuotationVendorItems[this.selectedFileRowIndex];
                    if (selectedRow.QuotationId > 0) {
                        selectedRow.IsModified = true;
                        let itemGroupControl = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
                        itemGroupControl.controls[this.selectedFileRowIndex].get('IsModified').setValue(true);
                        this.selectedQuotationRequestDetails.QuotationVendorItems = this.selectedQuotationRequestDetails.QuotationVendorItems.filter((i, index) => index > -1);
                    }
                }
                catch (error) {
                }
            }
            else {
                event.preventDefault();
                break;
            }
        }
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
    SelectQuotaion (eventData:any,rowIndex:number)
    {  
        let itemGroupVendorControl:FormArray = <FormArray>this.quotationForm.controls['QuotationVendorItems'];
        //let QuotationId = itemGroupVendorControl.controls[rowIndex].get('QuotationId').value;
        itemGroupVendorControl.controls.forEach(element => {         
                element.get('IsSelected').setValue(false); 
        });
        itemGroupVendorControl.controls[rowIndex].get('IsSelected').setValue(true);
      
    }
}
