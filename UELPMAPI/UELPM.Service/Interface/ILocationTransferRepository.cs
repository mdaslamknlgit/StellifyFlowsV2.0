using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface ILocationTransferRepository
    {
        int CreateLocationTransfer(LocationTransfer locationTransfer);
        int DeleteLocationTransfer(LocationTransfer locationTransfer);
        int UpdateLocationTransfer(LocationTransfer locationTransfer);
        LocationTransferReqDisplayResult GetLocationTransfer(GridDisplayInput gridDisplayInput);
        LocationTransfer GetLocationTransferDetails(int locationTransferReqId, int loggedInUserId);
        LocationTransferReqDisplayResult GetLocationTransferForApprovals(GridDisplayInput gridDisplayInput);
        LocationTransfer GetItems(GridDisplayInput gridDisplayInput);
        LocationTransferReqDisplayResult SearchLocationTransfer(LocationTransferSearch locationTransferSearch);
        byte[] LocationTransferPrint(int locationTransferId, int companyId);
    }
}
