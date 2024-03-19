import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, LazyLoadEvent } from 'primeng/primeng';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { FullScreen } from '../../../shared/shared';
import { AssetDisposal } from '../../models/asset-disposal.model';
import { AssetDisposalService } from "../../services/asset-disposal.service";
import { AssetRegisterService } from "../../services/asset-register.service";
import { PagerConfig, Companies, UserDetails, Messages, MessageTypes, WorkFlowStatus, WorkFlowApproval, WorkFlowProcess, UserProfile, Location } from '../../../shared/models/shared.model';
import { Asset } from '../../models/asset.model';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';

@Component({
  selector: 'app-assets-disposal',
  templateUrl: './assets-disposal.component.html',
  styleUrls: ['./assets-disposal.component.css'],
  providers:[AssetRegisterService,AssetDisposalService]
})
export class AssetsDisposalComponent implements OnInit {

hideText: boolean=true;
hideInput: boolean=false;
leftSection:boolean=false;
rightSection:boolean=false;
assetDisposalForm: FormGroup;
assetDisposalFilterForm:FormGroup;
scrollbarOptions:any;
selectedRecordDetails:AssetDisposal;
showGridErrorMessage:boolean=false;
errorMessage:string = Messages.NoRecordsToDisplay;
gridColumns:Array<{field:string,header:string,width:string}>= [];
assetDisposalPagerConfig:PagerConfig;
assetRegisterPagerConfig:PagerConfig;
showLeftPanelLoadingIcon:boolean=false;
showRightPanelLoadingIcon:boolean =false;
assetDisposalList:Array<AssetDisposal>=[];
assetsSearchKey:string="";
requestSearchKey:string="";
assetsList:Array<Asset> =[];
previousSelectedAssets:Array<number>=[];
requestType:string="";
moduleHeading:string="";
isApprovalPage:boolean =false;
workFlowStatus:any;
showFilterPopUp:boolean=false;
filterMessage: string = "";
isFilterApplied: boolean = false;
selectedTabId:number = 1;
@ViewChild('rightPanel') rightPanelRef;
@ViewChild('assetCategory') private assetCategoryRef: any;

constructor(private formBuilderObj:FormBuilder,
            private assetDisposalObj:AssetDisposalService,
            private assetRegisterServiceObj:AssetRegisterService,
            private sharedServiceObj:SharedService,
            private sessionService:SessionStorageService,
            private confirmationServiceObj:ConfirmationService,
            public activatedRoute:ActivatedRoute,
            private renderer:Renderer) { 

  this.workFlowStatus = WorkFlowStatus;
  this.selectedRecordDetails = new AssetDisposal();
  this.assetDisposalPagerConfig = new PagerConfig();
  this.assetDisposalPagerConfig.RecordsToSkip = 0;
  this.assetDisposalPagerConfig.RecordsToFetch = 10;
  this.assetRegisterPagerConfig = new PagerConfig();
  this.assetRegisterPagerConfig.RecordsToSkip = 0;
  this.assetRegisterPagerConfig.RecordsToFetch = 10;
  this.gridColumns = [
    { field: 'Sno', header: 'S.no.',width:"10%" },
    { field: 'Asset', header: 'Asset Name',width:"7%" },
    { field: 'BarCode', header: 'Bar Code',width:"10%" },
    { field: 'PurchasedValue',header:'Purchase Value',width:"7%" },
    { field: 'PurchasedDate', header: 'Purchased Date',width:"10%" },
    { field: 'Supplier', header: 'Supplier',width:"10%" },
    { field: 'InvoiceId', header: 'Invoice Number',width:"10%" },
    { field: 'Location', header: 'Location',width:"10%" },
    { field: 'CurrentValue', header: 'Current Value',width:"10%" },     
    { field: '', header: '',width:"5%" }  
  ];
  this.assetDisposalFilterForm = this.formBuilderObj.group({
    'FromCompanyObj':[null],
    'FromLocationObj':[null],
    'RequestedByUser':[null]
  });
}

ngOnInit() { 

  this.assetDisposalForm = this.formBuilderObj.group({
    AssetDisposalId:[0],
    Remarks:["",[Validators.required]],
    SelectedAssets:[null,[Validators.required]],
    SearchKey:[""],
    ApprovalRemarks:[""],
    Location:[null,[Validators.required]]
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
  let assetDisposalId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
  if(this.activatedRoute.snapshot.params.type=="request"){//if it is "asset disposal request"
    this.moduleHeading = "Asset Disposal";
    this.isApprovalPage = false;
    this.selectedTabId = 1;
    if(assetDisposalId > 0){
      this.searchAssetDisposalRequest(assetDisposalId);
    }
    else {
      this.getAssetDisposalRequest(0);
    }        
  }
  else if(this.activatedRoute.snapshot.params.type=="approval"){//if request is for "asset disposal request approval"
    this.moduleHeading = "Asset Disposal Approval";
    this.isApprovalPage = true;
    this.selectedTabId = 2;
    if(assetDisposalId > 0){
      this.searchAssetDisposalRequest(assetDisposalId);
    }
    else {
      this.getAssetDisposalRequestForApproval(0);
    }
  }
}

onAssetClick(event:any,assetDetailId:number)
{
  let selectedAssets:Array<number> =  this.assetDisposalForm.get('SelectedAssets').value;
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
  this.assetDisposalForm.get('SelectedAssets').patchValue(selectedAssets);
}

locationInputFormater = (x: Location) => x.Name;
    
locationSearch2 = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{        
            let fromCompany:Companies = this.assetDisposalFilterForm.get('FromCompanyObj').value;
            if(fromCompany==undefined||fromCompany==null)
            {       
              this.assetDisposalFilterForm.get('FromLocationObj').setErrors({ 'requiredcompany':true });
              this.assetDisposalFilterForm.get('FromLocationObj').markAsTouched();
              return of([]);
            }
            return this.sharedServiceObj.getLocationByKey(term,fromCompany.CompanyId).pipe(
            catchError(() => {
                return of([]);
            }))
        })
);

locationSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{        
            return this.sharedServiceObj.getLocationByKey(term,this.sessionService.getCompanyId()).pipe(
            catchError(() => {
                return of([]);
            }))
        })
);

onLocationChange(location:any)
{
  setTimeout(()=>{
    let formControls = <FormArray> this.assetDisposalForm.get('SelectedAssets');
    if(formControls.controls!=undefined)
    {
      formControls.controls = [];
      formControls.controls.length = 0;    
    }
    this.selectedRecordDetails.SelectedAssetDetails = [];
    this.selectedRecordDetails.SelectedAssetDetails.length = 0;
    
    this.getAssets();
  },300)  
}

companyInputFormater = (x: Companies) => x.CompanyName;
    
companySearch2 = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{
            if(term==""||term==null)
            {
              this.assetDisposalFilterForm.get('FromLocationObj').patchValue(null);
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
              this.assetDisposalFilterForm.get('RequestedByUser').patchValue(null);
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

getAssetDisposalRequest(assetDisposalId:number)
{
  let input = {
    Skip:this.assetDisposalPagerConfig.RecordsToSkip,
    Take:this.assetDisposalPagerConfig.RecordsToFetch
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetDisposalObj.getAssetDisposalRequest(input)
      .subscribe((data:{ AssetDisposalReq:Array<AssetDisposal> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetDisposalList = data.AssetDisposalReq;
      this.assetDisposalPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetDisposalList.length > 0)
      {
        if(assetDisposalId > 0)
        {
          this.onAssetReqRecordSelection(assetDisposalId);
        }
        else
        {
          this.onAssetReqRecordSelection(this.assetDisposalList[0].AssetDisposalId);
        }
      }
      else
      {
        this.selectedRecordDetails = new AssetDisposal();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

searchAssetDisposalRequest(assetDisposalId:number=0,fromLocationId:number = 0,fromUserId:number = 0)
{
  let userDetails = <UserDetails> this.sessionService.getUser();
  let input = {
    Skip:this.assetDisposalPagerConfig.RecordsToSkip,
    Take:this.assetDisposalPagerConfig.RecordsToFetch,
    IsApprovalPage:this.isApprovalPage,//if it is approval page..
    Search:this.requestSearchKey,
    FromLocationId:fromLocationId,
    RequestFromUserId:fromUserId,
    AssetDisposalId:assetDisposalId,
    UserId:userDetails.UserID
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetDisposalObj.searchAssetDisposalRequest(input)
      .subscribe((data:{ AssetDisposalReq:Array<AssetDisposal> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetDisposalList = data.AssetDisposalReq;
      this.assetDisposalPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetDisposalList.length > 0)
      {
        this.onAssetReqRecordSelection(this.assetDisposalList[0].AssetDisposalId);
      }   
      else
      {
        this.selectedRecordDetails = new AssetDisposal();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}


getAssetDisposalRequestForApproval(assetDisposalId:number)
{
  let userDetails = <UserDetails>this.sessionService.getUser();
  let input = {
    Skip:this.assetDisposalPagerConfig.RecordsToSkip,
    Take:this.assetDisposalPagerConfig.RecordsToFetch,
    UserId:userDetails.UserID
  };
  this.showLeftPanelLoadingIcon = true;
  this.assetDisposalObj.getAssetDisposalRequestForApproval(input)
      .subscribe((data:{ AssetDisposalReq:Array<AssetDisposal> ,TotalRecords:number })=>{

      this.showLeftPanelLoadingIcon = false;
      this.assetDisposalList = data.AssetDisposalReq;
      this.assetDisposalPagerConfig.TotalRecords = data.TotalRecords;
      if(this.assetDisposalList.length > 0)
      {
        if(assetDisposalId > 0)
        {
          this.onAssetReqRecordSelection(assetDisposalId);
        }
        else
        {
          this.onAssetReqRecordSelection(this.assetDisposalList[0].AssetDisposalId);
        }
      }
      else
      {
        this.selectedRecordDetails = new AssetDisposal();
      }
  },()=>{
    this.showLeftPanelLoadingIcon = false;
  });
}

getAssets()
{
  if(this.assetDisposalForm.get('Location').value!=null&&this.assetDisposalForm.get('Location').value.LocationID>0)
  {
    let input = {
      Skip:this.assetRegisterPagerConfig.RecordsToSkip,
      Take:this.assetRegisterPagerConfig.RecordsToFetch,
      Search:this.assetDisposalForm.get('SearchKey').value==null?"":this.assetDisposalForm.get('SearchKey').value,
      LocationId:this.assetDisposalForm.get('Location').value.LocationID,
      IsRegister:false,
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

showTab(tabId:number)
{
  this.selectedTabId = tabId;
}

onAssetReqRecordSelection(assetDisposalId:number)
{
  this.showRightPanelLoadingIcon  = true;
  let userDetails = <UserDetails>this.sessionService.getUser();
  this.assetDisposalObj.getAssetDisposalReqDetails(assetDisposalId,userDetails.UserID)
      .subscribe((data:AssetDisposal)=>{
        if (data != null)
        {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.previousSelectedAssets = data.SelectedAssetDetails.map(data=>data.AssetDetailsId);
          this.assetDisposalForm.patchValue(data);
        }
        this.hideText = true;
        this.hideInput = false;
        this.selectedTabId = 2;
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

pageChange(currentPageNumber:any)
{
  if(!isNaN(currentPageNumber))
  {
    let recordsToSkip = this.assetDisposalPagerConfig.RecordsToFetch*(currentPageNumber-1);
    this.assetDisposalPagerConfig.RecordsToSkip = recordsToSkip;
    if((this.requestSearchKey==null||this.requestSearchKey==""))
    {
      if(this.isApprovalPage == false)
      {
        this.getAssetDisposalRequest(0);
      }
      else if(this.isApprovalPage == true)
      {
        this.getAssetDisposalRequestForApproval(0);
      }
    }
    else
    {
      this.searchAssetDisposalRequest();
    }
  }
}

addRecord(){
  this.hideText = false;
  this.hideInput = true;
  this.assetsList = [];
  this.assetsList.length = 0;
  this.selectedRecordDetails = new AssetDisposal();
  this.clearForm();
  this.assetRegisterPagerConfig.RecordsToSkip = 0;
  this.selectedTabId = 1;
  //this.getAssets();
}

    
clearForm()
{
  this.assetDisposalForm.reset();
}

saveRecord(action:string)
{
  let status = this.assetDisposalForm.status;
  let companyId = <number> this.sessionService.getCompanyId();
  if(action=='send'&&this.hideText==true&&this.selectedRecordDetails.AssetDisposalId > 0)
  {
      let workFlowDetails:WorkFlowParameter =   
      {
        ProcessId:WorkFlowProcess.AssetDisposal,
        CompanyId:companyId,    
        LocationId:this.selectedRecordDetails.Location.LocationID,  
        FieldName:"",
        Value:0,
        DocumentId:this.selectedRecordDetails.AssetDisposalId,
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
              this.getAssetDisposalRequest(workFlowDetails.DocumentId);
          });
      return;
  }
  if(status!="INVALID")
  {
    let assetDisposalReqData = this.assetDisposalForm.value;
    let userDetails = <UserDetails>this.sessionService.getUser(); 
    assetDisposalReqData.CreatedBy = userDetails.UserID;
    assetDisposalReqData.CompanyId = companyId;
    assetDisposalReqData.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
    if(assetDisposalReqData.AssetDisposalId == null||assetDisposalReqData.AssetDisposalId == 0)
    {
      assetDisposalReqData.AssetDisposalId = 0;
      this.assetDisposalObj.createAssetDisposalRequest(assetDisposalReqData).subscribe((data)=>{

          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.SavedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.assetDisposalPagerConfig.RecordsToSkip = 0;
          //this.currentPage = 1;
          this.getAssetDisposalRequest(0);
      });
    }
    else
    {

      let selectedAssets = assetDisposalReqData.SelectedAssets.filter((data,index)=>index>-1);
      assetDisposalReqData.DeletedAssets = this.previousSelectedAssets.filter(item =>
                                            selectedAssets.indexOf(item) < 0);
      assetDisposalReqData.SelectedAssets = selectedAssets.filter(item =>
                                                this.previousSelectedAssets.indexOf(item) < 0);
      this.assetDisposalObj.updateAssetDisposalRequest(assetDisposalReqData).subscribe((data)=>{
        this.sharedServiceObj.showMessage({
            ShowMessage:true,
            Message:Messages.UpdatedSuccessFully,
            MessageType:MessageTypes.Success
        });
        this.assetDisposalPagerConfig.RecordsToSkip = 0;
        //this.currentPage = 1;
        this.getAssetDisposalRequest(0);
      });
    }
  }
  else
  {
      Object.keys(this.assetDisposalForm.controls).forEach((key:string) => {
          if(this.assetDisposalForm.controls[key].status=="INVALID" && this.assetDisposalForm.controls[key].touched==false)
          {
            this.assetDisposalForm.controls[key].markAsTouched();
          }
      });  
  }
}

cancelRecord(){ 
  if(this.assetDisposalList.length > 0 && (this.selectedRecordDetails.AssetDisposalId == 0||this.selectedRecordDetails.AssetDisposalId==undefined))
  {
    this.onAssetReqRecordSelection(this.assetDisposalList[0].AssetDisposalId);
  }
  else if(this.assetDisposalList.length > 0)//to show first tab by default...
  {
    this.selectedTabId = 2;
  }
  this.hideText=true;
  this.hideInput=false;
}
  
editRecord(){
  this.hideText = false;
  this.hideInput = true;
  this.clearForm();
  this.assetRegisterPagerConfig.RecordsToSkip = 0;
  this.assetDisposalForm.patchValue({
    AssetDisposalId:this.selectedRecordDetails.AssetDisposalId,
    Remarks:this.selectedRecordDetails.Remarks,
    SelectedAssets:this.selectedRecordDetails.SelectedAssetDetails.map(data=>data.AssetDetailsId),
    Location:this.selectedRecordDetails.Location
  });
  this.assetDisposalForm.get('Location').disable();
  this.selectedTabId = 1;
  this.getAssets();
}

deleteRecord()
{
  let recordId:number = this.selectedRecordDetails.AssetDisposalId;
  let userDetails = <UserDetails>this.sessionService.getUser();
  this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header:Messages.DeletePopupHeader,
      accept: () => {     

        this.assetDisposalObj.deleteAssetDisposalRequest(recordId, userDetails.UserID).subscribe((data)=>{
              this.sharedServiceObj.showMessage({
                  ShowMessage:true,
                  Message:Messages.DeletedSuccessFully,
                  MessageType:MessageTypes.Success
              });
              this.getAssetDisposalRequest(0);
        });
    
      },
      reject: () => {
      }
  });
}

onAssetDisposalRequestSearch(event:any)
{
  if (event.target.value != "") {
    this.searchAssetDisposalRequest();
  }
  else {
    this.getAssetDisposalRequest(0);
  }
}

onAssetSearch(event:any)
{
  this.getAssets();
}

updateStatus(statusId: number) {
  let remarks = "";
  let successMessage = "";
  let formRemarks = this.assetDisposalForm.get('ApprovalRemarks').value;
  if((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval))
  {
      this.assetDisposalForm.get('ApprovalRemarks').setErrors({"required":true});
      this.assetDisposalForm.get('ApprovalRemarks').markAsTouched();
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
    DocumentId: this.selectedRecordDetails.AssetDisposalId,
    UserId: userDetails.UserID,
    WorkFlowStatusId: statusId,
    Remarks: remarks,
    RequestUserId: this.selectedRecordDetails.CreatedBy,
    DocumentCode:this.selectedRecordDetails.AssetDisposalId.toString(),//need to update to document coee
    ProcessId:WorkFlowProcess.AssetDisposal,
    CompanyId:this.sessionService.getCompanyId(),
    ApproverUserId:0,
    IsReApproval: false
  };
  if(this.isApprovalPage==true)//if it is workflow approval page...
  {
    this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
        .subscribe((data) => {
            this.assetDisposalForm.get('Remarks').setValue("");
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: successMessage,
                MessageType: MessageTypes.Success
            });
            this.requestSearchKey = "";
            this.getAssetDisposalRequestForApproval((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
        });
  }
  else
  {
    workFlowStatus.ApproverUserId = this.selectedRecordDetails.CurrentApproverUserId 
    this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
    .subscribe((data) => {
        this.assetDisposalForm.get('Remarks').setValue("");
        this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: successMessage,
            MessageType: MessageTypes.Success
        });
        this.requestSearchKey = "";
        this.getAssetDisposalRequest(workFlowStatus.DocumentId);
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
  this.assetDisposalFilterForm.reset();
  this.filterMessage = "";
  this.isFilterApplied = false;
  if(this.isApprovalPage==true)
  {
    this.getAssetDisposalRequestForApproval(0);
  }
  else
  {
    this.getAssetDisposalRequest(0);
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
  if (this.assetDisposalFilterForm.get('FromCompanyObj').value != null) {
    let company = <Companies> this.assetDisposalFilterForm.get('FromCompanyObj').value;
    fromCompanyId = company.CompanyId;
  }
  if (this.assetDisposalFilterForm.get('FromLocationObj').value != null) {
    let location  =  <Companies> this.assetDisposalFilterForm.get('FromLocationObj').value;
    fromLocationId = location.CompanyId;
  }
  if (this.assetDisposalFilterForm.get('RequestedByUser').value != null) {
    let userDetails  =  <UserProfile> this.assetDisposalFilterForm.get('RequestedByUser').value;
    requestedbyUser = userDetails.UserID;
  }
  if (fromLocationId == 0 && requestedbyUser == 0) {
    if (open) {
      this.filterMessage = "Please select any filter criteria";
    }
    return;
  }
  this.isFilterApplied = true;
  this.searchAssetDisposalRequest(0,fromLocationId,requestedbyUser);
}

onLazyLoad(event:LazyLoadEvent)
{
  this.assetRegisterPagerConfig.RecordsToSkip = event.first;
  this.assetRegisterPagerConfig.SortingExpr = event.sortField;
  this.assetRegisterPagerConfig.SortingOrder = event.sortOrder.toString();
  this.getAssets();
}

}
