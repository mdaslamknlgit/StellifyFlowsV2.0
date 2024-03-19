using Quartz;
using System;
using System.Threading.Tasks;
using UELPM.Service.Interface;
using UELPM.Service.Repositories;

namespace UELPM.Scheduler
{
    public class POCGenerateJob : IJob
    {       
        public async Task Execute(IJobExecutionContext context)
        {
            ContractPurchaseOrderRepository contactPurchaseOrderRepository = null;
            try
            {
                contactPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                await contactPurchaseOrderRepository.GeneratePOCBySchedule();
            }
            catch (Exception exp)
            {
                var MessageError = exp.ToString();
                throw;
            }
        }
    }
}
