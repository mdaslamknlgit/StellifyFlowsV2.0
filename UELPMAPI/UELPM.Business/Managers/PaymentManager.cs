using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class PaymentManager : IPaymentManager
    {
        private readonly IPaymentRepository m_paymentRepository;

        public PaymentManager(IPaymentRepository paymentRepository)
        {
            m_paymentRepository = paymentRepository;
        }

        public InvoicePayments GetPaymentDetails(int InvoiceId, int companyId,int ProcessId)
        {
            return m_paymentRepository.GetPaymentDetails(InvoiceId, companyId, ProcessId);
        }

        public bool SavePayments(int userId, List<Payment> payments)
        {
            return m_paymentRepository.SavePayments(userId, payments);
        }

        public List<Payment> UploadPayments(string filePath)
        {
            return m_paymentRepository.UploadPayments(filePath);
        }
    }
}
