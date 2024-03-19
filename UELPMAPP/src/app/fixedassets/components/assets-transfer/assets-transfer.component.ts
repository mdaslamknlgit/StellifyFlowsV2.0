import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FullScreen } from '../../../shared/shared';
import { AssetTransfer } from '../../models/asset-transfer.model';
import { AssetTransferService } from "../../services/asset-transfer.service";
import { AssetRegisterService } from "../../services/asset-register.service";
import { PagerConfig, Companies, UserDetails, Messages, MessageTypes, WorkFlowStatus, WorkFlowApproval, WorkFlowProcess, UserProfile, Location } from '../../../shared/models/shared.model';
import { Asset } from '../../models/asset.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ConfirmationService, LazyLoadEvent } from 'primeng/primeng';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';

@Component({
  selector: 'app-assets-transfer',
  templateUrl: './assets-transfer.component.html',
  styleUrls: ['./assets-transfer.component.css'],
  providers:[AssetRegisterService,AssetTransferService]
})
export class AssetsTransferComponent implements OnInit {

hideText: boolean=true;
hideInput: boolean=false;
leftSection:boolean=false;
rightSection:boolean=false;
assetTransferForm: FormGroup;
assetTransferFilterForm:FormGroup;
scrollbarOptions:any;
selectedRecordDetails:AssetTransfer;
showGridErrorMessage:boolean=false;
errorMessage:string = Messages.NoRecordsToDisplay;;
gridColumns:Array<{field:string,header:string,width:string}>= [];
assetTransferPagerConfig:PagerConfig;
assetRegisterPagerConfig:PagerConfig;
showLeftPanelLoadingIcon:boolean=false;
showRightPanelLoadingIcon:boolean =false;
assetTransferList:Array<AssetTransfer>=[];
assetsSearchKey:string="";
requestSearchKey:string="";
assetsList:Array<Asset> =[];
showFromLocationErrMsg:boolean=false;
showToLocationErrMsg:boolean=false;
previousSelectedAssets:Array<number>=[];
requestType:string="";
moduleHeading:string="";
isApprovalPage:boolean =false;
workFlowStatus:any;
showFilterPopUp:boolean=false;
filterMessage: string = "";
isFilterApplied: boolean = false;
@ViewChild('rightPanel') rightPanelRef;
@ViewChild('assetCategory') private assetCategoryRef: any;

constructor(private formBuilderObj:FormBuilder,
            private assetTransferObj:AssetTransferService,
            private assetRegisterServiceObj:AssetRegisterService,
            private sharedServiceObj:SharedService,
            private sessionService:SessionStorageService,
            private confirmationServiceObj:ConfirmationService,
            public activatedRoute:ActivatedRoute,
            private renderer:Renderer) { 

  this.workFlowStatus = WorkFlowStatus;
  this.selectedRecordDetails = new AssetTransfer();
  this.assetTransferPagerConfig = new PagerConfig();
  this.assetTransferPagerConfig.RecordsToSkip = 0;
  this.assetTransferPagerConfig.RecordsToFetch = 10;
  this.assetRegisterPagerConfig = new PagerConfig();
  this.assetRegisterPagerConfig.RecordsToSkip = 0;
  this.assetRegisterPagerConfig.RecordsToFetch = 10;
  this.gridColumns = [
    { field: 'Sno', header: 'S.no.',width:"5%" },
    { field: 'Asset', header: 'Asset Name',width:"7%" },
    { field: 'BarCode', header: 'Bar Code',width:"10%" },
    { field: 'PurchasedValue',header:'Purchase Value',width:"7%" },
    { field: 'PurchasedDate', header: 'Purchased Date',width:"6%" },
    { field: 'Supplier', header: 'Supplier',width:"10%" },
    { field: 'InvoiceId', header: 'Invoice Number',width:"10%" },
    { field: 'Location', header: 'Location',width:"10%" },
    { field: 'CurrentValue', header: 'Current Value',width:"10%" },     
    { field: '', header: '',width:"10%" }  
  ];
  this.assetTransferFilterForm = this.formBuilderObj.group({
    'FromCompanyObj':[null],
    'FromLocationObj':[null],
    'RequestedByUser':[null]
  });
}

ngOnInit() { 

  this.assetTransferForm = this.formBuilderObj.group({
    AssetTranferId:[0],
    FromLocationObj:[null,Validators.required],
    ToLocationObj:[null,[Validators.required]],
    FromCompanyObj:[null,[Validators.required]],
    ToCompanyObj:[null,[Validators.required]],
    ReasonForTransfer:["",[Validators.required]],
    SelectedAssets:[null,[Validators.required]],
    SearchKey:[""],
    Remarks:[""]
  });
  this.activatedRoute.paramMap.subscribe((data)=>{
    this.navigateToPage();
  });
  this.activatedRoute.queryParamMap.subscribe((data)=>{ 
    if(this.activatedRoute.snapshot.queryParamMap.get('id')!=null)
     {
       this.navigateToPage();
     }
  }); 
}

navigateToPage()
{
  this.requestType =  this.activatedRoute.snapshot.params.type;
  this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');   
  let assetTransferId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
  if(this.activatedRoute.snapshot.params.type=="request"){//if it is "asset transfer request      
     this.moduleHeading = "Asset Transfer";
     this.isApprovalPage = false;
     if(assetTransferId > 0){
       this.searchAssetTransferRequests(assetTransferId);
     }
     else {
       this.getAssetTransferRequest(0);
     }   
  }
  else if(this.activatedRoute.snapshot.params.type=="approval"){//if request is for "asset transfer request approval"
     this.moduleHeading = "Asset Transfer Approval";
     this.isApprovalPage = true;
     if(assetTransferId > 0){
       this.searchAssetTransferRequests(assetTransferId);
     }
     else {
       this.getAssetTransferRequestForApproval(0);
     }   
  }
}

onAssetClick(event:any,assetDetailId:number)
{
  let selectedAssets:Array<number> =  this.assetTransferForm.get('SelectedAssets').value;
  if(selectedAssets==null)
  {
    selectedAssets = [];
  }
  if(this.selectedRecordDetails.SelectedAssetDetails == undefined)
  {
    this.selectedRecordDetails.SelectedAssetDetails = [];
  }
  let assetRecord =  this.assetsList.find(data=>data.AssetDetailsId==assetDetailId);
  if(selectedAssets.findIndex(assetId=>assetId==assetDetailId) == -1)//if asset is not present in the list...
  {
    selectedAssets.push(assetDetailId);
    assetRecord.IsSelected = true;
    this.selectedRecordDetails.SelectedAssetDetails.push(assetRecord);
  }
  else
  {
    assetRecord.IsSelected = false;
    let selectedIndex = selectedAssets.findIndex(id=>id==assetDetailId);
    selectedAssets.splice(selectedIndex,1);
    let selectedRecordIndex = selectedAssets.findIndex(id=>id==assetDetailId);
    this.selectedRecordDetails.SelectedAssetDetails.splice(selectedRecordIndex,1);
  }
  this.assetTransferForm.get('SelectedAssets').patchValue(selectedAssets);
}

locationInputFormater = (x: Location) => x.Name;
    
locationSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{        
            let fromCompany:Companies = this.assetTransferForm.get('FromCompanyObj').value;
            if(fromCompany==undefined||fromCompany==null)
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
          if(term==""||term==null)
          {
            this.assetTransferFilterForm.get('FromLocationObj').patchValue(null);
          }
          return this.sharedServiceObj.getLocationByKey(term,this.sessionService.getCompanyId()).pipe(
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
            let toCompany:Companies = this.assetTransferForm.get('ToCompanyObj').value;
            if(toCompany==undefined||toCompany==null)
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

onLocationChange(location:any,from:number)
{
  if(from==1)
  {
    this.showFromLocationErrMsg = false;
    setTimeout(()=>{
      this.getAssets();
    },300)  
  }
  else if(from==2)
  {
    this.showToLocationErrMsg = false;
  }
}

companyInputFormater = (x: Companies) => x.CompanyName;
    
companySearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{
            if(term==""||term==null)
            {
              this.assetTransferForm.get('FromLocationObj').patchValue(null);
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
            if(term==""||term==null)
            {
              this.assetTransferFilterForm.get('FromLocationObj').patchValue(null);
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
            if(term==""||term==null)
            {
              this.assetTransferFilterForm.get('RequestedByUser').patchValue(null);
              return of([]);
            }
            else
            {
              let companyId = this.sessionService.getCompanyId();
              return this.sharedServiceObj.getUsers(term,companyId).pipe(
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
            if(term==""||term==null)
            {
              this.assetTransferForm.get('ToLocationObj').patchValue(null);
            }
            return this.sharedServiceObj.getCompaniesbykey(term).pipe(
            catchError(() => {
                return of([]);
            }))
        })
);


getAssetTransferRequest(assetTransferId:number)
{
  let input = {
    Skip:this.assetTransferPagerConfig.RecordsToSkip,
    Take:this.assetTransferPagerConfig.RecordsToFetch
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetTransferObj.getAssetTransferRequest(input)
      .subscribe((data:{ AssetTransferReq:Array<AssetTransfer> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetTransferList = data.AssetTransferReq;
      this.assetTransferPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetTransferList.length > 0)
      {
        if(assetTransferId > 0)
        {
          this.onAssetReqRecordSelection(assetTransferId);
        }
        else
        {
          this.onAssetReqRecordSelection(this.assetTransferList[0].AssetTranferId);
        }
      }
      else
      {
        this.selectedRecordDetails = new AssetTransfer();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

searchAssetTransferRequests(assetTransferId:number=0,fromLocationId:number = 0,fromUserId:number = 0)
{
  let userDetails = <UserDetails> this.sessionService.getUser();
  let input = {
    Skip:this.assetTransferPagerConfig.RecordsToSkip,
    Take:this.assetTransferPagerConfig.RecordsToFetch,
    IsApprovalPage:this.isApprovalPage,//if it is approval page..
    Search:this.requestSearchKey,
    FromLocationId:fromLocationId,
    RequestFromUserId:fromUserId,
    AssetTransferId:assetTransferId,
    UserId:userDetails.UserID
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetTransferObj.searchAssetTransferRequest(input)
      .subscribe((data:{ AssetTransferReq:Array<AssetTransfer> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetTransferList = data.AssetTransferReq;
      this.assetTransferPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetTransferList.length > 0)
      {
        this.onAssetReqRecordSelection(this.assetTransferList[0].AssetTranferId);
      }   
      else
      {
        this.selectedRecordDetails = new AssetTransfer();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}


getAssetTransferRequestForApproval(assetTransferId:number)
{
  let userDetails = <UserDetails>this.sessionService.getUser();
  let input = {
    Skip:this.assetTransferPagerConfig.RecordsToSkip,
    Take:this.assetTransferPagerConfig.RecordsToFetch,
    UserId:userDetails.UserID
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetTransferObj.getAssetTransferRequestForApproval(input)
      .subscribe((data:{ AssetTransferReq:Array<AssetTransfer> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetTransferList = data.AssetTransferReq;
      this.assetTransferPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetTransferList.length > 0)
      {
        if(assetTransferId > 0)
        {
          this.onAssetReqRecordSelection(assetTransferId);
        }
        else
        {
          this.onAssetReqRecordSelection(this.assetTransferList[0].AssetTranferId);
        }
      }
      else
      {
        this.selectedRecordDetails = new AssetTransfer();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

getAssets()
{
  let locationData:Location = this.assetTransferForm.get('FromLocationObj').value;
  if(locationData!=null)
  {
    let input = {
      Skip:this.assetRegisterPagerConfig.RecordsToSkip,
      Take:this.assetRegisterPagerConfig.RecordsToFetch,
      Search:this.assetTransferForm.get('SearchKey').value==null?"":this.assetTransferForm.get('SearchKey').value,
      LocationId:locationData.LocationID,
      SortExpression:this.assetRegisterPagerConfig.SortingExpr,
      SortDirection:this.assetRegisterPagerConfig.SortingOrder==null||this.assetRegisterPagerConfig.SortingOrder==""?"1":this.assetRegisterPagerConfig.SortingOrder 
    };
    this.assetRegisterServiceObj.searchAsset(input)
        .subscribe((data:{ Assets:Array<Asset> ,TotalRecords:number })=>{
          this.assetsList = data.Assets;
          this.assetRegisterPagerConfig.TotalRecords = data.TotalRecords;
          //looping through all the records so as to marks them as selected...
          if(this.selectedRecordDetails.SelectedAssetDetails!=undefined)
          {
            this.selectedRecordDetails.SelectedAssetDetails.forEach(rec=>{
              let assetRecord = this.assetsList.find(data=>data.AssetDetailsId==rec.AssetDetailsId);
              if(assetRecord!=null)
              {
                assetRecord.IsSelected = true;
              }
            });
          }
    },()=>{

    });
  }
}

onAssetReqRecordSelection(assetTransferId:number)
{
  this.showRightPanelLoadingIcon  = true;
  let userDetails = <UserDetails>this.sessionService.getUser();
  this.assetTransferObj.getAssetTransferReqDetails(assetTransferId,userDetails.UserID)
      .subscribe((data:AssetTransfer)=>{
        if (data != null)
        {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.previousSelectedAssets = data.SelectedAssetDetails.map(data=>data.AssetDetailsId);
          this.assetTransferForm.patchValue(data);
        }
        this.hideText=true;
        this.hideInput=false;
      },()=>{
        this.showRightPanelLoadingIcon = false;
      });
}

showFullScreen(){

  FullScreen(this.rightPanelRef.nativeElement);
}

savedata(){

  this.hideText=true;
  this.hideInput=false;

}
closewindow(){ 

}

split(){ 

  this.leftSection= !this.leftSection;
  this.rightSection= !this.rightSection;
}

pageChange(currentPageNumber:number)
{
  if(!isNaN(currentPageNumber))
  {
    this.assetTransferPagerConfig.RecordsToSkip = this.assetTransferPagerConfig.RecordsToFetch*(currentPageNumber-1);
    if((this.requestSearchKey==null||this.requestSearchKey==""))
    {
      if(this.isApprovalPage == false)
      {
        this.getAssetTransferRequest(0);
      }
      else if(this.isApprovalPage == true)
      {
        this.getAssetTransferRequestForApproval(0);
      }
    }
    else
    {
      this.searchAssetTransferRequests(0);
    }
  }
}

addRecord(){
  this.hideText = false;
  this.hideInput = true;
  this.assetsList = [];
  this.assetsList.length = 0;
  this.selectedRecordDetails = new AssetTransfer();
  this.clearForm();
  this.assetRegisterPagerConfig.RecordsToSkip = 0;
}

    
clearForm()
{
  this.assetTransferForm.reset();
}

saveRecord(action:string)
{
  let status = this.assetTransferForm.status;
  this.showFromLocationErrMsg = false;
  this.showToLocationErrMsg = false;
  let companyId = <number> this.sessionService.getCompanyId();
  if(action=='send'&&this.hideText==true&&this.selectedRecordDetails.AssetTranferId > 0)
  {
      let workFlowDetails:WorkFlowParameter =   
      {
        ProcessId:WorkFlowProcess.AssetTransfer,
        CompanyId:companyId, 
        LocationId:this.selectedRecordDetails.FromLocationId,      
        FieldName:"",
        Value:0,
        DocumentId:this.selectedRecordDetails.AssetTranferId,
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
              this.getAssetTransferRequest(workFlowDetails.DocumentId);
          });
      return;
  }
  if(status!="INVALID")
  {
    let assetTransferReqData = this.assetTransferForm.value;
    let userDetails = <UserDetails>this.sessionService.getUser();
  
    assetTransferReqData.CreatedBy = userDetails.UserID;
    assetTransferReqData.FromLocationId = assetTransferReqData.FromLocationObj.LocationID;
    assetTransferReqData.ToLocationId = assetTransferReqData.ToLocationObj.LocationID;
    assetTransferReqData.CompanyId = companyId;
    assetTransferReqData.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
    if(assetTransferReqData.AssetTranferId == null||assetTransferReqData.AssetTranferId == 0)
    {
      assetTransferReqData.AssetTranferId = 0;
      this.assetTransferObj.createAssetTransferRequest(assetTransferReqData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.SavedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.assetTransferPagerConfig.RecordsToSkip = 0;
          //this.currentPage = 1;
          this.getAssetTransferRequest(0);
      });
    }
    else
    {

      let selectedAssets = assetTransferReqData.SelectedAssets.filter((data,index)=>index>-1);
      assetTransferReqData.DeletedAssets = this.previousSelectedAssets.filter(item =>
                                            selectedAssets.indexOf(item) < 0);
      assetTransferReqData.SelectedAssets = selectedAssets.filter(item =>
                                                this.previousSelectedAssets.indexOf(item) < 0);
      this.assetTransferObj.updateAssetTransferRequest(assetTransferReqData).subscribe((data)=>{
        this.sharedServiceObj.showMessage({
            ShowMessage:true,
            Message:Messages.UpdatedSuccessFully,
            MessageType:MessageTypes.Success
        });
        this.assetTransferPagerConfig.RecordsToSkip = 0;
        //this.currentPage = 1;
        this.getAssetTransferRequest(0);
      });
    }
  }
  else
  {
      Object.keys(this.assetTransferForm.controls).forEach((key:string) => {
          if(this.assetTransferForm.controls[key].status=="INVALID" && this.assetTransferForm.controls[key].touched==false)
          {
            this.assetTransferForm.controls[key].markAsTouched();
          }
      });  
  }
}

cancelRecord(){ 
  if(this.assetTransferList.length > 0 && (this.selectedRecordDetails.AssetTranferId == 0||this.selectedRecordDetails.AssetTranferId==undefined))
  {
    this.onAssetReqRecordSelection(this.assetTransferList[0].AssetTranferId);
  }
  this.hideText=true;
  this.hideInput=false;
}
  
editRecord(){
  this.hideText = false;
  this.hideInput = true;
  this.clearForm();
  this.assetRegisterPagerConfig.RecordsToSkip = 0;
  this.assetTransferForm.patchValue({
    AssetTranferId:this.selectedRecordDetails.AssetTranferId,
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
    SelectedAssets:this.selectedRecordDetails.SelectedAssetDetails.map(data=>data.AssetDetailsId)
  });
  this.getAssets();
}

deleteRecord()
{
  let recordId:number = this.selectedRecordDetails.AssetTranferId;
  let userDetails = <UserDetails>this.sessionService.getUser();
  this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header:Messages.DeletePopupHeader,
      accept: () => {     

        this.assetTransferObj.deleteAssetTransferRequest(recordId, userDetails.UserID).subscribe((data)=>{
              this.sharedServiceObj.showMessage({
                  ShowMessage:true,
                  Message:Messages.DeletedSuccessFully,
                  MessageType:MessageTypes.Success
              });
              this.getAssetTransferRequest(0);
        });
    
      },
      reject: () => {
      }
  });
}

onAssetTransferRequestSearch(event:any)
{
  if (event.target.value != "") {
    this.searchAssetTransferRequests();
  }
  else {
    this.getAssetTransferRequest(0);
  }
}

onAssetSearch(event:any)
{
  this.getAssets();
}

updateStatus(statusId: number) {
  let remarks = "";
  let successMessage = "";
  let formRemarks = this.assetTransferForm.get('Remarks').value;
  if((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval))
  {
      this.assetTransferForm.get('Remarks').setErrors({"required":true});
      this.assetTransferForm.get('Remarks').markAsTouched();
      return ;
  }
  if (statusId == WorkFlowStatus.Approved) {
      if(formRemarks!="" && formRemarks!=null){
         remarks = formRemarks;
      }
      else{
        remarks = "Approved";
      }
      successMessage = Messages.Approved;
  }
  else if (statusId == WorkFlowStatus.Rejected) {
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
    DocumentId: this.selectedRecordDetails.AssetTranferId,
    UserId: userDetails.UserID,
    WorkFlowStatusId: statusId,
    Remarks: remarks,
    RequestUserId: this.selectedRecordDetails.CreatedBy,
    DocumentCode:this.selectedRecordDetails.AssetTranferId.toString(),//need to update to document coee
    ProcessId:WorkFlowProcess.AssetTransfer,
    CompanyId:this.sessionService.getCompanyId(),
    ApproverUserId:0,
    IsReApproval: false
  };
  if(this.isApprovalPage==true)//if it is workflow approval page...
  {
    this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
        .subscribe((data) => {
            this.assetTransferForm.get('Remarks').setValue("");
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: successMessage,
                MessageType: MessageTypes.Success
            });
            this.requestSearchKey = "";
            this.getAssetTransferRequestForApproval((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
        });
  }
  else
  {
    workFlowStatus.ApproverUserId = this.selectedRecordDetails.CurrentApproverUserId 
    this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
    .subscribe((data) => {
        this.assetTransferForm.get('Remarks').setValue("");
        this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: successMessage,
            MessageType: MessageTypes.Success
        });
        this.requestSearchKey = "";
        this.getAssetTransferRequest(workFlowStatus.DocumentId);
    });
  }
}

openDialog() {
  this.showFilterPopUp = true;
  if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
  }
}

resetData() {
  this.isFilterApplied = false;
  this.showFilterPopUp = true;
  this.resetFilters();
}

resetFilters() {
  this.assetTransferFilterForm.reset();
  this.filterMessage = "";
  this.isFilterApplied = false;
  if(this.isApprovalPage==true)
  {
    this.getAssetTransferRequestForApproval(0);
  }
  else
  {
    this.getAssetTransferRequest(0);
  }
  if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
  }
}

filterData() {      
  let fromCompanyId = 0;
  let fromLocationId = 0;
  let requestedbyUser = 0;
  this.filterMessage = "";
  if (this.assetTransferFilterForm.get('FromCompanyObj').value != null) {
    let company = <Companies> this.assetTransferFilterForm.get('FromCompanyObj').value;
    fromCompanyId = company.CompanyId;
  }
  if (this.assetTransferFilterForm.get('FromLocationObj').value != null) {
    let location  =  <Location> this.assetTransferFilterForm.get('FromLocationObj').value;
    fromLocationId = location.LocationID;
  }
  if (this.assetTransferFilterForm.get('RequestedByUser').value != null) {
    let userDetails  =  <UserProfile> this.assetTransferFilterForm.get('RequestedByUser').value;
    requestedbyUser = userDetails.UserID;
  }
  if (fromLocationId == 0 && requestedbyUser == 0 && fromCompanyId == 0) {
    if (open) {
      this.filterMessage = "Please select any filter criteria";
    }
    return;
  }
  this.isFilterApplied = true;
  this.searchAssetTransferRequests(fromCompanyId,fromLocationId,requestedbyUser);
}

onLazyLoad(event:LazyLoadEvent)
{
  this.assetRegisterPagerConfig.RecordsToSkip = event.first;
  this.assetRegisterPagerConfig.SortingExpr = event.sortField;
  this.assetRegisterPagerConfig.SortingOrder = event.sortOrder.toString();
  this.getAssets();
}

}

