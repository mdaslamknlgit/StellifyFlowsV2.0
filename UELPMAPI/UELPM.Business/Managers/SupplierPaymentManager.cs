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
    public class SupplierPaymentManager : ISupplierPaymentManager
    {
        private readonly ISupplierPaymentRepository  m_supplierPaymentRepository;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="SupplierPaymentManager"></param>
        public SupplierPaymentManager(ISupplierPaymentRepository supplierPaymentRepository)
        {
            m_supplierPaymentRepository = supplierPaymentRepository;
        }

        public int CreateSupplierPayment(SupplierPayment supplierPayment)
        {
            return m_supplierPaymentRepository.CreateSupplierPayment(supplierPayment);
        }

        public bool DeleteSupplierPayment(SupplierPaymentDelete supplierPaymentDelete)
        {
            return m_supplierPaymentRepository.DeleteSupplierPayment(supplierPaymentDelete);
        }

        public SupplierPayment GetInvoicewithSupplierdetails(int supplierId)
        {
            return m_supplierPaymentRepository.GetInvoicewithSupplierdetails(supplierId);
        }

        public int GetSupplier(int supplierId)
        {
            return m_supplierPaymentRepository.GetSupplier(supplierId);
        }

        public SupplierPaymentDisplayResult GetSupplierPayment(GridDisplayInput supplierPaymentInput)
        {
            return m_supplierPaymentRepository.GetSupplierPayment(supplierPaymentInput);
        }

        public SupplierPayment GetSupplierPaymentDetails(int supplierPaymentId)
        {
            return m_supplierPaymentRepository.GetSupplierPaymentDetails(supplierPaymentId);
        }

        public int UpdateSupplierPayment(SupplierPayment supplierPayment)
        {
            return m_supplierPaymentRepository.UpdateSupplierPayment(supplierPayment);
        }

        public byte[] PaymentVoucherPrint(int supplierPaymentId, int companyId)
        {
            return m_supplierPaymentRepository.PaymentVoucherPrint(supplierPaymentId, companyId);
        }

        public IEnumerable<Suppliers> GetAllSuppliersinSupplierPayment(string searchKey, int supplierTypeId, int companyId)
        {
            return m_supplierPaymentRepository.GetAllSuppliersinSupplierPayment(searchKey,supplierTypeId, companyId);
        }

        public SupplierPayment GetEditSupplierPaymentDetails(int SupplierPaymentId, int SupplierId)
        {
            return m_supplierPaymentRepository.GetEditSupplierPaymentDetails(SupplierPaymentId, SupplierId);
        }
    }
}
