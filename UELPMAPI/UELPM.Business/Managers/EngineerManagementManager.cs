using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class EngineerManagementManager : IEngineerManagementManager
    {
        private IEngineerManagementRepository m_engineerManagementRepository;

        public EngineerManagementDisplayResult GetEngineerManagement(GridDisplayInput gridDisplayInput)
        {
            return m_engineerManagementRepository.GetEngineerManagement(gridDisplayInput);
        }

        public EngineerManagementDisplayResult GetFilterEngineerManagement(EngineerManagementFilterDisplayInput engineerManagementFilterDisplayInput)
        {
            return m_engineerManagementRepository.GetFilterEngineerManagement(engineerManagementFilterDisplayInput);
        }
        public EngineerManagement GetEngineerManagementDetails(int engineerId)
        {
            return m_engineerManagementRepository.GetEngineerManagementDetails(engineerId);
        }        

        public EngineerManagementManager(IEngineerManagementRepository engineerManagementRepository)
        {
            this.m_engineerManagementRepository = engineerManagementRepository;
        }

        public int CreateEngineerManagement(EngineerManagement engineerManagement)
        {
            return m_engineerManagementRepository.CreateEngineerManagement(engineerManagement);
        }

        public int UpdateEngineerManagement(EngineerManagement engineerManagement)
        {
            return m_engineerManagementRepository.UpdateEngineerManagement(engineerManagement);
        }

        public bool DeleteEngineerManagement(EngineerManagementDelete engineerManagementDelete)
        {
            return m_engineerManagementRepository.DeleteEngineerManagement(engineerManagementDelete);
        }      
    }
}
