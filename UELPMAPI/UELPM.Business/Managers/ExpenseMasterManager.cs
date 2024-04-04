using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ExpenseMasterManager : IExpenseMasterManager
    {
        private readonly IExpenseMasterRepository m_expenseMasterRepository;

        public ExpenseMasterManager(IExpenseMasterRepository expenseMasterRepository)
        {
            m_expenseMasterRepository = expenseMasterRepository;
        }

        public int CreateExpenseMaster(ExpenseMaster expenseMaster)
        {
            return m_expenseMasterRepository.CreateExpenseMaster(expenseMaster);
        }

        public int DeleteExpenseMaster(ExpenseMaster expenseMaster)
        {
            return m_expenseMasterRepository.DeleteExpenseMaster(expenseMaster);
        }

        public ExpenseMaster GetExpenseMasterDetails(int expenseMasterId)
        {
            return m_expenseMasterRepository.GetExpenseMasterDetails(expenseMasterId);
        }

        public ExpenseMasterDisplayResult GetExpenseMasters(GridDisplayInput gridDisplayInput)
        {
            return m_expenseMasterRepository.GetExpenseMasters(gridDisplayInput);
        }

        public ExpenseMasterDisplayResult SearchExpenseMasters(ExpenseMasterSearch gridDisplayInput)
        {
            return m_expenseMasterRepository.SearchExpenseMasters(gridDisplayInput);
        }

        public int UpdateExpenseMaster(ExpenseMaster expenseMaster)
        {
            return m_expenseMasterRepository.UpdateExpenseMaster(expenseMaster);
        }
    }
}
