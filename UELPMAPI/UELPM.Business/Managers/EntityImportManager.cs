using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class EntityImportManager : IEntityImportManager
    {
        public ResultReponse EntityImport(EntityImportList entityImportList, int EntityId, string EntityName, int UserId, int CompanyId, UserInfo MyUserInfo)
        {
            EntityImportRepository m_EntityImportRepository = new EntityImportRepository(MyUserInfo);
            return m_EntityImportRepository.EntityImport(entityImportList,EntityId, EntityName,UserId,CompanyId, MyUserInfo);
        }
    }
}
