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
    public class LocationTransferManager : ManagerBase, ILocationTransferManager
    {
        private readonly ILocationTransferRepository  m_locationTransferRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="LocationTransferManager"></param>
        public LocationTransferManager(ILocationTransferRepository itemRepository)
        {
            m_locationTransferRepository = itemRepository;
        }

        public int CreateLocationTransfer(LocationTransfer locationTransfer)
        {
            return m_locationTransferRepository.CreateLocationTransfer(locationTransfer);
        }

        public int DeleteLocationTransfer(LocationTransfer locationTransfer)
        {
            return m_locationTransferRepository.DeleteLocationTransfer(locationTransfer);
        }

        public LocationTransfer GetItems(GridDisplayInput gridDisplayInput)
        {
            return m_locationTransferRepository.GetItems(gridDisplayInput);
        }

        public LocationTransferReqDisplayResult GetLocationTransfer(GridDisplayInput gridDisplayInput)
        {
            return m_locationTransferRepository.GetLocationTransfer(gridDisplayInput);
        }

        public LocationTransfer GetLocationTransferDetails(int locationTransferReqId, int loggedInUserId)
        {
            return m_locationTransferRepository.GetLocationTransferDetails(locationTransferReqId, loggedInUserId);
        }

        public LocationTransferReqDisplayResult GetLocationTransferForApprovals(GridDisplayInput gridDisplayInput)
        {
            return m_locationTransferRepository.GetLocationTransferForApprovals(gridDisplayInput);
        }

        public byte[] LocationTransferPrint(int locationTransferId, int companyId)
        {
            return m_locationTransferRepository.LocationTransferPrint(locationTransferId, companyId);
        }

        public LocationTransferReqDisplayResult SearchLocationTransfer(LocationTransferSearch locationTransferSearch)
        {
            return m_locationTransferRepository.SearchLocationTransfer(locationTransferSearch);
        }

        public int UpdateLocationTransfer(LocationTransfer locationTransfer)
        {
            return m_locationTransferRepository.UpdateLocationTransfer(locationTransfer);
        }
    }
}
