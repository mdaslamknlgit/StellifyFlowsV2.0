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
    public class UserManagementEmailProvider
    {
        public static bool SendLoginCredentials(string tousername,string toEmailId,string username,string password, UserProfile requesterDetails)
        {
            string mailmessage = string.Empty;
            string subject = "Login Credential";
            mailmessage = PrepareMailBody(tousername,username,password, requesterDetails, subject);
           // mailmessage = mailmessage.Replace("$$Status", status);
            mailmessage = mailmessage.Replace("$$MailTitle", subject);
            mailmessage = mailmessage.Replace("$$IsHidden", "display:none");
            mailmessage = mailmessage.Replace("$$MailSubTitle", subject.ToUpper());

            string siteLogin = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["Login"]);            
            mailmessage = mailmessage.Replace("$$subject", subject);
            mailmessage = mailmessage.Replace("$$SiteLogin", siteLogin);
            return MailHelper.SendEmail(toEmailId, ConfigurationManager.AppSettings["adminEmail"], "", "", subject, mailmessage, MailPriority.Normal, null);
        }



        private static string PrepareMailBody(string tousername, string username, string password, UserProfile requesterDetails,string subject)
        {
            string mailmessage = string.Empty;

            var filePathEmail = System.Web.Hosting.HostingEnvironment.MapPath("~/EmailTemplates/UserManagementLoginEmail.txt");
            StreamReader srEmailInfo = new StreamReader(filePathEmail);
            mailmessage = srEmailInfo.ReadToEnd();
            srEmailInfo.Close();
            mailmessage = mailmessage.Replace("$$Name", tousername);
            mailmessage = mailmessage.Replace("$$Sender", Convert.ToString(requesterDetails.UserName));

            mailmessage = mailmessage.Replace("$$UserName", Convert.ToString(username));
            mailmessage = mailmessage.Replace("$$Password", Convert.ToString(password));

            return mailmessage;
        }







    }
}
