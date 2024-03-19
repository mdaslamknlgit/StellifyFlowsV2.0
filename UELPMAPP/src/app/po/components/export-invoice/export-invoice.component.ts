import { Component, OnInit, Renderer } from '@angular/core';
import { Invoices, PagerConfig, WorkFlowStatus, Messages, MessageTypes, PurchaseOrderType, UserDetails } from '../../../shared/models/shared.model';
import { InvoiceList, InvoiceDetails, InvoiceDisplayResult, InvoiceItems, ExportBulkInvoice } from '../../models/supplier-invoice.model';
import { SupplierInvoiceService } from '../../services/supplier-invoice.service';
import { FormBuilder } from '@angular/forms';
import { SharedService } from '../../../shared/services/shared.service';
import { ConfirmationService, SortEvent, LazyLoadEvent } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { WorkBook, utils, write } from 'xlsx';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-export-invoice',
  templateUrl: './export-invoice.component.html',
  styleUrls: ['./export-invoice.component.css'],
  providers: [SupplierInvoiceService]
})
export class ExportInvoiceComponent implements OnInit {
  gridColumns: Array<{ field: string, header: string, width: string }> = [];
  invoicesList: Array<InvoiceList> = [];
  selectedInvoice: Array<InvoiceList> = [];
  invoicePagerConfig: PagerConfig;
  searchKey: string = "";
  showFilterPopUp: boolean = false;
  isFilterApplied: boolean = false;
  filterMessage: string = "";
  rightsection: boolean = false;
  showPopUp: boolean = false;
  ExcelExportFileName: string;
  FileName:string="";
  exportPermission: boolean;
  itemList: Array<InvoiceItems> = [];
  public screenWidth: any;
  //selectedInvoice:InvoiceDetails;
  companyId: any;
  constructor(private invoiceReqObj: SupplierInvoiceService,
    private formBuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private supplierInvoiceService: SupplierInvoiceService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService,
    private renderer: Renderer,
    private reqDateFormatPipe: RequestDateFormatPipe) {

    this.gridColumns = [
      { field: 'Sno', header: 'S.no.', width: "5%" },
      { field: 'InvoiceCode', header: 'Invoice Code', width: "20%" },
      { field: 'InvoiceId', header: 'Invoice Id', width: "20%" },
      { field: 'SupplierName', header: 'Supplier Name', width: "20%" },
      { field: 'TotalAmount', header: 'TotalAmount', width: "20%" },

    ];
    this.invoicePagerConfig = new PagerConfig();
    this.invoicePagerConfig.RecordsToSkip = 0;
    this.invoicePagerConfig.RecordsToFetch = 15;
    this.invoicePagerConfig.SortingExpr = "CreatedDate",
      this.invoicePagerConfig.SortingOrder = "1";
    this.companyId = this.sessionService.getCompanyId();
  }

  ngOnInit() {

    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "exportinvoice")[0];

      this.exportPermission = formRole.IsExport

    }
    else {

      this.exportPermission = true;
    }
    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        this.companyId = data;
        this.getInvoices(0);
      });
    this.getInvoices(0);
    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-150;
      }
  }
  getInvoices(InvoiceIdToBeSelected: number) {

    //getting the list of purchase orders...
    let InvoiceDisplayInput = {
      Skip: this.invoicePagerConfig.RecordsToSkip,
      Take: this.invoicePagerConfig.RecordsToFetch,
      Search: "",
      CompanyId: this.sessionService.getCompanyId(),
    };
    this.invoiceReqObj.getExportInvoice(InvoiceDisplayInput)
      .subscribe((data: InvoiceDisplayResult) => {
        this.invoicesList = data.Invoice;
        //this.invoicesList = this.invoicesList.filter((x=>x.WorkFlowStatusId == WorkFlowStatus.Completed));

        this.invoicePagerConfig.TotalRecords = data.TotalRecords;

      });
  }

  customSort(sortEvent: SortEvent) {
    this.invoicePagerConfig.SortingExpr = sortEvent.field;
    this.invoicePagerConfig.SortingOrder = sortEvent.order.toString();

    if (this.searchKey == null || this.searchKey == "") {
      this.getInvoices(0);
    }
    else {
      this.getInvoices(0);
    }
  }
  onLazyLoad(event: LazyLoadEvent) {
    this.invoicePagerConfig.RecordsToSkip = event.first;
    this.invoicePagerConfig.SortingExpr = event.sortField;
    this.invoicePagerConfig.SortingOrder = event.sortOrder.toString();

    this.getInvoices(0);

  }

  // ExportInvoice()
  // {

  //   let invoiceDetials :Array<InvoiceDetails> = new Array<InvoiceDetails>();


  //     this.selectedInvoice.forEach(item=>{
  //     this.invoiceReqObj.getInvoiceDetails(item.InvoiceId).subscribe((data:InvoiceDetails)=>{
  //       invoiceDetials.push(data);
  //     });

  //   });
  // console.log("Length"+invoiceDetials.length);
  // //   this.invoiceReqObj.exportBulkInvoice(this.selectedInvoice).subscribe((data:string)=>{
  // //     this.sharedServiceObj.showMessage({
  // //         ShowMessage:true,
  // //         Message:Messages.ExportRecord,
  // //         MessageType:MessageTypes.Success
  // //     });
  // //    ;
  // //    this.getInvoices(0);
  // // });

  // }

pad2(n) { return n < 10 ? '0' + n : n }


  showLeftCol(event) {
    $(".leftdiv").removeClass("hideleftcol");
    $(".rightPanel").removeClass("showrightcol");
  }
  ExportInvoice() {
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    let invoiceSelectedList: Array<InvoiceDetails>;
    let potypeid;
    let accountcode;
    this.invoiceReqObj.exportBulkInvoice(this.selectedInvoice, userDetails.UserID, this.companyId).subscribe((data: Array<InvoiceDetails>) => {
      invoiceSelectedList = data;
      const ws1_name = 'Invoices';
      const ws2_name = 'Invoice_Details';
      const ws3_name = 'Invoice_Payment_Schedules';
      const ws4_name = 'Invoice_Optional_Fields';
      const ws5_name = 'Invoice_Detail_Optional_Fields';
      let cpovalue = [];
      this.itemList = [];
      invoiceSelectedList.forEach(data => {
        if (data.SelectedCPOs != null || data.SelectedCPOs != undefined) {
          data.SelectedCPOs.forEach(data1 => {
            let cponumbersplit = data1.CPONumber.split('-');

            cpovalue.push(cponumbersplit[0]);

          })
        }
      });


      data.forEach((x) => {

        x.InvoiceItems.forEach((y) => {
          this.itemList.push(y);
        })
      })
      let count: number = 0;
      let ws1DataDetails = [];
      let ws2DataDetails = [];
      let sheet1detail = [];
      let Ecponumber = "";
      let previd;
      for (let i = 0; i < invoiceSelectedList.length; i++) {
        let x: any = invoiceSelectedList[i];
        let _supplier = x.Supplier;
        let _INVCDESC = x.InvoiceDescription;
        if (_supplier.SupplierShortName != null && _supplier.SupplierShortName != undefined) {
          if (_supplier.SupplierShortName.length > 0) {
            _INVCDESC = _supplier.SupplierShortName + '/' + x.InvoiceDescription;
          }
          else {
            _INVCDESC = x.InvoiceDescription;
          }
        }
        if ((x.SelectedCPOs != null || x.SelectedCPOs != undefined) && (x.POTypeId == 5 || x.POTypeId == 6)) {
          x.SelectedCPOs.forEach(element => {
            let cponumbersplit = element.CPONumber.split('-');
            if (Ecponumber != element.CPONumber.split('-')[0]) {
              count = count + 1;
              Ecponumber = element.CPONumber.split('-')[0];
              ws1DataDetails.push(
                {
                  'CNTBTCH': '1',
                  'CNTITEM': count,
                  'IDVEND': x.Supplier.SupplierCode,
                  'IDINVC': x.SupplierRefNo,
                  'TEXTTRX': '1',
                  'ORDRNBR': '',
                  'PONBR': cponumbersplit[0],
                  'INVCDESC': _INVCDESC,
                  'INVCAPPLTO': '',
                  'IDACCTSET': x.AccountSetId,
                  'DATEINVC': x.InvoiceDateString,
                  'FISCYR': new Date().getFullYear(),
                  'FISCPER': new Date().getMonth() + 1,
                  'CODECURN': x.CurrencyCode,
                  'EXCHRATE': '',
                  'TERMCODE': x.PaymentTermsCode,
                  'DATEDUE': x.DueDateString,
                  'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                  'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                  'BASETAX1': (x.SubTotal - x.Discount).toFixed(2),
                  'AMTTAX1': x.TotalTax.toFixed(2),
                  'AMTTAXDIST': x.TotalTax.toFixed(2),
                  'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                  'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                  'AMTGROSDST': x.TotalAmount.toFixed(2),
                  'AMTDUE': x.TotalAmount.toFixed(2),
                  'AMTTAXTOT': x.TotalTax.toFixed(2),
                  'AMTGROSTOT': x.TotalAmount.toFixed(2),
                }
              );
              sheet1detail.push(
                {
                  'CNTITEM': count,
                  'InvoiceId': x.InvoiceId,
                  'InvoiceTypeId': x.InvoiceTypeId,
                  'PurchaseOrderCode': element.CPONumber,
                  'PoTypeId': x.POTypeId


                }
              );
            }
            else {
              count = count;
              Ecponumber = element.CPONumber.split('-')[0];
            }
          });
        }
        else if (invoiceSelectedList[i].SelectedCPOs == null) {
          if (x.PurchaseOrderCode != null) {
            let poNumber = x.PurchaseOrderCode.split(',');
            if (poNumber.length > 1) {
              for (let i = 0; i < poNumber.length; i++) {
                count = count + 1;
                ws1DataDetails.push(
                  {
                    'CNTBTCH': '1',
                    'CNTITEM': count,
                    'IDVEND': x.Supplier.SupplierCode,
                    'IDINVC': x.SupplierRefNo,
                    'TEXTTRX': '1',
                    'ORDRNBR': '',
                    'PONBR': poNumber[i],
                    'INVCDESC': _INVCDESC,
                    'INVCAPPLTO': '',
                    'IDACCTSET': x.AccountSetId,
                    'DATEINVC': x.InvoiceDateString,
                    'FISCYR': new Date().getFullYear(),
                    'FISCPER': new Date().getMonth() + 1,
                    'CODECURN': x.CurrencyCode,
                    'EXCHRATE': '',
                    'TERMCODE': x.PaymentTermsCode,
                    'DATEDUE': x.DueDateString,
                    'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                    'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                    'BASETAX1': (x.SubTotal - x.TotalTax).toFixed(2),
                    'AMTTAX1': x.TotalTax.toFixed(2),
                    'AMTTAXDIST': x.TotalTax.toFixed(2),
                    'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                    'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                    'AMTGROSDST': x.TotalAmount.toFixed(2),
                    'AMTDUE': x.TotalAmount.toFixed(2),
                    'AMTTAXTOT': x.TotalTax.toFixed(2),
                    'AMTGROSTOT': x.TotalAmount.toFixed(2)
                  }
                );
                sheet1detail.push(
                  {
                    'CNTITEM': count,
                    'InvoiceId': x.InvoiceId,
                    'InvoiceTypeId': x.InvoiceTypeId,
                    'PurchaseOrderCode': poNumber[i],
                    'PoTypeId': x.POTypeId

                  }
                );
              }
            }
            else {
              count = count + 1;
              ws1DataDetails.push(

                {
                  'CNTBTCH': '1',
                  'CNTITEM': count,
                  'IDVEND': x.Supplier.SupplierCode,
                  'IDINVC': x.SupplierRefNo,
                  'TEXTTRX': '1',
                  'ORDRNBR': '',
                  'PONBR': x.PurchaseOrderCode,
                  'INVCDESC': _INVCDESC,
                  'INVCAPPLTO': '',
                  'IDACCTSET': x.AccountSetId,
                  'DATEINVC': x.InvoiceDateString,
                  'FISCYR': new Date().getFullYear(),
                  'FISCPER': new Date().getMonth() + 1,
                  'CODECURN': x.CurrencyCode,
                  'EXCHRATE': '',
                  'TERMCODE': x.PaymentTermsCode,
                  'DATEDUE': x.DueDateString,
                  'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                  'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                  'BASETAX1': (x.SubTotal - x.TotalTax).toFixed(2),
                  'AMTTAX1': x.TotalTax.toFixed(2),
                  'AMTTAXDIST': x.TotalTax.toFixed(2),
                  'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                  'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                  'AMTGROSDST': x.TotalAmount.toFixed(2),
                  'AMTDUE': x.TotalAmount.toFixed(2),
                  'AMTTAXTOT': x.TotalTax.toFixed(2),
                  'AMTGROSTOT': x.TotalAmount.toFixed(2),
                }
              );
              sheet1detail.push(
                {
                  'CNTITEM': count,
                  'InvoiceId': x.InvoiceId,
                  'InvoiceTypeId': x.InvoiceTypeId,
                  'PurchaseOrderCode': x.PurchaseOrderCode,
                  'PoTypeId': x.POTypeId

                }
              );
            }
          }
          else {
            count = count + 1;
            ws1DataDetails.push(

              {
                'CNTBTCH': '1',
                'CNTITEM': count,
                'IDVEND': x.Supplier.SupplierCode,
                'IDINVC': x.SupplierRefNo,
                'TEXTTRX': '1',
                'ORDRNBR': '',
                'PONBR': '',
                'INVCDESC': _INVCDESC,
                'INVCAPPLTO': '',
                'IDACCTSET': x.AccountSetId,
                'DATEINVC': x.InvoiceDateString,
                'FISCYR': new Date().getFullYear(),
                'FISCPER': new Date().getMonth() + 1,
                'CODECURN': x.CurrencyCode,
                'EXCHRATE': '',
                'TERMCODE': x.PaymentTermsCode,
                'DATEDUE': x.DueDateString,
                'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                'BASETAX1': (x.SubTotal - x.TotalTax).toFixed(2),
                'AMTTAX1': x.TotalTax.toFixed(2),
                'AMTTAXDIST': x.TotalTax.toFixed(2),
                'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                'AMTGROSDST': x.TotalAmount.toFixed(2),
                'AMTDUE': x.TotalAmount.toFixed(2),
                'AMTTAXTOT': x.TotalTax.toFixed(2),
                'AMTGROSTOT': x.TotalAmount.toFixed(2)
              }
            );
            sheet1detail.push(
              {
                'CNTITEM': count,
                'InvoiceId': x.InvoiceId,
                'InvoiceTypeId': x.InvoiceTypeId,
                'PurchaseOrderCode': '',
                'PoTypeId': ''
              }
            );
          }

        }


      }
      var ws1Data = ws1DataDetails;
      var cntLine = 0;
      for (let i = 0; i < sheet1detail.length; i++) {
        cntLine = 0;
        let result1 = sheet1detail[i];
        if (result1.InvoiceTypeId == 1) {
          if (result1.PoTypeId == 5 || result1.PoTypeId == 6) {
            let cpoItems = [];
            let pocode = result1.PurchaseOrderCode.toString().split('-')[0];
            this.itemList.forEach(x => {
              if (x.CPONumber != null && x.CPONumber.toString().split('-')[0] == pocode) {
                cpoItems.push(x);
              }
            });

            for (let itm = 0; itm < cpoItems.length; itm++) {

              if (cpoItems[itm].InvoiceId == previd) {
                cntLine = cntLine + 20;
              }
              else {
                cntLine = 20;
              }
              previd = cpoItems[itm].InvoiceId;
              if (cpoItems[itm].POTypeId == 5 || cpoItems[itm].POTypeId == 6) {
                accountcode = cpoItems[itm].Service.Code;
              }

              if (cpoItems[itm].TypeId == 1 && cpoItems[itm].POTypeId == PurchaseOrderType.FixedAssetPo && cpoItems[itm].ItemDescription != null) {
                accountcode = cpoItems[itm].Service.Code;
              }
              else {
                accountcode = cpoItems[itm].Item.GLCode != null ? cpoItems[itm].Item.GLCode : cpoItems[itm].Service.Code;
              }
              ws2DataDetails.push(
                {
                  'CNTBTCH': '1',
                  'CNTITEM': result1.CNTITEM,
                  'CNTLINE': cntLine,
                  'IDDIST': '',
                  'TEXTDESC': cpoItems[itm].ItemDescription,
                  'AMTTOTTAX': cpoItems[itm].CurrentTaxTotal.toFixed(2),
                  'BASETAX1': ((cpoItems[itm].Unitprice * cpoItems[itm].ItemQty) - cpoItems[itm].Discount).toFixed(2),
                  'TAXCLASS1': cpoItems[itm].TaxClass,
                  'RATETAX1': cpoItems[itm].TaxAmount.toFixed(2),
                  'AMTTAX1': cpoItems[itm].CurrentTaxTotal.toFixed(2),
                  'IDGLACCT': accountcode,
                  'AMTDIST': ((cpoItems[itm].Unitprice * cpoItems[itm].ItemQty) - cpoItems[itm].Discount).toFixed(2),
                  'COMMENT': '',
                  'SWIBT': '0',

                }
              );
              let _itemType: string = cpoItems[itm].ItemType;
              invoiceSelectedList.forEach(element => {
                if (element.JVs != null) {
                  element.JVs.map((jv) => {
                    var jvs = jv.ContractPurchaseOrderItems.filter(x => x.CPOID == cpoItems[itm].CPOID);
                    if (jv.AccruetheExpense) {
                      jvs.map((cpoitem) => {
                        if (jv.CPOJVACode != null && _itemType == cpoitem.AccountCode) {
                          cntLine = cntLine + 20;
                          ws2DataDetails.push(
                            {
                              'CNTBTCH': '1',
                              'CNTITEM': result1.CNTITEM,
                              'CNTLINE': cntLine,
                              'IDDIST': '',
                              'TEXTDESC': jv.CPOJVACode,
                              'AMTTOTTAX': 0,
                              'BASETAX1': 0,
                              'TAXCLASS1': cpoItems[itm].TaxClass,
                              'RATETAX1': cpoItems[itm].TaxAmount,
                              'AMTTAX1': 0,
                              'IDGLACCT': cpoitem.AccountCode,
                              'AMTDIST': - cpoitem.Amount.toFixed(2),
                              'COMMENT': '',
                              'SWIBT': '0'
                            })
                          cntLine = cntLine + 20;
                          ws2DataDetails.push(
                            {
                              'CNTBTCH': '1',
                              'CNTITEM': result1.CNTITEM,
                              'CNTLINE': cntLine,
                              'IDDIST': '',
                              'TEXTDESC': jv.CPOJVACode,
                              'AMTTOTTAX': 0,
                              'BASETAX1': 0,
                              'TAXCLASS1': cpoItems[itm].TaxClass,
                              'RATETAX1': cpoItems[itm].TaxAmount,
                              'AMTTAX1': 0,
                              'IDGLACCT': jv.AccountCodeName,
                              'AMTDIST': cpoitem.Amount.toFixed(2),
                              'COMMENT': '',
                              'SWIBT': '0'
                            })
                        }
                      });
                    }
                  });
                }
              });
            }
          }

          else {
            let poItems = [];
            poItems = this.itemList.filter(itm => itm.PurchaseOrderCode == result1.PurchaseOrderCode.trim() && itm.InvoiceId == result1.InvoiceId);
            for (let itm = 0; itm < poItems.length; itm++) {

              if (poItems[itm].InvoiceId == previd) {
                cntLine = cntLine + 20;
              }
              else {
                cntLine = 20;
              }
              previd = poItems[itm].InvoiceId;


              if (poItems[itm].TypeId == 1 && poItems[itm].POTypeId == PurchaseOrderType.FixedAssetPo && poItems[itm].ItemDescription != null) {
                accountcode = poItems[itm].Service.Code;
              }
              else if (poItems[itm].POTypeId == 5 || poItems[itm].POTypeId == 6) {
                accountcode = poItems[itm].Service.Code;
              }
              else {
                accountcode = poItems[itm].Item.GLCode != null ? poItems[itm].Item.GLCode : poItems[itm].Service.Code;
              }

              ws2DataDetails.push(
                {
                  'CNTBTCH': '1',
                  'CNTITEM': result1.CNTITEM,
                  'CNTLINE': cntLine,
                  'IDDIST': '',
                  'TEXTDESC': poItems[itm].ItemDescription,
                  'AMTTOTTAX': poItems[itm].CurrentTaxTotal.toFixed(2),
                  'BASETAX1': ((poItems[itm].Unitprice * poItems[itm].ItemQty) - poItems[itm].Discount).toFixed(2),
                  'TAXCLASS1': poItems[itm].TaxClass,
                  'RATETAX1': poItems[itm].TaxAmount.toFixed(2),
                  'AMTTAX1': poItems[itm].CurrentTaxTotal.toFixed(2),
                  'IDGLACCT': accountcode,
                  'AMTDIST': ((poItems[itm].Unitprice * poItems[itm].ItemQty) - poItems[itm].Discount).toFixed(2),
                  'COMMENT': '',
                  'SWIBT': '0',

                }
              );
            }
          }

        }
        else if (result1.InvoiceTypeId == 2) {
          let wpoItems = [];
          wpoItems = this.itemList.filter(itm => itm.InvoiceId == result1.InvoiceId);
          for (let itm = 0; itm < wpoItems.length; itm++) {


            if (wpoItems[itm].InvoiceId == previd) {
              cntLine = cntLine + 20;
            }
            else {
              cntLine = 20;
            }
            previd = wpoItems[itm].InvoiceId;

            if (wpoItems[itm].TypeId == 1 && wpoItems[itm].POTypeId == PurchaseOrderType.FixedAssetPo && wpoItems[itm].ItemDescription != null) {
              accountcode = wpoItems[itm].Service.Code;
            }
            else if (wpoItems[itm].TypeId == 1 && wpoItems[itm].InvoiceTypeId == 2) {

              accountcode = wpoItems[itm].Item.GLCode;
              wpoItems[itm].ItemDescription = wpoItems[itm].ItemDescription;
            }
            else {
              accountcode = wpoItems[itm].Item.GLCode != null ? wpoItems[itm].Item.GLCode : wpoItems[itm].Service.Code;
            }
            ws2DataDetails.push(
              {
                'CNTBTCH': '1',
                'CNTITEM': result1.CNTITEM,
                'CNTLINE': cntLine,
                'IDDIST': '',
                'TEXTDESC': wpoItems[itm].ItemDescription,
                'AMTTOTTAX': wpoItems[itm].CurrentTaxTotal.toFixed(2),
                'BASETAX1': ((wpoItems[itm].Unitprice * wpoItems[itm].ItemQty) - wpoItems[itm].Discount).toFixed(2),
                'TAXCLASS1': wpoItems[itm].TaxClass,
                'RATETAX1': wpoItems[itm].TaxAmount.toFixed(2),
                'AMTTAX1': wpoItems[itm].CurrentTaxTotal.toFixed(2),
                'IDGLACCT': accountcode,
                'AMTDIST': ((wpoItems[itm].Unitprice * wpoItems[itm].ItemQty) - wpoItems[itm].Discount).toFixed(2),
                'COMMENT': '',
                'SWIBT': '0',

              }
            );
          }


        }
      }


      var ws2Data = ws2DataDetails;
      var ws3Data = data.map((x) => {
        return {
          'CNTBTCH': '',
          'CNTITEM': '',
          'CNTPAYM': '',
          'DATEDUE': '',
          'AMTDUE': ''

        };
      })
      var ws4Data = data.map((x) => {
        return {
          'CNTBTCH': '',
          'CNTITEM': '',
          'OPTFIELD': '',
          'VALUE': '',
          'TYPE': '',
          'LENGTH': '',
          'DECIMALS': '',
          'ALLOWNULL': '',
          'VALIDATE': '',
          'VALINDEX': '',
          'VALIFTEXT': '',
          'VALIFMONEY': '',
          'VALIFNUM': '',
          'VALIFLONG': '',
          'VALIFBOOL': '',
          'VALIFDATE': '',
          'VALIFTIME': '',
          'FDESC': '',
          'VDESC': '',
        };
      })

      var ws5Data = data.map((x) => {
        return {
          'CNTBTCH': '',
          'CNTITEM': '',
          'CNTLINE': '',
          'OPTFIELD': '',
          'VALUE': '',
          'TYPE': '',
          'LENGTH': '',
          'DECIMALS': '',
          'ALLOWNULL': '',
          'VALIDATE': '',
          'VALINDEX': '',
          'VALIFTEXT': '',
          'VALIFMONEY': '',
          'VALIFNUM': '',
          'VALIFLONG': '',
          'VALIFBOOL': '',
          'VALIFDATE': '',
          'VALIFTIME': '',
          'FDESC': '',
          'VDESC': '',
        };
      })
      let url = "/assets/ExcelTemplates/AP Invoice.xlsx";
      let req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
      req.onload = (e) => {
        let data = new Uint8Array(req.response);
        let wb = XLSX.read(data, { type: "array" });
        const ws1: any = utils.json_to_sheet(ws1Data);
        const ws2: any = utils.json_to_sheet(ws2Data);
        const ws3: any = utils.json_to_sheet(ws3Data);
        const ws4: any = utils.json_to_sheet(ws4Data);
        const ws5: any = utils.json_to_sheet(ws5Data);
        wb.Sheets[ws1_name] = ws1;
        wb.Sheets[ws2_name] = ws2;
        wb.Sheets[ws3_name] = ws3;
        wb.Sheets[ws4_name] = ws4;
        wb.Sheets[ws5_name] = ws5;
        const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

        let date = new Date();
    
        this.FileName= "Exportinvoice_" + date.getFullYear().toString() + this.pad2(date.getMonth() + 1) + this.pad2( date.getDate()) + this.pad2( date.getHours() ) + this.pad2( date.getMinutes() ) + this.pad2( date.getSeconds());
        //this.ExcelExportFileName = "Exportinvoice_" + (new Date().getDate()) + ".xlsx";
        this.ExcelExportFileName = this.FileName + ".xlsx";

        saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), this.ExcelExportFileName);
        this.supplierInvoiceService.BulkExportUpdateLog(this.selectedInvoice, userDetails.UserID, this.companyId).subscribe((x: boolean) => {

        });
        this.getInvoices(0);
        invoiceSelectedList = [];
        this.itemList = [];
        this.selectedInvoice = [];
      };
      req.send();
      function s2ab(s) {
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
