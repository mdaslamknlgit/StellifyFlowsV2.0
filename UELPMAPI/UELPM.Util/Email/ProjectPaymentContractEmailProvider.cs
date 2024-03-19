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
    public class ProjectPaymentContractEmailProvider
    {
        public static bool SendProjectPaymentContractRequestMail(int documentId, string docType, string companyShortName, string type, ProjectPaymentContract paymentContractDetails, UserProfile approverDetails, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string status = string.Empty;
            mailmessage = PrepareMailBody(paymentContractDetails, approverDetails, paymentContractDetails.StatusText, requesterDetails, "ApproverMail");
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            if (paymentContractDetails.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
            {
                status = $"{"Pending For Approval"} {" [ "} {approverDetails.FirstName} {approverDetails.LastName} {" ] "}";
            }
            mailmessage = mailmessage.Replace("$$Status", status);
            //mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject(companyShortName, docType, paymentContractDetails.DocumentCode, paymentContractDetails.StatusText, paymentContractDetails.ProjectMasterContract.Supplier.SupplierShortName);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ProjectPaymentContract"]) + "approval/" + paymentContractDetails.ProjectMasterContract.ProjectMasterContractId + "/" + paymentContractDetails.PaymentContractId + "/" + paymentContractDetails.CompanyId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }
        public static void SendProjectPaymentContractRequestApprovalMail(ProjectPaymentContract paymentContractDetails, string companyShortName, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails, UserProfile nextApprover)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(paymentContractDetails, requesterDetails, status, approverDetails, "RequestorMail");
            if (paymentContractDetails.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress && nextApprover != null)
            {
                status = $"{"Pending For Approval"} {" [ "} {nextApprover.FirstName} {nextApprover.LastName} {" ] "}";
            }
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$MailTitle", "");
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ProjectPaymentContract"]) + "request/" + paymentContractDetails.ProjectMasterContract.ProjectMasterContractId + "/" + paymentContractDetails.PaymentContractId + "/" + paymentContractDetails.CompanyId);
            subject += PrepareSubject(companyShortName, "POP Contract", paymentContractDetails.DocumentCode, paymentContractDetails.StatusText, paymentContractDetails.ProjectMasterContract.Supplier.SupplierShortName);

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
        private static string PrepareMailBody(ProjectPaymentContract paymentContractDetails, UserProfile approverDetails, string status, UserProfile requesterDetails = null, string type = null, UserProfile nextApprover = null)
        {
            string mailmessage = string.Empty;
            if (type == "RequestorMail")
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectPaymentContractApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectPaymentContractRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", paymentContractDetails.ProjectMasterContract.CurrencySymbol);
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(paymentContractDetails.DocumentCode));
            mailmessage = mailmessage.Replace("$$Supplier", paymentContractDetails.ProjectMasterContract.Supplier == null ? "" : paymentContractDetails.ProjectMasterContract.Supplier.SupplierName);
            mailmessage = mailmessage.Replace("$$PaymentAmount", String.Format("{0:N}", paymentContractDetails.Certificate.CPGrandTotal));

            return mailmessage;
        }
    }
}
