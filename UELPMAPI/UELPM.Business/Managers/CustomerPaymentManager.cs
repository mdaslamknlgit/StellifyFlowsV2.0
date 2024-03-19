using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class CustomerPaymentManager : ICustomerPaymentManager
    {
        private readonly CustomerPaymentRepository m_customerPaymentRepository;

        public CustomerPaymentManager(CustomerPaymentRepository customerPaymentRepository)
        {
            m_customerPaymentRepository = customerPaymentRepository;
        }

        public CustomerPaymentDisplayResult GetCustomerPayments(GridDisplayInput customerPaymentInput)
        {
            return m_customerPaymentRepository.GetCustomerPayments(customerPaymentInput);
        }    

        public CustomerPayment GetCustomerPaymentDetails(int customerPaymentId)
        {
            return m_customerPaymentRepository.GetCustomerPaymentDetails(customerPaymentId);
        }

        public CustomerPayment GetCustomerPaymentDeatilsForEdit(int customerPaymentId, int customerId)
        {
            return m_customerPaymentRepository.GetCustomerPaymentDeatilsForEdit(customerPaymentId, customerId);
        }

        public CustomerPayment GetInvoiceDetailsByCustomer(int customerId)
        {
            return m_customerPaymentRepository.GetInvoiceDetailsByCustomer(customerId);
        }

        public CustomerPaymentDisplayResult GetAllSearchCustomerPayments(CustomerPaymentSearch customerPaymentSearch)
        {
            return m_customerPaymentRepository.GetAllSearchCustomerPayments(customerPaymentSearch);
        }

        public int CreateCustomerPayment(CustomerPayment customerPayment)
        {
            return m_customerPaymentRepository.CreateCustomerPayment(customerPayment);
        }

        public int UpdateCustomerPayment(CustomerPayment customerPayment)
        {
            return m_customerPaymentRepository.UpdateCustomerPayment(customerPayment);
        }

        public bool DeleteCustomerPayment(CustomerPaymentDelete customerPaymentDelete)
        {
            return m_customerPaymentRepository.DeleteCustomerPayment(customerPaymentDelete);
        }

        public byte[] PaymentVoucherPrint(int customerPaymentId, int companyId)
        {
            return m_customerPaymentRepository.PaymentVoucherPrint(customerPaymentId, companyId);
        }      
    }
}
