using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ICustomerPaymentRepository
    {
        CustomerPaymentDisplayResult GetCustomerPayments(GridDisplayInput customerPaymentInput);      
        CustomerPayment GetCustomerPaymentDetails(int customerPaymentId);
        CustomerPayment GetInvoiceDetailsByCustomer(int customerId);
        CustomerPayment GetCustomerPaymentDeatilsForEdit(int customerPaymentId, int customerId);
        CustomerPaymentDisplayResult GetAllSearchCustomerPayments(CustomerPaymentSearch customerPaymentSearch);
        int CreateCustomerPayment(CustomerPayment customerPayment);
        int UpdateCustomerPayment(CustomerPayment customerPayment);
        bool DeleteCustomerPayment(CustomerPaymentDelete customerPaymentDelete);
        byte[] PaymentVoucherPrint(int customerPaymentId, int companyId);
    }
}
