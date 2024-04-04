using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class WorkflowAuditTrail
    {
         public int WorkflowAuditTrailId { get; set; }
         public int Documentid { get; set; }
         public int UserId { get; set; }
         public string UserName { get; set; }
         public string Remarks { get; set; }
         public DateTime CreatedDate { get; set; }
         public int Statusid { get; set; }
         public int ProcessId { get; set; }
         public int DocumentUserId { get; set; }

    }
    public class WorkflowAuditTrailDisplayResult
    {
        public List<WorkflowAuditTrail>  WorkflowAuditTrails { get; set; }
        public int TotalRecords { get; set; }
    }

}
