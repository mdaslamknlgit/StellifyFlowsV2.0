using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IAuditLogManager
    {
        IEnumerable<AuditLogData> GetAuditLogs(AuditLogSearch gridDisplayInput);
        IEnumerable<AuditLogData> SearchAuditLogs(AuditLogSearch gridDisplayInput);
        IEnumerable<AuditLogData> GetAuditLogsByDocumentId(AuditLogSearch gridDisplayInput);
    }
}
