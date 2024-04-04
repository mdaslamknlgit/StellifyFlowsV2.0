import { Component, OnInit } from '@angular/core';
import { Messages, MessageTypes, UserDetails } from './../../../shared/models/shared.model';
import { SharedService } from './../../../shared/services/shared.service';
import { CustomerService } from '../../services/customer.service';
import { CustomerAddressColumns, CustomerContactsColumns, CustomerImportColumns } from '../../models/grid-columns';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-customer-import',
  templateUrl: './customer-import.component.html',
  styleUrls: ['./customer-import.component.css']
})
export class CustomerImportComponent implements OnInit {
  disableConfirm: boolean = true;
  public cars: any[] = [];
  public cols: any[];
  public addresscols: any[];
  public contactcols: any[];
  public isExpanded: boolean = false;
  public rows: number = 10;
  public expandedRows = {};
  totalRecords: number;
  UserDetails: UserDetails;
  CompanyId: number = 0;
  CompanyName: string = '';
  first = 0;
  public temDataLength: number = 0;
  constructor(private sharedService: SharedService,
    private route: Router,
    private confirmationService: ConfirmationService,
    private sessionService: SessionStorageService,
    private customerService: CustomerService) {
    this.UserDetails = <UserDetails>this.sessionService.getUser();
    this.CompanyId = this.sessionService.getCompanyId();
  }

  ngOnInit() {
    this.cols = CustomerImportColumns.map(x => x);
    this.addresscols = CustomerAddressColumns.map(x => x).slice(1, -1);
    this.contactcols = CustomerContactsColumns.map(x => x).slice(1, -1);
    this.sharedService.getCompanyDetails(this.CompanyId).subscribe((x: any) => {
      this.CompanyName = x.CompanyName;
    });
  }
  uploadFile(event) {
    this.isExpanded = false;
    this.expandedRows = {};
    if (event.target.files.length == 0) {
      return
    }
    let file: File = event.target.files[0];
    if (file.type.toLowerCase() == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.customerService.uploadCustomers(file, this.CompanyId).subscribe((data: any[]) => {
        debugger
        if (data.length == 0) {
          this.disableConfirm = true;
          this.sharedService.showMessage({
            ShowMessage: true,
            Message: Messages.CustomerExcelIncorrect,
            MessageType: MessageTypes.Error
          });
        }
        else {
          this.first = 1;
          this.cars = data;
          this.totalRecords = this.cars.length;
          this.temDataLength = this.cars.length < this.rows ? this.cars.length : this.rows;
          this.disableConfirm = data.filter(x => x.Errors.length != 0).length == 0 ? false : true;
        }
      });
    }
    else {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: Messages.AssetSubcategoryAcceptExcel,
        MessageType: MessageTypes.Error
      });
    }
  }
  expandAll() {
    if (!this.isExpanded) {
      this.cars.forEach(data => {
        this.expandedRows[data.CustomerId] = 1;
      })
    } else {
      this.expandedRows = {};
    }
    this.isExpanded = !this.isExpanded;
  }
  onRowExpand() {
    console.log("row expanded", Object.keys(this.expandedRows).length);
    if (Object.keys(this.expandedRows).length === this.temDataLength) {
      this.isExpanded = true;
    }
  }
  onRowCollapse() {
    console.log("row collapsed", Object.keys(this.expandedRows).length);
    if (Object.keys(this.expandedRows).length === 0) {
      this.isExpanded = false;
    }
  }
  onPage(event: any) {
    this.temDataLength = this.cars.slice(event.first, event.first + this.rows).length;
    this.first = (event.first) + 1;
    this.isExpanded = false;
    this.expandedRows = {};
  }
  upload() {
    this.confirmationService.confirm({
      message: `Are you sure want to upload customers for <br> <b>${this.CompanyName}</b> ?`,
      header: 'Confirmation',
      // rejectVisible: true,
      // rejectLabel: 'No',
      // acceptLabel: 'Yes',
      accept: () => {
        let jsonData: string = JSON.stringify(this.cars);
        var blob = new Blob([jsonData], { type: 'text/plain' });
        this.customerService.PostCustomers(blob, this.UserDetails.UserID, this.CompanyId).subscribe((data: boolean) => {
          if (data) {
            this.sharedService.showMessage({
              ShowMessage: true,
              Message: 'Customers Imported Successfully',
              MessageType: MessageTypes.Success
            });
            this.OnCancel();
          }
        });
      },
      reject: () => { }
    });
  }
  OnCancel() {
    this.route.navigate([`/adhoc/customer/list/request`]);
  }
}