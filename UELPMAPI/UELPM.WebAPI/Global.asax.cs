using System.Web.Http;
using UELPM.Scheduler;

namespace UELPM.WebAPI
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);           
            log4net.Config.XmlConfigurator.Configure();
            JobScheduler.Start();
        }

        protected void Application_End()
        {           
            JobScheduler.ShutDown();
          
        }
    }
}
