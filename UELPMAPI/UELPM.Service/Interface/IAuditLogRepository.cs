using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAuditLogRepository
    {
        IEnumerable<AuditLogData> GetAuditLogs(AuditLogSearch gridDisplayInput);
        IEnumerable<AuditLogData> SearchAuditLogs(AuditLogSearch gridDisplayInput);
        IEnumerable<AuditLogData> GetAuditLogsByDocumentId(AuditLogSearch gridDisplayInput);
    }
}
