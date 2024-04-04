import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AuditLogData } from '../../../administration/models/audit-log'
import { AuditLogAPIService } from '../../../administration/services/audit-log-api.service';
import { AuditLogFilter } from '../../../po/models/po-creation.model';
import { PurchaseOrderType } from '../../models/shared.model';

@Component({
  selector: 'app-auditlog',
  templateUrl: './auditlog.component.html',
  styleUrls: ['./auditlog.component.css']
})
export class AuditlogComponent implements OnInit {
  scrollbarOptions: any;
  auditlogFilterData: AuditLogFilter = new AuditLogFilter();
  @Input() DocType: string = '';
  @Input() DocumentId: number = 0;
  @Input() DocumentNumber: number = 0;
  @Input() PageName: string = '';
  @Input() CompanyId: number = 0;
  @Input() showLogPopUp: boolean = false;
  @Output() hideLogPopUp: EventEmitter<boolean> = new EventEmitter<boolean>();
  gridColumns: Array<{ field: string, header: string }> = [];
  auditLogs: AuditLogData[] = [];

  constructor(private auditLogAPIService: AuditLogAPIService) { }

  ngOnInit() {
    debugger
    this.auditlogFilterData.DocumentId = this.DocumentId;
    switch (this.DocType) {
      case 'PO':
        if (this.PageName == PurchaseOrderType.InventoryPo.toString()) {
          this.PageName = 'InventoryPo';
        }
        if (this.PageName == PurchaseOrderType.FixedAssetPo.toString()) {
          this.PageName = 'FixedAssetPo';
        }
        if (this.PageName == PurchaseOrderType.ExpensePo.toString()) {
          this.PageName = 'ExpensePo';
        }
        if (this.PageName == PurchaseOrderType.ProjectPo.toString()) {
          this.PageName = 'ProjectPo';
        }
        if (this.PageName == PurchaseOrderType.ContractPoFixed.toString()) {
          this.PageName = 'ContractPoFixed';
          this.DocType = 'Contract PO';
        }
        if (this.PageName == PurchaseOrderType.ContractPoVariable.toString()) {
          this.PageName = 'ContractPoVariable';
          this.DocType = 'Contract PO';
        }
        break;
      case 'PPC':
        this.DocType = 'Project Invoice';
        break;
      case 'PVO':
        this.DocType = 'Project Variation Order';
        break;
    }
    this.auditlogFilterData.PageName = this.PageName;
    this.auditlogFilterData.CompanyId = this.CompanyId;
    this.getAuditLogs(this.auditlogFilterData);
  }
  HidePopUp() {
    this.showLogPopUp = false;
  }
  onPopUpHide() {
    this.hideLogPopUp.emit(true);
  }
  getAuditLogs(auditlogFilterData): void {
    this.auditLogAPIService.GetAuditLogsByDocumentId(auditlogFilterData).subscribe((data: any) => {
      if (data != null) {
        this.auditLogs = data;
      }
    });
  }
}
