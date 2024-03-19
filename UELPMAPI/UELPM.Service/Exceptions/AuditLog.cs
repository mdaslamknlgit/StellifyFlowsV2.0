using log4net;
using System.Text;
using UELPM.Service.Repositories;

namespace UELPM.Service.Exceptions
{
    public static class AuditLog
    {
        private static ILog log;
        static StringBuilder messageStr = new StringBuilder();
        private const string ActionIdReference = "Action";
        public static readonly int SourceId;

        static AuditLog()
        {

        }

        public static void Info(string moduleName, string action, string user, string docId, string method, string message, int companyId = 0, string changes = "")
        {
            try
            {
                log4net.Config.XmlConfigurator.Configure();
                messageStr.Clear();
                log = LogManager.GetLogger(typeof(AuditLog));

                log4net.LogicalThreadContext.Properties["documentId"] = docId;
                log4net.LogicalThreadContext.Properties["pageName"] = moduleName;
                log4net.LogicalThreadContext.Properties["method"] = method;
                log4net.LogicalThreadContext.Properties["action"] = action;
                log4net.LogicalThreadContext.Properties["companyId"] = companyId;
                //messageStr.AppendFormat("\n Module : {0} , Action : {1}\n", moduleName, action);
                messageStr.AppendFormat(message);
                log.Info(messageStr);

                AuditLogRepository repo = new AuditLogRepository();
                repo.WriteAuditLog(moduleName, action, user, docId, "INFO", method, message, changes, companyId);
            }
            catch (System.Exception ex)
            {
                log.Info(ex.Message);
            }
        }
        public static void ErrorLog(string moduleName, string action, string user, string exception, string docId, string method, string message, int companyId = 0)
        {
            messageStr.Clear();
            log = LogManager.GetLogger(user);
            log4net.LogicalThreadContext.Properties["documentId"] = docId;
            log4net.LogicalThreadContext.Properties["pageName"] = moduleName;
            log4net.LogicalThreadContext.Properties["method"] = method;
            log4net.LogicalThreadContext.Properties["action"] = action;
            log4net.LogicalThreadContext.Properties["exception"] = exception;
            log4net.LogicalThreadContext.Properties["companyId"] = companyId;
            messageStr.AppendFormat("Message : ", message);
            log.Error(messageStr);
        }

        public static void Info(string controllerName, string methodName, string message)
        {
            log = LogManager.GetLogger(controllerName);
            messageStr.AppendFormat("\nTrace Info Function Name : {0} , Message : {1}\n", methodName, message);
            log.Info(messageStr);

        }


    }
}
