import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getContractDuration(startDate: Date, endDate: Date): string {
    let contractTerms: string = "";
    var _startDate = moment(startDate, 'DD-MM-YYYY');
    var _endDate = moment(endDate, 'DD-MM-YYYY');

    var result = _endDate.diff(_startDate, 'months');
    let days = _endDate.diff(_startDate, 'days');
    var months = (result) + 1;
    if (months > 0) {
      contractTerms += months + (months == 1 ? " Month " : " Months ") + "(" + days + " days" + ")";
    }
    return contractTerms;
  }

  getSupplierCode(supplierCode: string, subCode: string): string {
    supplierCode = supplierCode.substring(0, supplierCode.length - 2);
    supplierCode = supplierCode + subCode;
    return supplierCode;
  }
}
