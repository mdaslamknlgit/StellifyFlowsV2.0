using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    [RoutePrefix("api/SalesQuotation")]
    public class SalesQuotationController : ApiController
    {
        private readonly ISalesQuotationManager m_salesQuotationManager;
        private readonly ISalesInvoiceManager m_salesInvoiceManager;
        private readonly IGenericManager m_genericManager;
        private readonly ISharedManager m_sharedManager;
        private readonly ICustomerManager m_customerManager;
        public SalesQuotationController(ISalesQuotationManager salesQuotationManager, ISalesInvoiceManager salesInvoiceManager, IGenericManager genericManager, ISharedManager sharedManager, ICustomerManager customerManager)
        {
            m_salesQuotationManager = salesQuotationManager;
            m_salesInvoiceManager = salesInvoiceManager;
            m_genericManager = genericManager;
            m_sharedManager = sharedManager;
            m_customerManager = customerManager;
        }
        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetSalesQuotations")]
        public IHttpActionResult GetSalesQuotations(SalesQuotationSearch search)
        {
            var result = m_salesQuotationManager.GetSalesQuotations(search);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("GetSalesQuotation/{id}")]
        public IHttpActionResult GetSalesQuotation(int id)
        {
            Thread.Sleep(1000);
            var result = m_salesQuotationManager.GetSalesQuotation(id);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("GetQuotationsSearch")]
        public IHttpActionResult GetQuotationsSearch(SalesQuotationSearch search)
        {
            var result = m_salesQuotationManager.GetQuotationsSearch(search);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("PostSalesQuotation")]
        public IHttpActionResult PostSalesQuotation()
        {
            var httpRequest = HttpContext.Current.Request;
            SalesQuotation salesQuotation = JsonConvert.DeserializeObject<SalesQuotation>(httpRequest.Form["SalesQuotation"]);
            salesQuotation.files = httpRequest.Files;
            var result = m_salesQuotationManager.PostSalesQuotation(salesQuotation);
            return Ok(result);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("PostSalesQuotationBillingInfo")]
        public IHttpActionResult PostSalesQuotationBillingInfo()
        {
            int invoiceId = -1;
            var httpRequest = HttpContext.Current.Request;
            SalesQuotation salesQuotation = JsonConvert.DeserializeObject<SalesQuotation>(httpRequest.Form["SalesQuotation"]);
            m_salesQuotationManager.PostSalesQuotationBillingInfo(salesQuotation);
            SalesCustomer customer = m_customerManager.GetCustomer(salesQuotation.Customer.CustomerIPSId);
            AddressType addressType = m_sharedManager.GetAddressTypes().TakeWhile(x => x.AddressTypeId == 1).FirstOrDefault();
            SalesCustomerAddress billingAddress = customer.CustomerAddresses.TakeWhile(x => x.AddressType.AddressTypeId == 1).FirstOrDefault();
            string address = billingAddress.FullAddress;
            string attention = billingAddress.Attention;
            string customerEmail = billingAddress.Email;
            if (salesQuotation.MarkForBilling)
            {
                SalesInvoice invoice = new SalesInvoice
                {
                    QuotationId = salesQuotation.QuotationId,
                    QuotationCode = salesQuotation.DocumentCode,
                    CompanyId = salesQuotation.CompanyId,
                    WorkflowStatus = new WorkFlowStatuses { WorkFlowStatusid = (int)WorkFlowStatus.Open },
                    CreatedBy = salesQuotation.CreatedBy,
                    Department = salesQuotation.Department,
                    CustomerType = salesQuotation.CustomerType,
                    Customer = salesQuotation.Customer,
                    Location = salesQuotation.Location,
                    UnitNo = salesQuotation.UnitNo,
                    Reference = salesQuotation.Reference,
                    Attention = attention,
                    AddressType = addressType,
                    Address = address,
                    CustomerEmail = customerEmail,
                    Subject = salesQuotation.Subject,
                    ProjectName = salesQuotation.ProjectName,
                    CreditTerm = salesQuotation.CreditTerm,
                    Currency = salesQuotation.Currency,
                    Bank = salesQuotation.Bank,
                    Scheduler = new SchedulerNo { },
                    InvoiceDetail = salesQuotation.Subject,
                    Remarks = salesQuotation.Remarks,
                    TaxGroup = salesQuotation.TaxGroup,
                    CustomerRefNo = salesQuotation.CustomerRefNo,
                    CustomerAcceptanceDate = salesQuotation.CustomerAcceptanceDate,
                    PurchaseIncurred = salesQuotation.PurchaseIncurred,
                    Supplier = salesQuotation.Supplier,
                    POCode = salesQuotation.POCode,
                    JobSheetNo = salesQuotation.JobSheetNo,
                    JobSheetStatus = salesQuotation.JobSheetStatus,
                    JobSheetDescription = salesQuotation.JobSheetDescription,
                    JobCompletedDate = salesQuotation.JobCompletedDate,
                    TotalLineAmount = salesQuotation.TotalLineAmount,
                    Discount = salesQuotation.Discount,
                    TotalBeforeTax = salesQuotation.TotalBeforeTax,
                    TaxAmount = salesQuotation.TaxAmount,
                    SubTotal = salesQuotation.Total,
                    TaxAdjustment = 0,
                    NetTotal = salesQuotation.Total,
                    TotalAdjustment = 0,
                    Total = salesQuotation.Total,
                };
                foreach (var item in salesQuotation.LineItems)
                {
                    SalesInvoiceItem invoiceItem = new SalesInvoiceItem
                    {
                        AccountTypeId = item.AccountTypeId,
                        SubCategoryId = item.SubCategoryId,
                        AccountCodeId = item.AccountCodeId,
                        Description = item.Description,
                        Qty = item.Qty,
                        UOMId = item.UOMId,
                        UnitPrice = item.UnitPrice,
                        TotalBeforeDiscount = item.TotalBeforeDiscount,
                        Discount = item.Discount,
                        TotalBeforeTax = item.TotalBeforeTax,
                        TaxTypeId = item.TaxTypeId,
                        TaxAmount = item.TaxAmount,
                        TotalAfterTax = item.TotalAfterTax
                    };
                    invoice.LineItems.Add(invoiceItem);
                }
                invoice.files = httpRequest.Files;
                invoiceId = m_salesInvoiceManager.PostSalesInvoice(invoice);
                if (invoiceId > 0)
                {
                    InvoiceLink invoiceLink = new InvoiceLink
                    {
                        CompanyId = salesQuotation.CompanyId,
                        InvoiceId = invoiceId,
                        QuotationId = salesQuotation.QuotationId,
                        UserId = salesQuotation.UpdatedBy.UserID,
                        IsMarkforBill = salesQuotation.MarkForBilling
                    };
                    m_salesQuotationManager.UpdateSalesQuotationStatus(invoiceLink);
                    //m_genericManager.SendDocumentEmail(new ProjectDocument
                    //{
                    //    DocumentId = invoiceId,
                    //    DocumentTypeId = (int)WorkFlowProcessTypes.SalesInvoice,
                    //    CompanyId = invoice.CompanyId,
                    //    DepartmentId = invoice.Department.LocationID,
                    //    IsPrintAuditLog = false
                    //});
                }
            }
            return Ok(invoiceId);
        }

        [HttpPost]
        [CacheControl(MaxAge = 0)]
        [Route("PostSalesQuotationCustomerInfo")]
        public IHttpActionResult PostSalesQuotationCustomerInfo(SalesQuotation salesQuotation)
        {
            var result = m_salesQuotationManager.PostSalesQuotation(salesQuotation);
            return Ok(result);
        }
    }
}
