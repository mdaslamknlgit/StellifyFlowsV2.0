using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Util.PdfGenerator;

namespace UELPM.Util.Email
{
    public class GenericEmailProvider
    {
        public static Tuple<string, string> GetMailHeader(DocumentMailData mailData)
        {
            string Header1 = string.Empty;
            string Header2 = string.Empty;
            switch (mailData.WFStatusId)
            {

                case (int)WorkFlowStatus.ApprovalInProgress:
                    if (string.IsNullOrEmpty(mailData.ChatRemarks))
                        Header1 = string.Format("{0} is waiting for approval.", mailData.MailTitle);
                    else
                        Header1 = string.Format("Reply for clarifications for {0} approval.", mailData.MailTitle);

                    Header2 = string.Format("{0} Details:", mailData.MailTitle);
                    break;

                case (int)WorkFlowStatus.AskedForClarification:
                    Header1 = string.Format("Clarifications for {0} approval.", mailData.MailTitle);
                    Header2 = string.Format("{0} Details:", mailData.MailTitle);
                    break;

                case (int)WorkFlowStatus.Completed:
                    Header1 = string.Format("{0} : {1} has been Approved.", mailData.MailTitle, mailData.DocumentCode);
                    Header2 = string.Format("{0} Details:", mailData.MailTitle);
                    break;

                case (int)WorkFlowStatus.CancelledApproval:
                    Header1 = string.Format("Request for Approval of {0} {1} has been Recalled.", mailData.MailTitle, mailData.DocumentCode);
                    Header2 = string.Format("{0} Details:", mailData.MailTitle);
                    break;

                case (int)WorkFlowStatus.Rejected:
                    Header1 = string.Format("{0} : {1} has been Rejected.", mailData.MailTitle, mailData.DocumentCode);
                    Header2 = string.Format("{0} Details:", mailData.MailTitle);
                    break;

                default:
                    Header2 = "Request for {0} Approval details are given below,";
                    break;
            }
            return Tuple.Create(Header1, Header2);
        }
        public static Tuple<string, string> GetCustomerMasterMailHeader(DocumentMailData mailData)
        {
            string Header1 = string.Empty;
            string Header2 = "Customer Details : ";
            switch (mailData.WFStatusId)
            {
                case (int)WorkFlowStatus.ApprovalInProgress:
                    if (string.IsNullOrEmpty(mailData.ChatRemarks))
                        Header1 = "Request for Customer ID creation.";
                    else
                        Header1 = "There are replies to clarifications for Customer creation.";
                    break;

                case (int)WorkFlowStatus.AskedForClarification:
                    Header1 = "There are clarifications for Customer creation.";
                    break;

                case (int)WorkFlowStatus.Approved:
                    Header1 = "Customer is created.";
                    break;

                case (int)WorkFlowStatus.CancelledApproval:
                    Header1 = "Request for Customer creation has been recalled.";
                    break;

                case (int)WorkFlowStatus.Rejected:
                    Header1 = "Customer creation is rejected.";
                    break;

                default:
                    break;
            }
            return Tuple.Create(Header1, Header2);
        }
        public static Tuple<string, string> GetSalesQuotationMailHeader(DocumentMailData mailData)
        {
            string Header1 = string.Empty;
            string Header2 = "Sales Quotation (SQ) details:";
            switch (mailData.WFStatusId)
            {

                case (int)WorkFlowStatus.ApprovalInProgress:
                    if (string.IsNullOrEmpty(mailData.ChatRemarks))
                        Header1 = "New Sales Quotation is waiting for approval/verification.";
                    else
                        Header1 = "There are replies to clarifications for Sales Quotation.";
                    break;

                case (int)WorkFlowStatus.AskedForClarification:
                    Header1 = "There are clarifications for Sales Quotation.";
                    break;

                case (int)WorkFlowStatus.Approved:
                    Header1 = "Sales Quotation is approved.";
                    break;

                case (int)WorkFlowStatus.CancelledApproval:
                    Header1 = "Request for Sales Quotation has been recalled.";
                    break;

                case (int)WorkFlowStatus.Rejected:
                    Header1 = "Sales Quotation is rejected.";
                    break;

                default:
                    Header2 = "Request for {0} Approval details are given below,";
                    break;
            }
            return Tuple.Create(Header1, Header2);
        }
        public static Tuple<string, string> GetSalesInvoiceMailHeader(DocumentMailData mailData)
        {
            string Header1 = string.Empty;
            string Header2 = "Sales Invoice (SI) details:";
            switch (mailData.WFStatusId)
            {

                case (int)WorkFlowStatus.ApprovalInProgress:
                    if (string.IsNullOrEmpty(mailData.ChatRemarks))
                        Header1 = "New Sales Invoice is waiting for approval/verification.";
                    else
                        Header1 = "There are replies to clarifications for Sales Invoice.";
                    break;

                case (int)WorkFlowStatus.AskedForClarification:
                    Header1 = "There are clarifications for Sales Invoice.";
                    break;

                case (int)WorkFlowStatus.Open:
                    Header1 = "Sales Invoice is approved.";
                    break;

                case (int)WorkFlowStatus.CancelledApproval:
                    Header1 = "Request for Sales Invoice has been recalled.";
                    break;

                case (int)WorkFlowStatus.Rejected:
                    Header1 = "Sales Invoice is rejected.";
                    break;

                default:
                    Header2 = "Request for {0} Approval details are given below,";
                    break;
            }
            return Tuple.Create(Header1, Header2);
        }
        public static bool SendRecallApprovalMail(DocumentMailData mailData)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string docType = string.Empty;
            var mailTemplatepath = System.Web.Hosting.HostingEnvironment.MapPath(mailData.MailTemplatepath);
            subject = PrepareSubject(mailData);
            StreamReader srEmailInfo = new StreamReader(mailTemplatepath);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            if (mailData.DocumentSubjectCode == "SS")
            {
                mailmessage = mailmessage.Replace("$$SupplierCode", mailData.Supplier.SupplierCode);
                mailmessage = mailmessage.Replace("$$SupplierName", mailData.Supplier.SupplierName);
                mailmessage = mailmessage.Replace("$$CategoryName", mailData.Supplier.CategoryName);
                mailmessage = mailmessage.Replace("$$CreatedDate", Convert.ToDateTime(mailData.Supplier.CreatedDate).ToString("dd/MM/yyyy", CultureInfo.InvariantCulture));
                mailmessage = mailmessage.Replace("$$CategoryName", mailData.Supplier.CategoryName);
            }
            mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", mailData.Receiver.FirstName, mailData.Receiver.LastName));
            mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", mailData.Sender.FirstName, mailData.Sender.LastName));
            mailmessage = mailmessage.Replace("$$DocumentCode", Convert.ToString(mailData.DocumentCode));
            mailmessage = mailmessage.Replace("$$Supplier", mailData.Supplier == null ? "" : mailData.Supplier.SupplierName);
            mailmessage = mailmessage.Replace("$$DocumentValue", String.Format("{0:N}", Convert.ToDecimal(mailData.DocumentValue)));
            mailmessage = mailmessage.Replace("$$Status", mailData.DocumentStatus);
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", mailData.DocumentCurrencySymbol);
            return MailHelper.SendEmail(mailData.Receiver.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject(DocumentMailData mailData)
        {
            string subject = mailData.CompanyShortName == "" ? "" : mailData.CompanyShortName + " / ";
            string docStatus = mailData.DocumentStatus;
            subject += $"{ mailData.DocumentSubjectCode }{" : "}{ mailData.DocumentCode } {" / "}";
            if (mailData.Supplier != null)
            {
                subject += mailData.Supplier.SupplierShortName == "" ? "" : mailData.Supplier.SupplierShortName == null ? "" : mailData.Supplier.SupplierShortName + " / ";
            }
            if (mailData.CustomerShortName != null && mailData.DocumentSubjectCode == "SQ")
            {
                subject += mailData.CustomerShortName == "" ? "" : mailData.CustomerShortName == null ? "" : mailData.CustomerShortName + " / ";
            }
            if (docStatus.Contains("["))
            {
                docStatus = docStatus.Split('[')[0];
            }
            subject += docStatus;
            return subject;
        }

        public static object SendReturnForClarificationMail(DocumentMailData mailData)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            var mailTemplatepath = System.Web.Hosting.HostingEnvironment.MapPath(mailData.MailTemplatepath);
            subject = PrepareSubject(mailData);
            StreamReader srEmailInfo = new StreamReader(mailTemplatepath);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", mailData.Sender.FirstName, mailData.Sender.LastName));
            mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", mailData.Receiver.FirstName, mailData.Receiver.LastName));
            mailmessage = mailmessage.Replace("$$DocumentCode", Convert.ToString(mailData.DocumentCode));
            mailmessage = mailmessage.Replace("$$AmountHeaderText", mailData.AmountHeaderText);
            mailmessage = mailmessage.Replace("$$Supplier", mailData.Supplier == null ? "" : mailData.Supplier.SupplierName);
            mailmessage = mailmessage.Replace("$$DocumentValue", String.Format("{0:N}", Convert.ToDecimal(mailData.DocumentValue)));
            mailmessage = mailmessage.Replace("$$Clarification", mailData.Clarification);
            mailmessage = mailmessage.Replace("$$SiteLogin", mailData.MailLink);
            mailmessage = mailmessage.Replace("$$MailTitle", mailData.MailTitle);
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", mailData.DocumentCurrencySymbol);
            return MailHelper.SendEmail(mailData.Sender.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static object SendReplyForClarificationMail(DocumentMailData mailData)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            var mailTemplatepath = System.Web.Hosting.HostingEnvironment.MapPath(mailData.MailTemplatepath);
            subject = PrepareSubject(mailData);
            StreamReader srEmailInfo = new StreamReader(mailTemplatepath);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", mailData.Receiver.FirstName, mailData.Receiver.LastName));
            mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", mailData.Sender.FirstName, mailData.Sender.LastName));
            mailmessage = mailmessage.Replace("$$DocumentCode", Convert.ToString(mailData.DocumentCode));
            mailmessage = mailmessage.Replace("$$AmountHeaderText", mailData.AmountHeaderText);
            mailmessage = mailmessage.Replace("$$Supplier", mailData.Supplier == null ? "" : mailData.Supplier.SupplierName);
            mailmessage = mailmessage.Replace("$$DocumentValue", String.Format("{0:N}", Convert.ToDecimal(mailData.DocumentValue)));
            mailmessage = mailmessage.Replace("$$Clarification", mailData.Clarification);
            mailmessage = mailmessage.Replace("$$SiteLogin", mailData.MailLink);
            mailmessage = mailmessage.Replace("$$MailTitle", mailData.MailTitle);
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", mailData.DocumentCurrencySymbol);
            return MailHelper.SendEmail(mailData.Receiver.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static bool SendWorkflowEmailNotification(DocumentMailData mailData)
        {
            string mailmessage = ReadHtml.RetrieveTemplate("EmailTemplates", mailData.MailTemplatepath);
            string subject = PrepareSubject(mailData);
            Tuple<string, string> header;
            if (mailData.ProcessId == (int)WorkFlowProcessTypes.CustomerMaster)
                header = GetCustomerMasterMailHeader(mailData);
            else if (mailData.ProcessId == (int)WorkFlowProcessTypes.SalesQuotation)
                header = GetSalesQuotationMailHeader(mailData);
            else if (mailData.ProcessId == (int)WorkFlowProcessTypes.SalesInvoice)
                header = GetSalesInvoiceMailHeader(mailData);
            else
                header = GetMailHeader(mailData);
            mailData.Header1 = string.Format(header.Item1, mailData.MailTitle, mailData.DocumentCode);
            mailData.Header2 = string.Format(header.Item2, mailData.MailTitle);
            mailData.ChatRemarks = GetChatRemarks(mailData);
            mailData.LinkCssClass = SetURLLinkClass(mailData);
            mailmessage = StringOperations.EmailBody.PrepareBodyFromHtml(mailmessage, mailData);
            return MailHelper.SendEmail(mailData.Receiver.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string SetURLLinkClass(DocumentMailData mailData)
        {
            string linkCssClass = string.Empty;
            switch (mailData.WFStatusId)
            {
                case (int)WorkFlowStatus.CancelledApproval:
                    linkCssClass = "hideContent";
                    break;

                default:
                    linkCssClass = string.Empty;
                    break;
            }
            return linkCssClass;
        }

        private static string GetChatRemarks(DocumentMailData mailData)
        {
            string remarks = string.Empty;
            switch (mailData.WFStatusId)
            {

                case (int)WorkFlowStatus.ApprovalInProgress:
                    if (string.IsNullOrEmpty(mailData.ChatRemarks))
                        remarks = string.Empty;
                    else
                        remarks = string.Format("Reply for Clarifications : {0}", mailData.ChatRemarks);
                    break;

                case (int)WorkFlowStatus.AskedForClarification:
                    if (string.IsNullOrEmpty(mailData.ChatRemarks))
                        remarks = string.Empty;
                    else
                        remarks = string.Format("Clarifications Remarks : {0}", mailData.ChatRemarks);
                    break;

                default:
                    remarks = string.Empty;
                    break;
            }
            return remarks;
        }
    }
}
