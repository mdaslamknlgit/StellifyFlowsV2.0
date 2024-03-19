using log4net;
using System;
using System.IO;
using context = System.Web.HttpContext;

namespace UELPM.Service.Helpers
{
    public static class ErrorLog
    {
        private static ILog log;
        public static void Log(string controllerName, string methodName, string component, string exception)
        {
            var line = Environment.NewLine;
            string filepath = context.Current.Server.MapPath("~/LogFile/");
            if (!Directory.Exists(filepath))
            {
                Directory.CreateDirectory(filepath);
            }
            filepath = filepath + DateTime.Today.ToString("dd-MM-yy") + ".txt";
            if (!File.Exists(filepath))
            {
                File.Create(filepath).Dispose();
            }
            using (StreamWriter sw = File.AppendText(filepath))
            {
                string error = "controllerName:" + " " + controllerName + line +
                    "Method :" + " " + methodName + line +
                    "component:" + " " + component + line +
                    "Exception :" + " " + exception + line +
                    "DateTime:" + " " + DateTime.Now.ToString() + line;
                sw.WriteLine(error);
                sw.WriteLine(line);
                sw.Flush();
                sw.Close();
            }
        }
    }
}
