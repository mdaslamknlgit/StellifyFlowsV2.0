using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Util.Email
{
    public class MailHelper
    {
        public static bool SendEmail(string to, string from, string cc, string bcc, string subject, string mailBody, MailPriority priority, Attachment attachment)
        {
            bool result = true;
            try
            {
                System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)(768 | 3072);
                //var sendMailThread = new Thread(() =>
                //{
                MailMessage objMailMessage = new MailMessage();
                objMailMessage.To.Add(new MailAddress(to, "IPS Application"));
                objMailMessage.From = new MailAddress(from, "IPS Application");
                if (!string.IsNullOrEmpty(cc))
                {
                    objMailMessage.CC.Add(cc);
                }
                if (!string.IsNullOrEmpty(bcc))
                {
                    objMailMessage.Bcc.Add(bcc);
                }

                objMailMessage.Subject = subject;

                objMailMessage.Body = mailBody;
                objMailMessage.Body = appendDontReplyText(mailBody);
                objMailMessage.IsBodyHtml = true;


                objMailMessage.BodyEncoding = System.Text.Encoding.GetEncoding("utf-8");
                objMailMessage.SubjectEncoding = System.Text.Encoding.Default;

                if (attachment != null)
                {
                    objMailMessage.Attachments.Add(attachment);
                }
                SmtpClient smtpClient = new SmtpClient();
                smtpClient.UseDefaultCredentials = true;

                smtpClient.Host = ConfigurationManager.AppSettings["SmtpHost"].ToString();
                smtpClient.Port = Convert.ToInt32(ConfigurationManager.AppSettings["SmtpPort"].ToString());
                smtpClient.EnableSsl = true;


                smtpClient.Credentials = new System.Net.NetworkCredential(ConfigurationManager.AppSettings["SMTPUserName"], ConfigurationManager.AppSettings["SMTPPassword"]);
                smtpClient.Send(objMailMessage);
                //});

                //sendMailThread.Start();
            }
            catch (Exception ex)
            {
                result = false;
                throw ex;
            }
            return result;
        }

        public static bool SendEmail(MailInfo mailInfo)
        {
            bool result = true;
            try
            {
                System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)(768 | 3072);
                MailMessage mailMessage = new MailMessage
                {
                    Subject = mailInfo.Subject,
                    IsBodyHtml = true,
                    From = new MailAddress(mailInfo.From, mailInfo.FromDisplayName),
                    BodyEncoding = System.Text.Encoding.GetEncoding("utf-8"),
                    SubjectEncoding = System.Text.Encoding.Default
                };
                foreach (var to in mailInfo.To)
                {
                    mailMessage.To.Add(new MailAddress(to));
                }
                foreach (var cc in mailInfo.CC)
                {
                    mailMessage.CC.Add(cc);
                }
                foreach (var bcc in mailInfo.BCC)
                {
                    mailMessage.Bcc.Add(bcc);
                }
                if (mailInfo.AppendDontReplyText)
                {
                    mailMessage.Body = appendDontReplyText(mailInfo.Body);
                }
                foreach (var attachment in mailInfo.Attachments)
                {
                    mailMessage.Attachments.Add(attachment);
                }
                SmtpClient smtpClient = new SmtpClient
                {
                    UseDefaultCredentials = true,
                    Host = ConfigurationManager.AppSettings["SmtpHost"].ToString(),
                    Port = Convert.ToInt32(ConfigurationManager.AppSettings["SmtpPort"].ToString()),
                    EnableSsl = true,
                    Credentials = new System.Net.NetworkCredential(ConfigurationManager.AppSettings["SMTPUserName"], ConfigurationManager.AppSettings["SMTPPassword"])
                };
                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                result = false;
                throw ex;
            }
            return result;
        }

        private static string appendDontReplyText(string mailBody)
        {
            string mailmessage = string.Empty;
            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/NoReplyMailText.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            mailBody += mailmessage;
            return mailBody;
        }
    }
}
