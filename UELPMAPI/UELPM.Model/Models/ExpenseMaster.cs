using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ExpenseMaster
    {
        public int ExpensesMasterId { get; set; }
        public string ExpensesDetail { get; set; }
        public int ExpensesTypeId { get; set; }
        public string ExpensesType { get; set; }
		public int LocationID { get; set; }
        public string Location { get; set; }
        public int Skip { get; set; }
        public int Take { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class ExpenseMasterDisplayResult
    {
        public List<ExpenseMaster> Expenses { get; set; }
        public int TotalRecords { get; set; }
    }

    public class ExpenseMasterSearch: GridDisplayInput
    {
        public int DepartmentId { get; set; }
        public int ExpensesTypeId { get; set; }
    }
}
