import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, Validators,FormBuilder, FormArray, FormControl } from '@angular/forms';
import { SupplierInvoiceDetails, SupplierPayment, SupplierPaymentDisplayResult, SupplierPaymentList, SupplierInvoiceTotal } from "../../models/supplier-payment.model";
import { SupplierPaymentService } from "../../services/supplier-payment.service";
import { SharedService } from "../../../shared/services/shared.service";
import { STRING_PATERN, ALPHA_NUMERIC, NUMBER_PATERN, EMAIL_PATTERN, MOBILE_NUMBER_PATTERN } from '../../../shared/constants/generic';
import { PagerConfig,Suppliers, MessageTypes, PaymentType, UserDetails } from "../../../shared/models/shared.model";
import { NgbDateAdapter,NgbDateNativeAdapter, NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged,switchMap,catchError} from 'rxjs/operators';
import { Observable,of } from 'rxjs';
import { ResponseStatusTypes,Messages } from "../../../shared/models/shared.model";
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen, restrictMinus } from "../../../shared/shared";
import { Supplier } from '../../models/supplier';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
//import { ENGINE_METHOD_DIGESTS } from 'constants';


@Component({
    selector: 'app-supplier-payment',
    templateUrl: './supplier-payment.component.html',
    styleUrls: ['./supplier-payment.component.css'],
    providers: [SupplierPaymentService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class SupplierPaymentComponent implements OnInit {
    leftsection: boolean = false;
    rightsection: boolean = false;
    scrollbarOptions: any;
    SupplierPaymentList:Array<SupplierPaymentList>=[];
    supplierInvoiceDetails:Array<SupplierInvoiceDetails>=[];
    supplierInvoiceTotal:SupplierInvoiceTotal;
    selectedSupplierPaymentDetails:SupplierPayment;
    supplierPaymentsPagerConfig:PagerConfig;
    supplierPaymentForm: FormGroup;
    suppliers:Suppliers[]=[];
    supplierPaymentId: number =0;
    slideactive:boolean=false;
    supplierPaymentSearchKey:string;
    showGridErrorMessage:boolean=false;
    paymenttypes: Array<{ PaymentTypeId: number, Name: string }>;
    showGridErrorMessage1:boolean=false;   
    showGridErrorMessage2:boolean=false;
    showGridErrorMessage3:boolean=false;
    showGridErrorMessage6:boolean=false;
    showGridErrorMessage7:boolean=false;
    showGridErrorMessage8:boolean=false;
    addtotaloutstanding:number;
    supplierid:number;
    totalpayment:Number;
    supplerEmail:string;
    deletedSupplierPaymentItems:Array<number> =[];
    paymentTypes:Array<{ PaymentType:string,PaymentTypeId:number }> =[];
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    hidetext?: boolean=null;
    hideinput?: boolean=null;
    
    hidecarddetails?: boolean=null;
    hidecheque?: boolean=null;
    PaymentTypeId:number;
    suppID:number;
    spFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    isFilterApplied: boolean = false;    
    checkedvalue:boolean=false;
    check:boolean=false;
    initDone = false;
    filteredSupplierPayment = [];
    RemainingAmount:number; 
    TotalAmount:number;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    printPermission: boolean; 
    public innerWidth: any;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('spCode') private supplierPaymentRef: any;
    checked:boolean;
    formSubmitAttempt: boolean = false;
    paymentDetails:SupplierPayment;
    paymentType:PaymentType[]=[];
    //this array will hold the list of columns to display in the grid..
    gridColumns:Array<{field:string,header:string}>= [];
    errorMessage: string = Messages.NoRecordsToDisplay;
    companyId: number = 0;
    constructor(private supplierPaymentServiceObj:SupplierPaymentService,
                private formBuilderObj:FormBuilder,
                private sharedServiceObj:SharedService,
                private confirmationServiceObj:ConfirmationService,
                private renderer: Renderer,
                public sessionService: SessionStorageService) {
                this.companyId = this.sessionService.getCompanyId();
    }
    
    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierpayment")[0];  
            
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete; 
            this.printPermission=formRole.IsPrint;
          }
          else {           
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true; 
            this.printPermission=true;
          }

        this.hidecarddetails=false;
        this.hidecheque=false;
        this.gridColumns = [
            { field: '', header: '' },
            { field: 'InvoiceDate', header: 'Invoice Date' },
            { field: 'InvoiceNo', header: 'Invoice No' },
            { field: 'InvoiceAmount', header: 'Invoice Amount' },
            { field: 'OutStandingAmount', header: 'OutStanding Amount' },
            { field: 'PaymentAmount', header: 'Payment Amount' }
       ];  

       this.spFilterInfoForm = this.formBuilderObj.group({
        SPCode: [''],
        SupplierCategory: [''],
        Invoiceno:['']
    });
      this.supplierPaymentsPagerConfig = new PagerConfig();
      this.supplierPaymentsPagerConfig.RecordsToSkip = 0;
      this.supplierPaymentsPagerConfig.RecordsToFetch = 100;

      this.selectedSupplierPaymentDetails = new SupplierPayment();
      this.supplierPaymentForm = this.formBuilderObj.group({
        'Supplier': [null,{ validators: [Validators.required]}],
        'TotalAmountPaid':[0,[Validators.required]],
        'Remarks':[""],
        'SupplierEmail':[""],
        'PaymentTypeId':[null,[Validators.required]],
        'PaymentAmount':0,
        'Checked':0,
        'ChequeNumber':["",{ validators: [Validators.required,Validators.maxLength(20)] }],
        'ChequeDate':[new Date(),[Validators.required]],
        'CreditCardNo':["",{ validators: [Validators.pattern(NUMBER_PATERN), Validators.required,Validators.maxLength(16)] }],
        'ExpiryMonth':["",{ validators: [Validators.pattern(NUMBER_PATERN), Validators.required,Validators.maxLength(2)] }],
        'ExpiryYear':["",{ validators: [Validators.pattern(NUMBER_PATERN), Validators.required,Validators.maxLength(4)] }], 
        'TotalOustanding':"",      
        //'Overpayment':"",
        'SupplierInvoiceDetails':this.formBuilderObj.array([])
      });

      this.sharedServiceObj.CompanyId$
        .subscribe((data)=>{
            this.companyId = data;
            this.GetSupplierPayment(0);            
        });

      this.paymentDetails = new SupplierPayment();
      this.sharedServiceObj.getPaymentType()
            .subscribe((data:PaymentType[])=>{
                this.paymentType = data;
            });
      this.GetSupplierPayment(0);
    }

    ngOnChanges() {
        //this.editRecord();
    }

    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;

    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.supplierPaymentServiceObj.getAllSuppliersinSupplierPayment({
                    searchKey: term,
                    supplierTypeId: 1,
                    companyId:this.companyId
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
        this.supplierPaymentForm.get('ChequeNumber').setValue('I0');
        this.supplierPaymentForm.get('ChequeDate').setValue(new Date());
        this.supplierPaymentForm.get('CreditCardNo').setValue(0);
        this.supplierPaymentForm.get('ExpiryMonth').setValue(0);
        this.supplierPaymentForm.get('ExpiryYear').setValue(0);
        if(item==2){
            this.PaymentTypeId=item;           
            this.supplierPaymentForm.get('ChequeNumber').setValue('',{Validators:[Validators.required]});
            this.supplierPaymentForm.get('ChequeDate').setValue(new Date(),{Validators:[Validators.required]});
            this.hidecarddetails=false;
            this.hidecheque=true;    
        }
        else if(item==3){
            this.PaymentTypeId=item;               
            this.supplierPaymentForm.get('CreditCardNo').setValue('',[Validators.required,Validators.maxLength(16)]);
            this.supplierPaymentForm.get('ExpiryMonth').setValue('',[Validators.required,Validators.maxLength(2)]);
            this.supplierPaymentForm.get('ExpiryYear').setValue('',[Validators.required,Validators.maxLength(4)]);
            this.hidecheque=false; 
            this.hidecarddetails=true;
            
        }
        else if(item==1||item==4){
            this.PaymentTypeId=item;
            this.hidecarddetails=false;
            this.hidecheque=false;
        }       
    }

    GetSupplierPayment(QuotationRequestIdToBeSelected: number) {   
       
        let supplierPaymentDisplayInput = {
            Skip: 0,
            Take: this.supplierPaymentsPagerConfig.RecordsToFetch,
            companyId:this.companyId
        };
        this.supplierPaymentServiceObj.getSupplierPayment(supplierPaymentDisplayInput)
            .subscribe((data: SupplierPaymentDisplayResult) => {
                this.SupplierPaymentList = data.SupplierPayment;
                this.supplierPaymentsPagerConfig.TotalRecords = data.TotalRecords;

                if (this.SupplierPaymentList.length > 0) {
                    if (QuotationRequestIdToBeSelected == 0) {               
                        this.onRecordSelection(this.SupplierPaymentList[0].SupplierPaymentId);

                    }
                    else {
                        this.onRecordSelection(QuotationRequestIdToBeSelected);
                    }             
                }
                else {
                    this.addRecord();
                }
            }, (error) => {

                this.hidetext = false;
                this.hideinput = true;
                //remove this code after demo...
            
            });
    }


    onRecordSelection(supplierPaymentId: number) {
     
        let add:number=0; this.showGridErrorMessage6=false;
        this.supplierPaymentServiceObj.getSupplierPaymentDetails(supplierPaymentId)
            .subscribe((data: SupplierPayment) => {
                this.selectedSupplierPaymentDetails = data;
                this.supplierPaymentId =  this.selectedSupplierPaymentDetails.SupplierPaymentId;  
                //this.operation = GridOperations.Display;    
                if(data.PaymentTypeId!=null)
                {
                    this.paymentTypeSelection(data.PaymentTypeId);              
                }
                this.supplierPaymentForm.patchValue(data);                
                this.hidetext = true;
                this.hideinput = false;
                if(data.SupplierInvoiceDetails!=null){
                    for(let sp=0;sp<data.SupplierInvoiceDetails.length;sp++){
                        add += data.SupplierInvoiceDetails[sp].OutstandingAmount;
                    }
                    this.addtotaloutstanding=Number(add.toFixed(2));
                }

               // console.log(data.PaymentType);
            });            
        }

        hidefilter(){
            this.innerWidth = window.innerWidth;       
            if(this.innerWidth < 550){      
            $(".filter-scroll tr").click(function() {       
            $(".leftdiv").addClass("hideleftcol");
            $(".rightPanel").addClass("showrightcol");  
            $(".rightcol-scrroll").height("100%");  
          }); 
          }
          }
    addRecord()
    {
 this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }

        this.hidetext=false;
        this.hideinput=true;
        this.hidecarddetails=false;
        this.hidecheque=false;   
        this.showGridErrorMessage6=false;
        this.selectedSupplierPaymentDetails = new SupplierPayment();
        this.supplierPaymentForm.reset();
        this.supplierPaymentForm.setErrors(null);
        let itemGroupSupplierControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails'];
        itemGroupSupplierControl.controls = [];
        itemGroupSupplierControl.controls.length = 0; 
        this.addtotaloutstanding=0 ;     
        //this.showFullScreen();
    }
    editRecord()
    {      
        
        //setting this variable to false so as to show the category details in edit mode
        this.hideinput = true;
        this.hidetext = false;
        //resetting the item category form.
        this.supplierPaymentForm.reset();               
        this.supplierPaymentForm.setErrors(null);
        let itemGroupSupplierControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails'];
        itemGroupSupplierControl.controls = [];
        itemGroupSupplierControl.controls.length = 0;
        this.addGridItem(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.length);
        this.supplierPaymentForm.get('SupplierEmail').setValue(this.selectedSupplierPaymentDetails.Supplier["SupplierEmail"]);
        this.supplierPaymentForm.get('ChequeNumber').setValue('I0');
        this.supplierPaymentForm.patchValue(this.selectedSupplierPaymentDetails);
        this.supplierPaymentForm.get('ChequeDate').setValue(new Date(this.selectedSupplierPaymentDetails.ChequeDate));

        for(let i=0;i<itemGroupSupplierControl.length;i++){
            if(itemGroupSupplierControl.controls[i].get('PaymentAmount').value>0){
                itemGroupSupplierControl.controls[i].get('Checked').setValue(true);   
            }
        }

        // let supplierPaymentDisplayInput1 = {            
        //     SupplierPaymentId: this.selectedSupplierPaymentDetails.SupplierPaymentId
        //     SupplierId: this.selectedSupplierPaymentDetails.SupplierId
        // };
        
        this.supplierPaymentServiceObj.getEditSupplierPaymentDetails(this.selectedSupplierPaymentDetails.SupplierPaymentId,this.selectedSupplierPaymentDetails.Supplier["SupplierId"])
        .subscribe((data: SupplierPayment) => {
            
            for(let s=0;s<data.SupplierInvoiceTotal.length;s++){
                let aa=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.filter(i=>i.InvoiceId==data.SupplierInvoiceTotal[s].InvoiceId);
                for(let m=0;m<this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.length;m++){
                    if(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[m].InvoicePaymentId==aa[0].InvoicePaymentId){
                    let sum =Number(aa[0].InvoiceAmount);
                //if(data.SupplierInvoiceTotal[s].InvoiceId==this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[s].InvoiceId){
                    let d=sum-data.SupplierInvoiceTotal[s].Total;
                    this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[m].OutstandingAmount=d;
                    }
                   // itemGroupSupplierControl.controls[s].get('OutstandingAmount').setValue(d);
                }
            }
            
            this.supplierPaymentForm.controls['SupplierInvoiceDetails'].patchValue(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails);
            //this.selectedSupplierPaymentDetails.SupplierInvoiceDetails=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails;
            //console.log(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails);

            if(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails!=null){
                let tadd:number=0;
                
                for(let sp=0;sp<this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.length;sp++){
                    tadd += this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[sp].OutstandingAmount;
                }
                this.addtotaloutstanding=Number(tadd.toFixed(2));
            }
            //console.log(this.addtotaloutstanding);

            
        });     
        
    }




    cancelRecord() {  
        
        //setting this variable to true so as to show the purchase details
        this.supplierPaymentForm.reset();
        this.supplierPaymentForm.setErrors(null);
        this.showGridErrorMessage1=false;
        this.showGridErrorMessage=false;
        this.formSubmitAttempt = false;
        this.showGridErrorMessage2=false;
        this.showGridErrorMessage3=false;
        this.showGridErrorMessage6=false;
        this.hidecarddetails=false;
        this.hidecheque=false;
        
        if (this.SupplierPaymentList.length > 0 && this.selectedSupplierPaymentDetails != undefined) {
            if (this.selectedSupplierPaymentDetails.SupplierPaymentId == 0||this.selectedSupplierPaymentDetails.SupplierPaymentId == undefined) {
                this.onRecordSelection(this.SupplierPaymentList[0].SupplierPaymentId);
            }
            else {
                this.onRecordSelection(this.selectedSupplierPaymentDetails.SupplierPaymentId);
            }
            //setting this variable to true so as to show the purchase details
            this.hideinput = false;
            this.hidetext = true;
        }
        else {
            this.hideinput = null;
            this.hidetext = null;
        }
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
    }

    deleteRecord() {    
        let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();    
        let recordId = this.selectedSupplierPaymentDetails.SupplierPaymentId;
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.supplierPaymentServiceObj.deleteSupplierPayment(recordId,userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    this.GetSupplierPayment(0);
                });
            },
            reject: () => {
            }
        });
    }



    supplierSelection(event) {
        let tadd:number=0;
        
        if(this.selectedSupplierPaymentDetails!=null){
            this.selectedSupplierPaymentDetails=new SupplierPayment();
        }
        this.supplierid=event.item.SupplierId;
        // this.supplerEmail= event.item.SupplierEmail;       
        this.supplierPaymentServiceObj.getInvoicewithSupplierdetails(event.item.SupplierId)
            .subscribe((data: SupplierPayment) => {
                this.selectedSupplierPaymentDetails = data;
                let itemGroupSupplierControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails'];
                itemGroupSupplierControl.controls = [];
                itemGroupSupplierControl.controls.length = 0;
                this.addGridItem(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.length);

                if(data.SupplierInvoiceDetails!=null){
                    
                    for(let sp=0;sp<data.SupplierInvoiceDetails.length;sp++){
                        tadd += data.SupplierInvoiceDetails[sp].OutstandingAmount;
                    }
                    this.addtotaloutstanding=Number(tadd.toFixed(2));
                }

                this.supplierPaymentForm.patchValue({
                    SupplierEmail:event.item.SupplierEmail,
                    SupplierInvoiceDetails:
                    this.selectedSupplierPaymentDetails.SupplierInvoiceDetails
                });
            });          
    }

    onSearchInputChange(event: any) {
        if (event.target.value != "") {
           this.getAllSearchSupplierPayment(event.target.value, 0);  
        }
        else {
            this.GetSupplierPayment(0);
        }
    }

    getAllSearchSupplierPayment(searchKey: string, SupplierpaymentIdToBeSelected: number) {
        let supplierPaymentDisplayInput = {
            Search: searchKey,
            Skip: this.supplierPaymentsPagerConfig.RecordsToSkip,
            Take: this.supplierPaymentsPagerConfig.RecordsToFetch,
            CompanyId:this.companyId
        };
        this.supplierPaymentServiceObj.getSupplierPayment(supplierPaymentDisplayInput)
            .subscribe((data: SupplierPaymentDisplayResult) => {
                this.SupplierPaymentList = data.SupplierPayment;
                this.supplierPaymentsPagerConfig.TotalRecords = data.TotalRecords;

                if (this.SupplierPaymentList.length > 0) {
                    if (SupplierpaymentIdToBeSelected == 0) {                        
                        this.onRecordSelection(this.SupplierPaymentList[0].SupplierPaymentId);
                    }
                    else {
                        this.onRecordSelection(SupplierpaymentIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {

                this.hidetext = false;
                this.hideinput = true;
            });
    }
   
    openDialog() {
        this.initDone = true;
        if (this.supplierPaymentRef != undefined) {
            this.supplierPaymentRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.supplierPaymentRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.spFilterInfoForm.get('SPCode').setValue("");
        this.spFilterInfoForm.get('SupplierCategory').setValue("");
        this.spFilterInfoForm.get('Invoiceno').setValue("");
        this.filterMessage = "";
        this.filteredSupplierPayment = this.SupplierPaymentList;
        if (this.filteredSupplierPayment.length > 0) {
            this.GetSupplierPayment(0);
        }

        this.isFilterApplied = false;
        if (this.supplierPaymentRef != undefined) {
            this.supplierPaymentRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.supplierPaymentRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    
    openSettingsMenu() {
        this.initSettingsDone = true;
    }

    filterData() {      
        let spCode = "";
        let supplierCategory = 0;
        let invoiceno = "";        
        this.filterMessage = "";
        if (this.spFilterInfoForm.get('SPCode').value != "") {
            spCode = this.spFilterInfoForm.get('SPCode').value;
        }

        if (this.spFilterInfoForm.get('SupplierCategory').value != "") {
            supplierCategory = this.spFilterInfoForm.get('SupplierCategory').value.SupplierName;
        }

        if (this.spFilterInfoForm.get('Invoiceno').value != "") {
            invoiceno = this.spFilterInfoForm.get('Invoiceno').value;
        }
        
        if (spCode === '' && supplierCategory === 0 && invoiceno === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }
        
        if (spCode != '' && supplierCategory != 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierPaymentCode.toLowerCase().indexOf(spCode.toLowerCase()) !== -1 && x.SupplierName === supplierCategory.toString() && (x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1));
        }

        if (spCode != '' && supplierCategory === 0 && invoiceno === '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierPaymentCode.toLowerCase().indexOf(spCode.toLowerCase()) !== -1);
        }

        if (spCode != '' && supplierCategory != 0 && invoiceno === '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierPaymentCode.toLowerCase().indexOf(spCode.toLowerCase()) !== -1 && x.SupplierName === supplierCategory.toString());
        }

        if (spCode != '' && supplierCategory != 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierPaymentCode.toLowerCase().indexOf(spCode.toLowerCase()) !== -1 && (x.SupplierName === supplierCategory.toString() && (x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1)));
        }

        if (spCode === '' && supplierCategory != 0 && invoiceno === '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierName === supplierCategory.toString());
        }

        if (spCode === '' && supplierCategory != 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierName === supplierCategory.toString() && (x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1));
        }

        if (spCode === '' && supplierCategory != 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierName === supplierCategory.toString() && x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1);
        }

        if (spCode === '' && supplierCategory === 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1);
        }

        if (spCode === '' && supplierCategory === 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1);
        }

        if (spCode != '' && supplierCategory == 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1 && x.SupplierPaymentCode.toLowerCase().indexOf(spCode.toLowerCase()) !== -1);
        }

        if (spCode != '' && supplierCategory === 0 && invoiceno === '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierPaymentCode.toLowerCase().indexOf(spCode.toLowerCase()) !== -1);
        }

        if (spCode === '' && supplierCategory === 0 && invoiceno != '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.InvoiceCode.toLowerCase().indexOf(invoiceno.toLowerCase()) !== -1);
        }

        if (spCode === '' && supplierCategory != 0 && invoiceno === '') {
            this.filteredSupplierPayment = this.SupplierPaymentList.filter(x => x.SupplierName === supplierCategory.toString());
        }


        if (this.filteredSupplierPayment.length > 0) {
            this.SupplierPaymentList = this.filteredSupplierPayment;
            this.selectedSupplierPaymentDetails.SupplierPaymentId=this.SupplierPaymentList[0].SupplierPaymentId;
            this.onRecordSelection(this.SupplierPaymentList[0].SupplierPaymentId);
           this.isFilterApplied = true;
           if (open) {
               this.initDone = false;
           }
       }
       else {
            this.filterMessage = "No matching records are found";
       }
    }

  
    
  split() {
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }

  pageChange(event){

  }

     //adding row to the grid..
     addGridItem(noOfLines:number)
     {
         let itemGroupControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails'];
         for(let i=0;i<noOfLines;i++)
         {
             itemGroupControl.push(this.initGridRows());             
         }
     }

     initGridRows() {
        return this.formBuilderObj.group({              
              'Checked':[false],
              'InvoiceDate':new Date(),
              'InvoiceNo':0,
              'InvoiceAmount':0,
              'OutstandingAmount':0,
              'PaymentAmount':[0,[Validators.required]],
              'InvoiceId':0,
              'InvoicePaymentId':0
        });
    }
 
    calculateOutstandingPayment(InvoiceAmount:number,outstandingAmt:number,rowIndex:number,gridRow:any){
         
        let rowpayment:number=0;
        let grnControl = gridRow.get('PaymentAmount');
        let itemGroupControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails']; 
        let paymentAmount= itemGroupControl.controls[rowIndex].get('PaymentAmount').value;
        if(paymentAmount<=outstandingAmt){
            if(InvoiceAmount!=0){
                if(paymentAmount>=0){
                    this.checkedvalue=true;
                    //this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[rowIndex].PaymentAmount=paymentAmount;
                    for(let a=0;a<itemGroupControl.length;a++){
                        rowpayment +=Number(itemGroupControl.controls[a].get('PaymentAmount').value);
                    }                   
                    if(paymentAmount>0){
                    itemGroupControl.controls[rowIndex].get('Checked').setValue(true);  
                    }
                    else{
                        itemGroupControl.controls[rowIndex].get('Checked').setValue(false);  
                    }
                    if(rowpayment % 1!=0){
                        this.supplierPaymentForm.get('TotalAmountPaid').setValue(rowpayment.toFixed(2));
                    }
                    else{            
                        this.supplierPaymentForm.get('TotalAmountPaid').setValue(rowpayment);
                    }
                    //this.supplierPaymentForm.get('TotalAmountPaid').setValue(rowpayment);

                   // this.selectedSupplierPaymentDetails.SupplierInvoiceDetails=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.filter((data,index)=>index>-1);
                }
                else{         
                    itemGroupControl.controls[rowIndex].get('Checked').setValue(false); 
                }
            }
            else{              
                    this.supplierPaymentForm.get('PaymentAmount').setErrors({
                        'invalidQty':true
                    });
            }
            
        }
        else{
            grnControl.setErrors({ 'qtyerror2':true });
        }       
    }



    
    opentextbox(isChecked:boolean,rowIndex:number){  
        
        let sum;
        let itemGroupControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails'];      
        if(this.supplierPaymentForm.get('TotalAmountPaid').value>this.addtotaloutstanding)
        {
            this.supplierPaymentForm.get('TotalAmountPaid').setValue(0);
        }
        if(isChecked==true){
        if(this.checkedvalue!=true){ 
                itemGroupControl.controls[rowIndex].get('PaymentAmount').setValue(itemGroupControl.controls[rowIndex].get('OutstandingAmount').value);
                this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[rowIndex].PaymentAmount=itemGroupControl.controls[rowIndex].get('OutstandingAmount').value;
                let OutstandingAmount:number =itemGroupControl.controls[rowIndex].get('OutstandingAmount').value;
                let TotalAmountPaid:number =this.supplierPaymentForm.get('TotalAmountPaid').value;
                this.supplierPaymentForm.get('TotalAmountPaid').setValue(Number(TotalAmountPaid)+OutstandingAmount);
                sum=this.supplierPaymentForm.get('TotalAmountPaid').value;
            }
        }
        else{
            if(this.check==true){
                itemGroupControl.controls[rowIndex].get('PaymentAmount').setValue(0);
               // this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[rowIndex].PaymentAmount=0;    
                    }
            else{                
                if(itemGroupControl.controls[rowIndex].get('PaymentAmount').value>itemGroupControl.controls[rowIndex].get('OutstandingAmount').value)
                {
                this.supplierPaymentForm.get('TotalAmountPaid').setValue(this.supplierPaymentForm.get('TotalAmountPaid').value - itemGroupControl.controls[rowIndex].get('OutstandingAmount').value);
                }
                else{
                    itemGroupControl.controls[rowIndex].get('PaymentAmount').setValue(0);
                    var lesspaymnt:number=0;
                    
                    for(let r=0;r<itemGroupControl.length;r++){
                        if(itemGroupControl.controls[r].get('Checked').value==true){
                            let value =itemGroupControl.controls[r].get('PaymentAmount').value;
                            let sum =Number(value);
                            lesspaymnt +=sum;
                        }
                    }
                    
                    this.supplierPaymentForm.get('TotalAmountPaid').setValue(lesspaymnt);
                }
               // this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[rowIndex].PaymentAmount=0;  
                sum=this.supplierPaymentForm.get('TotalAmountPaid').value;
            }
        }
               
        if(this.checkedvalue!=true){
        if(sum % 1!=0){
            this.supplierPaymentForm.get('TotalAmountPaid').setValue(sum.toFixed(2));
        }
        else{            
            this.supplierPaymentForm.get('TotalAmountPaid').setValue(sum);
        }
    }
      
        this.checkedvalue=false;

       // this.selectedSupplierPaymentDetails.SupplierInvoiceDetails=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.filter((data,index)=>index>-1);
    }


    Checkmonth(no:number){
        this.showGridErrorMessage7=false;
        if(no>0){
            if(no>12){
                this.showGridErrorMessage7=true;
            }
        }
    }


    Allocateamount(Amount:number){          
        let lastamount:number;
        lastamount=Amount;
        let itemGroupControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails']; 
        if(Amount!=0){
            if(Amount<=this.addtotaloutstanding){
                this.TotalAmount=Amount;
                for(let i=0;i<itemGroupControl.length;i++){                    
                    let columnnamt=itemGroupControl.controls[i].get('OutstandingAmount').value
                    if(columnnamt>0){
                        if(columnnamt<=Amount){            
                            itemGroupControl.controls[i].get('PaymentAmount').setValue(columnnamt);
                            Amount=Amount-columnnamt;
                            this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[i].PaymentAmount=columnnamt;
                        }
                        else{                            
                            if(Amount % 1!=0){
                                itemGroupControl.controls[i].get('PaymentAmount').setValue(Amount.toFixed(2));
                            }
                            else{
                                
                                itemGroupControl.controls[i].get('PaymentAmount').setValue(Amount);
                            }
                            columnnamt=Amount;
                            this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[i].PaymentAmount=Amount;
                        }        
                        this.RemainingAmount=this.TotalAmount-columnnamt;
                        this.TotalAmount=this.RemainingAmount;               
                        this.checkedvalue=true;
                        itemGroupControl.controls[i].get('Checked').setValue(true);   
                        this.selectedSupplierPaymentDetails.SupplierInvoiceDetails=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.filter((data,index)=>index>-1);
                        if(this.RemainingAmount==0)
                        {                            
                            if(lastamount!=Amount||lastamount==Amount){
                            for(let k=i+1;k<itemGroupControl.length;k++){
                                itemGroupControl.controls[k].get('PaymentAmount').setValue(0);
                              //  this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[k].PaymentAmount=0;
                                this.check=true;
                                this.checkedvalue=true;
                                itemGroupControl.controls[k].get('Checked').setValue(false); 
                              //  this.selectedSupplierPaymentDetails.SupplierInvoiceDetails=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails.filter((data,index)=>index>-1);

                            }         
                            this.check=false;  
                        }             
                            break;
                        }
                    }
                }
            }
            else{
                //setting the error for the "Name" control..so as to show the duplicate validation message..                
            this.supplierPaymentForm.get('TotalAmountPaid').setErrors({
                'GreaterValue':true
            });
            }
        }
        else{
            for(let j=0;j<itemGroupControl.length;j++){
                itemGroupControl.controls[j].get('PaymentAmount').setValue('');
                this.check=true;
                this.checkedvalue=true;
                if(itemGroupControl.controls[j].get('Checked').value==true){
                itemGroupControl.controls[j].get('Checked').setValue(false);
                }
            }
            this.supplierPaymentForm.get('TotalAmountPaid').setErrors({
                'Zero':true
            });
            this.check=false;  
    }
        // if(RemainingAmount>0)
        // {
        //     this.supplierPaymentForm.get('Overpayment').setValue(Amount);
        // }

        this.checkedvalue=false;

    }



     /**
     * to save the given purchase order details
     */
    saveRecord() {    
        
        this.formSubmitAttempt = true;
        this.showGridErrorMessage=false;
        this.showGridErrorMessage1=false;
        this.showGridErrorMessage2=false;
        this.showGridErrorMessage3=false;
        this.showGridErrorMessage6=false;        
        var paymnt:number=0;
        
        let itemGroupControl = <FormArray>this.supplierPaymentForm.controls['SupplierInvoiceDetails']; 
        if(itemGroupControl.length==0 && this.supplierid!=undefined){
            this.showGridErrorMessage6=true;
            return;
        }
        let purchaseOrderFormStatus = this.supplierPaymentForm.status;
       // console.log(this.supplierPaymentForm);
        if(purchaseOrderFormStatus!="INVALID")
        {
          
            if(this.supplierPaymentForm.get('TotalAmountPaid').value==0){
                this.showGridErrorMessage3=true;
                return;
            }        
            
            for(let i=0;i<itemGroupControl.length;i++)
            {                
                let totalpayment:number =itemGroupControl.controls[i].get('PaymentAmount').value;
                if(totalpayment!=0)
                paymnt += totalpayment;

            }
            
                     
            // if(paymnt<this.supplierPaymentForm.get('TotalAmountPaid').value){
            //     this.showGridErrorMessage1=true;    
            //     return;
            // }
            // if(paymnt>this.supplierPaymentForm.get('TotalAmountPaid').value){
            //     this.showGridErrorMessage=true;    
            //     return;
            // }

            if(paymnt>this.addtotaloutstanding){
                this.showGridErrorMessage2=true;    
                return;
            }
       
       
            //getting the purchase order form details...
            let itemCategoryDetails:SupplierPayment = this.supplierPaymentForm.value; 
            let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
            itemCategoryDetails.PaymentTypeId=this.PaymentTypeId;       
            //itemCategoryDetails.SupplierInvoiceDetails=this.selectedSupplierPaymentDetails.SupplierInvoiceDetails;
            itemCategoryDetails.CreatedBy = userDetails.UserID;
            itemCategoryDetails.CompanyId = this.companyId;
            this.paymentDetails = itemCategoryDetails;
            if(this.selectedSupplierPaymentDetails.SupplierPaymentId==0||this.selectedSupplierPaymentDetails.SupplierPaymentId==null)
            {
                itemCategoryDetails.SupplierInvoiceDetails=itemCategoryDetails.SupplierInvoiceDetails.filter(i=> i.PaymentAmount>0);
                this.supplierPaymentServiceObj.createSupplierPayment(itemCategoryDetails)
                .subscribe((paymentId:number)=>{
                 
                    this.hidetext = true;
                    this.hideinput = false;
                    this.showGridErrorMessage=false;
                    this.showGridErrorMessage1=false;
                    this.showGridErrorMessage2=false;
                    this.showGridErrorMessage3=false;
                    this.showGridErrorMessage6=false;
                    this.formSubmitAttempt = false;
                    this.GetSupplierPayment(paymentId);
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.SavedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    //creating payment voucher
                    //this.printPaymentVoucher(paymentId);
                });
            }
            else 
            {
             itemCategoryDetails.SupplierInvoiceDetails.forEach((data,index:number)=>{
                if(this.selectedSupplierPaymentDetails.SupplierInvoiceDetails[index].PaymentAmount!=data.PaymentAmount)
                {
                    data.IsChanged=true;
                }
            });   
            itemCategoryDetails.SupplierInvoiceDetails = itemCategoryDetails.SupplierInvoiceDetails.filter(i=>i.IsChanged==true);
            itemCategoryDetails.SupplierPaymentId = this.selectedSupplierPaymentDetails.SupplierPaymentId;
            this.paymentDetails =itemCategoryDetails;
                this.supplierPaymentServiceObj.updateSupplierPayment(itemCategoryDetails)
                    .subscribe((response:any)=>{
                    this.hidetext = true;
                    this.hideinput = false;
                    this.showGridErrorMessage=false;
                    this.showGridErrorMessage1=false;
                    this.showGridErrorMessage2=false;
                    this.showGridErrorMessage3=false;
                    this.showGridErrorMessage6=false;
                    this.formSubmitAttempt = false;
                     //creating payment voucher
                    //this.printPaymentVoucher(itemCategoryDetails.SupplierPaymentId);
                    this.GetSupplierPayment(itemCategoryDetails.SupplierPaymentId);
                    this.deletedSupplierPaymentItems =[];
                    this.deletedSupplierPaymentItems.length=0;
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.UpdatedSuccessFully,
                        MessageType:MessageTypes.Success
                    });

                 
                });
            }
        }
        else {
            Object.keys(this.supplierPaymentForm.controls).forEach((key: string) => {
                if (this.supplierPaymentForm.controls[key].status == "INVALID" && this.supplierPaymentForm.controls[key].touched == false) {
                    this.supplierPaymentForm.controls[key].markAsTouched();
                }
            });
        }
    }
     
    showLeftCol(event)
    {
        $(".leftdiv").removeClass("hideleftcol"); 
        $(".rightPanel").removeClass("showrightcol"); 
    }
    showFullScreen()
    {
 
 
    this.innerWidth = window.innerWidth;       
 if(this.innerWidth > 1000){ 
 FullScreen(this.rightPanelRef.nativeElement);
 }
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
         supplierDetails = this.supplierPaymentForm.get('Supplier').value;
       }
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
    //this method will be called on date picker focus event..
    onDatePickerFocus(element:NgbInputDatepicker)
    {
        console.log("focus");
        if(!element.isOpen())
        {
            element.open();
        }
    }
    printPaymentVoucher() {       
        if(this.supplierPaymentId > 0)  {
        let pdfDocument = this.supplierPaymentServiceObj.getPDFoucher( this.supplierPaymentId, this.companyId);
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
