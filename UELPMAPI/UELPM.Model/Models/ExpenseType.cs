using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ExpenseType
    {
        public int ExpenseTypeId { get; set; }
        public string ExpenseTypeName { get; set; }
        public string ExpenseTypeDescription { get; set; }
        public bool? isDeleted { get; set; }
        public int CreatedBy { get; set; }
    }

    public class ExpenseTypeDisplayResult
    {
        public List<ExpenseType> ExpenseTypes { get; set; }
        public int TotalRecords { get; set; }
    }
}
