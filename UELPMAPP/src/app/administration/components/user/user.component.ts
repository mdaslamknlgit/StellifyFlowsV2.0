import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/components/common/api';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { UserManagementList, UserManagement, UserManagementDisplayResult, UserManagementFilterDisplayInput } from '../../models/usermanagement';
import { Observable } from 'rxjs/internal/Observable';
import { UserManagementApiService } from '../../services/user-management-api.service';
import { PagerConfig, Messages, MessageTypes, UserProfile, ResponseStatusTypes } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [UserManagementApiService]
})
export class UserComponent implements OnInit {
  UserManagementPagerConfig: PagerConfig;  
  UserManagementList: Array<UserManagementList> = [];
  selectedUserManagementRecord: UserManagement;
  recordsToSkip: number = 0;
  recordsToFetch: number = 10;
  totalRecords: number = 0;
  hidetext?: boolean = null;
  hideinput?: boolean = null;
  UserFilterInfoForm: FormGroup;
  filterMessage: string = "";
  initSettingsDone = true;
  showRightPanelLoadingIcon: boolean = false;
  showLeftPanelLoadingIcon: boolean = false;
  initDone = false;
  scrollbarOptions: any;
  isFilterApplied: boolean = false;
  userManagementForm: FormGroup;
  userRoles = [];
  formSubmitAttempt: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  UserID:number;
  filteredUser = [];
  userSearchKey: string = null;



  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('userName') private userRef: any;



  constructor(private formBuilderObj: FormBuilder,
    private userManagementApiServiceObj: UserManagementApiService,
    private confirmationServiceObj: ConfirmationService,
    private sharedServiceObj: SharedService,
    public sessionService: SessionStorageService,
    private renderer: Renderer) {      
     }

  ngOnInit() {
      this.UserManagementPagerConfig = new PagerConfig();
      this.UserManagementPagerConfig.RecordsToSkip = 0;
      this.selectedUserManagementRecord = new UserManagement();
      this.UserManagementPagerConfig.RecordsToFetch = 100;

      this.userManagementForm = this.formBuilderObj.group({  
        'UserProfile': [null,{ validators: [Validators.required]}],
        'UserRoles': [null, [Validators.required]],
      });

      this.UserFilterInfoForm = this.formBuilderObj.group({
        UserName: [''],
        UserRoles: ['']
    });
    this.getUserRoles();

    this.getUserManagement(0);


  }


      userInputFormater = (x: UserProfile) => x.UserName;  // change name here
      //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
      userSearch = (text$: Observable<string>) =>   // change name here
          text$.pipe(
              debounceTime(300),
              distinctUntilChanged(),
              switchMap(term => {
                  return this.userManagementApiServiceObj.getUserName({
                      searchKey: term,
                  }).map((data: Array<any>) => {
                      data.forEach((item, index) => {
                          item.index = index;
                      });
                      return data;
                  }).pipe(
                      catchError(() => {
                          return of([]);
                      }))
              })
          );


    getUserRoles(): void {
        let usersResult = <Observable<Array<any>>>this.userManagementApiServiceObj.getUserRoles();
        usersResult.subscribe((data) => {
            this.userRoles = data;          
            this.userRoles = this.userRoles.filter(user => user.RoleName != "SupplierVerifier");          
        });
    }

    showFullScreen() {
      FullScreen(this.rightPanelRef.nativeElement);
  }


    validateControl(control: FormControl) {
      return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }

    getUserManagement(UserIDToBeSelected: number) {
      let displayInput = {
          Skip: this.UserManagementPagerConfig.RecordsToSkip,
          Take: this.UserManagementPagerConfig.RecordsToFetch,
          Search: "",
          // CompanyId: this.companyId
      };
      this.userManagementApiServiceObj.getUserManagement(displayInput)
          .subscribe((data: UserManagementDisplayResult) => {             
              this.UserManagementList = data.UserManagementList;
              this.UserManagementPagerConfig.TotalRecords = data.TotalRecords;
              this.showLeftPanelLoadingIcon = false;
              if (this.UserManagementList.length > 0) {
                  if (UserIDToBeSelected == 0) {
                      this.onRecordSelection(this.UserManagementList[0].UserID);

                  }
                  else {
                      this.onRecordSelection(UserIDToBeSelected);
                  }
              }
              else {
                  this.addRecord();
              }
          }, (error) => {
              this.showLeftPanelLoadingIcon = false;
          });
    }

    onSearchInputChange(event: any) {   // remove event
      if (this.userSearchKey != "") {
          if (this.userSearchKey.length >= 3) {
              this.getAllSearchUser(this.userSearchKey, 0);
          }
      }
      else {
          this.getUserManagement(0);
      }
  }


  getAllSearchUser(searchKey: string, UserIDToBeSelected: number) {
        let userListInput = {
            Skip: 0,
            Take: this.UserManagementPagerConfig.RecordsToFetch,
            Search: searchKey
        };
        this.userManagementApiServiceObj.getUserManagement(userListInput)
            .subscribe((data: UserManagementDisplayResult) => {
                this.UserManagementList = data.UserManagementList
                this.UserManagementPagerConfig.TotalRecords = data.TotalRecords
                if (this.UserManagementList.length > 0) {
                    if (UserIDToBeSelected === 0) {
                        this.onRecordSelection(this.UserManagementList[0].UserID);
                    }
                    else {
                        this.onRecordSelection(UserIDToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }

    
    addRecord() {
        this.hidetext = false;
        this.hideinput = true;
        this.selectedUserManagementRecord = new UserManagement();
        this.userManagementForm.reset();
        this.userManagementForm.setErrors(null);
    }

    cancelRecord() {
        this.userManagementForm.reset();
        this.userManagementForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.UserManagementList.length > 0 && this.selectedUserManagementRecord != undefined) {
            if (this.selectedUserManagementRecord.UserID == undefined || this.selectedUserManagementRecord.UserID == 0) {
                this.onRecordSelection(this.UserManagementList[0].UserID);
            }
            else {
                this.onRecordSelection(this.selectedUserManagementRecord.UserID);
            }
            this.hideinput = false;
            this.hidetext = true;
        }
        else {
            this.hideinput = null;
            this.hidetext = null;
        }
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.userManagementForm.reset();
        this.userManagementForm.setErrors(null);
       // console.log(this.selectedUserManagementRecord);
        this.userManagementForm.patchValue(this.selectedUserManagementRecord);
        this.UserID=this.selectedUserManagementRecord.UserID;
    }

    deleteRecord() {
      
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedUserManagementRecord.UserID;
                this.userManagementApiServiceObj.deleteUserManagement(recordId).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });

                    this.getUserManagement(0);
                });
            },
            reject: () => {
            }
        });
    }

    onRecordSelection(UserID: number) {
        this.userManagementApiServiceObj.getUserDetails(UserID)
            .subscribe((data: UserManagement) => {
                this.selectedUserManagementRecord = data;
                this.userManagementForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon = false;
            });
    }

      pageChange(currentPageNumber: any) {
          this.UserManagementPagerConfig.RecordsToSkip = this.UserManagementPagerConfig.RecordsToFetch * (currentPageNumber - 1);
          this.getUserManagement(0);
      }

      split() {
          this.leftsection = !this.leftsection;
          this.rightsection = !this.rightsection;
      }

      onUserChange(event?: any) {
          if (event != null && event != undefined) {
              this.UserID = event.item.UserID;
          }
      }


      openDialog() {
        this.initDone = true;
        if (this.userRef != undefined) {
            this.userRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.userRef.nativeElement, 'focus'); // NEW VERSION
        }
      }

      resetData() {
          this.isFilterApplied = false;
          this.initDone = true;
          this.resetFilters();
      }

      resetFilters() {
        
          this.UserFilterInfoForm.get('UserName').setValue("");
          this.UserFilterInfoForm.get('UserRoles').setValue("");
          this.filterMessage = "";
          this.filteredUser = this.UserManagementList;
          if (this.filteredUser.length > 0) {
              this.getUserManagement(0);
          }

          this.isFilterApplied = false;
          if (this.userRef != undefined) {
              this.userRef.nativeElement.focus();
              this.renderer.invokeElementMethod(this.userRef.nativeElement, 'focus'); // NEW VERSION
          }
      }

      openSettingsMenu() {
          this.initSettingsDone = true;
      }

      saveRecord() {
       // console.log(this.userManagementForm.value);
        let usermanagementFormStatus = this.userManagementForm.status;
        if (usermanagementFormStatus != "INVALID") {
            let usermanagementDetails: UserManagement = this.userManagementForm.value;
            
            
          //  console.log(this.userManagementForm.value);

            if (this.selectedUserManagementRecord.UserID == 0 || this.selectedUserManagementRecord.UserID == null) {
              usermanagementDetails.UserID = this.UserID;
                this.userManagementApiServiceObj.createUserManagement(usermanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getUserManagement(response.Value);
                    }
                    else if (response.Status == "Duplicate UserID") {
                        this.userManagementForm.get('UserProfile').setErrors({
                            'DuplicateUser': true
                        });
                    }
                });
            }
            else {
              usermanagementDetails.UserID = this.selectedUserManagementRecord.UserID;

                this.userManagementApiServiceObj.updateUserManagement(usermanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;

                        this.getUserManagement(usermanagementDetails.UserID);

                    }
                    else if (response.Status == "Duplicate UserID") {
                      this.userManagementForm.get('UserProfile').setErrors({
                          'DuplicateUser': true
                      });
                  }
                });
            }
        }
        else {            
            Object.keys(this.userManagementForm.controls).forEach((key: string) => {
                if (this.userManagementForm.controls[key].status == "INVALID" && this.userManagementForm.controls[key].touched == false) {
                    this.userManagementForm.controls[key].markAsTouched();
                }
            });
        }
    }


    filterData() {
      
          let userName = "";
          let userRoles = "";
          this.filterMessage = "";

          if (this.UserFilterInfoForm.get('UserName').value != "") {
              userName = this.UserFilterInfoForm.get('UserName').value.UserName;
          }

          if (this.UserFilterInfoForm.get('UserRoles').value != "") {
            userRoles = this.UserFilterInfoForm.get('UserRoles').value;
          }

          if (userName === '' && userRoles === '') {
              if (open) {
                  this.filterMessage = "Please select any filter criteria";
              }
              return;
          }

          let userManagementFilterDisplayInput: UserManagementFilterDisplayInput = {
              Skip: this.UserManagementPagerConfig.RecordsToSkip,
              Take: this.UserManagementPagerConfig.RecordsToFetch,
              UserNameFilter: userName,
              RolesNameFilter: userRoles
          };
          this.userManagementApiServiceObj.getUserManagementFilter(userManagementFilterDisplayInput)

              .subscribe((data: UserManagementDisplayResult) => {
                  if ( data.TotalRecords > 0) {
                      this.isFilterApplied = true;
                      if (open) {
                          this.initDone = false;
                      }
                      this.UserManagementPagerConfig.TotalRecords = data.TotalRecords;
                      this.UserManagementList = data.UserManagementList;
                      this.onRecordSelection(this.UserManagementList[0].UserID);
                  }
                  else {
                      this.filterMessage = "No matching records are found";
                  }
              }, (error) => {

                  this.hidetext = false;
                  this.hideinput = true;
              });

      }


}
