import { Component, OnInit, ViewChild,Renderer2,ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CostOfService,PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderDetails,PurchaseOrderTypes } from "../../models/quotation-request.model";
import { PurchaseOrderRequestService } from "../../services/purchase-order-request.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig,Suppliers, Messages } from "../../../shared/models/shared.model";
import { NgbDateAdapter,NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { GridOperations,Currency,PaymentTerms } from "../../../shared/models/shared.model";
import { ConfirmationService,SortEvent } from "primeng/components/common/api";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { DisplayDateFormatPipe } from '../../../shared/pipes/display-date-format.pipe';
import { FullScreen } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { POCreationService } from '../../services/po-creation.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
  selector: 'app-quotation-response-approval',
  templateUrl: './quotation-response-approval.component.html',
  styleUrls: ['./quotation-response-approval.component.css'],
  providers:[POCreationService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class QuotationResponseApprovalComponent implements OnInit {
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
    @ViewChild('instructions') instructionsRef:ElementRef;
    @ViewChild('justifications') justificationsRef:ElementRef;
    companyId: number = 0;
    public innerWidth: any;
    constructor(private purchaseOrderRequestObj:POCreationService,
                private formBuilderObj:FormBuilder,
                private sharedServiceObj:SharedService,
                private confirmationServiceObj:ConfirmationService,
                private reqDateFormatPipe:RequestDateFormatPipe,
                private displayDateFormatPipe:DisplayDateFormatPipe,
                private rendererObj:Renderer2,
                private elementRefObj:ElementRef,
                public sessionService: SessionStorageService) {

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
      this.companyId = this.sessionService.getCompanyId();
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
      this.getPurchaseOrders(0);
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
          },(error)=>{

              this.hidetext = false;
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
        });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId:number)
    {   
        this.purchaseOrderRequestObj.getPurchaseOrderDetails(purchaseOrderId,  this.companyId)
            .subscribe((data:PurchaseOrderDetails)=>{

                this.selectedPODetails =  data;
                this.operation = GridOperations.Display;
                this.hidetext=true;
            },(error)=>{
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
