using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Service.Interface
{
    public interface IErrrorLogRepository
    {
        int SaveLog(string Message);
    }
}
