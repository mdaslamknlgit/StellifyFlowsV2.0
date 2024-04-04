using System;
using System.Configuration;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class SalesOrderEmailProvider
    {       
        public static void SendSalesOrderApprovalMail(SalesOrderRequestMail salesOrderRequestMail, string type, string status, string previousApproverStatus)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(salesOrderRequestMail, status);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());

            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{salesOrderRequestMail.RequestCode} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{salesOrderRequestMail.RequestCode} {" is"} {status}";
            }
            else
            {
                subject = $"{type}{" : "}{salesOrderRequestMail.RequestCode} {" is waiting for your Approval"}";
            }

            subject += PrepareSubject(salesOrderRequestMail.CustomerName, salesOrderRequestMail.Department);

            MailHelper.SendEmail(salesOrderRequestMail.SenderEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }  

        public static bool SendSalesOrderMail(SalesOrderRequestMail salesOrderRequestMail, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(salesOrderRequestMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());

            subject = $"{type}{" : "}{salesOrderRequestMail.RequestCode} {" details"}";
            subject += PrepareSubject(salesOrderRequestMail.Customer, salesOrderRequestMail.Department);

            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SalesOrderApproval"]) + "?type=" + "approval" + "&&id=" + salesOrderRequestMail.RequestId);
            return MailHelper.SendEmail(salesOrderRequestMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendSalesOrderClarificationMail(SalesOrderClarificationMail salesOrderClarficationMail, string type)
        {
            string mailmessage = string.Empty;
            mailmessage = PrepareClarificationMailBody(salesOrderClarficationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);          
            mailmessage = mailmessage.Replace("$$OrderNumber", salesOrderClarficationMail.SalesOrderNumber);

            //MailHelper.SendEmail(salesOrderClarficationMail.RequesterEmail, salesOrderClarficationMail.ApproverEmail, "", "", "Mail for Sales Order Clarification", mailmessage, MailPriority.Normal, null);
            MailHelper.SendEmail(salesOrderClarficationMail.RequesterEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", "Mail for Sales Order Clarification", mailmessage, MailPriority.Normal, null);
        }    

        public static void SendSalesOrderReplyMail(SalesOrderClarificationMail salesOrderClarficationMail, string type)
        {
            string mailmessage = string.Empty;
            mailmessage = PrepareReplyMailBody(salesOrderClarficationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);         
            mailmessage = mailmessage.Replace("$$OrderNumber", salesOrderClarficationMail.SalesOrderNumber);
            //MailHelper.SendEmail(salesOrderClarficationMail.ApproverEmail, salesOrderClarficationMail.RequesterEmail, "", "", "Reply Mail for Sales Order Clarification", mailmessage, MailPriority.Normal, null);
            MailHelper.SendEmail(salesOrderClarficationMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", "Reply Mail for Sales Order Clarification", mailmessage, MailPriority.Normal, null);
        }         

        private static string PrepareMailBody(SalesOrderRequestMail salesOrderRequestMail, string type = null)
        {
            string mailmessage = string.Empty;
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/SalesOrderMail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", salesOrderRequestMail.ApproverName);
                mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(salesOrderRequestMail.SenderName));
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/SalesOrderApprovalMail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();

                mailmessage = mailmessage.Replace("$$Name", Convert.ToString(salesOrderRequestMail.SenderName));
                mailmessage = mailmessage.Replace("$$Sender", salesOrderRequestMail.ApproverName);
            }

            mailmessage = mailmessage.Replace("$$SalesOrderNumber", Convert.ToString(salesOrderRequestMail.RequestCode));           
            mailmessage = mailmessage.Replace("$$Customer", salesOrderRequestMail.CustomerName);
            mailmessage = mailmessage.Replace("$$Type", salesOrderRequestMail.CustomerType);
            mailmessage = mailmessage.Replace("$$TotalAmount", salesOrderRequestMail.TotalAmount);
            mailmessage = mailmessage.Replace("$$DeliveryDate", Convert.ToString(salesOrderRequestMail.DeliveryDate.ToString("dd-MM-yyyy")));
            return mailmessage;
        }

        private static string PrepareClarificationMailBody(SalesOrderClarificationMail salesOrderClarficationMail)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderRequestClarificationMail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();

            mailmessage = mailmessage.Replace("$$Name", salesOrderClarficationMail.RequesterName);
            mailmessage = mailmessage.Replace("$$Clarification", salesOrderClarficationMail.ApproverComments);
            mailmessage = mailmessage.Replace("$$sender", salesOrderClarficationMail.ApproverName);
            return mailmessage;
        }

        private static string PrepareReplyMailBody(SalesOrderClarificationMail salesOrderClarficationMail)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/PurchaseOrderClarificationReplyMail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();

            mailmessage = mailmessage.Replace("$$Name", salesOrderClarficationMail.ApproverName);
            mailmessage = mailmessage.Replace("$$Reply", salesOrderClarficationMail.ApproverComments);
            mailmessage = mailmessage.Replace("$$sender", salesOrderClarficationMail.RequesterName);
            return mailmessage;
        }

        private static string PrepareSubject(string customerName, string department)
        {
            string subject = string.Empty;

            if ((!string.IsNullOrEmpty(customerName) && (!string.IsNullOrEmpty(department))))
            {
                subject += $"{" ("} {" Customer: " } {"'" + customerName + "', "}{" Department: " } {"'" + department + "'"}{" )"}";
            }

            else if ((!string.IsNullOrEmpty(customerName) && (string.IsNullOrEmpty(department))))
            {
                subject += $"{" ("} {" Customer: " } {"'" + customerName + "'"}{" )"}";
            }
            else if ((string.IsNullOrEmpty(customerName) && (!string.IsNullOrEmpty(department))))
            {
                subject += $"{" ("} {" Department: " } {"'" + department + "'"}{" )"}";
            }
            return subject;
        }
    }
}
