using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class AuditLogManager : IAuditLogManager
    {
        private readonly IAuditLogRepository m_auditLogRepository;  

        public AuditLogManager(IAuditLogRepository auditLogRepository)
        {
            m_auditLogRepository = auditLogRepository;
        }

        public IEnumerable<AuditLogData> GetAuditLogs(AuditLogSearch gridDisplayInput)
        {
            return m_auditLogRepository.GetAuditLogs(gridDisplayInput);
        }

        public IEnumerable<AuditLogData> GetAuditLogsByDocumentId(AuditLogSearch gridDisplayInput)
        {
            return m_auditLogRepository.GetAuditLogsByDocumentId(gridDisplayInput);
        }

        public IEnumerable<AuditLogData> SearchAuditLogs(AuditLogSearch gridDisplayInput)
        {
            return m_auditLogRepository.SearchAuditLogs(gridDisplayInput);
        }
    }
}
