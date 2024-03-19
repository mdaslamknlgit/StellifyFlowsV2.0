import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, Validators,FormBuilder,FormArray} from '@angular/forms';
import { NgbDateAdapter,NgbDateNativeAdapter, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged,switchMap,catchError} from 'rxjs/operators';
import { ConfirmationService,SortEvent } from "primeng/components/common/api";
import { Observable,of } from 'rxjs';
import { GoodsReceivedNotesService } from "../../services/goods-received-notes.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig,MessageTypes, GridOperations,
         ResponseStatusTypes,Messages, Suppliers, UserDetails, WorkFlowStatus, PurchaseOrderType, Assets, UserProfile, WorkFlowApproval, WorkFlowProcess, GRNS } from "../../../shared/models/shared.model";
import { POCreationService } from "../../services/po-creation.service";
import { FullScreen, restrictMinus } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { GoodsReceivedNotes, GoodsReceivedNotesItems } from '../../models/goods-received-notes.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PurchaseOrderList } from '../../models/po-creation.model';
import { Asset } from '../../../fixedassets/models/asset.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { ActivatedRoute } from '@angular/router';
import { GoodsReturnedNotes, GoodsReturnNotesList, GoodsReturnedNotesDisplayResult, GoodsReturnedNotesItems, GoodsReturnNoteFilterDisplayInput } from '../../models/goods-returned-notes.model';
import { GoodsReturnedNotesService } from '../../services/goods-returned-notes.service';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';

@Component({
  selector: 'app-goods-returned-order',
  templateUrl: './goods-returned-notes.component.html',
  styleUrls: ['./goods-returned-notes.component.css'],
  providers:[GoodsReturnedNotesService,POCreationService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class GoodsReturnedNotesComponent implements OnInit {

    closeResult: string;
    companyId: number = 0;
    hideText?: boolean=null;
    hideInput?: boolean=null;
    leftSection:boolean=false;
    rightSection:boolean=false;
    slideActive:boolean=false;
    goodsReturnedNotesList:Array<GoodsReturnNotesList>=[];
    goodsReturnedNotesPagerConfig:PagerConfig;
    goodsReturnedNotesForm: FormGroup;
    assetItemsForm:FormGroup;
    selectedGRNDetails:GoodsReturnedNotes;
    gridColumns:Array<{field:string,header:string}>= [];
    assetGridColumns:Array<{ field:string,header:string }>=[];
    recordInEditMode:number;
    operation:string;
    showGridErrorMessage:boolean=false;
    showGridErrorMessage1:boolean=false;
    scrollbarOptions:any;
    goodsReturnedNotesSearchKey:string;
    apiEndPoint:string;
    hideLeftPanel:boolean=false;
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    leftsection: boolean = false;
    rightsection: boolean = false;
    errorMessage: string = Messages.NoRecordsToDisplay;
    showAssetsDialog:boolean = false;
    selectedRowId:number =0;
    requestType:string="";
    requestSearchKey:string="";
    isApprovalPage:boolean =false;
    moduleHeading: string;
    showLeftPanelLoadingIcon:boolean=false;
    showRightPanelLoadingIcon:boolean =false;
    showFilterPopUp:boolean=false;
    workFlowStatus:any;
    initDone = false;
    initSettingsDone = true;
    grtFilterInfoForm: FormGroup;
    isFilterApplied: boolean = false;
    filterMessage: string = "";
    count:number=0;
    isCompanyChanged: boolean = false;
    public innerWidth: any;
    @ViewChild('grtCode') private grtCodeRef: any;
    @ViewChild("SupplierDoNumber") nameInput: ElementRef;

    constructor(private reqDateFormatPipe:RequestDateFormatPipe,
                private deliveryCreationObj:GoodsReturnedNotesService,
                private formBuilderObj:FormBuilder,
                private sharedServiceObj:SharedService,
                public sessionService: SessionStorageService,
                private confirmationServiceObj:ConfirmationService,
                public activatedRoute:ActivatedRoute,
                private renderer: Renderer,
                private modalService: NgbModal) {
     
      this.apiEndPoint = environment.apiEndpoint;
      this.companyId = this.sessionService.getCompanyId();
    }

    @ViewChild('rightPanel') rightPanelRef;
  
    ngOnInit() { 
       
        this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'ItemType', header: 'Item Type' },
            { field: 'Item/Service', header: 'Item' },
            { field: '', header: 'Description' },
            { field: 'MeasurementUnitCode', header: 'UOM' },
            { field: 'OriginalQty',header:'Original Qty' },
            { field: 'TotalReceivedQty', header: 'Total Received Qty' },
            { field: 'RTNQty', header: 'RTN Qty' }
        ];  
       
        this.assetGridColumns = [
          { field: 'Sno', header: 'S.no.' },
          { field: 'Asset', header: 'Asset Name' },
          { field: 'PurchasedDate', header: 'Purchased Date' },
          { field: 'ManufacturedBy', header: 'Manufacturer' },
          { field: 'Warranty', header: 'Warranty' },
          { field: 'ManufacturingDate', header: 'Manufacturing Date' },     
        ];
       
      this.goodsReturnedNotesPagerConfig = new PagerConfig();
      this.goodsReturnedNotesPagerConfig.RecordsToSkip = 0;
      this.goodsReturnedNotesPagerConfig.RecordsToFetch = 10;
      this.selectedGRNDetails = new GoodsReturnedNotes();
      this.goodsReturnedNotesForm = this.formBuilderObj.group({
           'POTypeId':[1],
           'PurchaseOrder':[null],
           'GoodsReturnNoteId':[0],
           'GRN':["",[Validators.required]],
           'GRNRemarks':["",[Validators.required]],
           'ItemsList':new FormArray([]),
           'IsGstBeforeDiscount':[false],
           'LocationID':[0],
           "Assets":[],
      });
      this.assetItemsForm = this.formBuilderObj.group({
        'Assets':this.formBuilderObj.array([]),
      });

      this.grtFilterInfoForm = this.formBuilderObj.group({
        GRTCode: [''],
        // SupplierCategory: [''],
        // InvoiceCode:['']
    });
   
       this.operation = GridOperations.Display;
       this.hideText = true;

       this.workFlowStatus = WorkFlowStatus;


       this.sharedServiceObj.IsCompanyChanged$
            .subscribe((data) => {
              this.isCompanyChanged = data;
              if (this.isCompanyChanged) {
      
                this.navigateToPage();
                this.sharedServiceObj.updateCompany(false);
              }
            });


       this.sharedServiceObj.CompanyId$
       .subscribe((data)=>{
               this.companyId = data;
               //this.navigateToPage();
       });

       this.activatedRoute.paramMap.subscribe((data)=>{
        this.navigateToPage();
      });

    }

    navigateToPage()
    {
        this.requestType =  this.activatedRoute.snapshot.params.type;
        this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');   
        let GRNNoteId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        if(this.activatedRoute.snapshot.params.type=="request")
        {
            this.isApprovalPage = false;
            this.moduleHeading = "Purchase order > Goods Return Notes";
            if(GRNNoteId > 0){
                this.searchGRN(GRNNoteId);
            }
            else {
                this.getGoodsReturnedNotes(0);
            }   
        
        }
        else if(this.activatedRoute.snapshot.params.type=="approval")
        {
            this.isApprovalPage = true;
            this.moduleHeading = "Purchase order > Goods Return Notes Approval";
            if(GRNNoteId > 0){
                this.searchGRN(GRNNoteId);
            }
            else {
                this.getGRTForApproval(0);
            }  
        }

    }

    searchGRN(creditNoteId:number,fromUserId:number = 0)
    {
            let userDetails = <UserDetails> this.sessionService.getUser();
            let input = {
                Skip:this.goodsReturnedNotesPagerConfig.RecordsToSkip,
                Take:this.goodsReturnedNotesPagerConfig.RecordsToFetch,
                IsApprovalPage:this.isApprovalPage,
                Search:this.requestSearchKey,
                RequestFromUserId:fromUserId,
                CreditNoteId:creditNoteId,
                UserId:userDetails.UserID,
                CompanyId:this.companyId
            };
            this.showLeftPanelLoadingIcon = true;
            this.deliveryCreationObj.searchGRN(input)
                .subscribe((data:GoodsReturnedNotesDisplayResult)=>{

                this.showLeftPanelLoadingIcon = false;
                this.goodsReturnedNotesList = data.GoodsReturnNotesList;
                this.goodsReturnedNotesPagerConfig.TotalRecords = data.TotalRecords;
                if(this.goodsReturnedNotesList.length > 0)
                {
                    this.showFilterPopUp = false;
                    this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
                }   
                else
                {
                    this.addRecord();
                }
            },()=>{
                this.showLeftPanelLoadingIcon = false;
            });
    }

    getGRTForApproval(GRNNoteId:number)
    {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let input = {
            Skip:this.goodsReturnedNotesPagerConfig.RecordsToSkip,
            Take:this.goodsReturnedNotesPagerConfig.RecordsToFetch,
            UserId:userDetails.UserID,
            CompanyId:this.companyId
        };
        this.showLeftPanelLoadingIcon = true;
        this.deliveryCreationObj.getGRTForApproval(input)
            .subscribe((data:GoodsReturnedNotesDisplayResult)=>{

            this.showLeftPanelLoadingIcon = false;
            this.goodsReturnedNotesList = data.GoodsReturnNotesList;
            this.goodsReturnedNotesPagerConfig.TotalRecords = data.TotalRecords;
            if(this.goodsReturnedNotesList.length > 0)
            {
                if(GRNNoteId > 0)
                {
                    this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
                }
                else
                {
                    this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
                }
            }
            else
            {
                this.selectedGRNDetails = new GoodsReturnedNotes();
            }
        },()=>{
            this.showLeftPanelLoadingIcon = false;
        });
    }

    openDialog() {
        this.showFilterPopUp = true;
        this.initDone = true;
        if (this.grtCodeRef != undefined) {
            this.grtCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.grtCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.showFilterPopUp = true;
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.grtFilterInfoForm.reset();
        this.filterMessage = "";
        this.isFilterApplied = false;
        if(this.isApprovalPage==true)
        {
            this.getGRTForApproval(0);
        }
        else
        {
            this.getGoodsReturnedNotes(0);
        }
        if (this.grtCodeRef != undefined) {
            this.grtCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.grtCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }


    filterData() {
        let GRTCode = "";
        let supplierCategory = "";
        let invoiceCode="";
        this.filterMessage = "";

        if (this.grtFilterInfoForm.get('GRTCode').value != "") {
            GRTCode = this.grtFilterInfoForm.get('GRTCode').value;
        }

        // if (this.grtFilterInfoForm.get('SupplierCategory').value != "") {
        //     supplierCategory = this.grtFilterInfoForm.get('SupplierCategory').value.SupplierName;
        // }
        
        // if (this.grtFilterInfoForm.get('InvoiceCode').value != "") {
        //     invoiceCode = this.grtFilterInfoForm.get('InvoiceCode').value;
        // }

        if (GRTCode === '' && supplierCategory === '' && invoiceCode==='' ) {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        let grtFilterDisplayInput: GoodsReturnNoteFilterDisplayInput = {
            Skip: this.goodsReturnedNotesPagerConfig.RecordsToSkip,
            Take: this.goodsReturnedNotesPagerConfig.RecordsToFetch,
            GRTCodeFilter: GRTCode,
            SupplierNameFilter: supplierCategory,
            InvoiceCodeFilter:invoiceCode,
            CompanyId:this.companyId
        };
        //calling the service method to get the list of item categories...
        this.deliveryCreationObj.getFilterGoodsReturnNotes(grtFilterDisplayInput)
            .subscribe((data: GoodsReturnedNotesDisplayResult) => {
                if (data.TotalRecords > 0) {
                    this.isFilterApplied = true;
                    if (open) {
                        this.initDone = false;
                    }
                    this.goodsReturnedNotesList = data.GoodsReturnNotesList;
                    this.goodsReturnedNotesPagerConfig.TotalRecords = data.TotalRecords;
                    this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
                }
                else {
                    this.filterMessage = "No matching records are found";
                    // this.addRecord();
                }
            }, (error) => {

                // this.hidetext = false;
                // this.hideinput = true;
                //remove this code after demo...
            });

    }



    updateStatus(statusId: number) {
        let remarks = "";
        let successMessage = "";
        let formRemarks = this.goodsReturnedNotesForm.get('GRNRemarks').value;
        if((formRemarks === "" || formRemarks === null) && (statusId === WorkFlowStatus.AskedForClarification || statusId === WorkFlowStatus.WaitingForApproval))
        {
            this.goodsReturnedNotesForm.get('GRNRemarks').setErrors({"required":true});
            this.goodsReturnedNotesForm.get('GRNRemarks').markAsTouched();
            return ;
        }
        if (statusId === WorkFlowStatus.Approved) {
            if(formRemarks!="" && formRemarks!=null){
            remarks = formRemarks;
            }
            else{
            remarks = "Approved";
            }
            successMessage = Messages.Approved;
        }
        else if (statusId === WorkFlowStatus.Rejected) {
            if(formRemarks!="" && formRemarks!=null){
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
        let userDetails = <UserDetails>this.sessionService.getUser();
        let workFlowStatus: WorkFlowApproval = {
            DocumentId: this.selectedGRNDetails.GoodsReturnNoteId,
            UserId: userDetails.UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            RequestUserId: this.selectedGRNDetails.CreatedBy,
            DocumentCode:this.selectedGRNDetails.GRTCode,//need to update to document coee
            ProcessId:WorkFlowProcess.GoodReturnNotes,
            CompanyId:this.selectedGRNDetails.CompanyId,
            ApproverUserId:0,
            IsReApproval: false
        };
        if(this.isApprovalPage==true)//if it is workflow approval page...
        {
        this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
            .subscribe((data) => {
                this.goodsReturnedNotesForm.get('GRNRemarks').setValue("");
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: successMessage,
                    MessageType: MessageTypes.Success
                });
                this.requestSearchKey = "";
                this.getGRTForApproval((statusId === WorkFlowStatus.Approved || statusId === WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
            });
        }
        else
        {
        workFlowStatus.ApproverUserId = this.selectedGRNDetails.CurrentApproverUserId 
        this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
        .subscribe((data) => {
            this.goodsReturnedNotesForm.get('Remarks').setValue("");
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: successMessage,
                MessageType: MessageTypes.Success
            });
            this.requestSearchKey = "";
            this.getGoodsReturnedNotes(workFlowStatus.DocumentId);
        });
        }
    }
 
    getGoodsReturnedNotes(grndId:number)
    {
      let purchaseOrderDisplayInput = {
        Skip : this.goodsReturnedNotesPagerConfig.RecordsToSkip,
        Take : this.goodsReturnedNotesPagerConfig.RecordsToFetch, 
        Search:"",
        CompanyId:this.companyId
      };
      this.deliveryCreationObj.getGoodsReturnedNotes(purchaseOrderDisplayInput)
          .subscribe((data:GoodsReturnedNotesDisplayResult)=>{  
                this.goodsReturnedNotesList = data.GoodsReturnNotesList;
                this.goodsReturnedNotesPagerConfig.TotalRecords = data.TotalRecords;
                if(this.goodsReturnedNotesList.length>0)
                {
                    if(grndId==0)   {                  
                        this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
                    }
                    else{
                        this.onRecordSelection(grndId);
                    }
                }
                else
                {
                    this.addRecord();
                }                    
          },(error)=>{

        });
    }

    




    //to get list of purchase orders..
    searchGoodsReceivedNotes(searchKey:string,grndId:number)
    {
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
          Skip : this.goodsReturnedNotesPagerConfig.RecordsToSkip,
          Take : this.goodsReturnedNotesPagerConfig.RecordsToFetch,
          Search:searchKey,
          CompanyId:this.companyId,
          From : "GRN"
        };
        this.deliveryCreationObj.getGoodsReturnedNotes(purchaseOrderDisplayInput)
        .subscribe((data:GoodsReturnedNotesDisplayResult)=>{
            this.goodsReturnedNotesList = data.GoodsReturnNotesList;
            this.goodsReturnedNotesPagerConfig.TotalRecords = data.TotalRecords;
            console.log(this.goodsReturnedNotesList);
            if(this.goodsReturnedNotesList.length>0)
            {
              if(grndId==0)
              {                 
                  this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
              }
              else
              {
                  this.onRecordSelection(grndId);
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
    onRecordSelection(grtId:number)
    {         
        
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.deliveryCreationObj.getGoodsReturnedNotesDetails(grtId,userDetails.UserID)
            .subscribe((data:GoodsReturnedNotes)=>{      
                this.selectedGRNDetails =  data;
                //this.selectedGRNDetails.POTypeId = poTypeId;
                this.operation = GridOperations.Display;
                this.goodsReturnedNotesForm.patchValue(data);
                this.hideText=true;
                this.hideInput=false;
            });
            console.log(this.selectedGRNDetails);
    }


    donumberInputFormater = (x: GRNS) => x.SupplierDoNumber;
    donumberSearch = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term =>
            this.sharedServiceObj.getGRNS({
                searchKey: term,
                statusId: 2,
                companyId:this.companyId
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


    poSearch = (text$: Observable<string>) =>
        text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) =>{
            if(term=="")
            {
               let supplier = this.goodsReturnedNotesForm.get('Supplier').value;
               this.clearForm();
               this.selectedGRNDetails = new GoodsReturnedNotes();
               this.goodsReturnedNotesForm.patchValue({
                'Supplier':supplier
               });
               return of([]);
            }
            return this.sharedServiceObj.getAllSearchPurchaseOrders({
                  Search:term,
                  SupplierId:this.goodsReturnedNotesForm.get('Supplier').value==null?0:this.goodsReturnedNotesForm.get('Supplier').value.SupplierId,
                  CompanyId:this.companyId,
                  From :  "GRN",
                  WorkFlowStatusId:WorkFlowStatus.Approved//getting only those purchase orders which are approved..
                }).map((data:Array<any>)=>{
                 
                data.forEach((item,index)=>{
                    item.index= index;
                });
                 return data;
            }).pipe(
              catchError((data) => {
                  return of([]);
              }))
          })
     );
    
    poInputFormatter = (x: PurchaseOrderList) =>x.PurchaseOrderCode;
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{
        if(term=="")
        {
            this.clearForm();
            this.selectedGRNDetails = new GoodsReturnedNotes();
            return of([]);
        }
        return this.sharedServiceObj.getSuppliers({
                searchKey:term,
                supplierTypeId:0,
                CompanyId:this.companyId
            }).pipe(
            catchError(() => {
                return of([]);
            }))
        })
    );
    initGridRows() {
        return this.formBuilderObj.group({
            'RecordId':[0],
            'TypeId':[0],
            'ItemType':[0],
            'GoodsReturnNoteItemId':0,
            'ItemDescription':[""],
            'MeasurementUnitID':[0],
            'MeasurementUnitCode':[""], 
            'Item':[null],
            'Service':[null],
            "RequestedQty":[0],
            "OriginalQty":[0],
            "TotalReceivedQty":[0],
            "RTNQty":[0,[Validators.required]],
            'PurchaseValue':[0]     
        });
    }

    initAssetGridRows()
    {
        return this.formBuilderObj.group({
            'AssetDetailsId':[0],
            'SerialNumber':["",[Validators.required]],
            'Asset':[null],
            'PurchasedDate':[new Date(),[Validators.required]],
            'ManufacturedBy':[""],
            'Warranty':[""],
            'ManufacturedDate':[new Date()]
        });
    }

    rtnQtyChange(gridRow:any)
    {
        let grnControl = gridRow.get('RTNQty');
        let orignalQtyControl = gridRow.get('OriginalQty');
        let ReceivedQtyControl = gridRow.get('TotalReceivedQty');
        if(grnControl.value > orignalQtyControl.value)
        {
           grnControl.setErrors({ 'qtyerror1':true });
        }
        if(grnControl.value > ReceivedQtyControl.value)
        {
           grnControl.setErrors({ 'qtyerror2':true });
        }
    }
    //adding row to the grid..
    addGridItem(noOfLines:number)
    {
        let itemGroupControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList'];
        for(let i=0;i<noOfLines;i++)
        {
            itemGroupControl.push(this.initGridRows());
        }
    }
    /**
     * to hide the category details and show in add mode..
     */
    addRecord()
    {
        this.hideText=false;
        this.hideInput=true;
        this.selectedGRNDetails = new GoodsReturnedNotes();
        this.goodsReturnedNotesForm.reset();
        this.goodsReturnedNotesForm.setErrors(null);
        let itemGroupControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0;
        this.goodsReturnedNotesForm.patchValue({
            SupplierTypeID:"1",
            IsGstRequired:false
        });
        //this.showFullScreen();
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
    
    // saveRecord(action:string)
    saveRecord(statusId:number)
    {
        let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
        let userid = userDetails.UserID;
        this.showGridErrorMessage = false;
        this.showGridErrorMessage1=false;
        let itemGroupControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList'];
        if(itemGroupControl==undefined||itemGroupControl.controls.length==0)
        {
            this.showGridErrorMessage = true;
            return;
        }
        else{
            for(let i=0;i<itemGroupControl.length;i++){
                if(itemGroupControl.controls[i].get('RTNQty').value!=0){
                    this.count++;
                }
            }
            if(this.count==0)
            {
                this.showGridErrorMessage1=true;
                return;;
            }
        }
        // if(action=='send'&&this.hideText==true&&this.selectedGRNDetails.GoodsReturnNoteId > 0)
        // {
        //     let workFlowDetails:WorkFlowParameter =   
        //     {
        //         ProcessId:WorkFlowProcess.GoodReturnNotes,
        //         CompanyId: this.companyId ,  
        //         LocationId: this.selectedGRNDetails.LocationID,                   
        //         FieldName:"",
        //         Value:0,
        //         DocumentId:this.selectedGRNDetails.GoodsReturnNoteId,
        //         CreatedBy:this.selectedGRNDetails.CreatedBy,
        //         WorkFlowStatusId:WorkFlowStatus.WaitingForApproval
        //     };
        //     this.sharedServiceObj.sendForApproval(workFlowDetails)
        //         .subscribe((data)=>{
        //             this.sharedServiceObj.showMessage({
        //                 ShowMessage: true,
        //                 Message: Messages.SentForApproval,
        //                 MessageType: MessageTypes.Success
        //             });
        //             this.getGoodsReturnedNotes(workFlowDetails.DocumentId);
        //         });
        //     return;
        // }
        let formStatus = this.goodsReturnedNotesForm.status;
        if(formStatus!="INVALID")
        {
          let goodReceivedItem:GoodsReturnedNotes = this.goodsReturnedNotesForm.value; 
        //   goodReceivedItem.WorkFlowStatusId = action === 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
          goodReceivedItem.ItemsList.forEach(i=>{
            if(i.GoodsReturnNoteItemId>0)
            {
                let previousRecord = this.selectedGRNDetails.ItemsList.find(j=>j.GoodsReturnNoteItemId==i.GoodsReturnNoteItemId);
                if(i.RTNQty!= previousRecord.RTNQty)
                {
                    i.IsModified=true;
                }
            }
            else
            {
                i.GoodsReturnNoteItemId=0;
            }
          });
          goodReceivedItem.CreatedBy = userid;
          goodReceivedItem.CompanyId=this.companyId;
          goodReceivedItem.LocationID=this.selectedGRNDetails.LocationID;    
          goodReceivedItem.Status=statusId;          
          goodReceivedItem.POTypeId=this.selectedGRNDetails.POTypeId;          

          goodReceivedItem.ItemsList = goodReceivedItem.ItemsList.filter(i=>i.GoodsReturnNoteItemId==0||i.GoodsReturnNoteItemId==null||i.IsModified==true);
          if(this.selectedGRNDetails.GoodsReturnNoteId==0||this.selectedGRNDetails.GoodsReturnNoteId==null)
          {
              this.selectedGRNDetails.GoodsReturnNoteId =0;
            this.deliveryCreationObj.createGoodsReturnedNotes(goodReceivedItem).subscribe((grndId:number)=>{
                    this.hideText=true;
                    this.hideInput=false;
                    this.recordInEditMode = -1;
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.SavedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    this.getGoodsReturnedNotes(grndId);
                    this.showGridErrorMessage = false;
                    this.showGridErrorMessage1=false;
                },
                (data:HttpErrorResponse)=>{
                    if(data.error.Message==ResponseStatusTypes.Duplicate)
                    {
                        this.showDuplicateMessage();
                    }
                });
          }
          else 
          {
            console.log(goodReceivedItem);
            goodReceivedItem.GoodsReturnNoteId = this.selectedGRNDetails.GoodsReturnNoteId;
             this.deliveryCreationObj.updateGoodReturnedNotes(goodReceivedItem)
                .subscribe((GoodsReturnNoteId:number )=>{
                    this.hideText=true;
                    this.hideInput=false;
                    this.recordInEditMode = -1;
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.UpdatedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    this.getGoodsReturnedNotes(goodReceivedItem.GoodsReturnNoteId);
                    this.showGridErrorMessage = false;
                    this.showGridErrorMessage1=false;
                },(data:HttpErrorResponse)=>{
                    if(data.error.Message==ResponseStatusTypes.Duplicate)
                    {
                        this.showDuplicateMessage();
                    }
                });
            }
        }
        else
        {
            Object.keys(this.goodsReturnedNotesForm.controls).forEach((key:string) => {
                if(this.goodsReturnedNotesForm.controls[key].status=="INVALID" && this.goodsReturnedNotesForm.controls[key].touched==false)
                {
                   this.goodsReturnedNotesForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList'];
            itemGroupControl.controls.forEach(controlObj => {  
                Object.keys(controlObj["controls"]).forEach((key:string) => {
                    let itemGroupControl = controlObj.get(key);
                    if(itemGroupControl.status=="INVALID" && itemGroupControl.touched==false)
                    {
                        itemGroupControl.markAsTouched();
                    }
                }); 
            });  
        }
    }

    submit()
    {
        this.confirmationServiceObj.confirm({
            message:"Details once submitted cannot be changed.Do you want to continue ??",
            header:"Confirmation",
            accept: () => {     
                this.saveRecord(2);
            },
            reject: () => {
            }
        });
    }

    showDuplicateMessage()
    { 
        //setting the error for the "Name" control..so as to show the duplicate validation message..
        this.goodsReturnedNotesForm.get('SupplierDoNumber').setErrors({
            'Duplicate':true
        });       
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord()
    {        
        this.goodsReturnedNotesForm.reset();
        this.goodsReturnedNotesForm.setErrors(null);
        this.showGridErrorMessage1=false;
        if(this.goodsReturnedNotesList.length > 0 && this.selectedGRNDetails!=undefined)
        {
            if(this.selectedGRNDetails.GoodsReturnNoteId==undefined || this.selectedGRNDetails.GoodsReturnNoteId==0)
            {
                this.onRecordSelection(this.goodsReturnedNotesList[0].GoodsReturnNoteId);
            }
            else{
                this.onRecordSelection(this.selectedGRNDetails.GoodsReturnNoteId);
            }
        }
        this.hideInput =false;
        this.hideText =true;      
        this.sharedServiceObj.hideAppBar(false);
    }
    /**
     * to delete the selected record...
     */
    deleteRecord()
    {
      let recordId = this.selectedGRNDetails.GoodsReturnNoteId;
      let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();      
      this.confirmationServiceObj.confirm({
          message: Messages.ProceedDelete,
          header:Messages.DeletePopupHeader,
          accept: () => {     
            this.deliveryCreationObj.deleteGoodsReturnedNotes(recordId,userDetails.UserID).
                  subscribe((data)=>{
                  this.sharedServiceObj.showMessage({
                      ShowMessage:true,
                      Message:Messages.DeletedSuccessFully,
                      MessageType:MessageTypes.Success
                  });
                  this.getGoodsReturnedNotes(0);
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
        this.hideInput = true;
        this.hideText = false;
        //resetting the item category form.
        this.clearForm();
        this.addGridItem(this.selectedGRNDetails.ItemsList.length);
        this.goodsReturnedNotesForm.patchValue(this.selectedGRNDetails);
        console.log(this.selectedGRNDetails);
    }

    clearForm()
    {
        this.goodsReturnedNotesForm.reset();
        this.goodsReturnedNotesForm.get('ItemsList').reset();
        let itemGroupControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0;
    }


    poSelection(eventData) {
        this.clearForm();
        let purchaseOrderTypeId = eventData.item.POTypeId;
        let purchaseOrderId = eventData.item.PurchaseOrderId;
        let grnid=0; 
     
         grnid=eventData.item.GoodsReceivedNoteId;
        if(this.selectedGRNDetails!=null){
            this.selectedGRNDetails=new GoodsReturnedNotes();
        }
        this.deliveryCreationObj.GetGRNDetails(grnid,purchaseOrderTypeId)
        .subscribe((data: GoodsReturnedNotes) => {
                this.selectedGRNDetails = data;
                let itemGroupControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList'];
                itemGroupControl.controls = [];
                itemGroupControl.controls.length = 0;
                this.addGridItem(this.selectedGRNDetails.ItemsList.length);

                this.goodsReturnedNotesForm.patchValue({
                    ItemsList:
                    this.selectedGRNDetails.ItemsList
                });

            });         
    }
    splite(){ 
        this.leftSection= !this.leftSection;
        this.rightSection= !this.rightSection;
    }
    matselect(event){ 
      if(event.checked==true)
      {
        this.slideActive=true;  
      }
      else
      {
        this.slideActive=false;   
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
    
  
    onSearchInputChange(event: any) {      
        if (event.target.value != "") {
            this.searchGoodsReceivedNotes(event.target.value, 0);
        }
        else {
            this.getGoodsReturnedNotes(0);
        }
    }
    pageChange(currentPageNumber:any)
    {
        this.goodsReturnedNotesPagerConfig.RecordsToSkip = this.goodsReturnedNotesPagerConfig.RecordsToFetch*(currentPageNumber-1);
        this.getGoodsReturnedNotes(0);
        if(!isNaN(currentPageNumber))
        {
            this.goodsReturnedNotesPagerConfig.RecordsToSkip = this.goodsReturnedNotesPagerConfig.RecordsToFetch*(currentPageNumber-1);
            if((this.requestSearchKey==null||this.requestSearchKey==""))
            {
                if(this.isApprovalPage === false)
                {
                    this.getGoodsReturnedNotes(0);
                }
                else if(this.isApprovalPage === true)
                {
                    this.getGRTForApproval(0);
                }
            }
            else
            {
                this.searchGRN(0);
            }
        }
    }

    onPrintPDF() {     
        let pdfDocument = this.deliveryCreationObj.printDetails(this.selectedGRNDetails.GoodsReturnNoteId,this.selectedGRNDetails.POTypeId, this.companyId);
        pdfDocument.subscribe((data) => {
            let result = new Blob([data], { type: 'application/pdf' });
            const fileUrl = URL.createObjectURL(result);
            let tab = window.open();
            tab.location.href = fileUrl;
        });
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
    // addAssetDetails(content:any,rowId:number)
    // { 
    //     this.showAssetsDialog = true;
    //     this.assetItemsForm.reset();
    //     let itemGroupControl = <FormArray>this.assetItemsForm.controls['Assets'];
    //     itemGroupControl.controls =[];
    //     itemGroupControl.controls.length =0; 
    //     let itemListControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList']; 
    //     this.selectedRowId = rowId;      
    //     for(let i=0;i<itemListControl.controls.length;i++)
    //     {
    //         if(i==rowId)
    //         {
    //             let grnQty:number  = itemListControl.controls[i].get('GRNQty').value;
    //             let item:any  = itemListControl.controls[i].get('Item').value;   
    //             let assetsDetails:Asset[] = itemListControl.controls[i].get('Assets').value;
    //             for(let j=0;j< grnQty ;j++)
    //             {
    //                 itemGroupControl.push(this.initAssetGridRows());     
    //                 if(assetsDetails==null||assetsDetails.length==0||assetsDetails[j]==undefined){
    //                     itemGroupControl.controls[j].patchValue({ Asset:{
    //                         AssetId:item.ItemMasterId,
    //                         AssetName:item.ItemName
    //                     }});
    //                 }
    //                 else{
    //                     assetsDetails[j].PurchasedDate = new Date(assetsDetails[j].PurchasedDate);
    //                     itemGroupControl.controls[j].patchValue(assetsDetails[j]);
    //                 }
    //             }
    //             break;
    //         }
    //     }      
    // }
    addItems()
    {
        let status = this.assetItemsForm.status;
        if(status!='INVALID')
        {     
            let assetsValue:Asset[] = this.assetItemsForm.controls['Assets'].value;
            if(this.hideText == true && this.selectedGRNDetails.GoodsReturnNoteId > 0)
            {
                let currentRecord:GoodsReceivedNotes = JSON.parse(JSON.stringify(this.selectedGRNDetails));
                assetsValue.forEach(data=>{
                    data.PurchasedDate = this.reqDateFormatPipe.transform(data.PurchasedDate); 
                    data.ManufacturedDate = this.reqDateFormatPipe.transform(data.ManufacturedDate);
                })
                currentRecord.Assets = assetsValue;
                currentRecord.ItemsList = [];
                this.deliveryCreationObj.updateGoodReturnedNotes(currentRecord)
                    .subscribe((GoodsReturnNoteId:number )=>{
                        this.sharedServiceObj.showMessage({
                            ShowMessage:true,
                            Message:Messages.UpdatedSuccessFully,
                            MessageType:MessageTypes.Success
                        });
                        this.getGoodsReturnedNotes(currentRecord.GoodsReceivedNoteId);
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage1=false;
                        this.showAssetsDialog = false;
                    });
            }
            else
            {          
                let assetsControl = <FormArray> this.goodsReturnedNotesForm.controls['Assets'];
                assetsControl.patchValue(assetsValue);
                this.showAssetsDialog = false;
            }
        }
        else
        {
            let itemGroupControl = <FormArray>this.assetItemsForm.controls['Assets'];
            itemGroupControl.controls.forEach(controlObj => {  
                Object.keys(controlObj["controls"]).forEach((key:string) => {
                    let itemGroupControl = controlObj.get(key);
                    if(itemGroupControl.status=="INVALID" && itemGroupControl.touched==false)
                    {
                        itemGroupControl.markAsTouched();
                    }
                }); 
            });  
        }
       
    }
    showItemsList()
    {
        this.showAssetsDialog = true;
        let itemGroupControl = <FormArray>this.assetItemsForm.controls['Assets'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0; 
        this.assetItemsForm.reset();
        if(this.hideText== true && this.selectedGRNDetails.GoodsReturnNoteId >0)//if it is in display mode and
        {
            let assetsDetails:Asset[] = this.selectedGRNDetails.Assets;
            let counter = 0;
            for(let i=0;i<this.selectedGRNDetails.ItemsList.length;i++)
            {
                let rtnQty:number  = this.selectedGRNDetails.ItemsList[i].RTNQty;
                let item:any  = this.selectedGRNDetails.ItemsList[i].Item;
                for(let j = 0;j<rtnQty;j++)
                {
                    itemGroupControl.push(this.initAssetGridRows());                  
                    if(assetsDetails==null||assetsDetails.length==0||assetsDetails[counter]==undefined){

                        itemGroupControl.controls[counter].patchValue({ Asset:{
                            AssetId:item.ItemMasterId,
                            AssetName:item.ItemName
                        }});
                    }
                    else{
                        assetsDetails[counter].PurchasedDate = new Date(assetsDetails[counter].PurchasedDate);
                        itemGroupControl.controls[counter].patchValue(assetsDetails[counter]);
                    }
                    counter++;
                }
            }
        }
        else
        {
            let itemListControl = <FormArray>this.goodsReturnedNotesForm.controls['ItemsList']; 
            let assetsDetails:Asset[] = this.goodsReturnedNotesForm.controls['Assets'].value;
            let counter = 0;
            for(let i=0;i<itemListControl.controls.length;i++)
            {
                let rtnQty:number  = itemListControl.controls[i].get('RTNQty').value;
                let item:any  = itemListControl.controls[i].get('Item').value;             
                for(let j=0;j< rtnQty ;j++)
                {
                    itemGroupControl.push(this.initAssetGridRows());                  
                    if(assetsDetails==null||assetsDetails.length==0||assetsDetails[counter]==undefined){

                        itemGroupControl.controls[counter].patchValue({ Asset:{
                            AssetId:item.ItemMasterId,
                            AssetName:item.ItemName
                        }});
                    }
                    else{
                        assetsDetails[counter].PurchasedDate = new Date(assetsDetails[counter].PurchasedDate);
                        itemGroupControl.controls[counter].patchValue(assetsDetails[counter]);
                    }
                    counter++;
                }
            }
        }   
    }
}

