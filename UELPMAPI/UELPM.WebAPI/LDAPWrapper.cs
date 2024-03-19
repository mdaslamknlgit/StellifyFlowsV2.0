using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using UELPM.Service.Interface;
using UELPM.Service.Repositories;

namespace UELPM.WebAPI
{
    public class LDAPWrapper
    {
        private ILDAPUserProfile _iladpUserProfile;
        
        public LDAPWrapper(ILDAPUserProfile lDAPUserProfile)
        {
            _iladpUserProfile = lDAPUserProfile;
            _iladpUserProfile.LDAPUserProfile();
        }
       
    }
}