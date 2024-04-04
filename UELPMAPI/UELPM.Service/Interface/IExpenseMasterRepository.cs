using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public  interface IExpenseMasterRepository
    {
        ExpenseMasterDisplayResult GetExpenseMasters(GridDisplayInput gridDisplayInput);
        ExpenseMasterDisplayResult SearchExpenseMasters(ExpenseMasterSearch gridDisplayInput);
        ExpenseMaster GetExpenseMasterDetails(int expenseMasterId);
        int CreateExpenseMaster(ExpenseMaster expenseMaster);
        int UpdateExpenseMaster(ExpenseMaster expenseMaster);
        int DeleteExpenseMaster(ExpenseMaster expenseMaster);
    }
}
