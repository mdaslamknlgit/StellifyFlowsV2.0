import { Component, OnInit } from '@angular/core';
import { InvoiceSection, UserDetails } from './../../../shared/models/shared.model';
import { SalesInvoiceService } from '../../services/sales-Invoice.service';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';
import { InvoiceListColumns } from '../../models/grid-columns';
import * as XLSX from 'xlsx';
import { WorkBook, utils, write } from 'xlsx';
@Component({
  selector: 'app-sales-invoice-export',
  templateUrl: './sales-invoice-export.component.html',
  styleUrls: ['./sales-invoice-export.component.css']
})
export class SalesInvoiceExportComponent implements OnInit {
  exportPermission: boolean = false;
  data: any;
  companyId: number = 0;
  userDetails: UserDetails = null;
  userRoles: any = [];
  rolesAccessList = [];
  selectedInvoice: Array<any> = [];
  InvoiceListColumns: Array<{ field: string, header: string, width?: string }> = [];
  requestConfig: any;
  reportData: any;
  constructor(private InvoiceService: SalesInvoiceService,
    private sessionService: SessionStorageService,
    private sharedService: SharedService) {
    debugger
    this.InvoiceListColumns = InvoiceListColumns.filter(item => item);
    this.InvoiceListColumns.pop();
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
  }

  ngOnInit() {
    this.getRoles();
    this.GetOpenSalesInvoices();
  }
  getRoles() {
    if (this.companyId > 0) {
      this.sharedService.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        this.userDetails.Roles = this.userRoles;
        this.sessionService.setUser(this.userDetails);
        let roleIds = Array.prototype.map.call(this.userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedService.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionService.getRolesAccess();
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
              debugger
              let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesinvoiceexport")[0];
              this.exportPermission = approvalRole.IsExport;
            }
          });
        }
      });
    }
  }
  GetOpenSalesInvoices() {
    this.requestConfig = {
      CompanyId: this.companyId,
      IsApprovalPage: false,
      UserId: this.userDetails.UserID
    };
    this.InvoiceService.GetOpenSalesInvoices(this.requestConfig).subscribe(data => {
      this.data = data;
    })
  }
  exportDocument() {
    debugger;
    const ws1_name = 'Invoices';
    const ws2_name = 'Invoice_Details';
    const ws3_name = 'Invoice_Payment_Schedules';
    const ws4_name = 'Invoice_Optional_Fields';
    const ws5_name = 'Invoice_Detail_Optional_Fields';
    let ws1DataDetails = [];
    let ws2DataDetails = [];
    let ws3DataDetails = [];
    let ws4DataDetails = [];
    let ws5DataDetails = [];
    var Ids = this.selectedInvoice.map(function (elem) {
      return elem.DocumentId;
    }).join(",");
    this.InvoiceService.ExportSIDocument(Ids,this.userDetails.UserID).subscribe((result: any) => {
      if (result != null) {
        this.reportData = result;
        this.reportData.Invoices.forEach((e: InvoiceSection, i) => {
          ws1DataDetails.push(e);
        });
        this.reportData.InvoiceDetails.forEach((e, i) => {
          ws2DataDetails.push(e);
        });
        this.reportData.InvoicePaymentScheduleSections.forEach((e, i) => {
          ws3DataDetails.push(e);
        });
        this.reportData.InvoiceOptinalFieldsSections.forEach((e, i) => {
          ws4DataDetails.push(e);
        });
        this.reportData.InvoiceDetailsOptinalFieldsSections.forEach((e, i) => {
          ws5DataDetails.push(e);
        });
        let url = "/assets/ExcelTemplates/AP Invoice.xlsx";
        let req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = (e) => {
          let data = new Uint8Array(req.response);
          let wb = XLSX.read(data, { type: "array" });
          const ws1: any = utils.json_to_sheet(ws1DataDetails);
          const ws2: any = utils.json_to_sheet(ws2DataDetails);
          const ws3: any = utils.json_to_sheet(ws3DataDetails);
          const ws4: any = utils.json_to_sheet(ws4DataDetails);
          const ws5: any = utils.json_to_sheet(ws5DataDetails);
          wb.Sheets[ws1_name] = ws1;
          wb.Sheets[ws2_name] = ws2;
          wb.Sheets[ws3_name] = ws3;
          wb.Sheets[ws4_name] = ws4;
          wb.Sheets[ws5_name] = ws5;
          const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
          let ExcelExportFileName = "ExportBulkSalesInvoice_" + (new Date().getDate()) + ".xlsx";
          saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), ExcelExportFileName);
          this.GetOpenSalesInvoices();
        };
        req.send();
      }
    });
  }
  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    };
    return buf;
  }
}
