using System;
using System.Configuration;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class CreditNoteEmailProvider
    {
        public static bool SendCreditNoteRequestMail(int documentId, string type, CreditNote creditNoteDetails, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(creditNoteDetails, approverDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject();
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["CreditNoteRequestApproval"]) + "?id=" + documentId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendCreditNoteRequestApprovalMail(CreditNote creditNoteDetails, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(creditNoteDetails, approverDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$CreditNoteId", creditNoteDetails.CreditNoteId.ToString());
            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["CreditNoteRequest"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{creditNoteDetails.CreditNoteCode} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{creditNoteDetails.CreditNoteCode} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["CreditNoteRequestApproval"]);
                subject = $"{type}{" : "}{creditNoteDetails.CreditNoteCode} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + creditNoteDetails.CreditNoteId);
            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject()
        {
            string subject = string.Empty;
            return "Credit Note Request";
        }

        private static string PrepareMailBody(CreditNote creditNoteDetails, UserProfile approverDetails, string type = null)
        {
            string mailmessage = string.Empty;
            string creditNoteItems = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/CreditNoteRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", creditNoteDetails.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/CreditNoteApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", creditNoteDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }
            int i = 0;
            //foreach (var data in creditNoteDetails.CreditNoteItems)
            //{
            //    i++;
            //    creditNoteItems = $"{ creditNoteItems } <tr><td>{ i }</td><td>{ data.ItemDescription }</td><td>{ data.ItemQty}</td><td>{ data.ReturnQuantity }</td></tr>";
            //}
            //mailmessage = mailmessage.Replace("$$Supplier", Convert.ToString(creditNoteDetails.Supplier.SupplierName));
            //mailmessage = mailmessage.Replace("$$CreditNoteCode", creditNoteDetails.CreditNoteCode);
            //mailmessage = mailmessage.Replace("$$InvoiceCode", creditNoteDetails.InvoiceCode);
            //mailmessage = mailmessage.Replace("$$InvoiceTotal", Convert.ToString(creditNoteDetails.InvoiceTotal));
            //mailmessage = mailmessage.Replace("$$OutStandingAmount", Convert.ToString(creditNoteDetails.OutStandingAmount));
            //mailmessage = mailmessage.Replace("$$WorkFlowStatus", Convert.ToString(creditNoteDetails.WorkFlowStatus));
            //mailmessage = mailmessage.Replace("$$ItemsDetails", creditNoteItems);
            return mailmessage;
        }
    }
}
