using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class ProjectContractVariationOrderEmailProvider
    {
        public static bool SendProjectContractVariationOrderRequestMail(int documentId, string docType, string companyShortName, string type, ProjectMasterContract variationOrder, UserProfile approverDetails, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string status = string.Empty;
            mailmessage = PrepareMailBody(variationOrder, approverDetails, variationOrder.WorkFlowStatus, requesterDetails, "ApproverMail");
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            if (variationOrder.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
            {
                status = $"{"Pending For Approval"} {" [ "} {approverDetails.FirstName} {approverDetails.LastName} {" ] "}";
            }
            mailmessage = mailmessage.Replace("$$Status", status);
            //mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject(companyShortName, docType, variationOrder.VODocumentCode, variationOrder.VOWorkFlowStatus, variationOrder.Supplier.SupplierShortName);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ProjectContractVariationOrder"]) + "approval/" + variationOrder.ProjectMasterContractId + "/" + variationOrder.VOId + "/" + variationOrder.CompanyId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }
        public static void SendProjectContractVariationOrderRequestApprovalMail(ProjectMasterContract variationOrder, string companyShortName, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails, UserProfile nextApprover)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(variationOrder, requesterDetails, status, approverDetails, "RequestorMail");
            if (variationOrder.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress && nextApprover != null)
            {
                status = $"{"Pending For Approval"} {" [ "} {nextApprover.FirstName} {nextApprover.LastName} {" ] "}";
            }
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$MailTitle", "");
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ProjectContractVariationOrder"]) + "request/" + variationOrder.ProjectMasterContractId + "/" + variationOrder.VOId + "/" + variationOrder.CompanyId);
            subject += PrepareSubject(companyShortName, "POP Contract", variationOrder.VODocumentCode, variationOrder.VOWorkFlowStatus, variationOrder.Supplier.SupplierShortName);

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
            subject += docStatus;
            return subject;
        }
        private static string PrepareMailBody(ProjectMasterContract variationOrder, UserProfile approverDetails, string status, UserProfile requesterDetails = null, string type = null, UserProfile nextApprover = null)
        {
            string mailmessage = string.Empty;
            if (type == "RequestorMail")
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectContractVariationOrderApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectContractVariationOrderRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", variationOrder.CurrencySymbol);
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(variationOrder.VODocumentCode));
            mailmessage = mailmessage.Replace("$$Supplier", variationOrder.Supplier == null ? "" : variationOrder.Supplier.SupplierName);
            mailmessage = mailmessage.Replace("$$TotalVOSum", String.Format("{0:N}", variationOrder.CurrentVOSum));

            return mailmessage;
        }

        
    }
}
