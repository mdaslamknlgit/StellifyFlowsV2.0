using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IEngineerManagementManager
    {
        EngineerManagementDisplayResult GetEngineerManagement(GridDisplayInput gridDisplayInput);
        EngineerManagementDisplayResult GetFilterEngineerManagement(EngineerManagementFilterDisplayInput engineerManagementFilterDisplayInput);
        int CreateEngineerManagement(EngineerManagement engineerManagement);
        int UpdateEngineerManagement(EngineerManagement engineerManagement);
        bool DeleteEngineerManagement(EngineerManagementDelete engineerManagementDelete);
        EngineerManagement GetEngineerManagementDetails(int engineerId);
    }
}
