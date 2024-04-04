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
using System.Data;
using System.Diagnostics;
using System.Net;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web.Http.Controllers;
using System.Xml.Linq;
using System.Xml;
using UELPM.Model.Models;
using UELPM.Model;
using UELPM.Business.Interface;

namespace UELPM.WebAPI
{
    public enum Position
    {
        Horizontal,
        Vertical
    }

    public static class Helpers
    {

        #region Variables
        private static ILog log;
        //private static readonly ILog log = LogManager.GetLogger(typeof(SetupCommanderController).FullName);
        static StringBuilder ErrorStr = new StringBuilder();

        public static object JobSchedularHelper { get; internal set; }
        #endregion

        #region Credit Card Validations
        public static bool validateCard(string CreditCardNumber)
        {
            bool isValid = false;
            Match match;
            Regex regexMC = new Regex(@"^(?:2131|1800|35\d{3})\d{11}$");
            Regex regexVisa = new Regex(@"^4[0-9]{12}(?:[0-9]{3})?$");

            match = regexMC.Match(CreditCardNumber); if (match.Success == true)
            {
                isValid = true;
            }
            return isValid;
        }

        public static bool ValidateCreditCard(string cardNumber)
        {
            //cardNumber = txtCreditCard.Text;
            int digitSum = 0;
            string digits = "";
            string reversedCardNumber = "";

            //removes spaces and reverse string 
            cardNumber = cardNumber.Replace(" ", null);
            for (int i = cardNumber.Length - 1; i >= 0; i--)
            {
                reversedCardNumber += cardNumber[i];
            }

            //double the digits in even-numbered positions
            for (int i = 0; i < reversedCardNumber.Length; i++)
            {
                if ((i + 1) % 2 == 0)
                {
                    digits += Convert.ToInt32(reversedCardNumber.Substring(i, 1)) * 2;
                }
                else
                {
                    digits += reversedCardNumber.Substring(i, 1);
                }
            }

            //add the digits
            for (int i = 0; i < digits.Length; i++)
            {
                digitSum += Convert.ToInt32(digits.Substring(i, 1));
            }

            //Check that the sum is divisible by 10
            if ((digitSum % 10) == 0)
                return true;
            else
                return false;
        }
        #endregion
        public static bool doesImageExistRemotely(string uriToImage, string mimeType)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uriToImage);
            request.Method = "HEAD";

            try
            {
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();

                if (response.StatusCode == HttpStatusCode.OK && response.ContentType == mimeType)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        public static void ChangeLogFile(string name)
        {
            string FileName = HttpContext.Current.Server.MapPath("~/log4net.config");
            XDocument xdoc = XDocument.Load(FileName);
            var element = xdoc.Elements("File").Single();
            element.Value = "name";
            xdoc.Save(FileName);
        }
        public static void changeXMLVal(string element, string value)
        {
            string FileName = HttpContext.Current.Server.MapPath("~/log4net.config");
            try
            {
                string fileLoc = FileName;
                XmlDocument doc = new XmlDocument();
                doc.Load(fileLoc);
                XmlNode node = doc.SelectSingleNode("/MyXmlType/" + element);
                if (node != null)
                {
                    node.InnerText = value;
                }
                else
                {
                    XmlNode root = doc.DocumentElement;
                    XmlElement elem;
                    elem = doc.CreateElement(element);
                    elem.InnerText = value;
                    root.AppendChild(elem);
                }
                doc.Save(fileLoc);
                doc = null;
            }
            catch (Exception)
            {
                /*
                 * Possible Exceptions:
                 *  System.ArgumentException
                 *  System.ArgumentNullException
                 *  System.InvalidOperationException
                 *  System.IO.DirectoryNotFoundException
                 *  System.IO.FileNotFoundException
                 *  System.IO.IOException
                 *  System.IO.PathTooLongException
                 *  System.NotSupportedException
                 *  System.Security.SecurityException
                 *  System.UnauthorizedAccessException
                 *  System.UriFormatException
                 *  System.Xml.XmlException
                 *  System.Xml.XPath.XPathException
                */
            }
        }

        public static bool ChangeLogFileLocation1(string NewFileName)
        {
            XmlConfigurator.Configure();
            log4net.Repository.Hierarchy.Hierarchy h =
            (log4net.Repository.Hierarchy.Hierarchy)LogManager.GetRepository();
            foreach (IAppender a in h.Root.Appenders)
            {
                if (a is FileAppender)
                {
                    FileAppender fa = (FileAppender)a;
                    // Programmatically set this to the desired location here
                    string logFileLocation = NewFileName;

                    // Uncomment the lines below if you want to retain the base file name
                    // and change the folder name...
                    //FileInfo fileInfo = new FileInfo(fa.File);
                    //logFileLocation = string.Format(@"C:\MySpecialFolder\{0}", fileInfo.Name);

                    fa.File = logFileLocation;
                    fa.ActivateOptions();
                    break;
                }
            }
            return true;
        }

        public static void ChangeFileLocation(string NewFileLocation)
        {
            string LogFileName = HttpContext.Current.Server.MapPath("~/log4net.config");
            //XmlConfigurator.Configure();
            FileInfo mFileInfo = new FileInfo(LogFileName);
            XmlConfigurator.ConfigureAndWatch(mFileInfo);
            log4net.Repository.Hierarchy.Hierarchy h = (log4net.Repository.Hierarchy.Hierarchy)LogManager.GetRepository();

            foreach (IAppender a in h.Root.Appenders)
            {
                if (a is FileAppender)
                {
                    FileAppender fa = (FileAppender)a;
                    string sNowDate = DateTime.Now.ToLongDateString();
                    // Programmatically set this to the desired location here
                    string FileLocationinWebConfig = fa.File;
                    //string logFileLocation = FileLocationinWebConfig + _Project + "\\" + _CustomerName + "\\" + sNowDate + ".log";
                    string logFileLocation = NewFileLocation;

                    fa.File = logFileLocation;
                    fa.ActivateOptions();
                    break;
                }

            }
            XmlDocument doc = new XmlDocument();


            string xmlFile = File.ReadAllText(LogFileName);
            doc.LoadXml(xmlFile);

            XDocument xdoc = XDocument.Load(LogFileName);

            if (xdoc.Descendants("appender").Elements("param").Attributes("name").FirstOrDefault().Value == "File")
            {
                xdoc.Descendants("appender").Elements("param").Attributes("value").FirstOrDefault().Value = NewFileLocation;
            }
            xdoc.Save(LogFileName);
        }

        public static string RemoveBetween(string s, char begin, char end)
        {
            Regex regex = new Regex(string.Format("\\{0}.*?\\{1}", begin, end));
            return regex.Replace(s, string.Empty);
        }

        public static void ErrorLog(string controllerName, string methodName, string exception)
        {
            log = LogManager.GetLogger(controllerName);
            ErrorStr.AppendLine("\n*************************************************************************************************************************************\n");
            ErrorStr.AppendFormat("Function Name : {0} \n Message : {1}\n", methodName, exception);
            ErrorStr.AppendLine("***************************************************************************************************************************************\n");
            log.Error(ErrorStr);
        }

        public static void TraceInfo(string controllerName, string methodName, string exception)
        {
            log = LogManager.GetLogger(controllerName);
            ErrorStr.AppendFormat("\nTrace Info Function Name : {0} , Message : {1}\n", methodName, exception);
            log.Info(ErrorStr);


        }

        public static void Info(string controllerName, string methodName, string message)
        {
            log = LogManager.GetLogger(controllerName);
            ErrorStr.AppendFormat("\nTrace Info Function Name : {0} , Message : {1}\n", methodName, message);
            log.Info(ErrorStr);

        }
        public static void Move<T>(this List<T> list, int oldIndex, int newIndex)
        {
            T aux = list[newIndex];
            list[newIndex] = list[oldIndex];
            list[oldIndex] = aux;
        }

        public static string GetLogFilePath()
        {
            string ReturnValue = "";
            string Log4NetFileLocation = "";
            try
            {
                Assembly assembly = Assembly.GetExecutingAssembly();
                FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(assembly.Location);

                Log4NetFileLocation = string.Format("C:\\ProgramData\\ROVABU Software BV\\Setup Commander Service Portal\\{0}\\", fvi.FileVersion.ToString());
                HttpContext.Current.Session["LogFilePath"] = Log4NetFileLocation;
                ReturnValue = Log4NetFileLocation;
            }
            catch (Exception exp)
            {
                log.Error("Error GetLogFilePath : " + exp);
            }
            return ReturnValue;
        }

        public static string GetSelectedLogFilePath(string logPath)
        {
            string ReturnValue = "";
            string Log4NetFileLocation = "";
            try
            {
                Assembly assembly = Assembly.GetExecutingAssembly();
                FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(assembly.Location);

                if (logPath == null)
                {
                    Log4NetFileLocation = string.Format("C:\\ProgramData\\ROVABU Software BV\\{0}\\{1}\\", logPath, fvi.FileVersion.ToString());
                }
                else
                {
                    Log4NetFileLocation = logPath;
                }
                //HttpContext.Current.Session["LogFilePath"] = Log4NetFileLocation;
                ReturnValue = Log4NetFileLocation;
            }
            catch (Exception exp)
            {
                log.Error("Error GetLogFilePath : " + exp);
            }
            return ReturnValue;
        }
        public static string GetLogLocation()
        {
            string LogFileName = HttpContext.Current.Server.MapPath("~/log4net.config");
            //XmlConfigurator.Configure();
            FileInfo mFileInfo = new FileInfo(LogFileName);
            XmlConfigurator.ConfigureAndWatch(mFileInfo);
            log4net.Repository.Hierarchy.Hierarchy h = (log4net.Repository.Hierarchy.Hierarchy)LogManager.GetRepository();

            string LogLocationPath = "";
            foreach (IAppender a in h.Root.Appenders)
            {
                if (a is FileAppender)
                {
                    FileAppender fa = (FileAppender)a;
                    string sNowDate = DateTime.Now.ToLongDateString();
                    // Programmatically set this to the desired location here
                    string FileLocationinWebConfig = fa.File;
                    LogLocationPath = FileLocationinWebConfig;
                    break;
                }

            }
            return LogLocationPath;
        }

        #region Log System
        public static List<LogFile> LogFileList(string logFilePath)
        {
            string Log4NetFileLocation = "";
            try
            {

                List<LogFile> LogFileList = new List<LogFile>();

                //string path = Helpers.GetLogFilePath();
                //string path = Helpers.GetSelectedLogFilePath(logFilePath);
                string path = logFilePath;
                Log4NetFileLocation = path;
                HttpContext.Current.Session["LogFilePath"] = Log4NetFileLocation;
                foreach (string file in Directory.EnumerateFiles(path, "*.log"))
                {
                    LogFile logfile = new LogFile();

                    //FileSystem fileSystem = new FileSystem();
                    logfile = GetLogFileData(path, file);
                    LogFileList.Add(logfile);
                }
                return LogFileList;
            }
            catch (Exception ex)
            {
                var Message = ex.ToString();
                throw ex;
            }

        }

        public static LogFile GetLogFileData(string logfilePath, string logFile)
        {
            LogFile logfile = new LogFile();
            string path;
            path = Path.Combine(logFile);
            logfile.Name = Path.GetFileNameWithoutExtension(logFile);
            logfile.Date = File.GetLastWriteTime(logFile);
            FileInfo f = new FileInfo(logFile);
            logfile.Length = f.Length;
            return logfile;
        }
        #endregion

        #region Util Functions
        public static String ConvertDataTableTojSonString(DataTable dataTable)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer =
                   new System.Web.Script.Serialization.JavaScriptSerializer();

            List<Dictionary<String, Object>> tableRows = new List<Dictionary<String, Object>>();

            Dictionary<String, Object> row;

            foreach (DataRow dr in dataTable.Rows)
            {
                row = new Dictionary<String, Object>();
                foreach (DataColumn col in dataTable.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }
                tableRows.Add(row);
            }
            return serializer.Serialize(tableRows);
        }

        #endregion

        public static string GenerateTokenS(UserProfile usersDTO)
        {

            string hashuseremail = "";
            string hashuserid = "";
            string hashtenantid = "";
            string hashusername = "";
            string generateDAte = "";
            string expiredDate = "";
            string databasename = "";
            string hashexpired = "";
            string UserId = "";
            string UsersIds = "";

            DateTime ExpiredDate;
            DateTime GeneratedDate;

            GeneratedDate = DateTime.Now;
            ExpiredDate = DateTime.Now.AddHours(1);


            hashuseremail = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.EmailId));
            hashuserid = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UserID.ToString()));
            hashtenantid = Convert.ToBase64String(Encoding.UTF8.GetBytes("1"));
            hashusername = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UserName.ToString()));


            generateDAte = Convert.ToBase64String(Encoding.UTF8.GetBytes(GeneratedDate.ToString()));
            expiredDate = Convert.ToBase64String(Encoding.UTF8.GetBytes(ExpiredDate.ToString()));
            databasename = Convert.ToBase64String(Encoding.UTF8.GetBytes("EMPTY"));
            hashexpired = Convert.ToBase64String(Encoding.UTF8.GetBytes(ExpiredDate.ToString()));
            UserId = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UserID.ToString()));
            UsersIds = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UserIds.ToString()));

            return Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Join(":", hashuseremail, hashuserid, hashtenantid, hashusername, generateDAte, expiredDate, databasename,UserId, UsersIds)));
        }
        public static string GenerateToken(UserDTO usersDTO)
        {

            string hashuseremail = "";
            string hashuserid = "";
            string hashtenantid = "";
            string hashusername = "";
            string generateDAte = "";
            string expiredDate = "";
            string databasename = "";
            string hashexpired = "";
            string usersIds = "";

            DateTime ExpiredDate;
            DateTime GeneratedDate;

            GeneratedDate = DateTime.Now;
            ExpiredDate = DateTime.Now.AddHours(1);


            hashuseremail = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UserEmail));
            hashuserid = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.Id.ToString()));
            hashtenantid = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.TenantId.ToString()));
            hashusername = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UserName.ToString()));


            generateDAte = Convert.ToBase64String(Encoding.UTF8.GetBytes(GeneratedDate.ToString()));
            expiredDate = Convert.ToBase64String(Encoding.UTF8.GetBytes(ExpiredDate.ToString()));
            databasename = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.DatabaseName.ToString()));
            hashexpired = Convert.ToBase64String(Encoding.UTF8.GetBytes(ExpiredDate.ToString()));
            usersIds = Convert.ToBase64String(Encoding.UTF8.GetBytes(usersDTO.UsersIds.ToString()));

            return Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Join(":", hashuseremail, hashuserid, hashtenantid, hashusername, generateDAte, expiredDate, databasename, usersIds)));
        }


        public static UserManagement ValidateToken_Old(string StellifyAuthToken, HttpActionContext actionContext)
        {
            try
            {
                var provider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(serviceType: typeof(IUserManagementManager)) as IUserManagementManager;
                UserManagement MyUserInfo = null;
                string GenToken = Encoding.UTF8.GetString(Convert.FromBase64String(StellifyAuthToken));
                string[] parts = GenToken.Split(new char[] { ':' });
                string Email = Encoding.UTF8.GetString(Convert.FromBase64String(parts[0]));
                int UserId = Convert.ToInt32(Encoding.UTF8.GetString(Convert.FromBase64String(parts[1])));
                int TenantId = Convert.ToInt32(Encoding.UTF8.GetString(Convert.FromBase64String(parts[2])));
                string UserName = Encoding.UTF8.GetString(Convert.FromBase64String(parts[3]));
                string GeneratedDate = Encoding.UTF8.GetString(Convert.FromBase64String(parts[4]));
                string ExpiredDate = Encoding.UTF8.GetString(Convert.FromBase64String(parts[5]));
                string DatabaseName = Encoding.UTF8.GetString(Convert.FromBase64String(parts[6]));
                string UsersIds = Encoding.UTF8.GetString(Convert.FromBase64String(parts[7]));
                MyUserInfo = provider.TokenValidation(Email, UserId);

                if (MyUserInfo != null)
                {
                    return MyUserInfo;
                }
                else
                {
                    return null;
                }

                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public static UserProfile ValidateToken(string StellifyAuthToken, HttpActionContext actionContext)
        {
            try
            {
                var provider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(serviceType: typeof(IUserManagementManager)) as IUserManagementManager;
                UserProfile MyUserInfo = null;
                string GenToken = Encoding.UTF8.GetString(Convert.FromBase64String(StellifyAuthToken));
                string[] parts = GenToken.Split(new char[] { ':' });
                string Email = Encoding.UTF8.GetString(Convert.FromBase64String(parts[0]));
                string hashuserid = Encoding.UTF8.GetString(Convert.FromBase64String(parts[1])).ToString();
                int TenantId = Convert.ToInt32(Encoding.UTF8.GetString(Convert.FromBase64String(parts[2])));
                string UserName = Encoding.UTF8.GetString(Convert.FromBase64String(parts[3]));
                string GeneratedDate = Encoding.UTF8.GetString(Convert.FromBase64String(parts[4]));
                string ExpiredDate = Encoding.UTF8.GetString(Convert.FromBase64String(parts[5]));
                string DatabaseName = Encoding.UTF8.GetString(Convert.FromBase64String(parts[6]));                
                int UserId = Convert.ToInt32(Encoding.UTF8.GetString(Convert.FromBase64String(parts[7])));
                string UsersIds = Encoding.UTF8.GetString(Convert.FromBase64String(parts[8]));

                var UserProfileProvider = actionContext.ControllerContext.Configuration.DependencyResolver.GetService(typeof(IUserProfileManager)) as IUserProfileManager;

               MyUserInfo= UserProfileProvider.TokenValidation(UserName, UserId);
                //MyUserInfo = provider.TokenValidation(Email, UserId);

                if (MyUserInfo != null)
                {
                    return MyUserInfo;
                }
                else
                {
                    return null;
                }

                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public static List<RecursiveObject> FillRecursive(List<FlatObject> flatObjects, int parentId)
        {
            List<RecursiveObject> recursiveObjects = new List<RecursiveObject>();
            foreach (var item in flatObjects.Where(x => x.ParentId.Equals(parentId)))
            {
                if(item.ParentId>0)
                {
                    var BreakHere = "Break Here";
                }
                DataInfo dataInfo  = new DataInfo();
                dataInfo.UserName = item.Data;
                dataInfo.ManagerId = item.ParentId.ToString();
                dataInfo.UserId = item.Id;
                recursiveObjects.Add(new RecursiveObject
                {
                    data = dataInfo,
                    //Data = item.Data,
                    //Id = item.Id,
                    children = FillRecursive(flatObjects, item.Id)
                });
            }
                return recursiveObjects;
        }
    }
    public class FlatObject
    {
        public int Id { get; set; }
        public int ParentId { get; set; }
        public string Data { get; set; }
        public FlatObject(string name, int id, int parentId)
        {
            Data = name;
            Id = id;
            ParentId = parentId;
        }
    }

    public class RecursiveObject
    {
        //public int Id { get; set; }
        //public int ParentId { get; set; }
        //public string Data { get; set; }
        public DataInfo data { get; set; }
        public List<RecursiveObject> children { get; set; }
    }

    public class DataInfo
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string ManagerId { get; set; }
    }
}
