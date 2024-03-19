using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.ExceptionHandling;
using UELPM.WebAPI.App_Start;
using UELPM.WebAPI.ExceptionLogger;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            var enableCorsAttribute = new EnableCorsAttribute("*",
            "Origin, Content-Type, Accept, Authorization", "GET, POST, PUT, DELETE, OPTIONS");
            config.EnableCors(enableCorsAttribute);

            // Add our custom filter to the configuration.
            config.Filters.Add(new ApiExceptionFilterAttribute());

            UnityConfig.ConfigureUnity(config);

            // Web API routes
            config.MapHttpAttributeRoutes();

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            //Register Exception Handler  
            config.Services.Add(typeof(IExceptionLogger), new ExceptionManagerApi());

            config.Routes.MapHttpRoute(
            name: "DefaultApi",
            routeTemplate: "api/{controller}/{id}",
            defaults: new { controller = "Browser", action = "Index", id = RouteParameter.Optional }
        );
        }
    }
}
