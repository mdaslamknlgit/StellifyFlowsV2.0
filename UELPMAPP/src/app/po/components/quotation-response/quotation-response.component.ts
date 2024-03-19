import { Component, OnInit, ViewChild,Renderer2,ElementRef } from '@angular/core';
import { FormGroup, Validators,FormBuilder,FormArray } from '@angular/forms';
import { CostOfService,PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderDetails,PurchaseOrderTypes } from "../../models/quotation-request.model";
import { PurchaseOrderRequestService } from "../../services/purchase-order-request.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig,Suppliers,ItemMaster, MessageTypes, UserDetails } from "../../../shared/models/shared.model";
import { NgbDateAdapter,NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged,switchMap,catchError} from 'rxjs/operators';
import { Observable,of } from 'rxjs';
import { GridOperations,ResponseStatusTypes,Messages,Currency,PaymentTerms } from "../../../shared/models/shared.model";
import { ConfirmationService,SortEvent } from "primeng/components/common/api";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { DisplayDateFormatPipe } from '../../../shared/pipes/display-date-format.pipe';
import { ValidateFileType,FullScreen } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Supplier } from '../../models/supplier';
import { POCreationService } from '../../services/po-creation.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';


@Component({
  selector: 'app-quotation-response',
  templateUrl: './quotation-response.component.html',
  styleUrls: ['./quotation-response.component.css'],
  providers:[POCreationService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class QuotationResponseComponent implements OnInit {
  purchaseOrdersList:Array<PurchaseOrderList>=[];
    purchaseOrderPagerConfig:PagerConfig;
    purchaseOrderItemsGridConfig:PagerConfig;
    purchaseOrderForm: FormGroup;
    selectedPODetails:PurchaseOrderDetails;
    purchaseOrderTypes:Array<PurchaseOrderTypes>=[];
    suppliers:Suppliers[]=[];
    currencies:Currency[]=[];
    departments:Location[]=[];
    //this array will hold the list of columns to display in the grid..
    gridColumns:Array<{field:string,header:string}>= [];
     //this variable will hold the record in edit mode...
    recordInEditMode:number;
    //this will tell whether we are using add/edit/delete mode the grid..
    operation:string;
    costOfServiceType:CostOfService[]=[];
    hidetext?: boolean=null;
    hideinput?: boolean=null;
    uploadedFiles:Array<File>=[];
    leftsection:boolean=false;
    rightsection:boolean=false;
    slideactive:boolean=false;
    showGridErrorMessage:boolean=false;
    scrollbarOptions:any;
   // @ViewChild('deliveryDatePicker') deliveryDatePickerElementRef:NgbInputDatepicker;
    purchaseOrderSearchKey:string;
    apiEndPoint:string;
    hideLeftPanel:boolean=false;
    linesToAdd:number=2;
    paymentTerms:PaymentTerms[]=[];
    measurementUnits:MeasurementUnit[]=[];
    deletedPurchaseOrderItems:Array<number> =[];
    @ViewChild('instructions') instructionsRef:ElementRef;
    @ViewChild('justifications') justificationsRef:ElementRef;
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    companyId:number;
    public innerWidth: any;
    constructor(private purchaseOrderRequestObj:POCreationService,
                private formBuilderObj:FormBuilder,
                private sharedServiceObj:SharedService,
                private confirmationServiceObj:ConfirmationService,
                private reqDateFormatPipe:RequestDateFormatPipe,
                public sessionService: SessionStorageService,
                private displayDateFormatPipe:DisplayDateFormatPipe,
                private rendererObj:Renderer2,
                private elementRefObj:ElementRef) {

      this.gridColumns = [
              { field: 'Sno', header: 'S.no.' },
            //  { field: 'AccountCode', header: 'Account Code' },
              { field: 'Name', header: 'Item' },
              { field: 'ItemDescription', header: 'Description' },
              { field: 'MeasurementUnitID', header: 'UOM' },
              { field: 'ItemQty', header: 'Qty' },
              { field: 'Unitprice', header: 'Price' },
              { field: 'ItemTotal', header: 'Total' }
      ];  

      this.apiEndPoint = environment.apiEndpoint;

    }

    @ViewChild('rightPanel') rightPanelRef;
  
    ngOnInit() { 

      this.purchaseOrderPagerConfig = new PagerConfig();
      this.purchaseOrderPagerConfig.RecordsToFetch = 100;

      this.purchaseOrderItemsGridConfig = new PagerConfig();
      this.purchaseOrderItemsGridConfig.RecordsToFetch = 20;

      this.selectedPODetails = new PurchaseOrderDetails();
      this.purchaseOrderForm = this.formBuilderObj.group({
        'SupplierTypeID': [1,{ validators: [Validators.required]}],
        'POTypeId':[0, [Validators.required]],
        'LocationId':[0,[Validators.required]],
        'Supplier': [null],
        'ExpectedDeliveryDate': [null],
        'VendorReferences': [""],
        'CurrencyId':[0,[Validators.required]],
        'SupplierAddress':[{ value:"",disabled:true }],
        'DeliveryAddress':[{ value:""}],
        'ShippingFax':[{ value:"",disabled:true }],
        'CostOfServiceId':[0,Validators.required],
        'Instructions':[""],
        'Justifications':[""],
        'PurchaseOrderItems':this.formBuilderObj.array([]),
        'Discount':[0],
        'TaxRate':[0],
        'TotalTax':[0],
        'OtherCharges':[0],
        'ShippingCharges':[0], 
        'SubTotal':[0],
        'TotalAmount':[0],
        'IsGstRequired':[false],
        'PaymentTermId':[0],
        'PaymentTerms':[{value:"",disabled:true}],
        'DeliveryTerm':[""],
        "SupplierEmail":["",[Validators.required]]
      });
      //getting the purchase order types.
      this.purchaseOrderRequestObj.getPurchaseOrderTypes()
          .subscribe((data:PurchaseOrderTypes[])=>{
              this.purchaseOrderTypes = data;
           });
      //getting the list of cost of service types.
      this.purchaseOrderRequestObj.getCostOfServiceTypes()
          .subscribe((data:CostOfService[])=>{
              this.costOfServiceType = data;
            });
       this.purchaseOrderRequestObj.getDepartments()
            .subscribe((data:Location[])=>{
                this.departments = data;
            });
        this.sharedServiceObj.getCurrencies()
            .subscribe((data:Currency[])=>{
                this.currencies =  data;
            });
       this.operation = GridOperations.Display;

       this.getPaymentTerms();
       //getting the purchase orders list..
       this.getPurchaseOrders(0);

       this.getMeasurementUnits();
    }
     //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    supplierSearch = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term =>
            this.sharedServiceObj.getSuppliers({
                searchKey:term,
                supplierTypeId:this.purchaseOrderForm.get('SupplierTypeID').value
            }).pipe(
            catchError(() => {
                return of([]);
            }))
       )
    );
    getPaymentTerms()
    {
        this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId())
        .subscribe((data:PaymentTerms[])=>{
            this.paymentTerms =  data;
        });
    }
    getMeasurementUnits()
    {
        this.sharedServiceObj.getUOMList()
        .subscribe((data:MeasurementUnit[])=>{
            this.measurementUnits =  data;
        });
    }
    supplierTypeChange(event)
    {
        let purchaseOrderTypeId = event.target.value;
        this.purchaseOrderForm.get('Supplier').setValue(null);
    }
    //to get  the purchase orders..
    getPurchaseOrders(purchaseOrderIdToBeSelected:number)
    {
      this.uploadedFiles.length =0;
      this.uploadedFiles = [];
      //getting the list of purchase orders...
      let purchaseOrderDisplayInput = {
        Skip : 0,
        Take : this.purchaseOrderPagerConfig.RecordsToFetch
      };
      this.purchaseOrderRequestObj.getPurchaseOrders(purchaseOrderDisplayInput)
          .subscribe((data:PurchaseOrderDisplayResult)=>{
              this.purchaseOrdersList = data.PurchaseOrders;
              this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;

              if(this.purchaseOrdersList.length>0)
              {
                if(purchaseOrderIdToBeSelected==0)
                {
                    this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId);
                }
                else
                {
                    this.onRecordSelection(purchaseOrderIdToBeSelected);
                }
              }
              else
              {
                 this.addRecord();
              }             
          },(error)=>{

              this.hidetext = false;
              this.hideinput = true;
              //remove this code after demo...
              this.purchaseOrdersList =[{ 
                PurchaseOrderCode:"QR-344",
                PurchaseOrderId:1,
                SupplierName:"Tata Motors"
              },
              { 
                PurchaseOrderCode:"QR-378",
                PurchaseOrderId:2,
                SupplierName:"Tata Motors"
              },
              { 
                PurchaseOrderCode:"QR-398",
                PurchaseOrderId:3,
                SupplierName:"Tata Motors"
              }];
          });
    }
    //to get list of purchase orders..
    getAllSearchPurchaseOrder(searchKey:string,purchaseOrderIdToBeSelected:number)
    {
        this.uploadedFiles.length =0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
          Skip : 0,
          Take : this.purchaseOrderPagerConfig.RecordsToFetch,
          Search:searchKey

        };
        this.purchaseOrderRequestObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
        .subscribe((data:PurchaseOrderDisplayResult)=>{
            this.purchaseOrdersList = data.PurchaseOrders;
            this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;

            if(this.purchaseOrdersList.length>0)
            {
              if(purchaseOrderIdToBeSelected==0)
              {
                  this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId);
              }
              else
              {
                  this.onRecordSelection(purchaseOrderIdToBeSelected);
              }
            }
            else
            {
               this.addRecord();
            }             
        });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId:number)
    {   
        this.purchaseOrderRequestObj.getPurchaseOrderDetails(purchaseOrderId, this.sessionService.getCompanyId())
            .subscribe((data:PurchaseOrderDetails)=>{

                this.selectedPODetails =  data;
                this.operation = GridOperations.Display;
                this.purchaseOrderForm.patchValue(data);
                this.hidetext=true;
                this.hideinput=false;
            },(error)=>{

              this.hidetext = true;
              this.hideinput = false;
              this.selectedPODetails ={
                RequestedBy:1,
                RequestedByUserName:"UEL User",
                IsGstRequired:true,
                Instructions:"Instructions",
                CurrencyId:1,
                LocationId:1,
                PaymentTermId:1,
                POTypeId:1,
                PaymentTerms:"Payment Terms",
                PurchaseOrderCode:"QR code 12",
                SubTotal:21000,
                PurchaseOrderId:1,
                PurchaseOrderItems:[{
                  IsModified:false,
                  Item:{
                    ItemMasterId:1,
                    ItemName:"Spanners",
                    MeasurementUnitID:1,
                    MeasurementUnitCode:"units",
                    MeasurementUnitName:"Units",
                    Description:"Item Descripiton "
                  },
                  ItemDescription:"Item Description",
                  ItemQty:30,
                  MeasurementUnitID:1,
                  PurchaseOrderItemId:1,
                  Unitprice:500        
                },{
                  IsModified:false,
                  Item:{
                    ItemMasterId:2,
                    ItemName:"Keyboards",
                    MeasurementUnitID:1,
                    MeasurementUnitCode:"units",
                    MeasurementUnitName:"Units",
                    Description:"Item Descripiton "
                  },
                  ItemDescription:"Item Description",
                  ItemQty:10,
                  MeasurementUnitID:1,
                  PurchaseOrderItemId:1,
                  Unitprice:60    
                }],
                PurchaseOrderItemsToDelete:[],
                PurchaseOrderStatusId:1,
                WorkFlowStatusId:1,
                Justifications:"Justifications",
                DeliveryAddress:"Delivery Address",
                DeliveryTerm:"Delivery Terms",
                Designation:"Designation",
                Discount:0,
                AttachmentsDelete:[],
                TaxRate:5,
                TotalAmount:2100,
                TotalTax:105,
                PurchaseOrderStatusText:"",
                PurchaseOrderType:"",
                LocationName:"UEL Department",
                Category:"UEL Supplier",
                CostofService:"",
                CostOfService:"",
                ExpectedDeliveryDate:new Date(),
                VendorReferences:"",
                CurrencyCode:"USD",
                CreatedBy:1,
                CurrencySymbol:"$",
                CreatedDate:new Date(),
                OtherCharges:50,
                ShippingCharges:100,
                Attachments:[],
                Supplier:{
                  SupplierId:1,
                  SupplierName:"UEl Supplier",
                  PreviousSupplierName:"",
                  SupplierTypeID:1,
                  SupplierCode:"",
                  BillingAddress2:"Shipping Address",
                  BillingFax:"344-533-433",
                  BillingAddress1:"Billing Address",
                  SubCodeCount:0,
                  WorkFlowStatus:"",
                  IsFreezed:false,
                  SupplierAddress:"Supplier Address"
                },
              };
              
            this.calculateTotalPrice();
          });

    }
    /**
     * this method will be called on the supplier dropdown change event.
     */
    onSupplierChange(event?:any)
    {
       let supplierDetails:Supplier;
       if(event!=null&&event!=undefined){
         supplierDetails = event.item;
       }
       else{
         supplierDetails = this.purchaseOrderForm.get('Supplier').value;
       }
       if(supplierDetails!=undefined)
       {
            this.purchaseOrderForm.patchValue({
                "SupplierAddress":supplierDetails.BillingAddress1,
                "DeliveryAddress":supplierDetails.BillingAddress1,
                "ShippingFax":supplierDetails.BillingFax
            });
       }
       else
       {
            this.purchaseOrderForm.patchValue({
                "SupplierAddress":"",
                "DeliveryAddress":"",
                "ShippingFax":""
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
                    searchKey:term,
                    CompanyId:this.companyId,
                    LocationID:null
                }).pipe(
                catchError(() => {

                    return of([]);
                }))
            )
    );
    /**
     * this method will be called on "item master" autocomplete value selection.
     */
    itemMasterSelection(eventData:any,index:number)
    {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        console.log(eventData.item);
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription:eventData.item.Description,
            MeasurementUnitID:eventData.item.MeasurementUnitID
        });        
    }

    initGridRows() {
        return this.formBuilderObj.group({
              'PurchaseOrderItemId':0,
              'ItemDescription':[""],
              'MeasurementUnitID':[0],
              'Item':[null,Validators.required],
              "ItemQty":[0,[Validators.required,Validators.min(1)]],
              "Unitprice":[0,[Validators.min(1)]],
              "IsModified":false 
        });
    }
    //adding row to the grid..
    addGridItem(noOfLines:number)
    {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        for(let i=0;i<noOfLines;i++)
        {
            itemGroupControl.push(this.initGridRows());
        }
    }
    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex:number)
    {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('PurchaseOrderItemId').value;
        if(purchaseOrderItemId > 0)
        {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }
        itemGroupControl.removeAt(rowIndex);
        this.calculateTotalPrice();
    }

    /**
     * to hide the category details and show in add mode..
     */
    addRecord()
    {
        //setting this variable to false so as to show the purchase order details in edit mode
        this.hidetext=false;
        this.hideinput=true;
        this.selectedPODetails = new PurchaseOrderDetails();
        //resetting the purchase order form..
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.setErrors(null);
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0;
        this.purchaseOrderForm.patchValue({
            SupplierTypeID:"1",
            IsGstRequired:false
        });
        this.showFullScreen();
    }
    showFullScreen()
    {
        this.innerWidth = window.innerWidth;       
 
 if(this.innerWidth > 1000){  
 
        FullScreen(this.rightPanelRef.nativeElement);
 }
        //  this.hideLeftPanel = true;
        // this.sharedServiceObj.hideAppBar(true);//hiding the app bar..
    }
    hideFullScreen()
    {
       // this.hideLeftPanel = false;
       // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
    }
    /**
     * to save the given purchase order details
     */
    saveRecord()
    {
        this.showGridErrorMessage = false;
        let status:boolean=true;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if(itemGroupControl==undefined||itemGroupControl.controls.length==0)
        {
            this.showGridErrorMessage = true;
            return;
        }
        let purchaseOrderFormStatus = this.purchaseOrderForm.status;
        if(purchaseOrderFormStatus!="INVALID")
        {
          //getting the purchase order form details...
          let itemCategoryDetails:PurchaseOrderDetails = this.purchaseOrderForm.value; 
          itemCategoryDetails["ExpectedDeliveryDate"] = this.reqDateFormatPipe.transform(itemCategoryDetails.ExpectedDeliveryDate);  
          if(itemCategoryDetails.Discount==null)
          {
            itemCategoryDetails.Discount=0;
          }
          if(itemCategoryDetails.ShippingCharges==null)
          {
            itemCategoryDetails.ShippingCharges=0;
          }
          if(itemCategoryDetails.OtherCharges==null)
          {
            itemCategoryDetails.OtherCharges=0;
          }
          if(itemCategoryDetails.TotalAmount==null)
          {
            itemCategoryDetails.TotalAmount=0;
          }
          if(itemCategoryDetails.TaxRate==null)
          {
            itemCategoryDetails.TaxRate=0;
          }
          if(itemCategoryDetails.TotalTax==null)
          {
            itemCategoryDetails.TotalTax=0;
          }
          itemCategoryDetails.PurchaseOrderItems.forEach(i=>{
            if(i.PurchaseOrderItemId>0)
            {
                let previousRecord = this.selectedPODetails.PurchaseOrderItems.find(j=>j.PurchaseOrderItemId==i.PurchaseOrderItemId);

                if(i.Item.ItemMasterId!=previousRecord.Item.ItemMasterId|| 
                    i.ItemDescription!=previousRecord.ItemDescription||
                    i.ItemQty!=previousRecord.ItemQty||
                    i.Unitprice!=previousRecord.Unitprice||
                    i.MeasurementUnitID!=previousRecord.MeasurementUnitID)
                    {
                        i.IsModified=true;
                    }
            }
            else
            {
                i.PurchaseOrderItemId=0;
            }
          });
          itemCategoryDetails.PurchaseOrderItems = itemCategoryDetails.PurchaseOrderItems.filter(i=>i.PurchaseOrderItemId==0||i.PurchaseOrderItemId==null||i.IsModified==true);
          if(this.selectedPODetails.PurchaseOrderId==0||this.selectedPODetails.PurchaseOrderId==null)
          {
              this.purchaseOrderRequestObj.createPurchaseOrder(itemCategoryDetails,this.uploadedFiles,this.uploadedFiles)
                .subscribe(( response: { Status:string,Value:any })=>{
                    //if status is success then we will insert a new record into the array...
                    if(response.Status == ResponseStatusTypes.Success)
                    {
                        this.hidetext=true;
                        this.hideinput=false;
                        this.uploadedFiles.length =0;
                        this.uploadedFiles = [];
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage:true,
                            Message:Messages.SavedSuccessFully,
                            MessageType:MessageTypes.Success
                        });
                        this.getPurchaseOrders(response.Value);
                        this.showGridErrorMessage = false;
                        this.hideFullScreen();
                    }
                });
          }
          else 
          {
             itemCategoryDetails.PurchaseOrderId = this.selectedPODetails.PurchaseOrderId;
             itemCategoryDetails.PurchaseOrderItemsToDelete = this.deletedPurchaseOrderItems;
             itemCategoryDetails.Attachments =  this.selectedPODetails.Attachments.filter(i=>i.IsDelete==true);
             this.purchaseOrderRequestObj.updatePurchaseOrder(itemCategoryDetails,this.uploadedFiles,this.uploadedFiles)
                 .subscribe((response:{ Status:string,Value:any })=>{
                    //if status is success then we will insert a new record into the array...
                    if(response.Status == ResponseStatusTypes.Success)
                    {   this.hidetext=true;
                        this.hideinput=false;
                        this.uploadedFiles.length =0;
                        this.uploadedFiles = [];
                        this.deletedPurchaseOrderItems =[];
                        this.deletedPurchaseOrderItems.length=0;
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage:true,
                            Message:Messages.UpdatedSuccessFully,
                            MessageType:MessageTypes.Success
                        });
                        this.getPurchaseOrders(itemCategoryDetails.PurchaseOrderId);
                        this.showGridErrorMessage = false;
                        this.hideFullScreen();
                    }
                 });
            }
        }
        else
        {
            Object.keys(this.purchaseOrderForm.controls).forEach((key:string) => {
                if(this.purchaseOrderForm.controls[key].status=="INVALID" && this.purchaseOrderForm.controls[key].touched==false)
                {
                   this.purchaseOrderForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
            itemGroupControl.controls.forEach(controlObj => {  
                console.log(controlObj);
                Object.keys(controlObj["controls"]).forEach((key:string) => {
                    console.log(key);
                    let itemGroupControl = controlObj.get(key);
                    if(itemGroupControl.status=="INVALID" && itemGroupControl.touched==false)
                    {
                        itemGroupControl.markAsTouched();
                    }
                }); 
            });  
        }
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord()
    { 
        //setting this variable to true so as to show the purchase details
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.setErrors(null);
        if(this.purchaseOrdersList.length > 0 && this.selectedPODetails!=undefined)
        {
            this.onRecordSelection(this.selectedPODetails.PurchaseOrderId);
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
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
        this.hideFullScreen();
    }
    /**
     * to delete the selected record...
     */
    deleteRecord()
    {
      let recordId = this.selectedPODetails.PurchaseOrderId;
      let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
      this.confirmationServiceObj.confirm({
          message: Messages.ProceedDelete,
          header:Messages.DeletePopupHeader,
          accept: () => {     
            this.purchaseOrderRequestObj.deletePurchaseOrder(recordId,userDetails.UserID).subscribe((data)=>{
                  this.sharedServiceObj.showMessage({
                      ShowMessage:true,
                      Message:Messages.DeletedSuccessFully,
                      MessageType:MessageTypes.Success
                  });
                  this.getPurchaseOrders(0);
            });
          },
          reject: () => {
          }
      });
    }
    /**
     * to show the purchase order details in edit mode....
     */ 
    editRecord()
    {
        //setting this variable to false so as to show the category details in edit mode
        this.hideinput = true;
        this.hidetext = false;
        //resetting the item category form.
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.get('PurchaseOrderItems').reset();
        this.purchaseOrderForm.setErrors(null);
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0;
        this.addGridItem(this.selectedPODetails.PurchaseOrderItems.length);
        this.purchaseOrderForm.patchValue(this.selectedPODetails);
        this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date(this.selectedPODetails.ExpectedDeliveryDate));
        this.purchaseOrderForm.get('SupplierTypeID').setValue(this.selectedPODetails.Supplier.SupplierTypeID==1?"1":"2");
        this.onSupplierChange();
        this.calculateTotalPrice();
        this.showFullScreen();
    }
    splite(){ 
        this.leftsection= !this.leftsection;
        this.rightsection= !this.rightsection;
    }
    matselect(event){ 
      if(event.checked==true)
      {
        this.slideactive=true;  
      }
      else
      {
        this.slideactive=false;   
      }
    }
    /**
     * this method will be called on currency change event...
     */
    onCurrencyChange()
    {
        let currencyId = this.purchaseOrderForm.get('CurrencyId').value;
        this.selectedPODetails.CurrencySymbol =  this.currencies.find(i=>i.Id==currencyId).Symbol;
    }
    //to get the sub totalprice..
    getSubTotal()
    {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if(itemGroupControl!=undefined)
        {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data=>{
                subTotal = subTotal + data.get('ItemQty').value * data.get('Unitprice').value;
            });
            return subTotal;
        }
    }
    //getting the total tax..
    getTotalTax(taxRate:number)
    {
       let totalTax = (this.getSubTotal()*taxRate)/100;
       return totalTax;
    }
    //to get total price..
    calculateTotalPrice()
    {
        let subTotal = this.getSubTotal();
        this.purchaseOrderForm.get('SubTotal').setValue(subTotal);
        let discount = this.purchaseOrderForm.get('Discount').value;
        let shippingCharges = this.purchaseOrderForm.get('ShippingCharges').value;
        let OtherCharges = this.purchaseOrderForm.get('OtherCharges').value;
        let totalTax = this.getTotalTax(this.purchaseOrderForm.get('TaxRate').value);
        this.purchaseOrderForm.get('TotalTax').setValue(totalTax);
        let totalPrice = (subTotal-discount)+totalTax+shippingCharges+OtherCharges;
        this.purchaseOrderForm.get('TotalAmount').setValue(totalPrice);
    }
    /**
     * this method will be called on file upload change event...
     */
    onFileUploadChange(event:any)
    {
        let files:FileList = event.target.files;
        for(let i=0;i<files.length;i++)
        {
            let fileItem = files.item(i);
            if(ValidateFileType(fileItem.name))
            {
              this.uploadedFiles.push(fileItem);
            }
            else
            {
                event.preventDefault();
                break;
            }
       }
    }
    /**
     * this method will be called on file close icon click event..
     */
    onFileClose(fileIndex:number)
    {
        this.uploadedFiles = this.uploadedFiles.filter((file,index)=>index!=fileIndex);
    }
    //for custome sort
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1;
            let value2;
            if(event.field=="Name")
            {
                value1 = data1["Item"]["ItemName"];
                value2 = data2["Item"]["ItemName"];
            }
            else if(event.field=="MeasurementUnitID")
            {
                value1 = data1["Item"]["MeasurementUnitCode"];
                value2 = data2["Item"]["MeasurementUnitCode"];
            }
            else if(event.field=="ItemTotal")
            {
                value1 = data1["ItemQty"]*data1["Unitprice"];
                value2 = data2["ItemQty"]*data2["Unitprice"];
            }
            else
            {
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
    attachmentDelete(attachmentIndex:number)
    {

        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header:Messages.DeletePopupHeader,
            accept: () => {     
                let attachmentRecord = this.selectedPODetails.Attachments[attachmentIndex];
                attachmentRecord.IsDelete = true;
                this.selectedPODetails.Attachments = this.selectedPODetails.Attachments.filter(i=>i.IsDelete!=true);
            },
            reject: () => {
            }
        });

    }
    //this method will be called on date picker focus event..
    onDatePickerFocus(element:NgbInputDatepicker,event:any)
    {
        console.log("focus");
        if(!element.isOpen())
        {
            element.open();
        }
    }
    //
    onSearchInputChange(event: any) {
        if (this.purchaseOrderSearchKey != "") {
          if (this.purchaseOrderSearchKey.length >= 3) {
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey,0);
          }
        }
        else {
          this.getPurchaseOrders(0);
        }
    }
    onPaymentTermChange(event: any)
    {
        let paymentTermId = this.purchaseOrderForm.get('PaymentTermId').value;
        this.purchaseOrderForm.get('PaymentTerms').setValue(this.paymentTerms.find(i=>i.PaymentTermsId==paymentTermId).Description);
    }
    onSearchClick()
    {
        if (this.purchaseOrderSearchKey != "") {
            if (this.purchaseOrderSearchKey.length >= 3) {
              this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey,0);
            }
        }
        else {
            this.getPurchaseOrders(0);
        }
    }
}
