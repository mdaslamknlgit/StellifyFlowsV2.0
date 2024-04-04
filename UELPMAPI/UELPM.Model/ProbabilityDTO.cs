using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class ProbabilityDTO
    {
        public int Id { set; get; }
        public int value { set; get; }
        public string Name { set; get; }
        public int SortOrder { set; get; }
        public string WorkingDays { set; get; }
        public string Colour { set; get; }
        public Boolean ConvertToProcpect { set; get; }
        public int MoveOrder { get; set; }
        public Boolean IsActive { set; get; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime Updateddate { get; set; }
        public int DeletedBy { get; set; }
        public DateTime DeletedDate { get; set; }
        public string CreatedUser { get; set; }
        public string UpdatedUser { get; set; }
        public string DeletedUser { get; set; }
        public string Status { set; get; }
        public string ProsPect { set; get; }


    }

    public class ProbabilityDomainItem
    {
        public int Id { set; get; }
        public int value { set; get; }
        public string Name { set; get; }
    }

}
