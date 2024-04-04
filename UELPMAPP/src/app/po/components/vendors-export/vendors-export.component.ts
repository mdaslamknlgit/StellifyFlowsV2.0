import { Component, OnInit } from '@angular/core';
import { VendorsConfig, WorkFlowStatus, Messages, MessageTypes } from '../../../shared/models/shared.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SupplierApiService } from '../../services/supplier-api.service';
import { VendorDisplayResult, VendorsList } from '../../models/supplier';
import { WorkBook, utils, write } from 'xlsx';
import { SortEvent, LazyLoadEvent } from 'primeng/primeng';
import { SharedService } from "../../../shared/services/shared.service";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-vendors-export',
  templateUrl: './vendors-export.component.html',
  styleUrls: ['./vendors-export.component.css']
})
export class VendorsExportComponent implements OnInit {
  vendorPagerConfig: VendorsConfig;
  vendorList: Array<VendorsList> = [];
  selectedVendor: Array<VendorsList> = [];
  searchKey: string = "";
  companyId: number = 0;
  gridColumns: Array<{ field: string, header: string, width: string }> = [];
  ExcelExportFileName: string;
  rightSection: boolean = false;
  gridNoMessageToDisplay: string;

  constructor(
    private vendorReqObj: SupplierApiService,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService

  ) {

    this.gridColumns = [
      { field: 'Sno', header: 'S.no.', width: "5%" },
      { field: 'VendorId', header: 'VendorId', width: "20%" },
      { field: 'IDGRP', header: 'IDGRP', width: "20%" },
      { field: 'VendName', header: 'VendName', width: "20%" },
      { field: 'CodeTaxGRP', header: 'CodeTaxGRP', width: "15%" },
      { field: 'TaxClass1', header: 'TaxClass1', width: "10%" },

    ];
    this.vendorPagerConfig = new VendorsConfig();
    // this.vendorPagerConfig.RecordsToSkip = 0;
    // this.vendorPagerConfig.RecordsToFetch = 15;
    this.vendorPagerConfig.SortingExpr = "CreatedDate",
      this.vendorPagerConfig.SortingOrder = "1";
    this.companyId = this.sessionService.getCompanyId();
  }

  ngOnInit() {
    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        this.companyId = data;
        this.getVendors(0);
      });

    this.getVendors(0);
  }


  getVendors(VendorIdToBeSelected: number) {
    let VendorDisplayInput = {
      // Skip: this.vendorPagerConfig.RecordsToSkip,
      // Take: this.vendorPagerConfig.RecordsToFetch,
      // Search: "",
      CompanyId: this.companyId
    };
    this.vendorReqObj.VendorsExport(VendorDisplayInput)
      .subscribe((data: VendorDisplayResult) => {
        this.vendorList = data.Vendor;

        if (this.vendorList.length > 0) {
          this.vendorList = data.Vendor;

          this.vendorPagerConfig.TotalRecords = data.TotalRecords;
        }
        else {
          this.gridNoMessageToDisplay = Messages.NoItemsToDisplay;

          //this.getVendors(0);
          // this.vendorPagerConfig.RecordsToSkip =0;
          //  this.vendorPagerConfig.RecordsToFetch =15;
        }

      });
  }

  customSort(sortEvent: SortEvent) {
    this.vendorPagerConfig.SortingExpr = sortEvent.field;
    this.vendorPagerConfig.SortingOrder = sortEvent.order.toString();

    if (this.searchKey == null || this.searchKey == "") {
      this.getVendors(0);
    }
    else {
      this.getVendors(0);
    }
  }
  onLazyLoad(event: LazyLoadEvent) {
    // this.vendorPagerConfig.RecordsToSkip = event.first;
    this.vendorPagerConfig.SortingExpr = event.sortField;
    this.vendorPagerConfig.SortingOrder = event.sortOrder.toString();

    this.getVendors(0);

  }

  exportVendorsById() {
    let VendorsDetails: Array<VendorsList> = new Array<VendorsList>();
    this.vendorReqObj.exportVendorDataById(this.selectedVendor, this.companyId).subscribe((data: Array<VendorsList>) => {
      VendorsDetails = data;
      const ws1_name = 'Vendors';
      const ws2_name = 'Vendor_Optional_Field_Values';

      var vendorsData = VendorsDetails.map((x) => {
        return {
          'VENDORID': x.VendorId,
          'IDGRP': x.IDGRP,
          'SHORTNAME': x.ShortName,
          'BRN': x.BRN,
          'AMTCRLIMT': x.AMTCRLIMT,
          'IDACCTSET': x.IDAcctSet,
          'VENDNAME': x.VendName,
          'TEXTSTRE1': x.Textstre1,
          'TEXTSTRE2': x.Textstre2,
          'TEXTSTRE3': x.Textstre3,
          'TEXTSTRE4': x.Textstre4,
          'NAMECITY': x.NameCity,
          'CODESTTE': x.CodeStte,
          'CODEPSTL': x.CodePstl,
          'CODECTRY': x.CodeCtry,
          'NAMECTAC': x.NameCtac,
          'TEXTPHON1': x.TextPhon1,
          'TEXTPHON2': x.TextPhon2,
          'CURNCODE': x.CurnCode,
          'CODETAXGRP': x.CodeTaxGRP,
          'TAXCLASS1': x.TaxClass1,
          'EMAIL1': x.Email1,
          'EMAIL2': x.Email2,
          'CTACPHONE': x.CtacPhone,
          'CTACFAX': x.CtacFax

        };
      });

      var vendorsOptionalData = VendorsDetails.map((x) => {
        return {
          'VENDORID': '',
          'OPTFIELD': ''
        };
      });
      if (VendorsDetails.length > 0) {
        let url = "/assets/ExcelTemplates/Supplier.xlsx";
        let req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = (e) => {
          let data = new Uint8Array(req.response);
          let wb = XLSX.read(data, { type: "array" });
          const ws1: any = utils.json_to_sheet(vendorsData);
          const ws2: any = utils.json_to_sheet(vendorsOptionalData);
          wb.Sheets[ws1_name] = ws1;
          wb.Sheets[ws2_name] = ws2;
          const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
          this.ExcelExportFileName = "VendorsExport" + ".xlsx";
          saveAs(new Blob([VendorsSave(wbout)], { type: 'application/octet-stream' }), this.ExcelExportFileName);
          VendorsDetails.forEach((x) => {
            this.vendorReqObj.ChangeVendorStatus(x.SupplierId, WorkFlowStatus.Exported, this.companyId).subscribe(() => {
              this.getVendors(0);
              this.selectedVendor = null;
            });
            this.getVendors(0);
          });
        };
        req.send();
      }
      else {
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.NoRecordsExport,
          MessageType: MessageTypes.Success
        });
      }
      function VendorsSave(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
      }
    });
  }


}
