import { Component, OnInit, ViewChild, Renderer } from "@angular/core";
import { POApprovalService } from "../../services/po-approval.service";
import { PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderTypes } from "../../models/po-creation.model";
import { PagerConfig, Messages, MessageTypes, UserDetails, Suppliers, WorkFlowStatus, PurchaseOrderType } from "../../../shared/models/shared.model";
import { WorkflowAuditTrail } from "../../models/workflow-audittrail.model";
import { SharedService } from "../../../shared/services/shared.service";
import { PoApproval, PoApprovalUpdateStatus } from "../../models/po-approval.model";
import { SessionStorageService } from "../../../shared/services/sessionstorage.service";
import { ActivatedRoute,ParamMap } from "@angular/router";
import { POCreationService } from "../../services/po-creation.service";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, catchError } from "rxjs/operators";
import { FormGroup, FormBuilder } from "@angular/forms";
import { getProcessId } from "../../../shared/shared";
import { PageAccessLevel, Roles } from "../../../administration/models/role";
@Component({
    selector: 'app-po-approval',
    templateUrl: './po-approval.component.html',
    styleUrls: ['./po-approval.component.css'],
    providers: [POApprovalService, POCreationService]
})
export class PoApprovalComponent implements OnInit {

    @ViewChild('poCode') private porCodeRef: any;
    errorMessage: string = Messages.NoRecordsToDisplay;
    purchaseOrdersList: Array<PurchaseOrderList> = [];
    purchaseOrderPagerConfig: PagerConfig;
    companyId: number;
    selectedPurchaseOrderTypeId: number = 0;
    selectedPurchaseOrderId: number = 0;
    purchaseOrderSearchKey: string = "";
    leftSection: boolean = false;

    auditTrailComments: Array<WorkflowAuditTrail> = [];
    remarks: string = "";
    PurchaseOrderId:any;
    PurchaseOrderTypeId:any;
    isApprovalPage: boolean = true;
    showLeftPanelLoadingIcon: boolean = false;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    filterMessage: string = "";
    poFilterInfoForm: FormGroup;
    showFilterPopUp: boolean = false;
    isFilterApplied: boolean = false;
    purchaseOrderType = PurchaseOrderType;
    currentPage: number = 1;
    workFlowStatus: any;
    approvePermission: boolean;
    printPermission: boolean;
    showPrintButton: boolean = false;
    SupplierNameValidate: string = "";
    viewLogPermission: boolean = false;
    showLogPopUp: boolean = false;
    public innerWidth: any;
    userDetails: UserDetails = null;
    userRoles = [];
    rolesAccessList = [];
    showfilters:boolean=true;
    showfilterstext:string="Show List" ;

    constructor(private poApprovalServiceObj: POApprovalService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        public activatedRoute: ActivatedRoute,
        private pocreationObj: POCreationService,
        private formBuilderObj: FormBuilder,
        private renderer: Renderer) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.purchaseOrderSearchKey = "";
        this.poFilterInfoForm = this.formBuilderObj.group({
            POCode: [''],
            SupplierName: [''],
            PoTypeId: [0]
        });
        this.workFlowStatus = WorkFlowStatus;
    }

    navigate() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels == null || roleAccessLevels == false) {
            this.sharedServiceObj.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
                this.userRoles = roles;
                this.userDetails.Roles = this.userRoles;
                this.sessionService.setUser(this.userDetails);
                let roleIds = Array.prototype.map.call(this.userDetails.Roles, s => s.RoleID).toString();
                if (roleIds != '') {
                    this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
                        this.rolesAccessList = data;
                        this.sessionService.setRolesAccess(this.rolesAccessList);
                        this.setRoles();
                    });
                }
            });
        }
        this.setRoles();

        this.activatedRoute.queryParamMap.subscribe((data) => {
            console.log("param change", data);
            const id: number = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
            this.purchaseOrderSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
            let processId = Number(this.activatedRoute.snapshot.queryParamMap.get('processId'));
            let cId = this.companyId;//Number(this.activatedRoute.snapshot.queryParamMap.get('cId'));  
            if (this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) {
                // this.searchForPurchaseOrdersApprovals(0,processId,id,cId);             
                this.searchForPurchaseOrdersApprovals(0, processId, id);
            }
            else if (id != undefined && id != 0 && id != null) {
                //this.searchForPurchaseOrdersApprovals(0,processId,id,cId);
                this.searchForPurchaseOrdersApprovals(0, processId, id);
            }
            else {
                this.getPurchaseOrders(0, 0);
            }
        });
    }
    setRoles(){
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "purchaseorderapproval")[0];
            let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
            if (auditLogRole != null)
                this.viewLogPermission = auditLogRole.IsView;
            this.approvePermission = formRole.IsApprove;
            this.printPermission = formRole.IsPrint;
        }
        else {
            this.approvePermission = true;
            this.printPermission = true;
        }
    }
    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('id') != undefined) {
                this.PurchaseOrderId = param.get('id');
            }
            if (param.get('typeid') != undefined) {
                this.PurchaseOrderTypeId = param.get('typeid');
            }
            this.selectedPurchaseOrderId=this.PurchaseOrderId;
            this.selectedPurchaseOrderTypeId=this.PurchaseOrderTypeId
            //alert("Purchase Order Id : " + this.PurchaseOrderId +" \n Purchase Order Type Id : " + this.PurchaseOrderTypeId)
        });


        this.purchaseOrderPagerConfig = new PagerConfig();
        this.resetPagerConfig();

        //getting the purchase order types.
        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data;
            });
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                //getting the purchase orders list..
                if (this.companyId != data) {
                    this.companyId = data;
                    this.navigate();
                }
            });
        this.activatedRoute.queryParamMap.subscribe((data) => {
            this.navigate();
        });
        this.showfilters =true;
        this.showfilterstext="Hide List" ;
    

    }
    //to get  the purchase orders..
    getPurchaseOrders(purchaseOrderIdToBeSelected: number, potypeId: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            UserId: userDetails.UserID
        };
        this.showLeftPanelLoadingIcon = true;
        this.poApprovalServiceObj.getPurchaseOrdersApprovals(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.purchaseOrdersList.length > 0) {
                    // if (purchaseOrderIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                    // }
                    // else {
                    //     this.onRecordSelection(purchaseOrderIdToBeSelected, potypeId);
                    // }
                }
                else {

                }
            }, () => { this.showLeftPanelLoadingIcon = false; });
    }
    //to get  the purchase orders..
    searchForPurchaseOrdersApprovals(purchaseOrderIdToBeSelected: number, processId?: number, poId?: number, cId?: number, poCode: string = "", supplierName: string = "", poTypeId?: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: this.purchaseOrderSearchKey == null || this.purchaseOrderSearchKey == "null" ? "" : this.purchaseOrderSearchKey,
            CompanyId: cId,
            UserId: userDetails.UserID,
            ProcessId: processId,
            PurchaseOrderId: poId,
            PoCode: poCode,
            SupplierName: supplierName,
            poTypeId: poTypeId
        };
        this.showLeftPanelLoadingIcon = true;
        this.poApprovalServiceObj.searchForPurchaseOrdersApprovals(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (this.purchaseOrdersList.length > 0) {
                    // if (purchaseOrderIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                    // }
                    // else {
                    //     this.onRecordSelection(purchaseOrderIdToBeSelected, this.purchaseOrdersList.find(i => i.PurchaseOrderId == purchaseOrderIdToBeSelected).POTypeId);
                    // }
                }
                else {

                }
            }, () => { }, () => { this.showLeftPanelLoadingIcon = false; });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number, purchaseOrderTypeId: number) {
        this.split();
        this.selectedPurchaseOrderTypeId = purchaseOrderTypeId;
        //this.selectedPurchaseOrderId = -1;
        if (this.workFlowStatus.WorkFlowStatusId = WorkFlowStatus.WaitingForApproval) {
            this.showPrintButton = false;
        }
        else
            this.showPrintButton = true;

        setTimeout(() => {
            this.selectedPurchaseOrderId = purchaseOrderId;
        }, 50);
    }
    pageChange(currentPageNumber: any) {
        this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getPurchaseOrders(0, 0);
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
      this.showfilterstext="Show List" 
    }
    }
    
    hidefilter() {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth < 550) {
            $(".filter-scroll tr").click(function () {
                $(".leftdiv").addClass("hideleftcol");
                $(".rightPanel").addClass("showrightcol");
                $(".rightcol-scrroll").height("100%");
            });
        }
    }

    showLeftCol(event) {
        $(".leftdiv").removeClass("hideleftcol");
        $(".rightPanel").removeClass("showrightcol");
    }
    showFullScreen() {

    }
    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }
    updateStatus(data: PoApprovalUpdateStatus) {
        let remarks = "";
        let successMessage = "";
        let WorkFlowStatusPTApp: number = 0;
        if (data.StatusId == WorkFlowStatus.Approved) {
            if (data.Remarks != "" && data.Remarks != null) {
                remarks = data.Remarks;
            }
            else {
                remarks = "Approved";
            }
            successMessage = Messages.Approved;
        }
        else if (data.StatusId == WorkFlowStatus.Rejected) {
            if (data.Remarks != "" && data.Remarks != null) {
                remarks = data.Remarks;
            }
            else {
                remarks = "Rejected";
            }
            successMessage = Messages.Rejected;
            if (Number(data.PendingTA) == WorkFlowStatus.PendingForTerminationApproval) {
                // data.StatusId = WorkFlowStatus.Approved;
                WorkFlowStatusPTApp = WorkFlowStatus.PendingForTerminationApproval;
            }
        }
        else {
            remarks = data.Remarks;
            successMessage = Messages.SentForClarification;
        }

        // console.log(data.StatusId);
        let workFlowStatus: PoApproval = {
            PurchaseOrderId: this.selectedPurchaseOrderId,
            UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            WorkFlowStatusId: data.StatusId,
            Remarks: remarks,
            PurchaseOrderRequestUserId: this.purchaseOrdersList.find(j => j.PurchaseOrderId == this.selectedPurchaseOrderId).CreatedBy,
            ApproverUserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            ProcessId: data.ProcessId,
            PurchaseOrderCode: data.PoCode,
            StartDate: data.StartDate,
            EndDate: data.EndDate,
            BillingFrequencyId: data.BillingFrequencyId,
            PODate: data.PODate,
            CompanyId: data.CompanyId,
            IsVoid: data.IsVoid,
            IsAccept: data.IsAccept,
            WorkFlowStatusPTA: WorkFlowStatusPTApp
        };
        this.remarks = remarks;
        this.poApprovalServiceObj.updatePurchaseOrderApprovalStatus(workFlowStatus)
            .subscribe((response) => {
                this.remarks = "";
                this.purchaseOrderSearchKey = "";
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: successMessage,
                    MessageType: MessageTypes.Success
                });
                this.getPurchaseOrders((data.StatusId == 4 || data.StatusId == 5) ? 0 : workFlowStatus.PurchaseOrderId, this.selectedPurchaseOrderTypeId);
            });
    }

    resetPagerConfig() {
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = 10;
        this.currentPage = 1;
    }

    onSearchInputChange(event: any) {
        this.resetPagerConfig();
        if (event.target.value != "") {
            if (event.target.value.length >= 3) {

                this.purchaseOrderSearchKey = event.target.value;
                this.searchForPurchaseOrdersApprovals(0, 0, 0);
            }
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }
    onPDFPrint() {
        // if(this.selectedPurchaseOrderTypeId === 1){  // currently for inventory po type
        let pdfDocument = this.pocreationObj.printDetails(this.selectedPurchaseOrderId, this.selectedPurchaseOrderTypeId, this.sessionService.getCompanyId());
        pdfDocument.subscribe((data) => {
            let record = this.purchaseOrdersList.find(j => j.PurchaseOrderId == this.selectedPurchaseOrderId && j.POTypeId == this.selectedPurchaseOrderTypeId)
            if (record.PurchaseOrderCode == null) {
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "POA" + record.DraftCode + ".pdf");
            }
            else
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "POA" + record.PurchaseOrderCode + ".pdf");

            //     let result = new Blob([data], { type: 'application/pdf' });
            //   if (window.navigator && window.navigator.msSaveOrOpenBlob) {//IE
            //     window.navigator.msSaveOrOpenBlob(result, "POApproval.pdf");


            //   } else {
            //     const fileUrl = URL.createObjectURL(result);
            //     let tab = window.open();
            //     tab.location.href = fileUrl;
            //   }
        });
        //}
    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {

                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

    openDialog() {
        this.showFilterPopUp = true;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    resetData() {
        this.isFilterApplied = false;
        this.showFilterPopUp = true;
        this.purchaseOrderSearchKey = "";
        this.resetFilters();
    }
    resetFilters() {
        this.SupplierNameValidate = "";
        this.purchaseOrderSearchKey = "";
        this.poFilterInfoForm.get('POCode').setValue("");
        this.poFilterInfoForm.get('SupplierName').setValue("");
        this.poFilterInfoForm.get('PoTypeId').setValue(0);
        this.filterMessage = "";
        this.getPurchaseOrders(0, 0);
        this.isFilterApplied = false;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    suppliernamechange(event) {
        this.SupplierNameValidate = event.target.value;
    }
    filterData() {
        let poCode: string = "";
        let supplierName: string = "";
        let poTypeId: number = 0;
        this.filterMessage = "";
        if (this.poFilterInfoForm.get('POCode').value != "") {
            poCode = this.poFilterInfoForm.get('POCode').value;
        }
        if (this.poFilterInfoForm.get('SupplierName').value != "") {
            supplierName = this.poFilterInfoForm.get('SupplierName').value.SupplierName;
        }
        if (this.poFilterInfoForm.get('PoTypeId').value != "") {
            poTypeId = this.poFilterInfoForm.get('PoTypeId').value;
        }
        if (poCode === '' && supplierName === '' && (poTypeId == 0 || poTypeId == null)) {
            if (open) {
                if ((this.poFilterInfoForm.get('SupplierName').value == null || this.poFilterInfoForm.get('SupplierName').value == "") && this.SupplierNameValidate != "") {
                    this.filterMessage = "No matching records are found";
                    this.showFilterPopUp = true;
                }
                else {
                    this.filterMessage = "Please select any filter criteria";
                }
            }
            return;
        }
        this.searchForPurchaseOrdersApprovals(0, getProcessId(poTypeId), 0, this.companyId, poCode, supplierName, poTypeId);
        if (this.purchaseOrdersList.length > 0) {
            this.isFilterApplied = true;
            if (open) {
                this.showFilterPopUp = false;
            }
        }
        else {
            this.showFilterPopUp = false;
            this.errorMessage = Messages.NoRecordsToDisplay;
        }
    }
}
