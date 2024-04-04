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
    public class InvoiceManager : IInvoiceManager
    {
        private readonly IInvoiceRepository m_InvoiceRepository;

        public InvoiceManager(IInvoiceRepository invoiceRepository)
        {
            m_InvoiceRepository = invoiceRepository;
        }

        public string ConvertInvoiceToPdf(int invoiceId, int invoiceTypeId, int? POTypeId, int? companyId)
        {
            return m_InvoiceRepository.ConvertInvoiceToPdf(invoiceId,invoiceTypeId, POTypeId, companyId);
        }

        public int CreateInvoice(Invoice invoice)
        {
            return m_InvoiceRepository.CreateInvoice(invoice);
        }

        public int UpdateInvoice(Invoice invoice)
        {
            return m_InvoiceRepository.UpdateInvoice(invoice);
        }

        public bool DeleteInvoice(InvoiceDelete invoiceDelete)
        {
            return m_InvoiceRepository.DeleteInvoice(invoiceDelete);
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            return m_InvoiceRepository.DownloadFile(attachment);
        }

        public InvoiceDisplayResult GetAllSearchInvoice(GridDisplayInput invoiceInput)
        {
            return m_InvoiceRepository.GetAllSearchInvoice(invoiceInput);
        }

        public Invoice GetInvoiceDetails(int invoiceId, int invoiceTypeId, int? poTypeID, int? companyId)
        {
            return m_InvoiceRepository.GetInvoiceDetails(invoiceId,invoiceTypeId, poTypeID, companyId);
        }

        public InvoiceDisplayResult GetInvoice(GridDisplayInput invoiceInput)
        {
            return m_InvoiceRepository.GetInvoice(invoiceInput);
        }

        public IEnumerable<InvoiceTypes> GetInvoiceTypes()
        {
            return m_InvoiceRepository.GetInvoiceTypes();
        }

        public IEnumerable<CostOfServiceTypes> InvoiceGetCostOfServiceTypes()
        {
            return m_InvoiceRepository.InvoiceGetCostOfServiceTypes();
        }

        //public List<GoodsReceivedNotes> GetGRNByPurchaseOrder(int purchaseOrderId, int purchaseOrderTypeId)
        public List<GoodsReceivedNotes> GetGRNByPurchaseOrder(string purchaseOrderId, int purchaseOrderTypeId)
        {
            return m_InvoiceRepository.GetGRNByPurchaseOrder(purchaseOrderId, purchaseOrderTypeId);
        }


        public List<ContractPurchaseOrder> GetContractPOCs(string purchaseOrderId, int purchaseOrderTypeId)
        {
            return m_InvoiceRepository.GetContractPOCs(purchaseOrderId, purchaseOrderTypeId);
        }

        public InvoiceCount GetInvoiceCount(int invoiceId)
        {
            return m_InvoiceRepository.GetInvoiceCount(invoiceId);
        }

        public int VoidInvoice(InvoiceVoid invoice)
        {
            return m_InvoiceRepository.VoidInvoice(invoice);
        }
        public Byte[] exportInvoice(Invoice invoice)
        {
            return m_InvoiceRepository.exportInvoice(invoice);
        }
        public Invoice[] exportBulkInovice(InvoiceList[] invoiceList, int userId, int companyId)
        {
            return m_InvoiceRepository.exportBulkInovice(invoiceList, userId, companyId);
        }
        public bool BulkExportUpdateLog(InvoiceList[] invoiceList, int userId, int companyId)
        {
            return m_InvoiceRepository.BulkExportUpdateLog(invoiceList, userId, companyId);
        }
        
        public int ChangeInvoiceStatus(int invoiceId, int Workflowstatusid, int userId,int CurrentUserId)
        {
            return m_InvoiceRepository.ChangeInvoiceStatus(invoiceId,Workflowstatusid,userId,CurrentUserId);
        }

        public InvoiceDisplayResult GetInvoiceForApprovals(GridDisplayInput invoiceInput)
        {
            return m_InvoiceRepository.GetInvoiceForApprovals(invoiceInput);
        }

        public InvoiceDisplayResult SearchInvoice(InvoiceSearch invoiceSearch)
        {
            return m_InvoiceRepository.SearchInvoice(invoiceSearch);
        }

        public int RecallInvoiceApproval(Invoice invoice)
        {
            return m_InvoiceRepository.RecallInvoiceApproval(invoice);
        }

        public decimal CalculateInvoiceSubTotal(InvoiceSubTotal invoiceSubTotal)
        {
            return m_InvoiceRepository.CalculateInvoiceSubTotal(invoiceSubTotal);
        }

        public int RejectInvoice(InvoiceVoid invoice)
        {
            return m_InvoiceRepository.RejectInvoice(invoice);
        }

        public InvoiceDisplayResult GetExportInvoice(GridDisplayInput invoiceInput)
        {
            return m_InvoiceRepository.GetExportInvoice(invoiceInput);
        }
        public InvoiceDisplayResult GetFilterSIC(SINVFilterDisplayInput sICFilterDisplayInput)
        {
            return m_InvoiceRepository.GetFilterSIC(sICFilterDisplayInput);
        }

        public int Getsupplierdetails(int supplierId, int purchaseOrderId)
        {
            return m_InvoiceRepository.Getsupplierdetails(supplierId, purchaseOrderId);
        }

        public List<GoodsReceivedNotes> GetGRNCountByPurchaseOrder(int purchaseOrderId, int purchaseOrderTypeId)
        {
            return m_InvoiceRepository.GetGRNCountByPurchaseOrder(purchaseOrderId, purchaseOrderTypeId);
        }

        public int CancelDraftInvoice(InvoiceVoid invoice)
        {
            return m_InvoiceRepository.CancelDraftInvoice(invoice);
        }
        public int SaveInvoiceGlcode(InvoiceGlCode invoiceglcode)
        {
            return m_InvoiceRepository.SaveInvoiceGlcode(invoiceglcode);
        }

        public byte[] SupplierInvoicePrint(int InvoiceId, int InvoiceTypeId, int POTypeId, int companyId)
        {
            return m_InvoiceRepository.SupplierInvoicePrint(InvoiceId, InvoiceTypeId, POTypeId, companyId);
        }

        public int VerifyInvoice(Invoice invoice)
        {
            return m_InvoiceRepository.VerifyInvoice(invoice);
        }
    }
}
