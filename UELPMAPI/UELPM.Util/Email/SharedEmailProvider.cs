using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class SharedEmailProvider
    {
        public static string GetSiteLogin(int processId,bool isClarificationMail,int documentId)
        {
            string siteLogin = "";
            if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetTransfer))
            {
                siteLogin = $"{ System.Configuration.ConfigurationManager.AppSettings["AssetTransferRequestApproval"] } ? id = { documentId }";
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.AssetDisposal))
            {
                siteLogin = $"{ System.Configuration.ConfigurationManager.AppSettings["AssetDisposalRequestApproval"] } ? id = { documentId }";
            }
            return siteLogin;
        }
        public static void SendClarificationMail(DocumentRequestClarificationMail documentRequestClarificationMail, string docType, string routePath, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            subject = PrepareSubject(documentRequestClarificationMail.CompanyShortName, docType, documentRequestClarificationMail.DocumentCode, documentRequestClarificationMail.WorkflowStatus, documentRequestClarificationMail.SupplierShortName);
            mailmessage = PrepareClarificationMailBody(documentRequestClarificationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$DocumentCode", documentRequestClarificationMail.DocumentCode);
            //mailmessage = mailmessage.Replace("$$SiteLogin", GetSiteLogin(documentRequestClarificationMail.ProcessId,true,documentRequestClarificationMail.DocumentId));
           mailmessage = mailmessage.Replace("$$SiteLogin", routePath + "?id=" + documentRequestClarificationMail.DocumentId +"&cid="+ documentRequestClarificationMail.CompanyId+"&code="+ documentRequestClarificationMail.DocumentCode + "&processId=" + documentRequestClarificationMail.ProcessId );

            //MailHelper.SendEmail(documentRequestClarificationMail.RequesterEmail, documentRequestClarificationMail.ApproverEmail, "", "", subject, mailmessage, MailPriority.Normal, null);
            MailHelper.SendEmail(documentRequestClarificationMail.RequesterEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendClarificationReplyMail(DocumentRequestClarificationMail documentRequestClarificationMail, string docType, string routePath, string type)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareReplyMailBody(documentRequestClarificationMail);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$DocumentCode", documentRequestClarificationMail.DocumentCode);
            subject = PrepareSubject(documentRequestClarificationMail.CompanyShortName, docType, documentRequestClarificationMail.DocumentCode, documentRequestClarificationMail.WorkflowStatus, documentRequestClarificationMail.SupplierShortName);
            //mailmessage = mailmessage.Replace("$$SiteLogin", GetSiteLogin(documentRequestClarificationMail.ProcessId, true, documentRequestClarificationMail.DocumentId));
            mailmessage = mailmessage.Replace("$$SiteLogin", routePath + "?id=" + documentRequestClarificationMail.DocumentId + "&cid=" + documentRequestClarificationMail.CompanyId + "&code=" + documentRequestClarificationMail.DocumentCode + "&processId=" + documentRequestClarificationMail.ProcessId);

            //MailHelper.SendEmail(documentRequestClarificationMail.ApproverEmail, documentRequestClarificationMail.RequesterEmail, "", "", subject, mailmessage, MailPriority.Normal, null);
            MailHelper.SendEmail(documentRequestClarificationMail.ApproverEmail, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareClarificationMailBody(DocumentRequestClarificationMail objPurchaseOrderRequestClarificationMail)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ClarificationMail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();

            mailmessage = mailmessage.Replace("$$Name", objPurchaseOrderRequestClarificationMail.RequesterName);
            mailmessage = mailmessage.Replace("$$Clarification", objPurchaseOrderRequestClarificationMail.ApproverComments);
            mailmessage = mailmessage.Replace("$$DocumentCode", objPurchaseOrderRequestClarificationMail.DocumentCode);
            mailmessage = mailmessage.Replace("$$sender", objPurchaseOrderRequestClarificationMail.ApproverName);
            return mailmessage;
        }

        private static string PrepareReplyMailBody(DocumentRequestClarificationMail documentRequestClarificationMail)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ReplyMail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();

            mailmessage = mailmessage.Replace("$$Name", documentRequestClarificationMail.ApproverName);
            mailmessage = mailmessage.Replace("$$Reply", documentRequestClarificationMail.ApproverComments);
            mailmessage = mailmessage.Replace("$$DocumentCode", documentRequestClarificationMail.DocumentCode);
            mailmessage = mailmessage.Replace("$$sender", documentRequestClarificationMail.RequesterName);
            return mailmessage;
        }

        private static string PrepareSubject(string companyShortName, string docType, string docCode, string docStatus, string SupplierShortName)
        {
            string subject = string.Empty;
            string supplierStatus = string.Empty;
            subject = companyShortName == "" ? "" : companyShortName == null ? "" : companyShortName + " / ";
            subject += $"{ docType }{" : "}{ docCode } {" / "}";
            subject += SupplierShortName == "" ? "" : SupplierShortName == null ? "" : SupplierShortName + " / ";
            if (docStatus != null)
            {
                if (docStatus.Contains("["))
                {
                    docStatus = docStatus.Split('[')[0];
                }
            }
                
            subject += docStatus;
            return subject;
        }
    }

}
