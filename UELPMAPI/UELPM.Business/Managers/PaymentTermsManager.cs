using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Service.Interface;
using UELPM.Model.Models;

namespace UELPM.Business.Managers
{
    public class PaymentTermsManager : ManagerBase, IPaymentTermsManager
    {
        private readonly IPaymentTermsRepository m_PaymentTermRepository;

        public PaymentTermsManager(IPaymentTermsRepository paymentTermRepository)
        {
            m_PaymentTermRepository = paymentTermRepository;
        }
        public PaymentTermDisplayResult GetPaymentTerm(GridDisplayInput displayInput)
        {
            return m_PaymentTermRepository.GetPaymentTerm(displayInput);
        }
        public PaymentTerm GetPaymentTermDetails(int paymentTermId)
        {
            return m_PaymentTermRepository.GetPaymentTermDetails(paymentTermId);
        }
        public int CreatePaymentTerm(PaymentTerm paymentTerm)
        {
            return m_PaymentTermRepository.CreatePaymentTerm(paymentTerm);
        }
        public int UpdatePaymentTerm(PaymentTerm paymentTerm)
        {
            return m_PaymentTermRepository.UpdatePaymentTerm(paymentTerm);
        }
        public bool DeletePaymentTerms(PaymentTerm paymentTerm)
        {
            return m_PaymentTermRepository.DeletePaymentTerms(paymentTerm);
        }

        public PaymentTermDisplayResult GetAllPaymentTerm(GridDisplayInput displayInput)
        {
            return m_PaymentTermRepository.GetAllPaymentTerm(displayInput);
        }
        public int ValidatePaymentTerm(PaymentTerm paymentTerm)
        {
            return m_PaymentTermRepository.ValidatePaymentTerm(paymentTerm);
        }
        public string ConvertToPdf()
        {
            return m_PaymentTermRepository.ConvertToPdf();
        }
    }
}
