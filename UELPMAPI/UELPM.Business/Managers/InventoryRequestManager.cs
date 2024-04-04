using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Service.Interface;
using UELPM.Model.Models;
using UELPM.Business.Interface;

namespace UELPM.Business.Managers
{
    public class InventoryRequestManager: ManagerBase, IInventoryRequestManager
    {
        private readonly IInventoryRequestRepository m_invnetoryRequestRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="IInventoryRequestRepository"></param>
        public InventoryRequestManager(IInventoryRequestRepository itemRepository)
        {
            m_invnetoryRequestRepository = itemRepository;
        }

        public InventoryRequestDisplayResult GetInventoryRequest(InventoryRequestDisplayInput inventoryRequest)
        {

            try
            {
                return m_invnetoryRequestRepository.GetInventoryRequest(inventoryRequest);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

 
        public List<InventoryRequestItems> GetInventoryRequestDetails(InventoryRequestDetailInput inventoryRequest)
        {

            try
            {
                return m_invnetoryRequestRepository.GetInventoryRequestDetails(inventoryRequest);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateInventoryRequest(InventoryRequest inventoryRequest)
        {
            try
            {


                return m_invnetoryRequestRepository.CreateInventoryRequest(inventoryRequest);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateInventoryRequest(InventoryRequest inventoryRequest)
        {

            try
            {
                return m_invnetoryRequestRepository.UpdateInventoryRequest(inventoryRequest);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeleteInventoryRequest(InventoryRequestDelete inventoryRequestDelete)
        {
            try
            {
                return m_invnetoryRequestRepository.DeleteInventoryRequest(inventoryRequestDelete);

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
