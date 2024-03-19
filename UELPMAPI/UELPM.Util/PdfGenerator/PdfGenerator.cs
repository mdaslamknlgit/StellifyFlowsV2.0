using HtmlAgilityPack;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.tool.xml;
using Mustache;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using UELPM.Model.Models;
using static UELPM.Util.PdfGenerator.HeaderFooter;

namespace UELPM.Util.PdfGenerator
{
    public class PdfGenerator
    {
        public Byte[] GeneratePDF(string pdfContent, string headerContent, string cssText, bool isLandScape = false)
        {
            byte[] pdf;
            using (var memoryStream = new MemoryStream())
            {
                var document = new Document();
                if (isLandScape == true)
                {
                    document = new Document(PageSize.A4.Rotate(), 10f, 10f, 10f, 30f);
                }
                else
                {
                    document = new Document(PageSize.A4, 30, 30, 35, 35);
                }
                document.Open();
                var writer = PdfWriter.GetInstance(document, memoryStream);
                document.Open();

                using (var cssMemoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(cssText)))
                {
                    using (var htmlMemoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(pdfContent)))
                    {
                        XMLWorkerHelper.GetInstance().ParseXHtml(writer, document, htmlMemoryStream, cssMemoryStream);
                    }
                }

                document.Close();
                pdf = memoryStream.ToArray();


                Font blackFont = FontFactory.GetFont("Arial", 12, Font.NORMAL, BaseColor.BLACK);
                using (MemoryStream stream = new MemoryStream())
                {
                    PdfReader reader = new PdfReader(pdf);
                    using (PdfStamper stamper = new PdfStamper(reader, stream))
                    {
                        int pages = reader.NumberOfPages;
                        for (int i = 1; i <= pages; i++)
                        {
                            //ColumnText.ShowTextAligned(stamper.GetOverContent(i), Element.ALIGN_CENTER, new Phrase(headerContent), 300f, 780, 0);
                            //ColumnText.ShowTextAligned(stamper.GetUnderContent(i), Element.ALIGN_CENTER, new Phrase("Purchase Order Request"), 300f, 780, 0);
                            ColumnText.ShowTextAligned(stamper.GetUnderContent(i), Element.ALIGN_CENTER, new Phrase(String.Format("Page {0} of {1}", i, reader.NumberOfPages)), 300f, 10, 0);
                        }
                    }

                    pdf = stream.ToArray();
                }
            }

            return pdf;
        }

        public Byte[] GeneratePDFWithHeaderFooter(string pdfContent, string cssText, CompanyDetails company, string pdfTitle, string DocumentNumber, string LogoURL, string DocumentStatus = "", bool isLandScape = false)
        {
            byte[] pdf;
            string pdfDiagonalText = string.Empty;
            string headerInternalText = string.Empty;
            using (var memoryStream = new MemoryStream())
            {
                var document = new Document();
                if (isLandScape == true)
                {
                    document = new Document(PageSize.A4.Rotate(), 10f, 10f, 10f, 30f);
                }
                else
                {
                    document = new Document(PageSize.A4, 30f, 30f, 90f, 90f);
                }
                document.Open();
                var writer = PdfWriter.GetInstance(document, memoryStream);
                var headerElements = new HtmlElementHandler();
                var footerElements = new HtmlElementHandler();

                string headerTemplate = string.Empty;
                string footerTemplate = string.Empty;
                headerTemplate = RetrieveTemplate("PDFTemplates", "Header");
                footerTemplate = RetrieveTemplate("PDFTemplates", "Footer");
                if (pdfTitle == "Supplier Invoice")
                {
                    pdfDiagonalText = DocumentStatus;
                    headerInternalText = "For internal circulation only";
                }
                else if (pdfTitle == "(AP) Credit Note")
                {
                    headerInternalText = "For internal use only";
                }
                XMLWorkerHelper.GetInstance().ParseXHtml(headerElements, new StringReader(ReplaceTokensInHTMLTemplate(headerTemplate, new
                {
                    company.CompanyDescription,
                    company.CompanyName,
                    LogoURL,
                    pdfTitle,
                    DocumentNumber,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.CountryName,
                    company.GSTRegistrationNumber,
                    company.CompanyRegistrationNumber,
                    headerInternalText
                })));
                XMLWorkerHelper.GetInstance().ParseXHtml(footerElements, new StringReader(ReplaceTokensInHTMLTemplate(footerTemplate, new
                {
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                })));
                writer.PageEvent = new HeaderFooter(headerElements.GetElements(), footerElements.GetElements(), null, pdfDiagonalText);
                document.Open();

                using (var cssMemoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(cssText)))
                {
                    using (var htmlMemoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(pdfContent)))
                    {
                        XMLWorkerHelper.GetInstance().ParseXHtml(writer, document, htmlMemoryStream, cssMemoryStream);

                    }
                }

                document.Close();
                pdf = memoryStream.ToArray();


                Font blackFont = FontFactory.GetFont("Arial", 12, Font.NORMAL, BaseColor.BLACK);
                using (MemoryStream stream = new MemoryStream())
                {
                    PdfReader reader = new PdfReader(pdf);
                    using (PdfStamper stamper = new PdfStamper(reader, stream))
                    {
                        int pages = reader.NumberOfPages;
                        if (pages > 1)
                        {
                            for (int i = 1; i <= pages; i++)
                            {
                                //ColumnText.ShowTextAligned(stamper.GetOverContent(i), Element.ALIGN_CENTER, new Phrase(headerContent), 300f, 780, 0);
                                //ColumnText.ShowTextAligned(stamper.GetUnderContent(i), Element.ALIGN_CENTER, new Phrase("Purchase Order Request"), 300f, 780, 0);
                                ColumnText.ShowTextAligned(stamper.GetUnderContent(i), Element.ALIGN_CENTER, new Phrase(String.Format("Page {0} of {1}", i, pages)), document.PageSize.Width - 40f, 10, 0);
                            }
                        }
                    }
                    pdf = stream.ToArray();
                }
            }

            return pdf;
        }

        public Byte[] GenerateSalesPDF(string pdfContent, PDFData data)
        {
            byte[] pdf;
            string pdfDiagonalText = string.Empty;
            string headerInternalText = string.Empty;
            using (var memoryStream = new MemoryStream())
            {
                var document = new Document();
                document = new Document(PageSize.A4, 30f, 30f, 100f, 100f);
                document.Open();
                var writer = PdfWriter.GetInstance(document, memoryStream);
                var headerElements = new HtmlElementHandler();
                var footerElements = new HtmlElementHandler();
                string headerTemplate = string.Empty;
                string footerTemplate = string.Empty;
                headerTemplate = RetrieveTemplate("PDFTemplates", "SalesHeader");
                if (data.PDFTitle == WorkFlowProcessTypes.SalesInvoice.ToString())
                {
                    footerTemplate = RetrieveTemplate("PDFTemplates", "SalesFooter");
                }
                XMLWorkerHelper.GetInstance().ParseXHtml(headerElements, new StringReader(ReplaceTokensInHTMLTemplate(headerTemplate, new
                {
                    data.Company.CompanyName,
                    data.LogoURL,
                    data.PDFTitle,
                    data.Company.Address1,
                    data.Company.Address2,
                    data.Company.Address3,
                    data.Company.ZipCode,
                    data.Company.Telephone,
                    data.Company.Website,
                    data.Company.CountryName,
                    data.Company.GSTRegistrationNumber,
                    data.Company.CompanyRegistrationNumber
                })));
                XMLWorkerHelper.GetInstance().ParseXHtml(footerElements, new StringReader(ReplaceTokensInHTMLTemplate(footerTemplate, new
                {
                    data.DynamicProp13,
                    data.DynamicProp5,
                    data.DynamicProp6,
                    data.DynamicProp7,
                    data.DynamicProp8,
                    data.DynamicProp9,
                    data.DynamicProp10,
                    data.DynamicProp11,
                    data.DynamicProp12,
                    data.DynamicProp14
                })));
                Position position = new Position { lly = -100, ury = 100 };
                writer.PageEvent = new HeaderFooter(headerElements.GetElements(), footerElements.GetElements(), position, pdfDiagonalText);
                document.Open();
                using (var cssMemoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(string.Empty)))
                {
                    using (var htmlMemoryStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(pdfContent)))
                    {
                        XMLWorkerHelper.GetInstance().ParseXHtml(writer, document, htmlMemoryStream,cssMemoryStream);
                    }
                }
                document.Close();
                pdf = memoryStream.ToArray();
                using (MemoryStream stream = new MemoryStream())
                {
                    PdfReader reader = new PdfReader(pdf);
                    using (PdfStamper stamper = new PdfStamper(reader, stream))
                    {
                        int pages = reader.NumberOfPages;
                        if (pages > 1)
                        {
                            for (int i = 1; i <= pages; i++)
                            {
                                ColumnText.ShowTextAligned(stamper.GetUnderContent(i), Element.ALIGN_CENTER, new Phrase(String.Format("Page {0} of {1}", i, pages)), document.PageSize.Width - 40f, 10, 0);
                            }
                        }
                    }
                    pdf = stream.ToArray();
                }
            }
            return pdf;
        }



        //public string ReplaceBRwithNewline(string txtVal)
        //{
        //    string newText = "";
        //    // Create regular expressions    
        //    System.Text.RegularExpressions.Regex regex =
        //        new System.Text.RegularExpressions.Regex(@"(<br />|<br/>|</ br>|</br>)");
        //    // Replace new line with <br/> tag    
        //    newText = regex.Replace(txtVal, "\r\n");
        //    // Result    
        //    return newText;
        //}

        public byte[] GetPurchaseOrderRequestPDFTemplate(PurchaseOrderRequest objPurchaseOrderRequest, QuotationRequest objQuotationRequest, CompanyDetails company)
        {
            string purchaseOrderRequestHeader = string.Empty;
            string body = string.Empty;
            string Title = string.Empty;
            string LogoURL = string.Empty;
            string CompanyAddress = string.Empty;
            string CompanyInfo = string.Empty;
            string CompanyRegNumber = string.Empty;
            string WorkFlowStatusText = string.Empty;
            string Message = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "PURCHASE ORDER REQUEST";

            purchaseOrderRequestHeader = RetrieveTemplate("PDFTemplates", "PurchaseOrderRequestHeader");
            if (objPurchaseOrderRequest != null)
            {
                if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo) || objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                {
                    body = RetrieveTemplate("PDFTemplates", "PurchaseOrderRequestBody");
                }
                else if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    body = RetrieveTemplate("PDFTemplates", "PurchaseOrderRequestFixedPOBody");
                }

                body = PurchaseOrderRequestBody(body, objPurchaseOrderRequest, true);
                string PurchaseOrderRequestCode = string.Empty;
                string supplierType = objPurchaseOrderRequest.Supplier.SupplierTypeID == 1 ? "UEL Supplier" : "External Supplier";
                string isGstRequired = objPurchaseOrderRequest.IsGstRequired ? "Yes" : "No";
                string Currency = objPurchaseOrderRequest.CurrencySymbol;
                string SubTotal = $"{objPurchaseOrderRequest.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{objPurchaseOrderRequest.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{objPurchaseOrderRequest.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{objPurchaseOrderRequest.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{objPurchaseOrderRequest.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{objPurchaseOrderRequest.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequest.TaxRate = Math.Round(objPurchaseOrderRequest.TaxRate, 2);
                string CreatedDate = objPurchaseOrderRequest.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = objPurchaseOrderRequest.ExpectedDeliveryDate.ToShortDateString();
                if (objPurchaseOrderRequest.CurrentApproverUserName != null)
                {
                    WorkFlowStatusText = $"{objPurchaseOrderRequest.WorkFlowStatusText} {" [" + objPurchaseOrderRequest.CurrentApproverUserName + "] "}";
                }
                else
                {
                    WorkFlowStatusText = $"{objPurchaseOrderRequest.WorkFlowStatusText}";
                }

                if (objPurchaseOrderRequest.PurchaseOrderRequestVendorItems != null)
                {
                    if (objPurchaseOrderRequest.PurchaseOrderRequestVendorItems.Count == 0)
                    {
                        Message = "No records are found";
                    }
                }

                if (objPurchaseOrderRequest.PurchaseOrderRequestCode != null)
                {
                    PurchaseOrderRequestCode = objPurchaseOrderRequest.PurchaseOrderRequestCode;
                }
                else
                {
                    PurchaseOrderRequestCode = objPurchaseOrderRequest.DraftCode;
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    objPurchaseOrderRequest.PurchaseOrderType,
                    objPurchaseOrderRequest.RequestedByUserName,
                    CreatedDate,
                    supplierType,
                    objPurchaseOrderRequest.Supplier.SupplierName,
                    // objPurchaseOrderRequest.Supplier.BillingAddress1,
                    //objPurchaseOrderRequest.Supplier.SupplierAddress,
                    objPurchaseOrderRequest.DeliveryAddress,
                    objPurchaseOrderRequest.Supplier.BillingFax,
                    objPurchaseOrderRequest.PurchaseOrderRequestItems.Count,
                    objPurchaseOrderRequest.Location,
                    PurchaseOrderRequestCode,
                    objPurchaseOrderRequest.CostOfService,
                    ExpectedDeliveryDate,
                    objPurchaseOrderRequest.VendorReferences,
                    objPurchaseOrderRequest.CurrencyCode,
                    WorkFlowStatusText,
                    objPurchaseOrderRequest.PaymentTerms,
                    objPurchaseOrderRequest.Reasons,
                    objPurchaseOrderRequest.Instructions,
                    objPurchaseOrderRequest.Justifications,
                    objPurchaseOrderRequest.DeliveryTerm,
                    SubTotal,
                    Discount,
                    objPurchaseOrderRequest.TaxRate,
                    TotalTax,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    LogoURL,
                    Message,
                    CompanyRegNumber,
                    Currency,
                    Title,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone

                });
            }
            else if (objQuotationRequest != null)
            {
                body = RetrieveTemplate("PDFTemplates", "QuotationRequestBody");
                objQuotationRequest.PurchaseOrderRequest.PurchaseOrderRequestItems = objQuotationRequest.PurchaseOrderRequestItems;
                body = PurchaseOrderRequestBody(body, objQuotationRequest.PurchaseOrderRequest, false);

                string supplierType = objQuotationRequest.PurchaseOrderRequest.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGST = objQuotationRequest.PurchaseOrderRequest.IsGstRequired ? "Yes" : "No";

                string CreatedDate = objQuotationRequest.PurchaseOrderRequest.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = objQuotationRequest.PurchaseOrderRequest.ExpectedDeliveryDate.ToShortDateString();
                Title = "QUOTATION REQUEST";
                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    objQuotationRequest.PurchaseOrderRequest.PurchaseOrderRequestCode,
                    objQuotationRequest.PurchaseOrderRequest.RequestedByUserName,
                    objQuotationRequest.PurchaseOrderRequest.Designation,
                    objQuotationRequest.QuotationRequestCode,
                    CreatedDate,
                    objQuotationRequest.PurchaseOrderRequest.CostOfService,
                    supplierType,
                    objQuotationRequest.PurchaseOrderRequest.Location,
                    objQuotationRequest.PurchaseOrderRequest.CurrencyCode,
                    ExpectedDeliveryDate,
                    objQuotationRequest.PurchaseOrderRequest.PaymentTerms,
                    objQuotationRequest.PurchaseOrderRequest.Instructions,
                    objQuotationRequest.PurchaseOrderRequest.Justifications,
                    objQuotationRequest.PurchaseOrderRequest.DeliveryTerm,
                    LogoURL,
                    CompanyRegNumber,
                    IsGST,
                    Title,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone
                });
            }

            return GeneratePDF(body, purchaseOrderRequestHeader, "");
        }

        public byte[] GetPurchaseOrderRequestApprovalPDFTemplate(PurchaseOrderRequest objPurchaseOrderRequest, CompanyDetails company, string type)
        {
            string purchaseOrderRequestApprovalHeader = string.Empty;
            string body = string.Empty;
            string Title = string.Empty;
            string LogoURL = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Message = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            if (!string.IsNullOrEmpty(type))
            {
                Title = type;
            }
            else
            {
                Title = "PURCHASE ORDER";
            }

            if (objPurchaseOrderRequest != null)
            {
                if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                {
                    body = RetrieveTemplate("PDFTemplates", "PurchaseOrderRequestApprovalBody");
                }
                else if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    body = RetrieveTemplate("PDFTemplates", "PurchaseOrderRequestFixedPOApprovalBody");
                }

                body = PurchaseOrderRequestBody(body, objPurchaseOrderRequest, true);

                string supplierType = objPurchaseOrderRequest.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGSTRequired = objPurchaseOrderRequest.IsGstRequired ? "Yes" : "No";
                string Currency = objPurchaseOrderRequest.CurrencySymbol;
                string SubTotal = $"{objPurchaseOrderRequest.SubTotal.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                string Discount = $"{objPurchaseOrderRequest.Discount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{objPurchaseOrderRequest.TotalTax.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequest.TaxRate = Math.Round(objPurchaseOrderRequest.TaxRate, 2);
                string ShippingCharges = $"{objPurchaseOrderRequest.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{objPurchaseOrderRequest.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{objPurchaseOrderRequest.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";

                string CreatedDate = objPurchaseOrderRequest.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = objPurchaseOrderRequest.ExpectedDeliveryDate.ToShortDateString();

                if (objPurchaseOrderRequest.PurchaseOrderRequestVendorItems != null)
                {
                    if (objPurchaseOrderRequest.PurchaseOrderRequestVendorItems.Count == 0)
                    {
                        Message = "No records are found";
                    }
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    objPurchaseOrderRequest.PurchaseOrderType,
                    objPurchaseOrderRequest.RequestedByUserName,
                    CreatedDate,
                    supplierType,
                    objPurchaseOrderRequest.Supplier.SupplierName,
                    // objPurchaseOrderRequest.Supplier.BillingAddress1,
                    //objPurchaseOrderRequest.SupplierAddress,
                    objPurchaseOrderRequest.DeliveryAddress,
                    objPurchaseOrderRequest.Supplier.BillingFax,
                    objPurchaseOrderRequest.PurchaseOrderRequestItems.Count,
                    objPurchaseOrderRequest.Location,
                    objPurchaseOrderRequest.PurchaseOrderRequestCode,
                    objPurchaseOrderRequest.CostOfService,
                    ExpectedDeliveryDate,
                    objPurchaseOrderRequest.VendorReferences,
                    objPurchaseOrderRequest.CurrencyCode,
                    objPurchaseOrderRequest.PurchaseOrderStatusText,
                    objPurchaseOrderRequest.PaymentTerms,
                    objPurchaseOrderRequest.Reasons,
                    objPurchaseOrderRequest.Instructions,
                    objPurchaseOrderRequest.Justifications,
                    objPurchaseOrderRequest.DeliveryTerm,
                    SubTotal,
                    Discount,
                    objPurchaseOrderRequest.TaxRate,
                    TotalTax,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    objPurchaseOrderRequest.Designation,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    CompanyRegNumber,
                    Currency,
                    IsGSTRequired,
                    Message,
                    Title
                });
            }

            return GeneratePDF(body, purchaseOrderRequestApprovalHeader, "");
        }

        public byte[] getPDFTemplate(PDFData data)
        {
            string body = RetrieveTemplate("PDFTemplates", data.TemplateFileName);
            body = PreparePDFBody(body, data);
            body = ReplaceTokensInHTMLTemplate(body, data);
            HtmlDocument doc = new HtmlDocument();
            doc.LoadHtml(body);
            foreach (var item in doc.DocumentNode.Descendants(0).Where(n => n.HasClass("hidecontent")))
            {
                item.InnerHtml = "<td></td>";
            }
            return GeneratePDFWithHeaderFooter(doc.DocumentNode.OuterHtml, "", data.Company, data.PDFTitle, data.DocumentCode, data.LogoURL);
        }

        public byte[] getSalesPDFTemplate(PDFData data)
        {
            string body = RetrieveTemplate("PDFTemplates", data.TemplateFileName);
            body = PreparePDFBody(body, data);
            body = ReplaceTokensInHTMLTemplate(body, data);
            HtmlDocument doc = new HtmlDocument();
            doc.LoadHtml(body);
            foreach (var item in doc.DocumentNode.Descendants(0).Where(n => n.HasClass("hidecontent")))
            {
                item.InnerHtml = "<td></td>";
            }
            return GenerateSalesPDF(doc.DocumentNode.OuterHtml, data);
        }


        public string getAuditLogTemplate(AuditLogData auditLogData)
        {
            string content = RetrieveTemplate("PDFTemplates", "AuditLogChanges");
            content = PrepareAuditTable(content, auditLogData);
            return content;
        }
        public string getInvoicePaymentTemplate(InvoicePayments payments)
        {
            string content = RetrieveTemplate("PDFTemplates", "InvoicePayments");
            content = PrepareInvoicePaymentsTable(content, payments);
            return content;
        }

        public byte[] GetPurchaseOrderPDFTemplate(PurchaseOrder purchaseOrderDetails = null, FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null, ContractPurchaseOrder contractPurchaseOrderDetails = null, ExpensesPurchaseOrder expensesPurchaseOrderDetails = null, CompanyDetails company = null, List<SupplierContactPerson> SupplierContactPersons = null)
        {
            string purchaseOrderHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = string.Empty;
            string Title = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string PurchaseOrderStatusText = string.Empty;
            string POCode = string.Empty;
            decimal total = 0;
            string TotalBeforeGST = string.Empty;
            string TotalDiscount = string.Empty;
            string GSTAmount = string.Empty;
            string ContactName = string.Empty;
            string ContactNumber = string.Empty;
            string ContactEmail = string.Empty;
            string SupplierSubCode = string.Empty;
            string GSTNumber = string.Empty;
            string style = string.Empty;
            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "PURCHASE ORDER";
            string GstAmount = string.Empty;
            decimal TaxAmount = 0;
            decimal ItemTotal = 0;
            string TotalItems = string.Empty;
            if (SupplierContactPersons != null)
            {
                for (int i = 0; i < SupplierContactPersons.Count; i++)
                {
                    if (SupplierContactPersons[i].Name != null)
                    {
                        ContactName += SupplierContactPersons[i].Name + ", ";
                    }
                    if (SupplierContactPersons[i].ContactNumber != null)
                    {
                        ContactNumber += SupplierContactPersons[i].ContactNumber + ", ";
                    }
                    if (SupplierContactPersons[i].EmailId != null)
                    {
                        ContactEmail += SupplierContactPersons[i].EmailId + ", ";
                    }
                }
                ContactName = ContactName.Remove(ContactName.Length - 2);
                if (ContactNumber != "")
                {
                    ContactNumber = ContactNumber.Remove(ContactNumber.Length - 2);
                }
                ContactEmail = ContactEmail.Remove(ContactEmail.Length - 2);
            }

            if (purchaseOrderDetails != null)
            {
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderInventoryPOBodyNew");
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderInventoryPOBody");
                body = PurchaseOrderBody(body, purchaseOrderDetails);

                string supplierType = purchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = purchaseOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = purchaseOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = purchaseOrderDetails.CurrencySymbol;
                string SubTotal = $"{purchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{purchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{purchaseOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{purchaseOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{purchaseOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{purchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string CreatedDate = purchaseOrderDetails.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate.ToShortDateString();
                string AmountInWords = "Total Value : Dollars " + purchaseOrderDetails.AmountinWords;
                //string DeliveryTerm = ReplaceBRwithNewline(purchaseOrderDetails.DeliveryTerm);
                decimal netTotal = 0;
                decimal discountTotal = 0;
                discountTotal = purchaseOrderDetails.PurchaseOrderItems.Sum(x => x.Discount);
                netTotal = purchaseOrderDetails.PurchaseOrderItems.Sum(x => x.TaxTotal);
                TaxAmount = purchaseOrderDetails.PurchaseOrderItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                total = purchaseOrderDetails.SubTotal - netTotal;
                TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                foreach (var item in purchaseOrderDetails.PurchaseOrderItems)
                {

                    ItemTotal += (item.ItemQty * item.Unitprice);
                }
                TotalItems = $"{ItemTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (purchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{purchaseOrderDetails.WorkFlowStatusText} {" [" + purchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{purchaseOrderDetails.WorkFlowStatusText}";
                }
                if (purchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{purchaseOrderDetails.PurchaseOrderCode}";
                }
                else
                {
                    POCode = $"{purchaseOrderDetails.DraftCode}";
                }

                if (purchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{purchaseOrderDetails.SupplierSubCode.SubCode} {" (" + purchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                if (SupplierContactPersons == null)
                {
                    ContactName = purchaseOrderDetails.ContactPersonName;
                    ContactNumber = purchaseOrderDetails.ContactNo;
                    ContactEmail = purchaseOrderDetails.ContactEmail;
                }

                if (purchaseOrderDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = purchaseOrderDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }


                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    purchaseOrderDetails.PurchaseOrderType,
                    purchaseOrderDetails.RequestedByUserName,
                    purchaseOrderDetails.RequestorContactNo,
                    purchaseOrderDetails.RequestorEmailID,
                    GSTAmount,
                    CreatedDate,
                    supplierType,
                    style,
                    GSTNumber,
                    GstAmount,
                    TotalItems,
                    purchaseOrderDetails.Supplier.SupplierName,
                    // purchaseOrderDetails.Supplier.BillingAddress1,
                    purchaseOrderDetails.SupplierAddress,
                    purchaseOrderDetails.DeliveryAddress,
                    purchaseOrderDetails.Supplier.BillingFax,
                    purchaseOrderDetails.Supplier.SupplierCode,
                    purchaseOrderDetails.PurchaseOrderItems.Count,
                    purchaseOrderDetails.Location,
                    POCode,
                    purchaseOrderDetails.CostOfService,
                    ExpectedDeliveryDate,
                    purchaseOrderDetails.VendorReferences,
                    purchaseOrderDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    purchaseOrderDetails.PaymentTerms,
                    purchaseOrderDetails.Reasons,
                    purchaseOrderDetails.Instructions,
                    purchaseOrderDetails.Justifications,
                    purchaseOrderDetails.DeliveryTerm,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    AmountInWords,
                    TotalBeforeGST,
                    TotalDiscount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    purchaseOrderDetails.Designation,
                    IsGstRequired,
                    Title,
                    SupplierSubCode,
                    ContactName,
                    ContactNumber,
                    ContactEmail
                });
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderFixedAssetPOBody");
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderFixedAssetPOBodyNew");
                body = PurchaseOrderBody(body, null, fixedPurchaseOrderDetails);

                string supplierType = fixedPurchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = fixedPurchaseOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = fixedPurchaseOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = fixedPurchaseOrderDetails.CurrencySymbol;
                string ExpectedDeliveryDate = string.Empty;
                string SubTotal = $"{fixedPurchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{fixedPurchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";


                //  string TotalTax = $"{fixedPurchaseOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                string ShippingCharges = $"{fixedPurchaseOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{fixedPurchaseOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string CreatedDate = fixedPurchaseOrderDetails.CreatedDate.ToShortDateString();
                string AmountinWords = "Total Value : Dollars " + fixedPurchaseOrderDetails.AmountinWords;
                TaxAmount = fixedPurchaseOrderDetails.PurchaseOrderItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";

                if (fixedPurchaseOrderDetails.ExpectedDeliveryDate != null)
                {
                    ExpectedDeliveryDate = Convert.ToString(String.Format("{0:dd-MM-yyyy}", fixedPurchaseOrderDetails.ExpectedDeliveryDate));
                }

                if (fixedPurchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{fixedPurchaseOrderDetails.WorkFlowStatusText} {" [" + fixedPurchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{fixedPurchaseOrderDetails.WorkFlowStatusText}";
                }
                if (fixedPurchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode}";
                }
                else
                {
                    POCode = $"{fixedPurchaseOrderDetails.DraftCode}";
                }

                decimal netTotal = 0;
                decimal discountTotal = 0;
                discountTotal = fixedPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.Discount);
                netTotal = fixedPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.TaxTotal);
                total = fixedPurchaseOrderDetails.SubTotal - netTotal;
                TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                foreach (var item in fixedPurchaseOrderDetails.PurchaseOrderItems)
                {

                    ItemTotal += (item.AssetQty * item.Unitprice);
                }
                TotalItems = $"{ItemTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (fixedPurchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{fixedPurchaseOrderDetails.SupplierSubCode.SubCode} {" (" + fixedPurchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                if (SupplierContactPersons == null)
                {
                    ContactName = fixedPurchaseOrderDetails.ContactPersonName;
                    ContactNumber = fixedPurchaseOrderDetails.ContactNo;
                    ContactEmail = fixedPurchaseOrderDetails.ContactEmail;
                }

                if (fixedPurchaseOrderDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = fixedPurchaseOrderDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    fixedPurchaseOrderDetails.PurchaseOrderType,
                    fixedPurchaseOrderDetails.RequestorEmailID,
                    fixedPurchaseOrderDetails.RequestorContactNo,
                    fixedPurchaseOrderDetails.RequestedByUserName,
                    CreatedDate,
                    supplierType,
                    GstAmount,
                    TotalItems,
                    fixedPurchaseOrderDetails.Supplier.SupplierName,
                    // fixedPurchaseOrderDetails.Supplier.BillingAddress1,
                    fixedPurchaseOrderDetails.SupplierAddress,
                    fixedPurchaseOrderDetails.DeliveryAddress,
                    fixedPurchaseOrderDetails.Supplier.BillingFax,
                    fixedPurchaseOrderDetails.Supplier.SupplierCode,
                    fixedPurchaseOrderDetails.PurchaseOrderItems.Count,
                    fixedPurchaseOrderDetails.Location,
                    POCode,
                    fixedPurchaseOrderDetails.CostOfService,
                    ExpectedDeliveryDate,
                    fixedPurchaseOrderDetails.VendorReferences,
                    fixedPurchaseOrderDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    fixedPurchaseOrderDetails.PaymentTerms,
                    fixedPurchaseOrderDetails.Reasons,
                    fixedPurchaseOrderDetails.Instructions,
                    fixedPurchaseOrderDetails.Justifications,
                    fixedPurchaseOrderDetails.DeliveryTerm,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    AmountinWords,
                    TotalBeforeGST,
                    GSTAmount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    fixedPurchaseOrderDetails.Designation,
                    IsGstRequired,
                    Title,
                    SupplierSubCode,
                    ContactName,
                    ContactNumber,
                    ContactEmail,
                    style,
                    GSTNumber,
                    TotalDiscount
                });

            }
            else if (contractPurchaseOrderDetails != null)
            {
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderFixedContractBody");
                body = PurchaseOrderBody(body, null, null, contractPurchaseOrderDetails);

                string Currency = contractPurchaseOrderDetails.CurrencySymbol;
                string StartDate = string.Empty;
                string PurchaseOrderTitleType = string.Empty;
                string CreatedDate = string.Empty;
                string PODate = string.Empty;
                string EndDate = string.Empty;
                string BillingType = string.Empty;
                string BillingFrequency = string.Empty;
                PurchaseOrderTitleType = "Contract Purchase Order";
                Title = "Supplier Master Contract";


                //Need to add Master table
                if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.Monthly))
                {
                    BillingType = "Month";
                    BillingFrequency = "Monthly";
                }

                else if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.Quarterly))
                {
                    BillingType = "Quarter";
                    BillingFrequency = "Quarterly";
                }

                else if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.HalfYearly))
                {
                    BillingType = "Half Year";
                    BillingFrequency = "Half Yearly";
                }
                else if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.BiMonthly))
                {
                    BillingType = "Bi-Monthly";
                    BillingFrequency = "Bi-Monthly";
                }
                else
                {
                    BillingType = "Year";
                    BillingFrequency = "Yearly";
                }
                if (contractPurchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{contractPurchaseOrderDetails.WorkFlowStatusText} {" [" + contractPurchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{contractPurchaseOrderDetails.WorkFlowStatusText}";
                }


                decimal convertedTotalTax = Convert.ToDecimal(contractPurchaseOrderDetails.TotalTax);
                string SubTotal = $"{contractPurchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{contractPurchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TenureAmount = $"{contractPurchaseOrderDetails.TenureAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalContractSum = $"{contractPurchaseOrderDetails.TotalContractSum.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{convertedTotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                CreatedDate = contractPurchaseOrderDetails.CreatedDate.ToShortDateString();
                StartDate = contractPurchaseOrderDetails.StartDate.ToShortDateString();
                PODate = contractPurchaseOrderDetails.PODate.ToShortDateString();
                EndDate = contractPurchaseOrderDetails.EndDate.ToShortDateString();
                TaxAmount = Convert.ToDecimal(contractPurchaseOrderDetails.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                // TaxAmount =  contractPurchaseOrderDetails.TaxAmount).ToString();
                //TaxAmount = $"{Convert.ToDecimal (contractPurchaseOrderDetails.TaxAmount."0,0.00", CultureInfo.InvariantCulture))}";
                // GstAmount = $"{TaxAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                if (contractPurchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{contractPurchaseOrderDetails.CPONumber}";
                }
                else
                {
                    POCode = $"{contractPurchaseOrderDetails.DraftCode}";
                }
                string ServiceName = contractPurchaseOrderDetails.Supplier == null ? "" : contractPurchaseOrderDetails.Supplier.ServiceName;
                string SupplierCode = contractPurchaseOrderDetails.Supplier == null ? "" : contractPurchaseOrderDetails.Supplier.SupplierCode;
                string AccruetheExpense = contractPurchaseOrderDetails.AccruetheExpense == true ? "Yes" : "No";
                string SplitByMonthly = contractPurchaseOrderDetails.SplitByMonthly == true ? "Yes" : "No";

                if (contractPurchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{contractPurchaseOrderDetails.SupplierSubCode.SubCode} {" (" + contractPurchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    contractPurchaseOrderDetails.ContractName,
                    PurchaseOrderTitleType,
                    contractPurchaseOrderDetails.RequestedByUserName,
                    contractPurchaseOrderDetails.Supplier.SupplierName,
                    contractPurchaseOrderDetails.FirstName,
                    contractPurchaseOrderDetails.LastName,
                    contractPurchaseOrderDetails.Margin,
                    contractPurchaseOrderDetails.AccountCodeName,
                    contractPurchaseOrderDetails.PurchaseOrderType,
                    contractPurchaseOrderDetails.TaxGroupName,
                    contractPurchaseOrderDetails.Description,
                    GstAmount,
                    CreatedDate,
                    StartDate,
                    PODate,
                    EndDate,
                    BillingType,
                    BillingFrequency,
                    contractPurchaseOrderDetails.BillingFrequencyId,
                    contractPurchaseOrderDetails.CurrencyCode,
                    POCode,
                    SubTotal,
                    Discount,
                    TotalTax,
                    TenureAmount,
                    TotalContractSum,
                    TotalAmount,
                    contractPurchaseOrderDetails.TaxName,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    Title,
                    contractPurchaseOrderDetails.Designation,
                    contractPurchaseOrderDetails.Location,
                    PurchaseOrderStatusText,
                    contractPurchaseOrderDetails.ServiceName,
                    SupplierCode,
                    contractPurchaseOrderDetails.ContractTerms,
                    AccruetheExpense,
                    SplitByMonthly,
                    SupplierSubCode
                });
            }
            else if (expensesPurchaseOrderDetails != null)
            {
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderExpensePOBody");
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderExpensePOBodyNew");
                body = PurchaseOrderBody(body, null, null, null, expensesPurchaseOrderDetails);

                string supplierType = expensesPurchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = expensesPurchaseOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = expensesPurchaseOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = expensesPurchaseOrderDetails.CurrencySymbol;
                string SubTotal = $"{expensesPurchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{expensesPurchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{expensesPurchaseOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{expensesPurchaseOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{expensesPurchaseOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{expensesPurchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string AmountinWords = "Total Value  : Dollars " + expensesPurchaseOrderDetails.AmountInWords;
                string CreatedDate = expensesPurchaseOrderDetails.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = string.Empty;
                TaxAmount = expensesPurchaseOrderDetails.PurchaseOrderItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                foreach (var item in expensesPurchaseOrderDetails.PurchaseOrderItems)
                {

                    ItemTotal += (item.ExpensesQty * item.Unitprice);
                }
                TotalItems = $"{ItemTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (expensesPurchaseOrderDetails.ExpectedDeliveryDate != null)
                {
                    ExpectedDeliveryDate = Convert.ToString(String.Format("{0:dd-MM-yyyy}", expensesPurchaseOrderDetails.ExpectedDeliveryDate));
                }

                if (expensesPurchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{expensesPurchaseOrderDetails.WorkFlowStatusText} {" [" + expensesPurchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{expensesPurchaseOrderDetails.WorkFlowStatusText}";
                }

                if (expensesPurchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{expensesPurchaseOrderDetails.ExpensesPurchaseOrderCode}";
                }
                else
                {
                    POCode = $"{expensesPurchaseOrderDetails.DraftCode}";
                }

                decimal netTotal = 0;
                decimal discountTotal = 0;
                discountTotal = expensesPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.Discount);
                netTotal = expensesPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.TaxTotal);
                total = expensesPurchaseOrderDetails.SubTotal - netTotal;
                TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                if (expensesPurchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{expensesPurchaseOrderDetails.SupplierSubCode.SubCode} {" (" + expensesPurchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                if (SupplierContactPersons == null)
                {
                    ContactName = expensesPurchaseOrderDetails.ContactPersonName;
                    ContactNumber = expensesPurchaseOrderDetails.ContactNo;
                    ContactEmail = expensesPurchaseOrderDetails.ContactEmail;
                }

                if (expensesPurchaseOrderDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = expensesPurchaseOrderDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    expensesPurchaseOrderDetails.PurchaseOrderType,
                    expensesPurchaseOrderDetails.RequestorContactNo,
                    expensesPurchaseOrderDetails.RequestorEmailID,
                    expensesPurchaseOrderDetails.RequestedByUserName,
                    CreatedDate,
                    supplierType,
                    GstAmount,
                    TotalItems,
                    expensesPurchaseOrderDetails.Supplier.SupplierName,
                    // expensesPurchaseOrderDetails.Supplier.BillingAddress1,
                    expensesPurchaseOrderDetails.SupplierAddress,
                    expensesPurchaseOrderDetails.DeliveryAddress,
                    expensesPurchaseOrderDetails.Supplier.BillingFax,
                    expensesPurchaseOrderDetails.Supplier.SupplierCode,
                    expensesPurchaseOrderDetails.PurchaseOrderItems.Count,
                    expensesPurchaseOrderDetails.Location,
                    POCode,
                    expensesPurchaseOrderDetails.CostOfService,
                    expensesPurchaseOrderDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    expensesPurchaseOrderDetails.PaymentTerms,
                    expensesPurchaseOrderDetails.Reasons,
                    expensesPurchaseOrderDetails.Instructions,
                    expensesPurchaseOrderDetails.Justifications,
                    expensesPurchaseOrderDetails.DeliveryTerm,
                    expensesPurchaseOrderDetails.VendorReferences,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    AmountinWords,
                    TotalBeforeGST,
                    GSTAmount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    expensesPurchaseOrderDetails.Designation,
                    IsGstRequired,
                    Title,
                    ExpectedDeliveryDate,
                    SupplierSubCode,
                    ContactName,
                    ContactNumber,
                    ContactEmail,
                    style,
                    GSTNumber,
                    TotalDiscount
                });
            }

            return GeneratePDFWithHeaderFooter(body, "", company, Title, POCode, LogoURL);
        }

        public byte[] GetPurchaseOrdersPDFTemplate(PurchaseOrder purchaseOrderDetails = null, FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null, ContractPurchaseOrder contractPurchaseOrderDetails = null, ExpensesPurchaseOrder expensesPurchaseOrderDetails = null, CompanyDetails company = null, List<SupplierContactPerson> SupplierContactPersons = null)
        {
            string purchaseOrderHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = string.Empty;
            string Title = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string PurchaseOrderStatusText = string.Empty;
            string POCode = string.Empty;
            decimal total = 0;
            string TotalBeforeGST = string.Empty;
            string TotalDiscount = string.Empty;
            string GSTAmount = string.Empty;
            string ContactName = string.Empty;
            string ContactNumber = string.Empty;
            string ContactEmail = string.Empty;
            string SupplierSubCode = string.Empty;
            string GSTNumber = string.Empty;
            string style = string.Empty;
            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "PURCHASE ORDER";
            string GstAmount = string.Empty;
            decimal TaxAmount = 0;
            decimal ItemTotal = 0;
            string TotalItems = string.Empty;
            if (SupplierContactPersons != null)
            {
                for (int i = 0; i < SupplierContactPersons.Count; i++)
                {
                    if (SupplierContactPersons[i].Name != null)
                    {
                        ContactName += SupplierContactPersons[i].Name + ", ";
                    }
                    if (SupplierContactPersons[i].ContactNumber != null)
                    {
                        ContactNumber += SupplierContactPersons[i].ContactNumber + ", ";
                    }
                    if (SupplierContactPersons[i].EmailId != null)
                    {
                        ContactEmail += SupplierContactPersons[i].EmailId + ", ";
                    }
                }
                ContactName = ContactName.Remove(ContactName.Length - 2);
                if (ContactNumber != "")
                {
                    ContactNumber = ContactNumber.Remove(ContactNumber.Length - 2);
                }
                ContactEmail = ContactEmail.Remove(ContactEmail.Length - 2);
            }

            if (purchaseOrderDetails != null)
            {
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderInventoryPOBodyNew");
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderInventoryPOBody");
                body = PurchaseOrderBody(body, purchaseOrderDetails);

                string supplierType = purchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = purchaseOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = purchaseOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = purchaseOrderDetails.CurrencySymbol;
                string SubTotal = $"{purchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{purchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{purchaseOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{purchaseOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{purchaseOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{purchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string CreatedDate = purchaseOrderDetails.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate.ToShortDateString();
                string AmountInWords = "Total Value : Dollars " + purchaseOrderDetails.AmountinWords;
                //string DeliveryTerm = ReplaceBRwithNewline(purchaseOrderDetails.DeliveryTerm);
                decimal netTotal = 0;
                decimal discountTotal = 0;
                discountTotal = purchaseOrderDetails.PurchaseOrderItems.Sum(x => x.Discount);
                netTotal = purchaseOrderDetails.PurchaseOrderItems.Sum(x => x.TaxTotal);
                TaxAmount = purchaseOrderDetails.PurchaseOrderItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                total = purchaseOrderDetails.SubTotal - netTotal;
                TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                foreach (var item in purchaseOrderDetails.PurchaseOrderItems)
                {

                    ItemTotal += (item.ItemQty * item.Unitprice);
                }
                TotalItems = $"{ItemTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (purchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{purchaseOrderDetails.WorkFlowStatusText} {" [" + purchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{purchaseOrderDetails.WorkFlowStatusText}";
                }
                if (purchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{purchaseOrderDetails.PurchaseOrderCode}";
                }
                else
                {
                    POCode = $"{purchaseOrderDetails.DraftCode}";
                }

                if (purchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{purchaseOrderDetails.SupplierSubCode.SubCode} {" (" + purchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                if (SupplierContactPersons == null)
                {
                    ContactName = purchaseOrderDetails.ContactPersonName;
                    ContactNumber = purchaseOrderDetails.ContactNo;
                    ContactEmail = purchaseOrderDetails.ContactEmail;
                }

                if (purchaseOrderDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = purchaseOrderDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }


                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    purchaseOrderDetails.PurchaseOrderType,
                    purchaseOrderDetails.RequestedByUserName,
                    purchaseOrderDetails.RequestorContactNo,
                    purchaseOrderDetails.RequestorEmailID,
                    GSTAmount,
                    CreatedDate,
                    supplierType,
                    style,
                    GSTNumber,
                    GstAmount,
                    TotalItems,
                    purchaseOrderDetails.Supplier.SupplierName,
                    // purchaseOrderDetails.Supplier.BillingAddress1,
                    purchaseOrderDetails.SupplierAddress,
                    purchaseOrderDetails.DeliveryAddress,
                    purchaseOrderDetails.Supplier.BillingFax,
                    purchaseOrderDetails.Supplier.SupplierCode,
                    purchaseOrderDetails.PurchaseOrderItems.Count,
                    purchaseOrderDetails.Location,
                    POCode,
                    purchaseOrderDetails.CostOfService,
                    ExpectedDeliveryDate,
                    purchaseOrderDetails.VendorReferences,
                    purchaseOrderDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    purchaseOrderDetails.PaymentTerms,
                    purchaseOrderDetails.Reasons,
                    purchaseOrderDetails.Instructions,
                    purchaseOrderDetails.Justifications,
                    purchaseOrderDetails.DeliveryTerm,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    AmountInWords,
                    TotalBeforeGST,
                    TotalDiscount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    purchaseOrderDetails.Designation,
                    IsGstRequired,
                    Title,
                    SupplierSubCode,
                    ContactName,
                    ContactNumber,
                    ContactEmail
                });
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderFixedAssetPOBody");
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderFixedAssetPOBodyNew");
                body = PurchaseOrderBody(body, null, fixedPurchaseOrderDetails);

                string supplierType = fixedPurchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = fixedPurchaseOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = fixedPurchaseOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = fixedPurchaseOrderDetails.CurrencySymbol;
                string ExpectedDeliveryDate = string.Empty;
                string SubTotal = $"{fixedPurchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{fixedPurchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";


                //  string TotalTax = $"{fixedPurchaseOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                string ShippingCharges = $"{fixedPurchaseOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{fixedPurchaseOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string CreatedDate = fixedPurchaseOrderDetails.CreatedDate.ToShortDateString();
                string AmountinWords = "Total Value : Dollars " + fixedPurchaseOrderDetails.AmountinWords;
                TaxAmount = fixedPurchaseOrderDetails.PurchaseOrderItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";

                if (fixedPurchaseOrderDetails.ExpectedDeliveryDate != null)
                {
                    ExpectedDeliveryDate = Convert.ToString(String.Format("{0:dd-MM-yyyy}", fixedPurchaseOrderDetails.ExpectedDeliveryDate));
                }

                if (fixedPurchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{fixedPurchaseOrderDetails.WorkFlowStatusText} {" [" + fixedPurchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{fixedPurchaseOrderDetails.WorkFlowStatusText}";
                }
                if (fixedPurchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode}";
                }
                else
                {
                    POCode = $"{fixedPurchaseOrderDetails.DraftCode}";
                }

                decimal netTotal = 0;
                decimal discountTotal = 0;
                discountTotal = fixedPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.Discount);
                netTotal = fixedPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.TaxTotal);
                total = fixedPurchaseOrderDetails.SubTotal - netTotal;
                TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                foreach (var item in fixedPurchaseOrderDetails.PurchaseOrderItems)
                {

                    ItemTotal += (item.AssetQty * item.Unitprice);
                }
                TotalItems = $"{ItemTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (fixedPurchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{fixedPurchaseOrderDetails.SupplierSubCode.SubCode} {" (" + fixedPurchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                if (SupplierContactPersons == null)
                {
                    ContactName = fixedPurchaseOrderDetails.ContactPersonName;
                    ContactNumber = fixedPurchaseOrderDetails.ContactNo;
                    ContactEmail = fixedPurchaseOrderDetails.ContactEmail;
                }

                if (fixedPurchaseOrderDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = fixedPurchaseOrderDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    fixedPurchaseOrderDetails.PurchaseOrderType,
                    fixedPurchaseOrderDetails.RequestorEmailID,
                    fixedPurchaseOrderDetails.RequestorContactNo,
                    fixedPurchaseOrderDetails.RequestedByUserName,
                    CreatedDate,
                    supplierType,
                    GstAmount,
                    TotalItems,
                    fixedPurchaseOrderDetails.Supplier.SupplierName,
                    // fixedPurchaseOrderDetails.Supplier.BillingAddress1,
                    fixedPurchaseOrderDetails.SupplierAddress,
                    fixedPurchaseOrderDetails.DeliveryAddress,
                    fixedPurchaseOrderDetails.Supplier.BillingFax,
                    fixedPurchaseOrderDetails.Supplier.SupplierCode,
                    fixedPurchaseOrderDetails.PurchaseOrderItems.Count,
                    fixedPurchaseOrderDetails.Location,
                    POCode,
                    fixedPurchaseOrderDetails.CostOfService,
                    ExpectedDeliveryDate,
                    fixedPurchaseOrderDetails.VendorReferences,
                    fixedPurchaseOrderDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    fixedPurchaseOrderDetails.PaymentTerms,
                    fixedPurchaseOrderDetails.Reasons,
                    fixedPurchaseOrderDetails.Instructions,
                    fixedPurchaseOrderDetails.Justifications,
                    fixedPurchaseOrderDetails.DeliveryTerm,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    AmountinWords,
                    TotalBeforeGST,
                    GSTAmount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    fixedPurchaseOrderDetails.Designation,
                    IsGstRequired,
                    Title,
                    SupplierSubCode,
                    ContactName,
                    ContactNumber,
                    ContactEmail,
                    style,
                    GSTNumber,
                    TotalDiscount
                });

            }
            else if (contractPurchaseOrderDetails != null)
            {
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderFixedContractBody");
                body = PurchaseOrderBody(body, null, null, contractPurchaseOrderDetails);

                string Currency = contractPurchaseOrderDetails.CurrencySymbol;
                string StartDate = string.Empty;
                string PurchaseOrderTitleType = string.Empty;
                string CreatedDate = string.Empty;
                string PODate = string.Empty;
                string EndDate = string.Empty;
                string BillingType = string.Empty;
                string BillingFrequency = string.Empty;
                PurchaseOrderTitleType = "Contract Purchase Order";
                Title = "Supplier Master Contract";


                //Need to add Master table
                if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.Monthly))
                {
                    BillingType = "Month";
                    BillingFrequency = "Monthly";
                }

                else if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.Quarterly))
                {
                    BillingType = "Quarter";
                    BillingFrequency = "Quarterly";
                }

                else if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.HalfYearly))
                {
                    BillingType = "Half Year";
                    BillingFrequency = "Half Yearly";
                }
                else if (contractPurchaseOrderDetails.BillingFrequencyId == Convert.ToInt32(BillingFrequencyType.BiMonthly))
                {
                    BillingType = "Bi-Monthly";
                    BillingFrequency = "Bi-Monthly";
                }
                else
                {
                    BillingType = "Year";
                    BillingFrequency = "Yearly";
                }
                if (contractPurchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{contractPurchaseOrderDetails.WorkFlowStatusText} {" [" + contractPurchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{contractPurchaseOrderDetails.WorkFlowStatusText}";
                }


                decimal convertedTotalTax = Convert.ToDecimal(contractPurchaseOrderDetails.TotalTax);
                string SubTotal = $"{contractPurchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{contractPurchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TenureAmount = $"{contractPurchaseOrderDetails.TenureAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalContractSum = $"{contractPurchaseOrderDetails.TotalContractSum.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{convertedTotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                CreatedDate = contractPurchaseOrderDetails.CreatedDate.ToShortDateString();
                StartDate = contractPurchaseOrderDetails.StartDate.ToShortDateString();
                PODate = contractPurchaseOrderDetails.PODate.ToShortDateString();
                EndDate = contractPurchaseOrderDetails.EndDate.ToShortDateString();
                TaxAmount = Convert.ToDecimal(contractPurchaseOrderDetails.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                // TaxAmount =  contractPurchaseOrderDetails.TaxAmount).ToString();
                //TaxAmount = $"{Convert.ToDecimal (contractPurchaseOrderDetails.TaxAmount."0,0.00", CultureInfo.InvariantCulture))}";
                // GstAmount = $"{TaxAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                if (contractPurchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{contractPurchaseOrderDetails.CPONumber}";
                }
                else
                {
                    POCode = $"{contractPurchaseOrderDetails.DraftCode}";
                }
                string ServiceName = contractPurchaseOrderDetails.Supplier == null ? "" : contractPurchaseOrderDetails.Supplier.ServiceName;
                string SupplierCode = contractPurchaseOrderDetails.Supplier == null ? "" : contractPurchaseOrderDetails.Supplier.SupplierCode;
                string AccruetheExpense = contractPurchaseOrderDetails.AccruetheExpense == true ? "Yes" : "No";
                string SplitByMonthly = contractPurchaseOrderDetails.SplitByMonthly == true ? "Yes" : "No";

                if (contractPurchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{contractPurchaseOrderDetails.SupplierSubCode.SubCode} {" (" + contractPurchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    contractPurchaseOrderDetails.ContractName,
                    PurchaseOrderTitleType,
                    contractPurchaseOrderDetails.RequestedByUserName,
                    contractPurchaseOrderDetails.Supplier.SupplierName,
                    contractPurchaseOrderDetails.FirstName,
                    contractPurchaseOrderDetails.LastName,
                    contractPurchaseOrderDetails.Margin,
                    contractPurchaseOrderDetails.AccountCodeName,
                    contractPurchaseOrderDetails.PurchaseOrderType,
                    contractPurchaseOrderDetails.TaxGroupName,
                    contractPurchaseOrderDetails.Description,
                    GstAmount,
                    CreatedDate,
                    StartDate,
                    PODate,
                    EndDate,
                    BillingType,
                    BillingFrequency,
                    contractPurchaseOrderDetails.BillingFrequencyId,
                    contractPurchaseOrderDetails.CurrencyCode,
                    POCode,
                    SubTotal,
                    Discount,
                    TotalTax,
                    TenureAmount,
                    TotalContractSum,
                    TotalAmount,
                    contractPurchaseOrderDetails.TaxName,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    Title,
                    contractPurchaseOrderDetails.Designation,
                    contractPurchaseOrderDetails.Location,
                    PurchaseOrderStatusText,
                    contractPurchaseOrderDetails.ServiceName,
                    SupplierCode,
                    contractPurchaseOrderDetails.ContractTerms,
                    AccruetheExpense,
                    SplitByMonthly,
                    SupplierSubCode
                });
            }
            else if (expensesPurchaseOrderDetails != null)
            {
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderExpensePOBody");
                body = RetrieveTemplate("PDFTemplates", "PurchaseOrderExpensePOBodyNew");
                body = PurchaseOrderBody(body, null, null, null, expensesPurchaseOrderDetails);

                string supplierType = expensesPurchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = expensesPurchaseOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = expensesPurchaseOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = expensesPurchaseOrderDetails.CurrencySymbol;
                string SubTotal = $"{expensesPurchaseOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{expensesPurchaseOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{expensesPurchaseOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{expensesPurchaseOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{expensesPurchaseOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{expensesPurchaseOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string AmountinWords = "Total Value  : Dollars " + expensesPurchaseOrderDetails.AmountInWords;
                string CreatedDate = expensesPurchaseOrderDetails.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = string.Empty;
                TaxAmount = expensesPurchaseOrderDetails.PurchaseOrderItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                foreach (var item in expensesPurchaseOrderDetails.PurchaseOrderItems)
                {

                    ItemTotal += (item.ExpensesQty * item.Unitprice);
                }
                TotalItems = $"{ItemTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (expensesPurchaseOrderDetails.ExpectedDeliveryDate != null)
                {
                    ExpectedDeliveryDate = Convert.ToString(String.Format("{0:dd-MM-yyyy}", expensesPurchaseOrderDetails.ExpectedDeliveryDate));
                }

                if (expensesPurchaseOrderDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{expensesPurchaseOrderDetails.WorkFlowStatusText} {" [" + expensesPurchaseOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{expensesPurchaseOrderDetails.WorkFlowStatusText}";
                }

                if (expensesPurchaseOrderDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft))
                {
                    POCode = $"{expensesPurchaseOrderDetails.ExpensesPurchaseOrderCode}";
                }
                else
                {
                    POCode = $"{expensesPurchaseOrderDetails.DraftCode}";
                }

                decimal netTotal = 0;
                decimal discountTotal = 0;
                discountTotal = expensesPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.Discount);
                netTotal = expensesPurchaseOrderDetails.PurchaseOrderItems.Sum(x => x.TaxTotal);
                total = expensesPurchaseOrderDetails.SubTotal - netTotal;
                TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                if (expensesPurchaseOrderDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{expensesPurchaseOrderDetails.SupplierSubCode.SubCode} {" (" + expensesPurchaseOrderDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                if (SupplierContactPersons == null)
                {
                    ContactName = expensesPurchaseOrderDetails.ContactPersonName;
                    ContactNumber = expensesPurchaseOrderDetails.ContactNo;
                    ContactEmail = expensesPurchaseOrderDetails.ContactEmail;
                }

                if (expensesPurchaseOrderDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = expensesPurchaseOrderDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }

                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    expensesPurchaseOrderDetails.PurchaseOrderType,
                    expensesPurchaseOrderDetails.RequestorContactNo,
                    expensesPurchaseOrderDetails.RequestorEmailID,
                    expensesPurchaseOrderDetails.RequestedByUserName,
                    CreatedDate,
                    supplierType,
                    GstAmount,
                    TotalItems,
                    expensesPurchaseOrderDetails.Supplier.SupplierName,
                    // expensesPurchaseOrderDetails.Supplier.BillingAddress1,
                    expensesPurchaseOrderDetails.SupplierAddress,
                    expensesPurchaseOrderDetails.DeliveryAddress,
                    expensesPurchaseOrderDetails.Supplier.BillingFax,
                    expensesPurchaseOrderDetails.Supplier.SupplierCode,
                    expensesPurchaseOrderDetails.PurchaseOrderItems.Count,
                    expensesPurchaseOrderDetails.Location,
                    POCode,
                    expensesPurchaseOrderDetails.CostOfService,
                    expensesPurchaseOrderDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    expensesPurchaseOrderDetails.PaymentTerms,
                    expensesPurchaseOrderDetails.Reasons,
                    expensesPurchaseOrderDetails.Instructions,
                    expensesPurchaseOrderDetails.Justifications,
                    expensesPurchaseOrderDetails.DeliveryTerm,
                    expensesPurchaseOrderDetails.VendorReferences,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    AmountinWords,
                    TotalBeforeGST,
                    GSTAmount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    expensesPurchaseOrderDetails.Designation,
                    IsGstRequired,
                    Title,
                    ExpectedDeliveryDate,
                    SupplierSubCode,
                    ContactName,
                    ContactNumber,
                    ContactEmail,
                    style,
                    GSTNumber,
                    TotalDiscount
                });
            }

            return GeneratePDFWithHeaderFooter(body, "", company, Title, POCode, LogoURL);
        }

        public byte[] GetGoodsReceivedNotesPDFTemplate(GoodsReceivedNotes goodsReceivedNoteDetails, CompanyDetails company)
        {
            string goodsReceivedNotesHeader = string.Empty;
            string body = string.Empty;
            string Title = string.Empty;
            string LogoURL = string.Empty;
            string CompanyAddress = string.Empty;
            string CompanyInfo = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string DeliveryTerm = string.Empty;
            string GRNCode = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "GOODS RECEIVED NOTES";

            body = RetrieveTemplate("PDFTemplates", "GoodsReceivedNotestBody");
            body = GoodsReceivedNotesBody(body, goodsReceivedNoteDetails);

            string CreatedDate = goodsReceivedNoteDetails.CreatedDate.ToShortDateString();
            if (goodsReceivedNoteDetails.WorkFlowStatusId == 13 || goodsReceivedNoteDetails.WorkFlowStatusId == 12 || goodsReceivedNoteDetails.WorkFlowStatusId == 11)
            {
                GRNCode = $"{goodsReceivedNoteDetails.GRNCode}";
            }
            else
            {
                GRNCode = $"{goodsReceivedNoteDetails.DraftCode}";
            }

            body = ReplaceTokensInHTMLTemplate(body, new
            {
                GRNCode,
                goodsReceivedNoteDetails.PurchaseOrderCode,
                goodsReceivedNoteDetails.WorkFlowStatus,
                goodsReceivedNoteDetails.Supplier.SupplierName,
                goodsReceivedNoteDetails.SupplierDoNumber,
                goodsReceivedNoteDetails.RequestedByUserName,
                goodsReceivedNoteDetails.DeliveryAddress,
                goodsReceivedNoteDetails.SupplierAddress,
                goodsReceivedNoteDetails.Supplier.BillingFax,
                goodsReceivedNoteDetails.Location,
                CreatedDate,
                goodsReceivedNoteDetails.CostOfService,
                goodsReceivedNoteDetails.CurrencyCode,
                goodsReceivedNoteDetails.PurchaseOrderType,
                goodsReceivedNoteDetails.ItemsList.Count,
                goodsReceivedNoteDetails.GRNRemarks,
                LogoURL,
                CompanyRegNumber,
                Designation,
                DeliveryTerm,
                Title,
                company.CompanyDescription,
                company.CompanyName,
                company.Address1,
                company.Address2,
                company.Country,
                company.ZipCode,
                company.Fax,
                company.Telephone
            });

            return GeneratePDFWithHeaderFooter(body, "", company, Title, GRNCode, LogoURL);
        }

        public byte[] GetGoodsReturnedNotesPDFTemplate(GoodsReturnedNotes goodsReturnedNotes, CompanyDetails company)
        {
            string goodsReturnedNotesHeader = string.Empty;
            string body = string.Empty;
            string Title = string.Empty;
            string LogoURL = string.Empty;
            string CompanyAddress = string.Empty;
            string CompanyInfo = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string DeliveryTerm = string.Empty;
            string GRNCode = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "GOODS RETURN NOTES";

            body = RetrieveTemplate("PDFTemplates", "GoodsReturnedNotestBody");
            body = GoodsReturnedNotesBody(body, goodsReturnedNotes);
            if (goodsReturnedNotes.Status == 2)
            {
                GRNCode = $"{goodsReturnedNotes.GRTCode}";
            }
            else
            {
                GRNCode = $"{goodsReturnedNotes.DraftCode}";
            }

            string CreatedDate = goodsReturnedNotes.CreatedDate.ToShortDateString();

            body = ReplaceTokensInHTMLTemplate(body, new
            {
                goodsReturnedNotes.PurchaseOrderCode,
                goodsReturnedNotes.Supplier.SupplierName,
                goodsReturnedNotes.SupplierDoNumber,
                goodsReturnedNotes.RequestedByUserName,
                goodsReturnedNotes.DeliveryAddress,
                goodsReturnedNotes.Supplier.BillingAddress1,
                goodsReturnedNotes.Supplier.BillingFax,
                goodsReturnedNotes.Location,
                CreatedDate,
                GRNCode,
                goodsReturnedNotes.CurrencyCode,
                goodsReturnedNotes.PurchaseOrderType,
                goodsReturnedNotes.ItemsList.Count,
                goodsReturnedNotes.GRNRemarks,
                goodsReturnedNotes.CostOfService,
                Status = goodsReturnedNotes.WorkFlowStatus,
                LogoURL,
                CompanyRegNumber,
                Designation,
                DeliveryTerm,
                Title,
                company.CompanyDescription,
                company.CompanyName,
                company.Address1,
                company.Address2,
                company.Country,
                company.ZipCode,
                company.Fax,
                company.Telephone
            });

            return GeneratePDF(body, goodsReturnedNotesHeader, "");
        }

        public byte[] GetPaymentVoucherPDFTemplate(SupplierPayment supplierPaymentDetails, CompanyDetails company)
        {
            string paymentVoucherHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Status = string.Empty;
            string Total = string.Empty;
            decimal TotalOverPayment = 0;
            string PayeeName = string.Empty;
            string Address = string.Empty;
            string PaymentType = string.Empty;
            PaymentType = "Supplier";
            int PaymentId = 0;
            string PaymentCode = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Total = $"{supplierPaymentDetails.SupplierInvoiceDetails.Select(i => i.PaymentAmount).Sum().ToString("0,0.00", CultureInfo.InvariantCulture)}";
            string OverPayment = $"{TotalOverPayment.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            body = RetrieveTemplate("PDFTemplates", "payment-voucher");
            body = PaymentVoucherBody(body, supplierPaymentDetails);
            string PaymentDate = supplierPaymentDetails.CreatedDate.ToShortDateString();
            PayeeName = supplierPaymentDetails.Supplier.SupplierName;
            Address = supplierPaymentDetails.Supplier.BillingAddress1;
            PaymentId = supplierPaymentDetails.SupplierPaymentId;
            PaymentCode = supplierPaymentDetails.SupplierPaymentCode;
            body = ReplaceTokensInHTMLTemplate(body, new
            {
                PayeeName,
                PaymentDate,
                PaymentType,
                Address,
                PaymentId,
                PaymentCode,
                supplierPaymentDetails.Name,
                supplierPaymentDetails.AmountInWords,
                LogoURL,
                CompanyRegNumber,
                OverPayment,
                Total,
                company.CompanyName,
                company.Address1,
                company.Address2,
                company.Country,
                company.ZipCode,
                company.Fax,
                company.Telephone
            });

            return GeneratePDF(body, paymentVoucherHeader, "");
        }

        public byte[] GetLocationTransferPDFTemplate(LocationTransfer locationTransfer, CompanyDetails company)
        {
            string locationTransferHeader = string.Empty;
            string body = string.Empty;
            string Title = string.Empty;
            string LogoURL = string.Empty;
            string CompanyAddress = string.Empty;
            string CompanyInfo = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Status = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "LOCATION TRANSFER REQUEST";


            body = RetrieveTemplate("PDFTemplates", "LocationTransferBody");
            body = LocationTransferBody(body, locationTransfer);

            Status = locationTransfer.WorkFlowStatus;
            string CreatedDate = locationTransfer.CreatedDate.ToShortDateString();
            string FromCompany = locationTransfer.FromCompany;
            string ToCompany = locationTransfer.ToCompany;
            string FromLocation = locationTransfer.FromLocation;
            string ToLocation = locationTransfer.ToLocation;
            string RequestedBy = locationTransfer.RequestedByUserName;
            string ReasonForTransfer = locationTransfer.ReasonForTransfer;
            string LocationTransferCode = locationTransfer.LocationTransferCode;

            body = ReplaceTokensInHTMLTemplate(body, new
            {
                FromCompany,
                ToCompany,
                FromLocation,
                ToLocation,
                CreatedDate,
                Status,
                RequestedBy,
                ReasonForTransfer,
                LocationTransferCode,
                LogoURL,
                CompanyRegNumber,
                Title,
                company.CompanyDescription,
                company.CompanyName,
                company.Address1,
                company.Address2,
                company.Country,
                company.ZipCode,
                company.Fax,
                company.Telephone
            });

            return GeneratePDF(body, locationTransferHeader, "");
        }

        public byte[] GetCustomerPaymentVoucherPDFTemplate(CustomerPayment customerPaymentDetails, CompanyDetails company)
        {
            string paymentVoucherHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Status = string.Empty;
            string Total = string.Empty;
            decimal TotalOverPayment = 0;
            string PayeeName = string.Empty;
            string Address = string.Empty;
            string PaymentType = string.Empty;
            PaymentType = "Customer";
            int PaymentId = 0;
            string PaymentCode = string.Empty;


            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Total = $"{customerPaymentDetails.CustomerInvoiceDetails.Select(i => i.PaymentAmount).Sum().ToString("0,0.00", CultureInfo.InvariantCulture)}";
            string OverPayment = $"{TotalOverPayment.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            body = RetrieveTemplate("PDFTemplates", "payment-voucher");
            body = PaymentVoucherBody(body, null, customerPaymentDetails);
            string PaymentDate = customerPaymentDetails.CreatedDate.ToShortDateString();
            PayeeName = customerPaymentDetails.Customer.CustomerName;
            Address = customerPaymentDetails.Customer.BillingAddress;
            PaymentId = customerPaymentDetails.CustomerPaymentId;
            PaymentCode = customerPaymentDetails.CustomerPaymentCode;

            body = ReplaceTokensInHTMLTemplate(body, new
            {
                PayeeName,
                PaymentDate,
                PaymentType,
                Address,
                PaymentId,
                PaymentCode,
                customerPaymentDetails.Name,
                customerPaymentDetails.AmountInWords,
                LogoURL,
                CompanyRegNumber,
                OverPayment,
                Total,
                company.CompanyName,
                company.Address1,
                company.Address2,
                company.Country,
                company.ZipCode,
                company.Fax,
                company.Telephone
            });

            return GeneratePDF(body, paymentVoucherHeader, "");
        }

        public byte[] GetSalesOrderPDFTemplate(SalesOrder salesOrderDetails, CompanyDetails company)
        {
            string salesOrderHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = string.Empty;
            string Title = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string SalesOrderStatusText = string.Empty;
            string customerType = string.Empty;
            string TicketNo = string.Empty;
            string UnitNumber = string.Empty;

            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";

            Title = "SALES ORDER";

            if (salesOrderDetails != null)
            {
                body = RetrieveTemplate("PDFTemplates", "SalesOrderBody");
                body = SalesOrderBody(body, salesOrderDetails, null);

                if (salesOrderDetails.Customer.CustomerCategoryId == Convert.ToInt32(SalesOrderCustomerCategories.Owners))
                {
                    customerType = "Owners";
                }
                else if (salesOrderDetails.Customer.CustomerCategoryId == Convert.ToInt32(SalesOrderCustomerCategories.Tenants))
                {
                    customerType = "Tenants";
                }
                else
                {
                    customerType = "Others";
                }

                string IsGstRequired = salesOrderDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = salesOrderDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = salesOrderDetails.CurrencySymbol;
                string SubTotal = $"{salesOrderDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{salesOrderDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{salesOrderDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{salesOrderDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{salesOrderDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{salesOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string CreatedDate = salesOrderDetails.CreatedDate.ToShortDateString();
                string ExpectedDeliveryDate = salesOrderDetails.ExpectedDeliveryDate.ToShortDateString();

                if (salesOrderDetails.CurrentApproverUserName != null)
                {
                    SalesOrderStatusText = $"{salesOrderDetails.WorkFlowStatusText} {" [" + salesOrderDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    SalesOrderStatusText = $"{salesOrderDetails.WorkFlowStatusText}";
                }

                if (salesOrderDetails.Ticket != null)
                {
                    TicketNo = salesOrderDetails.Ticket.TicketNo;
                    UnitNumber = salesOrderDetails.Ticket.UnitNumber;
                }
                else
                {
                    TicketNo = "--";
                    UnitNumber = "--";
                }


                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    salesOrderDetails.RequestedByUserName,
                    CreatedDate,
                    customerType,
                    salesOrderDetails.Customer.CustomerName,
                    salesOrderDetails.Customer.BillingAddress,
                    salesOrderDetails.DeliveryAddress,
                    salesOrderDetails.Customer.BillingFax,
                    salesOrderDetails.SalesOrderItems.Count,
                    salesOrderDetails.Location,
                    salesOrderDetails.SalesOrderCode,
                    salesOrderDetails.CostOfService,
                    ExpectedDeliveryDate,
                    salesOrderDetails.CurrencyCode,
                    SalesOrderStatusText,
                    salesOrderDetails.PaymentTerms,
                    salesOrderDetails.Reasons,
                    salesOrderDetails.Instructions,
                    salesOrderDetails.Justifications,
                    salesOrderDetails.DeliveryTerm,
                    TicketNo,
                    UnitNumber,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    Designation,
                    IsGstRequired,
                    Title
                });
            }

            return GeneratePDF(body, salesOrderHeader, "");
        }

        public byte[] GetAssetRegisterPDFTemplate(List<AssetDetails> Assets, CompanyDetails company)
        {
            string assetRegisterHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            string Title = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string TicketNo = string.Empty;
            string UnitNumber = string.Empty;
            string BillingAddress = string.Empty;
            CompanyRegNumber = "2012302456";
            Title = "ASSETS REGISTER";
            if (Assets != null)
            {
                body = RetrieveTemplate("PDFTemplates", "AssetRegister");
                body = AssetItemsBody(body, Assets);
                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    CompanyRegNumber,
                    Title,
                    Assets
                });
            }

            return GeneratePDF(body, "", "", true);
        }

        public byte[] GetWorkFlowReAssignmentPDFTemplate(WorkFlowReAssignment workFlowReAssignmentDetails, CompanyDetails company)
        {
            string workFlowReAssignmentHeader = string.Empty;
            string body = string.Empty;
            string Title = string.Empty;
            string LogoURL = string.Empty;
            string CompanyRegNumber = string.Empty;
            string CurrentApproverName = string.Empty;
            string AlternateApproverName = string.Empty;
            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "WORK FLOW REASSIGNMENT";

            body = RetrieveTemplate("PDFTemplates", "WorkFlowReAssignmentBody");
            body = WorkFlowReAssignmentBody(body, workFlowReAssignmentDetails);

            string CreatedDate = DateTime.Now.ToShortDateString();

            if (workFlowReAssignmentDetails != null)
            {
                CurrentApproverName = workFlowReAssignmentDetails.CurrentApproverUserName;
            }

            if (workFlowReAssignmentDetails != null)
            {
                AlternateApproverName = workFlowReAssignmentDetails.AlternateApproverUserName;
            }

            body = ReplaceTokensInHTMLTemplate(body, new
            {
                CurrentApproverName,
                AlternateApproverName,
                CreatedDate,
                LogoURL,
                CompanyRegNumber,
                Title,
                company.CompanyDescription,
                company.CompanyName,
                company.Address1,
                company.Address2,
                company.Country,
                company.ZipCode,
                company.Fax,
                company.Telephone
            });

            return GeneratePDF(body, workFlowReAssignmentHeader, "");
        }

        public string WorkFlowReAssignmentBody(string receiptHtml, WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            WorkFlowReAssignmentResult workFlowReAssignmentResult = null;
            int count = 0;
            string type = string.Empty;
            if (workFlowReAssignmentDetails != null)
            {
                //WorkFlowItems
                WorkflowItems objWorkFlowItem = null;
                List<WorkflowItems> workFlowItemList = new List<WorkflowItems>();
                if (workFlowReAssignmentDetails.WorkflowItems != null)
                {
                    foreach (var workFlowItem in workFlowReAssignmentDetails.WorkflowItems)
                    {
                        objWorkFlowItem = new WorkflowItems();
                        count++;
                        objWorkFlowItem.SNo = count;

                        objWorkFlowItem.ProcessName = workFlowItem.ProcessName;
                        objWorkFlowItem.DepartmentName = workFlowItem.DepartmentName;
                        objWorkFlowItem.LevelIndex = (workFlowItem.LevelIndex + 1);
                        objWorkFlowItem.RoleName = workFlowItem.RoleName;
                        objWorkFlowItem.CompanyName = workFlowItem.CompanyName;
                        workFlowItemList.Add(objWorkFlowItem);
                    }
                }
                //Docuemnts
                Documents objDocument = null;
                count = 0;
                List<Documents> documentList = new List<Documents>();
                foreach (var document in workFlowReAssignmentDetails.Documents)
                {
                    objDocument = new Documents();
                    count++;
                    document.SNo = count;

                    document.DocumentCode = document.DocumentCode;
                    document.LevelIndex = (document.LevelIndex + 1);
                    document.WorkFlowStatus = document.WorkFlowStatus;
                    documentList.Add(document);
                }

                //User Roles
                Roles objRole = null;
                count = 0;
                List<Roles> rolesList = new List<Roles>();
                foreach (var role in workFlowReAssignmentDetails.UserRoles)
                {
                    objRole = new Roles();
                    count++;
                    objRole.SNo = count;
                    objRole.RoleName = role.RoleName;
                    objRole.CompanyName = role.CompanyName;
                    rolesList.Add(objRole);
                }

                workFlowReAssignmentResult = new WorkFlowReAssignmentResult();
                workFlowReAssignmentResult.WorkflowItems = workFlowItemList;
                workFlowReAssignmentResult.Documents = documentList;
                workFlowReAssignmentResult.UserRoles = rolesList;
            }

            JSONString = JsonConvert.SerializeObject(workFlowReAssignmentResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }


        public string PurchaseOrderRequestBody(string receiptHtml, PurchaseOrderRequest objPurchaseOrderRequest, bool isPurchaseRequest)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            int count = 0;
            int subCount = 0;
            string displayUOM = string.Empty;
            PurchaseOrderItemDetails objItemDetails = null;
            List<PurchaseOrderItemDetails> objItemDetailsList = new List<PurchaseOrderItemDetails>();
            string Currency = objPurchaseOrderRequest.CurrencySymbol;
            string quotationAmount = string.Empty;

            if (objPurchaseOrderRequest.PurchaseOrderRequestItems != null)
            {
                foreach (var item in objPurchaseOrderRequest.PurchaseOrderRequestItems)
                {
                    objItemDetails = new PurchaseOrderItemDetails();
                    if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                    {
                        count++;
                        objItemDetails.ItemId = count.ToString();
                        objItemDetails.ItemName = item.Item.ItemName;
                        objItemDetails.MeasurementUnitCode = item.MeasurementUnitCode;
                        objItemDetails.IsUOM = true;
                    }
                    else if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    {
                        if (Convert.ToBoolean(item.IsDetailed))
                        {
                            subCount++;
                            objItemDetails.ItemId = $"{count.ToString()}{"."} {subCount.ToString()}";
                        }
                        else
                        {
                            count = 0;
                            subCount = 0;
                            count++;
                            objItemDetails.ItemId = count.ToString();
                        }

                        if (item.Item != null)
                        {
                            objItemDetails.ItemName = item.Item.ItemName;
                        }

                        if (item.Asset != null)
                        {
                            objItemDetails.ItemName = item.Asset.AssetName;
                        }

                        objItemDetails.IsUOM = false;
                    }

                    else if (objPurchaseOrderRequest.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                    {
                        count++;
                        objItemDetails.ItemId = count.ToString();
                        objItemDetails.ItemName = item.Expense.Code;
                        objItemDetails.AccountCodeName = item.Expense.AccountCodeName;
                    }

                    objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                    objItemDetails.ItemQty = (int)item.ItemQty;
                    if (isPurchaseRequest)
                    {
                        objItemDetails.Unitprice = $"{item.Unitprice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                        var total = (item.ItemQty * item.Unitprice) + item.TaxTotal;
                        objItemDetails.Total = $"{total.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    }
                    objItemDetails.GstAmount = $"{item.TaxTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstType = item.TaxName;

                    objItemDetailsList.Add(objItemDetails);
                }
            }

            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            purchaseOrderRequestResult = new PurchaseOrderRequestResult();
            purchaseOrderRequestResult.ItemDetails = objItemDetailsList;

            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }


        public string AssetItemsBody(string receiptHtml, List<AssetDetails> assetDetails)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            if (assetDetails != null)
            {
                foreach (var item in assetDetails)
                {
                    if (item.Supplier == null)
                    {
                        item.Supplier = new Supplier { SupplierName = "" };
                    }
                    if (item.Invoice == null)
                    {
                        item.Invoice = new Invoices { InvoiceCode = "" };
                    }
                    item.PurchasedDateString = item.PurchasedDate.ToShortDateString();
                    item.CurrencySymbol = "$";
                }
            }
            AssetDetailsDisplayResult assetDetailsDisplay = new AssetDetailsDisplayResult();
            assetDetailsDisplay.Assets = assetDetails;
            JSONString = JsonConvert.SerializeObject(assetDetailsDisplay);
            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string PreparePDFBody(string html, PDFData data)
        {
            string htmlString = html;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string result = generator.Render(JObject.Parse(JsonConvert.SerializeObject(data)));
            return result;
        }
        public string PrepareAuditTable(string html, AuditLogData data)
        {
            string htmlString = html;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string result = generator.Render(JObject.Parse(JsonConvert.SerializeObject(data)));
            return result;
        }
        public string PrepareInvoicePaymentsTable(string html, InvoicePayments data)
        {
            string htmlString = html;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string result = generator.Render(JObject.Parse(JsonConvert.SerializeObject(data)));
            return result;
        }

        public string PurchaseOrderBody(string receiptHtml, PurchaseOrder purchaseOrderDetails = null, FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null, ContractPurchaseOrder contractPurchaseOrderDetails = null, ExpensesPurchaseOrder expensesPurchaseOrder = null)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            int count = 0;
            int subCount = 0;
            string type = string.Empty;
            if (purchaseOrderDetails != null)
            {
                PurchaseOrderItemDetails objItemDetails = null;
                List<PurchaseOrderItemDetails> objItemDetailsList = new List<PurchaseOrderItemDetails>();
                foreach (var item in purchaseOrderDetails.PurchaseOrderItems)
                {
                    objItemDetails = new PurchaseOrderItemDetails();
                    count++;
                    objItemDetails.ItemId = count.ToString();
                    if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                    {
                        type = "Item";
                        objItemDetails.ItemName = item.Item.ItemName;
                        objItemDetails.ItemCode = item.Item.ItemMasterCode;
                        objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                    }
                    else
                    {
                        type = "Service";
                        objItemDetails.ItemName = "";//item.Service.Code;
                        objItemDetails.ItemCode = "";
                        objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                    }

                    objItemDetails.Type = type;

                    objItemDetails.MeasurementUnitCode = item.MeasurementUnitCode;
                    objItemDetails.ItemQty = (decimal)item.ItemQty;

                    objItemDetails.Discount = $"{item.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.Unitprice = $"{item.Unitprice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    var totalprice = (item.ItemQty * item.Unitprice);
                    objItemDetails.Total = $"{totalprice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";

                    //objItemDetails.Total = $"{item.ItemTotalPrice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstAmount = $"{item.TaxAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstType = item.TaxName;
                    objItemDetailsList.Add(objItemDetails);
                }

                purchaseOrderRequestResult = new PurchaseOrderRequestResult();
                purchaseOrderRequestResult.ItemDetails = objItemDetailsList;
            }

            else if (fixedPurchaseOrderDetails != null)
            {
                FixedAssetPurchaseOrderDetails objFixedAssetDetails = null;
                List<FixedAssetPurchaseOrderDetails> objFixedAssetDetailsList = new List<FixedAssetPurchaseOrderDetails>();
                foreach (var item in fixedPurchaseOrderDetails.PurchaseOrderItems)
                {
                    objFixedAssetDetails = new FixedAssetPurchaseOrderDetails();
                    if (item.IsDetailed)
                    {
                        subCount++;
                        objFixedAssetDetails.ItemId = $"{count.ToString()}{"."} {subCount.ToString()}";
                    }
                    else
                    {
                        subCount = 0;
                        if (count == 0)
                        {
                            count = 0;
                        }
                        count++;
                        objFixedAssetDetails.ItemId = count.ToString();
                    }

                    if (item.TypeId == Convert.ToInt32(FixedAssetTypes.Asset))
                    {
                        type = "Asset";
                        objFixedAssetDetails.AssetName = item.AssetSubCategory.AssetSubcategory;//item.Asset.AssetName;
                        objFixedAssetDetails.AssetCode = item.AssetSubCategory.AccountCode;// item.Asset.AssetCode;
                        objFixedAssetDetails.AssetDescription = EscapeSpecialChar(item.AssetDescription);//item.AssetSubCategory.Description;


                    }
                    else
                    {
                        type = "Service";
                        objFixedAssetDetails.AssetName = "";//item.Service.Code;
                        objFixedAssetDetails.AssetCode = "";
                        objFixedAssetDetails.AssetDescription = EscapeSpecialChar(item.AssetDescription);
                    }

                    objFixedAssetDetails.Type = type;

                    objFixedAssetDetails.AssetQty = (decimal)item.AssetQty;
                    objFixedAssetDetails.Warranty = item.Asset != null ? item.Asset.Warranty : string.Empty;
                    objFixedAssetDetails.Discount = $"{item.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objFixedAssetDetails.Unitprice = $"{item.Unitprice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    var itemtotal = item.AssetQty * item.Unitprice;
                    objFixedAssetDetails.Total = $"{itemtotal.ToString("0,0.0000", CultureInfo.InvariantCulture)}";

                    //objFixedAssetDetails.Total = $"{item.ItemTotalPrice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objFixedAssetDetails.TaxTotal = $"{item.TaxAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";

                    objFixedAssetDetailsList.Add(objFixedAssetDetails);
                }

                purchaseOrderRequestResult = new PurchaseOrderRequestResult();
                purchaseOrderRequestResult.FixedAssetDetails = objFixedAssetDetailsList;
            }

            else if (contractPurchaseOrderDetails != null)
            {
                FixedContractPurchaseOrderDetails objFixedContractDetails = null;
                List<FixedContractPurchaseOrderDetails> objFixedContractDetailsList = new List<FixedContractPurchaseOrderDetails>();
                foreach (var item in contractPurchaseOrderDetails.ContractPurchaseOrderItems)
                {
                    objFixedContractDetails = new FixedContractPurchaseOrderDetails();
                    count++;
                    objFixedContractDetails.ItemId = count.ToString();
                    objFixedContractDetails.Description = EscapeSpecialChar(item.Description);
                    objFixedContractDetails.ExpenseCategory = EscapeSpecialChar(item.ExpenseCategory);
                    objFixedContractDetails.Category = EscapeSpecialChar(item.Expense.AccountCodeName);
                    objFixedContractDetails.Amount = $"{item.Amount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    objFixedContractDetails.PaymentValuation = $"{item.PaymentValuation.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objFixedContractDetailsList.Add(objFixedContractDetails);
                }

                purchaseOrderRequestResult = new PurchaseOrderRequestResult();
                purchaseOrderRequestResult.FixedContractDetails = objFixedContractDetailsList;
            }
            else if (expensesPurchaseOrder != null)
            {
                PurchaseOrderItemDetails objItemDetails = null;
                List<PurchaseOrderItemDetails> objItemDetailsList = new List<PurchaseOrderItemDetails>();
                foreach (var item in expensesPurchaseOrder.PurchaseOrderItems)
                {
                    objItemDetails = new PurchaseOrderItemDetails();
                    count++;
                    objItemDetails.ItemId = count.ToString();
                    objItemDetails.ItemName = "";
                    //objItemDetails.ItemName = item.Expense.Code;
                    objItemDetails.ItemCode = "";
                    objItemDetails.AccountCodeName = item.Expense.AccountCodeName;
                    objItemDetails.MeasurementUnitCode = item.MeasurementUnitCode;
                    objItemDetails.ItemDescription = EscapeSpecialChar(item.ExpensesDescription);
                    objItemDetails.ItemQty = (decimal)item.ExpensesQty;
                    objItemDetails.Discount = $"{item.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.Unitprice = $"{item.Unitprice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    var itemtotal = item.ExpensesQty * item.Unitprice;
                    objItemDetails.Total = $"{itemtotal.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstAmount = $"{item.TaxAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstType = item.TaxName;
                    objItemDetailsList.Add(objItemDetails);
                }

                purchaseOrderRequestResult = new PurchaseOrderRequestResult();
                purchaseOrderRequestResult.ItemDetails = objItemDetailsList;
            }

            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string SupplierInvoiceBody(string receiptHtml, Invoice supplierInvoiceDetails = null)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            SupplierInvoiceRequestResult supplierInvoiceRequestResult = null;
            int count = 0;
            int subCount = 0;
            string type = string.Empty;
            if (supplierInvoiceDetails != null)
            {
                SupplierInvoiceItemDetails objItemDetails = null;
                AuditLogData auditLogData = null;
                List<AuditLogData> auditLogDatas = new List<AuditLogData>();
                List<SupplierInvoiceItemDetails> objItemDetailsList = new List<SupplierInvoiceItemDetails>();
                foreach (var item in supplierInvoiceDetails.InvoiceItems)
                {
                    objItemDetails = new SupplierInvoiceItemDetails();
                    count++;
                    objItemDetails.ItemId = count.ToString();
                    if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                    {
                        type = "Item";
                        objItemDetails.ItemName = item.Item.ItemName;
                        objItemDetails.ItemCode = item.Item.ItemMasterCode;
                        objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                        objItemDetails.AccountCodeName = EscapeSpecialChar(string.IsNullOrEmpty(item.GlDescription) ? item.Item.ItemName : item.GlDescription);
                    }
                    else if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                    {
                        type = "Service";
                        objItemDetails.ItemName = "";//item.Service.Code;
                        objItemDetails.ItemCode = "";
                        objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                        objItemDetails.AccountCodeName = EscapeSpecialChar(item.GlDescription);
                    }

                    else if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Expense))
                    {
                        type = "Expense";
                        objItemDetails.ItemName = "";//item.Service.Code;
                        objItemDetails.ItemCode = "";
                        objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                        objItemDetails.AccountCodeName = EscapeSpecialChar(item.GlDescription);
                    }

                    objItemDetails.Type = type;

                    // objItemDetails.MeasurementUnitCode = item.MeasurementUnitCode;
                    objItemDetails.ItemQty = (decimal)item.ItemQty;

                    objItemDetails.Discount = $"{item.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.Unitprice = $"{item.Unitprice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    //objItemDetails.Total = $"{item.ItemTotalPrice.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstAmount = $"{item.TaxAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    decimal totalbeftax = item.Totalprice.Value;
                    objItemDetails.Total = $"{totalbeftax.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstType = item.TaxName;
                    objItemDetailsList.Add(objItemDetails);
                }

                foreach (var item in supplierInvoiceDetails.AuditLogData)
                {
                    auditLogData = new AuditLogData();
                    auditLogData.Message = item.Message;
                    if (item.AuditChanges != null)
                    {
                        string content = getAuditLogTemplate(item);
                        auditLogData.Message = item.Message + content;
                    }
                    auditLogDatas.Add(auditLogData);
                }
                string paymentDetailsHtml = string.Empty;
                foreach (var item in supplierInvoiceDetails.InvoicePayments.Payments)
                {
                    item.ChequeDatePDF = item.ChequeDate.ToShortDateString();
                    item.PaymentAmountPDF = supplierInvoiceDetails.InvoicePayments.Currency + " " + $"{ item.PaymentAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                }
                if (supplierInvoiceDetails.InvoicePayments.Payments.Count > 0)
                    paymentDetailsHtml = getInvoicePaymentTemplate(supplierInvoiceDetails.InvoicePayments);

                supplierInvoiceRequestResult = new SupplierInvoiceRequestResult();
                supplierInvoiceRequestResult.PaymentDetailsHTML = paymentDetailsHtml;
                supplierInvoiceRequestResult.AuditLogData = auditLogDatas;
                supplierInvoiceRequestResult.ItemDetails = objItemDetailsList;
            }

            JSONString = JsonConvert.SerializeObject(supplierInvoiceRequestResult);
            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string SalesOrderBody(string receiptHtml, SalesOrder salesOrderDetails = null, SalesInvoice salesInvoiceDetails = null)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            int count = 0;
            if (salesOrderDetails != null)
            {
                SalesOrderItemDetails objItemDetails = null;
                List<SalesOrderItemDetails> objItemDetailsList = new List<SalesOrderItemDetails>();
                foreach (var item in salesOrderDetails.SalesOrderItems)
                {
                    objItemDetails = new SalesOrderItemDetails();
                    count++;
                    objItemDetails.ItemId = count.ToString();
                    objItemDetails.ItemName = item.Item.ItemName;
                    objItemDetails.ItemCode = item.Item.ItemMasterCode;
                    objItemDetails.MeasurementUnitCode = item.MeasurementUnitCode;
                    objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                    objItemDetails.ItemQty = (int)item.ItemQty;

                    objItemDetails.Discount = $"{item.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.Unitprice = $"{item.Unitprice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.Total = $"{item.ItemTotalPrice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstAmount = $"{item.TaxTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    objItemDetails.GstType = item.TaxName;
                    objItemDetailsList.Add(objItemDetails);
                }

                purchaseOrderRequestResult = new PurchaseOrderRequestResult();
                purchaseOrderRequestResult.SalesOrderItemDetails = objItemDetailsList;
            }

            if (salesInvoiceDetails != null)
            {
                SalesOrderItemDetails objItemDetails = null;
                List<SalesOrderItemDetails> objItemDetailsList = new List<SalesOrderItemDetails>();
                //foreach (var item in salesInvoiceDetails.SalesInvoiceItems)
                //{
                //    objItemDetails = new SalesOrderItemDetails();
                //    count++;
                //    objItemDetails.ItemId = count.ToString();
                //    objItemDetails.ItemName = EscapeSpecialChar(item.ItemDescription);
                //    objItemDetails.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                //    objItemDetails.ItemQty = (int)item.ItemQty;
                //    objItemDetails.Discount = $"{item.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                //    objItemDetails.Unitprice = $"{item.Unitprice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                //    objItemDetails.Total = $"{item.ItemTotalPrice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                //    objItemDetails.GstAmount = $"{item.TaxTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                //    objItemDetails.GstType = item.TaxName;
                //    objItemDetailsList.Add(objItemDetails);
                //}

                purchaseOrderRequestResult = new PurchaseOrderRequestResult();
                purchaseOrderRequestResult.SalesOrderItemDetails = objItemDetailsList;
            }


            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }


        public string GoodsReceivedNotesBody(string receiptHtml, GoodsReceivedNotes goodsReceivedNoteDetails)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            int count = 0;
            GoodsReceivedNotesDetails objGoodsReceivedNotes = null;
            List<GoodsReceivedNotesDetails> objGoodsReceivedNotesList = new List<GoodsReceivedNotesDetails>();
            foreach (var item in goodsReceivedNoteDetails.ItemsList)
            {
                objGoodsReceivedNotes = new GoodsReceivedNotesDetails();
                count++;
                if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                {
                    objGoodsReceivedNotes.ItemId = count;//item.Item.ItemMasterId;
                    objGoodsReceivedNotes.ItemName = item.Item.ItemName;
                    if (item.ItemDescription != null)
                    {
                        objGoodsReceivedNotes.ItemDescription = ":" + EscapeSpecialChar(item.ItemDescription);
                    }
                }
                else if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                {
                    objGoodsReceivedNotes.ItemId = count;//item.Service.AccountCodeId;
                    objGoodsReceivedNotes.ItemDescription = EscapeSpecialChar(item.ItemDescription);//item.Service.AccountCodeName;                
                }
                else
                {
                    objGoodsReceivedNotes.ItemId = count;
                    objGoodsReceivedNotes.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                }
                objGoodsReceivedNotes.MeasurementUnitCode = item.MeasurementUnitCode;
                objGoodsReceivedNotes.OriginalQty = (decimal)item.OriginalQty;
                objGoodsReceivedNotes.OpenQty = (decimal)item.OpenQty;
                objGoodsReceivedNotes.TotalReceivedQty = (decimal)item.TotalReceivedQty;
                objGoodsReceivedNotes.GRNQty = (decimal)item.GRNQty;
                objGoodsReceivedNotesList.Add(objGoodsReceivedNotes);
            }

            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            purchaseOrderRequestResult = new PurchaseOrderRequestResult();
            purchaseOrderRequestResult.GRNNotesDetails = objGoodsReceivedNotesList;

            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string GoodsReturnedNotesBody(string receiptHtml, GoodsReturnedNotes goodsReturnedNotes)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            int count = 0;

            GoodsReceivedNotesDetails objGoodsReceivedNotes = null;
            List<GoodsReceivedNotesDetails> objGoodsReceivedNotesList = new List<GoodsReceivedNotesDetails>();
            foreach (var item in goodsReturnedNotes.ItemsList)
            {
                count++;
                objGoodsReceivedNotes = new GoodsReceivedNotesDetails();
                if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                {
                    objGoodsReceivedNotes.ItemId = item.Item.ItemMasterId;
                    objGoodsReceivedNotes.ItemName = item.Item.ItemName;
                }
                else if (item.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                {
                    objGoodsReceivedNotes.ItemId = item.Service.AccountCodeId;
                    objGoodsReceivedNotes.ItemName = item.Service.AccountCodeName;
                }
                objGoodsReceivedNotes.ItemDescription = EscapeSpecialChar(item.ItemDescription);
                objGoodsReceivedNotes.MeasurementUnitCode = item.MeasurementUnitCode;
                objGoodsReceivedNotes.OriginalQty = (int)item.OriginalQty;
                objGoodsReceivedNotes.OpenQty = (int)item.OpenQty;
                objGoodsReceivedNotes.TotalReceivedQty = (int)item.TotalReceivedQty;
                objGoodsReceivedNotes.GRNQty = (int)item.RTNQty;
                objGoodsReceivedNotes.ItemId = count;

                objGoodsReceivedNotesList.Add(objGoodsReceivedNotes);
            }

            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            purchaseOrderRequestResult = new PurchaseOrderRequestResult();
            purchaseOrderRequestResult.GRNNotesDetails = objGoodsReceivedNotesList;

            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public byte[] GetSupplierInvoicePDFTemplate(Invoice supplierInvoiceDetails = null, CompanyDetails company = null, List<SupplierContactPerson> SupplierContactPersons = null)
        {
            InvoiceList invoiceList = new InvoiceList();
            string supplierInvoiceHeader = string.Empty;
            string body = string.Empty;
            string LogoURL = string.Empty;
            string Title = string.Empty;
            string CompanyRegNumber = string.Empty;
            string Designation = string.Empty;
            string PurchaseOrderStatusText = string.Empty;
            string POCode = string.Empty;
            decimal total = 0;
            string TotalBeforeGST = string.Empty;
            string TotalBeforeTax = string.Empty;
            string TotalDiscount = string.Empty;
            string GSTAmount = string.Empty;
            // string ContactName = string.Empty;
            // string ContactNumber = string.Empty;
            //string ContactEmail = string.Empty;
            string SupplierSubCode = string.Empty;
            string GSTNumber = string.Empty;
            string style = string.Empty;
            LogoURL = HttpContext.Current.Server.MapPath("~/images/logo.jpg");
            CompanyRegNumber = "2012302456";
            Title = "Supplier Invoice";
            string GstAmount = string.Empty;
            decimal TaxAmount = 0;



            if (supplierInvoiceDetails != null)
            {
                body = RetrieveTemplate("PDFTemplates", "SupplierInvoiceBodyNew");
                //body = RetrieveTemplate("PDFTemplates", "PurchaseOrderInventoryPOBody");
                body = SupplierInvoiceBody(body, supplierInvoiceDetails);
                string subDocType = string.Empty;
                string subDocCode = string.Empty;
                string supplierType = supplierInvoiceDetails.Supplier.SupplierTypeID == 1 ? "UEL Related Supplier" : "External Supplier";
                string IsGstRequired = supplierInvoiceDetails.IsGstRequired ? "Yes" : "No";
                string IsGstBeforeDiscount = supplierInvoiceDetails.IsGstBeforeDiscount ? "Yes" : "No";
                string Currency = supplierInvoiceDetails.CurrencySymbol;
                string SubTotal = $"{supplierInvoiceDetails.SubTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string Discount = $"{supplierInvoiceDetails.Discount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalTax = $"{supplierInvoiceDetails.TotalTax.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string ShippingCharges = $"{supplierInvoiceDetails.ShippingCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string OtherCharges = $"{supplierInvoiceDetails.OtherCharges.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAmount = $"{supplierInvoiceDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string TotalAdjustment = $"{supplierInvoiceDetails.Adjustment.ToString("#,##0.00;(#,##0.00)", CultureInfo.InvariantCulture)}";
                string GSTAdjustment = $"{supplierInvoiceDetails.GSTAdjustment.ToString("#,##0.00;(#,##0.00)", CultureInfo.InvariantCulture)}";
                string NetTotal = $"{supplierInvoiceDetails.NetTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                string CreatedDate = supplierInvoiceDetails.CreatedDate.ToShortDateString();
                TaxAmount = supplierInvoiceDetails.InvoiceItems.Average(x => x.TaxAmount);
                GstAmount = $"{TaxAmount.ToString("0.00", CultureInfo.InvariantCulture)}";
                //string TaxAmount = $"{supplierInvoiceDetails.InvoiceItems.Find.TaxAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                //string ExpectedDeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate.ToShortDateString();
                //  string AmountInWords = "Total Value : Dollars " + supplierInvoiceDetails.AmountinWords;
                //string DeliveryTerm = ReplaceBRwithNewline(purchaseOrderDetails.DeliveryTerm);
                decimal netTotal = 0;
                decimal discountTotal = 0;
                decimal newSubTotalPrice = 0;
                string SubTotalPrice = string.Empty;
                decimal unitprice = 0;
                discountTotal = supplierInvoiceDetails.InvoiceItems.Sum(x => x.Discount);
                netTotal = supplierInvoiceDetails.InvoiceItems.Sum(x => x.TaxTotal);
                total = supplierInvoiceDetails.SubTotal - netTotal;
                if (supplierInvoiceDetails.POTypeId == (int)WorkFlowProcessTypes.ContractPOFixed || supplierInvoiceDetails.POTypeId == (int)WorkFlowProcessTypes.ContractPOVariable)
                {
                    total = supplierInvoiceDetails.SubTotal - discountTotal;
                }
                unitprice = Convert.ToDecimal(supplierInvoiceDetails.InvoiceItems.Sum(x => x.Totalprice));
                TotalBeforeGST = $"{unitprice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalBeforeTax = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                //TotalBeforeGST = $"{total.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                newSubTotalPrice = Convert.ToDecimal(supplierInvoiceDetails.InvoiceItems.Sum(x => x.Totalprice));
                SubTotalPrice = $"{newSubTotalPrice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                GSTAmount = $"{netTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                TotalDiscount = $"{discountTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                if (supplierInvoiceDetails.CurrentApproverUserName != null)
                {
                    PurchaseOrderStatusText = $"{invoiceList.WorkFlowStatusText} {" [" + supplierInvoiceDetails.CurrentApproverUserName + "] "}";
                }
                else
                {
                    PurchaseOrderStatusText = $"{invoiceList.WorkFlowStatusText}";
                }
                if (supplierInvoiceDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.Draft) && supplierInvoiceDetails.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.CancelDraft))
                {
                    POCode = $"{supplierInvoiceDetails.InvoiceCode}";
                }
                else
                {
                    POCode = $"{supplierInvoiceDetails.DraftCode}";
                }

                if (supplierInvoiceDetails.SupplierSubCode != null)
                {
                    SupplierSubCode = $"{supplierInvoiceDetails.SupplierSubCode.SubCode} {" (" + supplierInvoiceDetails.SupplierSubCode.SubCodeDescription + ") "}";
                }
                //if (SupplierContactPersons == null)
                //{
                //    ContactName = supplierInvoiceDetails.ContactPersonName;
                //    ContactNumber = supplierInvoiceDetails.ContactNo;
                //    ContactEmail = purchaseOrderDetails.ContactEmail;
                //}

                GSTNumber = supplierInvoiceDetails.Supplier.GSTNumber;
                if (supplierInvoiceDetails.Supplier.GSTNumber != null)
                {
                    style = "style=" + "display: block" + "";
                    GSTNumber = supplierInvoiceDetails.Supplier.GSTNumber;
                }
                else
                {
                    style = "style=" + "'display: none'" + "";
                }

                if (supplierInvoiceDetails.POTypeId == (int)WorkFlowProcessTypes.ContractPOFixed || supplierInvoiceDetails.POTypeId == (int)WorkFlowProcessTypes.ContractPOVariable)
                {
                    subDocType = "POC";
                    subDocCode = string.Join("  ", supplierInvoiceDetails.InvoiceItems.Select(u => u.CPONumber.ToString()).Distinct().ToArray());
                }
                else
                {
                    subDocType = "GRN";
                    subDocCode = supplierInvoiceDetails.GRNCode;
                }
                body = ReplaceTokensInHTMLTemplate(body, new
                {
                    supplierInvoiceDetails.PurchaseOrderType,
                    supplierInvoiceDetails.RequestedByUserName,
                    //supplierInvoiceDetails.Supplier.BillingAddress1,
                    supplierInvoiceDetails.RequestorEmailID,
                    supplierInvoiceDetails.RequestorContactNo,
                    supplierInvoiceDetails.PurchaseOrderCode,
                    subDocType,
                    subDocCode,
                    supplierInvoiceDetails.RemarksInvoice,
                    supplierInvoiceDetails.InvoiceDateString,
                    supplierInvoiceDetails.SupplierRefNo,
                    supplierInvoiceDetails.InvoiceDescription,
                    NetTotal,
                    TotalBeforeTax,
                    GstAmount,
                    CreatedDate,
                    TotalAdjustment,
                    GSTAdjustment,
                    supplierType,
                    style,
                    GSTNumber,
                    SubTotalPrice,
                    supplierInvoiceDetails.InvoiceCode,
                    //supplierInvoiceDetails.RequestorEmailID,
                    // supplierInvoiceDetails.RequestedByUserName,
                    supplierInvoiceDetails.Location,
                    supplierInvoiceDetails.LocationId,
                    supplierInvoiceDetails.Supplier.SupplierName,
                    // purchaseOrderDetails.Supplier.BillingAddress1,
                    supplierInvoiceDetails.SupplierAddress,
                    supplierInvoiceDetails.DeliveryAddress,
                    supplierInvoiceDetails.Supplier.BillingFax,
                    supplierInvoiceDetails.Supplier.SupplierCode,
                    supplierInvoiceDetails.InvoiceItems.Count,
                    // supplierInvoiceDetails.Location,
                    POCode,
                    // supplierInvoiceDetails.CostOfService,
                    // ExpectedDeliveryDate,
                    // supplierInvoiceDetails.VendorReferences,
                    supplierInvoiceDetails.CurrencyCode,
                    PurchaseOrderStatusText,
                    supplierInvoiceDetails.PaymentTerms,
                    //supplierInvoiceDetails.Reasons,
                    // supplierInvoiceDetails.Instructions,
                    // supplierInvoiceDetails.Justifications,
                    // supplierInvoiceDetails.DeliveryTerm,
                    SubTotal,
                    Discount,
                    ShippingCharges,
                    OtherCharges,
                    TotalAmount,
                    //AmountInWords,
                    TotalBeforeGST,
                    GSTAmount,
                    TotalDiscount,
                    LogoURL,
                    company.CompanyDescription,
                    company.CompanyName,
                    company.Address1,
                    company.Address2,
                    company.Address3,
                    company.Country,
                    company.ZipCode,
                    company.Fax,
                    company.Telephone,
                    company.Website,
                    company.GSTRegistrationNumber,
                    company.CountryName,
                    company.CompanyRegistrationNumber,
                    CompanyRegNumber,
                    Currency,
                    IsGstBeforeDiscount,
                    supplierInvoiceDetails.Designation,
                    IsGstRequired,
                    Title,
                    SupplierSubCode
                    //ContactName,
                    //ContactNumber,
                    //ContactEmail
                });
            }
            string invoiceDocStatus = string.Empty;
            if (supplierInvoiceDetails.WorkFlowStatusId == (int)WorkFlowStatus.Approved ||
                supplierInvoiceDetails.WorkFlowStatusId == (int)WorkFlowStatus.Completed ||
                supplierInvoiceDetails.WorkFlowStatusId == (int)WorkFlowStatus.Exported)
            {
                invoiceDocStatus = string.Empty;
            }
            else
            {
                invoiceDocStatus = supplierInvoiceDetails.WorkFlowStatus;
            }

            return GeneratePDFWithHeaderFooter(body, "", company, Title, POCode, LogoURL, invoiceDocStatus);
        }


        public string CreditNoteBody(string receiptHtml, CreditNote creditNoteDetails)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            int count = 0;
            CreditNoteItemDetails objCreditNoteItem = null;
            List<CreditNoteItemDetails> objCreditNoteItemDetailsList = new List<CreditNoteItemDetails>();
            //foreach (var createdNoteItem in creditNoteDetails.CreditNoteItems)
            //{
            //    count++;
            //    objCreditNoteItem = new CreditNoteItemDetails();
            //    objCreditNoteItem.InvoiceItemId = count;
            //    objCreditNoteItem.ItemDescription = EscapeSpecialChar(createdNoteItem.ItemDescription);
            //    objCreditNoteItem.TaxName = createdNoteItem.TaxName;
            //    objCreditNoteItem.ItemQty = string.Format("{0:0.00}", createdNoteItem.ItemQty);
            //    objCreditNoteItem.UpdatedPrice = $"{createdNoteItem.UpdatedPrice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            //    objCreditNoteItem.Unitprice = $"{createdNoteItem.Unitprice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            //    objCreditNoteItem.TaxAmount = $"{createdNoteItem.TaxAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            //    objCreditNoteItem.TaxTotal = $"{createdNoteItem.TaxTotal.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            //    objCreditNoteItem.ItemTotalPrice = $"{createdNoteItem.ItemTotalPrice.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            //    objCreditNoteItemDetailsList.Add(objCreditNoteItem);
            //}

            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            purchaseOrderRequestResult = new PurchaseOrderRequestResult();
            purchaseOrderRequestResult.CreditNoteItems = objCreditNoteItemDetailsList;

            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string LocationTransferBody(string receiptHtml, LocationTransfer locationTransferDetails)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            int count = 0;
            Items objLocationTransferItem = null;
            List<Items> objLocationTransferItemDetailsList = new List<Items>();
            foreach (var inventoryItem in locationTransferDetails.SelectedItemDetails)
            {
                count++;
                objLocationTransferItem = new Items();
                objLocationTransferItem.LocationTransferDetailId = count;
                objLocationTransferItem.ItemMasterCode = inventoryItem.ItemMasterCode;
                objLocationTransferItem.Name = inventoryItem.Name;
                objLocationTransferItem.LocationName = inventoryItem.LocationName;
                objLocationTransferItem.ItemTypeName = inventoryItem.ItemTypeName;
                objLocationTransferItem.ItemCategoryName = inventoryItem.ItemCategoryName;
                objLocationTransferItem.Manufacturer = inventoryItem.Manufacturer;
                objLocationTransferItem.Brand = inventoryItem.Brand;
                objLocationTransferItem.UOMName = inventoryItem.UOMName;
                objLocationTransferItem.StockInhand = inventoryItem.StockInhand;
                objLocationTransferItem.Quantity = inventoryItem.Quantity;
                objLocationTransferItemDetailsList.Add(objLocationTransferItem);
            }

            LocationTransfer locationTransferResult = null;
            locationTransferResult = new LocationTransfer();
            locationTransferResult.SelectedItemDetails = objLocationTransferItemDetailsList;

            JSONString = JsonConvert.SerializeObject(locationTransferResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string PaymentVoucherBody(string receiptHtml, SupplierPayment supplierPaymentDetails = null, CustomerPayment customerPaymentDetails = null)
        {
            string htmlString = receiptHtml;
            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(htmlString);
            string JSONString = string.Empty;
            int count = 0;
            InvoiceDetails invoiceDetails = null;
            List<InvoiceDetails> invoiceDetailList = new List<InvoiceDetails>();
            if (supplierPaymentDetails != null)
            {
                foreach (var invoice in supplierPaymentDetails.SupplierInvoiceDetails)
                {
                    count++;
                    invoiceDetails = new InvoiceDetails();
                    invoiceDetails.InvoiceId = count;
                    invoiceDetails.InvoiceNumber = invoice.InvoiceNo;
                    invoiceDetails.PayableAmount = $"{invoice.PaymentAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    invoiceDetailList.Add(invoiceDetails);
                }
            }
            if (customerPaymentDetails != null)
            {
                foreach (var invoice in customerPaymentDetails.CustomerInvoiceDetails)
                {
                    count++;
                    invoiceDetails = new InvoiceDetails();
                    invoiceDetails.InvoiceId = count;
                    invoiceDetails.InvoiceNumber = invoice.InvoiceNo;
                    invoiceDetails.PayableAmount = $"{invoice.PaymentAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
                    invoiceDetailList.Add(invoiceDetails);
                }
            }

            PurchaseOrderRequestResult purchaseOrderRequestResult = null;
            purchaseOrderRequestResult = new PurchaseOrderRequestResult();
            purchaseOrderRequestResult.InvoiceDetails = invoiceDetailList;

            JSONString = JsonConvert.SerializeObject(purchaseOrderRequestResult);

            JObject jsonData = JObject.Parse(JSONString);
            string result = generator.Render(jsonData);
            return result;
        }

        public string RetrieveTemplate(string folderName, string templateName)
        {
            var filePath1 = Path.Combine($"{folderName}\\{templateName}.html");
            var filePath = System.Web.Hosting.HostingEnvironment.MapPath("~/" + filePath1);
            using (var rdr = System.IO.File.OpenText(filePath))
            {
                return rdr.ReadToEnd();
            }
        }

        public string ReplaceTokensInHTMLTemplate(string htmlTemplate, PDFData obj)
        {
            string data = JsonConvert.SerializeObject(obj);
            Dictionary<string, object> Items = JsonConvert.DeserializeObject<Dictionary<string, object>>(data);
            foreach (var property in obj.GetType().GetProperties())
            {
                var stringToReplace = $"[[{property.Name}]]";
                var value = property.GetValue(obj) ?? "";
                htmlTemplate = htmlTemplate.Replace(stringToReplace, EscapeSpecialChar(value.ToString()));
            }
            return htmlTemplate;
        }

        public string ReplaceTokensInHTMLTemplate<T>(string htmlTemplate, T obj)
        {
            foreach (var property in obj.GetType().GetProperties())
            {
                var stringToReplace = $"[[{property.Name}]]";
                var value = property.GetValue(obj) ?? "";
                htmlTemplate = htmlTemplate.Replace(stringToReplace, EscapeSpecialChar(value.ToString()));
            }
            return htmlTemplate;
        }

        public static string EscapeSpecialChar(string value)
        {
            return HttpUtility.HtmlEncode(value);
        }

        public static string HasSpecialChar(string input)
        {
            string[] chars = new string[] { "<", ">" };
            for (int i = 0; i < chars.Length; i++)
            {
                if (input.Contains(chars[i]))
                {
                    input = input.Replace(chars[i], "");
                }
            }

            return input;
        }

    }
}


