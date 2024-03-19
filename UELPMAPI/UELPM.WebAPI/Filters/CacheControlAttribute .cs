using System;
using System.Net.Http.Headers;
using System.Web.Http.Filters;

namespace UELPM.WebAPI.Filters
{
    public class CacheControlAttribute : System.Web.Http.Filters.ActionFilterAttribute
    {
        public int MaxAge { get; set; }

        public CacheControlAttribute()
        {
            MaxAge = 0;
        }

        public override void OnActionExecuted(HttpActionExecutedContext context)
        {
            if (context.Response != null)
                context.Response.Headers.CacheControl = new CacheControlHeaderValue()
                {
                    Public = true,
                    MaxAge = TimeSpan.FromSeconds(MaxAge)
                };

            base.OnActionExecuted(context);
        }
    }
}