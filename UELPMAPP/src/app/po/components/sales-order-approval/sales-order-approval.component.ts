import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { CostOfService,PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderDetails,PurchaseOrderTypes } from "../../models/sales-order.model";
import { SOCreationService } from "../../services/so-creation.service";
import { PagerConfig,Suppliers } from "../../../shared/models/shared.model";
import { NgbDateAdapter,NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { GridOperations,Messages,Currency,PaymentTerms } from "../../../shared/models/shared.model";
import { ConfirmationService,SortEvent } from "primeng/components/common/api";
import { ValidateFileType,FullScreen } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';

@Component({
  selector: 'app-sales-order-creation',
  templateUrl: './sales-order-approval.component.html',
  styleUrls: ['./sales-order-approval.component.css'],
  providers:[SOCreationService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class SalesOrderApprovalComponent implements OnInit {

    purchaseOrdersList:Array<PurchaseOrderList>=[];
    purchaseOrderPagerConfig:PagerConfig;
    purchaseOrderItemsGridConfig:PagerConfig;
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
    remarks:string="";
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    public innerWidth: any;
    @ViewChild('instructions') instructionsRef:ElementRef;
    @ViewChild('justifications') justificationsRef:ElementRef;

    constructor(private socreationObj:SOCreationService,
                private confirmationServiceObj:ConfirmationService) {

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

       this.operation = GridOperations.Display;
       //getting the purchase orders list..
       this.getSalesOrders(0);
    }

    //to get  the purchase orders..
    getSalesOrders(purchaseOrderIdToBeSelected:number)
    {
      this.uploadedFiles.length =0;
      this.uploadedFiles = [];
      //getting the list of purchase orders...
      let purchaseOrderDisplayInput = {
        Skip : 0,
        Take : this.purchaseOrderPagerConfig.RecordsToFetch
      };
      this.socreationObj.getSalesOrders(purchaseOrderDisplayInput)
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
          },(error)=>{

            this.hidetext = false;
            this.hideinput = true;
            //remove this code after demo...
            this.purchaseOrdersList =[{ 
              PurchaseOrderCode:"SO-344",
              PurchaseOrderId:1,
              SupplierName:"Tata Motors"
            },
            { 
              PurchaseOrderCode:"SO-378",
              PurchaseOrderId:2,
              SupplierName:"Tata Motors"
            },
            { 
              PurchaseOrderCode:"SO-398",
              PurchaseOrderId:3,
              SupplierName:"Tata Motors"
            }];
        });
    }
    //to get list of purchase orders..
    getAllSearchSalesOrders(searchKey:string,purchaseOrderIdToBeSelected:number)
    {
        this.uploadedFiles.length =0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
          Skip : 0,
          Take : this.purchaseOrderPagerConfig.RecordsToFetch,
          Search:searchKey

        };
        this.socreationObj.getAllSearchSalesOrders(purchaseOrderDisplayInput)
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
        });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId:number)
    {   
        this.socreationObj.getSalesOrderDetails(purchaseOrderId)
            .subscribe((data:PurchaseOrderDetails)=>{

                this.selectedPODetails =  data;
                this.operation = GridOperations.Display;
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
                  PurchaseOrderCode:"SO code 12",
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
                    MeasurementUnitCode:"units",
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
                    MeasurementUnitCode:"units",
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
                    SupplierName:"UEl Customer",
                    PreviousSupplierName:"",
                    SupplierCode:"",
                    SupplierTypeID:1,
                    BillingAddress2:"Shipping Address",
                    BillingFax:"344-533-433",
                    BillingAddress1:"Billing Address",
                    SubCodeCount:0,
                    WorkFlowStatus:"",
                    IsFreezed:false,
                    SupplierAddress:"Supplier Address"
                  },
                };
            });
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
            this.getAllSearchSalesOrders(this.purchaseOrderSearchKey,0);
          }
        }
        else {
          this.getSalesOrders(0);
        }
    }
    onSearchClick()
    {
        if (this.purchaseOrderSearchKey != "") {
            if (this.purchaseOrderSearchKey.length >= 3) {
              this.getAllSearchSalesOrders(this.purchaseOrderSearchKey,0);
            }
        }
        else {
            this.getSalesOrders(0);
        }
    }
}
