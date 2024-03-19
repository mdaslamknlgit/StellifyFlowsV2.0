import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'setSupplierCode'
})
export class SetSupplierCodePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value != null) {
      var code = value.split('-');
      code.pop();
      return code.join('-');
    }
    else
      return value;
  }

}
