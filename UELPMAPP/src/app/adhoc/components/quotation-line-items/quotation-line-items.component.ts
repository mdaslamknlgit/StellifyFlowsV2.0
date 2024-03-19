import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PTableColumn, WorkFlowProcess } from './../../../shared/models/shared.model';
import { QuotationDetailsColumns } from '../../models/grid-columns';
import { AccountCodeAPIService } from './../../../po/services/account-code-api.service';
import { AccountCode, AccountCodeMaster, AccountType } from './../../../po/models/account-code.model';
import { SharedService } from './../../../shared/services/shared.service';
import { MeasurementUnit } from './../../../inventory/models/uom.model';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { TaxType } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { LineItem } from '../../models/sales-quotation.model';
import { markAllAsTouched } from './../../../shared/shared';
@Component({
  selector: 'app-quotation-line-items',
  templateUrl: './quotation-line-items.component.html',
  styleUrls: ['./quotation-line-items.component.css']
})
export class QuotationLineItemsComponent implements OnInit {
  options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
  form: FormGroup;
  taxTypes: TaxType[] = [];
  accountCodeCategories: AccountCode[] = [];
  showGlCodeDialog: boolean = false;
  accountTypes: AccountType[] = [];
  AccountCodeInfoForm: FormGroup;
  accountCodes: any[] = [];
  QuotationDetailsColumns: PTableColumn[] = [];
  headerText: string = '';
  @Input() companyId: number;
  @Input() IsViewMode: boolean = false;
  @Input() IsReverify: boolean = false;
  @Input() defaultTaxType: any;
  @Input() ProcessId: any;
  @Output() totalChange = new EventEmitter<{ SumTotalBefDiscount: string, SumDiscount: string, SumTotalBefTax: string, SumTaxAmount: string, SumTotal: string }>();
  measurementUnits: MeasurementUnit[];
  constructor(private fb: FormBuilder,
    private accountCodeAPIService: AccountCodeAPIService,
    private AdhocMasterService: AdhocMasterService,
    private sharedService: SharedService) {
    this.QuotationDetailsColumns = QuotationDetailsColumns.filter(item => item);
  }
  ngOnInit() {
    this.getMeasurementUnits();
    this.form = this.fb.group({
      LineItems: this.fb.array([])
    });
    this.AccountCodeInfoForm = this.fb.group({
      AccountTypeId: [0, [Validators.required]],
      SubCategoryId: [0, [Validators.required]],
      AccountCodeId: [0, [Validators.required]],
      RowIndex: [0]
    });
    this.getAccountTypes();
    this.headerText = this.ProcessId == WorkFlowProcess.SalesQuotation ? "Quotation" : WorkFlowProcess.SalesQuotation ? "Invoice" : "";
  }
  get fAQuotations() {
    return this.form.get('LineItems') as FormArray;
  }
  addGridRow(data?: LineItem) {
    this.fAQuotations.push(this.initQuotationLineItems(data));
  }
  deleteRow(index) {
    this.fAQuotations.removeAt(index);
    this.calculateLineItem();
  }
  displayAccountCodePopUp(row, Index: number) {
    this.AccountCodeInfoForm.reset();
    this.AccountCodeInfoForm.patchValue({
      'RowIndex': Index,
      'AccountTypeId': row.get('AccountTypeId').value,
      'SubCategoryId': row.get('SubCategoryId').value,
      'AccountCodeId': row.get('AccountCodeId').value
    });
    this.showGlCodeDialog = true;
    this.GetASubCatByAccountType();
    this.GetAccountCodesBySubCat();
  }
  initQuotationLineItems(data: LineItem) {
    if (data == null) {
      let taxTypeId;
      if (this.defaultTaxType == '') {
        taxTypeId = this.fAQuotations.controls[0].get('TaxTypeId').value;
      }
      else {
        taxTypeId = this.defaultTaxType.TaxTypeId;
      }
      let selectedtt = this.taxTypes.find(x => x.TaxTypeId == taxTypeId).TaxTypeId;
      data = {
        LineItemId: 0,
        DocumentId: 0,
        AccountTypeId: null,
        SubCategoryId: null,
        AccountCodeId: null,
        Code: '',
        Description: '',
        Qty: 0,
        UOMId: 1,
        UOM: '',
        UnitPrice: 0,
        TotalBeforeDiscount: 0,
        Discount: 0,
        TotalBeforeTax: 0,
        TaxTypeId: selectedtt,
        TaxType: '',
        TaxPercentage: 0,
        TaxAmount: 0,
        TotalAfterTax: 0
      }
    }
    return this.fb.group({
      LineItemId: [data.LineItemId],
      AccountTypeId: [data.AccountTypeId, [Validators.required]],
      SubCategoryId: [data.SubCategoryId, [Validators.required]],
      AccountCodeId: [data.AccountCodeId, [Validators.required]],
      Code: [data.Code, [Validators.required]],
      Description: [data.Description, [Validators.required]],
      Qty: [data.Qty, [Validators.required, Validators.min(0.0001)]],
      UOMId: [data.UOMId, [Validators.required]],
      UOM: [data.UOM],
      TaxType: [data.TaxType],
      UnitPrice: [data.UnitPrice, [Validators.required, Validators.min(0.0001)]],
      TotalBeforeDiscount: [data.TotalBeforeDiscount, [Validators.required]],
      Discount: [data.Discount, [Validators.required]],
      TotalBeforeTax: [data.TotalBeforeTax, [Validators.required]],
      TaxTypeId: [data.TaxTypeId, [Validators.required]],
      TaxAmount: [data.TaxAmount, [Validators.required]],
      TotalAfterTax: [data.TotalAfterTax, [Validators.required]],
      Action: ['']
    });
  }
  getAccountTypes(): void {
    this.accountCodeAPIService.getAccountTypes(this.companyId).subscribe((data: AccountType[]) => {
      this.accountTypes = data;
      this.accountCodes = [];
      this.accountCodeCategories = [];
    });
  }
  GetASubCatByAccountType(): void {
    this.accountCodeCategories.length = 0;
    let accountCodesDisplayInput = {
      AccountTypeId: this.AccountCodeInfoForm.get('AccountTypeId').value,
      CompanyId: this.companyId,
      SearchKey: ''
    };
    this.accountCodeAPIService.getAllSearchSubCategory(accountCodesDisplayInput).subscribe((data: AccountCode[]) => {
      this.accountCodeCategories = data;
    });
  }
  GetAccountCodesBySubCat() {
    let accountCodesDisplayInput = {
      companyId: this.companyId,
      categoryId: this.AccountCodeInfoForm.get('SubCategoryId').value,
      accountTypeId: this.AccountCodeInfoForm.get('AccountTypeId').value
    };
    this.sharedService.getAccountCodesbySubcat(accountCodesDisplayInput).subscribe((data: AccountCodeMaster[]) => {
      this.accountCodes = data;
    });
  }
  OKAccountcode() {
    let rowindex = this.AccountCodeInfoForm.get('RowIndex').value;
    let accounttype = this.AccountCodeInfoForm.get('AccountTypeId').value;
    let subcategory = this.AccountCodeInfoForm.get('SubCategoryId').value;
    let Itemmaster = this.AccountCodeInfoForm.get('AccountCodeId').value;
    let accountCode = this.accountCodes.filter(x => x.AccountCodeId == Itemmaster)[0];
    if (this.AccountCodeInfoForm.valid) {
      this.fAQuotations.controls[rowindex].patchValue({
        AccountTypeId: accounttype,
        SubCategoryId: subcategory,
        AccountCodeId: Itemmaster,
        Code: accountCode.Description + ' ' + accountCode.Code
      });
      this.AccountCodeInfoForm.reset();
      this.showGlCodeDialog = false;
    }
    else {
      markAllAsTouched(this.AccountCodeInfoForm);
    }
  }
  getMeasurementUnits() {
    this.sharedService.getUOMList().subscribe((data: MeasurementUnit[]) => {
      this.measurementUnits = data;
    });
  }
  GetTaxTypes(taxGroupId?: number) {
    this.AdhocMasterService.GetTaxTypesByTaxGroupId(this.companyId, taxGroupId).subscribe((data: TaxType[]) => {
      this.taxTypes = data;
    });
  }
  calculateLineItem() {
    let sumTotalBefDiscount: number = 0;
    let sumDiscount: number = 0;
    let sumTotalBefTax: number = 0;
    let sumTax: number = 0;
    let sumTotal: number = 0;
    this.fAQuotations.controls.forEach((e, i) => {
      let qty: number = e.get('Qty').value;
      let unitPrice: number = e.get('UnitPrice').value;
      let totalBefDiscount: number = 0;
      let discount: number = e.get('Discount').value;
      let totalBefTax: number = 0;
      let taxPercentage = this.taxTypes.find(x => x.TaxTypeId == e.get('TaxTypeId').value).TaxPercentage;
      let taxAmount: number = 0;
      let totalAfterTax: number = 0;
      totalBefDiscount = qty * unitPrice;
      totalBefTax = totalBefDiscount - discount;
      taxAmount = (totalBefTax * taxPercentage) / 100;
      totalAfterTax = totalBefTax + taxAmount;
      e.get('TotalBeforeDiscount').setValue(totalBefDiscount);
      e.get('TotalBeforeTax').setValue(totalBefTax);
      e.get('TaxAmount').setValue(taxAmount);
      e.get('TotalAfterTax').setValue(totalAfterTax);
      sumTotalBefDiscount = sumTotalBefDiscount + totalBefDiscount;
      sumDiscount = sumDiscount + discount;
      sumTotalBefTax = sumTotalBefTax + totalBefTax;
      sumTax = sumTax + taxAmount;
      sumTotal = sumTotal + totalAfterTax;
    });
    this.totalChange.emit({
      SumTotalBefDiscount: sumTotalBefDiscount.toFixed(2),
      SumDiscount: sumDiscount.toFixed(2),
      SumTotalBefTax: sumTotalBefTax.toFixed(2),
      SumTaxAmount: sumTax.toFixed(2),
      SumTotal: sumTotal.toFixed(2)
    });
  }
  markLinesTouched() {
    markAllAsTouched(this.form);
  }
}
