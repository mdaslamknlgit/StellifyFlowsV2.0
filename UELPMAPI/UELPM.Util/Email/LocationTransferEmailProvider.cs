using System;
using System.Configuration;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class LocationTransferEmailProvider
    {
        public static bool SendLocationTransferRequestMail(int documentId, string type, LocationTransfer locationTransferDetails, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(locationTransferDetails, approverDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject();
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["LocationTransferRequestApproval"]) + "?id=" + documentId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendLocationTransferRequestApprovalMail(LocationTransfer locationTransferDetails, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(locationTransferDetails, approverDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$LocationTranferId", locationTransferDetails.LocationTransferId.ToString());
            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["LocationTransferRequest"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{locationTransferDetails.LocationTransferId} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{locationTransferDetails.LocationTransferId} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["LocationTransferRequestApproval"]);
                subject = $"{type}{" : "}{locationTransferDetails.LocationTransferId} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + locationTransferDetails.LocationTransferId);
            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject()
        {
            string subject = string.Empty;
            return "Location Tranfer Request";
        }

        private static string PrepareMailBody(LocationTransfer locationTransferDetails, UserProfile approverDetails, string type = null)
        {
            string mailmessage = string.Empty;
            string locationTransferItems = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/LocationTransferRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", locationTransferDetails.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/LocationTransferApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();

                mailmessage = mailmessage.Replace("$$Name", locationTransferDetails.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }
            int i = 0;
            foreach (var data in locationTransferDetails.SelectedItemDetails)
            {
                i++;
                locationTransferItems = $"{ locationTransferItems } <tr><td>{ i }</td><td>{ data.ItemMasterCode }</td><td>{ data.Name}</td><td>{ data.Manufacturer }</td></tr>";
            }
            mailmessage = mailmessage.Replace("$$FromCompany", Convert.ToString(locationTransferDetails.FromCompany));
            mailmessage = mailmessage.Replace("$$ToCompany", locationTransferDetails.ToCompany);
            mailmessage = mailmessage.Replace("$$FromLocation", locationTransferDetails.FromLocation);
            mailmessage = mailmessage.Replace("$$ToLocation", locationTransferDetails.ToLocation);
            mailmessage = mailmessage.Replace("$$Reason", locationTransferDetails.ReasonForTransfer);
            mailmessage = mailmessage.Replace("$$ItemsDetails", locationTransferItems);
            return mailmessage;
        }
    }
}
