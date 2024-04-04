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
    public class AssetTransferEmailProvider
    {
        public static bool SendAssetTransferRequestMail(int documentId, string type, AssetTransfer assetTransferDetails, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(assetTransferDetails, approverDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
           // subject = $"{type}{" : "}{assetDetails.RequestCode} {" details"}";
            subject += PrepareSubject();
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetTransferRequestApproval"]) + "?id=" + documentId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendAssetTransferRequestApprovalMail(AssetTransfer assetTransferDetails, UserProfile approverDetails, string type, string status, string previousApproverStatus,UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(assetTransferDetails, approverDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$AssetTranferId", assetTransferDetails.AssetTranferId.ToString());
            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetTransferRequest"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{assetTransferDetails.AssetTranferId} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{assetTransferDetails.AssetTranferId} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["AssetTransferRequestApproval"]);
                subject = $"{type}{" : "}{assetTransferDetails.AssetTranferId} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + assetTransferDetails.AssetTranferId);
            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject()
        {
            string subject = string.Empty;
            return "Asset Tranfer Request";
        }

        private static string PrepareMailBody(AssetTransfer assetTransferDetails,UserProfile approverDetails, string type = null)
        {
            string mailmessage = string.Empty;
            string assetTransferItems = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/AssetTransferRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", assetTransferDetails.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/AssetTransferApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();

                mailmessage = mailmessage.Replace("$$Name", assetTransferDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }
            foreach (var data in assetTransferDetails.SelectedAssetDetails)
            {
                assetTransferItems = $"{ assetTransferItems } <tr><td>{ data.SerialNumber }</td><td>{ data.Asset.AssetName }</td><td></td><td></td></tr>";
            }
            mailmessage = mailmessage.Replace("$$FromCompany", Convert.ToString(assetTransferDetails.FromCompany));
            mailmessage = mailmessage.Replace("$$ToCompany", assetTransferDetails.ToCompany);
            mailmessage = mailmessage.Replace("$$FromLocation", assetTransferDetails.FromLocation);
            mailmessage = mailmessage.Replace("$$ToLocation", assetTransferDetails.ToLocation);
            mailmessage = mailmessage.Replace("$$Reason", assetTransferDetails.ReasonForTransfer);
            mailmessage = mailmessage.Replace("$$AssetDetails", assetTransferItems);
            return mailmessage;
        }
    }
}
