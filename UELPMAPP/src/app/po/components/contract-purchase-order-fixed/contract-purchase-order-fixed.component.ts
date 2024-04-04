// import { Component, OnInit, ViewChild,Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
// import { FormGroup, Validators,FormBuilder,FormArray } from '@angular/forms';
// import { ContractPurchaseOrder } from "../../models/contract-purchase-order.model";
// import { POCreationService } from "../../services/po-creation.service";
// import { SharedService } from "../../../shared/services/shared.service";
// import { PagerConfig,Suppliers,ItemMaster, MessageTypes } from "../../../shared/models/shared.model";
// import { NgbDateAdapter,NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
// import { debounceTime, distinctUntilChanged,switchMap,catchError} from 'rxjs/operators';
// import { Observable,of } from 'rxjs';
// import { GridOperations,ResponseStatusTypes,Messages,Currency } from "../../../shared/models/shared.model";
// import { ConfirmationService,SortEvent } from "primeng/components/common/api";
// import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
// import { ValidateFileType,FullScreen } from "../../../shared/shared";
// import { environment } from '../../../../environments/environment';
// import { Supplier } from '../../models/supplier';

// @Component({
//   selector: 'app-contract-purchase-order-fixed',
//   templateUrl: './contract-purchase-order-fixed.component.html',
//   styleUrls: ['./contract-purchase-order-fixed.component.css'],
//   providers:[POCreationService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
// })
// export class ContractPurchaseOrderFixedComponent implements OnInit {

//     @Input('selectedPoId')  selectedPoId:number;
//     @Output()
//     cancelChanges:EventEmitter<boolean> = new EventEmitter<boolean>();
//     contractPurchaseOrderForm: FormGroup;
//     purchaseOrderPagerConfig:PagerConfig;
//     purchaseOrderItemsGridConfig:PagerConfig;
//     selectedPODetails:ContractPurchaseOrder;
//     billingFrequenceTypes:Array<{ FrequencyId:Number,FrequencyName:string }>=[];
//     suppliers:Suppliers[]=[];   
//     currencies:Currency[]=[];
//     //this array will hold the list of columns to display in the grid..
//     gridColumns:Array<{field:string,header:string}>= [];
//      //this variable will hold the record in edit mode...
//     recordInEditMode:number;
//     //this will tell whether we are using add/edit/delete mode the grid..
//     operation:string;
//     hidetext?: boolean=null;
//     hideinput?: boolean=null;
//     uploadedFiles:Array<File>=[];
//     showGridErrorMessage:boolean=false;
//     scrollbarOptions:any;
//     apiEndPoint:string;
//     hideLeftPanel:boolean=false;
//     linesToAdd:number=2;
//     deletedPurchaseOrderItems:Array<number> =[];

//     constructor(private pocreationObj:POCreationService,
//                 private formBuilderObj:FormBuilder,
//                 private sharedServiceObj:SharedService,
//                 private confirmationServiceObj:ConfirmationService,
//                 private reqDateFormatPipe:RequestDateFormatPipe) {

//       this.gridColumns = [
//               { field: 'Sno', header: 'S.no.' },
//               { field: 'Description', header: 'Description' },
//               { field: 'ExpenseCategory', header: 'Expense Category' },
//               { field: 'ContractAmount', header: 'Contract Amount' },
//               { field: 'PaymentValidation', header: 'Payment Validation' },
//       ];  

//       this.apiEndPoint = environment.apiEndpoint;

//       this.purchaseOrderPagerConfig = new PagerConfig();
//       this.purchaseOrderPagerConfig.RecordsToFetch = 100;

//       this.purchaseOrderItemsGridConfig = new PagerConfig();
//       this.purchaseOrderItemsGridConfig.RecordsToFetch = 20;

//       this.selectedPODetails = new ContractPurchaseOrder();
//       this.contractPurchaseOrderForm = this.formBuilderObj.group({
//         'ContractName': ["",{ validators: [Validators.required]}],
//         'ContractSignedDate':[new Date(), [Validators.required]],
//         'Provider': [null, [Validators.required]],
//         'StartDate': [new Date(), [Validators.required]],
//         'EndDate': [new Date(), [Validators.required]],
//         'TotalContractSum': [0, [Validators.required]],
//         'BillingFrequencyId': [0, [Validators.required]],
//         'ContractPurchaseOrderItems': this.formBuilderObj.array([]),   
//         'PerQuarter':[0],
//         'Discount':[0],
//         'SubTotal':[0],
//         'TotalAmount':[0],
//       });
//       this.billingFrequenceTypes =[{    
//         FrequencyId:1,
//         FrequencyName:"Monthly"
//        },{
//         FrequencyId:2,
//         FrequencyName:"Quarterly"
//       },{
//         FrequencyId:3,
//         FrequencyName:"Half Yearly"
//       },
//       {
//         FrequencyId:4,
//         FrequencyName:"Yearly"
//       }];
//     }

//     @ViewChild('rightPanel') rightPanelRef;
  
//     ngOnInit() { 

//         this.sharedServiceObj.getCurrencies()
//             .subscribe((data:Currency[])=>{
//                 this.currencies =  data;
//         });
//        this.operation = GridOperations.Display;
//     }

//     ngOnChanges(simpleChange:SimpleChanges)
//     {
//         if(simpleChange["selectedPoId"])
//         {
//             let currentValue:number =simpleChange["selectedPoId"].currentValue;
//             if(currentValue==0)
//             {
//                 this.addRecord();
//             }
//             else
//             {
//                 this.onRecordSelection(currentValue);
//             }
//         }
//     }
//      //this method is used to format the content to be display in the autocomplete textbox after selection..
//     supplierInputFormater = (x: Suppliers) => x.SupplierName;
//     //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
//     supplierSearch = (text$: Observable<string>) =>
//       text$.pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         switchMap(term =>
//             this.sharedServiceObj.getSuppliers({
//                 searchKey:term,
//                 supplierTypeId:this.contractPurchaseOrderForm.get('SupplierTypeID').value
//             }).pipe(
//             catchError(() => {
//                 return of([]);
//             }))
//        )
//     );
//     supplierTypeChange(event)
//     {
//         let purchaseOrderTypeId = event.target.value;
//         this.contractPurchaseOrderForm.get('Supplier').setValue(null);
//     }
//     /**
//      * this method will be called on purchase order record selection.
//      */
//     onRecordSelection(purchaseOrderId:number)
//     {   
//         this.pocreationObj.getPurchaseOrderDetails(purchaseOrderId)
//             .subscribe((data:ContractPurchaseOrder)=>{

//                 this.selectedPODetails =  data;
//                 this.operation = GridOperations.Display;
//                 this.contractPurchaseOrderForm.patchValue(data);
//                 this.hidetext=true;
//                 this.hideinput=false;
//             });
//     }
//     /**
//      * this method will be called on the supplier dropdown change event.
//      */
//     onSupplierChange(event?:any)
//     {
//        let supplierDetails:Supplier;
//        if(event!=null&&event!=undefined){
//          supplierDetails = event.item;
//        }
//        else{
//          supplierDetails = this.contractPurchaseOrderForm.get('Supplier').value;
//        }
//        if(supplierDetails!=undefined)
//        {
//             this.contractPurchaseOrderForm.patchValue({
//                 "SupplierAddress":supplierDetails.BillingAddress1,
//                 "DeliveryAddress":supplierDetails.BillingAddress1,
//                 "ShippingFax":supplierDetails.BillingFax
//             });
//        }
//        else
//        {
//             this.contractPurchaseOrderForm.patchValue({
//                 "SupplierAddress":"",
//                 "DeliveryAddress":"",
//                 "ShippingFax":""
//             });
//        }
//     }
//     /**
//      * this method is used to format the content to be display in the autocomplete textbox after selection..
//      */
//     itemMasterInputFormater = (x: ItemMaster) => x.ItemName;

//     /**
//      * this mehtod will be called when user gives contents to the  "item master" autocomplete...
//      */
//     itemMasterSearch = (text$: Observable<string>) =>

//         text$.pipe(
//             debounceTime(300),
//             distinctUntilChanged(),
//             switchMap(term =>
//                 this.sharedServiceObj.getItemMasterByKey({                    
//                     searchKey:term,
//                     LocationID:null
//                 }).pipe(
//                 catchError(() => {

//                     return of([]);
//                 }))
//             )
//     );
//     /**
//      * this method will be called on "item master" autocomplete value selection.
//      */
//     itemMasterSelection(eventData:any,index:number)
//     {
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         console.log(eventData.item);
//         //setting the existing qty based on user selection 
//         itemGroupControl.controls[index].patchValue({
//             ItemDescription:eventData.item.Description,
//             MeasurementUnitID:eventData.item.MeasurementUnitID
//         });        
//     }

//     initGridRows() {
//         return this.formBuilderObj.group({
//               'PurchaseOrderItemId':0,
//               'Description':[""],
//               'ExpenseCategory':[""], 
//               'ContractAmount':[null,Validators.required],
//               "PaymentEvaluation":[0,[Validators.required,Validators.min(1)]]
//         });
//     }
//     //adding row to the grid..
//     addGridItem(noOfLines:number)
//     {
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         for(let i=0;i<noOfLines;i++)
//         {
//             itemGroupControl.push(this.initGridRows());
//         }
//     }
//     /**
//      * to remove the grid item...
//      */
//     removeGridItem(rowIndex:number)
//     {
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('PurchaseOrderItemId').value;
//         if(purchaseOrderItemId > 0)
//         {
//             this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
//         }
//         itemGroupControl.removeAt(rowIndex);
//         this.calculateTotalPrice();
//     }

//     /**
//      * to hide the category details and show in add mode..
//      */
//     addRecord()
//     {
//         //setting this variable to false so as to show the purchase order details in edit mode
//         this.hidetext=false;
//         this.hideinput=true;
//         this.linesToAdd =2;
//         this.selectedPODetails = new ContractPurchaseOrder();
//         //resetting the purchase order form..
//         this.contractPurchaseOrderForm.reset();
//         this.contractPurchaseOrderForm.setErrors(null);
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         itemGroupControl.controls =[];
//         itemGroupControl.controls.length =0;
//         this.contractPurchaseOrderForm.patchValue({
//             SupplierTypeID:"1",
//             IsGstRequired:false
//         });
//         this.addGridItem(this.linesToAdd);
//         this.showFullScreen();
//     }
//     showFullScreen()
//     {
//         FullScreen(this.rightPanelRef.nativeElement);
//         //  this.hideLeftPanel = true;
//         // this.sharedServiceObj.hideAppBar(true);//hiding the app bar..
//     }
//     hideFullScreen()
//     {
//        // this.hideLeftPanel = false;
//        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
//     }
//     /**
//      * to save the given purchase order details
//      */
//     saveRecord()
//     {
//         this.showGridErrorMessage = false;
//         let status:boolean=true;
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         if(itemGroupControl==undefined||itemGroupControl.controls.length==0)
//         {
//             this.showGridErrorMessage = true;
//             return;
//         }
//         let purchaseOrderFormStatus = this.contractPurchaseOrderForm.status;
//         if(purchaseOrderFormStatus!="INVALID")
//         {
//           //getting the purchase order form details...
//           let itemCategoryDetails:ContractPurchaseOrder = this.contractPurchaseOrderForm.value; 
//           itemCategoryDetails["StartDate"] = this.reqDateFormatPipe.transform(itemCategoryDetails.StartDate);  
//           itemCategoryDetails["EndDate"] = this.reqDateFormatPipe.transform(itemCategoryDetails.EndDate);  
//           itemCategoryDetails["ContractSignedDate"] = this.reqDateFormatPipe.transform(itemCategoryDetails.ContractSignedDate);  

//           itemCategoryDetails.ContractPurchaseOrderItems.forEach(i=>{
//             if(i.PurchaseOrderItemId>0)
//             {
//                 let previousRecord = this.selectedPODetails.ContractPurchaseOrderItems.find(j=>j.PurchaseOrderItemId==i.PurchaseOrderItemId);

//                 if(
//                     i.Description!=previousRecord.Description||
//                     i.ExpenseCategory!=previousRecord.ExpenseCategory||
//                     i.PaymentEvaluation!=previousRecord.PaymentEvaluation||
//                     i.ContractAmount!=previousRecord.ContractAmount)
//                     {
//                         i.IsModified=true;
//                     }
//             }
//             else
//             {
//                 i.PurchaseOrderItemId=0;
//             }
//           });
//           itemCategoryDetails.ContractPurchaseOrderItems = itemCategoryDetails.ContractPurchaseOrderItems.filter(i=>i.PurchaseOrderItemId==0||i.PurchaseOrderItemId==null||i.IsModified==true);
//           if(this.selectedPODetails.PurchaseOrderId==0||this.selectedPODetails.PurchaseOrderId==null)
//           {
//               this.pocreationObj.createPurchaseOrder(itemCategoryDetails,this.uploadedFiles)
//                 .subscribe(( response: { Status:string,Value:any })=>{
//                     //if status is success then we will insert a new record into the array...
//                     if(response.Status == ResponseStatusTypes.Success)
//                     {
//                         this.hidetext=true;
//                         this.hideinput=false;
//                         this.uploadedFiles.length =0;
//                         this.uploadedFiles = [];
//                         this.recordInEditMode = -1;
//                         this.sharedServiceObj.showMessage({
//                             ShowMessage:true,
//                             Message:Messages.SavedSuccessFully,
//                             MessageType:MessageTypes.Success
//                         });
//                         this.showGridErrorMessage = false;
//                         this.hideFullScreen();
//                     }
//                 });
//           }
//           else 
//           {
//              itemCategoryDetails.PurchaseOrderId = this.selectedPODetails.PurchaseOrderId;
//              itemCategoryDetails.PurchaseOrderItemsToDelete = this.deletedPurchaseOrderItems;
//              itemCategoryDetails.Attachments =  this.selectedPODetails.Attachments.filter(i=>i.IsDelete==true);
//              this.pocreationObj.updatePurchaseOrder(itemCategoryDetails,this.uploadedFiles)
//                  .subscribe((response:{ Status:string,Value:any })=>{
//                     //if status is success then we will insert a new record into the array...
//                     if(response.Status == ResponseStatusTypes.Success)
//                     {   this.hidetext=true;
//                         this.hideinput=false;
//                         this.uploadedFiles.length =0;
//                         this.uploadedFiles = [];
//                         this.deletedPurchaseOrderItems =[];
//                         this.deletedPurchaseOrderItems.length=0;
//                         this.recordInEditMode = -1;
//                         this.sharedServiceObj.showMessage({
//                             ShowMessage:true,
//                             Message:Messages.UpdatedSuccessFully,
//                             MessageType:MessageTypes.Success
//                         });
//                         this.showGridErrorMessage = false;
//                         this.hideFullScreen();
//                     }
//                  });
//             }
//         }
//         else
//         {
//             Object.keys(this.contractPurchaseOrderForm.controls).forEach((key:string) => {
//                 if(this.contractPurchaseOrderForm.controls[key].status=="INVALID" && this.contractPurchaseOrderForm.controls[key].touched==false)
//                 {
//                    this.contractPurchaseOrderForm.controls[key].markAsTouched();
//                 }
//             });
//             let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//             itemGroupControl.controls.forEach(controlObj => {  
//                 console.log(controlObj);
//                 Object.keys(controlObj["controls"]).forEach((key:string) => {
//                     console.log(key);
//                     let itemGroupControl = controlObj.get(key);
//                     if(itemGroupControl.status=="INVALID" && itemGroupControl.touched==false)
//                     {
//                         itemGroupControl.markAsTouched();
//                     }
//                 }); 
//             });  
//         }
//     }
//     /**
//      * a) this method will be called on cancel button click event..
//      * b) we will show the purchase order details on cancel button click event..
//      */
//     cancelRecord()
//     { 
//         //setting this variable to true so as to show the purchase details
//         this.contractPurchaseOrderForm.reset();
//         this.contractPurchaseOrderForm.setErrors(null);
//         this.cancelChanges.emit(true);
//         this.hideinput = false;
//         this.hidetext = true;
//         this.uploadedFiles.length=0;
//         this.uploadedFiles = [];
//     }
//     /**
//      * to delete the selected record...
//      */
//     deleteRecord()
//     {
//       let recordId = this.selectedPODetails.PurchaseOrderId;
//       this.confirmationServiceObj.confirm({
//           message: Messages.ProceedDelete,
//           header:Messages.DeletePopupHeader,
//           accept: () => {     
//             this.pocreationObj.deletePurchaseOrder(recordId).subscribe((data)=>{
//                   this.sharedServiceObj.showMessage({
//                       ShowMessage:true,
//                       Message:Messages.DeletedSuccessFully,
//                       MessageType:MessageTypes.Success
//                   });
//                  // this.getPurchaseOrders(0);
//             });
//           },
//           reject: () => {
//           }
//       });
//     }
//     /**
//      * to show the purchase order details in edit mode....
//      */ 
//     editRecord()
//     {
//         //setting this variable to false so as to show the category details in edit mode
//         this.hideinput = true;
//         this.hidetext = false;
//         //resetting the item category form.
//         this.contractPurchaseOrderForm.reset();
//         this.contractPurchaseOrderForm.get('ContractPurchaseOrderItems').reset();
//         this.contractPurchaseOrderForm.setErrors(null);
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         itemGroupControl.controls =[];
//         itemGroupControl.controls.length =0;
//         this.addGridItem(this.selectedPODetails.ContractPurchaseOrderItems.length);
//         this.contractPurchaseOrderForm.patchValue(this.selectedPODetails);
//         this.contractPurchaseOrderForm.get('StartDate').setValue(new Date(this.selectedPODetails.StartDate));
//         this.contractPurchaseOrderForm.get('EndDate').setValue(new Date(this.selectedPODetails.EndDate));
//         this.contractPurchaseOrderForm.get('ContractSignedDate').setValue(new Date(this.selectedPODetails.ContractSignedDate));
//         this.onSupplierChange();
//         this.calculateTotalPrice();
//         this.showFullScreen();
//     }
//     // /**
//     //  * this method will be called on currency change event...
//     //  */
//     // onCurrencyChange()
//     // {
//     //     let currencyId = this.contractPurchaseOrderForm.get('CurrencyId').value;
//     //     this.selectedPODetails.CurrencySymbol =  this.currencies.find(i=>i.Id==currencyId).Symbol;
//     // }
//     //to get the sub totalprice..
//     getSubTotal()
//     {
//         let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
//         if(itemGroupControl!=undefined)
//         {
//             let subTotal = 0;
//             itemGroupControl.controls.forEach(data=>{
//                 subTotal = subTotal + data.get('ItemQty').value * data.get('Unitprice').value;
//             });
//             return subTotal;
//         }
//     }
//     //getting the total tax..
//     getTotalTax(taxRate:number)
//     {
//        let totalTax = (this.getSubTotal()*taxRate)/100;
//        return totalTax;
//     }
//     //to get total price..
//     calculateTotalPrice()
//     {
//         let subTotal = this.getSubTotal();
//         this.contractPurchaseOrderForm.get('SubTotal').setValue(subTotal);
//         let discount = this.contractPurchaseOrderForm.get('Discount').value;
//         let shippingCharges = this.contractPurchaseOrderForm.get('ShippingCharges').value;
//         let OtherCharges = this.contractPurchaseOrderForm.get('OtherCharges').value;
//         let totalTax = this.getTotalTax(this.contractPurchaseOrderForm.get('TaxRate').value);
//         this.contractPurchaseOrderForm.get('TotalTax').setValue(totalTax);
//         let totalPrice = (subTotal-discount)+totalTax+shippingCharges+OtherCharges;
//         this.contractPurchaseOrderForm.get('TotalAmount').setValue(totalPrice);
//     }
//     /**
//      * this method will be called on file upload change event...
//      */
//     onFileUploadChange(event:any)
//     {
//         let files:FileList = event.target.files;
//         for(let i=0;i<files.length;i++)
//         {
//             let fileItem = files.item(i);
//             if(ValidateFileType(fileItem.name))
//             {
//               this.uploadedFiles.push(fileItem);
//             }
//             else
//             {
//                 event.preventDefault();
//                 break;
//             }
//        }
//     }
//     /**
//      * this method will be called on file close icon click event..
//      */
//     onFileClose(fileIndex:number)
//     {
//         this.uploadedFiles = this.uploadedFiles.filter((file,index)=>index!=fileIndex);
//     }
//     //for custome sort
//     customSort(event: SortEvent) {
//         event.data.sort((data1, data2) => {
//             let value1;
//             let value2;
//             if(event.field=="Name")
//             {
//                 value1 = data1["Item"]["ItemName"];
//                 value2 = data2["Item"]["ItemName"];
//             }
//             else if(event.field=="MeasurementUnitID")
//             {
//                 value1 = data1["Item"]["MeasurementUnitCode"];
//                 value2 = data2["Item"]["MeasurementUnitCode"];
//             }
//             else if(event.field=="ItemTotal")
//             {
//                 value1 = data1["ItemQty"]*data1["Unitprice"];
//                 value2 = data2["ItemQty"]*data2["Unitprice"];
//             }
//             else
//             {
//                 value1 = data1[event.field];
//                 value2 = data2[event.field];
//             }
//             let result = null;
//             if (value1 == null && value2 != null)
//                 result = -1;
//             else if (value1 != null && value2 == null)
//                 result = 1;
//             else if (value1 == null && value2 == null)
//                 result = 0;
//             else if (typeof value1 === 'string' && typeof value2 === 'string')
//                 result = value1.localeCompare(value2);
//             else
//                 result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
//             return (event.order * result);
//         });
//     }
//     attachmentDelete(attachmentIndex:number)
//     {

//         this.confirmationServiceObj.confirm({
//             message: Messages.AttachmentDeleteConfirmation,
//             header:Messages.DeletePopupHeader,
//             accept: () => {     
//                 let attachmentRecord = this.selectedPODetails.Attachments[attachmentIndex];
//                 attachmentRecord.IsDelete = true;
//                 this.selectedPODetails.Attachments = this.selectedPODetails.Attachments.filter(i=>i.IsDelete!=true);
//             },
//             reject: () => {
//             }
//         });

//     }
//     //this method will be called on date picker focus event..
//     onDatePickerFocus(element:NgbInputDatepicker,event:any)
//     {
//         if(!element.isOpen())
//         {
//             element.open();
//         }
//     }
// }
