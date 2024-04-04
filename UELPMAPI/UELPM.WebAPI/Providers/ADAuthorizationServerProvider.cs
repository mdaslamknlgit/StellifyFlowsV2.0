using System.Threading.Tasks;
using Microsoft.Owin.Security.OAuth;
using System.DirectoryServices.AccountManagement;
using System.Security.Claims;
using System;

using UELPM.Service.Repositories;

namespace UELPM.WebAPI.Provider
{
    public class ADAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        UserProfileRepository userProfileRepository = new UserProfileRepository();
        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            context.Validated();
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {

            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });

            using (PrincipalContext pc = new PrincipalContext(ContextType.Domain, Environment.UserDomainName))
            {
                // validate the credentials
                bool isValid = pc.ValidateCredentials(context.UserName, context.Password.TrimEnd());

                if (!isValid)
                {
                    context.SetError("invalid_grant", "The user name or password is incorrect.");
                    return;
                }
            }
            var user = userProfileRepository.GetRolebyUser(context.UserName);
            var identity = new ClaimsIdentity(context.Options.AuthenticationType);
            identity.AddClaim(new Claim("userId", user.UserID.ToString()));
            identity.AddClaim(new Claim(ClaimTypes.Role, user.UserRole));

            context.Validated(identity);
        }
    }
}