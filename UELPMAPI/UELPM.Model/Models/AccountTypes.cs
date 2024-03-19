using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AccountTypes
    {
        public int COAAccountTypeId { get; set; }
        public string AccountType { get; set; }
        public string Description { get; set; }
        public int IsDeleted { get; set; }
    }

    public class AccountTypesDisplayResult
    {
        public List<AccountTypes> AccountTypesList { get; set; }
        public int TotalRecords { get; set; }
    }




}
