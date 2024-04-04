using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Business.Interface
{
    public interface IEntityImportManager
    {
        ResultReponse EntityImport(EntityImportList entityImportList, int EntityId, string EntityName, int UserId, int CompanyId, UserInfo MyUserInfo);
    }
}
