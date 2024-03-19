using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IEngineerManagementRepository
    {
        EngineerManagementDisplayResult GetEngineerManagement(GridDisplayInput gridDisplayInput);
        EngineerManagementDisplayResult GetFilterEngineerManagement(EngineerManagementFilterDisplayInput engineerManagementFilterDisplayInput);
        int CreateEngineerManagement(EngineerManagement engineerManagement);
        int UpdateEngineerManagement(EngineerManagement engineerManagement);
        bool DeleteEngineerManagement(EngineerManagementDelete engineerManagementDelete);
        EngineerManagement GetEngineerManagementDetails(int engineerId);
    }
}
