using log4net;
using log4net.Appender;
using log4net.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;
using System.IO;
using context = System.Web.HttpContext;

namespace UELPM.WebAPI.Extensions
{
    public static class MyAuditLog
    {
        private static ILog log;
        static StringBuilder messageStr = new StringBuilder();
        private const string ActionIdReference = "Action";
        public static readonly int SourceId;
        private static String ErrorlineNo, Errormsg, extype, exurl, hostIp, ErrorLocation, HostAdd;

        static MyAuditLog()
        {

        }

        public static void Info(string moduleName, string action, string user,int docId,string method,string message, int CompanyId=0)
        {
            messageStr.Clear();
            log = LogManager.GetLogger(user);
            log4net.LogicalThreadContext.Properties["documentId"] = docId;//int
            log4net.LogicalThreadContext.Properties["pageName"] = moduleName;
            log4net.LogicalThreadContext.Properties["method"] = method;
            log4net.LogicalThreadContext.Properties["action"] = action;
            log4net.LogicalThreadContext.Properties["CompanyId"] = CompanyId;
            //messageStr.AppendFormat("\n Module : {0} , Action : {1}\n", moduleName, action);
            messageStr.AppendFormat(message);
            log.Info(messageStr);

        }
        public static void ErrorLog(string moduleName, string action,string user, string exception, int docId,string method,string message, int companyId = 0)
        {
            messageStr.Clear();
            log = LogManager.GetLogger(user);
            log4net.LogicalThreadContext.Properties["documentId"] = docId;
            log4net.LogicalThreadContext.Properties["pageName"] = moduleName;
            log4net.LogicalThreadContext.Properties["method"] = method;
            log4net.LogicalThreadContext.Properties["action"] = action;
            log4net.LogicalThreadContext.Properties["exception"] = exception;
            log4net.LogicalThreadContext.Properties["companyId"] = companyId;
            //messageStr.AppendFormat("Message : ", message);
            messageStr.AppendFormat(message);
            log.Error(messageStr);
        }

        
        public static void SendErrorToText(Exception ex)
        {
            var line = Environment.NewLine + Environment.NewLine;
            ErrorlineNo = ex.StackTrace.Substring(ex.StackTrace.Length - 7, 7);
            Errormsg = ex.GetType().Name.ToString();
            extype = ex.GetType().ToString();
            exurl = context.Current.Request.Url.ToString();
            ErrorLocation = ex.Message.ToString();

            try
            {
                string filepath = context.Current.Server.MapPath("~/LogFile/");  //Text File Path

                if (!Directory.Exists(filepath))
                {
                    Directory.CreateDirectory(filepath);

                }
                filepath = filepath + DateTime.Today.ToString("dd-MM-yy") + ".txt";   //Text File Name
                if (!File.Exists(filepath))
                {


                    File.Create(filepath).Dispose();

                }
                using (StreamWriter sw = File.AppendText(filepath))
                {
                    string error = "Log Written Date:" + " " + DateTime.Now.ToString() + line + "Error Line No :" + " " + ErrorlineNo + line + "Error Message:" + " " + Errormsg + line + "Exception Type:" + " " + extype + line + "Error Location :" + " " + ErrorLocation + line + " Error Page Url:" + " " + exurl + line + "User Host IP:" + " " + hostIp + line;
                    sw.WriteLine("-----------Exception Details on " + " " + DateTime.Now.ToString() + "-----------------");
                    sw.WriteLine("-------------------------------------------------------------------------------------");
                    sw.WriteLine(line);
                    sw.WriteLine(error);
                    sw.WriteLine("--------------------------------*End*------------------------------------------");
                    sw.WriteLine(line);
                    sw.Flush();
                    sw.Close();
                }

            }
            catch (Exception e)
            {
                e.ToString();

            }
        }

        public static void SendErrorToText1(string moduleName, string action, string user, string method, string message)
        {
            var line = Environment.NewLine;
            try
            {
                string filepath = context.Current.Server.MapPath("~/LogFile/");  //Text File Path
                if (!Directory.Exists(filepath))
                {
                    Directory.CreateDirectory(filepath);
                }
                filepath = filepath + DateTime.Today.ToString("dd-MM-yy") + ".txt";   //Text File Name
                if (!File.Exists(filepath))
                {
                    File.Create(filepath).Dispose();
                }
                using (StreamWriter sw = File.AppendText(filepath))
                {
                    string error = "Module Name:" + " " + moduleName + line + "Action :" + " " + action + line + "User:" + " " 
                        + user + line + "Method:" + " " + method + line + "Exception :" + " " +
                        message + line + " DateTime:" + " " + DateTime.Now.ToString() + line ;                                 
                    sw.WriteLine(error);                    
                    sw.WriteLine(line);
                    sw.Flush();
                    sw.Close();
                }

            }
            catch (Exception e)
            {
                e.ToString();

            }
        }


        public static void StartErrorText(string message)
        {
            var line = Environment.NewLine;
            try
            {
                string filepath = context.Current.Server.MapPath("~/LogFile/");  //Text File Path
                if (!Directory.Exists(filepath))
                {
                    Directory.CreateDirectory(filepath);
                }
                filepath = filepath + DateTime.Today.ToString("dd-MM-yy") + ".txt";   //Text File Name
                if (!File.Exists(filepath))
                {
                    File.Create(filepath).Dispose();
                }
                using (StreamWriter sw = File.AppendText(filepath))
                {
                    sw.WriteLine("--------------------------------*"+ message + "*------------------------------------------");                 
                    sw.Flush();
                    sw.Close();
                }

            }
            catch (Exception e)
            {
                e.ToString();

            }
        }




    }
}