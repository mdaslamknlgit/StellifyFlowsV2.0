using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class PriceListDTO
    {
        public int Id { set; get; }
        public string Name { set; get; }
        public DateTime StartDate { set; get; }
        public DateTime EndDate { set; get; }
        public string Currency { set; get; }
        public int CurId { set; get; }

        public string Description { set; get; }
        public Boolean IsDefault { set; get; }
        public string Status { set; get; }
        public string Oppurtunity { set; get; }
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

        public string StrtDate { set; get; }
        public string EdDate { set; get; }


    }
}
