using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ProjectDocument
    {
        public int DocumentId { get; set; }
        public string DraftCode { get; set; }
        public string DocumentCode { get; set; }
        public decimal DocumentValue { get; set; }
        public int DocumentTypeId { get; set; }
        public int DocumentWFStatusId { get; set; }
        public int CompanyId { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public int CreatedBy { get; set; }
        public string Remarks { get; set; }
        public int UserId { get; set; }
        public string UserRole { get; set; }
        public bool IsPrintAuditLog { get; set; }
        public int DepartmentId { get; set; }
    }
}
