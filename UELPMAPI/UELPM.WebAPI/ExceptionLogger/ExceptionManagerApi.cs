using log4net;
using System;
using System.Reflection;
using System.Web.Http.ExceptionHandling;
using UELPM.Model.Models;
using UELPM.WebAPI.Extensions;

namespace UELPM.WebAPI.ExceptionLogger
{
    public class ExceptionManagerApi : System.Web.Http.ExceptionHandling.ExceptionLogger
    {
        ILog _logger = null;
        public ExceptionManagerApi()
        {       
            var log4NetConfigDirectory = AppDomain.CurrentDomain.RelativeSearchPath ?? AppDomain.CurrentDomain.BaseDirectory;
        }
        public override void Log(ExceptionLoggerContext context)
        {
            _logger = log4net.LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
           // _logger.Error(context.Exception.ToString() + Environment.NewLine);
            MyAuditLog.ErrorLog(enumModuleCodes.Exception.ToString(), enumAuditType.Error.ToString(), "0", context.Exception.StackTrace.ToString(), 0, "ExceptionLogger", context.Exception.Message.ToString());

        }
        public void Log(string ex)
        {
            _logger = log4net.LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
            _logger.Error(ex);
        
        }
    }
}