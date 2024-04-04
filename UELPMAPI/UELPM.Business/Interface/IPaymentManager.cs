using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IPaymentManager
    {
        List<Payment> UploadPayments(string filePath);
        bool SavePayments(int userId, List<Payment> payments);
        InvoicePayments GetPaymentDetails(int InvoiceId, int companyId,int ProcessId);
    }
}
