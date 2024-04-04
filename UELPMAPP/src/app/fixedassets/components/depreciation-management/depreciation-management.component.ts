import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { LazyLoadEvent, ConfirmationService } from 'primeng/primeng';
import { FullScreen } from '../../../shared/shared';
import { AssetDepreciation } from '../../models/asset-depreciation.model';
import { PagerConfig, UserDetails, WorkFlowProcess, WorkFlowStatus, Messages, MessageTypes, Location, WorkFlowApproval, UserProfile, Companies } from '../../../shared/models/shared.model';
import { AssetDepreciationService } from '../../services/asset-depreciation.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { AssetRegisterService } from '../../services/asset-register.service';
import { Asset } from '../../models/asset.model';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { SharedService } from '../../../shared/services/shared.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
@Component({
  selector: 'app-depreciation-management',
  templateUrl: './depreciation-management.component.html',
  styleUrls: ['./depreciation-management.component.css'],
  providers:[AssetDepreciationService,AssetRegisterService]
})
export class DepreciationManagementComponent implements OnInit {

  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('assetCategory') private assetCategoryRef: any;
  assetDefReqList:Array<AssetDepreciation> = [];
  assetsList:Array<Asset> =[];
  gridColumns:Array<{field:string,header:string,width:string}>= [];
  previousSelectedAssets:Array<number>=[];
  departments:Array<Location>=[];
  filterDepartments:Array<Location>=[];
  selectedRecordDetails:AssetDepreciation;
  assetRegisterPagerConfig:PagerConfig;
  assetDepReqPagerConfig:PagerConfig;
  requestType:string = "";
  requestSearchKey:string ="";
  isApprovalPage:boolean = false;
  showLeftPanelLoadingIcon:boolean = false;
  showRightPanelLoadingIcon:boolean = false;
  leftSection:boolean = false;
  rightSection:boolean = false;
  assetDepForm:FormGroup;
  assetDepFilterForm:FormGroup;
  hideInput:boolean = false;
  hideText:boolean = false;
  scrollbarOptions:any;
  isFilterApplied:boolean = false;
  showGridErrorMessage:boolean = false;
  moduleHeading:string;
  depReqSearchKey:string = "";
  companyId:number = 0;
  workFlowStatus:any;
  showFilterPopUp:boolean = false;
  showLocationErrMsg:boolean = false;
  filterMessage: string = "";
  selectedAsset:Asset;
  showPopUp:boolean = false;

  constructor(private depServiceObj:AssetDepreciationService,
              public activatedRoute:ActivatedRoute,
              public sessionService:SessionStorageService,
              private fb:FormBuilder,
              private assetRegisterServiceObj:AssetRegisterService,
              private sharedServiceObj:SharedService,
              private confirmationServiceObj:ConfirmationService,
              private renderer:Renderer)
  {
    this.workFlowStatus = WorkFlowStatus;
    this.assetRegisterPagerConfig = new PagerConfig();
    this.assetRegisterPagerConfig.RecordsToSkip = 0;
    this.assetRegisterPagerConfig.RecordsToFetch = 10;
    this.assetDepReqPagerConfig = new PagerConfig();
    this.assetDepReqPagerConfig.RecordsToSkip = 0;
    this.assetDepReqPagerConfig.RecordsToFetch = 2;
    this.selectedRecordDetails = new AssetDepreciation();
    this.assetDepForm = this.fb.group({
      AssetDepreciationId:[0],
      SearchKey:[""],
      SelectedAssets:[null,[Validators.required]],
      LocationId:[null,[Validators.required]],
      Remarks:[""]
    });
    this.assetDepFilterForm  = this.fb.group({
      LocationId:[""],
      Company:[""],
      RequestedBy:[0]
    });
    this.gridColumns = [
      { field: 'Sno', header: 'S.no.',width:"10%" },
      { field: 'Asset', header: 'Asset Name',width:"15%" },
      { field: 'BarCode', header: 'Bar Code',width:"15%" },
      { field: 'PurchasedDate', header: 'Purchased Date',width:"15%" },  
      { field: 'Location', header: 'Location',width:"15%" },
      { field: 'PurchasedValue',header:'Purchase Value',width:"12%" },
      { field: 'CurrentValue', header: 'Current Value',width:"12%" },     
      { field: '', header: '',width:"10%" }  
    ];
    this.companyId = this.sessionService.getCompanyId();
  }

  ngOnInit()
  {
    this.activatedRoute.paramMap.subscribe((data)=>{
      this.navigateToPage();
    });
    this.activatedRoute.queryParamMap.subscribe((data)=>{ 
      if(this.activatedRoute.snapshot.queryParamMap.get('id')!=null)
       {
         this.navigateToPage();
       }
    }); 
    this.sharedServiceObj.CompanyId$
    .subscribe((data)=>{
        this.companyId = data;
        this.getDepartments();
    });
    this.getDepartments();
  }

  navigateToPage()
  {
    this.requestType =  this.activatedRoute.snapshot.params.type;
    this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');   
    let assetDepId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
    this.assetDepReqPagerConfig.RecordsToSkip = 0;
    if(this.activatedRoute.snapshot.params.type=="request"){//if it is "asset depreciation request      
       this.isApprovalPage = false;
       if(assetDepId > 0){
        this.searchAssetDepRequests(assetDepId);
       }
       else {
         this.getDepreciationsReq(0);
       }   
    }
    else if(this.activatedRoute.snapshot.params.type=="approval"){//if request is for "asset depreciation request approval"
       this.isApprovalPage = true;
       if(assetDepId > 0){
         this.searchAssetDepRequests(assetDepId);
       }
       else {
         this.getDepreciationRequestForApproval(0);
       }   
    }
  }

  searchAssetDepRequests(assetDepId:number=0,fromLocationId:number = 0,fromUserId:number = 0)
  {
    let userDetails = <UserDetails> this.sessionService.getUser();
    let input = {
      Skip:this.assetDepReqPagerConfig.RecordsToSkip,
      Take:this.assetDepReqPagerConfig.RecordsToFetch,
      IsApprovalPage:this.isApprovalPage,//if it is approval page..
      Search:this.requestSearchKey,
      FromLocationId:fromLocationId,
      RequestFromUserId:fromUserId,
      AssetDepreciationId:assetDepId,
      UserId:userDetails.UserID
    };
    this.showLeftPanelLoadingIcon = true;
    this.depServiceObj.searchAssetDepReq(input)
        .subscribe((data:{ AssetDepreciation:Array<AssetDepreciation> ,TotalRecords:number })=>{

        this.showLeftPanelLoadingIcon = false;
        this.assetDefReqList = data.AssetDepreciation;
        this.assetDepReqPagerConfig.TotalRecords = data.TotalRecords;
        if(this.assetDefReqList.length > 0)
        {
          this.onAssetReqRecordSelection(this.assetDefReqList[0].AssetDepreciationId);
        }   
        else
        {
          this.selectedRecordDetails = new AssetDepreciation();
        }
    },()=>{
        this.showLeftPanelLoadingIcon = false;
    });
  }

  getDepartments() {
    this.sharedServiceObj.getDepartmentsByCompany(this.companyId)
        .subscribe((data: Location[]) => {
            this.departments = data; 
        });
  }

  getDepreciationsReq(assetDepId:number)
  {
    let depReqObj = {
      Skip:this.assetDepReqPagerConfig.RecordsToSkip,
      Take:this.assetDepReqPagerConfig.RecordsToFetch
    };
    this.showLeftPanelLoadingIcon = true;
    this.depServiceObj.getAssetDepReq(depReqObj).subscribe((data:{ AssetDepreciation:Array<AssetDepreciation> ,TotalRecords:number })=>{
        this.assetDefReqList = data.AssetDepreciation;
        this.assetDepReqPagerConfig.TotalRecords = data.TotalRecords;
        this.showLeftPanelLoadingIcon = false;
        if(this.assetDefReqList.length > 0)
        {
          if(assetDepId > 0)
          {
            this.onAssetReqRecordSelection(assetDepId);
          }
          else
          {
            this.onAssetReqRecordSelection(this.assetDefReqList[0].AssetDepreciationId);
          }
        }
        else
        {
          this.hideText = true;
          this.hideInput = false;
        }
    },()=>{
      this.showLeftPanelLoadingIcon = false;
    });
  }

  getDepreciationRequestForApproval(assetDepId:number)
  {
    let userDetails = <UserDetails>this.sessionService.getUser();
    let input = {
      Skip:this.assetDepReqPagerConfig.RecordsToSkip,
      Take:this.assetDepReqPagerConfig.RecordsToFetch,
      UserId:userDetails.UserID
    };
    this.showLeftPanelLoadingIcon = true;
    this.depServiceObj.getAssetDepReqForApproval(input)
        .subscribe((data:{ AssetDepreciation:Array<AssetDepreciation> ,TotalRecords:number })=>{
        this.showLeftPanelLoadingIcon = false;
        this.assetDefReqList = data.AssetDepreciation;
        this.assetDepReqPagerConfig.TotalRecords = data.TotalRecords;
        if(this.assetDefReqList.length > 0)
        {
          if(assetDepId > 0)
          {
            this.onAssetReqRecordSelection(assetDepId);
          }
          else
          {
            this.onAssetReqRecordSelection(this.assetDefReqList[0].AssetDepreciationId);
          }
        }
        else
        {
          this.selectedRecordDetails = new AssetDepreciation();
        }
    },()=>{
      this.showLeftPanelLoadingIcon = false;
    });
  }

  onAssetReqRecordSelection(assetDepId:number)
  {
    this.showRightPanelLoadingIcon  = true;
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.depServiceObj.getAssetDepReqDetails(assetDepId)
        .subscribe((data:AssetDepreciation)=>{
          if (data != null)
          {
            this.showRightPanelLoadingIcon = false;
            this.selectedRecordDetails = data;
            this.previousSelectedAssets = data.AssetDetails.map(data=>data.AssetDetailsId);
            this.assetDepForm.patchValue(data);
          }
          this.hideText=true;
          this.hideInput=false;
        },()=>{
          this.showRightPanelLoadingIcon = false;
        });
  }
  
  onLazyLoad(event:LazyLoadEvent)
  {
    this.assetRegisterPagerConfig.RecordsToSkip = event.first;
    this.getAssets();
  }

  pageChange(currentPageNumber:any)
  {
    if(!isNaN(currentPageNumber))
    {
      this.assetDepReqPagerConfig.RecordsToSkip = this.assetDepReqPagerConfig.RecordsToFetch*(currentPageNumber-1);
      let filterData = this.assetDepFilterForm.value;
      if ((this.depReqSearchKey != "" && this.depReqSearchKey!=null)||
          (filterData.LocationId!="" || filterData.RequestedBy > 0)) 
      {       
          this.searchAssetDepRequests(0,filterData.LocationId,filterData.RequestedBy);
      }
      else 
      {
        if(this.isApprovalPage == false)
        {
          this.getDepreciationsReq(0);
        }
        else if(this.isApprovalPage == true)
        {
          this.getDepreciationRequestForApproval(0);
        }
      }
    }
  }

  addRecord(){
    this.hideText = false;
    this.hideInput = true;
    this.assetsList = [];
    this.assetsList.length = 0;
    this.selectedRecordDetails = new AssetDepreciation();
    this.clearForm();
    this.assetRegisterPagerConfig.RecordsToSkip = 0;
    this.getAssets();
  }   

  clearForm()
  {
    this.assetDepForm.reset();
  }

  getAssets()
  {
    let locationId = this.assetDepForm.get('LocationId').value==null?0:this.assetDepForm.get('LocationId').value;

    if(locationId >0)
    {
      let input = {
        Skip:this.assetRegisterPagerConfig.RecordsToSkip,
        Take:this.assetRegisterPagerConfig.RecordsToFetch,
        Search:this.assetDepForm.get('SearchKey').value==null?"":this.assetDepForm.get('SearchKey').value,
        LocationId:locationId
      };
      this.assetRegisterServiceObj.searchAsset(input)
          .subscribe((data:{ Assets:Array<Asset> ,TotalRecords:number })=>{
            this.assetsList = data.Assets;
            this.assetRegisterPagerConfig.TotalRecords = data.TotalRecords;
            //looping through all the records so as to marks them as selected...
            if(this.selectedRecordDetails.AssetDetails!=undefined)
            {
              this.selectedRecordDetails.AssetDetails.forEach(rec=>{
                let assetRecord = this.assetsList.find(data=>data.AssetDetailsId==rec.AssetDetailsId);
                if(assetRecord != null)
                {
                  assetRecord.IsSelected = true;
                }
              });
            }
      },()=>{

      });
    }
    else{
      this.assetsList = [];
      this.assetsList.length = 0;
      this.assetRegisterPagerConfig.TotalRecords = 0;
    }
  }
  onAssetClick(event:any,assetDetailId:number)
  {
    let selectedAssets:Array<number> =  this.assetDepForm.get('SelectedAssets').value;
    if(selectedAssets==null)
    {
      selectedAssets = [];
    }
    if(this.selectedRecordDetails.AssetDetails == undefined)
    {
      this.selectedRecordDetails.AssetDetails = [];
    }
    let assetRecord =  this.assetsList.find(data=>data.AssetDetailsId==assetDetailId);
    if(selectedAssets.findIndex(assetId=>assetId==assetDetailId) == -1)//if asset is not present in the list...
    {
      selectedAssets.push(assetDetailId);
      assetRecord.IsSelected = true;
      this.selectedRecordDetails.AssetDetails.push(assetRecord);
    }
    else
    {
      assetRecord.IsSelected = false;
      let selectedIndex = selectedAssets.findIndex(id=>id==assetDetailId);
      selectedAssets.splice(selectedIndex,1);
      let selectedRecordIndex = selectedAssets.findIndex(id=>id==assetDetailId);
      this.selectedRecordDetails.AssetDetails.splice(selectedRecordIndex,1);
    }
    this.assetDepForm.get('SelectedAssets').patchValue(selectedAssets);
  }
  
  saveRecord(action:string)
  {
    let status = this.assetDepForm.status;
    let companyId = <number> this.sessionService.getCompanyId();
    if(action=='send' && this.hideText==true && this.selectedRecordDetails.AssetDepreciationId > 0)
    {
        let workFlowDetails:WorkFlowParameter =   
        {
          ProcessId:WorkFlowProcess.AssetDepreciation,
          CompanyId:companyId,
          FieldName:"",
          Value:0,
          DocumentId:this.selectedRecordDetails.AssetDepreciationId,
          CreatedBy:this.selectedRecordDetails.CreatedBy,
          WorkFlowStatusId:WorkFlowStatus.WaitingForApproval,
          LocationId:this.selectedRecordDetails.LocationId
        };
        this.sharedServiceObj.sendForApproval(workFlowDetails)
            .subscribe((data)=>{
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.SentForApproval,
                    MessageType: MessageTypes.Success
                });
                this.getDepreciationsReq(workFlowDetails.DocumentId);
            });
        return;
    }
    if(status!="INVALID")
    {
      let assetDepReqData:AssetDepreciation = this.assetDepForm.value;
      let userDetails = <UserDetails>this.sessionService.getUser();  
      assetDepReqData.CreatedBy = userDetails.UserID;
      assetDepReqData.CompanyId = companyId;
      assetDepReqData.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
      if(assetDepReqData.AssetDepreciationId == null||assetDepReqData.AssetDepreciationId == 0)
      {
        assetDepReqData.AssetDepreciationId = 0;
        this.depServiceObj.createAssetDepreciation(assetDepReqData).subscribe((data)=>{
            this.sharedServiceObj.showMessage({
                ShowMessage:true,
                Message:Messages.SavedSuccessFully,
                MessageType:MessageTypes.Success
            });
            this.assetRegisterPagerConfig.RecordsToSkip = 0;
            this.getDepreciationsReq(0);
        });
      }
      else
      {
        let selectedAssets = assetDepReqData.SelectedAssets.filter((data,index)=>index>-1);
        assetDepReqData.DeletedAssets = this.previousSelectedAssets.filter(item =>
                                              selectedAssets.indexOf(item) < 0);
                                              assetDepReqData.SelectedAssets = selectedAssets.filter(item =>
                                                  this.previousSelectedAssets.indexOf(item) < 0);
        this.depServiceObj.updateAssetDepreciation(assetDepReqData).subscribe((data)=>{
          this.sharedServiceObj.showMessage({
              ShowMessage:true,
              Message:Messages.UpdatedSuccessFully,
              MessageType:MessageTypes.Success
          });
          this.assetRegisterPagerConfig.RecordsToSkip = 0;
          this.getDepreciationsReq(0);
        });
      }
    }
    else
    {
      Object.keys(this.assetDepForm.controls).forEach((key:string) => {
          if(this.assetDepForm.controls[key].status=="INVALID" && this.assetDepForm.controls[key].touched==false)
          {
            this.assetDepForm.controls[key].markAsTouched();
          }
      });  
    }
  }

  cancelRecord(){ 
    if(this.assetDefReqList.length > 0 && (this.selectedRecordDetails.AssetDepreciationId == 0||this.selectedRecordDetails.AssetDepreciationId==undefined))
    {
      this.onAssetReqRecordSelection(this.assetDefReqList[0].AssetDepreciationId);
    }
    this.hideText=true;
    this.hideInput=false;
  }
    
  editRecord(){
    this.hideText = false;
    this.hideInput = true;
    this.clearForm();
    this.assetRegisterPagerConfig.RecordsToSkip = 0;
    this.assetDepForm.patchValue({
      AssetDepreciationId:this.selectedRecordDetails.AssetDepreciationId,
      SelectedAssets:this.selectedRecordDetails.AssetDetails.map(data=>data.AssetDetailsId),
      LocationId:this.selectedRecordDetails.LocationId
    });
    this.assetDepForm.get('LocationId').disable();
    this.getAssets();
  }

  deleteRecord()
  {
    let recordId:number = this.selectedRecordDetails.AssetDepreciationId;
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header:Messages.DeletePopupHeader,
        accept: () => {     
          this.depServiceObj.deleteAssetDepreciation(recordId, userDetails.UserID).subscribe((data)=>{
                this.sharedServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.DeletedSuccessFully,
                    MessageType:MessageTypes.Success
                });
                this.getDepreciationsReq(0);
          });   
        },
        reject: () => {
        }
    });
  }

  showFullScreen(){
    FullScreen(this.rightPanelRef.nativeElement);
  }

  onAssetTransferRequestSearch(event:any)
  {
    if (event.target.value != "") {
      this.searchAssetDepRequests();
    }
    else {
      this.getDepreciationsReq(0);
    }
  }
  openDialog()
  {
    this.showFilterPopUp = true;
    if (this.assetCategoryRef != undefined) {
        this.assetCategoryRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  split(){ 
    this.leftSection= !this.leftSection;
    this.rightSection= !this.rightSection;
  }

  onAssetSearch(event:any)
  {
    this.getAssets();
  }

  updateStatus(statusId: number) {
    let remarks = "";
    let successMessage = "";
    let formRemarks = this.assetDepForm.get('Remarks').value;
    if((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval))
    {
        this.assetDepForm.get('Remarks').setErrors({"required":true});
        this.assetDepForm.get('Remarks').markAsTouched();
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
      DocumentId: this.selectedRecordDetails.AssetDepreciationId,
      UserId: userDetails.UserID,
      WorkFlowStatusId: statusId,
      Remarks: remarks,
      RequestUserId: this.selectedRecordDetails.CreatedBy,
      DocumentCode:this.selectedRecordDetails.AssetDepreciationId.toString(),//need to update to document coee
      ProcessId:WorkFlowProcess.AssetDepreciation,
      CompanyId:this.sessionService.getCompanyId(),
      ApproverUserId:0,
      IsReApproval: false 
    };
    if(this.isApprovalPage==true)//if it is workflow approval page...
    {
      this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
          .subscribe((data) => {
              this.assetDepForm.get('Remarks').setValue("");
              this.sharedServiceObj.showMessage({
                  ShowMessage: true,
                  Message: successMessage,
                  MessageType: MessageTypes.Success
              });
              this.requestSearchKey = "";
              this.getDepreciationRequestForApproval((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
          });
    }
    else
    {
      workFlowStatus.ApproverUserId = this.selectedRecordDetails.CurrentApproverUserId 
      this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
      .subscribe((data) => {
          this.assetDepForm.get('Remarks').setValue("");
          this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: successMessage,
              MessageType: MessageTypes.Success
          });
          this.requestSearchKey = "";
          this.getDepreciationsReq(workFlowStatus.DocumentId);
      });
    }
  }

  userInputFormater = (x: UserProfile) => x.FirstName;

  userSearch = (text$: Observable<string>) =>
      text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) =>{
              if(term==""||term==null)
              {
                this.assetDepForm.get('RequestedBy').patchValue(null);
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

  companyInputFormater = (x:Companies) => x.CompanyName;

  locationInputFormater = (x: Location) => x.Name;
    
  companySearch = (text$: Observable<string>) =>
      text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) =>{
              if(term==""||term==null)
              {
                this.assetDepFilterForm.get('LocationId').patchValue(0);
              }
              return this.sharedServiceObj.getCompaniesbykey(term).pipe(
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
            let fromCompany:Companies = this.assetDepFilterForm.get('Company').value;
            if(fromCompany==undefined||fromCompany==null)
            {
              this.showLocationErrMsg = true;   
              return of([]);
            }
            return this.sharedServiceObj.getLocationByKey(term,fromCompany.CompanyId).pipe(
            catchError(() => {
                return of([]);
            }))
        })
  );

  filterData() {      
    let fromCompanyId = 0;
    let fromLocationId = 0;
    let requestedbyUser = 0;
    this.filterMessage = "";
    if (this.assetDepFilterForm.get('Company').value != null) {
      let company = <Companies> this.assetDepFilterForm.get('Company').value;
      fromCompanyId = company.CompanyId;
    }
    if (this.assetDepFilterForm.get('LocationId').value != null) {
      fromLocationId  =  <number> this.assetDepFilterForm.get('LocationId').value;
    }
    if (this.assetDepFilterForm.get('RequestedBy').value != null) {
      let userDetails  =  <UserProfile> this.assetDepFilterForm.get('RequestedBy').value;
      requestedbyUser = userDetails.UserID;
    }
    if (fromLocationId == 0 && requestedbyUser == 0) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }
    this.isFilterApplied = true;
    this.searchAssetDepRequests(0,fromLocationId,requestedbyUser);
  }

  resetFilters() {
    this.assetDepFilterForm.reset();
    this.filterMessage = "";
    this.isFilterApplied = false;
    if(this.isApprovalPage==true)
    {
      this.getDepreciationRequestForApproval(0);
    }
    else
    {
      this.getDepreciationsReq(0);
    }
    if (this.assetCategoryRef != undefined) {
        this.assetCategoryRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  onLocationChange()
  {
    this.getAssets();
  }

  onCompanyChange(event:any)
  { 
    if(event!=null)
    { 
      let company:Companies = event.item;
      this.sharedServiceObj.getDepartmentsByCompany(company.CompanyId)
      .subscribe((data: Location[]) => {
          this.filterDepartments = data; 
      });
    }
  }

  resetData() {
    this.isFilterApplied = false;
    this.showFilterPopUp = true;
    this.resetFilters();
  }

  showAssetPostingDetails(assetDetails:Asset)
  {
    this.showPopUp = true;
    this.selectedAsset = assetDetails;
  }

  hidePopUp()
  {
    this.showPopUp = false;
  }
}
