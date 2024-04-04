using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IInvoiceRepository
    {
        InvoiceDisplayResult GetInvoice(GridDisplayInput invoiceInput);
        InvoiceDisplayResult GetInvoiceForApprovals(GridDisplayInput invoiceInput);
        InvoiceDisplayResult SearchInvoice(InvoiceSearch invoiceSearch);
        InvoiceDisplayResult GetExportInvoice(GridDisplayInput invoiceInput);
        int CreateInvoice(Invoice invoice);
        int UpdateInvoice(Invoice invoice);
        bool DeleteInvoice(InvoiceDelete invoiceDelete);
        IEnumerable<InvoiceTypes> GetInvoiceTypes();
        IEnumerable<CostOfServiceTypes> InvoiceGetCostOfServiceTypes();
        byte[] DownloadFile(Attachments attachment);
        Invoice GetInvoiceDetails(int invoiceId, int invoiceTypeId, int? poTypeID, int? companyId);
        InvoiceDisplayResult GetAllSearchInvoice(GridDisplayInput invoiceInput);
        string ConvertInvoiceToPdf(int invoiceId, int invoiceTypeId, int? POTypeId, int? companyId);
        List<GoodsReceivedNotes> GetGRNByPurchaseOrder(string purchaseOrderId, int purchaseOrderTypeId);
        List<ContractPurchaseOrder> GetContractPOCs(string purchaseOrderId, int purchaseOrderTypeId);        
        InvoiceCount GetInvoiceCount(int invoiceId);
        int VoidInvoice(InvoiceVoid invoice);
        Byte[] exportInvoice(Invoice invoice);
        Invoice[] exportBulkInovice(InvoiceList[] invoiceList, int userId, int companyId);
        bool BulkExportUpdateLog(InvoiceList[] invoiceList, int userId, int companyId);
        int ChangeInvoiceStatus(int invoiceId, int Workflowstatusid, int userId,int CurrentUserId);
        string GetInvoiceCode(int InvoiceId);
        int RecallInvoiceApproval(Invoice invoice);
        decimal CalculateInvoiceSubTotal(InvoiceSubTotal invoiceSubTotal);
        int RejectInvoice(InvoiceVoid invoice);
        InvoiceDisplayResult GetFilterSIC(SINVFilterDisplayInput sICFilterDisplayInput);
        int Getsupplierdetails(int supplierId, int purchaseOrderId);
        List<GoodsReceivedNotes> GetGRNCountByPurchaseOrder(int purchaseOrderId, int purchaseOrderTypeId);
        int CancelDraftInvoice(InvoiceVoid invoice);
        int SaveInvoiceGlcode(InvoiceGlCode invoiceglcode);
        byte[] SupplierInvoicePrint(int InvoiceId, int InvoiceTypeId, int POTypeId, int companyId);
        int VerifyInvoice(Invoice invoice);
    }
}
