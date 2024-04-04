using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class LocationTransfer
    {
        public int LocationTransferId { get; set; }
        public string LocationTransferCode { get; set; }
        public int FromLocationId { get; set; }
        public string FromLocation { get; set; }
        public int ToLocationId { get; set; }
        public string ToLocation { get; set; }
        public int FromCompanyId { get; set; }
        public string FromCompany { get; set; }
        public int ToCompanyId { get; set; }
        public string ToCompany { get; set; }
        public string ReasonForTransfer { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string RequestedByUserName { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public List<int> SelectedItems { get; set; }
        public List<int> DeletedItems { get; set; }
        public List<Items> SelectedItemDetails { get; set; }
        public int CompanyId { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
    }

    public class Items
    {
        public int LocationTransferDetailId { get; set; }
        public string ItemCategoryName { get; set; }
        public string ItemTypeName { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string ItemMasterCode { get; set; }
        public string Name { get; set; }
        public string StatusName { get; set; }
        public string Manufacturer { get; set; }
        public string Brand { get; set; }
        public decimal OpeningStockValue { get; set; }
        public string LocationName { get; set; }
        public string UOMName { get; set; }
        public int ReOrderLevel { get; set; }
        public int LowAlertQuantity { get; set; }
        public int StockInhand { get; set; }
        public int ItemMasterID { get; set; }
        public int Quantity { get; set; }
        public int ItemTypeID { get; set; }
        public int MeasurementUnitID { get; set; }
        public int GST { get; set; }
        public decimal Price { get; set; }

    }



    public class LocationTransferReqDisplayResult
    {
        public List<LocationTransfer> LocationTransferReq { get; set; }
        public int TotalRecords { get; set; }
    }
    

    public class LocationTransferSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int LocationTransferId { get; set; }
        public int FromLocationId { get; set; }
        public int RequestFromUserId { get; set; }
    }


}
