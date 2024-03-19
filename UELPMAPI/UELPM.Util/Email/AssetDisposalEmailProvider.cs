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
    public class AssetDisposalEmailProvider
    {
        public static bool SendAssetDisposalRequestMail(int documentId, string type, AssetDisposal assetDisposalDetails, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(assetDisposalDetails, approverDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject();
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetDisposalRequestApproval"]) + "?id=" + documentId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendAssetDisposalRequestApprovalMail(AssetDisposal assetDisposalDetails, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(assetDisposalDetails, approverDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$AssetDisposalId", assetDisposalDetails.AssetDisposalId.ToString());
            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetDisposalRequest"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{assetDisposalDetails.AssetDisposalId} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{assetDisposalDetails.AssetDisposalId} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetDisposalRequestApproval"]);
                subject = $"{type}{" : "}{assetDisposalDetails.AssetDisposalId} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);        
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin  + "?id=" + assetDisposalDetails.AssetDisposalId);
            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject()
        {
            string subject = string.Empty;
            return "Asset Disposal Request";
        }

        private static string PrepareMailBody(AssetDisposal assetDisposalDetails, UserProfile approverDetails, string type = null)
        {
            string mailmessage = string.Empty;
            string assetTransferItems = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/AssetDisposalRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", assetDisposalDetails.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/AssetDisposalApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();

                mailmessage = mailmessage.Replace("$$Name", assetDisposalDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }
            foreach (var data in assetDisposalDetails.SelectedAssetDetails)
            {
                assetTransferItems = $"{ assetTransferItems } <tr><td>{ data.SerialNumber }</td><td>{ data.Asset.AssetName }</td><td></td><td></td></tr>";
            }
            mailmessage = mailmessage.Replace("$$Reason", assetDisposalDetails.Remarks);
            mailmessage = mailmessage.Replace("$$AssetDetails", assetTransferItems);
            return mailmessage;
        }
    }
}
