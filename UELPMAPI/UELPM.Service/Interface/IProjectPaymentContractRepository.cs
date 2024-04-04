using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IProjectPaymentContractRepository
    {
        int CreateProjectPaymentContract(ProjectPaymentContract projectPaymentContract);
        ProjectPaymentContract getCertificatesByPaymentContractId(int POPId, int PaymentContractId);
        List<ProjectPayment> getProjectPaymentContracts(GridDisplayInput gridDisplayInput);
        bool CheckPendingApprovals(int pOPId);
        List<ProjectPayment> getPaymentListFilterData(ProjectPaymentListFilter projectPaymentListFilter);
        ProjectPaymentExport getProjectPaymentReport(ReportParams reportParams);
    }
}
