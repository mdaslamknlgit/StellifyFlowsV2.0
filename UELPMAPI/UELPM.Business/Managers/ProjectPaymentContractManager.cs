using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ProjectPaymentContractManager : IProjectPaymentContractManager
    {
        private readonly IProjectPaymentContractRepository m_projectPaymentContractRepository;

        public ProjectPaymentContractManager(IProjectPaymentContractRepository projectPaymentContractRepository)
        {
            m_projectPaymentContractRepository = projectPaymentContractRepository;
        }
        public int CreateProjectPaymentContract(ProjectPaymentContract projectPaymentContract)
        {
            return m_projectPaymentContractRepository.CreateProjectPaymentContract(projectPaymentContract);
        }
        public ProjectPaymentContract getCertificatesByPaymentContractId(int POPId, int PaymentContractId)
        {
            return m_projectPaymentContractRepository.getCertificatesByPaymentContractId(POPId, PaymentContractId);
        }
        public List<ProjectPayment> getProjectPaymentContracts(GridDisplayInput gridDisplayInput)
        {
            return m_projectPaymentContractRepository.getProjectPaymentContracts(gridDisplayInput);
        }
        public bool CheckPendingApprovals(int pOPId)
        {
            return m_projectPaymentContractRepository.CheckPendingApprovals(pOPId);
        }
        public List<ProjectPayment> getPaymentListFilterData(ProjectPaymentListFilter projectPaymentListFilter)
        {
            return m_projectPaymentContractRepository.getPaymentListFilterData(projectPaymentListFilter);
        }

        public ProjectPaymentExport getProjectPaymentReport(ReportParams reportParams)
        {
            return m_projectPaymentContractRepository.getProjectPaymentReport(reportParams);
        }
    }
}
