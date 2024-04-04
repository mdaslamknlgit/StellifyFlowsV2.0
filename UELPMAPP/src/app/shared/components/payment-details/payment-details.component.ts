import { Component, Input, OnInit } from '@angular/core';
import { PaymentService } from '../../../po/services/payment.service';
import { InvoicePayments, Payment } from '../../../po/models/Payment.model';
import { PaymentDetailsColumns } from '../../../po/models/project-payment-history.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  payments: Payment[] = [];
  @Input() ProcessId: number;
  @Input() DocumentId: number;
  @Input() CompanyId: number;
  @Input() CurrencySymbol: string;
  @Input() changing: Subject<number>;
  totalPaid: number = 0;
  totalOS: number = 0;

  PaymentColumns: Array<{ field: string, header: string }> = [];
  constructor(private paymentService: PaymentService) { }

  ngOnInit() {
    this.GetPaygetPaymentDetails(this.DocumentId, this.CompanyId);
    this.changing.subscribe((invoiceId: number) => {
      this.payments = [];
      if (invoiceId > 0) {
        this.GetPaygetPaymentDetails(invoiceId, this.CompanyId);
      }
    });
  }
  GetPaygetPaymentDetails(documentId, companyId) {
    this.PaymentColumns = PaymentDetailsColumns.filter(item => item);
    this.payments = [];
    if (documentId > 0 && companyId > 0) {
      this.paymentService.getPaymentDetails(documentId, companyId, this.ProcessId).subscribe((data: InvoicePayments) => {
        if (data != null) {
          this.payments = data.Payments;
          this.totalOS = data.OutStandingTotal;
          this.totalPaid = data.PaidTotal;
          this.CurrencySymbol = data.Currency;
        }
      });
    }
  }
}
