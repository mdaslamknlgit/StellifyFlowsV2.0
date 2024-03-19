import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'negativeInParenthesis'
})
export class NegativeInParenthesisPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    if (value != null) {
      return value.toString().charAt(0) === '-' ? '(' + value.toString().substring(1, value.toString().length) + ')' : value;
    }
    else
      return value;
  }

}
