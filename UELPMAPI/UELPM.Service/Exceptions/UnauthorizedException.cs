using System.Net;

namespace UELPM.Service.Exceptions
{
    public class UnauthorizedException : ApiException
    {
        public UnauthorizedException()
            : base(HttpStatusCode.Unauthorized)
        {
        }

        public UnauthorizedException(string message)
            : base(HttpStatusCode.Unauthorized, HttpStatusCode.Unauthorized.ToString(), message)
        {
        }
    }
}
