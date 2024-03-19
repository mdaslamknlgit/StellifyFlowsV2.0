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
    public class ProjectMasterContractProvider
    {
        public static bool SendProjectMasterContractRequestMail(int documentId, string docType, string companyShortName, string type, ProjectMasterContract masterContractDetails, UserProfile approverDetails, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            string status = string.Empty;
            mailmessage = PrepareMailBody(masterContractDetails, approverDetails, masterContractDetails.WorkFlowStatus, requesterDetails, "ApproverMail");
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            if (masterContractDetails.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress)
            {
                status = $"{"Pending For Approval"} {" [ "} {approverDetails.FirstName} {approverDetails.LastName} {" ] "}";
            }
            mailmessage = mailmessage.Replace("$$Status", status);
            //mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject(companyShortName, docType, masterContractDetails.POPMasterCode, masterContractDetails.WorkFlowStatus, masterContractDetails.Supplier.SupplierShortName);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ProjectMasterContract"]) + "approval?id=" + documentId + "&cid=" + masterContractDetails.CompanyId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendProjectMasterContractRequestApprovalMail(ProjectMasterContract masterContractDetails, string companyShortName, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails, UserProfile nextApprover)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(masterContractDetails, requesterDetails, status, approverDetails, "RequestorMail");
            if (masterContractDetails.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress && nextApprover != null)
            {
                status = $"{"Pending For Approval"} {" [ "} {nextApprover.FirstName} {nextApprover.LastName} {" ] "}";
            }
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            //mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", "");
            //mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            //mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());

            //if (status.ToString().Trim().ToLower() == "approved")
            //{
            //    subject = $"{type}{" : "}{masterContractDetails.POPMasterCode} {" is"} {status}";
            //}
            //else if (status.ToString().Trim().ToLower() == "rejected")
            //{
            //    subject = $"{type}{" : "}{masterContractDetails.POPMasterCode} {" is"} {status}";
            //}
            //else
            //{
            //    subject = $"{type}{" : "}{masterContractDetails.POPMasterCode} {" is waiting for your Approval"}";
            //}
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["ProjectMasterContract"]) + "request?id=" + masterContractDetails.ProjectMasterContractId + "&cid=" + masterContractDetails.CompanyId);
            subject += PrepareSubject(companyShortName, "POP Contract", masterContractDetails.POPMasterCode, masterContractDetails.WorkFlowStatus, masterContractDetails.Supplier.SupplierShortName);

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
        private static string PrepareMailBody(ProjectMasterContract masterContractDetails, UserProfile approverDetails, string status, UserProfile requesterDetails = null, string type = null, UserProfile nextApprover = null)
        {
            string mailmessage = string.Empty;
            if (type == "RequestorMail")
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectContractMasterApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            else if (type == "ReCall")
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectContractMasterReCallApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/ProjectContractMasterRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", string.Format("{0} {1}", approverDetails.FirstName, approverDetails.LastName));
                mailmessage = mailmessage.Replace("$$Sender", string.Format("{0} {1}", requesterDetails.FirstName, requesterDetails.LastName));
            }
            mailmessage = mailmessage.Replace("$$DocumentCurrencySymbol", masterContractDetails.CurrencySymbol);
            mailmessage = mailmessage.Replace("$$PurchaseOrderRequestNumber", Convert.ToString(masterContractDetails.POPMasterCode));
            mailmessage = mailmessage.Replace("$$Supplier", masterContractDetails.Supplier == null ? "" : masterContractDetails.Supplier.SupplierName);
            mailmessage = mailmessage.Replace("$$OriginalContractSum", String.Format("{0:N}", masterContractDetails.OriginalContractSum));
            
            return mailmessage;
        }

        public static object SendRecallApprovalMail(ProjectMasterContract projectMasterContract, string companyShortName, UserProfile approverDetails, UserProfile senderDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(projectMasterContract, approverDetails, "Recall", senderDetails, "ReCall");
            mailmessage = mailmessage.Replace("$$MailTitle", "Recall");
            mailmessage = mailmessage.Replace("$$Status", "ReCall");
            subject += PrepareSubject(companyShortName, "POP Contract", projectMasterContract.POPMasterCode, "ReCall", projectMasterContract.Supplier.SupplierShortName);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }
    }
}
