using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISupplierPaymentManager
    {
        SupplierPaymentDisplayResult GetSupplierPayment(GridDisplayInput supplierPaymentInput);
        SupplierPayment GetSupplierPaymentDetails(int supplierPaymentId);
        SupplierPayment GetInvoicewithSupplierdetails(int supplierId);
        int CreateSupplierPayment(SupplierPayment supplierPayment);
        int UpdateSupplierPayment(SupplierPayment supplierPayment);
        bool DeleteSupplierPayment(SupplierPaymentDelete supplierPaymentDelete);
        int GetSupplier(int supplierId);
        byte[] PaymentVoucherPrint(int supplierPaymentId, int companyId);
        IEnumerable<Suppliers> GetAllSuppliersinSupplierPayment(string searchKey, int supplierTypeId, int companyId);
        SupplierPayment GetEditSupplierPaymentDetails(int SupplierPaymentId, int SupplierId);
    }
}
