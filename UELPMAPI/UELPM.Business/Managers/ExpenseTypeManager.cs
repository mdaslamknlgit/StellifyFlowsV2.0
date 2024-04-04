using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ExpenseTypeManager:IExpenseTypeManager
    {
        private readonly IExpenseTypeRepository m_expenseTypeRepository;

        public ExpenseTypeManager(IExpenseTypeRepository expenseTypeRepository)
        {
            m_expenseTypeRepository = expenseTypeRepository;
        }

        public int CreateExpenseType(ExpenseType expenseType)
        {
            return m_expenseTypeRepository.CreateExpenseType(expenseType);
        }
        public bool DeleteExpenseType(ExpenseType expenseType)
        {
            return m_expenseTypeRepository.DeleteExpenseType(expenseType);
        }

        public ExpenseTypeDisplayResult GetAllExpenseType(GridDisplayInput displayInput)
        {
            return m_expenseTypeRepository.GetAllExpenseType(displayInput);
        }

        public ExpenseTypeDisplayResult GetExpenseType(GridDisplayInput displayInput)
        {
            return m_expenseTypeRepository.GetExpenseType(displayInput);
        }

        public ExpenseType GetExpenseType(int expenseTypeId)
        {
            return m_expenseTypeRepository.GetExpenseType(expenseTypeId);
        }

        public int UpdateExpenseType(ExpenseType expenseType)
        {
            return m_expenseTypeRepository.UpdateExpenseType(expenseType);
        }

        public int ValidateExpenseType(ExpenseType expenseType)
        {
            return m_expenseTypeRepository.ValidateExpenseType(expenseType);
        }


    }
}
