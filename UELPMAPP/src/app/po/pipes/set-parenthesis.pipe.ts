import { CurrencyPipe, formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'setParenthesis'
})
export class SetParenthesisPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value != null) {
      return value.toString().charAt(0) === '-' ?
        value.toString().substring(1, value.toString().length) :
        '(' + value.toString().substring(0, value.toString().length) + ')';
    }
    else
      return value;
  }
}
