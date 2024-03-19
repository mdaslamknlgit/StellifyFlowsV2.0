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
    public class AssetDepreciationEmailProvider
    {
        public static bool SendAssetDepreciationRequestMail(int documentId, string type, AssetDepreciation assetDepDetails, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(assetDepDetails, approverDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$Location", assetDepDetails.Location);
            subject += PrepareSubject();
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetDepRequestApproval"]) + "?id=" + documentId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendAssetDepreciationRequestApprovalMail(AssetDepreciation assetDepreciationDetails, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(assetDepreciationDetails, approverDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$AssetDepreciationId", assetDepreciationDetails.AssetDepreciationId.ToString());
            mailmessage = mailmessage.Replace("$$Location", assetDepreciationDetails.Location);
            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetDepRequest"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{assetDepreciationDetails.AssetDepreciationId} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{assetDepreciationDetails.AssetDepreciationId} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetDepRequestApproval"]);
                subject = $"{type}{" : "}{assetDepreciationDetails.AssetDepreciationId} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + assetDepreciationDetails.AssetDepreciationId);
            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject()
        {
            string subject = string.Empty;
            return "Asset Depreciation Approval Request";
        }

        private static string PrepareMailBody(AssetDepreciation assetDepreciationDetails, UserProfile approverDetails, string type = null)
        {
            string mailmessage = string.Empty;
            string assetTransferItems = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/AssetDepreciationRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", assetDepreciationDetails.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/AssetDepreciationApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", assetDepreciationDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }
            return mailmessage;
        }
    }
}
