using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class AppSettingsDTO
    {
        public int Id { get; set; }
        public string SettingName { get; set; }
        public string SettingValue { get; set; }

        public string MaximumValue { get; set; }
        public string DefaultValue { get; set; }
    }
}
