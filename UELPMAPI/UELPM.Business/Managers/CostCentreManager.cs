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
    public class CostCentreManager : ManagerBase, ICostCentreManager
    {
        private ICostCentreRepository m_costCentreRepository;

        public CostCentreManager(ICostCentreRepository costCentreRepository)
        {
            this.m_costCentreRepository = costCentreRepository;
        }

        public CostCentreDisplayResult SearchCostCentres(GridDisplayInput gridDisplay)
        {
            return m_costCentreRepository.SearchCostCentres(gridDisplay);
        }

        public CostCentreDisplayResult GetCostCentres(GridDisplayInput gridDisplay)
        {
            return  m_costCentreRepository.GetCostCentres(gridDisplay);
        }


        public CostCentre GetCostCentresById(int CostCenterid)
        {
            return m_costCentreRepository.GetCostCentresById(CostCenterid);
        }
        public CostCentre GetCostCentreDetails(int costCentreId)
        {
            return m_costCentreRepository.GetCostCentreDetails(costCentreId);
        }

        public int CreateCostCentre(CostCentre costCentre)
        {
            return m_costCentreRepository.CreateCostCentre(costCentre);
        }

        public int UpdateCostCentre(CostCentre costCentre)
        {
            return m_costCentreRepository.UpdateCostCentre(costCentre);
        }

        public int DeleteCostCentre(CostCentre costCentre)
        {
            return m_costCentreRepository.DeleteCostCentre(costCentre);
        }

        public int ValidateCostCentreName(CostCentre costCentre)
        {
            return m_costCentreRepository.ValidateCostCentreName(costCentre);
        }
    }
}
