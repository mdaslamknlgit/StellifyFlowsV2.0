using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class CurrencyDTO
    {
        public int Id { set; get; }
        public string Code { set; get; }
        public string Name { set; get; }
        public string Symbol { set; get; }
        public string Rate { set; get; }
        public Boolean IsActive { set; get; }
        public Boolean IsDefault { set; get; }
    }
}
