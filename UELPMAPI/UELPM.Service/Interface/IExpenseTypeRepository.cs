using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IExpenseTypeRepository
    {
        ExpenseTypeDisplayResult GetExpenseType(GridDisplayInput displayInput);
        ExpenseTypeDisplayResult GetAllExpenseType(GridDisplayInput displayInput);
        ExpenseType GetExpenseType(int expenseTypeId);
        int CreateExpenseType(ExpenseType expenseType);
        int UpdateExpenseType(ExpenseType expenseType);
        bool DeleteExpenseType(ExpenseType expenseType);
        int ValidateExpenseType(ExpenseType expenseType);
    }
}
