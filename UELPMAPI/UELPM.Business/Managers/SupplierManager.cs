using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class SupplierManager : ManagerBase, ISupplierManager
    {
        private readonly ISupplierRepository m_supplierRepository;
      
        public SupplierManager(ISupplierRepository supplierRepository)
        {
            m_supplierRepository = supplierRepository;
        }

        public SupplierGrid GetSuppliers(GridDisplayInput gridDisplayInput)
        {
            return m_supplierRepository.GetSuppliers(gridDisplayInput);
        }

        public SupplierGrid GetAllSearchSuppliers(GridDisplayInput gridDisplayInput)
        {
            return m_supplierRepository.GetAllSearchSuppliers(gridDisplayInput);
        }

        public IEnumerable<SupplierNew> GetAllSuppliers(GridDisplayInput gridDisplayInput)
        {
            return m_supplierRepository.GetAllSuppliers(gridDisplayInput);
        }

        public Supplier GetSupplier(int supplierId, int companyId, int loggedInUserId)
        {
            return m_supplierRepository.GetSupplier(supplierId, companyId, loggedInUserId);
        }

        public SupplierGrid GetAllSearchSuppliers(SupplierSearch supplierSearchInput)
        {
            return m_supplierRepository.GetAllSearchSuppliers(supplierSearchInput);
        }


        public int CreateSupplier(Supplier supplier)
        {
            return m_supplierRepository.CreateSupplier(supplier);
        }

        public int UpdateSupplier(Supplier supplier)
        {
            return m_supplierRepository.UpdateSupplier(supplier);
        }

        public bool DeleteSupplier(int supplierId, int createdBy, int companyId)
        {
            return m_supplierRepository.DeleteSupplier(supplierId, createdBy, companyId,false);
        }

        public IEnumerable<SupplierService> GetSupplierServices(int? supplierId)
        {
            return m_supplierRepository.GetSupplierServices(supplierId);
        }

        public IEnumerable<SupplierCategory> GetServiceCategroies()
        {
            return m_supplierRepository.GetServiceCategroies();
        }

        public IEnumerable<SupplierCategory> GetServiceCategroies(string searchKey)
        {
            return m_supplierRepository.GetServiceCategroies(searchKey);
        }

        public IEnumerable<GSTStatus> GetGSTStatus()
        {
            return m_supplierRepository.GetGSTStatus();
        }
        public IEnumerable<Country> GetCountries()
        {
            return m_supplierRepository.GetCountries();
        }
        public SupplierGrid GetAllSupplierApprovals(GridDisplayInput gridDisplayInput)
        {
            return m_supplierRepository.GetAllSupplierApprovals(gridDisplayInput);
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            return m_supplierRepository.DownloadFile(attachment);
        }

        public UploadResult UploadSupplier(string filePath, int userId)
        {
            return m_supplierRepository.UploadSupplier(filePath,userId);
        }
        public string ValidateInternalCode(Supplier supplier)
        {
            return m_supplierRepository.ValidateInternalCode(supplier);
        }

        public int DetachSupplier(SupplierCompanyDetails supplierToDetach)
        {
            return m_supplierRepository.DetachSupplier(supplierToDetach);
        }
        public SupplierExportAll ExportAllSuppliers()
        {
          return   m_supplierRepository.ExportAllSuppliers();
        }
        /// <summary>
        ///Getting All Vendors Export Info
        /// </summary>
        /// <returns></returns>
        public VendorDisplayResult VendorsExport(GridDisplayInput vendorInput)
        {
            return m_supplierRepository.VendorsExport(vendorInput);
        }

        /// <summary>
        /// Export Selected Vendors by Id's
        /// </summary>
        /// <param name="vendorsLists"></param>
        /// <returns></returns>
        public VendorsList[] VendorsExportById(VendorsList[] vendorsLists, int companyId)
        {
            return m_supplierRepository.VendorsExportById(vendorsLists, companyId);
        }

        /// <summary>
        /// Change Work Flow Status
        /// </summary>
        /// <param name="supplierId"></param>
        /// <param name="Workflowstatusid"></param>
        /// <returns></returns>
        public int ChangeWorkflowStatus(int supplierId, int companyId)
        {
            return m_supplierRepository.ChangeWorkflowStatus(supplierId, companyId); 
        }

        public VendorDisplayResult VendorsExportByNewCreateSup(int supplierId, int companyId)
        {
            return m_supplierRepository.VendorsExportByNewCreateSup(supplierId, companyId);
        }
        public int RecallPoApproval(Supplier supplier)
        {
            return m_supplierRepository.RecallPoApproval(supplier);
        }
        public bool CheckVerifystatus(int companyid, int userid, int deptid)
        {
            return m_supplierRepository.CheckVerifystatus(companyid,userid,deptid);
        }

        public bool CheckDuplicateSupplier(int supplierId, string supplierName)
        {
            return m_supplierRepository.CheckDuplicateSupplier(supplierId, supplierName);
        }
    }
}
