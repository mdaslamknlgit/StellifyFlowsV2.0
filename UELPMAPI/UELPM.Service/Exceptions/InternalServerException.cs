using System.Net;

namespace UELPM.Service.Exceptions
{
    public class InternalServerException : ApiException
    {
        public InternalServerException()
           : base(HttpStatusCode.NotFound)
        {
        }

        public InternalServerException(string message)
            : base(HttpStatusCode.InternalServerError, HttpStatusCode.NotFound.ToString(), message)
        {
        }
    }
}
