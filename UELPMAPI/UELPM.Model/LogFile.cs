using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace UELPM.Model
{
    public class LogFile
    {
        public string Name { get; set; }

        public DateTime Date { get; set; }

        public long Length { get; set; }
    }
}
