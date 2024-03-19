using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Service.Interface
{
    public interface IEntityImportRepository
    {
        ResultReponse EntityImport(EntityImportList entityImportList, int EntityId, string EntityName, int UserId, int CompanyId, UserInfo MyUserInfo);
    }
}
