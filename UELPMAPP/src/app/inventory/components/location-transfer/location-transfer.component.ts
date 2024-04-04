import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { LocationTransfer, Items } from "../../models/location-transfer.model";
import { Location, Messages, MessageTypes, PagerConfig, WorkFlowStatus, Companies, UserProfile, UserDetails, WorkFlowProcess, WorkFlowApproval } from "../../../shared/models/shared.model";
import { LocationTransferService } from "../../services/location-transfer.service";
import { SharedService } from "../../../shared/services/shared.service";
import { Observable,of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map,switchMap,catchError} from 'rxjs/operators';
import { ConfirmationService, LazyLoadEvent } from 'primeng/components/common/api';
import { FullScreen, restrictMinus } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute } from '@angular/router';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { ItemsListingService } from '../../services/item-listing.service';
import { ItemsListing } from '../../models/items-listing.model';



@Component({
  selector: 'app-location-transfer',
  templateUrl: './location-transfer.component.html',
  styleUrls: ['./location-transfer.component.css'],
  providers:[LocationTransferService,ItemsListingService]
})
export class LocationTransferComponent implements OnInit {
    hideText: boolean=true;
    hideInput: boolean=false;
    leftSection:boolean=false;
    rightSection:boolean=false;
    locationTransferForm: FormGroup;
    locationTransferFilterForm:FormGroup;
    scrollbarOptions:any;
    selectedRecordDetails:LocationTransfer;
    showGridErrorMessage:boolean=false;
    showGridErrorMessage1:boolean=false;
    errorMessage:string = Messages.NoRecordsToDisplay;;
    gridColumns:Array<{field:string,header:string,width:string}>= [];
    locationTransferPagerConfig:PagerConfig;
    locationRegisterPagerConfig:PagerConfig;
    showLeftPanelLoadingIcon:boolean=false;
    showRightPanelLoadingIcon:boolean =false;
    locationTransferList:Array<LocationTransfer>=[];
    itemsSearchKey:string="";
    requestSearchKey:string="";
    ItemsList:Array<Items> =[];
    showFromLocationErrMsg:boolean=false;
    showToLocationErrMsg:boolean=false;
    previousSelectedItems:Array<number>=[];
    requestType:string="";
    moduleHeading:string="";
    isApprovalPage:boolean =false;
    workFlowStatus:any;
    showFilterPopUp:boolean=false;
    filterMessage: string = "";
    companyId:number;
    isFilterApplied: boolean = false;
    checkedvalue:boolean=false;
    companiesList: Array<Companies> = [];
    isHeaderChecked:boolean;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('itemMasterCategory') private itemMasterCategoryRef: any;
    constructor(private locationTransferServiceObj:LocationTransferService,private formBuilderObj:FormBuilder,
                private sharedServiceObj:SharedService, public activatedRoute:ActivatedRoute,
                private renderer:Renderer, public itemsListingServiceObj:ItemsListingService,
                private confirmationServiceObj:ConfirmationService,public sessionService: SessionStorageService) {     
                    
            this.companyId = this.sessionService.getCompanyId(); 
    }

    ngOnInit() {
         
        this.locationTransferForm = this.formBuilderObj.group({
            LocationTransferId:[0],
            FromLocationObj:[null,Validators.required],
            ToLocationObj:[null,[Validators.required]],
            FromCompanyObj:[null,[Validators.required]],
            ToCompanyObj:[null,[Validators.required]],
            ReasonForTransfer:["",[Validators.required]],
            SelectedItems:[null],
            Quantity:0,
            SearchKey:[""],
            Remarks:[""],
            SelectedItemDetails:this.formBuilderObj.array([]),

        });

        this.locationTransferFilterForm = this.formBuilderObj.group({
            'FromCompanyObj':[null],
            'FromLocationObj':[null],
            'RequestedByUser':[null]
          });

        this.workFlowStatus = WorkFlowStatus;
        this.selectedRecordDetails = new LocationTransfer();
        this.locationTransferPagerConfig = new PagerConfig();
        this.locationTransferPagerConfig.RecordsToSkip = 0;
        this.locationTransferPagerConfig.RecordsToFetch = 10;
        this.locationRegisterPagerConfig = new PagerConfig();
        this.locationRegisterPagerConfig.RecordsToSkip = 0;
        this.locationRegisterPagerConfig.RecordsToFetch = 10;

        this.gridColumns = [
            //  { field: '', header: '', width:"5%" },
            { field: 'ItemCode', header: 'ItemCode',width:"6%" },
            { field: 'ItemName', header: 'ItemName',width:"10%" },
            { field: 'Location', header: 'Location',width:"10%" },
            { field: 'Type', header: 'Item Type',width:"10%" },
            { field: 'ItemCategoryName', header: 'Category',width:"10%" },
            { field: 'Manufacturer', header: 'Manufacturer',width:"10%" },
            { field: 'Brand', header: 'Brand',width:"10%" },
            { field: 'UOM', header: 'UOM',width:"10%" },
            { field: 'StockInhand', header: 'Stock Inhand' ,width:"5%"},
            { field: 'Quantity', header: 'Transfer Quantity' ,width:"10%"},
        ];

        this.sharedServiceObj.CompanyId$
        .subscribe((data)=>{
                this.companyId = data;
                this.navigateToPage();
        });
                
        this.activatedRoute.paramMap.subscribe((data)=>{
            console.log("parammap",data);
            this.navigateToPage();
          });
          this.activatedRoute.queryParamMap.subscribe((data)=>{ 
            if(this.activatedRoute.snapshot.queryParamMap.get('id')!=null)
             {
               this.navigateToPage();
             }
          }); 

        }

        addGridItem(noOfLines:number)
        {
            let itemGroupControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails'];
            for(let i=0;i<noOfLines;i++)
            {
                itemGroupControl.push(this.initGridRows());             
            }
        }

        initGridRows() {
            return this.formBuilderObj.group({      
                 
                  'Checked':[false],
                  'ItemCategoryName':"",
                  'ItemTypeName':"",
                  'ItemMasterCode':"",
                  'Name':"",
                  'StatusName':"",
                  'Manufacturer':"",
                  'Brand':"",
                  'LocationName':"",
                  'UOMName':"",
                  'StockInhand':0,
                  'ItemMasterID':0,
                  'Quantity':[0,[Validators.required]],
                  'ExpiryDate':new Date(),
                  'LocationTransferDetailId':0,
                  'ItemTypeID':0,
                  'MeasurementUnitID':0,
                  'GST':0,
                  'Price':0
            });
        }

        checked(stockInhand:number,rowIndex:number,gridRow:any){
            let grnControl = gridRow.get('Quantity');
            let itemGroupControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails']; 
            let quantity= itemGroupControl.controls[rowIndex].get('Quantity').value;
            if(quantity<=stockInhand){
                if(quantity>0){
                    this.checkedvalue=true;
                    itemGroupControl.controls[rowIndex].get('Checked').setValue(true); 
                    this.selectedValue.push({ index: itemGroupControl.controls[rowIndex].get('ItemMasterID').value, value: itemGroupControl.controls[rowIndex].get('Quantity').value }); 
                }
                else{
                    itemGroupControl.controls[rowIndex].get('Checked').setValue(false);  
                    let selectedIndex = this.selectedValue.findIndex(id=>id===itemGroupControl.controls[rowIndex].get('ItemMasterID').value);
                    this.selectedValue.splice(selectedIndex,1);
                }
            }
            else{
                grnControl.setErrors({ 'qtyerror2':true });
            }

        }


        navigateToPage()
        {
            this.requestType =  this.activatedRoute.snapshot.params.type;
            this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');   
            let locationTransferId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
            if(this.activatedRoute.snapshot.params.type=="request"){//if it is "location transfer request      
                this.moduleHeading = "Location Transfer";
                this.isApprovalPage = false;
                if(locationTransferId > 0){
                    this.searchLocationTransfer(locationTransferId);
                }
                else {
                    this.getLocationTransfer(0);
                }   
            }
            else if(this.activatedRoute.snapshot.params.type=="approval"){//if request is for "location transfer request approval"
                this.moduleHeading = "Location Transfer Approval";
                this.isApprovalPage = true;
                if(locationTransferId > 0){
                    this.searchLocationTransfer(locationTransferId);
                }
                else {
                    this.getLocationTransferForApproval(0);
                }   
            }
        }


        onItemClick(event:any,itemDetailId:number)
        {         
            let selectedItems:Array<number> =  this.locationTransferForm.get('SelectedItems').value;
            if(selectedItems===null)
            {
                selectedItems = [];
            }
            if(this.selectedRecordDetails.SelectedItemDetails === undefined)
            {
                this.selectedRecordDetails.SelectedItemDetails = [];
            }
            let itemRecord =  this.ItemsList.find(data=>data.ItemMasterID===itemDetailId);
            if(selectedItems.findIndex(itemId=>itemId===itemDetailId) === -1)
            {
                selectedItems.push(itemDetailId);
                this.selectedRecordDetails.SelectedItemDetails.push(itemRecord);
            }
            else
            {
                let selectedIndex = selectedItems.findIndex(id=>id===itemDetailId);
                selectedItems.splice(selectedIndex,1);
                let selectedRecordIndex = this.selectedRecordDetails.SelectedItemDetails.findIndex(data=>data.ItemMasterID===itemDetailId);
                this.selectedRecordDetails.SelectedItemDetails.splice(selectedRecordIndex,1);
            }
            this.locationTransferForm.get('SelectedItems').patchValue(selectedItems);
        }
      
                
        locationInputFormater = (x: Location) => x.Name;
            
        locationSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) =>{        
                    let fromCompany:Companies = this.locationTransferForm.get('FromCompanyObj').value;
                    if(fromCompany===undefined||fromCompany===null)
                    {
                    this.showFromLocationErrMsg = true;   
                    return of([]);
                    }
                    return this.sharedServiceObj.getLocationByKey(term,fromCompany.CompanyId).pipe(
                    catchError(() => {
                        return of([]);
                    }))
                })
        );

        locationSearch2 = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) =>{        
                    let fromCompany:Companies = this.locationTransferFilterForm.get('FromCompanyObj').value;
                    if(fromCompany===undefined||fromCompany===null)
                    {       
                    this.locationTransferFilterForm.get('FromLocationObj').setErrors({ 'requiredcompany':true });
                    this.locationTransferFilterForm.get('FromLocationObj').markAsTouched();
                    return of([]);
                    }
                    return this.sharedServiceObj.getLocationByKey(term,fromCompany.CompanyId).pipe(
                    catchError(() => {
                        return of([]);
                    }))
                })
        );

        locationFilterSearch = (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) =>{        
                    let fromCompany:Companies = this.locationTransferFilterForm.get('FromCompanyObj').value;                   
                    return this.sharedServiceObj.getLocationByKey(term,this.companyId).pipe(
                    catchError(() => {
                        return of([]);
                    }))
                })
        );
                
        toLocationSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) =>{        
                let toCompany:Companies = this.locationTransferForm.get('ToCompanyObj').value;
                if(toCompany===undefined||toCompany===null)
                {
                this.showToLocationErrMsg = true;
                return of([]);
                }
                return this.sharedServiceObj.getLocationByKey(term,toCompany.CompanyId).pipe(
                catchError(() => {
                    return of([]);
                }))
            })
        );

                    
            companyInputFormater = (x: Companies) => x.CompanyName;
                
            companySearch = (text$: Observable<string>) =>
                text$.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap((term) =>{
                        if(term===""||term===null)
                        {
                        this.locationTransferForm.get('FromLocationObj').patchValue(null);
                        }
                        return this.sharedServiceObj.getCompaniesbykey(term).pipe(
                        catchError(() => {
                            return of([]);
                        }))
                    })
            );

            companySearch2 = (text$: Observable<string>) =>
                text$.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap((term) =>{
                        if(term===""||term===null)
                        {
                        this.locationTransferFilterForm.get('FromLocationObj').patchValue(null);
                        }
                        return this.sharedServiceObj.getCompaniesbykey(term).pipe(
                        catchError(() => {
                            return of([]);
                        }))
                    })
            );

            userInputFormater = (x: UserProfile) => x.FirstName;

            userSearch = (text$: Observable<string>) =>
                text$.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap((term) =>{
                        if(term===""||term===null)
                        {
                        this.locationTransferFilterForm.get('RequestedByUser').patchValue(null);
                        return of([]);
                        }
                        else
                        {
                        return this.sharedServiceObj.getUsers(term,this.companyId).pipe(
                        catchError(() => {
                            return of([]);
                        }))
                        }
                    })
            );


            toCompanySearch = (text$: Observable<string>) =>
                text$.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap((term) =>{
                        if(term===""||term===null)
                        {
                        this.locationTransferForm.get('ToLocationObj').patchValue(null);
                        }
                        return this.sharedServiceObj.getCompaniesbykey(term).pipe(
                        catchError(() => {
                            return of([]);
                        }))
                    })
            );


                
        onLocationChange(location:any,from:number)
        {
            console.log(location,from);
            if(from===1)
            {
                this.showFromLocationErrMsg = false;
                setTimeout(()=>{
                this.getItems();
                },300)  
            }
            else if(from===2)
            {
                this.showToLocationErrMsg = false;
            }        
        }

                
        getLocationTransfer(locationTransferId:number)
        {
            let input = {
                Skip:this.locationTransferPagerConfig.RecordsToSkip,
                Take:this.locationTransferPagerConfig.RecordsToFetch,
                CompanyId:this.companyId
            };
            this.showLeftPanelLoadingIcon = true;
            this.locationTransferServiceObj.getLocationTransfer(input)
                .subscribe((data:{ LocationTransferReq:Array<LocationTransfer> ,TotalRecords:number })=>{

                this.showLeftPanelLoadingIcon = false;
                this.locationTransferList = data.LocationTransferReq;
                this.locationTransferPagerConfig.TotalRecords = data.TotalRecords;
                if(this.locationTransferList.length > 0)
                {
                    if(locationTransferId > 0)
                    {
                        this.onLocationReqRecordSelection(locationTransferId);
                    }
                    else
                    {
                        this.onLocationReqRecordSelection(this.locationTransferList[0].LocationTransferId);
                    }
                }
                else
                {
                    this.selectedRecordDetails = new LocationTransfer();
                }
            },()=>{
                this.showLeftPanelLoadingIcon = false;
            });
        }


                
        searchLocationTransfer(locationTransferId:number=0,fromLocationId:number = 0,fromUserId:number = 0)
        {
                let userDetails = <UserDetails> this.sessionService.getUser();
                let input = {
                    Skip:this.locationTransferPagerConfig.RecordsToSkip,
                    Take:this.locationTransferPagerConfig.RecordsToFetch,
                    IsApprovalPage:this.isApprovalPage,
                    Search:this.requestSearchKey,
                    FromLocationId:fromLocationId,
                    RequestFromUserId:fromUserId,
                    LocationTransferId:locationTransferId,
                    UserId:userDetails.UserID,
                    CompanyId:this.companyId
                };
                this.showLeftPanelLoadingIcon = true;
                this.locationTransferServiceObj.searchLocationTransfer(input)
                    .subscribe((data:{ LocationTransferReq:Array<LocationTransfer> ,TotalRecords:number })=>{

                    this.showLeftPanelLoadingIcon = false;
                    this.locationTransferList = data.LocationTransferReq;
                    this.locationTransferPagerConfig.TotalRecords = data.TotalRecords;
                    if(this.locationTransferList.length > 0)
                    {
                        this.showFilterPopUp = false;
                        this.onLocationReqRecordSelection(this.locationTransferList[0].LocationTransferId);
                    }   
                    else
                    {
                        this.addRecord();
                    }
                },()=>{
                    this.showLeftPanelLoadingIcon = false;
                });
        }
                
        getLocationTransferForApproval(locationTransferId:number)
        {
            let userDetails = <UserDetails>this.sessionService.getUser();
            let input = {
                Skip:this.locationTransferPagerConfig.RecordsToSkip,
                Take:this.locationTransferPagerConfig.RecordsToFetch,
                UserId:userDetails.UserID,
                CompanyId:this.companyId
            };
            this.showLeftPanelLoadingIcon = true;
            this.locationTransferServiceObj.getLocationTransferForApproval(input)
                .subscribe((data:{ LocationTransferReq:Array<LocationTransfer> ,TotalRecords:number })=>{

                this.showLeftPanelLoadingIcon = false;
                this.locationTransferList = data.LocationTransferReq;
                this.locationTransferPagerConfig.TotalRecords = data.TotalRecords;
                if(this.locationTransferList.length > 0)
                {
                    if(locationTransferId > 0)
                    {
                        this.onLocationReqRecordSelection(locationTransferId);
                    }
                    else
                    {
                        this.onLocationReqRecordSelection(this.locationTransferList[0].LocationTransferId);
                    }
                }
                else
                {
                    this.selectedRecordDetails = new LocationTransfer();
                }
            },()=>{
                this.showLeftPanelLoadingIcon = false;
            });
        }
                
        getItems()
        {
            let itemGroupControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails']; 
            let locationData:Location = this.locationTransferForm.get('FromLocationObj').value;
            if(locationData!=null)
            {
                let input = {
                Skip:this.locationRegisterPagerConfig.RecordsToSkip,
                Take:this.locationRegisterPagerConfig.RecordsToFetch,
                Search:this.locationTransferForm.get('SearchKey').value===null?"":this.locationTransferForm.get('SearchKey').value,
                LocationId:locationData.LocationID,
                CompanyId:this.companyId
                };
                    this.locationTransferServiceObj.getItems(input)
                        .subscribe((data: LocationTransfer)=>{                            
                        this.ItemsList = data.SelectedItemDetails;

                        let itemGroupItemControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails'];
                        itemGroupItemControl.controls = [];
                        itemGroupItemControl.controls.length = 0;
                        this.addGridItem(this.ItemsList.length);

                        this.locationTransferForm.patchValue({
                            SelectedItemDetails: this.ItemsList
                        });                      
                        if(this.selectedValue.length >0){                         
                            for(let i=0;i<this.selectedValue.length;i++)                            
                            {
                                let count = this.selectedValue[i].index;
                                let quantity = this.selectedValue[i].value;  
                                let selectedIndex = this.ItemsList.findIndex(data=>data.ItemMasterID===count);                           
                                itemGroupControl.controls[selectedIndex].get('Checked').setValue(true);  
                                itemGroupControl.controls[selectedIndex].get('Quantity').setValue(quantity);
                                let sum:number=0;
                                for(let i=0;i<itemGroupControl.length;i++){
                                    let count = itemGroupControl.controls[i].get('Checked');  
                                    if(count.value==true){
                                        sum++;
                                    }
                                }
                                if(sum!=itemGroupControl.length){
                                    this.isHeaderChecked=false;
                                }
                                else{
                                    this.isHeaderChecked=true;
                                }
                            }
                        }

                        console.log(this.ItemsList);
                    },()=>{

                });
            }
        }

        selectedValue:Array<{index:number,value:number}>=[];

        //selectedValue:Array<number>=[];
        opentextbox(isChecked:boolean,rowIndex:number){            
            let itemGroupControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails'];   
            if(isChecked==true){
                if(this.checkedvalue!=true){
                    itemGroupControl.controls[rowIndex].get('Quantity').setValue(itemGroupControl.controls[rowIndex].get('StockInhand').value);
                    this.selectedValue.push({ index: itemGroupControl.controls[rowIndex].get('ItemMasterID').value, value: itemGroupControl.controls[rowIndex].get('Quantity').value });

                }
            }
            else 
            {
                itemGroupControl.controls[rowIndex].get('Quantity').setValue(0);
                let selectedIndex = this.selectedValue.findIndex(id=>id===itemGroupControl.controls[rowIndex].get('ItemMasterID').value);
                this.selectedValue.splice(selectedIndex,1);
            }
            let sum:number=0;
            for(let i=0;i<itemGroupControl.length;i++){
                let count = itemGroupControl.controls[i].get('Checked');  
                if(count.value==true){
                    sum++;
                }
            }
            if(sum!=itemGroupControl.length){
                this.isHeaderChecked=false;
            }
            else{
                this.isHeaderChecked=true;
            }
            this.checkedvalue=false;
        }

        mainclick(event){
         
                let itemGroupControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails']; 
                if(this.isHeaderChecked==true){
                    for(let i=0;i<itemGroupControl.length;i++){
                        itemGroupControl.controls[i].get('Checked').setValue(true);  
                        itemGroupControl.controls[i].get('Quantity').setValue(itemGroupControl.controls[i].get('StockInhand').value);

                    }
                }
                else {
                    for(let i=0;i<itemGroupControl.length;i++){
                        itemGroupControl.controls[i].get('Checked').setValue(false);  
                        itemGroupControl.controls[i].get('Quantity').setValue(0);

                    }
                }
            
        }

                
        onLocationReqRecordSelection(locationTransferId:number)
        {
            this.showRightPanelLoadingIcon  = true;
            let userDetails = <UserDetails>this.sessionService.getUser();
            this.locationTransferServiceObj.getLocationTransferReqDetails(locationTransferId,userDetails.UserID)
                .subscribe((data:LocationTransfer)=>{
                    if (data != null)
                    {
                        this.showRightPanelLoadingIcon = false;
                        this.selectedRecordDetails = data;
                        this.previousSelectedItems = data.SelectedItemDetails.map(data=>data.ItemMasterID);
                        this.locationTransferForm.patchValue(data);
                        this.locationTransferForm.patchValue({
                            FromLocationObj:{
                                LocationID:this.selectedRecordDetails.FromLocationId,
                                Name:this.selectedRecordDetails.FromLocation
                            },})
                    }
                    this.hideText=true;
                    this.hideInput=false;
                },()=>{
                    this.showRightPanelLoadingIcon = false;
                });
        }

                
        pageChange(currentPageNumber:number)
        {
            if(!isNaN(currentPageNumber))
            {
                this.locationTransferPagerConfig.RecordsToSkip = this.locationTransferPagerConfig.RecordsToFetch*(currentPageNumber-1);
                if((this.requestSearchKey==null||this.requestSearchKey==""))
                {
                if(this.isApprovalPage === false)
                {
                    this.getLocationTransfer(0);
                }
                else if(this.isApprovalPage === true)
                {
                    this.getLocationTransferForApproval(0);
                }
                }
                else
                {
                    this.searchLocationTransfer(0);
                }
            }
        }

                
        addRecord(){
            this.hideText = false;
            this.hideInput = true;
            this.ItemsList = [];
            this.ItemsList.length = 0;
            this.selectedValue =[];
            this.selectedValue.length=0;
            this.selectedRecordDetails = new LocationTransfer();
            this.clearForm();
            let itemGroupItemsControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails'];
            itemGroupItemsControl.controls = [];
            itemGroupItemsControl.controls.length = 0; 
            this.locationRegisterPagerConfig.RecordsToSkip = 0;
            this.sharedServiceObj.getCompaniesbykey("").subscribe((data: Array<Companies>) => {
                this.companiesList = data;
                if (this.sessionService.getCompanyId()) {
                  this.locationTransferForm.get('FromCompanyObj').setValue( this.companiesList.find(data => data.CompanyId == this.sessionService.getCompanyId()));
                }        
              });
        }
        
            
        clearForm()
        {
            this.locationTransferForm.reset();
        }

                    
        saveRecord(action:string)
        {
            this.showGridErrorMessage=false;
            this.showGridErrorMessage1=false;
            var paymnt:number=0;
            let itemGroupControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails'];          
            let locationTransferReqData = this.locationTransferForm.value;
                let status = this.locationTransferForm.status;
                this.showFromLocationErrMsg = false;
                this.showToLocationErrMsg = false;
                if(action=='send'&&this.hideText==true&&this.selectedRecordDetails.LocationTransferId > 0)
                {
                    let workFlowDetails:WorkFlowParameter =   
                    {
                        ProcessId:WorkFlowProcess.LocationTransfer,
                        CompanyId: this.companyId ,  
                        LocationId: locationTransferReqData.FromLocationObj.LocationID,                   
                        FieldName:"",
                        Value:0,
                        DocumentId:this.selectedRecordDetails.LocationTransferId,
                        CreatedBy:this.selectedRecordDetails.CreatedBy,
                        WorkFlowStatusId:WorkFlowStatus.WaitingForApproval
                    };
                    this.sharedServiceObj.sendForApproval(workFlowDetails)
                        .subscribe((data)=>{
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.SentForApproval,
                                MessageType: MessageTypes.Success
                            });
                            this.getLocationTransfer(workFlowDetails.DocumentId);
                        });
                    return;
                }
                if(status!="INVALID")
                {
                    let userDetails = <UserDetails>this.sessionService.getUser();

                    for(let i=0;i<itemGroupControl.length;i++)
                    {                
                        let totalpayment:number =itemGroupControl.controls[i].get('Quantity').value;
                        if(totalpayment!=0)
                        paymnt += totalpayment;
                    }
                    if(paymnt==0){
                        this.showGridErrorMessage=true;    
                        return;
                    }

                    if(locationTransferReqData.FromCompanyObj.CompanyId==locationTransferReqData.ToCompanyObj.CompanyId && locationTransferReqData.FromLocationObj.LocationID==locationTransferReqData.ToLocationObj.LocationID)
                    {
                        this.showGridErrorMessage1=true;    
                        return;
                    }

                
                    locationTransferReqData.CreatedBy = userDetails.UserID;
                    locationTransferReqData.FromCompanyId = locationTransferReqData.FromCompanyObj.CompanyId;
                    locationTransferReqData.ToCompanyId = locationTransferReqData.ToCompanyObj.CompanyId;
                    locationTransferReqData.FromLocationId = locationTransferReqData.FromLocationObj.LocationID;
                    locationTransferReqData.ToLocationId = locationTransferReqData.ToLocationObj.LocationID;
                    locationTransferReqData.CompanyId =  this.companyId ;
                    locationTransferReqData.SelectedItemDetails=locationTransferReqData.SelectedItemDetails.filter(i=> i.Quantity>0);
                    locationTransferReqData.WorkFlowStatusId = action === 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
                    if(locationTransferReqData.LocationTransferId === null||locationTransferReqData.LocationTransferId === 0)
                    {
                    locationTransferReqData.LocationTransferId = 0;
                    this.locationTransferServiceObj.createLocationTransfer(locationTransferReqData).subscribe((data)=>{
                            this.sharedServiceObj.showMessage({
                                ShowMessage:true,
                                Message:Messages.SavedSuccessFully,
                                MessageType:MessageTypes.Success
                            });
                            this.locationTransferPagerConfig.RecordsToSkip = 0;
                            this.showGridErrorMessage=false;  
                            this.showGridErrorMessage1=false;
                            this.selectedValue =[];
                            this.selectedValue.length=0;
                            this.getLocationTransfer(0);
                        });
                    }
                    else
                    {
                        let selectedItems = locationTransferReqData.SelectedItems.filter((data,index)=>index>-1);
                        locationTransferReqData.DeletedItems = this.previousSelectedItems.filter(item =>
                                                                selectedItems.indexOf(item) < 0);
                        locationTransferReqData.SelectedItems = selectedItems.filter(item =>
                                                                    this.previousSelectedItems.indexOf(item) < 0);
                        this.locationTransferServiceObj.updateLocationTransfer(locationTransferReqData).subscribe((data)=>{
                            this.sharedServiceObj.showMessage({
                                ShowMessage:true,
                                Message:Messages.UpdatedSuccessFully,
                                MessageType:MessageTypes.Success
                            });
                            this.showGridErrorMessage=false;   
                            this.showGridErrorMessage1=false;
                            this.selectedValue =[];
                            this.selectedValue.length=0;
                            this.locationTransferPagerConfig.RecordsToSkip = 0;
                            this.getLocationTransfer(0);
                        });
                    }
                }
                else
                {
                    Object.keys(this.locationTransferForm.controls).forEach((key:string) => {
                        if(this.locationTransferForm.controls[key].status=="INVALID" && this.locationTransferForm.controls[key].touched==false)
                        {
                            this.locationTransferForm.controls[key].markAsTouched();
                        }
                    });  
                }
            }

                        
            cancelRecord(){ 
                if(this.locationTransferList.length > 0 && (this.selectedRecordDetails.LocationTransferId === 0||this.selectedRecordDetails.LocationTransferId===undefined))
                {
                    this.onLocationReqRecordSelection(this.locationTransferList[0].LocationTransferId);
                }
                this.hideText=true;
                this.hideInput=false;
                this.selectedValue =[];
                this.selectedValue.length=0;
                this.showGridErrorMessage=false;
                this.showGridErrorMessage1=false;    
            }
                
            editRecord(){
                this.hideText = false;
                this.hideInput = true;
                this.clearForm();
                let itemGroupItemControl = <FormArray>this.locationTransferForm.controls['SelectedItemDetails'];
                itemGroupItemControl.controls = [];
                itemGroupItemControl.controls.length = 0;
                this.addGridItem(this.selectedRecordDetails.SelectedItemDetails.length);



                this.locationRegisterPagerConfig.RecordsToSkip = 0;
                console.log(this.selectedRecordDetails.SelectedItemDetails.map(data=>data.ItemMasterID));
                this.locationTransferForm.patchValue({
                LocationTransferId:this.selectedRecordDetails.LocationTransferId,
                FromLocationObj:{
                    LocationID:this.selectedRecordDetails.FromLocationId,
                    Name:this.selectedRecordDetails.FromLocation
                },
                ToLocationObj:{
                    LocationID:this.selectedRecordDetails.ToLocationId,
                    Name:this.selectedRecordDetails.ToLocation
                },
                FromCompanyObj:{
                    CompanyId:this.selectedRecordDetails.FromCompanyId,
                    CompanyName:this.selectedRecordDetails.FromCompany
                },
                ToCompanyObj:{
                    CompanyId:this.selectedRecordDetails.ToCompanyId,
                    CompanyName:this.selectedRecordDetails.ToCompany
                },
                ReasonForTransfer:this.selectedRecordDetails.ReasonForTransfer,
                SelectedItems:this.selectedRecordDetails.SelectedItemDetails.map(data=>data.ItemMasterID)
                });
                this.locationTransferForm.controls['SelectedItemDetails'].patchValue(this.selectedRecordDetails.SelectedItemDetails);

                for(let i=0;i<itemGroupItemControl.length;i++){
                    if(itemGroupItemControl.controls[i].get('Quantity').value>0){
                        itemGroupItemControl.controls[i].get('Checked').setValue(true);   
                    }
                }
                if(itemGroupItemControl.length>0){
                    this.isHeaderChecked=true;
                }


               // this.getItems();
            }
            
            deleteRecord()
            {
                let recordId:number = this.selectedRecordDetails.LocationTransferId;
                let userDetails = <UserDetails>this.sessionService.getUser();
                this.confirmationServiceObj.confirm({
                    message: Messages.ProceedDelete,
                    header:Messages.DeletePopupHeader,
                    accept: () => { 
                        this.locationTransferServiceObj.deleteLocationTransfer(recordId, userDetails.UserID).subscribe((data)=>{
                                this.sharedServiceObj.showMessage({
                                    ShowMessage:true,
                                    Message:Messages.DeletedSuccessFully,
                                    MessageType:MessageTypes.Success
                                });
                                this.selectedValue =[];
                                this.selectedValue.length=0;
                                this.getLocationTransfer(0);
                        });                
                    },
                    reject: () => {
                    }
                });
            }

                    
        onLocationTransferSearch(event:any)
        {
            if (event.target.value != "") {
                this.searchLocationTransfer();
            }
            else {
                this.getLocationTransfer(0);
            }
        }

                
        onItemsSearch(event:any)
        {
            this.getItems();
        }

                
        updateStatus(statusId: number) {
            let remarks = "";
            let successMessage = "";
            let formRemarks = this.locationTransferForm.get('Remarks').value;
            if((formRemarks === "" || formRemarks === null) && (statusId === WorkFlowStatus.AskedForClarification || statusId === WorkFlowStatus.WaitingForApproval))
            {
                this.locationTransferForm.get('Remarks').setErrors({"required":true});
                this.locationTransferForm.get('Remarks').markAsTouched();
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
            DocumentId: this.selectedRecordDetails.LocationTransferId,
            UserId: userDetails.UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            RequestUserId: this.selectedRecordDetails.CreatedBy,
            DocumentCode:this.selectedRecordDetails.LocationTransferId.toString(),//need to update to document coee
            ProcessId:WorkFlowProcess.LocationTransfer,
            CompanyId:this.sessionService.getCompanyId(),
            ApproverUserId:0,
            IsReApproval: false
            };
            if(this.isApprovalPage==true)//if it is workflow approval page...
            {
            this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
                .subscribe((data) => {
                    this.locationTransferForm.get('Remarks').setValue("");
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: successMessage,
                        MessageType: MessageTypes.Success
                    });
                    this.requestSearchKey = "";
                    this.getLocationTransferForApproval((statusId === WorkFlowStatus.Approved || statusId === WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
                });
            }
            else
            {
            workFlowStatus.ApproverUserId = this.selectedRecordDetails.CurrentApproverUserId 
            this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
            .subscribe((data) => {
                this.locationTransferForm.get('Remarks').setValue("");
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: successMessage,
                    MessageType: MessageTypes.Success
                });
                this.requestSearchKey = "";
                this.getLocationTransfer(workFlowStatus.DocumentId);
            });
            }
        }

                
        openDialog() {
            this.showFilterPopUp = true;
            if (this.itemMasterCategoryRef != undefined) {
                this.itemMasterCategoryRef.nativeElement.focus();
                this.renderer.invokeElementMethod(this.itemMasterCategoryRef.nativeElement, 'focus');
            }
        }
        
        resetData() {
            this.isFilterApplied = false;
            this.showFilterPopUp = true;
            this.resetFilters();
        }
        
        resetFilters() {
            this.locationTransferFilterForm.reset();
            this.filterMessage = "";
            this.isFilterApplied = false;
            if(this.isApprovalPage==true)
            {
                this.getLocationTransferForApproval(0);
            }
            else
            {
                this.getLocationTransfer(0);
            }
            if (this.itemMasterCategoryRef != undefined) {
                this.itemMasterCategoryRef.nativeElement.focus();
                this.renderer.invokeElementMethod(this.itemMasterCategoryRef.nativeElement, 'focus'); 
            }
        }
        
        filterData() {     
            let fromCompanyId = 0;
            let fromLocationId = 0;
            let requestedbyUser = 0;
            this.filterMessage = "";
            if (this.locationTransferFilterForm.get('FromCompanyObj').value != null) {
                let company = <Companies> this.locationTransferFilterForm.get('FromCompanyObj').value;
                fromCompanyId = company.CompanyId;
            }
            if (this.locationTransferFilterForm.get('FromLocationObj').value != null) {
                let location  =  <Location> this.locationTransferFilterForm.get('FromLocationObj').value;
                fromLocationId = location.LocationID;
            }
            if (this.locationTransferFilterForm.get('RequestedByUser').value != null) {
                let userDetails  =  <UserProfile> this.locationTransferFilterForm.get('RequestedByUser').value;
                requestedbyUser = userDetails.UserID;
            }
            if (fromLocationId === 0 && requestedbyUser === 0) {
                if (open) {
                    this.filterMessage = "Please select any filter criteria";
                }
                return;
            }
            this.isFilterApplied = true;
            this.searchLocationTransfer(0,fromLocationId,requestedbyUser);
        }
        
        onLazyLoad(event:LazyLoadEvent)
        {
            this.locationRegisterPagerConfig.RecordsToSkip = event.first;
            this.getItems();
        }

        showFullScreen()
        {
            FullScreen(this.rightPanelRef.nativeElement);
        }

        split() { 
        this.leftSection= !this.leftSection;
        this.rightSection= !this.rightSection;

        }

        restrictMinus(e: any) {
            restrictMinus(e);
        }

        onPDFPrint(event:any){                   
            if(this.selectedRecordDetails.LocationTransferId > 0 ){
                let pdfDocument = this.locationTransferServiceObj.printDetails(this.selectedRecordDetails.LocationTransferId, this.companyId);
                pdfDocument.subscribe((data) => {
                    let result = new Blob([data], { type: 'application/pdf' });
                    const fileUrl = URL.createObjectURL(result);
                    let tab = window.open();
                    tab.location.href = fileUrl;
                });
             }      
        }
}
