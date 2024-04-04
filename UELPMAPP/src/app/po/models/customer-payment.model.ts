import { PaymentType, Suppliers } from "../../shared/models/shared.model";
import { Customer } from "../../administration/models/customer";

export class CustomerPayment
{
  CustomerPaymentId:number;
  CustomerPaymentCode:string;
  CustomerId:number;
  PaymentTypeId:number;
  CustomerEmail:string;
  ChequeNumber:string;
  ChequeDate:Date;
  CreditCardNo:number;
  ExpiryMonth:number;
  ExpiryYear:number;
  Remarks:string;
  CreatedBy :number;
  CreatedDate :Date;
  TotalAmountPaid:number;
  PaymentType:PaymentType;
  Customer:Array<Customer>;
  TotalOutstanding:number;
  CustomerInvoiceDetails:Array<CustomerInvoiceDetails>;
  CustomerInvoiceTotal:Array< CustomerInvoiceTotal>;
  CompanyId:number;
  Name:string;
}

export class CustomerInvoiceDetails
{
  CustomerInvoicePaymentId:number;
  SalesInvoiceId:number;
  InvoiceNo:string;
  TicketNo: string;
  InvoiceDate:Date;
  InvoiceAmount:number;
  OutstandingAmount:number;
  PaymentAmount:number;
  LastPayment:number;
  IsChanged?:boolean;
}

export class CustomerPaymentDisplayResult
{
    CustomerPayment: Array<CustomerPaymentList> ;
    TotalRecords:number;
}

export class CustomerPaymentList
{
    CustomerPaymentId :number;
    CustomerId:number;
    CustomerPaymentCode:string
    CustomerName :string;
    SalesInvoiceCode:string;
}

export class CustomerInvoiceTotal
{
    Total:number;
    SalesInvoiceId:number;
}