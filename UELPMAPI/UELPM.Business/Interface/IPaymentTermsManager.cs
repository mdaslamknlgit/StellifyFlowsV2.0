using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IPaymentTermsManager
    {
        PaymentTermDisplayResult GetPaymentTerm(GridDisplayInput displayInput);
        PaymentTerm GetPaymentTermDetails(int paymentTermsId);
        int CreatePaymentTerm(PaymentTerm paymentTerm);
        int UpdatePaymentTerm(PaymentTerm paymentTerm);
        bool DeletePaymentTerms(PaymentTerm paymentTerm);
        PaymentTermDisplayResult GetAllPaymentTerm(GridDisplayInput displayInput);
        int ValidatePaymentTerm(PaymentTerm paymentTerm);
        string ConvertToPdf();
    }
}
