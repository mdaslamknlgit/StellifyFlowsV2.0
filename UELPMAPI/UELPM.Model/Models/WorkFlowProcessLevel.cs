using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class WorkFlowProcessLevel
    {
        public int WorkFlowProcessId { get; set; }
        public int WorkFlowConfigurationId { get; set; }
        public int LevelOrder { get; set; }
        public int ProcessIndex { get; set; }
        public bool IsDeleted { get; set; }
        public List<WorkFlowLevel> WorkFlowLevels { get; set; }
    }
}
