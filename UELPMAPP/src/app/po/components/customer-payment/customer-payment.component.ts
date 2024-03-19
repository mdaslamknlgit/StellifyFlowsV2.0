import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { CustomerInvoiceDetails, CustomerPayment, CustomerPaymentDisplayResult, CustomerPaymentList, CustomerInvoiceTotal } from "../../models/customer-payment.model";
import { CustomerPaymentAPIService } from "../../services/customer-payment.service";
import { SharedService } from "../../../shared/services/shared.service";
import { STRING_PATERN, ALPHA_NUMERIC, NUMBER_PATERN, EMAIL_PATTERN, MOBILE_NUMBER_PATTERN } from '../../../shared/constants/generic';
import { PagerConfig, MessageTypes, PaymentType, UserDetails, ResponseStatusTypes, Messages } from "../../../shared/models/shared.model";
import { Customer } from "../../../administration/models/customer";
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen, restrictMinus } from "../../../shared/shared";
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
    selector: 'app-customer-payment',
    templateUrl: './customer-payment.component.html',
    styleUrls: ['./customer-payment.component.css'],
    providers: [CustomerPaymentAPIService]
})
export class CustomerPaymentComponent implements OnInit {
    leftSection: boolean = false;
    rightSection: boolean = false;
    scrollbarOptions: any;
    customerPaymentList: Array<CustomerPaymentList> = [];
    customerInvoiceDetails: Array<CustomerInvoiceDetails> = [];
    customerInvoiceTotal: CustomerInvoiceTotal;
    selectedCustomerPaymentDetails: CustomerPayment;
    customerPaymentsPagerConfig: PagerConfig;
    customerPaymentForm: FormGroup;
    customers: Customer[] = [];
    customerPaymentId: number = 0;
    slideActive: boolean = false;
    customerPaymentSearchKey: string;
    showGridErrorMessage: boolean = false;
    addTotalOutStanding: number;
    customerId: number;
    totalPayment: Number;
    customerEmail: string;
    deletedCustomerPaymentItems: Array<number> = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    hideText?: boolean = false;
    hideInput?: boolean = null;
    hideCardDetails?: boolean = null;
    hideCheque?: boolean = null;
    PaymentTypeId: number;
    customerPaymentFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    isFilterApplied: boolean = false;
    checkedValue: boolean = false;
    check: boolean = false;
    initDone = false;
    filteredCustomerPayments = [];
    remainingAmount: number;
    totalAmount: number;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('customerPaymentCode') private customerPaymentRef: any;
    checked: boolean;
    formSubmitAttempt: boolean = false;
    paymentDetails: CustomerPayment;
    paymentTypes: PaymentType[] = [];
    gridColumns: Array<{ field: string, header: string }> = [];
    errorMessage: string = Messages.NoRecordsToDisplay;
    companyId: number = 0;
    showGridErrorMessage1: boolean = false;
    showGridErrorMessage2: boolean = false;
    showGridErrorMessage3: boolean = false;
    showGridErrorMessage6: boolean = false;
    noRecord: boolean = false;
    public innerWidth: any;
    constructor(private customerAPIService: CustomerPaymentAPIService,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private renderer: Renderer,
        public sessionService: SessionStorageService) {
        this.companyId = this.sessionService.getCompanyId();
    }

    ngOnInit() {
        this.hideCardDetails = false;
        this.hideCheque = false;
        this.gridColumns = [
            { field: '', header: '' },
            { field: 'InvoiceDate', header: 'Invoice Date' },
            { field: 'InvoiceNo', header: 'Invoice No' },
            { field: 'TicketNo', header: 'Ticket No' },
            { field: 'InvoiceAmount', header: 'Invoice Amount' },
            { field: 'OutStandingAmount', header: 'OutStanding Amount' },
            { field: 'PaymentAmount', header: 'Payment Amount' }
        ];

        this.customerPaymentFilterInfoForm = this.formBuilderObj.group({
            CustomerPaymentCode: [''],
            Customer: [''],
            InvoiceNo: ['']
        });

        this.customerPaymentsPagerConfig = new PagerConfig();
        this.customerPaymentsPagerConfig.RecordsToSkip = 0;
        this.customerPaymentsPagerConfig.RecordsToFetch = 100;

        this.selectedCustomerPaymentDetails = new CustomerPayment();
        this.customerPaymentForm = this.formBuilderObj.group({
            'Customer': [null, { validators: [Validators.required] }],
            'TotalAmountPaid': [0, [Validators.required]],
            'Remarks': [""],
            'CustomerEmail': [""],
            'PaymentTypeId': [null, [Validators.required]],
            'PaymentAmount': 0,
            'Checked': 0,
            'ChequeNumber': ["", { validators: [Validators.required, Validators.maxLength(20)] }],
            'ChequeDate': [new Date(), [Validators.required]],
            'CreditCardNo': ["", { validators: [Validators.pattern(NUMBER_PATERN), Validators.required, Validators.maxLength(16)] }],
            'ExpiryMonth': ["", { validators: [Validators.pattern(NUMBER_PATERN), Validators.required, Validators.maxLength(2)] }],
            'ExpiryYear': ["", { validators: [Validators.pattern(NUMBER_PATERN), Validators.required, Validators.maxLength(4)] }],
            'TotalOustanding': "",
            'CustomerInvoiceDetails': this.formBuilderObj.array([])
        });

        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                this.GetCustomerPayment(0);
            });

        this.paymentDetails = new CustomerPayment();
        this.sharedServiceObj.getPaymentType()
            .subscribe((data: PaymentType[]) => {
                this.paymentTypes = data;
            });

        this.GetCustomerPayment(0);
    }

    //this method is used to format the content to be display in the autocomplete textbox after selection.. 
    customerInputFormater = (x: Customer) => x.CustomerName;

    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...   
    customerSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getAllSearchCustomers({
                    searchKey: term,
                    customerCategoryId: 0,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }

    paymentTypeSelection(item) {
        this.customerPaymentForm.get('ChequeNumber').setValue('I0');
        this.customerPaymentForm.get('ChequeDate').setValue(new Date());
        this.customerPaymentForm.get('CreditCardNo').setValue(0);
        this.customerPaymentForm.get('ExpiryMonth').setValue(0);
        this.customerPaymentForm.get('ExpiryYear').setValue(0);
        if (item == 2) {
            this.PaymentTypeId = item;
            this.customerPaymentForm.get('ChequeNumber').setValue('', { Validators: [Validators.required] });
            this.customerPaymentForm.get('ChequeDate').setValue(new Date(), { Validators: [Validators.required] });
            this.hideCardDetails = false;
            this.hideCheque = true;
        }
        else if (item == 3) {
            this.PaymentTypeId = item;
            this.customerPaymentForm.get('CreditCardNo').setValue('', [Validators.required, Validators.maxLength(16)]);
            this.customerPaymentForm.get('ExpiryMonth').setValue('', [Validators.required, Validators.maxLength(2)]);
            this.customerPaymentForm.get('ExpiryYear').setValue('', [Validators.required, Validators.maxLength(4)]);
            this.hideCheque = false;
            this.hideCardDetails = true;

        }
        else if (item == 1 || item == 4) {
            this.PaymentTypeId = item;
            this.hideCardDetails = false;
            this.hideCheque = false;
        }
    }

    GetCustomerPayment(customerPaymentIdToBeSelected: number) {
        let customerPaymentDisplayInput = {
            Skip: 0,
            Take: this.customerPaymentsPagerConfig.RecordsToFetch,
            companyId: this.companyId
        };

        this.customerAPIService.getCustomerPayments(customerPaymentDisplayInput)
            .subscribe((data: CustomerPaymentDisplayResult) => {              
                this.customerPaymentList = data.CustomerPayment;
                this.customerPaymentsPagerConfig.TotalRecords = data.TotalRecords;

                if (this.customerPaymentList.length > 0) {
                    this.noRecord = false;
                    if (customerPaymentIdToBeSelected == 0) {                       
                        this.onRecordSelection(this.customerPaymentList[0].CustomerPaymentId);

                    }
                    else {
                        this.onRecordSelection(customerPaymentIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                    this.noRecord = true;
                }
            }, (error) => {

                this.hideText = false;
                this.hideInput = true;
            });
    }

    onRecordSelection(customerPaymentId: number) {
        let add: number = 0; this.showGridErrorMessage6 = false;
        this.customerAPIService.getCustomerPaymentDetails(customerPaymentId)
            .subscribe((data: CustomerPayment) => {              
                this.selectedCustomerPaymentDetails = data;
                this.customerPaymentId = this.selectedCustomerPaymentDetails.CustomerPaymentId;
                //this.operation = GridOperations.Display;    
                if (data.PaymentTypeId != null) {
                    this.paymentTypeSelection(data.PaymentTypeId);
                }
                this.customerPaymentForm.patchValue(data);
                this.hideText = true;
                this.hideInput = false;
                if (data.CustomerInvoiceDetails != null) {
                    for (let sp = 0; sp < data.CustomerInvoiceDetails.length; sp++) {
                        add += data.CustomerInvoiceDetails[sp].OutstandingAmount;
                    }
                    this.addTotalOutStanding = Number(add.toFixed(2));
                }
            });
    }

    addRecord() {
        this.hideText = false;
        this.hideInput = true;
        this.hideCardDetails = false;
        this.hideCheque = false;
        this.showGridErrorMessage6 = false;
        this.selectedCustomerPaymentDetails = new CustomerPayment();
        this.customerPaymentForm.reset();
        this.customerPaymentForm.setErrors(null);
        let itemGroupCustomerControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
        itemGroupCustomerControl.controls = [];
        itemGroupCustomerControl.controls.length = 0;
        this.addTotalOutStanding = 0;
        //this.showFullScreen();
    }
    editRecord() {      
        //setting this variable to false so as to show the category details in edit mode
        this.hideInput = true;
        this.hideText = false;
        this.customerPaymentForm.reset();
        this.customerPaymentForm.setErrors(null);
        let itemGroupCustomerControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];

        itemGroupCustomerControl.controls = [];
        itemGroupCustomerControl.controls.length = 0;
        if (this.selectedCustomerPaymentDetails.CustomerInvoiceDetails != undefined && this.selectedCustomerPaymentDetails.CustomerInvoiceDetails != null) {

            this.addGridItem(this.selectedCustomerPaymentDetails.CustomerInvoiceDetails.length);
        }
      
        this.customerPaymentForm.get('ChequeNumber').setValue('I0');
        this.customerPaymentForm.patchValue(this.selectedCustomerPaymentDetails);
        this.customerPaymentForm.get('ChequeDate').setValue(new Date(this.selectedCustomerPaymentDetails.ChequeDate));

        for (let i = 0; i < itemGroupCustomerControl.length; i++) {
            if (itemGroupCustomerControl.controls[i].get('PaymentAmount').value > 0) {
                itemGroupCustomerControl.controls[i].get('Checked').setValue(true);
            }
        }
        if (this.selectedCustomerPaymentDetails.Customer != undefined && this.selectedCustomerPaymentDetails.Customer != null) {
            this.customerPaymentForm.get('CustomerEmail').setValue(this.selectedCustomerPaymentDetails.Customer["CustomerEmail"]);


            this.customerAPIService.getCustomerPaymentsSummary(this.selectedCustomerPaymentDetails.CustomerPaymentId, this.selectedCustomerPaymentDetails.Customer["CustomerId"])
                .subscribe((data: CustomerPayment) => {

                    for (let s = 0; s < data.CustomerInvoiceTotal.length; s++) {
                        let aa = this.selectedCustomerPaymentDetails.CustomerInvoiceDetails.filter(i => i.SalesInvoiceId == data.CustomerInvoiceTotal[s].SalesInvoiceId);
                        for (let m = 0; m < this.selectedCustomerPaymentDetails.CustomerInvoiceDetails.length; m++) {
                            if (this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[m].CustomerInvoicePaymentId == aa[0].CustomerInvoicePaymentId) {
                                let sum = Number(aa[0].InvoiceAmount);
                                let d = sum - data.CustomerInvoiceTotal[s].Total;
                                this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[m].OutstandingAmount = d;
                            }
                        }
                    }

                    this.customerPaymentForm.controls['CustomerInvoiceDetails'].patchValue(this.selectedCustomerPaymentDetails.CustomerInvoiceDetails);
                    if (this.selectedCustomerPaymentDetails.CustomerInvoiceDetails != null) {
                        let tadd: number = 0;

                        for (let sp = 0; sp < this.selectedCustomerPaymentDetails.CustomerInvoiceDetails.length; sp++) {
                            tadd += this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[sp].OutstandingAmount;
                        }

                        this.addTotalOutStanding = Number(tadd.toFixed(2));
                    }
                });
        }
    }

    cancelRecord() {
        this.customerPaymentForm.reset();
        this.customerPaymentForm.setErrors(null);
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage = false;
        this.formSubmitAttempt = false;
        this.showGridErrorMessage2 = false;
        this.showGridErrorMessage3 = false;
        this.showGridErrorMessage6 = false;
        this.hideCardDetails = false;
        this.hideCheque = false;      
        if (this.customerPaymentList.length > 0 && this.selectedCustomerPaymentDetails != undefined) {
            if (this.selectedCustomerPaymentDetails.CustomerPaymentId == 0 || this.selectedCustomerPaymentDetails.CustomerPaymentId == undefined) {
                this.onRecordSelection(this.customerPaymentList[0].CustomerPaymentId);
            }
            else {
                this.onRecordSelection(this.selectedCustomerPaymentDetails.CustomerPaymentId);
            }

            this.hideInput = false;
            this.hideText = true;
        }
        else {          
            this.selectedCustomerPaymentDetails.CustomerInvoiceDetails = null;
            this.addTotalOutStanding = 0;
            this.hideInput = false;
            this.hideText = true;
        }

        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
    }

    deleteRecord() {     
        let recordId = this.selectedCustomerPaymentDetails.CustomerPaymentId;
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {              
                this.customerAPIService.deleteCustomerPayment(recordId).subscribe((data) => {                  
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });

                    this.GetCustomerPayment(0);
                });
            },
            reject: () => {
            }
        });
    }

    onCustomerChange(event) {     
        let tadd: number = 0;
        if (this.selectedCustomerPaymentDetails != null) {
            this.selectedCustomerPaymentDetails = new CustomerPayment();
        }

        this.customerId = event.item.CustomerId;
        this.customerAPIService.getCustomerInvoices(event.item.CustomerId)
            .subscribe((data: CustomerPayment) => {               
                this.selectedCustomerPaymentDetails = data;
                let itemGroupCustomerControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
                itemGroupCustomerControl.controls = [];
                itemGroupCustomerControl.controls.length = 0;
                this.addGridItem(this.selectedCustomerPaymentDetails.CustomerInvoiceDetails.length);
                if (data.CustomerInvoiceDetails != null) {
                    for (let sp = 0; sp < data.CustomerInvoiceDetails.length; sp++) {
                        tadd += data.CustomerInvoiceDetails[sp].OutstandingAmount;
                    }

                    this.addTotalOutStanding = Number(tadd.toFixed(2));
                }

                this.customerPaymentForm.patchValue({
                    CustomerEmail: event.item.CustomerEmail,
                    CustomerInvoiceDetails:
                        this.selectedCustomerPaymentDetails.CustomerInvoiceDetails
                });
            });
    }

    onSearchInputChange(event: any) {
        if (event.target.value != "") {
            this.getAllSearchCustomerPayments(event.target.value, 0);
        }
        else {
            this.GetCustomerPayment(0);
        }
    }

    getAllSearchCustomerPayments(searchKey: string, CustomerpaymentIdToBeSelected: number) {
        let customerPaymentDisplayInput = {
            Search: searchKey,
            Skip: this.customerPaymentsPagerConfig.RecordsToSkip,
            Take: this.customerPaymentsPagerConfig.RecordsToFetch,
            CompanyId: this.companyId
        };

        this.customerAPIService.getCustomerPayments(customerPaymentDisplayInput)
            .subscribe((data: CustomerPaymentDisplayResult) => {
                this.customerPaymentList = data.CustomerPayment;
                this.customerPaymentsPagerConfig.TotalRecords = data.TotalRecords;

                if (this.customerPaymentList.length > 0) {
                    if (CustomerpaymentIdToBeSelected == 0) {
                        this.onRecordSelection(this.customerPaymentList[0].CustomerPaymentId);
                    }
                    else {
                        this.onRecordSelection(CustomerpaymentIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {

                this.hideText = false;
                this.hideInput = true;
            });
    }

    openDialog() {
        this.initDone = true;
        if (this.customerPaymentRef != undefined) {
            this.customerPaymentRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.customerPaymentRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.customerPaymentFilterInfoForm.get('CustomerPaymentCode').setValue("");
        this.customerPaymentFilterInfoForm.get('Customer').setValue("");
        this.customerPaymentFilterInfoForm.get('InvoiceNo').setValue("");
        this.filterMessage = "";
        this.filteredCustomerPayments = this.customerPaymentList;
        if (this.filteredCustomerPayments.length > 0) {
            this.GetCustomerPayment(0);
        }

        this.isFilterApplied = false;
        if (this.customerPaymentRef != undefined) {
            this.customerPaymentRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.customerPaymentRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    openSettingsMenu() {
        this.initSettingsDone = true;
    }


    //to get list of sales orders..
    getAllFilteredCustomerPayments(searchKey: string, customerPaymentIdTobeSelected: number, cpCode: string = "", customerName: string = "", invoiceNo: string = "") {
        let customerPaymentDisplayInput = {
            Skip: this.customerPaymentsPagerConfig.RecordsToSkip,
            Take: this.customerPaymentsPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId,
            CustomerPaymentCode: cpCode,
            CustomerName: customerName,
            CustomerPaymentId: customerPaymentIdTobeSelected,
            SalesInvoiceCode: invoiceNo
        };

        //this.showLeftPanelLoadingIcon = true;
        this.customerAPIService.getAllFilteredCustomerPayments(customerPaymentDisplayInput)
            .subscribe((data: CustomerPaymentDisplayResult) => {              
                if (data != null) {
                    this.customerPaymentList = data.CustomerPayment;
                    this.isFilterApplied = true;
                    this.initDone = false;
                    this.customerPaymentsPagerConfig.TotalRecords = data.TotalRecords;
                    //this.showLeftPanelLoadingIcon = false;
                    if (this.customerPaymentList.length > 0) {
                        if (customerPaymentIdTobeSelected == 0) {
                            this.onRecordSelection(this.customerPaymentList[0].CustomerPaymentId);
                        }
                        else {
                            this.onRecordSelection(customerPaymentIdTobeSelected);
                        }
                    }
                    else {
                        this.addRecord();
                    }
                }
                else{
                    this.filterMessage = "No records are found";
                    this.initDone = true;
                    this.isFilterApplied = false;
                }

            }, (error) => {
                //this.showLeftPanelLoadingIcon = false;
            });
    }

    filterData() {
        let cpCode: string = "";
        let customer: Customer = new Customer();
        let invoiceno = "";
        this.filterMessage = "";

        if (this.customerPaymentFilterInfoForm.get('CustomerPaymentCode').value != "") {
            cpCode = this.customerPaymentFilterInfoForm.get('CustomerPaymentCode').value;
        }
        if (this.customerPaymentFilterInfoForm.get('Customer').value != "") {
            customer = this.customerPaymentFilterInfoForm.get('Customer').value;
        }
        if (this.customerPaymentFilterInfoForm.get('InvoiceNo').value != "") {
            invoiceno = this.customerPaymentFilterInfoForm.get('InvoiceNo').value;
        }

        if (cpCode === '' && (customer.CustomerName === '' || customer.CustomerName === undefined) && invoiceno === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
                this.initDone = true;
                this.isFilterApplied = false;
            }
            return;
        }

        if (this.customerPaymentSearchKey === null || this.customerPaymentSearchKey === "") {
            this.customerPaymentSearchKey = "";
        }

        this.isFilterApplied = true;
        this.initDone = false;
        this.getAllFilteredCustomerPayments(this.customerPaymentSearchKey, 0, cpCode, customer.CustomerName, invoiceno);
    }

    split() {
        this.leftSection = !this.leftSection;
        this.rightSection = !this.rightSection;
    }

    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
        }
    }

    initGridRows() {
        return this.formBuilderObj.group({
            'Checked': [false],
            'CustomerPaymentId': 0,
            'InvoiceDate': new Date(),
            'InvoiceNo': 0,
            'TicketNo': 0,
            'InvoiceAmount': 0,
            'OutstandingAmount': 0,
            'PaymentAmount': [0, [Validators.required]],
            'SalesInvoiceId': 0,
            'CustomerInvoicePaymentId': 0
        });
    }

    calculateOutstandingPayment(InvoiceAmount: number, outstandingAmt: number, rowIndex: number, gridRow: any) {
        let rowpayment: number = 0;
        let grnControl = gridRow.get('PaymentAmount');
        let itemGroupControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
        let paymentAmount = itemGroupControl.controls[rowIndex].get('PaymentAmount').value;
        if (paymentAmount <= outstandingAmt) {
            if (InvoiceAmount != 0) {
                if (paymentAmount >= 0) {
                    this.checkedValue = true;
                    for (let a = 0; a < itemGroupControl.length; a++) {
                        rowpayment += Number(itemGroupControl.controls[a].get('PaymentAmount').value);
                    }
                    if (paymentAmount > 0) {
                        itemGroupControl.controls[rowIndex].get('Checked').setValue(true);
                    }
                    else {
                        itemGroupControl.controls[rowIndex].get('Checked').setValue(false);
                    }
                    if (rowpayment % 1 != 0) {
                        this.customerPaymentForm.get('TotalAmountPaid').setValue(rowpayment.toFixed(2));
                    }
                    else {
                        this.customerPaymentForm.get('TotalAmountPaid').setValue(rowpayment);
                    }
                }
                else {
                    itemGroupControl.controls[rowIndex].get('Checked').setValue(false);
                }
            }
            else {
                this.customerPaymentForm.get('PaymentAmount').setErrors({
                    'invalidQty': true
                });
            }
        }
        else {
            grnControl.setErrors({ 'qtyerror2': true });
        }
    }

    opentextbox(isChecked: boolean, rowIndex: number) {
        let sum;
        let itemGroupControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
        if (this.customerPaymentForm.get('TotalAmountPaid').value > this.addTotalOutStanding) {
            this.customerPaymentForm.get('TotalAmountPaid').setValue(0);
        }
        if (isChecked == true) {
            if (this.checkedValue != true) {
                itemGroupControl.controls[rowIndex].get('PaymentAmount').setValue(itemGroupControl.controls[rowIndex].get('OutstandingAmount').value);
                this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[rowIndex].PaymentAmount = itemGroupControl.controls[rowIndex].get('OutstandingAmount').value;
                let OutstandingAmount: number = itemGroupControl.controls[rowIndex].get('OutstandingAmount').value;
                let TotalAmountPaid: number = this.customerPaymentForm.get('TotalAmountPaid').value;
                this.customerPaymentForm.get('TotalAmountPaid').setValue(Number(TotalAmountPaid) + OutstandingAmount);
                sum = this.customerPaymentForm.get('TotalAmountPaid').value;
            }
        }
        else {
            if (this.check == true) {
                itemGroupControl.controls[rowIndex].get('PaymentAmount').setValue(0);
            }
            else {
                if (itemGroupControl.controls[rowIndex].get('PaymentAmount').value > itemGroupControl.controls[rowIndex].get('OutstandingAmount').value) {
                    this.customerPaymentForm.get('TotalAmountPaid').setValue(this.customerPaymentForm.get('TotalAmountPaid').value - itemGroupControl.controls[rowIndex].get('OutstandingAmount').value);
                }
                else {
                    itemGroupControl.controls[rowIndex].get('PaymentAmount').setValue(0);
                    var lesspaymnt: number = 0;

                    for (let r = 0; r < itemGroupControl.length; r++) {
                        if (itemGroupControl.controls[r].get('Checked').value == true) {
                            let value = itemGroupControl.controls[r].get('PaymentAmount').value;
                            let sum = Number(value);
                            lesspaymnt += sum;
                        }
                    }

                    this.customerPaymentForm.get('TotalAmountPaid').setValue(lesspaymnt);
                }

                sum = this.customerPaymentForm.get('TotalAmountPaid').value;
            }
        }

        if (this.checkedValue != true) {
            if (sum % 1 != 0) {
                this.customerPaymentForm.get('TotalAmountPaid').setValue(sum.toFixed(2));
            }
            else {
                this.customerPaymentForm.get('TotalAmountPaid').setValue(sum);
            }
        }

        this.checkedValue = false;
    }

    Allocateamount(Amount: number) {
        let lastamount: number;
        lastamount = Amount;
        let itemGroupControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
        if (Amount != 0) {
            if (Amount <= this.addTotalOutStanding) {
                this.totalAmount = Amount;
                for (let i = 0; i < itemGroupControl.length; i++) {
                    let columnnamt = itemGroupControl.controls[i].get('OutstandingAmount').value
                    if (columnnamt > 0) {
                        if (columnnamt <= Amount) {
                            itemGroupControl.controls[i].get('PaymentAmount').setValue(columnnamt);
                            Amount = Amount - columnnamt;
                            this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[i].PaymentAmount = columnnamt;
                        }
                        else {
                            if (Amount % 1 != 0) {
                                itemGroupControl.controls[i].get('PaymentAmount').setValue(Amount.toFixed(2));
                            }
                            else {

                                itemGroupControl.controls[i].get('PaymentAmount').setValue(Amount);
                            }
                            columnnamt = Amount;
                            this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[i].PaymentAmount = Amount;
                        }
                        this.remainingAmount = this.totalAmount - columnnamt;
                        this.totalAmount = this.remainingAmount;
                        this.checkedValue = true;
                        itemGroupControl.controls[i].get('Checked').setValue(true);
                        this.selectedCustomerPaymentDetails.CustomerInvoiceDetails = this.selectedCustomerPaymentDetails.CustomerInvoiceDetails.filter((data, index) => index > -1);
                        if (this.remainingAmount == 0) {
                            if (lastamount != Amount || lastamount == Amount) {
                                for (let k = i + 1; k < itemGroupControl.length; k++) {
                                    itemGroupControl.controls[k].get('PaymentAmount').setValue(0);
                                    this.check = true;
                                    this.checkedValue = true;
                                    itemGroupControl.controls[k].get('Checked').setValue(false);
                                }

                                this.check = false;
                            }
                            break;
                        }
                    }
                }
            }
            else {
                //setting the error for the "Name" control..so as to show the duplicate validation message..                
                this.customerPaymentForm.get('TotalAmountPaid').setErrors({
                    'GreaterValue': true
                });
            }
        }
        else {
            for (let j = 0; j < itemGroupControl.length; j++) {
                itemGroupControl.controls[j].get('PaymentAmount').setValue('');
                this.check = true;
                this.checkedValue = true;
                if (itemGroupControl.controls[j].get('Checked').value == true) {
                    itemGroupControl.controls[j].get('Checked').setValue(false);
                }
            }
            this.customerPaymentForm.get('TotalAmountPaid').setErrors({
                'Zero': true
            });
            this.check = false;
        }

        this.checkedValue = false;

    }

    saveRecord() {      
        this.formSubmitAttempt = true;
        this.showGridErrorMessage = false;
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage2 = false;
        this.showGridErrorMessage3 = false;
        this.showGridErrorMessage6 = false;
        var paymnt: number = 0;

        let itemGroupControl = <FormArray>this.customerPaymentForm.controls['CustomerInvoiceDetails'];
        if (itemGroupControl.length == 0 && this.customerId != undefined) {
            this.showGridErrorMessage6 = true;
            return;
        }

        let purchaseOrderFormStatus = this.customerPaymentForm.status;
        if (purchaseOrderFormStatus != "INVALID") {

            if (this.customerPaymentForm.get('TotalAmountPaid').value == 0) {
                this.showGridErrorMessage3 = true;
                return;
            }

            for (let i = 0; i < itemGroupControl.length; i++) {
                let totalpayment: number = itemGroupControl.controls[i].get('PaymentAmount').value;
                if (totalpayment != 0)
                    paymnt += Number(totalpayment);

            }          

            if (paymnt > this.addTotalOutStanding) {
                this.showGridErrorMessage2 = true;
                return;
            }
         
            let itemCategoryDetails: CustomerPayment = this.customerPaymentForm.value;

            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            itemCategoryDetails.PaymentTypeId = this.PaymentTypeId;
            itemCategoryDetails.CreatedBy = userDetails.UserID;
            itemCategoryDetails.CompanyId = this.companyId;
            this.paymentDetails = itemCategoryDetails;
            if (this.selectedCustomerPaymentDetails.CustomerPaymentId == 0 || this.selectedCustomerPaymentDetails.CustomerPaymentId == null) {
                itemCategoryDetails.CustomerInvoiceDetails = itemCategoryDetails.CustomerInvoiceDetails.filter(i => i.PaymentAmount > 0);
             
                this.customerAPIService.createCustomerPayment(itemCategoryDetails)
                    .subscribe((paymentId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage1 = false;
                        this.showGridErrorMessage2 = false;
                        this.showGridErrorMessage3 = false;
                        this.showGridErrorMessage6 = false;
                        this.formSubmitAttempt = false;
                        this.GetCustomerPayment(paymentId);
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                    });
            }
            else {
                itemCategoryDetails.CustomerInvoiceDetails.forEach((data, index: number) => {
                    if (this.selectedCustomerPaymentDetails.CustomerInvoiceDetails[index].PaymentAmount != data.PaymentAmount) {
                        data.IsChanged = true;
                    }
                });
                itemCategoryDetails.CustomerInvoiceDetails = itemCategoryDetails.CustomerInvoiceDetails.filter(i => i.IsChanged == true);
                itemCategoryDetails.CustomerPaymentId = this.selectedCustomerPaymentDetails.CustomerPaymentId;
                this.paymentDetails = itemCategoryDetails;
                this.customerAPIService.updateCustomerPayment(itemCategoryDetails)
                    .subscribe((response: any) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage1 = false;
                        this.showGridErrorMessage2 = false;
                        this.showGridErrorMessage3 = false;
                        this.showGridErrorMessage6 = false;
                        this.formSubmitAttempt = false;

                        this.GetCustomerPayment(itemCategoryDetails.CustomerPaymentId);
                        this.deletedCustomerPaymentItems = [];
                        this.deletedCustomerPaymentItems.length = 0;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });


                    });
            }
        }
        else {
            Object.keys(this.customerPaymentForm.controls).forEach((key: string) => {
                if (this.customerPaymentForm.controls[key].status == "INVALID" && this.customerPaymentForm.controls[key].touched == false) {
                    this.customerPaymentForm.controls[key].markAsTouched();
                }
            });
        }
    }

    showFullScreen() {
        this.innerWidth = window.innerWidth;       
 
 if(this.innerWidth > 1000){  
        FullScreen(this.rightPanelRef.nativeElement);
 }
 
    }

    matselect(event) {
        if (event.checked == true) {
            this.slideActive = true;
        }
        else {
            this.slideActive = false;
        }
    }

    onDatePickerFocus(element: NgbInputDatepicker) {
        if (!element.isOpen()) {
            element.open();
        }
    }
    printPaymentVoucher() {     
        if (this.customerPaymentId > 0) {
            let pdfDocument = this.customerAPIService.getPDFoucher(this.customerPaymentId, this.companyId);
            pdfDocument.subscribe((data) => {
                let result = new Blob([data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(result);
                let tab = window.open();
                tab.location.href = fileUrl;
            });
        }
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
}
