using System;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;
using UELPM.WebAPI.Provider;
using System.Timers;
//using System.Threading;
using System.Configuration;
using UELPM.Service.Repositories;
using UELPM.Service.Interface;




[assembly: OwinStartup(typeof(UELPM.WebAPI.Startup))]

namespace UELPM.WebAPI
{
    public class Startup
    {
        private static Timer aTimer;
        public string ExecuionTime {
            get;set;
        }

       public void Configuration(IAppBuilder app)
        {
            HttpConfiguration config = new HttpConfiguration();

            ConfigureOAuth(app);

            WebApiConfig.Register(config);
            app.UseWebApi(config);

            // Create a timer and set a two second interval.
            aTimer = new Timer();
            aTimer.Interval = 1 * 30 * 1000;
          
            // Hook up the Elapsed event for the timer. 
            aTimer.Elapsed += OnTimedEvent;

            // Have the timer fire repeated events (true is the default)
            aTimer.AutoReset = true;

            // Start the timer
            aTimer.Enabled = true;

        }
        public void ConfigureOAuth(IAppBuilder app)
        {
            OAuthAuthorizationServerOptions OAuthServerOptions = new OAuthAuthorizationServerOptions()
            {
                AllowInsecureHttp = true,
                TokenEndpointPath = new PathString("/token"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
                Provider = new ADAuthorizationServerProvider()
            };

            // Token Generation
            app.UseOAuthAuthorizationServer(OAuthServerOptions);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());

        }

        private void OnTimedEvent(Object source, System.Timers.ElapsedEventArgs e)
        {
            string updateTime = ConfigurationManager.AppSettings["LDAPUpdateTime"] != null ?
                ConfigurationManager.AppSettings["LDAPUpdateTime"].ToString() : DateTime.Now.ToLongTimeString();
            if (updateTime == DateTime.Now.ToShortTimeString())
            {

                {
                    ILDAPUserProfile oldap = new LDAPUserProfileRepository();

                    LDAPWrapper obj = new LDAPWrapper(oldap);

                }

            }
        }
    }
}
