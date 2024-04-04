using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Service.Interface;
using UELPM.Model.Models;

namespace UELPM.Business.Managers
{

    public class InventoryDisposalRequestManager : ManagerBase, IInventoryDisposalRequestManager
    {
        private readonly IInventoryDisposalRequestRepository m_inventoryDisposalRequestRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="IInventoryRequestRepository"></param>
        public InventoryDisposalRequestManager(IInventoryDisposalRequestRepository inventoryDisposalReqRepository)
        {
            m_inventoryDisposalRequestRepository = inventoryDisposalReqRepository;
        }

        public InventoryDisposalRequestDisplayResult GetInventoryDisposalRequest(InventoryDisposalRequestInput inventoryDisposalRequest)
        {

            try
            {
                return m_inventoryDisposalRequestRepository.GetInventoryDisposalRequest(inventoryDisposalRequest);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool CreateInventoryDisposalRequest(InventoryDisposalRequest inventoryDisposalRequest)
        {
            try
            {
                return m_inventoryDisposalRequestRepository.CreateInventoryDisposalRequest(inventoryDisposalRequest);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
