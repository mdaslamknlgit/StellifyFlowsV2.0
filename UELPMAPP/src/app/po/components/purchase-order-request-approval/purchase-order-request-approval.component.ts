import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { PurchaseOrderTypes } from "../../models/po-creation.model";
import { PORequestApprovalService } from "../../services/purchase-order-request-approval.service";
import { PagerConfig, Messages, Currency, PaymentTerms, Suppliers, MessageTypes, UserDetails, PurchaseOrderType, WorkFlowStatus, WorkFlowProcess } from "../../../shared/models/shared.model";
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { GridOperations } from "../../../shared/models/shared.model";
import { SortEvent } from "primeng/components/common/api";
import { FullScreen, PrintScreen,getProcessId } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { PurchaseOrderRequestList, PurchaseOrderRequestDetails, PurchaseOrderRequestDisplayResult, CostOfService } from '../../models/purchase-order-request.model';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { SharedService } from '../../../shared/services/shared.service';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { DeliveryTerms } from '../../models/delivery-terms.model';
import { PurchaseOrderRequestApproval } from '../../models/purchase-order-request-approval.model';
import { WorkflowAuditTrail } from '../../models/workflow-audittrail.model';
import { ActivatedRoute,Router } from '@angular/router';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-purchase-order-request-approval',
    templateUrl: './purchase-order-request-approval.component.html',
    styleUrls: ['./purchase-order-request-approval.component.css'],
    providers: [PORequestApprovalService, PurchaseOrderRequestService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class PurchaseOrderRequestApprovalComponent implements OnInit {

    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('porCode') private porCodeRef: any;
    purchaseOrdersRequestList: Array<PurchaseOrderRequestList> = [];
    purchaseOrderRequestApprovalPagerConfig: PagerConfig;
    purchaseOrderRequestApprovalItemsGridConfig: PagerConfig;
    selectedPORDetails: PurchaseOrderRequestDetails;
    auditTrailComments: Array<WorkflowAuditTrail> = [];
    //this array will hold the list of columns to display in the grid..
    gridColumns: Array<{ field: string, header: string }> = [];
    gridVendorColumns: Array<{ field: string, header: string }> = [];
    //this will tell whether we are using add/edit/delete mode the grid..
    operation: string;
    uploadedFiles: Array<File> = [];
    leftSection: boolean = false;
    rightSection: boolean = false;
    slideactive: boolean = false;
    scrollbarOptions: any;
    purchaseOrderSearchKey: string;
    apiEndPoint: string;
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    linesToAdd1: number = 2;
    paymentTerms: PaymentTerms[] = [];
    deliveryTerms: DeliveryTerms[] = [];
    measurementUnits: MeasurementUnit[] = [];
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    departments: Location[] = [];
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    costOfServiceType: CostOfService[] = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    purchaseOrderRequestId: number = 0;
    showLeftPanelLoadingIcon:boolean=false;
    showRightPanelLoadingIcon:boolean=false;
    purchaseOrderRequestForm: FormGroup;
    errorMessage: string = Messages.NoRecordsToDisplay;
    companyId: number = 0;
    porFilterInfoForm: FormGroup;
    filterMessage:string;
    isFilterApplied: boolean = false;
    showFilterPopUp:boolean=false;
    purchaseOrderType;
    workFlowStatus:any;
    public innerWidth: any;
    constructor(private purchaseOrderRequestApprovalObj: PORequestApprovalService,
        private purchaseOrderRequestObj: PurchaseOrderRequestService,
        private sharedServiceObj: SharedService, 
        public route: ActivatedRoute,
        private routeObj:Router,
        public sessionService: SessionStorageService,
        private formBuilderObj: FormBuilder,
        private renderer: Renderer,
      ) {

        this.gridColumns = [
            { field: 'IsDetailed',header:'Is Detailed' },
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Item' },
            { field: 'ItemDescription', header: 'Description' },
            { field: 'MeasurementUnitID', header: 'UOM' },
            { field: 'ItemQty', header: 'Qty' },
            { field: 'Unitprice', header: 'Price' },
            { field: 'TaxName', header: 'Tax Name' },
            { field: 'TaxAmount', header: 'Tax Amount' },
            { field: 'ItemTotal', header: 'Total' }
        ];

        this.gridVendorColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Supplier Name' },
            { field: 'QuotationAmount', header: 'Quotation Amount' },
            { field: 'Attachment', header: 'Attachment' }
        ];
        this.apiEndPoint = environment.apiEndpoint;
        
        this.purchaseOrderRequestForm = this.formBuilderObj.group({
            'Remarks': [""],
        });

        this.companyId = this.sessionService.getCompanyId();
        this.porFilterInfoForm = this.formBuilderObj.group({
            PORCode: [''],
            SupplierCategory: ['']
        });

        this.purchaseOrderType = PurchaseOrderType; 
        this.workFlowStatus = WorkFlowStatus;
        //this.selectedPORDetails = new PurchaseOrderRequestDetails();
    }    


    ngOnInit() {       


        this.purchaseOrderRequestApprovalPagerConfig = new PagerConfig();
        this.purchaseOrderRequestApprovalPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderRequestApprovalPagerConfig.RecordsToFetch = 10;

        this.purchaseOrderRequestApprovalItemsGridConfig = new PagerConfig();
        this.purchaseOrderRequestApprovalItemsGridConfig.RecordsToSkip = 0;
        this.purchaseOrderRequestApprovalItemsGridConfig.RecordsToFetch = 20;

        this.selectedPORDetails = new PurchaseOrderRequestDetails();
        this.operation = GridOperations.Display;

        this.sharedServiceObj.CompanyId$
        .subscribe((data)=>{
            this.companyId = data;
            this.getPurchaseOrdersRequestApproval(0);            
        });
        this.route.queryParamMap.subscribe((data)=>{               
            this.purchaseOrderSearchKey = this.route.snapshot.queryParamMap.get('code');       
            const id: number = Number(this.route.snapshot.queryParamMap.get('id'));
            if(isNaN(id)==false && id >0)
            {
               this.getAllSearchPurchaseOrder("",id);
            }
            else
            {
               this.getPurchaseOrdersRequestApproval(0);
            }
        });
        this.purchaseOrderRequestObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data;
            });
        //getting the list of cost of service types.
        this.purchaseOrderRequestObj.getCostOfServiceTypes()
            .subscribe((data: CostOfService[]) => {
                this.costOfServiceType = data;
            });
        this.sharedServiceObj.getAllDepartments()
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;
            });
        this.operation = GridOperations.Display;

        this.getPaymentTerms();
        //getting the purchase orders list..

        this.getMeasurementUnits();
        this.getDeliveryTerms();
        this.noneselected();
    }
       
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) =>{
                if(term==""){

    }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    companyId:this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
    );

    noneselected(){
        return this.purchaseOrdersRequestList.filter(i=>i.PurchaseOrderRequestId==null);
    }

    getPaymentTerms() {
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

    getDeliveryTerms() {
        this.sharedServiceObj.getAllDeliveryTerms(this.sessionService.getCompanyId())
            .subscribe((data: DeliveryTerms[]) => {
                this.deliveryTerms = data;
            });
    }

    //to get  the purchase orders..
    getPurchaseOrdersRequestApproval(PurchaseOrderRequestIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.showLeftPanelLoadingIcon = true;
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderRequestApprovalPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderRequestApprovalPagerConfig.RecordsToFetch,
            UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            companyId:this.companyId
        };
        this.purchaseOrderRequestApprovalObj.getPurchaseOrderRequests(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderRequestDisplayResult) => {
                this.purchaseOrdersRequestList = data.PurchaseOrdersRequest;
                this.purchaseOrderRequestApprovalPagerConfig.TotalRecords = data.TotalRecords;  
                this.showLeftPanelLoadingIcon = false;            
                if (this.purchaseOrdersRequestList.length > 0) {
                    if (PurchaseOrderRequestIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersRequestList[0].PurchaseOrderRequestId,this.purchaseOrdersRequestList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(PurchaseOrderRequestIdToBeSelected,this.purchaseOrdersRequestList.find(x=>x.PurchaseOrderRequestId==PurchaseOrderRequestIdToBeSelected).POTypeId);
                    }
                }
                else {                       
                    //this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;           
            });
    }
    //to get list of purchase orders..
    getAllSearchPurchaseOrder(searchKey: string="", purchaseOrderIdToBeSelected: number,poCode:string="",supplierName:string="") {
       
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderRequestApprovalPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderRequestApprovalPagerConfig.RecordsToFetch,
            Search: searchKey==null||searchKey=="null"?"":searchKey,
            PurchaseOrderReqId:purchaseOrderIdToBeSelected,
            UserId:userDetails.UserID,
            PORCodeFilter:poCode,
            SupplierNameFilter:supplierName
        };
        this.showLeftPanelLoadingIcon = true;
        this.purchaseOrderRequestApprovalObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderRequestDisplayResult) => {
               
                this.purchaseOrdersRequestList = data.PurchaseOrdersRequest;
                this.purchaseOrderRequestApprovalPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;       
                if (this.purchaseOrdersRequestList.length > 0) {
                    if (purchaseOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersRequestList[0].PurchaseOrderRequestId,this.purchaseOrdersRequestList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(purchaseOrderIdToBeSelected,this.purchaseOrdersRequestList.find(x=>x.PurchaseOrderRequestId==purchaseOrderIdToBeSelected).POTypeId);
                    }
                }
            },(err)=>{
                this.showLeftPanelLoadingIcon = false;       
            });
    }

    
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderRequestId: number,poTypeId:number) {
        let userId = JSON.parse(sessionStorage.getItem('userDetails')).UserID;
        this.showRightPanelLoadingIcon = true;       
        console.log("potype",poTypeId,getProcessId(poTypeId,true));
        this.purchaseOrderRequestApprovalObj.getPurchaseOrderDetails(purchaseOrderRequestId,getProcessId(poTypeId,true), userId)
            .subscribe((data: { purchaseOrderDetails: PurchaseOrderRequestDetails, auditTrailResult: any }) => {
                this.showRightPanelLoadingIcon = false;    
                this.selectedPORDetails = data.purchaseOrderDetails;
                if(data.purchaseOrderDetails.POTypeId==PurchaseOrderType.FixedAssetPo)
                {
                    this.selectedPORDetails.PurchaseOrderRequestItems.forEach((data,index)=>{
                        this.setSerialNumber(index,data.IsDetailed,false);
                    });   
                    this.selectedPORDetails.PurchaseOrderRequestItems =  this.selectedPORDetails.PurchaseOrderRequestItems.filter((data,index)=>index>-1);
                }
                this.auditTrailComments = data.auditTrailResult;
                this.operation = GridOperations.Display;

            }, (error) => {
                this.showRightPanelLoadingIcon = false;    
            });

    }

    setSerialNumber(currentIndex:number,isDetailed:boolean,isEdit:boolean)
    {
        let lastParentSNos:number[]= [];
        let serialNumber:any=0;
        lastParentSNos = this.selectedPORDetails.PurchaseOrderRequestItems.filter((rec,index)=>rec.IsDetailed!=true && index < currentIndex).map((data)=>data.Sno);
        if(lastParentSNos.length>0)
        {
            let lastParentSerialNumber = Math.max.apply(null,lastParentSNos);
            let currentRecordSerialNumber = lastParentSerialNumber+1;
            if(isDetailed==true)
            {
                let lastParentIndexs:number[] =[]; 
                this.selectedPORDetails.PurchaseOrderRequestItems.forEach((rec,index)=>{
                    if(rec.IsDetailed!=true && index < currentIndex)
                    {
                        lastParentIndexs.push(index);
                    }
                });
                let lastParentIndex =  Math.max.apply(null,lastParentIndexs);
                serialNumber = lastParentSerialNumber+"."+(currentIndex-lastParentIndex);
            }
            else
            {
                serialNumber = currentRecordSerialNumber;
            }
        }
        else
        {
            serialNumber =1;    
        }
        this.selectedPORDetails.PurchaseOrderRequestItems[currentIndex].Sno=serialNumber;
    }

    showFullScreen() {
 this.innerWidth = window.innerWidth;
 if(this.innerWidth > 1000){ 
 FullScreen(this.rightPanelRef.nativeElement);
 }
        //  this.hideLeftPanel = true;
        // this.sharedServiceObj.hideAppBar(true);//hiding the app bar..
    }
    hideFullScreen() {
        // this.hideLeftPanel = false;
        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
    }
    splite() {
        this.leftSection = !this.leftSection;
        this.rightSection = !this.rightSection;
    }
    matselect(event) {
        if (event.checked == true) {
            this.slideactive = true;
        }
        else {
            this.slideactive = false;
        }
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
    //
    onSearchInputChange(event: any) {
        if (this.purchaseOrderSearchKey != "") {
           
                this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0);
           
        }
        else {
            this.getPurchaseOrdersRequestApproval(0);
        }
    }
    onSearchClick() {
        if (this.purchaseOrderSearchKey != "") {
            
                this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0);
           
        }
        else {
            this.getPurchaseOrdersRequestApproval(0);
        }
    }

    updateStatus(statusId: number) {
        let remarks = "";
        let successMessage = "";
        let formRemarks = this.purchaseOrderRequestForm.get('Remarks').value;
        if((formRemarks==""||formRemarks==null)&&statusId==2)
        {
            this.purchaseOrderRequestForm.get('Remarks').setErrors({"required":true});
            this.purchaseOrderRequestForm.get('Remarks').markAsTouched();
            return ;
        }
        if (statusId ==  WorkFlowStatus.Approved) {
            if(formRemarks!=""&&formRemarks!=null){
               remarks =formRemarks;
            }
            else{
              remarks = "Approved";
            }
            successMessage = Messages.Approved;
        }
        else if (statusId == WorkFlowStatus.Rejected) {
            if(formRemarks!=""&&formRemarks!=null){
                remarks = formRemarks;
            }
            else {
              remarks = "Rejected";
            }          
            successMessage = Messages.Rejected;
        }
        else {
            remarks = formRemarks;
            successMessage = Messages.SentForClarification;
        }
        let workFlowStatus: PurchaseOrderRequestApproval = {
            PurchaseOrderRequestId: this.selectedPORDetails.PurchaseOrderRequestId,
            UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            PurchaseOrderRequestUserId: this.selectedPORDetails.CreatedBy,
            ApproverUserId:0,
            PurchaseOrderRequestCode:this.selectedPORDetails.PurchaseOrderRequestCode,
            ProcessId:getProcessId(this.selectedPORDetails.POTypeId,true),
            CompanyId:this.selectedPORDetails.CompanyId
        };
        this.purchaseOrderRequestApprovalObj.updatePurchaeOrderApprovalStatus(workFlowStatus)
            .subscribe((data) => {
                this.purchaseOrderRequestForm.get('Remarks').setValue("");
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: successMessage,
                    MessageType: MessageTypes.Success
                });
                this.purchaseOrderSearchKey = "";
                this.getPurchaseOrdersRequestApproval((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.PurchaseOrderRequestId);
            });
    }
    pageChange(currentPageNumber: any) {
        if(!isNaN(currentPageNumber))
        {
            this.purchaseOrderRequestApprovalPagerConfig.RecordsToSkip = this.purchaseOrderRequestApprovalPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            this.getPurchaseOrdersRequestApproval(0);
        }
    }

    onPDFPrint() {
        //let userId = JSON.parse(sessionStorage.getItem('userDetails')).UserID;
        let pdfDocument = this.purchaseOrderRequestApprovalObj.printDetails(this.selectedPORDetails.PurchaseOrderRequestId,getProcessId(this.selectedPORDetails.POTypeId,true), this.companyId);
        pdfDocument.subscribe((data) => {
        let record=this.purchaseOrdersRequestList.find(j=>j.PurchaseOrderRequestId==this.selectedPORDetails.PurchaseOrderRequestId && j.POTypeId==this.selectedPORDetails.POTypeId)
            if(record.PurchaseOrderRequestCode==null)
            {
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "PORA" + record.DraftCode+".pdf");
            }
                else
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "PORA" + record.PurchaseOrderRequestCode+".pdf");
          // let result = new Blob([data], { type: 'application/pdf' });
            // const fileUrl = URL.createObjectURL(result);
            // let tab = window.open();
            // tab.location.href = fileUrl;
        });
    }
    filterData() {
        let poCode:string = "";
        let supplierName:string = "";
        let poTypeId:number = 0;
        this.filterMessage = "";
        if (this.porFilterInfoForm.get('PORCode').value != "") {
            poCode = this.porFilterInfoForm.get('PORCode').value;
        }
        if (this.porFilterInfoForm.get('SupplierCategory').value != "") {
            supplierName = this.porFilterInfoForm.get('SupplierCategory').value.SupplierName;
        }
        if (poCode === '' && supplierName === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }
        this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey,0,poCode,supplierName);
        if(this.purchaseOrdersRequestList.length>0){
            this.isFilterApplied=true;
            if (open) {
                this.showFilterPopUp = false;
            }
        }
    }
    resetFilters() {
        this.porFilterInfoForm.get('PORCode').setValue("");
        this.porFilterInfoForm.get('SupplierCategory').setValue("");
        this.filterMessage = "";
        if (this.purchaseOrdersRequestList.length > 0) {
            this.getPurchaseOrdersRequestApproval(0);
        }
        this.isFilterApplied = false;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    resetData() {
        this.isFilterApplied = false;
        this.showFilterPopUp = true;
        this.resetFilters();
    }
    openDialog() {
        this.showFilterPopUp = true;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
}
