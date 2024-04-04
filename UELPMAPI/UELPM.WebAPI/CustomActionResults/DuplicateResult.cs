using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using UELPM.Model.Models;

namespace UELPM.WebAPI.CustomActionResults
{
    public class DuplicateResult : IHttpActionResult
    {
        HttpRequestMessage _request;
        string _errorMessage;
        public DuplicateResult(HttpRequestMessage request,string errorMessage="")
        {
            _request = request;
            _errorMessage = errorMessage;
        }
        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(_request.CreateErrorResponse(HttpStatusCode.InternalServerError,String.IsNullOrEmpty(_errorMessage)? ErrorMessages.Duplicate:_errorMessage));
        }
    }
}