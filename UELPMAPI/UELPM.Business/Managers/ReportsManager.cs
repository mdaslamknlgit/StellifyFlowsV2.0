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
    public class ReportsManager : IReportsManager
    {
        private readonly IReportsRepository m_reportRepository;
        public ReportsManager(IReportsRepository reportRepository)
        {
            m_reportRepository = reportRepository;
        }

        public ReportParamData GetParamData(int userId)
        {
            return m_reportRepository.GetParamData(userId);
        }
        public dynamic GetReportData(ReportParameter reportParameter)
        {
            return m_reportRepository.GetReportData(reportParameter);
        }
    }
}
