import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { Observable, of } from 'rxjs';
import { CostOfService } from "../../models/po-creation.model";
import { SalesOrderList, SalesOrderDisplayResult, SalesOrderDetails, TicketList, SalesInvoiceList, SalesInvoiceDisplayResult } from "../../models/so-creation.model";
import { SharedService } from "../../../shared/services/shared.service";
import {
  PagerConfig, ItemMaster, MessageTypes, Taxes,
  GridOperations, Messages, Currency, PaymentTerms, UserDetails, WorkFlowStatus, WorkFlowProcess, ResponseStatusTypes
} from "../../../shared/models/shared.model";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ValidateFileType, FullScreen, restrictMinus, HideFullScreen } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Customer } from "../../../administration/models/customer";
import { DeliveryTerms } from '../../models/delivery-terms.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DEFAULT_CURRENCY_ID } from '../../../shared/constants/generic';
import { SoApprovalUpdateStatus } from '../../models/so-approval.model';
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import { SOCreationService } from "../../services/so-creation.service";
import { POCreationService } from "../../services/po-creation.service";
import { CustomerApiService } from '../../../administration/services/customer-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TicketManagementService } from '../../../facility/services/ticket-management.service';
import { TicketManagementModel } from '../../../facility/models/ticket-management.model';
@Component({
  selector: 'app-standard-sales-order',
  templateUrl: './standard-sales-order.component.html',
  styleUrls: ['./standard-sales-order.component.css'],
  providers: [SOCreationService, TicketManagementService, POCreationService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class StandardSalesOrderComponent implements OnInit {
  @Input('selectedSoId') selectedSoId: number;
  @Input('selectedSoInvoiceId') selectedSalesInvoiceId: number;
  @Input('isApprovalPage') isApprovalPage: boolean;
  @Input('remarks') remarks: string;
  @Input('type') type: string;
  @Input('salesOrderList') salesOrderList: Array<SalesOrderList> = [];
  @Input('salesInvoiceList') salesInvoicesList: Array<SalesInvoiceList> = [];
  @Input('pageTitle')
  @Output() pageTitle: string;
  @Output()
  readListView: EventEmitter<number> = new EventEmitter<number>(); //creating an output event
  @Output()
  cancelChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  updateStatus: EventEmitter<SoApprovalUpdateStatus> = new EventEmitter<SoApprovalUpdateStatus>();
  salesOrdersList: Array<SalesOrderList> = [];
  salesOrderPagerConfig: PagerConfig;
  salesOrderItemsGridConfig: PagerConfig;
  salesOrderForm: FormGroup;
  selectedSODetails: SalesOrderDetails;
  salesOrderDetails: any;
  customers: Customer[] = [];
  currencies: Currency[] = [];
  departments: Location[] = [];
  taxTypes: Array<Taxes> = [];
  gridColumns: Array<{ field: string, header: string }> = [];
  recordInEditMode: number;
  operation: string;
  companyId: number;
  costOfServiceType: CostOfService[] = [];
  hideText?: boolean = null;
  hideInput?: boolean = null;
  uploadedFiles: Array<File> = [];
  leftsection: boolean = false;
  rightsection: boolean = false;
  slideactive: boolean = false;
  showGridErrorMessage: boolean = false;
  scrollbarOptions: any;
  salesOrderSearchKey: string;
  salesInvoiceSearchKey: string;
  apiEndPoint: string;
  hideLeftPanel: boolean = false;
  linesToAdd: number = 2;
  paymentTerms: PaymentTerms[] = [];
  deliveryTerms: DeliveryTerms[] = [];
  measurementUnits: MeasurementUnit[] = [];
  deletedSalesOrderItems: Array<number> = [];
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  selectedRowId: number = -1;
  @ViewChild('instructions') instructionsRef: ElementRef;
  @ViewChild('justifications') justificationsRef: ElementRef;
  workFlowStatus: any;
  showLoadingIcon: boolean = false;
  customerCategroies = [];
  @ViewChild('rightPanel') rightPanelRef;
  defaultDeliveryAddress: string = "";
  salesInvoiceList: Array<SalesInvoiceList> = [];
  selectedticketManagementRecord: TicketManagementModel;
  invoiceType: string = "";
  public innerWidth: any;
  //selectedTicketDetails : TicketDetails;
  constructor(private socreationObj: SOCreationService,
    private pocreationObj: POCreationService,
    private formBuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    public sessionService: SessionStorageService,
    private workFlowService: WorkFlowApiService,
    private customerApiService: CustomerApiService,
    private ticketManagementServiceObj: TicketManagementService) {

    this.companyId = this.sessionService.getCompanyId();

    this.apiEndPoint = environment.apiEndpoint;
    this.sharedServiceObj.deliveryAddress$.subscribe((data) => {
      this.salesOrderForm.patchValue({
        "DeliveryAddress": data,
      });
      this.defaultDeliveryAddress = data;
    }
    );

    this.getformgroup();
    this.workFlowStatus = WorkFlowStatus;
    this.invoiceType = "Sales Order";
  }

  ngOnInit() {  
    this.salesOrderPagerConfig = new PagerConfig();
    this.salesOrderPagerConfig.RecordsToFetch = 100;
    this.salesOrderItemsGridConfig = new PagerConfig();
    this.salesOrderItemsGridConfig.RecordsToFetch = 20;
    this.selectedSODetails = new SalesOrderDetails();

    //getting the list of cost of service types.
    this.pocreationObj.getCostOfServiceTypes()
      .subscribe((data: CostOfService[]) => {
        this.costOfServiceType = data;
      });

    this.getDepartments(this.companyId);

    this.sharedServiceObj.getCurrencies()
      .subscribe((data: Currency[]) => {
        this.currencies = data;
      });

    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        this.companyId = data;
        this.getDepartments(this.companyId);
        //this.getSalesInvoices(0);
      });

    this.operation = GridOperations.Display;
    this.getPaymentTerms();
    this.getCustomerCategroies();
    this.getMeasurementUnits();
    this.getTaxTypes();
    this.getDeliveryTerms();

    this.setColumns();
  }

  getDepartments(companyId: number) {
    this.sharedServiceObj.getDepartmentsByCompany(companyId)
      .subscribe((data: Location[]) => {
        this.departments = data;
      });
  }

  getformgroup() {
    this.salesOrderForm = this.formBuilderObj.group({
      'SalesOrderId': [null],
      'TicketId': [null],
      'Ticket': [null],
      'SalesOrderCode': [""],
      'CustomerCategoryId': [1, { validators: [Validators.required] }],
      'LocationId': [null, [Validators.required]],
      'Customer': [null, [Validators.required]],
      'ExpectedDeliveryDate': [new Date()],
      'CurrencyId': [null, [Validators.required]],
      'CustomerAddress': [{ value: "", disabled: true }],
      'DeliveryAddress': [""],
      'ShippingFax': [{ value: "", disabled: true }],
      'CostOfServiceId': [null, Validators.required],
      'Instructions': [""],
      'Justifications': [""],
      'SalesOrderItems': this.formBuilderObj.array([]),
      'Discount': [0, [Validators.min(0)]],
      'OtherCharges': [0],
      'ShippingCharges': [0],
      'SubTotal': [0],
      'TotalAmount': [0],
      'IsGstRequired': [false],
      'IsGstBeforeDiscount': [false],
      'PaymentTermId': [null, [Validators.required]],
      'PaymentTerms': [{ value: "", disabled: true }],
      'DeliveryTermId': [null, [Validators.required]],
      'DeliveryTerm': [{ value: "", disabled: true }],
      "Reasons": ["", [Validators.required]],
      'Remarks': [""],
      'UnitNumber': [{ value: null, disabled: true }],
      'SalesInvoiceId': [0],
      'SalesInvoiceCode': [null, { validators: [Validators.required] }],
      'OutStandingAmount': [0],
      'SalesInvoiceItems': this.formBuilderObj.array([]),
      'TaxId': [0],
      'TaxRate': [0],
      'TotalTax': [0],
      'SalesOrder': [null, { validators: [Validators.required] }],
      'InvoiceType': ["Sales Order"]
    });

  }

  ngOnChanges(simpleChange: SimpleChanges) {
    if (this.type === "approval") {
      this.salesInvoicesList = [];
    }

    if (simpleChange["selectedSoId"]) {    
      let currentValue: number = simpleChange["selectedSoId"].currentValue;
      if (currentValue == 0) {
        this.setColumns();
        this.addRecord();
      }
      else if (currentValue > 0) {
        this.setColumns();
        this.onRecordSelection(currentValue);
      }
      else if (currentValue === -1 || currentValue === undefined) {
        this.selectedSODetails = new SalesOrderDetails();
        this.setColumns();
      }
    }
    else if (simpleChange["remarks"] && simpleChange["remarks"].currentValue == "") {
      this.salesOrderForm.get('Remarks').setValue("");
    }
  }

  //this method is used to format the content to be display in the autocomplete textbox after selection..
  customerInputFormater = (x: Customer) => x.CustomerName;
  //this mehtod will be called when user gives contents to the  "customer" autocomplete...

  customerSearch = (text$: Observable<string>) => {
    if (text$ == undefined) {
      return of([]);
    }
    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term == "") {
          return of([]);
        }
        return this.sharedServiceObj.getAllSearchCustomers({
          searchKey: term,
          customerCategoryId: this.salesOrderForm.get('CustomerCategoryId').value,
          companyId: this.companyId
        }).map((data: Customer[]) => {
          return data;
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      })
    );
  }

  // customerSearch = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(300),
  //     distinctUntilChanged(),
  //     switchMap(term =>
  //       this.sharedServiceObj.getAllSearchCustomers({
  //         searchKey: term,
  //         customerCategoryId: this.salesOrderForm.get('CustomerCategoryId').value,
  //         companyId: this.companyId
  //       }).pipe(
  //         catchError(() => {
  //           return of([]);
  //         }))
  //     )
  //   );

  soSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term == "") {
          this.clearForm();
          return of([]);
        }
        return this.sharedServiceObj.getAllSearchSalesOrders({
          Search: term,
          CustomerId: 0,
          companyId: this.companyId,
          WorkFlowStatusId: WorkFlowStatus.Approved//getting only those purchase orders which are approved..
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

  soInputFormatter = (x: SalesOrderList) => x.SalesOrderCode;
  setColumns() {
    this.gridColumns = [];
    if (this.type != "invoice") {
      this.gridColumns = [
        { field: 'Sno', header: 'S.no.' },
        { field: 'ItemCode', header: 'Item Code' },
        { field: 'Name', header: 'Item' },
        { field: 'ItemDescription', header: 'Description' },
        { field: 'MeasurementUnitID', header: 'UOM' },
        { field: 'ItemQty', header: 'Qty' },
        { field: 'Unitprice', header: 'Price' },
        { field: 'Discount', header: 'Discount' },
        { field: 'GstType', header: 'Gst Type' },
        { field: 'GstAmount', header: 'Gst Amount' },
        { field: 'ItemTotal', header: 'Total' }
      ];
    }
    else {
      this.gridColumns = [
        { field: 'Sno', header: 'S.no.' },
        { field: 'ItemDescription', header: 'Description' },
        { field: 'ItemQty', header: 'Qty' },
        { field: 'Unitprice', header: 'Price' },
        { field: 'Discount', header: 'Discount' },
        { field: 'GstType', header: 'Gst Type' },
        { field: 'GstAmount', header: 'Gst Amount' },
        { field: 'ItemTotal', header: 'Total' }
      ];
    }
  }
  clearForm() {
    this.salesOrderForm.reset();
    this.salesOrderForm.setErrors(null);
    this.salesOrderForm.get('Remarks').setErrors(null);
    this.salesOrderForm.get('ExpectedDeliveryDate').setValue(new Date());
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    itemGroupControl.controls = [];
    itemGroupControl.controls.length = 0;
    this.salesOrderForm.patchValue({
      CustomerCategoryId: "1",
      IsGstRequired: false,
      InvoiceType: "Sales Order",
      CurrencyId: DEFAULT_CURRENCY_ID
    });
  }


  getDeliveryTerms() {
    this.sharedServiceObj.getAllDeliveryTerms(this.sessionService.getCompanyId())
      .subscribe((data: DeliveryTerms[]) => {
        this.deliveryTerms = data;
      });
  }

  getTaxTypes() {
    this.sharedServiceObj.getTaxGroups(0)
      .subscribe((data: Taxes[]) => {
        this.taxTypes = data;
      });
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

  customerTypeChange(event) {
    let salesOrderTypeId = event.target.value;
    this.salesOrderForm.get('Customer').setValue(null);
  }

  invoiceTypeChange(event) {
    this.invoiceType = event.target.value;
    this.salesOrderForm.get('InvoiceType').setValue(this.invoiceType);
    this.salesOrderForm.get('SalesOrder').setValue(null);
    this.salesOrderForm.get('Ticket').setValue(null);
  }

  getCustomerCategroies(): void {
    let serviceCategoriesResult = <Observable<Array<any>>>this.customerApiService.getCustomerCategories();
    serviceCategoriesResult.subscribe((data) => {
      this.customerCategroies = data;
    });
  }
  //to get list of sales orders..
  getAllSearchSalesOrders(searchKey: string, salesOrderIdToBeSelected: number) {
    this.uploadedFiles.length = 0;
    this.uploadedFiles = [];
    //getting the list of sales orders...
    let salesOrderDisplayInput = {
      Skip: this.salesOrderPagerConfig.RecordsToSkip,
      Take: this.salesOrderPagerConfig.RecordsToFetch,
      Search: searchKey,
      CompanyId: this.companyId
    };
    this.showLoadingIcon = true;
    this.socreationObj.getAllSearchSalesOrders(salesOrderDisplayInput)
      .subscribe((data: SalesOrderDisplayResult) => {
        this.salesOrdersList = data.SalesOrders;
        this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;

        if (this.salesOrdersList.length > 0) {
          if (salesOrderIdToBeSelected == 0) {
            this.onRecordSelection(this.salesOrdersList[0].SalesOrderId);
          }
          else {
            this.onRecordSelection(salesOrderIdToBeSelected);
          }
        }
        else {
          this.addRecord();
        }
      }, (err) => { }, () => this.showLoadingIcon = false);
  }

  //to get list of purchase orders..
  getAllSearchSalesInvoices(searchKey: string, SalesInvoiceIdToBeSelected: number) {
    this.uploadedFiles.length = 0;
    this.uploadedFiles = [];
    //getting the list of purchase orders...
    let salesInvoiceDisplayInput = {
      Skip: this.salesOrderPagerConfig.RecordsToSkip,
      Take: this.salesOrderPagerConfig.RecordsToFetch,
      Search: searchKey,
      CompanyId: this.companyId,
      SalesInvoiceCode: "",
      CustomerName: "",
    };
    this.socreationObj.getAllSearchSalesInvoices(salesInvoiceDisplayInput)
      .subscribe((data: SalesInvoiceDisplayResult) => {
        this.salesInvoiceList = data.SalesInvoices;
        this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
        if (this.salesInvoiceList.length > 0) {
          if (SalesInvoiceIdToBeSelected == 0) {
            this.onRecordSelection(this.salesInvoiceList[0].SalesInvoiceId);
          }
          else {
            this.onRecordSelection(SalesInvoiceIdToBeSelected);
          }
        }
        else {
          this.hideText = true;
          this.hideInput = false;
        }
      });
  }

  onRecordSelection(id: number) {
    if (this.type != "invoice") {
      let userDetails = <UserDetails>this.sessionService.getUser();
      this.showLoadingIcon = true;
      this.socreationObj.getSalesOrderDetails(id, this.isApprovalPage, userDetails.UserID)
        .subscribe((data: SalesOrderDetails) => {
          if (data != null) {
            this.selectedSODetails = data;
            this.operation = GridOperations.Display;
            this.hideText = true;
            this.hideInput = false;
          }
          else {
            this.showLoadingIcon = false
          }
        }, (err) => { }, () => this.showLoadingIcon = false);

    }
    else {
      this.socreationObj.getSalesInvoiceDetails(id)
        .subscribe((data: SalesOrderDetails) => {
          this.hideText = true;
          this.hideInput = false;
          if (data != null) {
            this.selectedSODetails = data;

            if (this.selectedSODetails.TicketId != null) {
              this.invoiceType === "Ticket";
            }
            else {
              this.invoiceType === "Sales Order";
            }

            this.selectedSODetails.SalesOrderItems = [];
            this.selectedSODetails.SalesInvoiceItems.forEach(salesInvoiceItem => {

              this.selectedSODetails.SalesOrderItems.push(salesInvoiceItem);
            });

            this.operation = GridOperations.Display;
          }
        });
    }
  }

  onCustomerChange(event?: any) {
    if (event != undefined) {
      let customerDetails: Customer;
      if (event != null && event != undefined) {
        customerDetails = event.item;
      }
      else {
        customerDetails = this.salesOrderForm.get('Customer').value;
      }

      if (customerDetails != undefined) {
        let billingAddress: string = "";
        billingAddress += customerDetails.BillingAddress;
        billingAddress += '\n' + customerDetails.BillingCity;
        billingAddress += '\n' + customerDetails.BillingTelephone;
        billingAddress += '\n' + customerDetails.BillingCountry;

        let shippingAddress: string = "";
        shippingAddress += customerDetails.ShippingAddress;
        shippingAddress += '\n' + customerDetails.ShippingCity;
        shippingAddress += '\n' + customerDetails.ShippingTelephone;
        shippingAddress += '\n' + customerDetails.ShippingCountry;

        this.salesOrderForm.patchValue({
          "CustomerAddress": billingAddress,
          "DeliveryAddress": shippingAddress,
          "ShippingFax": customerDetails.ShippingFax
        });
      }
      else {
        this.salesOrderForm.patchValue({
          "CustomerAddress": "",
          "DeliveryAddress": "",
          "ShippingFax": ""
        });
      }
    }
  }

  itemMasterInputFormater = (x: ItemMaster) => x.ItemName;
  itemMasterSearch = (text$: Observable<string>) => {
    if (text$ == undefined) {
      return of([]);
    }
    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term == "") {
          let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
          if (itemGroupControl.controls[this.selectedRowId] != undefined) {
            let salesOrderItemId = itemGroupControl.controls[this.selectedRowId].get('SalesOrderItemId').value;
            itemGroupControl.controls[this.selectedRowId].reset();
            itemGroupControl.controls[this.selectedRowId].get('SalesOrderItemId').setValue(salesOrderItemId);
          }
          return of([]);
        }
        return this.sharedServiceObj.getItemMasterByKey({
          searchKey: term,
          CompanyId:this.companyId,
          LocationID: null //this.salesOrderForm.get('LocationId').value
        }).pipe(
          catchError(() => {

            return of([]);
          }))
      })
    );
  }

  ticketSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term == "") {
          this.clearForm();
          this.addGridItem(this.linesToAdd);
          return of([]);
        }
        return this.socreationObj.getAllSearchTickets({
          Search: term,
          companyId: this.companyId
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

  tucketInputFormatter = (x: TicketList) => x.TicketNo;

  itemClick(rowId: number) {
    this.selectedRowId = rowId;
  }

  soSelection(soRecord: any) {
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.socreationObj.getSalesOrderDetails(soRecord.SalesOrderId, this.isApprovalPage, userDetails.UserID)
      .subscribe((data: SalesOrderDetails) => {
        if (data != null) {
          this.clearForm();
          this.salesOrderDetails = this.setSalesOrderDetails(data, soRecord);
          if (this.salesOrderDetails.SalesOrderItems != undefined) {
            this.addGridItem(this.salesOrderDetails.SalesOrderItems.length);
          }
          this.salesOrderForm.patchValue(this.salesOrderDetails);
          this.salesOrderForm.get('CustomerCategoryId').setValue(this.salesOrderDetails.Customer.CustomerCategoryId.toLocaleString());
          let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
          if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
          }
          else {
            this.showGridErrorMessage = false;
          }
        }
      });
  }

  setSalesOrderDetails(salesOrderDetails: SalesOrderDetails, soRecord: any) {
    let salesInvoiceItems = salesOrderDetails.SalesOrderItems.map(data => {
      return {
        SalesOrderItemId: data.SalesOrderItemId,
        SalesInvoiceItemId: 0,
        ItemDescription: data.Item.ItemName,
        ItemQty: data.ItemQty,
        Unitprice: data.Unitprice,
        IsModified: false,
        Discount: data.Discount,
        TaxID: data.TaxID,
        TaxName: data.TaxName,
        TaxAmount: data.TaxAmount,
        TotalTax: data.TaxTotal,
        Item: data.Item,
        MeasurementUnitID: data.MeasurementUnitID,
        MeasurementUnitCode: data.MeasurementUnitCode
      };
    });

    let salesInvoiceDetails = {
      SalesOrderId: salesOrderDetails.SalesOrderId,
      Ticket: salesOrderDetails.Ticket,
      SalesOrderCode: salesOrderDetails.SalesOrderCode,
      CustomerCategoryId: salesOrderDetails.Customer.CustomerCategoryId.toLocaleString(),
      LocationId: salesOrderDetails.LocationId,
      Customer: salesOrderDetails.Customer,
      ExpectedDeliveryDate: salesOrderDetails.ExpectedDeliveryDate,
      CurrencyId: salesOrderDetails.CurrencyId,
      CustomerAddress: salesOrderDetails.Customer.BillingAddress,
      DeliveryAddress: salesOrderDetails.DeliveryAddress,
      ShippingFax: salesOrderDetails.Customer.ShippingFax,
      CostOfServiceId: 0,
      Instructions: salesOrderDetails.Instructions,
      Justifications: salesOrderDetails.Justifications,
      SalesOrderItems: salesInvoiceItems,
      Discount: salesOrderDetails.Discount,
      OtherCharges: salesOrderDetails.OtherCharges,
      ShippingCharges: salesOrderDetails.ShippingCharges,
      SubTotal: salesOrderDetails.SubTotal,
      TotalAmount: salesOrderDetails.TotalAmount,
      IsGstRequired: salesOrderDetails.IsGstRequired,
      IsGstBeforeDiscount: salesOrderDetails.IsGstBeforeDiscount,
      PaymentTermId: salesOrderDetails.PaymentTermId,
      PaymentTerms: salesOrderDetails.PaymentTerms,
      DeliveryTermId: salesOrderDetails.DeliveryTermId,
      //DeliveryTerm: salesOrderDetails.DeliveryTerm,
      Reasons: salesOrderDetails.Reasons,
      //Remarks: "", 
      UnitNumber: salesOrderDetails.Ticket == null ? null : salesOrderDetails.Ticket.UnitNumber,
      SalesInvoiceId: 0,
      SalesInvoiceCode: "",
      OutStandingAmount: salesOrderDetails.OutStandingAmount,
      SalesInvoiceItems: salesInvoiceItems,
      TaxRate: salesOrderDetails.TaxRate,
      TotalTax: salesOrderDetails.TotalTax,
      SalesOrder: soRecord
    };

    return salesInvoiceDetails;
  }

  itemMasterSelection(eventData: any, index: number) {
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    //setting the existing qty based on user selection 
    itemGroupControl.controls[index].patchValue({
      ItemDescription: eventData.item.Description,
      MeasurementUnitID: eventData.item.MeasurementUnitID
    });
  }

  initGridRows() {
    return this.formBuilderObj.group({
      'SalesOrderItemId': 0,
      'SalesInvoiceItemId': [0],
      'ItemDescription': [""],
      'MeasurementUnitID': [0],
      'MeasurementUnitCode': [""],
      'Item': ["", Validators.required],
      "ItemQty": [0, [Validators.required, Validators.min(1)]],
      "Unitprice": [0, [Validators.required, Validators.min(1)]],
      "IsModified": false,
      "TaxID": [0, [Validators.required]],
      "TaxName": [""],
      "TaxAmount": [0],
      "Discount": [0, [Validators.required]],
      "TotalTax": [0]
    });
  }
  //adding row to the grid..
  addGridItem(noOfLines: number) {
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    for (let i = 0; i < noOfLines; i++) {
      itemGroupControl.push(this.initGridRows());
      itemGroupControl.controls[i].get('SalesInvoiceItemId').setValue(0);
    }
  }

  removeGridItem(rowIndex: number) {
    let salesOrderItemId = 0;
    let salesInvoiceItemId = 0;
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    if (this.type.toLowerCase() != 'invoice') {
      salesOrderItemId = itemGroupControl.controls[rowIndex].get('SalesOrderItemId').value;
      if (salesOrderItemId > 0) {
        this.deletedSalesOrderItems.push(salesOrderItemId);
      }
    }
    else {
      salesInvoiceItemId = itemGroupControl.controls[rowIndex].get('SalesInvoiceItemId').value;
      if (salesInvoiceItemId > 0) {
        this.deletedSalesOrderItems.push(salesInvoiceItemId);
      }
    }

    itemGroupControl.removeAt(rowIndex);
    this.calculateTotalPrice();
  }

  onTicketChange(event: any) {
    let ticketDetails: TicketList;
    if (event != null && event != undefined) {
      ticketDetails = event.item;
      if (ticketDetails != undefined) {
        this.ticketManagementServiceObj.getTicketDetails(ticketDetails.TicketId)
          .subscribe((data: TicketManagementModel) => {
            if (data != null) {
              this.clearForm();
              this.selectedticketManagementRecord = data;
              if (data.InventoryItems != undefined) {
                this.addGridItem(data.InventoryItems.length);
              }
              let salesOrderItems = this.selectedticketManagementRecord.InventoryItems.map(data => {
                return {
                  SalesOrderItemId: 0,   //data.InventoryItemId,
                  ItemDescription: data.ItemDescription,
                  ItemQty: data.ItemQty,
                  Unitprice: data.Price,
                  IsModified: false,
                  Item: data.Item,
                  ItemTotal: data.ItemQty * data.Price,
                  MeasurementUnitID: data.MeasurementUnitID
                };
              });

              let customerDetails = data.OwnerDetails;
              if (customerDetails != undefined) {
                let billingAddress: string = "";
                billingAddress += customerDetails.BillingAddress;
                billingAddress += '\n' + customerDetails.BillingCity;
                billingAddress += '\n' + customerDetails.BillingTelephone;
                billingAddress += '\n' + customerDetails.BillingCountry;

                let shippingAddress: string = "";
                shippingAddress += customerDetails.ShippingAddress;
                shippingAddress += '\n' + customerDetails.ShippingCity;
                shippingAddress += '\n' + customerDetails.ShippingTelephone;
                shippingAddress += '\n' + customerDetails.ShippingCountry;

                this.salesOrderForm.patchValue({
                  "CustomerAddress": billingAddress,
                  "DeliveryAddress": shippingAddress,
                  "ShippingFax": customerDetails.ShippingFax,
                  "UnitNumber": data.UnitNumber,
                  "SalesOrderItems": salesOrderItems,
                  "Ticket": ticketDetails,
                  "Customer": customerDetails,
                  "CustomerCategoryId": customerDetails.CustomerCategoryId.toLocaleString(),
                  "OutStandingAmount": 0,
                  "SalesOrderId": null,
                  "InvoiceType": this.invoiceType,
                  "SubTotal": data.SubTotal,
                  "TotalAmount": data.TotalAmount

                });
              }

              let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
              if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
                this.showGridErrorMessage = true;
              }
              else {
                this.showGridErrorMessage = false;
              }
            }
          });
      }
    }
  }

  addRecord() {
    //setting this variable to false so as to show the sales order details in edit mode
    this.hideText = false;
    this.hideInput = true;
    this.selectedSODetails = new SalesOrderDetails();
    this.clearForm();
    if (this.type != "invoice") {
      this.addGridItem(this.linesToAdd);
      this.salesOrderForm.get('Ticket').enable();
    }

    if (this.type.toLowerCase() === 'invoice') {
      this.salesOrderForm.patchValue({
        'CurrencyId': DEFAULT_CURRENCY_ID,
        'DeliveryAddress': this.defaultDeliveryAddress
      });
    }
    // this.showFullScreen();
  }

  showFullScreen() {
    this.innerWidth = window.innerWidth;       
 if(this.innerWidth > 1000){ 
    if (this.rightPanelRef != undefined) {
      FullScreen(this.rightPanelRef.nativeElement);
    }
  }
  }

  hideFullScreen() {
    HideFullScreen(this.rightPanelRef.nativeElement);
  }

  displayDuplicateErrorMessage() {
    //setting the error for the "Name" control..so as to show the duplicate validation message..
    this.salesOrderForm.get('SalesInvoiceCode').setErrors({
      'Duplicate': true
    });
  }

  saveRecord(action: string) {
    if (this.type != "invoice") {
      this.salesOrderForm.get('SalesInvoiceCode').clearValidators();
      this.salesOrderForm.get('SalesInvoiceCode').updateValueAndValidity();
      this.salesOrderForm.get('SalesOrder').clearValidators();
      this.salesOrderForm.get('SalesOrder').updateValueAndValidity();
      this.salesOrderForm.get('Ticket').clearValidators();
      this.salesOrderForm.get('Ticket').updateValueAndValidity();
      if (action == 'send' && this.hideText == true && this.selectedSODetails.SalesOrderId > 0) {
        let workFlowDetails =
          {
            TotalAmount: this.selectedSODetails.TotalAmount,
            SalesOrderId: this.selectedSODetails.SalesOrderId,
            CreatedBy: this.selectedSODetails.CreatedBy,
            SalesOrderCode: this.selectedSODetails.SalesOrderCode,
            WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
            CompanyId: this.selectedSODetails.CompanyId,
            LocationId: this.selectedSODetails.LocationId
          };
        this.socreationObj.sendForApproval(workFlowDetails)
          .subscribe((data) => {

            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SentForApproval,
              MessageType: MessageTypes.Success
            });
            this.readListView.emit(workFlowDetails.SalesOrderId);
          });
        return;
      }

      this.showGridErrorMessage = false;
      let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
      if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
        this.showGridErrorMessage = true;
      }

      let salesOrderFormStatus = this.salesOrderForm.status;
      //getting the sales order form details...
      let salesOrderDetails: SalesOrderDetails = this.salesOrderForm.value;
      if (salesOrderFormStatus != "INVALID" && this.showGridErrorMessage == false) {
        salesOrderDetails["ExpectedDeliveryDate"] = this.reqDateFormatPipe.transform(salesOrderDetails.ExpectedDeliveryDate);
        salesOrderDetails.IsGstBeforeDiscount = salesOrderDetails.IsGstBeforeDiscount == null ? false : salesOrderDetails.IsGstBeforeDiscount;
        if (salesOrderDetails.Discount == null) {
          salesOrderDetails.Discount = 0;
        }
        if (salesOrderDetails.ShippingCharges == null) {
          salesOrderDetails.ShippingCharges = 0;
        }
        if (salesOrderDetails.OtherCharges == null) {
          salesOrderDetails.OtherCharges = 0;
        }
        if (salesOrderDetails.TotalAmount == null) {
          salesOrderDetails.TotalAmount = 0;
        }
        if (salesOrderDetails.TaxRate == null) {
          salesOrderDetails.TaxRate = 0;
        }
        if (salesOrderDetails.TotalTax == null) {
          salesOrderDetails.TotalTax = 0;
        }

        salesOrderDetails.SalesOrderItems.forEach(i => {
          if (i.SalesOrderItemId > 0) {
            let previousRecord = this.selectedSODetails.SalesOrderItems.find(j => j.SalesOrderItemId == i.SalesOrderItemId);
            if (i.Item.ItemMasterId != previousRecord.Item.ItemMasterId ||
              i.ItemDescription != previousRecord.ItemDescription ||
              i.ItemQty != previousRecord.ItemQty ||
              i.Unitprice != previousRecord.Unitprice ||
              i.MeasurementUnitID != previousRecord.MeasurementUnitID ||
              i.TaxID != previousRecord.TaxID ||
              i.Discount != previousRecord.Discount) {
              i.IsModified = true;
            }
          }
          else {
            i.SalesOrderItemId = 0;
          }
        });

        salesOrderDetails.SalesOrderItems = salesOrderDetails.SalesOrderItems.filter(i => i.SalesOrderItemId == 0 || i.SalesOrderItemId == null || i.IsModified == true);
        let userDetails = <UserDetails>this.sessionService.getUser();
        salesOrderDetails.RequestedBy = userDetails.UserID;
        salesOrderDetails.CreatedBy = userDetails.UserID;
        salesOrderDetails.CompanyId = this.sessionService.getCompanyId();
        salesOrderDetails.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
        salesOrderDetails.ProcessId = WorkFlowProcess.InventoryPO;
        if (salesOrderDetails.SalesOrderId == 0 || salesOrderDetails.SalesOrderId == null) {
          salesOrderDetails.SalesOrderId = 0;
          this.socreationObj.createSalesOrder(salesOrderDetails, this.uploadedFiles)
            .subscribe((soId: number) => {
              this.hideText = true;
              this.hideInput = false;
              this.uploadedFiles.length = 0;
              this.uploadedFiles = [];
              this.recordInEditMode = -1;
              this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: Messages.SavedSuccessFully,
                MessageType: MessageTypes.Success
              });

              this.readListView.emit(soId);
              this.showGridErrorMessage = false;
            });
        }
        else {
          salesOrderDetails.SalesOrderId = this.selectedSODetails.SalesOrderId;
          salesOrderDetails.SalesOrderItemsToDelete = this.deletedSalesOrderItems;
          salesOrderDetails.Attachments = this.selectedSODetails.Attachments.filter(i => i.IsDelete == true);
          this.socreationObj.updateSalesOrder(salesOrderDetails, this.uploadedFiles)
            .subscribe((response) => {
              this.hideText = true;
              this.hideInput = false;
              this.uploadedFiles.length = 0;
              this.uploadedFiles = [];
              this.deletedSalesOrderItems = [];
              this.deletedSalesOrderItems.length = 0;
              this.recordInEditMode = -1;
              this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: Messages.UpdatedSuccessFully,
                MessageType: MessageTypes.Success
              });
              this.readListView.emit(salesOrderDetails.SalesOrderId);
              this.showGridErrorMessage = false;
              this.hideFullScreen();
            });
        }
      }
      else {
        Object.keys(this.salesOrderForm.controls).forEach((key: string) => {
          if (this.salesOrderForm.controls[key].status == "INVALID" && this.salesOrderForm.controls[key].touched == false) {
            this.salesOrderForm.controls[key].markAsTouched();
          }
        });
        let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
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
    else {
      this.saveSaleInvoice();
    }
  }

  saveSaleInvoice() {
    this.salesOrderForm.get('SalesInvoiceCode').setValidators([Validators.required]);
    this.salesOrderForm.get('SalesInvoiceCode').updateValueAndValidity();

    if (this.invoiceType === "Sales Order" && (this.selectedSODetails.SalesInvoiceId === 0 || this.selectedSODetails.SalesInvoiceId === undefined)) {
      this.salesOrderForm.get('SalesOrder').setValidators([Validators.required]);
      this.salesOrderForm.get('SalesOrder').updateValueAndValidity();
      this.salesOrderForm.get('Ticket').clearValidators();
      this.salesOrderForm.get('Ticket').updateValueAndValidity();
    }
    else if (this.invoiceType === "Ticket" && (this.selectedSODetails.SalesInvoiceId === 0 || this.selectedSODetails.SalesInvoiceId === undefined)) {
      this.salesOrderForm.get('Ticket').setValidators([Validators.required]);
      this.salesOrderForm.get('Ticket').updateValueAndValidity();
      this.salesOrderForm.get('SalesOrder').clearValidators();
      this.salesOrderForm.get('SalesOrder').updateValueAndValidity();
    }
    else {
      this.salesOrderForm.get('Ticket').clearValidators();
      this.salesOrderForm.get('Ticket').updateValueAndValidity();
      this.salesOrderForm.get('SalesOrder').clearValidators();
      this.salesOrderForm.get('SalesOrder').updateValueAndValidity();
    }

    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    let userid = userDetails.UserID;
    this.showGridErrorMessage = false;
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
      this.showGridErrorMessage = true;
    }

    this.salesOrderForm.get('Reasons').setValue("Test");
    this.salesOrderForm.get('CostOfServiceId').setValue(0);
    this.salesOrderForm.get('DeliveryTermId').setValue(0);

    if (this.salesOrderForm.get('Ticket').value != null) {
      this.salesOrderForm.get('TicketId').setValue(this.salesOrderForm.get('Ticket').value.TicketId);
    }

    if (this.selectedSODetails.SalesInvoiceId > 0) {
      itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
      for (let i = 0; i < itemGroupControl.length; i++) {
        if (this.type === "invoice") {
          let item = new ItemMaster();
          itemGroupControl.controls[i].get("Item").setValue(item);
        }
      }
    }

    let InvoiceFormStatus = this.salesOrderForm.status;

    if (InvoiceFormStatus != "INVALID" && this.showGridErrorMessage == false) {
      //getting the purchase order form details...
      let itemCategoryDetails: SalesOrderDetails = this.salesOrderForm.value;
      let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
      itemCategoryDetails.RequestedBy = userDetails.UserID;
      itemCategoryDetails.CreatedBy = userDetails.UserID;
      itemCategoryDetails.CompanyId = this.sessionService.getCompanyId();
      if (itemCategoryDetails.Discount == null) {
        itemCategoryDetails.Discount = 0;
      }
      if (itemCategoryDetails.ShippingCharges == null) {
        itemCategoryDetails.ShippingCharges = 0;
      }
      if (itemCategoryDetails.OtherCharges == null) {
        itemCategoryDetails.OtherCharges = 0;
      }
      if (itemCategoryDetails.TotalAmount == null) {
        itemCategoryDetails.TotalAmount = 0;
      }
      if (itemCategoryDetails.TaxId == null) {
        itemCategoryDetails.TaxRate = 0;
        itemCategoryDetails.TaxId = 0;
      }
      if (itemCategoryDetails.TotalTax == null) {
        itemCategoryDetails.TotalTax = 0;
      }
      // if (itemCategoryDetails.SalesOrderId == null) {
      //   itemCategoryDetails.SalesOrderId = 0;
      // }
      if (itemCategoryDetails.TaxRate == null) {
        itemCategoryDetails.TaxRate = 0;
      }

      this.salesOrderForm.get('SalesOrderItems').value.forEach(salesInvoice => {
        itemCategoryDetails.SalesInvoiceItems.push(salesInvoice);
      });

      itemCategoryDetails.SalesInvoiceItems.forEach(i => {
        if (i.SalesInvoiceItemId > 0) {
          let previousRecord = this.selectedSODetails.SalesInvoiceItems.find(j => j.SalesInvoiceItemId == i.SalesInvoiceItemId);

          if (
            i.ItemDescription != previousRecord.ItemDescription ||
            i.ItemQty != previousRecord.ItemQty ||
            i.Unitprice != previousRecord.Unitprice ||
            i.TaxID != previousRecord.TaxID ||
            i.Discount != previousRecord.Discount) {
            i.IsModified = true;
          }
        }
        else {
          i.SalesInvoiceItemId = 0;
        }
      });
      itemCategoryDetails.SalesInvoiceItems = itemCategoryDetails.SalesInvoiceItems.filter(i => i.SalesInvoiceItemId == 0 || i.SalesInvoiceItemId == null || i.IsModified == true);
      itemCategoryDetails.RequestedBy = userid;
      itemCategoryDetails.CreatedBy = userid;

      if (itemCategoryDetails.SalesInvoiceId == 0 || itemCategoryDetails.SalesInvoiceId == null) {
        itemCategoryDetails.SalesInvoiceId = 0;
        this.socreationObj.createSalesInvoice(itemCategoryDetails, this.uploadedFiles)
          .subscribe((salesInvoiceId: number) => {
            this.hideText = true;
            this.hideInput = false;
            this.uploadedFiles.length = 0;
            this.uploadedFiles = [];
            this.recordInEditMode = -1;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SavedSuccessFully,
              MessageType: MessageTypes.Success
            });

            //this.getSalesInvoice(salesInvoiceId);
            this.readListView.emit(salesInvoiceId);
            this.showGridErrorMessage = false;
            // this.hideFullScreen();
          }, (data: HttpErrorResponse) => {
            if (data.error.Message == ResponseStatusTypes.Duplicate) {
              this.displayDuplicateErrorMessage();
            }
          });
      }
      else {
        itemCategoryDetails.SalesInvoiceId = this.selectedSODetails.SalesInvoiceId;
        itemCategoryDetails.SalesInvoiceItemsToDelete = this.deletedSalesOrderItems;
        itemCategoryDetails.Attachments = this.selectedSODetails.Attachments.filter(i => i.IsDelete == true);

        this.socreationObj.updateSalesInvoice(itemCategoryDetails, this.uploadedFiles)
          .subscribe((response) => {
            this.hideText = true;
            this.hideInput = false;
            this.uploadedFiles.length = 0;
            this.uploadedFiles = [];
            this.deletedSalesOrderItems = [];
            this.deletedSalesOrderItems.length = 0;
            this.recordInEditMode = -1;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.UpdatedSuccessFully,
              MessageType: MessageTypes.Success
            });
            //this.getSalesInvoice(itemCategoryDetails.SalesInvoiceId);
            this.readListView.emit(itemCategoryDetails.SalesInvoiceId);
            this.showGridErrorMessage = false;
            // this.hideFullScreen();
          }, (data: HttpErrorResponse) => {
            if (data.error.Message == ResponseStatusTypes.Duplicate) {
              this.displayDuplicateErrorMessage();
            }
          });
      }
    }
    else {
      Object.keys(this.salesOrderForm.controls).forEach((key: string) => {
        if (this.salesOrderForm.controls[key].status == "INVALID" && this.salesOrderForm.controls[key].touched == false) {
          this.salesOrderForm.controls[key].markAsTouched();
        }
      });
      let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
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

  cancelRecord() {
    this.salesOrderForm.reset();
    this.salesOrderForm.setErrors(null);
    this.cancelChanges.emit(true);
    this.hideInput = false;
    this.hideText = true;
    this.uploadedFiles.length = 0;
    this.uploadedFiles = [];
    this.showGridErrorMessage = false;
    if (this.type.toLowerCase() === "invoice") {
      this.sharedServiceObj.hideAppBar(false);//showing the app bar..
    }
  }

  deleteRecord() {
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    if (this.type != "invoice") {
      let recordId = this.selectedSODetails.SalesOrderId;
      this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header: Messages.DeletePopupHeader,
        accept: () => {
          this.socreationObj.deleteSalesOrder(recordId, userDetails.UserID).subscribe((data) => {
            this.readListView.emit(0);
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success
            });
          });
        },
        reject: () => {
        }
      });
    }
    else {
      let recordId = this.selectedSODetails.SalesInvoiceId;
      this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header: Messages.DeletePopupHeader,
        accept: () => {
          this.socreationObj.deleteSalesInvoice(recordId, userDetails.UserID).subscribe((data) => {
            this.readListView.emit(0);
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success
            });
          });
        },
        reject: () => {
        }
      });

    }
  }

  editRecord() {
    //setting this variable to false so as to show the category details in edit mod
    this.hideInput = true;
    this.hideText = false;

    let id = this.selectedSalesInvoiceId;
    //resetting the item category form.
    this.clearForm();
    //setting Customer Address
    let billingAddress: string = "";
    billingAddress += this.selectedSODetails.Customer.BillingAddress;
    billingAddress += '\n' + this.selectedSODetails.Customer.BillingCity;
    billingAddress += '\n' + this.selectedSODetails.Customer.BillingTelephone;
    billingAddress += '\n' + this.selectedSODetails.Customer.BillingCountry;

    let unitNumber = "";
    if (this.selectedSODetails.Ticket != null) {
      unitNumber = this.selectedSODetails.Ticket.UnitNumber
    }

    if (this.type != "invoice") {
      this.hideText = false;
      this.hideInput = true;
      this.salesOrderForm.get('Ticket').disable();
      this.addGridItem(this.selectedSODetails.SalesOrderItems.length);
      this.salesOrderForm.patchValue(this.selectedSODetails);
      this.salesOrderForm.get('ExpectedDeliveryDate').setValue(new Date(this.selectedSODetails.ExpectedDeliveryDate));
      this.salesOrderForm.get('CustomerCategoryId').setValue(this.selectedSODetails.Customer.CustomerCategoryId.toLocaleString());

      this.salesOrderForm.patchValue({
        "CustomerAddress": billingAddress,
        'ShippingFax': this.selectedSODetails.Customer.ShippingFax,
        'UnitNumber': unitNumber
      });

      this.onCustomerChange();
      this.calculateTotalPrice();
      //this.showFullScreen();
    }
    else {
      if (this.selectedSODetails.SalesOrderItems != undefined) {
        this.addGridItem(this.selectedSODetails.SalesOrderItems.length);
      }

      this.salesOrderForm.patchValue(this.selectedSODetails);
      this.salesOrderForm.get('CustomerCategoryId').setValue(this.selectedSODetails.Customer.CustomerCategoryId.toLocaleString());
      this.salesOrderForm.patchValue({
        "CustomerAddress": billingAddress,
        'ShippingFax': this.selectedSODetails.Customer.ShippingFax,
        'UnitNumber': unitNumber
      });

      this.onCustomerChange();
      this.calculateTotalPrice();
      //this.showFullScreen();
    }
  }

  matselect(event) {
    if (event.checked == true) {
      this.slideactive = true;
    }
    else {
      this.slideactive = false;
    }
  }

  onCurrencyChange() {
    let currencyId = this.salesOrderForm.get('CurrencyId').value;
    this.selectedSODetails.CurrencySymbol = this.currencies.find(i => i.Id == currencyId).Symbol;
  }
  //to get the sub totalprice..
  getSubTotal() {
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];

    if (itemGroupControl != undefined) {
      let subTotal = 0;
      itemGroupControl.controls.forEach(data => {
        subTotal = subTotal + ((data.get('ItemQty').value * data.get('Unitprice').value) + data.get('TotalTax').value - data.get('Discount').value);
      });
      return subTotal;
    }
  }

  //getting the total tax..
  getTotalTax(taxId: number) {
    if (taxId == null || taxId == 0) {
      return 0;
    }
    let taxRate = this.taxTypes.find(j => j.TaxId == taxId).TaxAmount;
    let totalTax = (this.getSubTotal() * taxRate) / 100;
    return totalTax;
  }

  setTaxAmount(taxType: number, rowIndex: number) {
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    let taxAmount = 0;
    if (this.taxTypes.find(i => i.TaxId == taxType) != undefined) {
      taxAmount = this.taxTypes.find(i => i.TaxId == taxType).TaxAmount;
    }
    itemGroupControl.controls[rowIndex].get('TaxAmount').setValue(taxAmount);
    this.calculateTotalPrice();
  }

  calculateTotalTax() {
    let itemGroupControl = <FormArray>this.salesOrderForm.controls['SalesOrderItems'];
    if (itemGroupControl != undefined) {
      if (this.type != "invoice") {
        if (this.salesOrderForm.get('IsGstBeforeDiscount').value == true) {
          itemGroupControl.controls.forEach(data => {
            let itemTotal = (data.get('ItemQty').value * data.get('Unitprice').value) * (data.get('TaxAmount').value) / 100;
            data.get('TotalTax').setValue(itemTotal);
          });
        }
        else {
          itemGroupControl.controls.forEach(data => {
            let itemTotal = ((data.get('ItemQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
            data.get('TotalTax').setValue(itemTotal);
          });
        }
      }
      else {
        itemGroupControl.controls.forEach(data => {
          let itemTotal = ((data.get('ItemQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
          data.get('TotalTax').setValue(itemTotal);
        });

      }
    }
  }

  //to get total price..
  calculateTotalPrice() {
    this.calculateTotalTax();
    let subTotal = this.getSubTotal();
    this.salesOrderForm.get('SubTotal').setValue(subTotal);
    let discount = this.salesOrderForm.get('Discount').value;
    let shippingCharges = this.salesOrderForm.get('ShippingCharges').value;
    let OtherCharges = this.salesOrderForm.get('OtherCharges').value;
    let totalTax = 0;
    if (this.type != "invoice") {
      let totalTax = this.getTotalTax(this.salesOrderForm.get('TaxId').value);
      this.salesOrderForm.get('TotalTax').setValue(totalTax);
    }

    let totalPrice = (subTotal - discount) + totalTax + shippingCharges + OtherCharges;
    this.salesOrderForm.get('TotalAmount').setValue(totalPrice);
  }

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

  attachmentDelete(attachmentIndex: number) {
    this.confirmationServiceObj.confirm({
      message: Messages.AttachmentDeleteConfirmation,
      header: Messages.DeletePopupHeader,
      accept: () => {
        let attachmentRecord = this.selectedSODetails.Attachments[attachmentIndex];
        attachmentRecord.IsDelete = true;
        this.selectedSODetails.Attachments = this.selectedSODetails.Attachments.filter((obj, index) => index > -1);
      },
      reject: () => {
      }
    });
  }

  //this method will be called on date picker focus event..
  onDatePickerFocus(element: NgbInputDatepicker, event: any) {
    if (!element.isOpen()) {
      element.open();
    }
  }

  onSearchInputChange(event: any) {
    if (this.type != "invoice") {
      if (this.salesOrderSearchKey != "") {
        {
          this.getAllSearchSalesOrders(this.salesOrderSearchKey, 0);
        }
      }
      else {
        this.readListView.emit(0);
      }
    }
    else {
      if (this.salesInvoiceSearchKey != "") {
        this.getAllSearchSalesInvoices(this.salesInvoiceSearchKey, 0);
      }
      else {
        this.readListView.emit(0);
      }
    }
  }

  onPaymentTermChange(event: any) {
    let paymentTermId = this.salesOrderForm.get('PaymentTermId').value;
    let description = "";
    if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
      description = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description
    }
    this.salesOrderForm.get('PaymentTerms').setValue(description);
  }

  onDeliveryTermChange() {
    let deliveryTermId = this.salesOrderForm.get('DeliveryTermId').value;
    let description = "";
    if (this.paymentTerms.find(i => i.PaymentTermsId == deliveryTermId) != undefined) {
      description = this.deliveryTerms.find(i => i.DeliveryTermsId == deliveryTermId).Description;
    }
    this.salesOrderForm.get('DeliveryTerm').setValue(description);
  }

  onSearchClick() {
    if (this.type != "invoice") {
      if (this.salesOrderSearchKey != "") {
        this.getAllSearchSalesOrders(this.salesOrderSearchKey, 0);
      }
      else {
        this.readListView.emit(0);
      }
    }
    else {
      if (this.salesInvoiceSearchKey != "") {
        if (this.salesInvoiceSearchKey.length >= 3) {
          this.getAllSearchSalesInvoices(this.salesInvoiceSearchKey, 0);
        }
      }
      else {
        this.readListView.emit(0);
      }
    }
  }

  update(status: number) {
    let remarks = this.salesOrderForm.get('Remarks').value;
    if (status == WorkFlowStatus.AskedForClarification || status == WorkFlowStatus.WaitingForApproval) {
      if (remarks.trim() == "" || remarks.trim() == null) {
        this.salesOrderForm.get('Remarks').setErrors({ "required": true });
        return;
      }
    }
    let statusObj: SoApprovalUpdateStatus = {
      StatusId: status,
      Remarks: remarks,
      ProcessId: WorkFlowProcess.SalesOrder,
      SoCode: this.selectedSODetails.DraftCode,
      ApproverUserId: this.selectedSODetails.CurrentApproverUserId,
      CompanyId:this.selectedSODetails.CompanyId
    };
    this.updateStatus.emit(statusObj);
  }

  restrictMinus(e: any) {
    restrictMinus(e);
  }

  avoidNegativeValues(event) {
    if (event.target.value < 0) {
      return;
    }
  }
}
