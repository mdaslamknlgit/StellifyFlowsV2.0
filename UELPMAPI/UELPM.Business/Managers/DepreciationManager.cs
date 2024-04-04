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
    public class DepreciationManager : ManagerBase, IDepreciationManager
    {

        private readonly IDepreciationRepository m_depreciationRepository;

        public DepreciationManager(IDepreciationRepository depreciationRepository)
        {
            m_depreciationRepository = depreciationRepository;
        }

        public int CreateDepreciation(Depreciation depreciation)
        {
            return m_depreciationRepository.CreateDepreciation(depreciation);
        }

        public int DeleteDepreciation(Depreciation depreciation)
        {
            return m_depreciationRepository.DeleteDepreciation(depreciation);
        }

        public Depreciation GetDepreciationDetails(int depreciationId)
        {
            return m_depreciationRepository.GetDepreciationDetails(depreciationId);
        }

        public DepreciationDisplayResult GetDepreciations(GridDisplayInput gridDisplayInputs)
        {
            return m_depreciationRepository.GetDepreciations(gridDisplayInputs);
        }

        public DepreciationDisplayResult SearchDepreciations(GridDisplayInput gridDisplayInputs)
        {
            return m_depreciationRepository.SearchDepreciations(gridDisplayInputs);
        }

        public int UpdateDepreciation(Depreciation depreciation)
        {
            return m_depreciationRepository.UpdateDepreciation(depreciation);
        }

        public int ValidateDepreciationName(Depreciation depreciation)
        {
            return m_depreciationRepository.ValidateDepreciationName(depreciation);
        }
    }
}
