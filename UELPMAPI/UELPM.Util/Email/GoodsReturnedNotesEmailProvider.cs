using System;
using System.Configuration;
using System.IO;
using System.Net.Mail;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class GoodsReturnedNotesEmailProvider
    {
        public static bool SendGoodsReturnNoteRequestMail(int documentId, string type, GoodsReturnedNotes goodsReturnedNotes, UserProfile approverDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(goodsReturnedNotes, approverDetails);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            subject += PrepareSubject();
            mailmessage = mailmessage.Replace("$$SiteLogin", Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["GoodsReturnNoteRequestApproval"]) + "?id=" + documentId);
            return MailHelper.SendEmail(approverDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        public static void SendGoodsReturnNoteRequestApprovalMail(GoodsReturnedNotes goodsReturnedNotes, UserProfile approverDetails, string type, string status, string previousApproverStatus, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = string.Empty;
            mailmessage = PrepareMailBody(goodsReturnedNotes, approverDetails, type);
            mailmessage = mailmessage.Replace("$$PreviousApproverStatus", previousApproverStatus);
            mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", type);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", type.ToUpper());
            mailmessage = mailmessage.Replace("$$GoodsReturnNoteId", goodsReturnedNotes.GoodsReturnNoteId.ToString());
            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["GoodsReturnNoteRequestApproval"]);
            if (status.ToString().Trim().ToLower() == "approved")
            {
                subject = $"{type}{" : "}{goodsReturnedNotes.GRTCode} {" is"} {status}";
            }
            else if (status.ToString().Trim().ToLower() == "rejected")
            {
                subject = $"{type}{" : "}{goodsReturnedNotes.GRTCode} {" is"} {status}";
            }
            else
            {
                siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["GoodsReturnNoteRequestApproval"]);
                subject = $"{type}{" : "}{goodsReturnedNotes.GRTCode} {" is waiting for your Approval"}";
            }
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin + "?id=" + goodsReturnedNotes.GRTCode);
            MailHelper.SendEmail(requesterDetails.EmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }

        private static string PrepareSubject()
        {
            string subject = string.Empty;
            return "Goods Return Note Request";
        }

        private static string PrepareMailBody(GoodsReturnedNotes goodsReturnedNotes, UserProfile approverDetails, string type = null)
        {
            string mailmessage = string.Empty;
            string itemsListDetails = "";
            if (type == null)
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/GoodsReturnNoteRequestEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", approverDetails.FirstName);
                mailmessage = mailmessage.Replace("$$Sender", goodsReturnedNotes.RequestedByUserName);
            }
            else
            {
                var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/GoodsReturnNoteApprovalEmail.txt");
                StreamReader srEmailInfo = new StreamReader(filePathEmail);
                mailmessage = srEmailInfo.ReadToEnd();
                srEmailInfo.Close();
                mailmessage = mailmessage.Replace("$$Name", goodsReturnedNotes.RequestedByUserName);
                mailmessage = mailmessage.Replace("$$Sender", approverDetails.FirstName);
            }
            int i = 0;
            foreach (var data in goodsReturnedNotes.ItemsList)
            {
                i++;
                itemsListDetails = $"{ itemsListDetails } <tr><td>{ i }</td><td>{ data.ItemType }</td><td>{ data.Item.ItemName}</td>" +
                    $"<td>{ data.OriginalQty }</td><td>{ data.TotalReceivedQty }</td><td>{ data.RTNQty }</td></tr>";
            }
            mailmessage = mailmessage.Replace("$$Supplier", Convert.ToString(goodsReturnedNotes.Supplier.SupplierName));
            mailmessage = mailmessage.Replace("$$GRTCode", goodsReturnedNotes.GRTCode);
            mailmessage = mailmessage.Replace("$$PurchaseOrderCode", Convert.ToString(goodsReturnedNotes.PurchaseOrderCode));
            mailmessage = mailmessage.Replace("$$DoNumber", Convert.ToString(goodsReturnedNotes.SupplierDoNumber));
            mailmessage = mailmessage.Replace("$$WorkFlowStatus", Convert.ToString(goodsReturnedNotes.WorkFlowStatus));
            mailmessage = mailmessage.Replace("$$CreatedDate", Convert.ToString(String.Format("{0:dd-MM-yyyy}", goodsReturnedNotes.CreatedDate)));
            mailmessage = mailmessage.Replace("$$GRNRemarks", Convert.ToString(goodsReturnedNotes.GRNRemarks));
            mailmessage = mailmessage.Replace("$$DraftCode", Convert.ToString(goodsReturnedNotes.DraftCode));
            mailmessage = mailmessage.Replace("$$ItemsDetails", itemsListDetails);
            return mailmessage;
        }
    }
}
