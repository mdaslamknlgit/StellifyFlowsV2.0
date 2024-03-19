import { Component, OnInit, ViewChild, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { SharedService } from "../../services/shared.service";
import { ResponseMessage, Messages, Companies, DashboardData, UserDetails, Notifications, PagerConfig, WorkFlowProcess, NotificationMessageTypes } from "../../models/shared.model";
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, startWith } from 'rxjs/operators';
import { of, interval } from 'rxjs';
import { DashBoardService } from '../../services/dashboard.service';
import { DashboardComponent } from '../../../inventory/components/dashboard/dashboard.component';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../services/sessionstorage.service';
import { ActivatedRoute } from '@angular/router';
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { DomSanitizer } from '@angular/platform-browser';
import { faBell,faEnvelope,faChartLine,faLongArrowAltRight} from '@fortawesome/free-solid-svg-icons';
import { debug } from 'console';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class HeaderComponent implements OnInit, OnDestroy {
  faBell=faBell;
  faEnvelope=faEnvelope;
  faChartLine=faChartLine;
  faArrowRight=faLongArrowAltRight;
  @ViewChild('searchInput') searchInput;
  @ViewChild('notificationDiv') notificationsDivRef: ElementRef;
  @ViewChild('popContent') popContent;
  unreadNotificationsCount: number = 0;
  notifications: Notifications[] = [];
  oldNotifications: Array<Notifications>
  notificationListPagerConfig: PagerConfig;
  sitename: string = "";
  successMessageObj: ResponseMessage;
  selectedCompany: Companies;
  results: DashboardData = new DashboardData();
  defaultCompany: Companies;
  userdetails: UserDetails;
  showCompanyName: boolean = true;
  //ProfileImage:string;
  notificationMessage: string = "";
  companiesList: Array<Companies> = [];
  rolesAccessList: Array<PageAccessLevel> = [];
  notificationPolling;
  companyId: number = 0;
  imageData: any;
  sanitizedImageData: any;
  showuser: boolean = false;
  lgmenu: boolean = false;
  userRoles = [];
  constructor(private sharedServiceObj: SharedService,
    private dashboardService: DashBoardService,
    private router: Router,
    public sessionService: SessionStorageService,
    public activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer) {
    let userDetails = <UserDetails>this.sessionService.getUser();
    //debugger;
    this.successMessageObj = new ResponseMessage();
    this.notificationListPagerConfig = new PagerConfig();
    this.notificationListPagerConfig.RecordsToSkip = 0;
    this.notificationListPagerConfig.RecordsToFetch = 10;

    this.activatedRoute.paramMap.subscribe((data) => {
      let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
      if (Number(companyId) != 0) {
        this.companyId = companyId;
        this.sessionService.setCompanyId(this.companyId);
      }
    });

    this.defaultCompany;
    //this.sharedServiceObj.getCompaniesbykey("").subscribe((data: Array<Companies>) => {    
    this.sharedServiceObj.getCompaniesbyuserId(userDetails.UserID).subscribe((data: Array<Companies>) => {
      //debugger;
      this.companiesList = data;
      if (userDetails != null && userDetails != undefined && (this.companyId == null || this.companyId == 0)) {
        if (this.sessionService.getCompanyId() != false) {
          this.defaultCompany = new Companies();
          this.defaultCompany = this.companiesList.find(data => data.CompanyId == this.sessionService.getCompanyId());
          this.companyId = this.defaultCompany.CompanyId;
        }
        else {
          this.defaultCompany = new Companies();//setting the default company here...
          this.defaultCompany = this.companiesList.find(data => data.IsSelected == 1);
          this.sessionService.setCompanyId(this.defaultCompany.CompanyId);
          this.companyId = this.defaultCompany.CompanyId;
        }
      }
      else {
        this.defaultCompany = this.companiesList.find(data => data.CompanyId == this.companyId);
        this.companyId = this.defaultCompany.CompanyId;

      }
      this.sharedServiceObj.updateCompanyId(Number(this.defaultCompany.CompanyId));
      // this.sharedServiceObj.updateCompany(true);
      this.sharedServiceObj.updateCompanyName(this.defaultCompany.CompanyName);
      // if (this.sessionService.getCompanyId()) {
      //    this.defaultCompany = this.companiesList.find(data => data.CompanyId == this.sessionService.getCompanyId());
      //    //this.companyId=this.defaultCompany.CompanyId;
      //   this.defaultCompany = this.companiesList.find(data => data.IsSelected==1);

      // }
      // else {
      //   if(this.companyId > 0){
      //     this.defaultCompany = this.companiesList.find(data => data.CompanyId == this.companyId);
      //   }
      //   else{
      //     this.defaultCompany = this.companiesList.find(data => data.IsSelected==1);//this.companiesList[0];//setting the default company here...
      //     //this.defaultCompany = this.companiesList[0];
      //     this.companyId=this.defaultCompany.CompanyId;
      //   }
      // }
      this.getRolesAccessLevel();
      this.getAllNotifications();
    });


    this.sharedServiceObj.showSuccessMessage$.subscribe((data: ResponseMessage) => {
      this.successMessageObj = data;
      if (this.successMessageObj.Message == "") {
        this.successMessageObj.Message = Messages.SavedSuccessFully;
      }
      if (data.ShowMessage == true) {
        setTimeout(() => {
          this.successMessageObj.ShowMessage = false;
        }, 5000);
      }
    });

  }

  ngOnInit() {

    this.sitename = "Employee Management System";
    this.userdetails = <UserDetails>this.sessionService.getUser();
    this.sharedServiceObj.updateCompany(false);
    //debugger;
    //this.ProfileImage="../assets/images/profile.png";
  }

  getUserRolesByCompany(companyId: number) {
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, companyId).subscribe((data: Array<Roles>) => {
      debugger;
      this.userRoles = data;
      let userDetails = <UserDetails>this.sessionService.getUser();
      userDetails.Roles = this.userRoles;
      this.sessionService.setUser(userDetails);
      this.getRolesAccessLevel();

    });
  }
  sidebartoggler(){
    alert("ss")
    this.lgmenu=!this.lgmenu;
  }
  getRolesAccessLevel() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
    // this.sharedServiceObj.getRolesAccessByRoleId(userDetails.RoleID).subscribe((data: Array<PageAccessLevel>) => {  
    //     this.rolesAccessList = data;      
    //     this.sessionService.setRolesAccess(this.rolesAccessList);
    //     let roleAccessLevels = this.sessionService.getRolesAccess();
    // });

    this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
      this.rolesAccessList = data;
      this.sessionService.setRolesAccess(this.rolesAccessList);
      let roleAccessLevels = this.sessionService.getRolesAccess();
    });
  }


  getAllNotifications() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.sharedServiceObj.getallNotifications({
      UserId: userDetails.UserID,
      Take: this.notificationListPagerConfig.RecordsToFetch,
      Skip: this.notificationListPagerConfig.RecordsToSkip,

      CompanyId: this.companyId
    }).subscribe((data: { Notifications: Array<Notifications>, TotalRecords: number, UnReadNotificationsCount: number }) => {
      //debugger;
      this.notifications = data.Notifications;
      this.notifications.forEach((record: Notifications) => {
        //   if (record.ProfileImage == null) {
        // debugger;
        record.ProfileImage = "../assets/images/profile.png";

        if(record.NotificationType=="Purchase Order")
        {
          //this.ProfileImage="../assets/images/Purchase.png";
          record.ProfileImage="../assets/images/Purchase.png";
        }
        else
        {
          //this.ProfileImage="../assets/images/profile.png";
          record.ProfileImage="../assets/images/profile.png";
          
        }
        //   }
        //   else {
        //     this.imageData = 'data:image/png;base64,' + record.ProfileImage;
        //     record.ProfileImage = this.sanitizer.bypassSecurityTrustUrl(this.imageData);
        //   }
      });

      this.unreadNotificationsCount = data.TotalRecords;
      // this.getNewNotifications();
    });
  }

  getNewNotifications() {
    let userDetails = <UserDetails>this.sessionService.getUser();
   
    // setInterval((data) => {
    //   
    //   this.sharedServiceObj.getNewNotifications({
    //     UserId: userDetails.UserID,
    //     Take: 10,
    //     Skip: 0,
    //   }).subscribe((notificationResponse: { Notifications: Array<Notifications>, TotalRecords: number }) => {
    //     if (notificationResponse != undefined) {
    //       let newNotifications = [];
    //       notificationResponse.Notifications.forEach(j => {
    //         console.log(this.notifications.findIndex(k => k.NotificationId == j.NotificationId));
    //         if (this.notifications.findIndex(k => k.NotificationId == j.NotificationId) == -1) {
    //           console.log(j, "inside if");
    //           newNotifications.push(j);
    //           console.log(newNotifications);
    //         }
    //       });
    //       console.log(newNotifications);
    //       newNotifications.forEach((newrecord:Notifications)=>{
    //         newrecord.IsNew =false;
    //         console.log(newrecord);
    //         this.notifications.unshift(newrecord);  //pushing new notification into main notifications array..  
    //       });
    //       console.log(this.notifications);
    //       this.unreadNotificationsCount = this.unreadNotificationsCount + newNotifications.length;
    //       if (notificationResponse.Notifications.length > 0) {
    //         notificationResponse.Notifications = notificationResponse.Notifications.map(j => {
    //           j.IsNew = false;
    //           return j;
    //         });
    //         this.sharedServiceObj.updateNotifications(notificationResponse.Notifications).subscribe(() => { });
    //       }
    //       // if (newNotifications.length > 1)
    //       // {

    //       //   Notification.requestPermission((permission)=> {
    //       //     if (permission === "granted") {      
    //       //       let notificationObj = new Notification("Notification",{
    //       //         body:`You have ${newNotifications.length} New Notifications`,
    //       //         icon:"../assets/images/logo.jpg",
    //       //       });
    //       //     }
    //       //   });
    //       //   this.sharedServiceObj.updateNotifications(newNotifications).subscribe(()=>{});
    //       // }
    //       // else if(newNotifications.length==1)
    //       // {
    //       //   // Notification.requestPermission((permission)=> {
    //       //   //   if (permission === "granted") {      
    //       //   //      newNotifications.forEach((newrecord:Notifications,index:number)=>{
    //       //   //         let notificationObj = new Notification(newNotifications[index].NotificationType,{
    //       //   //           body:newNotifications[index].NotificationMessage,
    //       //   //           data:newNotifications[index],
    //       //   //           icon:"../assets/images/logo.jpg",
    //       //   //         });
    //       //   //         notificationObj.onclick = (notificationObj:any)=>{

    //       //   //           this.readNotification(notificationObj.target.data);
    //       //   //         };
    //       //   //     });
    //       //   //   }
    //       //   // });
    //       //   this.sharedServiceObj.updateNotifications(newNotifications).subscribe(()=>{});
    //       // }
    //     }
    //   });
    // }, 30000);

    this.notificationPolling = interval(10000).pipe(

      startWith(0), switchMap(() => this.sharedServiceObj.getNewNotifications({
        UserId: userDetails.UserID,
        CompanyId: this.companyId,
        Take: 10,
        Skip: 0,
      }))).subscribe((notificationResponse: { Notifications: Array<Notifications>, TotalRecords: number }) => {
        if (notificationResponse != undefined) {
          let newNotifications = [];
          notificationResponse.Notifications.forEach(j => {
            //console.log(this.notifications.findIndex(k => k.NotificationId == j.NotificationId));
            if (this.notifications.findIndex(k => k.NotificationId == j.NotificationId) == -1) {
              let documentId = j.DocumentId;
              let oldNotification = null;

              j.ProfileImage = "../assets/images/profile.png";
              newNotifications.push(j);
              //j.IsNew = false;

              //this.notifications.push(j);   
              this.notifications.unshift(j);

              let count = this.notifications.filter(x => x.DocumentId === documentId).length;
              if (count > 1) {
                oldNotification = this.notifications.filter(x => x.DocumentId === documentId && x.NotificationId != j.NotificationId)[0];
              }

              if (oldNotification != null) {
                let index = this.notifications.findIndex(n => n.DocumentId === oldNotification.DocumentId); //find index in your array             
                this.notifications.splice(index, 1);//remove element from array
                oldNotification.IsRead = true;
                oldNotification.IsNew = false;
                this.oldNotifications.push(oldNotification);
                if (this.oldNotifications.length > 0) {
                  this.sharedServiceObj.updateNotifications(this.oldNotifications).subscribe(() => { });
                }
              }
            }
          });

          // if (this.oldNotifications != undefined) {
          //   if (this.oldNotifications.length > 0) {
          //     this.sharedServiceObj.updateNotifications(this.oldNotifications).subscribe(() => { });
          //   }
          // }
          // newNotifications.forEach((newrecord: Notifications) => {
          //   //newrecord.IsNew =false;                   
          //   this.notifications.unshift(newrecord);  //pushing new notification into main notifications array..  
          // });

          this.unreadNotificationsCount = this.unreadNotificationsCount + newNotifications.length;
          // if (notificationResponse.Notifications.length > 0) {
          //   notificationResponse.Notifications = notificationResponse.Notifications.map(j => {
          //     j.IsNew = false;
          //     return j;
          //   });

          //   this.sharedServiceObj.updateNotifications(notificationResponse.Notifications).subscribe(() => { });
          // }
          // if (newNotifications.length > 1)
          // {

          //   Notification.requestPermission((permission)=> {
          //     if (permission === "granted") {      
          //       let notificationObj = new Notification("Notification",{
          //         body:`You have ${newNotifications.length} New Notifications`,
          //         icon:"../assets/images/logo.jpg",
          //       });
          //     }
          //   });
          //   this.sharedServiceObj.updateNotifications(newNotifications).subscribe(()=>{});
          // }
          // else if(newNotifications.length==1)
          // {
          //   // Notification.requestPermission((permission)=> {
          //   //   if (permission === "granted") {      
          //   //      newNotifications.forEach((newrecord:Notifications,index:number)=>{
          //   //         let notificationObj = new Notification(newNotifications[index].NotificationType,{
          //   //           body:newNotifications[index].NotificationMessage,
          //   //           data:newNotifications[index],
          //   //           icon:"../assets/images/logo.jpg",
          //   //         });
          //   //         notificationObj.onclick = (notificationObj:any)=>{

          //   //           this.readNotification(notificationObj.target.data);
          //   //         };
          //   //     });
          //   //   }
          //   // });
          //   this.sharedServiceObj.updateNotifications(newNotifications).subscribe(()=>{});
          // }
        }
      });
  }

  companyInputFormater = (x: Companies) => x.CompanyName;

  /**
   * this mehtod will be called when user gives contents to the  "locsation" autocomplete...
  */
  companySearch = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    map(term => this.companiesList.filter(v => v.CompanyName.toLowerCase().indexOf(term.toLowerCase()) > -1))
  );

  oncompanySelection(event: any) {
    //let dashboard = new DashboardComponent(this.dashboardService);
    this.sessionService.setCompanyId(Number(event.item.CompanyId));
    this.sharedServiceObj.updateDeliveryAddress(event.item.CompanyAddress);
    this.sharedServiceObj.updateCompanyId(Number(event.item.CompanyId));
    this.sharedServiceObj.updateCompany(true);
    this.sharedServiceObj.updateCompanyName(event.item.CompanyName);
    this.userdetails = <UserDetails>this.sessionService.getUser();
    this.userdetails.RoleID = event.item.RoleID;
    this.sessionService.setUser(this.userdetails);
    this.companyId = event.item.CompanyId;
    //dashboard.getDashboardResults(Number(event.item.CompanyId));
    this.showCompanyName = true;
    this.getAllNotifications();
    this.getUserRolesByCompany(this.companyId);

    //this.router.navigateByUrl('inventory/dashboard');
    // this.getRolesAccessLevel();
  }

  hideSuccessMessage() {

  }

  Logout() {
    this.userdetails = <UserDetails>this.sessionService.getUser();
    let userId = <UserDetails>this.sessionService.getUser();
    this.dashboardService.logOffUser(userId.UserID).subscribe(() => { });

    sessionStorage.removeItem("userDetails");
    sessionStorage.removeItem("companyID");
    sessionStorage.removeItem("rolesAccess");
    this.sessionService.removeUser();
    this.sessionService.removeToken();
    //this.notificationPolling.unsubscribe();
    this.router.navigateByUrl('/login');
  }
  hideCompany() {

    this.showCompanyName = false;
    setTimeout(function () {
      $(".auto-complete input").select();
    }, 400);

  }
  showCompany() {
    if (this.defaultCompany != undefined) {
      this.showCompanyName = true;
    }
  }

  selectAllContent($event) {

  }

  getComponentPath(processId: number, messageType: string = ""): string {
    let path: string = "";
    if (processId == WorkFlowProcess.AssetDisposal) {
      path = "/fixedassets/assetdisposal";
    }
    else if (processId == WorkFlowProcess.AssetTransfer) {
      path = "/fixedassets/assettransfer";
    }
    else if (processId == WorkFlowProcess.LocationTransfer) {
      path = "/inventory/location";
    }
    else if (processId == WorkFlowProcess.Supplier) {
      path = "/po/suppliers/";
    }
    else if (processId == WorkFlowProcess.AssetDepreciation) {
      path = "/fixedassets/assetdepreciation";
    }
    else if (processId == WorkFlowProcess.CreditNote) {
      path = "/po/CreditNote";
    }
    else if (processId == WorkFlowProcess.GoodReturnNotes) {
      path = "/po/goodsreturnednotes";
    }
    else if (processId == WorkFlowProcess.ProjectMasterContract) {
      path = "/po/projectcontractmaster";
    }
    else if (processId == WorkFlowProcess.ProjectPaymentContract) {
      path = "/po/projectpaymenthistory";
    }
    else if (processId == WorkFlowProcess.SupplierInvoice) {
      path = "/po/supplierinvoice";
    }
    else if (processId == WorkFlowProcess.ProjectContractVariationOrder) {
      path = "/po/projectcontractvariation";
    }
    else if (processId == WorkFlowProcess.CustomerMaster) {
      path = "/adhoc/customer";
    }
    return path;
  }

  //to mark the notification as read ...
  //

  readNotification(notification: Notifications) {
    if (notification.NotificationMessage.indexOf('recall') == -1) {
      if (notification.ProcessId == WorkFlowProcess.InventoryPurchaseRequest
        || notification.ProcessId == WorkFlowProcess.AssetPurchaseRequest
        || notification.ProcessId == WorkFlowProcess.ExpensePurchaseRequest)//for purchase order request
      {
        let path = "";
        if (notification.MessageType == NotificationMessageTypes.Requested) {

          path = '/po/porequestapproval';
        }
        else if (notification.MessageType == NotificationMessageTypes.Approved
          || notification.MessageType == NotificationMessageTypes.Rejected
          || notification.MessageType == NotificationMessageTypes.AskedForClarification) {
          path = '/po/PurchaseOrderRequest';
        }
        this.router.navigate([path], {
          queryParams: {
            id: notification.DocumentId,
            code: notification.DocumentCode == null ? "" : notification.DocumentCode,
            processId: notification.ProcessId,
            dat: new Date().toJSON()
          }
        });
      }
      else if ((notification.ProcessId == WorkFlowProcess.InventoryPO ||
        notification.ProcessId == WorkFlowProcess.FixedAssetPO ||
        notification.ProcessId == WorkFlowProcess.ContractPOFixed ||
        notification.ProcessId == WorkFlowProcess.ContractPOVariable ||
        notification.ProcessId == WorkFlowProcess.ExpensePO))//for purchase order
      {
        let path = "";
        let type = "";
        if (notification.MessageType == NotificationMessageTypes.Requested) {
          path = '/po/poapproval';
        }
        else if (notification.MessageType == NotificationMessageTypes.Approved
          || notification.MessageType == NotificationMessageTypes.Rejected
          || notification.MessageType == NotificationMessageTypes.AskedForClarification) {

          if (notification.ProcessId == WorkFlowProcess.ContractPOFixed ||
            notification.ProcessId == WorkFlowProcess.ContractPOVariable) {
            type = "master";
            path = '/po/contractpo'
          }
          else {
            path = '/po/pocreation';
          }
        }

        if (notification.MessageType != NotificationMessageTypes.Void) {
          this.router.navigate([path], {
            queryParams: {
              type: type,
              id: notification.DocumentId,
              code: notification.DocumentCode == null ? "" : notification.DocumentCode,
              processId: notification.ProcessId,
              dat: new Date().toJSON()
            }
          });
        }
      }
      else if ((notification.ProcessId == WorkFlowProcess.SalesOrder))//for sales order
      {
        if (notification.MessageType == NotificationMessageTypes.Requested) {

          this.router.navigate(['/po/salesorder', {
            type: 'approval',
            soCode: notification.DocumentCode,
            processId: notification.ProcessId,
            soId: notification.DocumentId,
            dat: new Date().toJSON()
          }]);
        }
        else if ((notification.MessageType == NotificationMessageTypes.Approved
          || notification.MessageType == NotificationMessageTypes.Rejected
          || notification.MessageType == NotificationMessageTypes.AskedForClarification)) {

          this.router.navigate(['/po/salesorder', {
            soCode: notification.DocumentCode,
            processId: notification.ProcessId,
            soId: notification.DocumentId,
            dat: new Date().toJSON()
          }]);
        }
      }
      else if (notification.MessageType == NotificationMessageTypes.SentMessage) {
        this.router.navigate(['/facility/ticketmanagement', {
          poCode: notification.DocumentCode,
          processId: notification.ProcessId,
          poId: notification.DocumentId,
          dat: new Date().toJSON()
        }]);
      }
      else//use this for all module from now.....
      {
        let path = this.getComponentPath(notification.ProcessId);

        if (notification.MessageType == NotificationMessageTypes.Requested) {
          path = `${path}/approval`;
        }
        else if ((notification.MessageType == NotificationMessageTypes.Approved
          || notification.MessageType == NotificationMessageTypes.Rejected
          || notification.MessageType == NotificationMessageTypes.AskedForClarification)) {
          path = `${path}/request`;
        }
        if (notification.ProcessId == WorkFlowProcess.ProjectPaymentContract
          || notification.ProcessId == WorkFlowProcess.ProjectContractVariationOrder
        ) {
          path = `${path}/0/${notification.DocumentId}`;
          this.router.navigate([path], {
            queryParams: {
              cid: notification.CompanyId,
              code: notification.DocumentCode == null ? "" : notification.DocumentCode,
              processId: notification.ProcessId,
              dat: new Date().toJSON()
            }
          });
        }
        else {
          
          this.router.navigate([path], {
            queryParams: {
              id: notification.DocumentId,
              cid: notification.CompanyId,
              code: notification.DocumentCode == null ? "" : notification.DocumentCode,
              processId: notification.ProcessId,
              dat: new Date().toJSON()
            }
          });
        }
      }
    }
    if (notification.IsRead == false || notification.IsNew == true) {
      notification.IsRead = true;
      notification.IsNew = false;
      var notifs: Array<Notifications> = [];
      notifs.push(notification);
      this.sharedServiceObj.updateNotifications(notifs).subscribe(() => {
        //this.notifications = this.notifications.filter(data => data.NotificationId != notification.NotificationId);
        let index = this.notifications.findIndex(n => n.NotificationId === notification.NotificationId); //find index in your array             
        this.notifications.splice(index, 1);//remove element from array
        this.unreadNotificationsCount = this.notifications.filter(data => data.IsRead == false).length;
      });
    }
  }
  onClick(event: any) {
    if (event != undefined) {
      if (this.notificationsDivRef != undefined && !this.notificationsDivRef.nativeElement.contains(event.target)) // or some similar check
      {
        //this.popContent.close();
      }
    }
  }
  showuserinfo() {
    this.showuser = !this.showuser
  }
  ngOnDestroy() {
    //this.notificationPolling.unsubscribe();
  }
}
