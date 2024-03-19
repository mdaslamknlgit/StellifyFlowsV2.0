using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ISupplierManager
    {
        SupplierGrid GetSuppliers(GridDisplayInput gridDisplayInput);
        SupplierGrid GetAllSearchSuppliers(GridDisplayInput gridDisplayInput);
        IEnumerable<SupplierNew> GetAllSuppliers(GridDisplayInput gridDisplayInput);
        Supplier GetSupplier(int supplierId,int companyId, int loggedInUserId);
        SupplierGrid GetAllSearchSuppliers(SupplierSearch supplierSearchInput);
        int CreateSupplier(Supplier supplier);
        int UpdateSupplier(Supplier supplier);
        bool DeleteSupplier(int supplierId, int createdBy, int companyId);
        IEnumerable<SupplierService> GetSupplierServices(int? supplierId);
        IEnumerable<SupplierCategory> GetServiceCategroies();
        IEnumerable<SupplierCategory> GetServiceCategroies(string searchKey);
        IEnumerable<GSTStatus> GetGSTStatus();
        IEnumerable<Country> GetCountries();
        SupplierGrid GetAllSupplierApprovals(GridDisplayInput gridDisplayInput);
        byte[] DownloadFile(Attachments attachment);
        UploadResult UploadSupplier(string filePath, int userId);
        string ValidateInternalCode(Supplier supplier);
        int DetachSupplier(SupplierCompanyDetails supplierToDetach);
        SupplierExportAll ExportAllSuppliers();
        VendorDisplayResult VendorsExport(GridDisplayInput vendorInput);
        VendorsList[] VendorsExportById(VendorsList[] vendorsLists, int companyId);
        int ChangeWorkflowStatus(int supplierId, int companyId);
        VendorDisplayResult VendorsExportByNewCreateSup(int supplierId, int companyId);
        int RecallPoApproval(Supplier supplier);
        bool CheckVerifystatus(int companyid, int userid, int deptid);
        bool CheckDuplicateSupplier(int supplierId, string supplierName);
    }
}
