import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { Location, MasterProcess, MasterProcessTypes } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { LocationColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';

@Component({
  selector: 'app-location-master',
  templateUrl: './location-master.component.html',
  styleUrls: ['./location-master.component.css']
})
export class LocationMasterComponent implements OnInit {
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  LocationForm: FormGroup;
  LocationColumns: PTableColumn[] = [];
  LocationGrid: Location[] = [];
  userDetails: UserDetails = null;
  showLogPopUp: boolean = false;
  companyId: number = 0;
  userRoles = [];
  rolesAccessList = [];
  constructor(private fb: FormBuilder,
    private sessionService: SessionStorageService,
    private adhocMasterService: AdhocMasterService,
    private sharedService: SharedService,
    private confirmationService: ConfirmationService) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.companyId = this.sessionService.getCompanyId();
  }

  ngOnInit() {
    this.showDetailsScreen = false;
    this.LocationForm = this.fb.group({
      LocationId: 0,
      CompanyId: this.companyId,
      Description: new FormControl('', [Validators.required, ControlValidator.Validator]),
      LocationName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.LocationColumns = LocationColumns.filter(x => x);
    this.GetLocations();
    this.LocationForm.valueChanges.subscribe((form: Location) => {
      this.IsFormValueChanges = false;
      for (var key in this.ExistingVal) {
        var formcontrol = form[key];
        if (formcontrol != null && (this.ExistingVal[key].toString().trim() != formcontrol.toString().trim())) {
          this.IsFormValueChanges = true;
          break;
        }
      }
    });
    this.getRoles();
  }
  getRoles() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    if (this.companyId > 0) {
      this.sharedService.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        userDetails.Roles = this.userRoles;
        this.sessionService.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedService.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionService.getRolesAccess();
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
              this.ClearPermissions();
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "locationmaster")[0];
              let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
              this.logPersmission = auditLogRole.IsView;
              this.addPersmission = role.IsAdd;
              this.editPersmission = role.IsEdit;
              this.deletePersmission = role.IsDelete;
            }
          });
        }
      });
    }
  }

  ClearPermissions() {
    this.logPersmission = false;
    this.addPersmission = false;
    this.editPersmission = false;
    this.deletePersmission = false;
  }

  addRecord(e) {
    this.showDetailsScreen = true;
    this.resetFormData(null);
  }
  cancelRecord() {
    let result: boolean = true;
    if (this.IsFormValueChanges) {
      result = confirm(Messages.DiscardWarning);
    }
    if (result) {
      this.showDetailsScreen = false;
      this.GetLocations();
    }
  }

  GetLocations() {
    this.adhocMasterService.GetLocations(this.companyId).subscribe((result: Location[]) => {
      if (result != null) {
        this.LocationGrid = result;
      }
    })
  }

  ChangeStatus(value: Location, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      Status: value.IsActive,
      DocumentId: value.LocationId,
      ProcessId: MasterProcessTypes.Location,
      UserId: this.userDetails.UserID
    };
    this.confirmationService.confirm({
      message: "Are you sure that you want to proceed? ",
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.adhocMasterService.ChangeMasterProcessStatus(masterProcess).subscribe((data: boolean) => {
          if (data) {
            this.sharedService.showMessage({
              ShowMessage: true,
              Message: `Location ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetLocations();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.LocationGrid.forEach((element: Location) => {
          debugger
          if (element.LocationId == value.LocationId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }

  PostLocation() {
    if (this.LocationForm.valid) {
      let Location: Location = this.LocationForm.value;
      Location.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostLocation(Location).subscribe((result: number) => {
        if (result == -1) {
          this.LocationForm.get('LocationName').setErrors({ 'LocationNameerror': true });
        }
        else {
          this.GetLocations();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.LocationForm);
    }
  }

  GetLocationById(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetLocationById(index).subscribe((data: Location) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: Location) {
    this.LocationForm.reset();
    if (data == null) {
      data = {
        LocationId: 0,
        CompanyId: this.companyId,
        LocationName: '',
        Description: '',
        IsActive: true,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    this.ExistingVal = data;
    this.LocationForm.setValue(data);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
}
