using System;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class InvoiceEmailProvider
    {
        public static bool SendInvoiceRequestMail(int documentId, string docType, string companyShortName, string type, Invoice invoice, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(invoice, approverDetails, invoice.WorkFlowStatus);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject = PrepareSubject(companyShortName, docType, invoice.InvoiceCode, invoice.WorkFlowStatus, invoice.Supplier.SupplierShortName);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["InvoiceRequestApproval"]) + "?id=" + documentId + "&cid=" + invoice.CompanyId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static bool SendInvoiceRecallApprovalMail(Invoice objInvoice, string companyShortName, string supplierShortName, string status)
        {
            string mailmessage = string.Empty;
            string subject = PrepareSubject(companyShortName, "INV", objInvoice.InvoiceCode, "Recall", supplierShortName);
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/InvoiceRecallApprovalEmail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            mailmessage = mailmessage.Replace("$$InvoiceRequestNumber", Convert.ToString(objInvoice.InvoiceCode));
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", objInvoice.CurrencySymbol);
            mailmessage = mailmessage.Replace("$$PurchaseOrderType", string.IsNullOrEmpty(objInvoice.PurchaseOrderType) ? "Without PO" : objInvoice.PurchaseOrderType);
            mailmessage = mailmessage.Replace("$$Supplier", objInvoice.SupplierName);
            mailmessage = mailmessage.Replace("$$TotalAmount", $"{objInvoice.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}");
            mailmessage = mailmessage.Replace("$$CreatedDate", Convert.ToString(objInvoice.CreatedDate.ToString("dd-MM-yyyy")));
            mailmessage = mailmessage.Replace("$$Name", objInvoice.CurrentApproverUserName);
            mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(objInvoice.CreatedByUserName));
            mailmessage = mailmessage.Replace("$$MailTitle", "Invoice Approval Recall");
            mailmessage = mailmessage.Replace("$$MailSubTitle", "Invoice Approval Recall".ToUpper());
            mailmessage = mailmessage.Replace("$$Status", Convert.ToString(WorkFlowStatus.CancelledApproval));

            return MailHelper.SendEmail(objInvoice.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendInvoiceRequestApprovalMail(string companyShortName, string docType, Invoice invoice, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(invoice, approverDetails, status, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$InvoiceId", invoice.InvoiceId.ToString());
            string siteLogin = string.Empty;
            if (status.ToString().Trim().ToLower() == "approved")
            {
                //subject = $"{type}{" : "}{invoice.InvoiceCode} {" is"} {status}";
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["InvoiceRequest"]);
                mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + invoice.InvoiceId + "&cid=" + invoice.CompanyId);
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                //subject = $"{type}{" : "}{invoice.InvoiceCode} {" is"} {status}";
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["InvoiceRequest"]);
                mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + invoice.InvoiceId + "&cid=" + invoice.CompanyId);
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["InvoiceRequestApproval"]);
                subject = $"{type}{" : "}{invoice.InvoiceCode} {" is waiting for your Approval"}";
                mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + invoice.InvoiceId + "&cid=" + invoice.CompanyId);
            }
            subject = PrepareSubject(companyShortName, docType, invoice.InvoiceCode, invoice.WorkFlowStatus, invoice.Supplier.SupplierShortName);
            mailmessage = mailmessage.Replace("$$subject", subject);
            //mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + invoice.InvoiceCode);

            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject(string companyShortName, string docType, string docCode, string docStatus, string SupplierShortName)
        {
            string subject = string.Empty;
            string supplierStatus = string.Empty;
            subject = companyShortName == "" ? "" : companyShortName + " / ";
            subject += $"{ docType }{" : "}{ docCode } {" / "}";
            subject += SupplierShortName == "" ? "" : SupplierShortName == null ? "" : SupplierShortName + " / ";
            if (docStatus.Contains("["))
            {
                docStatus = docStatus.Split('[')[0];
            }
            subject += docStatus.ToString().Trim().ToLower() == "open" ? "Approved" : docStatus;
            return subject;
        }

        private static string PrepareMailBody(Invoice invoice, UserProfile approverDetails, string status, string type = null)
        {
            string mailmessage = string.Empty;
            string itemsListDetails = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/InvoiceRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName + " " + approverDetails.LastName);
                mailmessage = mailmessage.Replace("$$Sender", invoice.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/InvoiceApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", invoice.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName + " " + approverDetails.LastName);
            }
            int i = 0;
            string code = string.Empty;
            foreach (var data in invoice.InvoiceItems)
            {
                i++;
                code = string.Empty;
                if (data.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable) || data.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed))
                {
                    if (data.CPONumber != "")
                    {
                        code = data.CPONumber;
                    }
                    else
                    {
                        code = "N/A";
                    }
                    mailmessage = mailmessage.Replace("$$TitlePO", "POC ID");
                    mailmessage = mailmessage.Replace("$$poTitleShow", "block");

                    itemsListDetails = $"{ itemsListDetails } <tr><td>{ i }</td><td>{ data.ItemType }</td><td>{ code}</td>" +
                    $"<td>{ data.ItemDescription }</td><td>{ data.Unitprice.ToString("0,0.0000", CultureInfo.InvariantCulture) }</td></tr>";
                }
                else
                {
                    if (invoice.InvoiceTypeId == 1)
                    {
                        if (data.PurchaseOrderCode != "")
                        {
                            code = data.PurchaseOrderCode;
                        }
                        mailmessage = mailmessage.Replace("$$TitlePO", "PO Number");
                        mailmessage = mailmessage.Replace("$$poTitleShow", "block");
                        itemsListDetails = $"{ itemsListDetails } <tr><td>{ i }</td><td>{ data.ItemType }</td><td>{ code}</td>" +
                     $"<td>{ data.ItemDescription }</td><td>{ data.ItemTotalPrice.ToString("0,0.0000", CultureInfo.InvariantCulture) }</td></tr>";

                    }
                    else
                    {

                        mailmessage = mailmessage.Replace("<th style=\"color:#2672ec;display:$$poTitleShow\">$$TitlePO</th>", "");
                        itemsListDetails = $"{ itemsListDetails } <tr><td>{ i }</td><td>{ getItemType(data.TypeId) }</td>" +
                     $"<td>{ data.ItemDescription }</td><td>{ data.ItemTotalPrice.ToString("0,0.0000", CultureInfo.InvariantCulture) }</td></tr>";

                    }

                }
            }
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", invoice.CurrencySymbol);
            mailmessage = mailmessage.Replace("$$Supplier", Convert.ToString(invoice.Supplier.SupplierName));
            mailmessage = mailmessage.Replace("$$InvoiceCode", invoice.InvoiceCode);
            mailmessage = mailmessage.Replace("$$PurchaseOrderCode", Convert.ToString(invoice.PurchaseOrderCode));
            mailmessage = mailmessage.Replace("$$TotalAmount", invoice.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture));
            if (invoice.WorkFlowStatusId == 13 && invoice.InvoiceTypeId == 2)
            {
                mailmessage = mailmessage.Replace("$$poWorkflowShow", "none");

            }
            else
            {
                mailmessage = mailmessage.Replace("$$WorkFlowStatus", Convert.ToString(invoice.WorkFlowStatus));
                mailmessage = mailmessage.Replace("$$poWorkflowShow", "block");
            }
            mailmessage = mailmessage.Replace("$$CreatedDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", invoice.CreatedDate)));
            mailmessage = mailmessage.Replace("$$PaymentTerms", Convert.ToString(invoice.PaymentTerms));
            //mailmessage = mailmessage.Replace("$$DraftCode", Convert.ToString(invoice.DraftCode));
            mailmessage = mailmessage.Replace("$$itemsListDetails", itemsListDetails);
            mailmessage = mailmessage.Replace("$$Status", status);
            return mailmessage;
        }

        private static string getItemType(int typeId)
        {
            return typeId == 1 ? "Item" : typeId == 2 ? "Service" : "Expense";
        }
    }
}
