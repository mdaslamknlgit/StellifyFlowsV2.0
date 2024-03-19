using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Service.Interface
{
    public interface IProbabilityRepository
    {
        IEnumerable<ProbabilityDTO> GetProbabilityList(UserInfo MyUserInfo);
        ProbabilityDTO GetProbabilityById(int Id);
        ResultReponse UpdateProbability(ProbabilityDTO MyProbability, UserInfo MyUserInfo);
        ResultReponse DeleteProbability(ProbabilityDTO MyProbability, UserInfo MyUserInfo);
        ResultReponse CreateProbability(ProbabilityDTO MyProbability, UserInfo MyUserInfo);
        ResultReponse UpdateProspectById(int Id, UserInfo MyUserInfo);
        ResultReponse UpdateProspectOrder(List<ProbabilityDTO> MyProbability, UserInfo MyUserInfo);
    }
}
