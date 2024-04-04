import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Messages, MessageTypes, PTableColumn, UserDetails } from './../../../shared/models/shared.model';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { MasterProcess, MasterProcessTypes, TenantType } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { CustomerTypesColumns, TenantsTypesColumns } from '../../models/grid-columns';
import { markAllAsTouched } from './../../../shared/shared';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';

@Component({
  selector: 'app-tenants-type',
  templateUrl: './tenants-type.component.html',
  styleUrls: ['./tenants-type.component.css']
})
export class TenantsTypeComponent implements OnInit {
  scrollbarOptions: any;
  ExistingVal: any;
  showDetailsScreen: boolean = false;
  IsFormValueChanges: boolean = false;
  IsEditMode: boolean = false;
  addPersmission: boolean = false;
  editPersmission: boolean = false;
  deletePersmission: boolean = false;
  logPersmission: boolean = false;
  TenantTypeForm: FormGroup;
  TenantsColumns: PTableColumn[] = [];
  tenantTypeGrid: TenantType[] = [];
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
    this.TenantTypeForm = this.fb.group({
      TenantTypeId: 0,
      TenantTypeName: new FormControl('', [Validators.required, ControlValidator.Validator]),
      Description: new FormControl('', [Validators.required, ControlValidator.Validator]),
      CreatedBy: 0,
      UpdatedBy: 0,
      IsActive: true
    });
    this.TenantsColumns = TenantsTypesColumns.filter(x => x);
    this.GetTenantTypes();
    this.TenantTypeForm.valueChanges.subscribe((form: TenantType) => {
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
              let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "tenantstype")[0];
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
      this.GetTenantTypes();
    }
  }

  GetTenantTypes() {
    this.adhocMasterService.GetTenantTypes().subscribe((result: TenantType[]) => {
      if (result != null) {
        this.tenantTypeGrid = result;
      }
    })
  }

  ChangeStatus(value: TenantType, status) {
    value.UpdatedBy = this.userDetails.UserID;
    value.IsActive = !value.IsActive;
    let masterProcess: MasterProcess = {
      Status: value.IsActive,
      DocumentId: value.TenantTypeId,
      ProcessId: MasterProcessTypes.TenantType,
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
              Message: `Tenant Type ${value.IsActive ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
              MessageType: MessageTypes.Success
            });
          }
          this.GetTenantTypes();
        });
      },
      rejectVisible: true,
      acceptLabel: "Yes",
      reject: () => {
        this.tenantTypeGrid.forEach((element: TenantType) => {
          debugger
          if (element.TenantTypeId == value.TenantTypeId) {
            element.IsActive = !value.IsActive;
          }
        });
      }
    });
  }

  PostTenantType() {
    if (this.TenantTypeForm.valid) {
      let CustomerTypeDetail: TenantType = this.TenantTypeForm.value;
      CustomerTypeDetail.UpdatedBy = this.userDetails.UserID;
      this.adhocMasterService.PostTenantType(CustomerTypeDetail).subscribe((result: number) => {
        if (result == -1) {
          this.TenantTypeForm.get('TenantTypeName').setErrors({ 'TenantNameerror': true });
        }
        else {
          this.GetTenantTypes();
          this.showDetailsScreen = false;
        }
      });
    }
    else {
      markAllAsTouched(this.TenantTypeForm);
    }
  }

  EditTenantTypeDetails(index) {
    this.showDetailsScreen = true;
    this.adhocMasterService.GetTenantsById(index).subscribe((data: TenantType) => {
      this.resetFormData(data);
    });
  }

  resetFormData(data: TenantType) {
    this.TenantTypeForm.reset();
    if (data == null) {
      data = {
        TenantTypeId: 0,
        TenantTypeName: '',
        Description: '',
        IsActive: true,
        CreatedBy: this.userDetails.UserID,
        UpdatedBy: this.userDetails.UserID
      };
    }
    this.ExistingVal = data;
    this.TenantTypeForm.setValue(data);
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }

  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }

}
