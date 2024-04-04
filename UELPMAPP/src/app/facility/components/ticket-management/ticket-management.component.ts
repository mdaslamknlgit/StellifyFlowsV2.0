import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {NgbModal, ModalDismissReasons, NgbDateAdapter, NgbDateNativeAdapter} from '@ng-bootstrap/ng-bootstrap';
import { TicketManagementModel, TicketDisplayInput, EmployeeAssign, EmployeeAssignDisplayInput, TicketDisplayResult, TicketList, TicketFilterDisplayInput, TicketSendMessages, TicketManagement } from '../../models/ticket-management.model';
import { SharedService } from '../../../shared/services/shared.service';
import { TicketManagementService } from '../../services/ticket-management.service';
import { ConfirmationService, LazyLoadEvent,SortEvent } from 'primeng/components/common/api';
import { FacilityManagementService } from '../../services/facility-management.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Facilities, PagerConfig, GridDisplayInput, ResponseStatusTypes, Messages, MessageTypes, Engineers, SortingOrderType, GridOperations, UserDetails, ItemMaster, Suppliers, SupplierCategorys, Priority, JobStatus, EngineerList, WorkFlowProcess } from '../../../shared/models/shared.model';
import { FacilityManagementModel } from '../../models/facility-management.model';
import { NUMBER_PATERN } from '../../../shared/constants/generic';
import *  as moment from "moment";
import { DisplayDateFormatPipe } from '../../../shared/pipes/display-date-format.pipe';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { ValidateFileType, FullScreen, restrictMinus } from '../../../shared/shared';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import { environment } from '../../../../environments/environment';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { ActivatedRoute, Router} from '@angular/router';


@Component({
  selector: 'app-ticket-management',
  templateUrl: './ticket-management.component.html',
  styleUrls: ['./ticket-management.component.css'],
  providers:[TicketManagementService,FacilityManagementService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class TicketManagementComponent implements OnInit {   
    leftsection:boolean=false;
    rightsection:boolean=false;
    htmlContent:string;
    closeResult: string;
    signupForm: FormGroup;
    engineerForm:FormGroup;
    slideactive:boolean=false;
    billingto:boolean=false;
    selectedfacility:number;
    selectedengineers:Engineers;
    isDisplayMode?:boolean = true;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    totalRecords:number = 0;
    ticketList: Array<TicketList> = [];
    ticketsmanagement : Array<TicketManagementModel> = [];
    selectedticketManagementRecord:TicketManagementModel;
    formSubmitAttempt: boolean = false;
    recordsToSkip:number = 0;
    recordsToFetch:number = 10;
    companyId:number;
    sortingOrder:string="";
    sortingExpr:string="";
    ticketPagerConfig:PagerConfig;
    facilitymanagement:FacilityManagementModel;
    uploadedFiles:Array<File>=[];
    scrollbarOptions: any;
    gridColumns:Array<{field:string,header:string}>= [];
    gridEngineerColumns:Array<{field:string,header:string}>= [];
    EngineerName:string;
    recordInEditMode:number;
    operation:string;
    isLoading:boolean = false;
    EngineerAssignList:Array<EmployeeAssign> = [];
    employeeassign:Array<EmployeeAssign> = [];
    employeeassigned:Array<EmployeeAssign> = [];
    deletedEmployeeAssign:Array<number> =[];
    apiEndPoint:string;
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    ticketSearchKey: string = null;
    gridInventoryColumns: Array<{ field: string, header: string }> = [];
    gridSupplierColumns: Array<{ field: string, header: string }> = [];
    measurementUnits: MeasurementUnit[] = [];
    selectedRowId: number = -1;
    linesToAdd: number = 2;
    showGridErrorMessage: boolean = false;
    showGridErrorMessage1:boolean=false;
    deletedInventoryItems: Array<number> = [];
    deletedSubContractorItems: Array<number> = [];
    categoryId:number;
    supplierCategory: Array<SupplierCategorys> = [];
    showLeftPanelLoadingIcon:boolean = false;
    showRightPanelLoadingIcon:boolean=false;  
    prioritytypes: Priority[]=[];
    engineerList: EngineerList[]=[];
    @ViewChild('ticketcode') private ticketRef: any;
    initDone = false;
    isFilterApplied: boolean = false;   
    filteredticket = [];
    filterMessage: string = "";
    initSettingsDone = true; 
    TicketFilterInfoForm: FormGroup;
    deleteuncheck:Array<number>=[];
    vendoruploadedFiles: Array<{ File: File, RowIndex: number }> = [];
    selectedFileRowIndex: number = 1;
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;
    @ViewChild('rightPanel') rightPanelRef;

      constructor(private modalService: NgbModal,public activatedRoute:ActivatedRoute,private formBuilderObj:FormBuilder,private sharedServiceObj:SharedService,private ticketManagementServiceObj:TicketManagementService,
        private confirmationServiceObj:ConfirmationService,private facilityManagementServiceObj:FacilityManagementService,private reqDateFormatPipe:RequestDateFormatPipe,
        private displayDateFormatPipe:DisplayDateFormatPipe,public sessionService: SessionStorageService,private renderer: Renderer ) { 

          this.companyId = this.sessionService.getCompanyId();


          this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'EngineerName', header: 'Engineer Name' },
            { field: 'Availablity', header: 'Availablity' },
            { field: 'Assign', header: 'Assign' }
          ];

           this.gridEngineerColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'EngineerName', header: 'Engineer Name' },
            { field: 'Contact', header: 'Contact No.' },
            { field: 'Email', header: 'Email' },
            { field: 'Status', header: 'Status' }
          ];

          this.gridInventoryColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Item Name' },
            { field: 'Description', header: 'Description' },
            { field: 'UOM', header: 'UOM' },
            { field: 'ExistingQty', header: 'Existing Qty.' },
            { field: 'Quantity', header: 'Quantity' },
            { field: 'Price', header: 'Price' },
            { field: 'Total', header: 'Total' },
            { field: 'Status', header: 'Status' }
        ];

        this.gridSupplierColumns = [
          { field: 'Sno', header: 'S.no.' },
          { field: 'Name', header: 'Category Name' },
          { field: 'SupName', header: 'Supplier Name' },
          { field: 'Contact', header: 'Contact' },
          { field: 'Email', header: 'Email' },
          { field: 'QuotationAmount', header: 'Quotation Amount' },
          { field: 'Attachment', header: 'Attachment' },
          { field: '', header: 'Choose' }
      ];

          this.apiEndPoint = environment.apiEndpoint;
          
    }

    tablestyle={
        "font-size":"14px"
      }

    ngOnInit() {
     // this.specifiedparameter();
      let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
      let userid = userDetails.UserID;

      this.selectedticketManagementRecord = new TicketManagementModel();


      this.ticketPagerConfig = new PagerConfig();
      this.ticketPagerConfig.RecordsToSkip = 0;
      this.ticketPagerConfig.RecordsToFetch = 10;

      this.signupForm = this.formBuilderObj.group({ 
        'Facility': ["", [Validators.required]],
        'TicketPriority': ["", [Validators.required]],
        'PreferredServiceDatetime': [null, [Validators.required]],
        'PrefferedFromTime': [null, [Validators.required]],
        'PrefferedToTime': [null, [Validators.required]],
        'isBillable': [false],
        'IsbilltoTenant': ["", [Validators.required]],
        'JobStatus': [""],
        'BillAmount': [0],
        'JobDesciption': ["", [Validators.required]],
        'Remarks':[""],
        'Engineerlist':[""],
        'Name': [""],
        'Contact': [""],
        'Email': [""],
        'EngineerAssignList':this.formBuilderObj.array([]),
        'InventoryItems': this.formBuilderObj.array([]),
        'SubContractorItem': this.formBuilderObj.array([])
      });

      this.TicketFilterInfoForm = this.formBuilderObj.group({
        TicketNo: [''],
        Facility: [''],
        Priority:['']
    });

      this.engineerForm = this.formBuilderObj.group({  
        'User': [null],
        'Date': [null, [Validators.required]],
        'FromEmployeeTime': [null, [Validators.required]],
        'ToEmployeeTime': [null, [Validators.required]],
      });
      this.getProirityList();
      this.getMeasurementUnits();
      this.getSuppliercategory();

      
      this.sharedServiceObj.CompanyId$
        .subscribe((data)=>{
          this.companyId = data;
          this.getticketManagement(0);         
        });

        this.activatedRoute.paramMap.subscribe((data)=>{
            this.ticketSearchKey = this.activatedRoute.snapshot.paramMap.get('poCode');   
            if(this.ticketSearchKey!=""&&this.ticketSearchKey!=null)
            {
                let processId = Number(this.activatedRoute.snapshot.paramMap.get('processId'));
                let poId = Number(this.activatedRoute.snapshot.paramMap.get('poId'));
                this.getAllSearchTicket("",poId);
            }
            else
            {
                this.getticketManagement(0);
            }
        });
    }

   

      getTicketEngineers(ticketId:number){
        this.ticketManagementServiceObj.getTicketEngineer(ticketId)
        .subscribe((data:TicketManagementModel)=>{
  
            this.selectedticketManagementRecord.EngineerAssignList =  data.EngineerAssignList;
           // this.employeeassigned=data.EngineerAssignList;
            this.signupForm.patchValue(data.EngineerAssignList);
        });
      }

      
  
    
    checkavailability(){
        
        let dateControl = this.engineerForm.get('Date').value;
        dateControl=moment(dateControl).format('YYYY-MM-DD ').toLocaleString();
        let fromTimeControl = this.engineerForm.get('FromEmployeeTime').value;

        fromTimeControl=moment(fromTimeControl).format('HH:mm').toLocaleString();
        fromTimeControl=dateControl+fromTimeControl;
     
        let toTimeControl = this.engineerForm.get('ToEmployeeTime').value; 
        toTimeControl=moment(toTimeControl).format('HH:mm').toLocaleString();
        console.log("date",dateControl);
        toTimeControl=dateControl+toTimeControl;
        let displayInput = {
            FromTime : fromTimeControl,
            ToTime : toTimeControl,
            TicketId:this.selectedticketManagementRecord.TicketId==null?0:this.selectedticketManagementRecord.TicketId
            };
            console.log(fromTimeControl,toTimeControl);
        this.ticketManagementServiceObj.getEngineerslist(displayInput)
        .subscribe((data:Array<EmployeeAssign>)=>{         
            this.employeeassign = data; 
            this.operation = GridOperations.Display;
            this.isLoading = false;
        });
    }

    getEngineerlist() {      
       this.isLoading = true;       
       this.employeeassign.length=0;
       this.employeeassign=[];
        
        let date=this.signupForm.get('PreferredServiceDatetime').value;
        this.engineerForm.get('Date').setValue(date);
        date=moment(date).format('YYYY-MM-DD ').toLocaleString();       
        let fromtime= moment(this.signupForm.get('PrefferedFromTime').value).format('HH:mm').toLocaleString();
        this.engineerForm.get('FromEmployeeTime').setValue(fromtime);
        fromtime=date+fromtime;
        let totime= moment(this.signupForm.get('PrefferedToTime').value).format('HH:mm').toLocaleString();
        this.engineerForm.get('ToEmployeeTime').setValue(totime);
        totime=date+totime;
        let displayInput = {
            FromTime : fromtime,
            ToTime : totime,
            TicketId:this.selectedticketManagementRecord.TicketId==null?0:this.selectedticketManagementRecord.TicketId
            };
            console.log(fromtime,totime);
        this.ticketManagementServiceObj.getEngineerslist(displayInput)
        .subscribe((data:Array<EmployeeAssign>)=>{         
            this.employeeassign = data; 
            this.operation = GridOperations.Display;
            this.isLoading = false;
        });
    }

    getEngineerlist1() {      
        this.isLoading = true;
        this.engineerForm.get('Date').setValue(new Date());
        this.engineerForm.get('FromEmployeeTime').setValue(new Date());
        this.engineerForm.get('ToEmployeeTime').setValue(new Date());
             let displayInput = {
            FromTime : moment(new Date()).format('HH:mm').toLocaleString(),
            ToTime : moment(new Date()).format('HH:mm').toLocaleString(),
            TicketId:this.selectedticketManagementRecord.TicketId==null?0:this.selectedticketManagementRecord.TicketId
            };

        this.ticketManagementServiceObj.getEngineerslist(displayInput)
        .subscribe((data:Array<EmployeeAssign>)=>{         
            this.employeeassign = data; 
            this.operation = GridOperations.Display;
            this.isLoading = false;
        });
    }



    getAssignEngineerlist() {  
        this.ticketManagementServiceObj.getAssignEngineerlist().subscribe((data:Array<EmployeeAssign>)=>{         
            this.selectedticketManagementRecord.EngineerAssignList = data; 
            this.operation = GridOperations.Display;
            this.isLoading = false;
        });
    }

    checkstatus(rowIndex:number,status:boolean) {
        if(this.engineerForm.status!="INVALID")
        {                
            
            let record =this.employeeassign[rowIndex];
            // if(status==false){
            //     this.deleteuncheck.push(record.TicketEngineerId);
            // }
           
            this.ticketManagementServiceObj.checkEngineerStatus(record.UserId).subscribe((data)=>{
                if(data==0){
                record.IsAssigned=status;
                this.employeeassign = this.employeeassign.filter(i=>i.UserId>0);
                }
                });              
                
        }
        else{
          this.engineerForm.markAsUntouched();
        }
      }



  open(assignengineer,rowData,employeeassign) {     
    //  
      let date=this.signupForm.get('PreferredServiceDatetime').value;
      this.engineerForm.get('Date').setValue(date);
    //  date=moment(date).format('YYYY-MM-DD ').toLocaleString();      
    //  let fromtime= moment(this.signupForm.get('PrefferedFromTime').value).format('HH:mm').toLocaleString();
      let fromtime= new Date(this.signupForm.get('PrefferedFromTime').value);
      this.engineerForm.get('FromEmployeeTime').setValue(fromtime);
     // fromtime=date+fromtime;
     // let totime= moment(this.signupForm.get('PrefferedToTime').value).format('HH:mm').toLocaleString();
      let totime= new Date(this.signupForm.get('PrefferedToTime').value);
      this.engineerForm.get('ToEmployeeTime').setValue(totime);
     // totime=date+totime;


      let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
      this.modalService.open(assignengineer, { size: 'lg' }).result.then((result) => { 
        if(result=="Done click"){
            
            let date=this.engineerForm.get('Date').value;
            this.signupForm.get('PreferredServiceDatetime').setValue(new Date(this.engineerForm.get('Date').value)); 
            let fromtime=this.engineerForm.get('FromEmployeeTime').value;
            this.signupForm.get('PrefferedFromTime').setValue(new Date(fromtime));
            let totime=this.engineerForm.get('ToEmployeeTime').value;
            this.signupForm.get('PrefferedToTime').setValue(new Date(totime));
         

          this.employeeassign.filter(i=>i.IsAssigned===true && i.IsAdded!=true).forEach(i=>{
            i.IsAdded=true;
            i.CompanyId=this.companyId;
            i.CreatedBy = userDetails.UserID;
            i.AssignmentFromDateTime = fromtime;
            i.AssignmentToDateTime= totime;  
            i.EngineerStatusId=8;        
            i.StatusName='Pending Acceptance';
            if(this.selectedticketManagementRecord.EngineerAssignList.findIndex(j=>j.UserId==i.UserId)==-1)
            {
                this.selectedticketManagementRecord.EngineerAssignList.push(i); 
            }                    
          });

          this.employeeassign.filter(i=>i.IsAssigned===false && i.IsAdded==true).forEach(i=>{
            i.IsAdded = false;
            let recordIndex = this.selectedticketManagementRecord.EngineerAssignList.findIndex(j=>j.UserId==i.UserId);
            this.selectedticketManagementRecord.EngineerAssignList.splice(recordIndex,1);
            this.deleteuncheck.push(i.UserId);
          });

        //   
        //   let ticketmanagementDetails:TicketManagementModel = this.signupForm.value;
        //   ticketmanagementDetails.EngineerAssignList=this.EngineerAssignList;
        //   ticketmanagementDetails.EmployeeAssignToDelete=this.deleteuncheck;

        //   if(this.deleteuncheck.length>0){
        //     this.ticketManagementServiceObj.deleteuncheckEngineer(ticketmanagementDetails.EmployeeAssignToDelete).subscribe(()=>{

        //         this.deleteuncheck.length=0;
        //         this.deleteuncheck=[];
        //     });
        //   }

        //   this.ticketManagementServiceObj.createAssignEngineer(ticketmanagementDetails.EngineerAssignList).subscribe(()=>{
        //     this.EngineerAssignList.length=0;
        //     this.EngineerAssignList=[];
        //     this.employeeassign.length=0;
        //     this.employeeassign=[];

        //     this.getTicketEngineers(this.selectedticketManagementRecord.TicketId);
        // });


          this.employeeassign = this.employeeassign.filter(i=>i.UserId>0);
        }
      
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      if(this.selectedticketManagementRecord.TicketId>0)
        {
          // this.employeeassign.filter(i=>i.IsAssigned===true).forEach(i=>{            
          //   });  
          console.log(employeeassign);
            for(var j=0;j<rowData.length;j++)
            {
              //for(var i=0;i<employeeassign.filter(x=>x.UserId==rowData[j].UserId).length;i++)
              for(var i=0;i<employeeassign.length;i++)
              {
                if (rowData[j].UserId == employeeassign[i].UserId) {
                  let record =this.employeeassign[i];
                  record.IsAssigned=true;
                  record.IsAdded=true;
              }
              }
            }
        }
    }

    sendMessages() {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let Remarks = this.signupForm.get('Remarks').value;
        if((Remarks==""||Remarks==null))
        {
            this.signupForm.get('Remarks').setErrors({"required":true});
            this.signupForm.get('Remarks').markAsTouched();
            return ;
        }
        let ticketSendMessages: TicketSendMessages = {
            TicketId: this.selectedticketManagementRecord.TicketId,
            UserId: userDetails.UserID,
            Remarks: Remarks,
            Engineer_TenantId:this.signupForm.get('Engineerlist').value,
            ProcessId:WorkFlowProcess.Ticket,
            UserName:"",
            Engineer_TenantName:""    ,
            TicketNo:this.selectedticketManagementRecord.TicketNo,
            CompanyId:this.companyId
        };
        this.ticketManagementServiceObj.ticketsendmessage(ticketSendMessages)
            .subscribe((data) => {
                this.signupForm.get('Remarks').setValue("");
                this.signupForm.get('Engineerlist').setValue("");
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.SentMessage,
                    MessageType: MessageTypes.Success
                });
                this.getticketManagement(0);
            });
        }


    getProirityList() {
        this.sharedServiceObj.getPriorityList().subscribe((data: Priority[]) => {
            this.prioritytypes = data;
        });
    }

    getEngineerCommentList(ticketId:number) {
        this.sharedServiceObj.getEngineerList(ticketId).subscribe((data: EngineerList[]) => {
            this.engineerList = data;
        });
    }

    getSuppliercategory() {
      this.sharedServiceObj.getSupplierCategoryGroups()
          .subscribe((data: SupplierCategorys[]) => {
              this.supplierCategory = data;
          });
  }


    showFullScreen(){
          FullScreen(this.rightPanelRef.nativeElement);
      }

      getMeasurementUnits() {
        this.sharedServiceObj.getUOMList()
            .subscribe((data: MeasurementUnit[]) => {
                this.measurementUnits = data;
            });
    }

//     specifiedparameter(){
//       this.selectedticketManagementRecord={
//         TicketId: 0,
//         TicketNo: "",
//         FacilityID: 0,
//         TicketPriority: "",
//         PreferredServiceDatetime:null,
//         PrefferedFromTime:null,
//         PrefferedToTime:null,
//         isBillable: false,
//         IsbilltoTenant:  0,
//         JobStatus:"",
//         BillAmount:0,
//         JobDesciption: "",
//         CreatedBy: 0,
//         Updatedby: 0,
//         Remarks : "",
//         UnitNumber:"",
//         CompanyId:0,
//         EngineerAssignList:[],
//         EmployeeAssignToDelete:[],
//         InventoryItems:[],
//         InventoryItemsToDelete:[],
//         SubContractorItem:[],
//         SubContractorItemToDelete:[],
//         PriorityId:0,
//         PriorityName:"",
//         TicketQuotationAttachment:[],
//         TicketQuotationAttachmentDelete:[],
//         TicketQuotationAttachmentUpdateRowId:[],
//         WorkFlowComments:[],
//         TicketSendMessages:[]
//       };
//       this.employeeassign.length=0;
//       this.employeeassign=[];
//       this.facilitymanagement=null;
//   }

  faclityInputFormater = (x: Facilities) => x.UnitNumber;
  
/**
 * this mehtod will be called when user gives contents to the  "facility" autocomplete...
*/
  facilitySearch = (text$: Observable<string>) =>

    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term =>
            this.sharedServiceObj.getFacilities({
              searchKey: term,
              companyId:this.companyId
            }).pipe(
            catchError(() => {
                return of([]);
            }))
        )
    );

    engineerInputFormater = (x: Engineers) => x.Name;
  
    /**
     * this mehtod will be called when user gives contents to the  "facility" autocomplete...
    */
        engineerSearch = (text$: Observable<string>) =>
    
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getEngineersbykey(term).pipe(
                catchError(() => {
                    return of([]);
                }))
            )
        );


        itemMasterInputFormater = (x: ItemMaster) => x.ItemName;       

        /**
         * this mehtod will be called when user gives contents to the  "item master" autocomplete...
         */
        itemMasterSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(term => {
                    if (term == "") {                  
                        let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems'];
                        if(itemGroupControl.controls[this.selectedRowId]!=undefined)
                        {
                            let inventoryItemId = itemGroupControl.controls[this.selectedRowId].get('InventoryItemId').value;   
                            itemGroupControl.controls[this.selectedRowId].reset();
                            itemGroupControl.controls[this.selectedRowId].get('InventoryItemId').setValue(inventoryItemId);
                        }
                        return of([]);
                    }
                    return this.sharedServiceObj.getItemMasterByKey({
                        searchKey: term,
                        CompanyId:this.companyId,
                        LocationID: null
                    }).pipe(
                        catchError(() => {
                            return of([]);
                        }));
                })
            );


        supplierCategoryInputFormater = (x: SupplierCategorys) => x.CategoryText;
        /**
         * this mehtod will be called when user gives contents to the  "item master" autocomplete...
         */
        supplierCategorySearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(term => {
                    if (term == "") {                  
                        let itemGroupControl = <FormArray>this.signupForm.controls['SubContractorItem'];
                        if(itemGroupControl.controls[this.selectedRowId]!=undefined)
                        {
                            let SubContractorId = itemGroupControl.controls[this.selectedRowId].get('SubContractorItem').value;   
                            itemGroupControl.controls[this.selectedRowId].reset();
                            itemGroupControl.controls[this.selectedRowId].get('SubContractorItem').setValue(SubContractorId);
                        }
                        return of([]);
                    }
                    return this.sharedServiceObj.getSupplierCategoryByKey({
                        searchKey: term
                    }).pipe(
                        catchError(() => {
                            return of([]);
                        }));
                })
            );


        supplierInputFormater = (x: Suppliers) => x.SupplierName;

        supplierSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(term => {
                     let itemGroupControl1 = <FormArray>this.signupForm.controls['SubContractorItem'];
                        let SubContractorId1 = itemGroupControl1.controls[this.selectedRowId].get('SupplierCategoryID').value;   
                        console.log(SubContractorId1);
                    return this.sharedServiceObj.getSupplierByKey({
                        searchKey: term,
                        CategoryId: SubContractorId1,
                        CompanyId:this.companyId  
                    }).pipe(
                        catchError(() => {
                            return of([]);
                        }));
                })
            );

  supplierSelection(eventData: any, index: number) { 
    let itemGroupControl = <FormArray>this.signupForm.controls['SubContractorItem'];
    itemGroupControl.controls[index].patchValue({
        SupplierEmail: eventData.item.SupplierEmail,
        BillingTelephone: eventData.item.BillingTelephone
    });
}

  getticketManagement(ticketIdToBeSelected: number)
  {  
    this.uploadedFiles.length =0;
    this.uploadedFiles = [];
    let displayInput = {
              Skip : this.ticketPagerConfig.RecordsToSkip,
              Take : this.ticketPagerConfig.RecordsToFetch,
              Search: "",
              CompanyId:this.companyId   
      };
      this.ticketManagementServiceObj.getTickets(displayInput)
          .subscribe((data: TicketDisplayResult)=>{
              this.ticketList = data.Tickets;
              this.ticketPagerConfig.TotalRecords =  data.TotalRecords;
              this.showLeftPanelLoadingIcon=false;
              if(this.ticketList.length > 0)
              {   
                  if(ticketIdToBeSelected==0){
                // let date =  moment(this.ticketsmanagement[0].PreferredServiceDatetime).format("DD-MM-YYYY").toLocaleString();
                  this.onItemRecordSelection(this.ticketList[0].TicketId);  
                  }
                  else
                  {
                    this.onItemRecordSelection(ticketIdToBeSelected);  
                  }                
                  this.recordInEditMode = -1;
                  this.operation = GridOperations.Display;
              }
              else
              {
                this.addRecord();
              }
          });
  }

    onItemClick(rowId: number) {
      this.selectedRowId = rowId;
    }

  onSupplierItemClick(rowId:number){
      this.selectedRowId = rowId;
  }

          
     onSearchInputChange(event: any) {
      if (this.ticketSearchKey != "") {
          if (this.ticketSearchKey.length >= 3) {
              this.getAllSearchTicket(this.ticketSearchKey, 0);
  }
      }
      else {
          this.getticketManagement(0);
      }
  }


  getAllSearchTicket(searchKey: string, ticketIdToBeSelected: number) {
    //getting the list of purchase orders...
    let displayInput = {
        Skip: 0,
        Take: this.ticketPagerConfig.RecordsToFetch,
        Search: searchKey,
        CompanyId:this.companyId
    };
    this.ticketManagementServiceObj.getTickets(displayInput)
        .subscribe((data: TicketDisplayResult) => {
            this.ticketList = data.Tickets
            this.ticketPagerConfig.TotalRecords = data.TotalRecords
            if (this.ticketList.length > 0) {
                if (ticketIdToBeSelected == 0) {
                    this.onItemRecordSelection(this.ticketList[0].TicketId);
                }
                else {
                    this.onItemRecordSelection(ticketIdToBeSelected);
                }
            }
            else {
                this.addRecord();
            }
        });
}


  onItemRecordSelection(ticketId: number)
  {      
    this.showGridErrorMessage1 = false;
    this.showGridErrorMessage = false;
    this.getEngineerlist1(); 
    this.getEngineerCommentList(ticketId);
    this.ticketManagementServiceObj.getTicketDetails(ticketId)
            .subscribe((record: TicketManagementModel) => {
            
                  let minAndHours = record.PrefferedFromTime.toString().split(":");
                  let prefferedFromDateTime = new Date();
                  prefferedFromDateTime.setHours(Number(minAndHours[0]));
                  prefferedFromDateTime.setMinutes(Number(minAndHours[1]));
          
                  let toMinAndHours = record.PrefferedToTime.toString().split(":");
                  let prefferedToDateTime = new Date();
                  prefferedToDateTime.setHours(Number(toMinAndHours[0]));
                  prefferedToDateTime.setMinutes(Number(toMinAndHours[1]));
                  record.PrefferedFromTime = prefferedFromDateTime;
                  record.PrefferedToTime = prefferedToDateTime;
                  this.getfacilitiesdetails(record.FacilityID);  
                  this.selectedticketManagementRecord = record;
                  console.log(this.selectedticketManagementRecord);   
                  
                  if(record.InventoryItems.length>0){
                    for(let i=0;i<record.InventoryItems.length;i++){
                       if(record.InventoryItems[i].ItemQty>record.InventoryItems[i].Item['ExistingQuantity'])
                       {
                           record.InventoryItems[i].Status='Stock Not Available';
                       }
                       else if(record.InventoryItems[i].ItemQty<=record.InventoryItems[i].Item['ExistingQuantity'])
                       {
                           
                           record.InventoryItems[i].Status='Stock Available';
                       }
                    }
                }               
                  this.signupForm.patchValue(record);  
                  this.hidetext = true;
                  this.hideinput = false;
                                 

            });       
  }

  openDialog() {
    this.initDone = true;
    if (this.ticketRef != undefined) {
        this.ticketRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.ticketRef.nativeElement, 'focus'); // NEW VERSION
    }
}

  resetData() {
      this.isFilterApplied = false;
      this.initDone = true;
      this.resetFilters();
  }
  resetFilters() {
    this.TicketFilterInfoForm.get('TicketNo').setValue("");
    this.TicketFilterInfoForm.get('Facility').setValue("");
    this.TicketFilterInfoForm.get('Priority').setValue("");
    this.filterMessage = "";
    this.filteredticket = this.ticketList;
    if (this.filteredticket.length > 0) {
        this.getticketManagement(0);
    }

    this.isFilterApplied = false;
    if (this.ticketRef != undefined) {
        this.ticketRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.ticketRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  openSettingsMenu() {
    this.initSettingsDone = true;
  }

  filterData() {      
    let ticketNo = "";
    let facility = "";
    let priority = "";        
    this.filterMessage = "";
    if (this.TicketFilterInfoForm.get('TicketNo').value != "") {
      ticketNo = this.TicketFilterInfoForm.get('TicketNo').value;
    }

    if (this.TicketFilterInfoForm.get('Facility').value != "") {
      facility = this.TicketFilterInfoForm.get('Facility').value;
    }

    if (this.TicketFilterInfoForm.get('Priority').value != "") {
      priority = this.TicketFilterInfoForm.get('Priority').value;
    }
    
    if (ticketNo === '' && facility === "" && priority === '') {
        if (open) {
            this.filterMessage = "Please select any filter criteria";
        }
        return;
    }

      let ticketFilterDisplayInput: TicketFilterDisplayInput = {
        Skip: this.ticketPagerConfig.RecordsToSkip,
        Take: this.ticketPagerConfig.RecordsToFetch,
        TicketNoFilter: ticketNo,
        FacilityFilter: facility,
        PriorityFilter: priority,
        CompanyId:this.companyId
      };

      this.ticketManagementServiceObj.getFilterTicket(ticketFilterDisplayInput)

      .subscribe((data: TicketDisplayResult) => {
          if ( data.TotalRecords > 0) {
              this.isFilterApplied = true;
              if (open) {
                  this.initDone = false;
              }
              this.ticketPagerConfig.TotalRecords = data.TotalRecords;
              this.ticketList = data.Tickets;
              this.onItemRecordSelection(this.ticketList[0].TicketId);
          }
          else {
              this.filterMessage = "No matching records are found";
              // this.addRecord();
          }
      }, (error) => {

          this.hidetext = false;
          this.hideinput = true;
          //remove this code after demo...
      });


}

  
  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }


  onFacilitySelection(event:any) {
    this.selectedfacility = event.item.FacilityId;
    this.getfacilitiesdetails(event.item.FacilityId);
  }

  onengineerSelection(event:any){
      let employeerecord=event.item;
      setTimeout(()=>{
        this.getassignengineerlist();
      },1000);
    
  }

  onFileUploadChange(event:any)
  {
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

  onFileClose(fileIndex:number)
  {
      this.uploadedFiles = this.uploadedFiles.filter((file,index)=>index!=fileIndex);
  }

 

    // getTicketAttachments(ticketId:number){
    //   this.ticketManagementServiceObj.getTicketAttachment(ticketId)
    //   .subscribe((data:TicketManagementModel)=>{

    //       this.selectedticketManagementRecord.Attachments =  data.Attachments;
    //      // this.operation = GridOperations.Display;
    //       this.signupForm.patchValue(data.Attachments);
    //   });
    // }

  

  getfacilitiesdetails(facilityId:number){   
          let requestObj:TicketDisplayInput = {
            FacilityId:facilityId,                    
            Skip:this.recordsToSkip,
            Take:this.recordsToFetch,
            SortDir:this.sortingOrder,
            SortExpr:this.sortingExpr
        };
        this.facilityManagementServiceObj.getFacilityManagementById(requestObj)
        .subscribe((data:FacilityManagementModel )=>{
          console.log("data",this.facilitymanagement);
          this.facilitymanagement = data;
        });  
  }

  addRecord(){
    this.hidetext = false;
    this.hideinput = true;
    this.selectedticketManagementRecord = new TicketManagementModel();
    //this.specifiedparameter();
    this.signupForm.reset();
    this.employeeassign=[];
    this.employeeassign.length=0;    
    this.facilitymanagement=null;
    this.selectedticketManagementRecord.EngineerAssignList=[];
    this.signupForm.get('PreferredServiceDatetime').setValue(new Date());
    this.signupForm.get('PrefferedFromTime').setValue(new Date());
    this.signupForm.get('PrefferedToTime').setValue(new Date());
    this.signupForm.patchValue({
      IsbilltoTenant: "0",
      isBillable:false,
      BillAmount:0
    });
    let itemGroupControl = <FormArray>this.signupForm.controls['EngineerAssignList'];
    itemGroupControl.controls =[];
    itemGroupControl.controls.length =0;
    let itemGroupControl1 = <FormArray>this.signupForm.controls['InventoryItems'];
    itemGroupControl1.controls = [];
    itemGroupControl1.controls.length = 0;
    let itemGroupControl2 = <FormArray>this.signupForm.controls['SubContractorItem'];
    itemGroupControl2.controls = [];
    itemGroupControl2.controls.length = 0;
    this.getEngineerlist1(); 
    //this.showFullScreen();
    console.log(this.selectedticketManagementRecord);
    this.showfilters =false;
    this.showfilterstext="Show List" ;
  }


  convertTime(str:string) {
    var date = new Date(str),
    mnth = ("0" + (date.getMonth()+1)).slice(-2),
    day  = ("0" + date.getDate()).slice(-2),
    hours  = ("0" + date.getHours()).slice(-2),
    minutes = ("0" + date.getMinutes()).slice(-2);
    return [hours, minutes].join(":");
  }



  editRecord(){       
    this.hideinput = true;
    this.hidetext = false; 
    this.signupForm.reset();
    this.signupForm.get('InventoryItems').reset();
    this.signupForm.get('SubContractorItem').reset();
    this.signupForm.setErrors(null);
    // this.employeeassign=[];
    // this.employeeassign.length=0;        
    let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems'];
    itemGroupControl.controls = [];
    itemGroupControl.controls.length = 0;
    let itemGroupControl1 = <FormArray>this.signupForm.controls['SubContractorItem'];
    itemGroupControl1.controls = [];
    itemGroupControl1.controls.length = 0;
    this.addGridItem(this.selectedticketManagementRecord.InventoryItems.length);
    this.addGridItem1(this.selectedticketManagementRecord.SubContractorItem.length);
      this.signupForm.patchValue(this.selectedticketManagementRecord);
      this.signupForm.get('PreferredServiceDatetime').setValue(new Date(this.selectedticketManagementRecord.PreferredServiceDatetime));
      this.signupForm.get('IsbilltoTenant').setValue(this.selectedticketManagementRecord.IsbilltoTenant == 0 ? "0" : "1");
      console.log(this.selectedticketManagementRecord);
      this.selectedfacility=this.selectedticketManagementRecord.FacilityID;

      this.signupForm.get('Facility').setValue({
        FacilityId:this.selectedticketManagementRecord.FacilityID,
        UnitNumber:this.selectedticketManagementRecord.UnitNumber
      });    
  }

    addGridItem(noOfLines: number) {
      let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems'];
      for (let i = 0; i < noOfLines; i++) {
          itemGroupControl.push(this.initGridRows());
      }
    }
    addGridItem1(noOfLines: number) {
      let itemGroupControl1 = <FormArray>this.signupForm.controls['SubContractorItem'];
      for (let i = 0; i < noOfLines; i++) {
          itemGroupControl1.push(this.initGridRows1());
      }
    }
      
    initGridRows() {
      return this.formBuilderObj.group({
          'Sno':0,          
          'InventoryItemId': 0,
          'ItemDescription': [""],
          'MeasurementUnitID': [0],
          'ExistingQuantity':[""],
          'Item': [null, [Validators.required]],          
          'ItemQty': [0], 
          'Price': [0],          
          'Status': "",       
          "IsModified": false
      });
    }

    initGridRows1() {
      return this.formBuilderObj.group({
          'Sno':0,          
          'SubContractorId': 0,
          'BillingTelephone': [""],
          'SupplierEmail': [""],
          'QuotationAmount': [0],
          'SupplierCategoryID': [null, [Validators.required]],
          'CategoryText': [""],
          //'Category': [null],          
          'Supplier': [null, [Validators.required]],              
          "IsModified": false
      });
    }

  itemMasterSelection(eventData: any, index: number) {   
          
    let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems'];
    //setting the existing qty based on user selection
    itemGroupControl.controls[index].patchValue({
        ItemDescription: eventData.item.Description,
        MeasurementUnitID: eventData.item.MeasurementUnitID,
        ExistingQuantity:eventData.item.ExistingQuantity,
        Price: eventData.item.Price
    });
  }

  checkQuantity(index:number){
               
        let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems']; 
        let Itemvalue= itemGroupControl.controls[index].get('Item').value;
        let ItemQty= itemGroupControl.controls[index].get('ItemQty').value;
        if(ItemQty>Itemvalue['ExistingQuantity']){
            itemGroupControl.controls[index].get('Status').setValue('Stock Not Available');
        }
        else if(ItemQty<=Itemvalue['ExistingQuantity']){
            
            itemGroupControl.controls[index].get('Status').setValue('Stock Available');
         
        }
        else{
            itemGroupControl.controls[index].get('Status').setValue('');
        }
  }

  
  categorySelection(eventData: number, rowIndex: number) {    
    this.categoryId=eventData;
    console.log(this.categoryId);
  }

  deleteEngineer(){
    let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
    this.ticketManagementServiceObj.deleteEngineer(userDetails.UserID)
    .subscribe((data)=>{
        this.getTicketEngineers(this.selectedticketManagementRecord.TicketId);
    });
  }

  deleteRecord()
  {
    let recordId = this.selectedticketManagementRecord.TicketId;
    let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
    this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header:Messages.DeletePopupHeader,
        accept: () => {     
          this.ticketManagementServiceObj.deleteTicket(recordId,userDetails.UserID).subscribe((data)=>{
                this.sharedServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.DeletedSuccessFully,
                    MessageType:MessageTypes.Success
                });
                this.getticketManagement(0);
          });
        },
        reject: () => {
        }
    });
  }

  saveRecord(){   
    this.formSubmitAttempt = true;   
    let ticketFormStatus = this.signupForm.status;    
    if(ticketFormStatus!="INVALID")
    {
        let ticketmanagementDetails:TicketManagementModel = this.signupForm.value;
        ticketmanagementDetails.EngineerAssignList=this.selectedticketManagementRecord.EngineerAssignList;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        ticketmanagementDetails.CreatedBy = userDetails.UserID;
        ticketmanagementDetails.CompanyId = this.companyId;
        ticketmanagementDetails["FacilityID"]=this.selectedfacility;     
        if(ticketmanagementDetails.BillAmount.toString()==""||ticketmanagementDetails.BillAmount==null){
            ticketmanagementDetails.BillAmount=0;
        }
        ticketmanagementDetails["PreferredServiceDatetime"]= this.reqDateFormatPipe.transform(ticketmanagementDetails.PreferredServiceDatetime);
        ticketmanagementDetails["PrefferedFromTime"]= moment(ticketmanagementDetails.PrefferedFromTime).format("HH:mm").toLocaleString();
        ticketmanagementDetails["PrefferedToTime"]= moment(ticketmanagementDetails.PrefferedToTime).format("HH:mm").toLocaleString();

        ticketmanagementDetails.InventoryItems.forEach(i => {
          if (i.InventoryItemId > 0) {
              let previousRecord = this.selectedticketManagementRecord.InventoryItems.find(j => j.InventoryItemId == i.InventoryItemId);
              if (i.Item.ItemMasterId != previousRecord.Item.ItemMasterId ||
                i.ItemDescription != previousRecord.ItemDescription ||
                i.ItemQty != previousRecord.ItemQty ||
                i.MeasurementUnitID != previousRecord.MeasurementUnitID||
                i.Price!=previousRecord.Price) {
                i.IsModified = true;
            }    
          }else {
            i.InventoryItemId = 0;
          }
          if(i.Price==null){
            i.Price=0;
        }
        });

        ticketmanagementDetails.SubContractorItem.forEach(i => {
          if (i.SubContractorId > 0) {
              let previousRecord = this.selectedticketManagementRecord.SubContractorItem.find(j => j.SubContractorId == i.SubContractorId);
              if (i.SupplierCategoryID != previousRecord.SupplierCategoryID ||
                i.Supplier.SupplierId != previousRecord.Supplier.SupplierId||
                i.QuotationAmount != previousRecord.QuotationAmount) {
                i.IsModified = true;
            }    
          }else {
            i.SubContractorId = 0;

          }
          if(i.QuotationAmount==null){
              i.QuotationAmount=0;
          }
        });    

      ticketmanagementDetails.InventoryItems = ticketmanagementDetails.InventoryItems.filter(i => i.InventoryItemId == 0 || i.InventoryItemId == null || i.IsModified == true);
      ticketmanagementDetails.SubContractorItem = ticketmanagementDetails.SubContractorItem.filter(i => i.SubContractorId == 0 || i.SubContractorId == null || i.IsModified == true);
        console.log(ticketmanagementDetails);
        if(this.selectedticketManagementRecord.TicketId==0||this.selectedticketManagementRecord.TicketId==null)
        {
            this.ticketManagementServiceObj.createTicket(ticketmanagementDetails,this.uploadedFiles,this.vendoruploadedFiles).
            subscribe((response:{ Status:string,Value:any })=>{

              if(response.Status == ResponseStatusTypes.Success)
              {
                    this.uploadedFiles.length =0;
                    this.uploadedFiles = [];
                    this.vendoruploadedFiles.length=0;
                    this.vendoruploadedFiles= [];
                    this.formSubmitAttempt = false;
                    this.showGridErrorMessage = false;
                    this.showGridErrorMessage1 = false;
                    this.hidetext = true;
                    this.hideinput = false;
                    this.getticketManagement(response.Value);
                    this.sharedServiceObj.showMessage({
                      ShowMessage:true,
                      Message:Messages.SavedSuccessFully,
                      MessageType:MessageTypes.Success
                    });                   
              }
            });
        }
        else
        {
            ticketmanagementDetails.TicketId = this.selectedticketManagementRecord.TicketId;
            ticketmanagementDetails.EmployeeAssignToDelete = this.deletedEmployeeAssign;
            ticketmanagementDetails.InventoryItemsToDelete = this.deletedInventoryItems;
            ticketmanagementDetails.SubContractorItemToDelete=this.deletedSubContractorItems;
            ticketmanagementDetails.TicketQuotationAttachmentDelete = this.selectedticketManagementRecord.TicketQuotationAttachmentDelete;
            ticketmanagementDetails.AttachmentsDelete = this.selectedticketManagementRecord.AttachmentsDelete;
            ticketmanagementDetails.Attachments =  this.selectedticketManagementRecord.Attachments.filter(i=>i.IsDelete==true);

            this.ticketManagementServiceObj.updateTicket(ticketmanagementDetails,this.uploadedFiles,this.vendoruploadedFiles).subscribe((response: { Status:string,Value:any })=>{

              if(response.Status == ResponseStatusTypes.Success)
              { 
                this.uploadedFiles.length =0;
                this.uploadedFiles = [];
                this.vendoruploadedFiles.length=0;
                this.vendoruploadedFiles= [];
                this.deletedEmployeeAssign =[];
                this.deletedEmployeeAssign.length=0;
                this.deletedInventoryItems = [];
                this.deletedInventoryItems.length = 0;
                this.deletedSubContractorItems=[];
                this.deletedSubContractorItems.length=0;
                this.selectedticketManagementRecord.TicketQuotationAttachmentDelete = [];
                this.selectedticketManagementRecord.TicketQuotationAttachmentDelete.length = 0;    
                this.selectedticketManagementRecord.AttachmentsDelete = [];
                this.selectedticketManagementRecord.AttachmentsDelete.length = 0;  
                this.sharedServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.UpdatedSuccessFully,
                    MessageType:MessageTypes.Success
                });
                this.formSubmitAttempt = false;
                this.showGridErrorMessage = false;
                this.showGridErrorMessage1 = false;
                this.hidetext = true;
                this.hideinput = false;

               this.getticketManagement(ticketmanagementDetails.TicketId);


              }
            });
        }
    }
    else{
        Object.keys(this.signupForm.controls).forEach((key: string) => {
            if (this.signupForm.controls[key].status == "INVALID" && this.signupForm.controls[key].touched == false) {
                this.signupForm.controls[key].markAsTouched();
            }
        });
        let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems'];
            itemGroupControl.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl = controlObj.get(key);
                    if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                        itemGroupControl.markAsTouched();
                    }
                });
            });
        let itemGroupControl1 = <FormArray>this.signupForm.controls['SubContractorItem'];
        itemGroupControl1.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl1 = controlObj.get(key);
                    if (itemGroupControl1.status == "INVALID" && itemGroupControl1.touched == false) {
                        itemGroupControl1.markAsTouched();
                    }
                });
            });


    }
  }

  restrictMinus(e: any) {
    restrictMinus(e);
}

onClickedOutside(e: Event) {
 // this.showfilters= false; 
  if(this.showfilters == false){ 
  //  this.showfilterstext="Show List"
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
 

  cancelRecord(){ 
        
        this.showGridErrorMessage = false;
        this.showGridErrorMessage1 = false;
        //this.deleteEngineer();
        this.signupForm.reset();
        this.signupForm.setErrors(null);
        if (this.ticketList.length > 0 && this.selectedticketManagementRecord != undefined) {
            if (this.selectedticketManagementRecord.TicketId == 0||this.selectedticketManagementRecord.TicketId == undefined) {
                this.onItemRecordSelection(this.ticketList[0].TicketId);
            }
            else {
                this.onItemRecordSelection(this.selectedticketManagementRecord.TicketId);
            }
                this.hideinput = false;
                this.hidetext = true;
        }
        else {
            this.hideinput = null;
            this.hidetext = null;
        }
        this.uploadedFiles.length=0;
        this.uploadedFiles = [];
    }


 


    removeGridItem(rowIndex:number)
    {
      let record = this.selectedticketManagementRecord.EngineerAssignList[rowIndex];
      this.deletedEmployeeAssign.push(record.UserId);
      this.selectedticketManagementRecord.EngineerAssignList.splice(rowIndex,1);
      this.selectedticketManagementRecord.EngineerAssignList = this.selectedticketManagementRecord.EngineerAssignList.filter(i=>i.UserId!=null);
    }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }



    getassignengineerlist() {
        if(this.selectedfacility!=undefined)
        {
            let formValue = this.engineerForm.value;
            let requestObj:EmployeeAssignDisplayInput = {
                UserId:formValue.User["UserId"],
                AssignDate:formValue.Date,         
                FromTime:formValue.FromEmployeeTime,        
                ToTime:formValue.ToEmployeeTime,                           
                Skip:this.recordsToSkip,
                Take:this.recordsToFetch,
                SortDir:this.sortingOrder,
                SortExpr:this.sortingExpr
            };
            this.isLoading = true;
            this.ticketManagementServiceObj.getEngineerAssignListing(requestObj)
            .subscribe((data: { Engineer: Array<EmployeeAssign>})=>{

                this.employeeassign = data.Engineer; 
                this.operation = GridOperations.Display;
                this.isLoading = false;
            });
        }
    }

    sendMailtoSuppliers(){

    }


  removeInventoryGridItem(rowIndex: number) {
    let itemGroupControl = <FormArray>this.signupForm.controls['InventoryItems'];
    let InventoryItemId = itemGroupControl.controls[rowIndex].get('InventoryItemId').value;
    if (InventoryItemId > 0) {
        this.deletedInventoryItems.push(InventoryItemId);
    }
    itemGroupControl.removeAt(rowIndex);
    //this.onIsDetailedCheck();//calling this function to reset serial numbers for each record
  }

  removeSupplierGridItem(rowIndex: number) {
    let itemGroupControl = <FormArray>this.signupForm.controls['SubContractorItem'];
    let SubContractorId = itemGroupControl.controls[rowIndex].get('SubContractorId').value;
    if (SubContractorId > 0) {
        this.deletedSubContractorItems.push(SubContractorId);
        this.selectedticketManagementRecord.TicketQuotationAttachment.forEach(data=>{
            
            if(data.RowId==rowIndex)
            {
                data.IsDelete =true;
            }else{
                data.IsDelete =false;
            }
    });
    if (this.selectedticketManagementRecord.TicketQuotationAttachmentDelete == null) {
        this.selectedticketManagementRecord.TicketQuotationAttachmentDelete = [];
    }
    // this.selectedQuotationRequestDetails.QuotationAttachmentDelete.push(this.selectedQuotationRequestDetails.QuotationAttachment[rowIndex]);
    this.selectedticketManagementRecord.TicketQuotationAttachmentDelete=this.selectedticketManagementRecord.TicketQuotationAttachment.filter(i => i.IsDelete == true);
    this.selectedticketManagementRecord.TicketQuotationAttachment = this.selectedticketManagementRecord.TicketQuotationAttachment.filter(i => i.IsDelete != true).map((data,index)=>{
        
        if(data.RowId> rowIndex){
            data.RowId = data.RowId-1;
        }
         return data;
    });       
    this.selectedticketManagementRecord.TicketQuotationAttachmentUpdateRowId=this.selectedticketManagementRecord.TicketQuotationAttachment;

    }
    itemGroupControl.removeAt(rowIndex);
    //this.onIsDetailedCheck();//calling this function to reset serial numbers for each record
  }
    
  rowhover(){
  //this.htmlContent = `<div class='edit-list'><i class="fa fa-plus-circle" aria-hidden="true"></i>  <i class="fa fa-minus-circle" aria-hidden="true"></i></div>`
  }
  rowhout(){
  //this.htmlContent = `<div class='edit-list'>  </div>`
  }


  matselect(event){ 
  if(event.checked==true){
  this.slideactive=true;  
  }
  else{
    this.slideactive=false;   
  }
  }

  pageChange(currentPageNumber: any) {
    this.ticketPagerConfig.RecordsToSkip = this.ticketPagerConfig.RecordsToFetch * (currentPageNumber - 1);
    this.getticketManagement(0);
}


  billto(event){ 
      if(event.checked==true){
      this.billingto=true;  
      }
      else{
        this.billingto=false;   
    }
  }


  onFileVendorUploadChange(event: any) {      
        let files: FileList = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                this.vendoruploadedFiles.push({ File: fileItem, RowIndex: this.selectedFileRowIndex });
                try {
                    let selectedRow = this.selectedticketManagementRecord.SubContractorItem[this.selectedFileRowIndex];
                    if (selectedRow.SubContractorId > 0) {
                        selectedRow.IsModified = true;
                        let itemGroupControl = <FormArray>this.signupForm.controls['SubContractorItem'];
                        itemGroupControl.controls[this.selectedFileRowIndex].get('IsModified').setValue(true);
                        this.selectedticketManagementRecord.SubContractorItem = this.selectedticketManagementRecord.SubContractorItem.filter((i, index) => index > -1);
                    }
                }
                catch (error) {
                }
            }
            else {
                event.preventDefault();
                break;
            }
        }
    }

    ticketQuotationAttachmentDelete(SelectedIndex: number) {
            let attachmentRecord = this.selectedticketManagementRecord.TicketQuotationAttachment[SelectedIndex];
            if (this.selectedticketManagementRecord.TicketQuotationAttachmentDelete == null) {
                this.selectedticketManagementRecord.TicketQuotationAttachmentDelete = [];
            }
            this.selectedticketManagementRecord.TicketQuotationAttachmentDelete.push(this.selectedticketManagementRecord.TicketQuotationAttachment[SelectedIndex]);
            this.confirmationServiceObj.confirm({
                message: Messages.AttachmentDeleteConfirmation,
                header: Messages.DeletePopupHeader,
                accept: () => {
                    attachmentRecord.IsDelete = true;
                    this.selectedticketManagementRecord.TicketQuotationAttachment = this.selectedticketManagementRecord.TicketQuotationAttachment.filter(i => i.IsDelete != true);
                },
                reject: () => {
                }
            });
        }

    attachmentDelete(attachmentIndex:number){
        let attachmentRecord = this.selectedticketManagementRecord.Attachments[attachmentIndex];
        if (this.selectedticketManagementRecord.AttachmentsDelete == null) {
            this.selectedticketManagementRecord.AttachmentsDelete = [];
        }
        this.selectedticketManagementRecord.AttachmentsDelete.push(this.selectedticketManagementRecord.Attachments[attachmentIndex]);

            this.confirmationServiceObj.confirm({
                message: Messages.AttachmentDeleteConfirmation,
                header:Messages.DeletePopupHeader,
                accept: () => {                         
                    attachmentRecord.IsDelete = true;
                    this.selectedticketManagementRecord.Attachments = this.selectedticketManagementRecord.Attachments.filter(i=>i.IsDelete!=true);
                },
                reject: () => {
                }
            });
        }
        
    onVendorFileClose(fileIndex: number) {
        this.vendoruploadedFiles = this.vendoruploadedFiles.filter((file, index) => index != fileIndex);
    }
}
