using System;
using System.Configuration;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class SupplierEmailProvider
    {
        public static bool SendSupplierRequestMail(int documentId, string docType, string type, Supplier supplierDetails, UserProfile approverDetails, UserProfile requesterDetails, CompanyDetails company)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(supplierDetails, approverDetails, supplierDetails.SupplierApproval.WorkFlowStatus, requesterDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject = PrepareSubject(company.CompanyShortName, docType, supplierDetails.SupplierCode, supplierDetails.WorkFlowStatus, supplierDetails.SupplierShortName);
            //mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SupplierRequestApproval"]) + "?id=" + documentId);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SupplierRequestApproval"]) + "?id=" + documentId + "&cid=" + company.CompanyId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendSupplierRequestApprovalMail(Supplier supplierDetails, string docType, string companyShortName, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(supplierDetails, approverDetails, status, requesterDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject = PrepareSubject(companyShortName, docType, supplierDetails.SupplierCode, supplierDetails.WorkFlowStatus, supplierDetails.SupplierShortName);

            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SupplierRequestApproval"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                // subject = $"{type}{" : "}{supplierDetails.SupplierCode} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                // subject = $"{type}{" : "}{supplierDetails.SupplierCode} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SupplierRequestApproval"]);
                // subject = $"{type}{" : "}{supplierDetails.SupplierCode} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + supplierDetails.SupplierCode);
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

        private static string PrepareMailBody(Supplier supplierDetails, UserProfile approverDetails, string status, UserProfile requesterDetails = null, string type = null)
        {
            string mailmessage = string.Empty;
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/SupplierRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", requesterDetails.FirstName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/SupplierApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", requesterDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }

            mailmessage = mailmessage.Replace("$$SupplierName", Convert.ToString(supplierDetails.SupplierName));
            mailmessage = mailmessage.Replace("$$SupplierCode", supplierDetails.SupplierCode);
            mailmessage = mailmessage.Replace("$$CategoryName", Convert.ToString(supplierDetails.CategoryName));
            mailmessage = mailmessage.Replace("$$CreatedDate", Convert.ToString(Convert.ToDateTime(supplierDetails.CreatedDate).ToString("dd-MM-yyyy")));
            mailmessage = mailmessage.Replace("$$Status", status);
            return mailmessage;
        }
    }
}
