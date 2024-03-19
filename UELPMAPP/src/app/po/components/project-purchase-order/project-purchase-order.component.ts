import { Component, ViewChild, OnInit, Renderer } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { ProjectContractMasterService } from '../../services/project-contract-master.service';
import { ProjectPurchaseOrderService } from '../../services/project-purchase-order.service';
import { TaxService } from '../../services/tax.service';
import { ProjectPurchaseOrder, ProjectPurchaseOrderDisplayResult } from '../../models/project-purchase-order.model';
import { ProjectMasterContract, ProjectContractMasterFilterModel, ProjectContractVariationOrderFilterModel } from '../../models/project-contract-master.model';
import { WorkFlowStatus, UserDetails, WorkFlowProcess, Messages, MessageTypes, PagerConfig, WorkFlowApproval, WorkFlowStatusModel, Companies } from '../../../shared/models/shared.model';
import { FullScreen, restrictMinus } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { SharedService } from '../../../shared/services/shared.service';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';

@Component({
    selector: 'app-project-purchase-order',
    templateUrl: './project-purchase-order.component.html',
    styleUrls: ['./project-purchase-order.component.css'],
    providers: [ProjectPurchaseOrderService, ProjectContractMasterService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ProjectPurchaseOrderComponent implements OnInit {
    IsFilterDataArrive: boolean = false;
    interval;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('documentCode') private docCodeRef: any;
    companyId: number = 0;
    commercialDiscount: number = 0;
    hideText: boolean = true;
    hideInput: boolean = false;
    selectedPOId: number = 0;
    moduleHeading = "Project Purchase Order";
    projectPoList: Array<ProjectPurchaseOrder> = [];
    projectPOItemColumns: Array<{ field: string, header: string, width?: string }> = [];
    projectPurchaseOrderForm: FormGroup;
    poFilterInfoForm: FormGroup;
    linesToAdd: number = 2;
    selectedPODetails: ProjectPurchaseOrder;
    popCostCategories: Array<any> = [];
    popApportionments: Array<any> = [];
    workFlowStatus: any;
    gridSummaryRows: Array<string> = ["Sub-Total", "Commercial discount", "Total before GST", "GST%", "Total"];
    formContentLength: number = 0;
    uploadedFiles: Array<File> = [];
    purchaseOrderPagerConfig: PagerConfig;
    requestSearchKey: string = "";
    showFilterPopUp: boolean = false;
    isApprovalPage: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    leftSection: boolean = false;
    rightSection: boolean = false;
    isFilterApplied: boolean = false;
    scrollbarOptions: any;
    showGridErrorMessage1: boolean = false;
    showVoidPopUp: boolean = false;
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    POPDistributionSummaryColumns: Array<{ field: string, header: string, width: string }> = [];
    isExisted: boolean = false;
    public innerWidth: any;
    workFlowStatuses: Array<WorkFlowStatusModel> = [];
    selectedProjectMasterContract: ProjectMasterContract
    constructor(private formbuilderObj: FormBuilder,
        public activatedRoute: ActivatedRoute,
        private projectContractMasterServiceObj: ProjectContractMasterService,
        private projectPurchaseOrderServiceObj: ProjectPurchaseOrderService,
        private sessionService: SessionStorageService,
        private sharedServiceObj: SharedService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private renderer: Renderer) {
        this.projectPurchaseOrderForm = this.formbuilderObj.group({
            ProjectPurchaseOrderId: [0],
            PoCode: [""],
            DraftCode: [""],
            // SupplierInvoiceDate: [new Date(), [Validators.required]],
            // SupplierInvoiceNo: ["", [Validators.required]],
            JobCompletionDate: [new Date()],
            DateOfValuation: [new Date(), Validators.required],
            DateOfCertification: [new Date(), Validators.required],
            CertificateNumber: [0, Validators.required],
            //CertificateNumber: [{ value: 0, disabled: true }, Validators.required],
            ProjectMasterContractId: [null, Validators.required],
            ContractValueTotal: [0],
            CommercialDiscount: [0],     
            PreviousCommercialDiscount: [0],   //
            PrevAccumulatedPaymentTotal: [0],  //CV1  db
            CurrentPaymentTotal: [0],
            AccumulatedTotal: [0],
            ContractValueSubTotal: [0],   //
            PrevAccumulatedPaymentSubTotal: [0],  //
            CurrentPaymentSubTotal: [0],   //
            AccumulatedSubTotal: [0],    //
            TaxId: [0],
            SubjectToRetentionPercentageA1: [0],
            SubjectToRetentionPercentageA2: [0],
            SubjectToRetentionAmountA1: [0],
            SubjectToRetentionAmountA2: [0],
            NoRetentiontionPercentage: [0],   //
            NoRetentiontionAmount: [0],
            RetentionSum: [0],
            //RetentionSumForThismonth: [0],
            CalculatedRetentionSum1: [0],   //
            CalculatedRetentionSum2: [0],   //            
            CalculatedRetentionSum3: [0],   //          
            // GrandTotal: [0],
            WorkFlowStatusId: [0],
            WorkFlowStatus: [""],
            CreatedBy: 0,
            CreatedDate: [new Date()],
            ProjectPurchaseOrderItems: this.formbuilderObj.array([]),
            DeletedProjectPurchaseOrderItems: [],
            CompanyId: [0],
            Supplier: [null],  
            ProjectName: [""],   
            ContractStartDate: [new Date()],   
            ContractEndDate: [new Date()],   
            OriginalContractSum: [0],    
            POPMasterCode: "",  

            
            DistributionPercentageTotal: [0],   //  Distribution Grid
            ContractAmountTotal: [0], // Distribution Grid
            CertificationTotal: [0],  // Distribution Grid
            RetentionTotal: [0],     // Distribution Grid
            POPDistributionSummaryItems: this.formbuilderObj.array([]),
            GST: [0],
            GSTAdjustment: [0],
            RetentionSumForThismonth: [0],   //

            RetionSumCaluculated: [0],  //CV2  db
            PreviousRetentionAccumulatedSum: [0],   //CV3  db
            NetRetention: [0],   //
            PreviousCertifiedContractSum: [0],   //
            PreviousCertifiedGST: [0],   //
            PreviousCertifiedGSTAdjustment: [0],   //
            CertifiedGST:0,
            CertifiedGSTAdjustment: [0],   //       
            PaymentTotal: [0],   //
            CurrentCertificationAmount: [0],   //Current Due db
            PreviousMonthReleaseRetentionSum: [0],   //CV5 
            CurrentNettRetention: [0],      //
            CurrentPaymmentSummaryTotal: [0]   //
        });

        this.poFilterInfoForm = this.formbuilderObj.group({
            DocumentCode: [''],
            WorkFlowStatusId: [0],
            ProjectName: [""]
        });

        this.selectedPODetails = new ProjectPurchaseOrder();
        this.selectedProjectMasterContract = new ProjectMasterContract();
        this.workFlowStatus = WorkFlowStatus;
        this.purchaseOrderPagerConfig = new PagerConfig();
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = 10;

        this.projectPOItemColumns = [
            { field: 'Sno', header: 'S.no.', width: "4%", },
            { field: 'ItemDescription', header: 'Description', width: "14%" },
            { field: 'AccountCodeId', header: 'Expense Category', width: "10%" },
            { field: 'AccountCode', header: 'Account Code', width: "10%" },
            { field: 'TypeOfCost', header: 'Type Of Cost', width: "10%" },
            { field: 'ApportionmentId', header: 'Apportionment Method', width: "10%" },
            { field: 'ContractValue', header: 'Contract Value', width: "10%" },
            { field: 'PrevAccumulatedAmount', header: 'Prev Accumulated Amount', width: "10%" },
            { field: 'CurrentPayment', header: 'Current Payment', width: "10%" },
            { field: 'Accumulated Payment', header: 'Accumulated Payment', width: "10%" },
            { field: 'OverallStatus', header: 'Status', width: "5%" }
        ];

        this.POPDistributionSummaryColumns = [{ field: 'Sno', header: 'S.no.', width: "10%", },
        { field: 'Company', header: 'Company', width: "20%" },
        { field: 'DistributionPercentage', header: 'Distribution Percentage', width: "20%" },
        { field: 'ContractAmount', header: 'Contract Amount', width: "15%" },
        { field: 'ThisCertification', header: 'This Certification', width: "15%" },
        { field: 'RetentionAmount', header: 'Retention Amount', width: "20%" }
        ];
    }

    ngOnInit() {
        this.getWorkFlowStatus();
        this.getProjectPOList(0);
    }

    getWorkFlowStatus() {
        this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.InventoryPO).subscribe((data: Array<WorkFlowStatusModel>) => {
            this.workFlowStatuses = data;
        });
    }

    addRecord() {
        //setting this variable to false so as to show the purchase order details in edit mode
        this.hideText = false;
        this.hideInput = true;
        this.linesToAdd = 2;
        this.selectedPODetails = new ProjectPurchaseOrder();
        this.selectedPODetails.CreatedDate = this.reqDateFormatPipe.transform(new Date());
        this.clearForm();
        this.showFullScreen();
    }

    cancelRecord() {
        if (this.projectPoList.length > 0 && (this.selectedPODetails.ProjectPurchaseOrderId == 0 || this.selectedPODetails.ProjectPurchaseOrderId == undefined)) {
            this.onRecordSelection(this.projectPoList[0].ProjectPurchaseOrderId);
        }
        this.hideText = true;
        this.hideInput = false;
    }

    clearForm() {
        this.projectPurchaseOrderForm.reset();
        this.projectPurchaseOrderForm.setErrors(null);
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectPurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;

        let distributionItemControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        distributionItemControl.controls = [];
        distributionItemControl.controls.length = 0;
    }

    getProjectPOList(projectPoId: number) {
        let obj = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId
        };
        this.projectPurchaseOrderServiceObj.getProjectPurchaseOrders(obj).subscribe((data: ProjectPurchaseOrderDisplayResult) => {
            if (data != null) {
                this.projectPoList = data.ProjectPurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (projectPoId > 0) {
                    this.onRecordSelection(projectPoId);
                }
                else {
                    this.onRecordSelection(this.projectPoList[0].ProjectPurchaseOrderId);
                }
            }
        });
    }

    searchProjectPurchaseOrders(projectContractVariationOrderId: number = 0, isNotification: boolean = false, filterData?: ProjectContractVariationOrderFilterModel) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let input = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            IsApprovalPage: this.isApprovalPage,//if it is approval page..
            Search: this.requestSearchKey,
            ProjectContractVariationOrderId: isNotification == true ? projectContractVariationOrderId : 0,
            UserId: userDetails.UserID,
            CompanyId: this.isApprovalPage == true ? 0 : this.sessionService.getCompanyId()
        };

        if (filterData != null && filterData != undefined) {
            input["DocumentCode"] = (filterData.DocumentCode == null || filterData.DocumentCode == undefined) ? "" : filterData.DocumentCode;
            // input["SupplierName"] = poFilterData.SupplierName;
            input["WorkFlowStatusId"] = (filterData.WorkFlowStatusId == null || filterData.WorkFlowStatusId == undefined) ? "" : filterData.WorkFlowStatusId;
            input["ProjectName"] = (filterData.ProjectName == null || filterData.ProjectName == undefined) ? "" : filterData.ProjectName;

        }
        this.showLeftPanelLoadingIcon = true;
        this.projectPurchaseOrderServiceObj.getAllSearchProjectPurchaseOrders(input)
            .subscribe((data: ProjectPurchaseOrderDisplayResult) => {
                this.showLeftPanelLoadingIcon = false;
                this.projectPoList = data.ProjectPurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (this.projectPoList.length > 0) {
                    this.onRecordSelection(this.projectPoList[0].ProjectPurchaseOrderId);
                    this.isExisted = true;
                }
                else {
                    this.projectPurchaseOrderForm.reset();
                    this.selectedPODetails = new ProjectPurchaseOrder();
                    this.selectedPODetails.ProjectPurchaseOrderItems = [];
                    this.projectPoList = [];
                    this.isExisted = false;
                }
            }, () => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    showFullScreen() {
  this.innerWidth = window.innerWidth;  
 if(this.innerWidth > 1000){  
  FullScreen(this.rightPanelRef.nativeElement);
 }
    }

    projectContractMasterInputFormater = (x: ProjectMasterContract) => x.ProjectName;
    projectContractMasterSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.clearForm();
                    this.selectedPODetails = new ProjectPurchaseOrder();
                    this.selectedPODetails.ProjectPurchaseOrderId = 0;

                    return of([]);
                }
                return this.projectContractMasterServiceObj.getAllSearchMasterContracts({
                    Search: term,
                    CompanyId: this.sessionService.getCompanyId(),
                    WorkFlowStatusId: WorkFlowStatus.Approved
                }).map((data: Array<any>) => {
                    data.forEach((item, index) => {
                        item.index = index;
                    });
                    return data;
                }).pipe(
                    catchError((data) => {
                        return of([]);
                    }))
            })
        );

    projectMasterContractChange(selecteMasterContract: ProjectMasterContract) {
        this.projectContractMasterServiceObj.getProjectMasterContractDetails(selecteMasterContract.ProjectMasterContractId)
            .subscribe((data: ProjectMasterContract) => {
                this.selectedProjectMasterContract = data;
                this.popApportionments = data.POPApportionment;
                this.popCostCategories = data.POPCostCategory;
                this.clearForm();
                this.addGridItem(data.ProjectMasterContractItems.length);
                if (data.POPDistributionSummaryItems != undefined) {                   
                    this.addDistributionGridItem(data.POPDistributionSummaryItems.length);
                }
                let contractSubTotal = 0;
                let prevAccSubTotal = 0;
                let currentPaymentSubTotal = 0;
                let accumulatedSubTotal = 0;
                let distributionPercentageTotal = 0;
                let contractAmountTotal = 0;
                let certificationTotal = 0;
                let retentionTotal = 0;

                data.ProjectMasterContractItems.forEach(record => {
                    contractSubTotal = contractSubTotal + record.ContractValue;
                    //prevAccSubTotal = prevAccSubTotal + record.PrevAccumulatedAmount;
                    currentPaymentSubTotal = prevAccSubTotal + record.CurrentPayment;
                    accumulatedSubTotal = accumulatedSubTotal + record.AccumulatedPayment;
                });

                data.POPDistributionSummaryItems.forEach(record => {
                    distributionPercentageTotal = distributionPercentageTotal + record.DistributionPercentage;
                    contractAmountTotal = contractAmountTotal + record.ContractAmount;
                });

                this.projectPurchaseOrderForm.patchValue({
                    ProjectName: data.ProjectName,
                    ContractStartDate: data.ContractStartDate,
                    ContractEndDate: data.ContractEndDate,
                    OriginalContractSum: data.OriginalContractSum,
                    ProjectPurchaseOrderItems: data.ProjectMasterContractItems,
                    Supplier: data.Supplier,
                    ContractValueSubTotal: contractSubTotal,
                    //PrevAccumulatedPaymentSubTotal: prevAccSubTotal,
                    PrevAccumulatedPaymentSubTotal: 0,
                    CurrentPaymentSubTotal: currentPaymentSubTotal,
                    AccumulatedSubTotal: accumulatedSubTotal,
                    ContractValueTotal: contractSubTotal,
                    PrevAccumulatedPaymentTotal: prevAccSubTotal,
                    CurrentPaymentTotal: currentPaymentSubTotal,
                    AccumulatedTotal: accumulatedSubTotal,
                    POPMasterCode: data.POPMasterCode,
                    ProjectMasterContractId: selecteMasterContract.ProjectMasterContractId,
                    ContractAmountTotal: contractAmountTotal,
                    DistributionPercentageTotal: distributionPercentageTotal,
                    CertificationTotal: certificationTotal,
                    RetentionTotal: retentionTotal,
                    POPDistributionSummaryItems: data.POPDistributionSummaryItems,
                    CertificateNumber: data.CertificateNumber,
                    PreviousCommercialDiscount: data.CertificateNumber === 1 ? 0 : data.PreviousCommercialDiscount,
                    NoRetentiontionPercentage: 0,
                    RetionSumCaluculated: data.CertificateNumber === 1 ? 0 : data.RetionSumCaluculated,
                    PreviousRetentionAccumulatedSum: data.CertificateNumber === 1 ? 0 : data.PreviousRetentionAccumulatedSum,
                    NetRetention: data.CertificateNumber === 1 ? 0 : data.NetRetention,
                    RetentionSumForThismonth: data.CertificateNumber === 1 ? 0 : data.RetentionSumForThismonth,
                    PreviousCertifiedContractSum: data.CertificateNumber === 1 ? 0 : data.PreviousCertifiedContractSum,
                    PreviousCertifiedGST: data.CertificateNumber === 1 ? 0 : data.PreviousCertifiedGST,
                    PreviousCertifiedGSTAdjustment: data.CertificateNumber === 1 ? 0 : data.PreviousCertifiedGSTAdjustment,
                    PaymentTotal: data.CertificateNumber === 1 ? 0 : data.PaymentTotal,
                    CurrentCertificationAmount: data.CertificateNumber === 1 ? 0 : data.CurrentCertificationAmount,
                    CertifiedTotalGST: 0,                  
                    CertifiedTotalGSTAdjustment:0,
                    PreviousMonthReleaseRetentionSum: data.CertificateNumber === 1 ? 0 : data.PreviousMonthReleaseRetentionSum,
                    CurrentNettRetention: data.CertificateNumber === 1 ? 0 : data.CurrentNettRetention
                });

                this.formContentLength = data.ProjectMasterContractItems.length;
                this.projectPurchaseOrderForm.get('CertificateNumber').disable();
            });

    }

    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectPurchaseOrderItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
        }
    }

    //adding row to the grid..
    addDistributionGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initDistributionGridRows());
        }
    }

    split() {
        this.leftSection = !this.leftSection;
        this.rightSection = !this.rightSection;
    }

    customSort(event: any) {

    }

    onSearchInputChange(event: any) {

    }

    initGridRows() {
        return this.formbuilderObj.group({
            ProjectPurchaseOrderItemId: [0],
            ProjectMasterContractItemId: [0],
            TypeOfCost: [0],
            ApportionmentId: [""],
            ContractValue: [0],
            PrevAccumulatedAmount: [0],
            CurrentPayment: [0],
            AccumulatedPayment: [0],
            OverallStatus: [0],
            AccountCodeName: [""],
            AccountCode: [""],
            ItemDescription: [""]
        });
    }

    initDistributionGridRows() {
        return this.formbuilderObj.group({
            DisturbutionSummaryId: [0],
            Company: [null],
            DistributionPercentage: [0],
            ContractAmount: [0],
            ThisCertification: [0],
            RetentionAmount: [0]
        });
    }

    restrictMinusValue(e: any) {
        restrictMinus(e);
    }

    onCurrentReleaseReturnSumKeyUp(event: any) {
        let RetentionSumForThismonth = event.target.value;
        let calculatedRetentionSum1 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum1").value;
        let calculatedRetentionSum2 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum2").value;
        let previousRetentionAccumulatedSum = this.projectPurchaseOrderForm.get("PreviousRetentionAccumulatedSum").value;
        let previousMonthReleaseRetentionSum = this.projectPurchaseOrderForm.get("PreviousMonthReleaseRetentionSum").value;
        let accumulatedTotal = this.projectPurchaseOrderForm.get("AccumulatedTotal").value;
        let retentionSum = (calculatedRetentionSum1 + calculatedRetentionSum2) - (Number(previousRetentionAccumulatedSum) + Number(previousMonthReleaseRetentionSum)) + Number(RetentionSumForThismonth);
        //this.projectPurchaseOrderForm.get('NetRetention').setValue(retentionSum);
        let previousCertifiedContractSum = this.projectPurchaseOrderForm.get("PreviousCertifiedContractSum").value;
        this.projectPurchaseOrderForm.get('PaymentTotal').setValue(accumulatedTotal - (retentionSum - previousCertifiedContractSum));
        this.projectPurchaseOrderForm.get('CurrentCertificationAmount').setValue(accumulatedTotal - (retentionSum - previousCertifiedContractSum));
        this.projectPurchaseOrderForm.get('CurrentNettRetention').setValue(retentionSum);
        this.updateDistributionSummary(accumulatedTotal - (retentionSum - previousCertifiedContractSum));
    }

    updateDistributionSummary(currentDue: number) {
        //updating distribution summary
        let distributionGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        if (distributionGroupControl != undefined) {
            let certificationTotal = 0;
            distributionGroupControl.controls.forEach(data => {              
                let percentage = data.get('DistributionPercentage').value;
                let certificationAmount = (currentDue * percentage / 100);
                certificationTotal = certificationTotal + certificationAmount;
                data.get('ThisCertification').setValue(certificationAmount);
            });

            this.projectPurchaseOrderForm.get("CertificationTotal").setValue(certificationTotal);

        }
    }

    onCertifiedTotalGSTKeyUp(event: any) {
        let GST = event.target.value;
        let currentDue = this.projectPurchaseOrderForm.get("CurrentCertificationAmount").value;
        this.projectPurchaseOrderForm.get('PaymentTotal').setValue(currentDue + Number(GST));
        //updating distribution summary
        this.updateDistributionSummary(currentDue);
    }

    onDiscountKeyUp(event: any) {       
        let discount = event.target.value;
        this.projectPurchaseOrderForm.get('CommercialDiscount').setValue(discount);
        this.calculatedTotal();
    }

    onGSTKeyUp(event: any) {        
        let gst = event.target.value;
        this.projectPurchaseOrderForm.get("GST").setValue(gst);
        let contractValueTotal = this.projectPurchaseOrderForm.get("ContractValueTotal").value;
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectPurchaseOrderItems'];
        let totalValue = 0;
        itemGroupControl.controls.forEach((data) => {
            totalValue = totalValue + data.get("ContractValue").value;
        });

        let total = Number(totalValue) + Number(gst);
        this.projectPurchaseOrderForm.get("ContractValueTotal").setValue(total);
    }

    onPaymentKeyUp(event: any) {
        this.calculatedTotal();
    }

    onRetentionPercentage1KeyUp(event: any) {
        let retentionpercentage = event.target.value;
        let retentionAmount = this.projectPurchaseOrderForm.get("SubjectToRetentionAmountA1").value;
        if (retentionAmount > 0) {
            let CalculatedRetentionSum = retentionAmount * retentionpercentage / 100;
            this.projectPurchaseOrderForm.get("CalculatedRetentionSum1").setValue(CalculatedRetentionSum);
        }
    }

    onRetentionPercentage2KeyUp(event: any) {
        let retentionpercentage = event.target.value;
        let retentionAmount = this.projectPurchaseOrderForm.get("SubjectToRetentionAmountA2").value;
        if (retentionAmount > 0) {
            let CalculatedRetentionSum = retentionAmount * retentionpercentage / 100;
            this.projectPurchaseOrderForm.get("CalculatedRetentionSum2").setValue(CalculatedRetentionSum);
        }
    }

    onRetentionAmount1KeyUp(event: any) {      
        let retentionAmount = event.target.value;
        let retentionpercentage = this.projectPurchaseOrderForm.get("SubjectToRetentionPercentageA1").value;
        if (retentionpercentage > 0) {
            let CalculatedRetentionSum = retentionAmount * retentionpercentage / 100;
            this.projectPurchaseOrderForm.get("CalculatedRetentionSum1").setValue(CalculatedRetentionSum);
        }

        if (Number(retentionAmount) > this.selectedProjectMasterContract.RetentionMaxLimit) {
            this.projectPurchaseOrderForm.get('SubjectToRetentionAmountA1').setErrors({ 'maxRetentionLimitError1': true });
        }
        else {
            this.projectPurchaseOrderForm.get('SubjectToRetentionAmountA1').setErrors({ 'maxRetentionLimitError1': false });
            this.projectPurchaseOrderForm.get('SubjectToRetentionAmountA1').setErrors(null);
        }

        let retentionAmount2 = this.projectPurchaseOrderForm.get("SubjectToRetentionAmountA2").value;
        let noRetentionAmount = this.projectPurchaseOrderForm.get("NoRetentiontionAmount").value;

        let calculatedRetentionSum1 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum1").value;
        let calculatedRetentionSum2 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum2").value;

        let totalCalculatedRetentionSum = Number(calculatedRetentionSum1) + Number(calculatedRetentionSum2);

        let total = Number(retentionAmount) + Number(retentionAmount2) + Number(noRetentionAmount);
        this.projectPurchaseOrderForm.get("CurrentPaymmentSummaryTotal").setValue(total);

        if (total != Number(this.projectPurchaseOrderForm.get('AccumulatedTotal').value)) {
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors({ 'paymentSummaryTotalError': true });
        }
        else {
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors({ 'paymentSummaryTotalError': false });
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors(null);
        }



        this.projectPurchaseOrderForm.get("CurrentCertificationAmount").setValue(total - totalCalculatedRetentionSum);
        this.projectPurchaseOrderForm.get("PaymentTotal").setValue(total - totalCalculatedRetentionSum);
    }

    onRetentionAmount2KeyUp(event: any) {
        let retentionAmount = event.target.value;
        let retentionpercentage = this.projectPurchaseOrderForm.get("SubjectToRetentionPercentageA2").value;
        if (retentionpercentage > 0) {
            let CalculatedRetentionSum = retentionAmount * retentionpercentage / 100;
            this.projectPurchaseOrderForm.get("CalculatedRetentionSum2").setValue(CalculatedRetentionSum);
        }

        if (Number(retentionAmount) > this.selectedProjectMasterContract.RetentionMaxLimit) {
            this.projectPurchaseOrderForm.get('SubjectToRetentionAmountA2').setErrors({ 'maxRetentionLimitError2': true });
        }
        else {
            this.projectPurchaseOrderForm.get('SubjectToRetentionAmountA2').setErrors({ 'maxRetentionLimitError2': false });
            this.projectPurchaseOrderForm.get('SubjectToRetentionAmountA2').setErrors(null);
        }

        let retentionAmount1 = this.projectPurchaseOrderForm.get("SubjectToRetentionAmountA1").value;
        let noRetentionAmount = this.projectPurchaseOrderForm.get("NoRetentiontionAmount").value;
        let total = Number(retentionAmount) + Number(retentionAmount1) + Number(noRetentionAmount);

        let calculatedRetentionSum1 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum1").value;
        let calculatedRetentionSum2 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum2").value;

        let totalCalculatedRetentionSum = Number(calculatedRetentionSum1) + Number(calculatedRetentionSum2);

        this.projectPurchaseOrderForm.get("CurrentPaymmentSummaryTotal").setValue(total);

        if (total != Number(this.projectPurchaseOrderForm.get('AccumulatedTotal').value)) {
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors({ 'paymentSummaryTotalError': true });
        }
        else {
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors({ 'paymentSummaryTotalError': false });
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors(null);
        }

        this.projectPurchaseOrderForm.get("CurrentCertificationAmount").setValue(total - totalCalculatedRetentionSum);
        this.projectPurchaseOrderForm.get("PaymentTotal").setValue(total - totalCalculatedRetentionSum);
    }

    onNoRetentionAmountKeyUp(event: any) {
        let retentionAmount = event.target.value;
        let retentionAmount1 = this.projectPurchaseOrderForm.get("SubjectToRetentionAmountA1").value;
        let retentionAmount2 = this.projectPurchaseOrderForm.get("SubjectToRetentionAmountA2").value;

        let calculatedRetentionSum1 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum1").value;
        let calculatedRetentionSum2 = this.projectPurchaseOrderForm.get("CalculatedRetentionSum2").value;

        let totalCalculatedRetentionSum = Number(calculatedRetentionSum1) + Number(calculatedRetentionSum2);

        let total = Number(retentionAmount) + Number(retentionAmount1) + Number(retentionAmount2);
        this.projectPurchaseOrderForm.get("CurrentPaymmentSummaryTotal").setValue(total);

        if (total != Number(this.projectPurchaseOrderForm.get('AccumulatedTotal').value)) {
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors({ 'paymentSummaryTotalError': true });
        }
        else {
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors({ 'paymentSummaryTotalError': false });
            this.projectPurchaseOrderForm.get('CurrentPaymmentSummaryTotal').setErrors(null);
        }

        this.projectPurchaseOrderForm.get("CurrentCertificationAmount").setValue(total - totalCalculatedRetentionSum);
        this.projectPurchaseOrderForm.get("PaymentTotal").setValue(total - totalCalculatedRetentionSum);

    }

    companyInputFormater = (x: Companies) => x.CompanyName;

    calculatedTotal() {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectPurchaseOrderItems'];
        let totalCurrentPayment = 0;
        let totalAccumulatedSubTotal = 0;
        itemGroupControl.controls.forEach((data) => {
            let prevAccumulatedAmount = data.get("PrevAccumulatedAmount").value;
            let accumulatedTotal = data.get("AccumulatedPayment").value;
            totalCurrentPayment += accumulatedTotal - prevAccumulatedAmount;
            totalAccumulatedSubTotal += accumulatedTotal;
        });
        let discount = this.projectPurchaseOrderForm.get('CommercialDiscount').value;
        this.projectPurchaseOrderForm.get('CurrentPaymentSubTotal').setValue(totalCurrentPayment);
        this.projectPurchaseOrderForm.get('CurrentPaymentTotal').setValue(totalCurrentPayment);
        this.projectPurchaseOrderForm.get('AccumulatedSubTotal').setValue(totalAccumulatedSubTotal);
        this.projectPurchaseOrderForm.get('AccumulatedTotal').setValue(totalAccumulatedSubTotal - discount);
    }
    /**
 * to show the purchase order details in edit mode....
 */
    editRecord() {
        //setting this variable to false so as to show the category details in edit mod
        this.hideText = false;
        this.hideInput = true;
        this.linesToAdd = 2;
        //resetting the form....
        this.clearForm();
        this.formContentLength = this.selectedPODetails.ProjectPurchaseOrderItems.length;
        this.addGridItem(this.selectedPODetails.ProjectPurchaseOrderItems.length);
        this.projectPurchaseOrderForm.patchValue(this.selectedPODetails);
        this.projectPurchaseOrderForm.patchValue({
            // SupplierInvoiceDate: new Date(this.selectedPODetails.SupplierInvoiceDate),
            DateOfValuation: new Date(this.selectedPODetails.DateOfValuation),
            DateOfCertification: new Date(this.selectedPODetails.DateOfCertification),
            JobCompletionDate: new Date(this.selectedPODetails.JobCompletionDate),
            CommercialDiscount: this.selectedPODetails.CommercialDiscount
        });
        this.commercialDiscount = this.selectedPODetails.CommercialDiscount;
        this.showFullScreen();
    }

    saveRecord(action: string) {      
        //getting the purchase order form details...
        let userDetails = <UserDetails>this.sessionService.getUser();
        let projectMasterContractDetails: ProjectPurchaseOrder = this.projectPurchaseOrderForm.value;
        if (action == 'send' && this.hideText == true && this.selectedPODetails.ProjectPurchaseOrderId > 0) {
            let workFlowDetails: WorkFlowParameter =
                {
                    ProcessId: WorkFlowProcess.ProjectMasterContract,
                    CompanyId: this.selectedPODetails.CompanyId,
                    LocationId: 0,
                    FieldName: "",
                    Value: 0,
                    DocumentId: this.selectedPODetails.ProjectMasterContractId,
                    CreatedBy: this.selectedPODetails.CreatedBy,
                    WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                    DocumentCode: this.selectedPODetails.PoCode
                };
            this.sharedServiceObj.sendForApproval(workFlowDetails)
                .subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SentForApproval,
                        MessageType: MessageTypes.Success
                    });
                    //this.getProjectPOList(workFlowDetails.DocumentId);
                });
            return;
        }
        let formStatus = this.projectPurchaseOrderForm.status;
        if (formStatus != "INVALID") {
            projectMasterContractDetails.CreatedBy = userDetails.UserID;
            projectMasterContractDetails.WorkFlowStatusId = (action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval);
            // projectMasterContractDetails.SupplierInvoiceDate = this.reqDateFormatPipe.transform(projectMasterContractDetails.SupplierInvoiceDate);
            projectMasterContractDetails.DateOfValuation = this.reqDateFormatPipe.transform(projectMasterContractDetails.DateOfValuation);
            projectMasterContractDetails.DateOfCertification = this.reqDateFormatPipe.transform(projectMasterContractDetails.DateOfCertification);
            projectMasterContractDetails.JobCompletionDate = this.reqDateFormatPipe.transform(projectMasterContractDetails.JobCompletionDate);
            projectMasterContractDetails.CompanyId = this.sessionService.getCompanyId();
            projectMasterContractDetails.TaxId = 0;
            projectMasterContractDetails.CreatedDate = this.reqDateFormatPipe.transform(new Date());
            projectMasterContractDetails.SubjectToRetentionAmountA1 = 0;
            projectMasterContractDetails.SubjectToRetentionAmountA2 = 0;
            projectMasterContractDetails.SubjectToRetentionPercentageA1 = 0;
            projectMasterContractDetails.SubjectToRetentionPercentageA2 = 0;
            projectMasterContractDetails.NoRetentiontionAmount = 0;
            projectMasterContractDetails.RetentionSum = 0;
            //projectMasterContractDetails.RetentionSumForThismonth = 0;
            //projectMasterContractDetails.GrandTotal = 0;
            if (projectMasterContractDetails.ProjectPurchaseOrderId == 0 || projectMasterContractDetails.ProjectPurchaseOrderId == null) {
                projectMasterContractDetails.ProjectPurchaseOrderId = 0;

                this.projectPurchaseOrderServiceObj.createProjectPurchaseOrder(projectMasterContractDetails, this.uploadedFiles)

                projectMasterContractDetails.IsItemised = false;
            }

            if (projectMasterContractDetails.IsRetentionApplicable == null || projectMasterContractDetails.IsRetentionApplicable == undefined) {
                projectMasterContractDetails.IsRetentionApplicable = false;
            }

            if (projectMasterContractDetails.ProjectMasterContractId == 0 || projectMasterContractDetails.ProjectMasterContractId == null) {
                projectMasterContractDetails.ProjectMasterContractId = 0;
                this.projectContractMasterServiceObj.createProjectMasterContract(projectMasterContractDetails, this.uploadedFiles)

                    .subscribe((poId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.getProjectPOList(poId);
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                    });
            }
            else {
                this.projectPurchaseOrderServiceObj.updateProjectPurchaseOrder(projectMasterContractDetails, this.uploadedFiles)
                    .subscribe((poId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.getProjectPOList(projectMasterContractDetails.ProjectPurchaseOrderId);
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                    });
            }
        }
        else {
            Object.keys(this.projectPurchaseOrderForm.controls).forEach((key: string) => {
                if (this.projectPurchaseOrderForm.controls[key].status == "INVALID" && this.projectPurchaseOrderForm.controls[key].touched == false) {
                    this.projectPurchaseOrderForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectPurchaseOrderItems'];
            if (itemGroupControl != undefined) {
                itemGroupControl.controls.forEach(controlObj => {
                    Object.keys(controlObj["controls"]).forEach((key: string) => {
                        let itemGroupControl = controlObj.get(key);
                        if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                            itemGroupControl.markAsTouched();
                        }
                    });
                });
            }
        }
    }

    onRecordSelection(projectPurchaseOrderId: number) {
        this.selectedPOId = projectPurchaseOrderId;
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.projectPurchaseOrderServiceObj.getProjectPurchaseOrderDetails(projectPurchaseOrderId, userDetails.UserID)
            .subscribe((data: { ProjectPurchaseOrderDetails: ProjectPurchaseOrder, ProjectMasterContractDetails: ProjectMasterContract }) => {
                this.selectedPODetails = data.ProjectPurchaseOrderDetails;
                if (data.ProjectMasterContractDetails != null) {
                    this.popApportionments = data.ProjectMasterContractDetails.POPApportionment;
                    this.popCostCategories = data.ProjectMasterContractDetails.POPCostCategory;
                }
                this.clearForm();
                this.formContentLength = this.selectedPODetails.ProjectPurchaseOrderItems.length;
            });
    }

    pageChange(statusId: number, currentPageNumber: any) {
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            let filterData: ProjectContractVariationOrderFilterModel = this.poFilterInfoForm.value;
            if ((this.requestSearchKey != "" && this.requestSearchKey != null) ||
                (filterData.DocumentCode != "" || filterData.WorkFlowStatusId > 0
                    || (filterData.ProjectName != ""))
            ) {
                this.searchProjectPurchaseOrders(0, false, filterData);
            }
            else {
                this.getProjectPOList(0);
            }
        }

        // let remarks = "";
        // let successMessage = "";
        // let formRemarks = this.projectPurchaseOrderForm.get('ApprovalRemarks').value;
        // if (currentPageNumber != null && currentPageNumber != undefined) {
        //     this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        //     let filterData: ProjectContractMasterFilterModel = this.poFilterInfoForm.value;
        //     if ((this.requestSearchKey != "" && this.requestSearchKey != null) ||
        //         (filterData.DocumentCode != "" || filterData.WorkFlowStatusId > 0
        //             || (filterData.FromDate != null && filterData.ToDate != null))
        //     ) {
        // this.searchProjectMasterContract(0,false, filterData);
        //     }
        //     else {
        //         this.getProjectPOList(0);
        //         remarks = "Rejected";
        //     }

        //     successMessage = Messages.Rejected;
        // }
        // else {
        //     remarks = formRemarks;
        //     successMessage = Messages.SentForClarification;
        // }
        // let userDetails = <UserDetails>this.sessionService.getUser();
        // let workFlowStatus: WorkFlowApproval = {
        //     DocumentId: this.selectedPODetails.ProjectMasterContractId,
        //     UserId: userDetails.UserID,
        //     WorkFlowStatusId: statusId,
        //     Remarks: remarks,
        //     RequestUserId: this.selectedPODetails.CreatedBy,
        //     DocumentCode: this.selectedPODetails.POPMasterCode,
        //     ProcessId: WorkFlowProcess.ProjectMasterContract,
        //     CompanyId: this.sessionService.getCompanyId(),
        //     ApproverUserId: 0,
        //     IsReApproval: false
        // };
        // if (this.isApprovalPage == true)//if it is workflow approval page...
        // {
        //     this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
        //         .subscribe((data) => {
        //             this.projectPurchaseOrderForm.get('ApprovalRemarks').setValue("");
        //             this.sharedServiceObj.showMessage({
        //                 ShowMessage: true,
        //                 Message: successMessage,
        //                 MessageType: MessageTypes.Success
        //             });
        //             this.requestSearchKey = "";
        //             this.getProjectMasterContractsForApproval((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
        //         });
        // }
        // else {
        //     workFlowStatus.ApproverUserId = this.selectedPODetails.CurrentApproverUserId
        //     this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
        //         .subscribe((data) => {
        //             this.projectPurchaseOrderForm.get('ApprovalRemarks').setValue("");
        //             this.sharedServiceObj.showMessage({
        //                 ShowMessage: true,
        //                 Message: successMessage,
        //                 MessageType: MessageTypes.Success
        //             });
        //             this.requestSearchKey = "";
        //             this.getProjectPOList(workFlowStatus.DocumentId);
        //         });
        // }
    }

    validateDates(from: string) {
        let startDateControl = this.projectPurchaseOrderForm.get('ContractStartDate');
        let endDateControl = this.projectPurchaseOrderForm.get('ContractEndDate');
        let startDate = <Date>startDateControl.value;
        let endDate = <Date>endDateControl.value;
        if (from == "start") {
            if (endDate != null && startDate >= endDate) {
                startDateControl.setErrors({
                    'invalid_date': true
                });
                startDateControl.markAsTouched();
                return;
            }
        }
        else if (from == "end") {
            if (startDate != null && startDate >= endDate) {
                endDateControl.setErrors({
                    'invalid_date': true
                });
                endDateControl.markAsTouched();
                return;

            }
        }
    }

    openDialog() {
        this.showFilterPopUp = true;
        if (this.docCodeRef != undefined) {
            this.docCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.docCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    getProjectMasterContractsForApproval(projectMasterContractId: number) {


    }
}


