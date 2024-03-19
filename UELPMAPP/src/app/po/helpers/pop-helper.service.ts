import { Injectable } from '@angular/core';
import { PTableColumn } from '../models/project-payment-history.model';

@Injectable({
  providedIn: 'root'
})
export class POPHelperService {

  constructor() { }

  getPaymentDescriptions(): string[] {
    // return ['Total Value of work done', 'Retention sum (calculated)',
    //   'Retention sum (previously released)', 'Retention Sum (Bal bef current release)',
    //   'Retention sum (release in the month)', 'Net Retention',
    //   'Contract Sum previously certified to date', 'Amount due under this certificate',
    //   'GST (% and type - based on Computation Method)', 'GST Adjustment', 'Grand Total'];
      return ['Total Value of work done', 'Retention sum',
      'Retention Released', 'Net Retention', 'Amount Paid',
      'Tax', 'Tax Adjustment', 'Total'];
  }
}
