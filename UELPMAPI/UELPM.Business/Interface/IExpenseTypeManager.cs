using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IExpenseTypeManager
    {
        int CreateExpenseType(ExpenseType expenseType);
        ExpenseTypeDisplayResult GetExpenseType(GridDisplayInput displayInput);
        ExpenseTypeDisplayResult GetAllExpenseType(GridDisplayInput displayInput);
        ExpenseType GetExpenseType(int expenseTypeId);
        int UpdateExpenseType(ExpenseType expenseType);
        bool DeleteExpenseType(ExpenseType expenseType);
       int ValidateExpenseType(ExpenseType expenseType);
    }
}
