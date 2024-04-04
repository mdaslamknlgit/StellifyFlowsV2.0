import { Component, OnInit } from '@angular/core';
import { ContractPurchaseOrderService } from '../../services/contract-purchase-order.service';
import { ContractPurchaseOrder, ContractPoDisplayResult, ContractPurchaseOrderItems, ContractPurchaseOrderGL } from '../../models/contract-purchase-order.model';
import { PagerConfig, Messages, MessageTypes, WorkFlowStatus, JVACode } from '../../../shared/models/shared.model';
import { SortEvent, LazyLoadEvent } from 'primeng/primeng';
import { ContractMasterService } from '../../services/contract-master.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { FormBuilder } from '@angular/forms';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { ActivatedRoute } from '@angular/router';
import { WorkBook, utils, write } from 'xlsx';
import { multicast } from '../../../../../node_modules/rxjs/operators';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-accrual-management',
  templateUrl: './accrual-management.component.html',
  styleUrls: ['./accrual-management.component.css'],
  providers: [ContractPurchaseOrderService]
})
export class AccrualManagementComponent implements OnInit {
  rightSection: boolean = false;
  gridColumns: Array<{ field: string, header: string, width: string }> = [];
  purchaseOrdersList: Array<ContractPurchaseOrder> = [];
  selectedPOC: Array<ContractPurchaseOrder> = [];
  purchaseOrderPagerConfig: PagerConfig;
  searchKey: string = "";
  showFilterPopUp: boolean = false;
  isFilterApplied: boolean = false;
  filterMessage: string = "";
  rightsection: boolean = false;
  showPopUp: boolean = false;
  ButtonTitle: string;
  requestType: string = "";
  companyId: any;
  isMaster: any;
  ItemList: Array<ContractPurchaseOrderItems> = [];
  ItemList2: Array<ContractPurchaseOrderGL> = [];
  JVACode: Array<JVACode> = [];
  AccrualType: string;
  exportPermission: boolean;
  public screenWidth: any;
  ModuleHeading: string;
  ExcelExportFileName: string;

  constructor(private contractMasterObj: ContractPurchaseOrderService,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService,
    private formBuilderObj: FormBuilder,
    private reqDateFormatPipe: RequestDateFormatPipe,
    public activatedRoute: ActivatedRoute) {

    this.gridColumns = [
      { field: 'Sno', header: 'S.no.', width: "10%" },
      { field: 'CPONumber', header: 'POC Number', width: "20%" },
      { field: 'ContractName', header: 'Contract Name', width: "20%" },
      { field: 'SupplirName', header: 'Supplier Name', width: "20%" },
      { field: 'TotalAmount', header: 'Total Amount', width: "20%" }

    ];
    this.purchaseOrderPagerConfig = new PagerConfig();
    this.purchaseOrderPagerConfig.RecordsToSkip = 0;
    this.purchaseOrderPagerConfig.RecordsToFetch = 15;
    this.purchaseOrderPagerConfig.SortingExpr = "CreatedDate",
      this.purchaseOrderPagerConfig.SortingOrder = "1";

  }


  ngOnInit() {
    // let roleAccessLevels = this.sessionService.getRolesAccess();
    // if (roleAccessLevels != null && roleAccessLevels.length > 0) {
    //     let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "accrualmanagement")[0];

    //     this.exportPermission=formRole.IsExport

    // }
    // else {

    //     this.exportPermission=true;
    // }

    this.activatedRoute.paramMap.subscribe((data) => {
      let type = this.activatedRoute.snapshot.queryParamMap.get('type');
      this.AccrualType = this.activatedRoute.snapshot.params.type;
      this.onParamChange();
      //this.selectAccurePOC = new AccureContractPurchaseOrder();
    });

    this.getJVACode();
    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-150;
      }
  }
  onParamChange() {
    this.requestType = this.activatedRoute.snapshot.params.type;
    if (this.requestType == 'export') {
      let roleAccessLevels = this.sessionService.getRolesAccess();
      if (roleAccessLevels != null && roleAccessLevels.length > 0) {
        let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "accrualmanagement")[0];
        this.exportPermission = formRole.IsExport;
      }
      else {
        this.exportPermission = true;
      }
      this.ModuleHeading = "Accrual Management";
      this.ButtonTitle = "Accrual GL export";
      this.getPurchaseOrders(0);
    }
    else {
      let roleAccessLevels = this.sessionService.getRolesAccess();
      if (roleAccessLevels != null && roleAccessLevels.length > 0) {
        let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "accrualreverse")[0];
        this.exportPermission = formRole.IsExport;
      }
      else {
        this.exportPermission = true;
      }
      this.ModuleHeading = "Accrual Reverse";
      this.ButtonTitle = "Accrual Reverse";
      this.getPurchaseOrderReverse(0);
    }


  }
  onLazyLoad(event: LazyLoadEvent) {
    this.purchaseOrderPagerConfig.RecordsToSkip = event.first;
    this.purchaseOrderPagerConfig.SortingExpr = event.sortField;
    this.purchaseOrderPagerConfig.SortingOrder = event.sortOrder.toString();

    if (this.requestType == 'export') {
      this.getPurchaseOrders(0);
    }
    else {

      this.getPurchaseOrderReverse(0);
    }


  }


  getPurchaseOrders(purchaseOrderIdToBeSelected: number) {
    let purchaseOrderDisplayInput = {
      Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
      Take: this.purchaseOrderPagerConfig.RecordsToFetch,
      CompanyId: this.sessionService.getCompanyId(),
      IsMasterPo: false
    };

    this.contractMasterObj.getCPOAccuralManagement(purchaseOrderDisplayInput)
      .subscribe((data: ContractPoDisplayResult) => {
        this.purchaseOrdersList = data.PurchaseOrders;
        this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
      }, (error) => {

      });


  }
  getPurchaseOrderReverse(purchaseOrderIdToBeSelected: number) {

    let purchaseOrderDisplayInput = {
      Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
      Take: this.purchaseOrderPagerConfig.RecordsToFetch,
      CompanyId: this.sessionService.getCompanyId(),
      IsMasterPo: false
    };

    this.contractMasterObj.getCPOAccuralReverse(purchaseOrderDisplayInput)
      .subscribe((data: ContractPoDisplayResult) => {
        this.purchaseOrdersList = data.PurchaseOrders;

        this.purchaseOrderPagerConfig.TotalRecords = this.purchaseOrdersList.length;
      }, (error) => {

      });
  }
  customSort(sortEvent: SortEvent) {
    this.purchaseOrderPagerConfig.SortingExpr = sortEvent.field;
    this.purchaseOrderPagerConfig.SortingOrder = sortEvent.order.toString();

    if (this.searchKey == null || this.searchKey == "") {
      if (this.requestType == 'export') {

        this.getPurchaseOrders(0);

      }
      else {

        this.getPurchaseOrderReverse(0);
      }
    }
    else {
      if (this.requestType == 'export') {

        this.getPurchaseOrders(0);
      }
      else {

        this.getPurchaseOrderReverse(0);
      }
    }
  }

  showLeftCol(event) {
    $(".leftdiv").removeClass("hideleftcol");
    $(".rightPanel").removeClass("showrightcol");
  }
  getJVACode() {
    this.sharedServiceObj.GetJVACode().subscribe((data: any) => {

      this.JVACode = data;

    });
  }
  exportAccrualGL() {
    let CPOList: Array<ContractPurchaseOrder> = [];
    this.getJVACode();
    this.contractMasterObj.exportAccrualGL(this.selectedPOC).subscribe((data: Array<ContractPurchaseOrder>) => {
      CPOList = data;
      console.log(CPOList);
      data.forEach((x) => {
        let CCount = 0;
        let LCou = 10;
        x.ContractPurchaseOrderItems.forEach((y) => {
          CCount = CCount + 1;
          LCou = LCou * 2;
          let xy: ContractPurchaseOrderGL = new ContractPurchaseOrderGL();
          xy.Amount = y.Amount;
          xy.AccountCode = y.AccountCode;
          xy.CPONumber = y.CPONumber;
          xy.count = CCount;
          xy.lCount = LCou;
          xy.RateType = y.RateType;
          xy.Description = y.Description;
          xy.CurrencyCode = x.CurrencyCode;
          xy.Supplier = x.Supplier;
          xy.ServiceName = x.ServiceName;
          this.ItemList2.push(xy);
          let Xy1: ContractPurchaseOrderGL = new ContractPurchaseOrderGL();
          Xy1.Amount = 0 - xy.Amount;
          Xy1.AccountCode = x.AccountCodeName;
          Xy1.CPONumber = y.CPONumber;
          Xy1.count = CCount;
          Xy1.lCount = LCou;
          Xy1.Description = y.Description;
          Xy1.RateType = y.RateType;
          Xy1.CurrencyCode = x.CurrencyCode;
          Xy1.Supplier = x.Supplier;
          Xy1.ServiceName = x.ServiceName;
          this.ItemList2.push(Xy1);
        });
      })

      const ws1_name = 'Journal_Headers';
      const ws2_name = 'Journal_Details';
      const ws3_name = 'Journal_Detail_Optional_Fields';

      var count = 0;
      let sCount: number = this.JVACode[0].JVANumber;
      let jCount: number = this.JVACode[0].JVANumber;
      let sString: string = "";
      let JVA: string = "";
      let ItemCount: number = 10;
      let Comany: string = "";
      let shortname: string = "";
      let srvc: string = "";
      let amountval;
      let accountcodeval;

      let lineCount = 1;
      var wsList1Data = data.map(x => {
        count = count + 1;

        sString = sCount >= 10 ? sCount.toString() : "0" + sCount;
        shortname = x.Supplier.SupplierShortName;
        shortname = shortname == null ? '' : shortname += '/';
        JVA = "JVA" + (sString) + '/' + (new Date().getFullYear().toString().substring(2)) + "/" + x.CPONumber + "/" + ((this.reqDateFormatPipe.transformAccrual(new Date()).toString()).split(" ")[0]) + '/' + shortname + x.ServiceName;
        Comany = x.CompanyName;
        srvc = x.ServiceName;
        sCount = sCount + 1;
        return {

          'BATCHID': 1,
          'BTCHENTRY': count,
          'SRCELEDGER': 'GL',
          'SRCETYPE': 'JV',
          'FSCSYR': (new Date().getFullYear()),
          'FSCSPERD': (new Date().getMonth() + 1),
          'JRNLDESC': JVA,
          'JRNLDR': x.TotalAmount.toFixed(2),
          'JRNLCR': x.TotalAmount.toFixed(2),
          'DATEENTRY': new Date(),

        }
      });

      let pCPO: string = "";
      var wsList2Data = this.ItemList2.map(y => {
        shortname = y.Supplier.SupplierShortName;
        shortname = shortname == null ? '' : shortname += '/';
        srvc = y.ServiceName;
        if (pCPO == "") {
          pCPO = y.CPONumber;
          ItemCount = 10 * 2;
          lineCount = lineCount;

        }
        else if (pCPO != y.CPONumber) {
          ItemCount = 10 * 2;
          pCPO = y.CPONumber;
          lineCount = lineCount + 1;
          jCount = jCount + 1;

        }
        else if (pCPO == y.CPONumber) {
          pCPO = y.CPONumber;
          lineCount = lineCount;
          ItemCount = ItemCount * 2;

        }
        else {
          pCPO = y.CPONumber;
          ItemCount = ItemCount * 2
          lineCount = lineCount;

        }
        let jString: string = jCount > 10 ? jCount.toString() : "0" + jCount;
        let jvaItem = "JVA" + (jString) + '/' + (new Date().getFullYear().toString().substring(2)) + "/" + y.CPONumber + "/" + ((this.reqDateFormatPipe.transformAccrual(new Date()).toString()).split(" ")[0]) + '/' + shortname + srvc;
        let tempJvaItem = jvaItem.split('/').join('~');
        this.contractMasterObj.updateCPOJVACode(y.CPONumber, tempJvaItem).subscribe((x: any) => {

        });

        if (this.AccrualType == "reverse") {
          if (y.Amount > 0) {
            let signval = -1;
            amountval = signval * y.Amount;
          }
          else {
            let signval = Math.sign(y.Amount);
            amountval = signval * y.Amount;
          }
          return {
            'BATCHNBR': 1,
            'JOURNALID': lineCount,
            'TRANSNBR': ItemCount,
            'AccountId': y.AccountCode,
            'TRANSAMT': amountval.toFixed(2),
            'SCURNAMT': amountval.toFixed(2),
            'HCURNCODE': y.CurrencyCode,
            'RATETYPE': y.RateType,
            'SCURNCODE': y.CurrencyCode,
            'RATEDATE': new Date(),
            'CONVRATE': 1,
            'TRANSDESC': y.Description,
            'TRANSDATE': new Date(),
            'TRANSREF': jvaItem,
            'COMMENT': '',

          };
        }
        else {
          return {
            'BATCHNBR': 1,
            'JOURNALID': lineCount,
            'TRANSNBR': ItemCount,
            'AccountId': y.AccountCode,
            'TRANSAMT': y.Amount.toFixed(2),
            'SCURNAMT': y.Amount.toFixed(2),
            'HCURNCODE': y.CurrencyCode,
            'RATETYPE': y.RateType,
            'SCURNCODE': y.CurrencyCode,
            'RATEDATE': new Date(),
            'CONVRATE': 1,
            'TRANSDESC': y.Description,
            'TRANSDATE': new Date(),
            'TRANSREF': jvaItem,
            'COMMENT': '',

          };

        }
      });
      var wsList3Data = this.selectedPOC.map((x) => {
        return {
          'BATCHNBR': '',
          'JOURNALID': '',
          'TRANSNBR': '',
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
      });


      if (this.requestType == 'export') {
        this.ExcelExportFileName = "Accrual-GLExport" + new Date() + ".xlsx";
      }
      else {
        this.ExcelExportFileName = "Accrual-Reverse" + new Date() + ".xlsx";
      }
      let url = "/assets/ExcelTemplates/Accrual.xls";
      let req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
      req.onload = (e) => {
        let data = new Uint8Array(req.response);
        let wb = XLSX.read(data, { type: "array" });
        const ws1: any = utils.json_to_sheet(wsList1Data);
        const ws2: any = utils.json_to_sheet(wsList2Data);
        const ws3: any = utils.json_to_sheet(wsList3Data);
        wb.Sheets[ws1_name] = ws1;
        wb.Sheets[ws2_name] = ws2;
        wb.Sheets[ws3_name] = ws3;
        const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
        saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), this.ExcelExportFileName);
        this.sharedServiceObj.SetJVACode(sCount).subscribe(() => {

        });

        let _status = this.requestType == 'export' ? WorkFlowStatus.Accrued : WorkFlowStatus.Approved;
        this.contractMasterObj.ChangePOCStatus(this.selectedPOC, _status).subscribe(() => {
          if (this.requestType == 'export')
            this.getPurchaseOrders(0);
          else
            this.getPurchaseOrderReverse(0);
          this.ItemList2 = [];
          CPOList = [];
          this.selectedPOC = [];
        });        
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





