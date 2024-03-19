using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class AuditLogData
    {
        public int Id { get; set; }
        public int? DocumentId { get; set; }
        public string DocumentCode { get; set; }
        public int CompanyId { get; set; }
        public DateTime LogDate { get; set; }
        public string Level { get; set; }
        public string LoggerRole { get; set; }
        public int Logger { get; set; }
        public string LoggedInUser { get; set; }
        public string Message { get; set; }
        public string Exception { get; set; }
        public string PageName { get; set; }
        public string Method { get; set; }
        public string Action { get; set; }
        public string Changes { get; set; }
        public List<AuditDelta> AuditChanges { get; set; }
        public string Remarks { get; set; }
    }
    public class AuditLogSearch
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int CompanyId { get; set; }
        public int DocumentId { get; set; }
        public string PageName { get; set; }
    }
    public class AuditDelta
    {
        public string FieldName { get; set; }
        public string ValueBefore { get; set; }
        public string ValueAfter { get; set; }
    }
}
