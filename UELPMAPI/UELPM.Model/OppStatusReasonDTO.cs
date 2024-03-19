using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
   public class OppStatusReasonDTO
    {
        public int Id { set; get; }
        public string Name { set; get; }
        public Boolean IsActive { set; get; }
        public string GroupId { set; get; }
    }
}
