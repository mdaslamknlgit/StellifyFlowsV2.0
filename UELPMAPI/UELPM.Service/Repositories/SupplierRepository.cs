using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.ExcelUpload;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;

namespace UELPM.Service.Repositories
{
    public class SupplierRepository : ISupplierRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        private SharedRepository sharedRepositoryObj;
        private CompanyRepository companyRepository;
        private WorkFlowConfigurationRepository workFlowConfigRepository = null;
        public SupplierGrid GetSuppliers(GridDisplayInput gridDisplayInput)
        {
            SupplierGrid objSupplierGrid = new SupplierGrid();
            using (var result = this.m_dbconnection.QueryMultiple("Supplier_CRUD", new
            {

                Action = "SELECT",
                Search = string.IsNullOrEmpty(gridDisplayInput.Search) ? string.Empty : gridDisplayInput.Search,
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take,
                Companyid = gridDisplayInput.CompanyId,
                RoleID = gridDisplayInput.RoleID,
                UserId = gridDisplayInput.UserId

            }, commandType: CommandType.StoredProcedure))
            {
                objSupplierGrid.Suppliers = result.Read<Supplier>().AsList();
                objSupplierGrid.TotalRecords = result.ReadFirstOrDefault<int>();
            }

            return objSupplierGrid;

        }

        public SupplierGrid GetAllSearchSuppliers(GridDisplayInput gridDisplayInput)
        {
            SupplierGrid objSupplierGrid = new SupplierGrid();
            using (var result = this.m_dbconnection.QueryMultiple("Supplier_CRUD", new
            {

                Action = "SELECT",
                Search = gridDisplayInput.Search,
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take,
                Companyid = gridDisplayInput.CompanyId,
                RoleID = gridDisplayInput.RoleID,
                UserId = gridDisplayInput.UserId

            }, commandType: CommandType.StoredProcedure))
            {
                objSupplierGrid.Suppliers = result.Read<Supplier>().AsList();
                objSupplierGrid.TotalRecords = result.ReadFirstOrDefault<int>();
            }

            return objSupplierGrid;

        }


        public SupplierGrid GetAllSupplierApprovals(GridDisplayInput gridDisplayInput)
        {
            try
            {
                this.m_dbconnection.Open();
                SupplierGrid objSupplierGrid1 = new SupplierGrid();
                int processId = Convert.ToInt32(WorkFlowProcessTypes.Supplier);
                using (var result1 = this.m_dbconnection.QueryMultiple("Supplier_CRUD", new
                {
                    Action = "GETAPPROVALS",
                    Search = gridDisplayInput.Search,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Companyid = gridDisplayInput.CompanyId,
                    SupplierId = gridDisplayInput.SupplierId,
                    UserId = gridDisplayInput.UserId,
                    ProcessId = processId
                }, commandType: CommandType.StoredProcedure))
                {
                    objSupplierGrid1.Suppliers = result1.Read<Supplier>().AsList();
                    objSupplierGrid1.TotalRecords = result1.ReadFirstOrDefault<int>();
                }

                return objSupplierGrid1;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public SupplierGrid GetAllSearchSuppliers(SupplierSearch supplierSearchInput)
        {
            try
            {
                SupplierGrid suppliersDisplayResult = new SupplierGrid();
                int verifier = 0;
                string supplierQuery = "";

                //checking verifier
                verifier = this.m_dbconnection.Query<int>("Supplier_CRUD",
                                 new
                                 {
                                     Action = "CHECKVERIFIER",
                                     UserId = supplierSearchInput.UserId,
                                     CompanyId = supplierSearchInput.CompanyId
                                 }, commandType: CommandType.StoredProcedure).FirstOrDefault();


                supplierQuery = "SELECT (select companycode from company where CompanyId = @CompanyId)+SUBSTRING(S.SupplierCode, 4, LEN(S.SupplierCode)) as SupplierCode,S.SupplierEmail, S.SupplierId, S.SupplierName, S.SupplierShortName, S.SupplierCategoryID, SCD.PaymentTermsId,S.SupplierTypeID, " +
                       "S.Isdeleted, S.CreatedBy, S.CreatedDate, S.UpdatedBy, S.UpdatedDate, S.BillingAddress1, S.BillingAddress2, S.BillingCity, S.BillingCountryId, S.BillingZipcode, S.BillingTelephone, S.BillingAddress3, S.BillingFax, " +
                        "S.IsGSTSupplier, C.Code,C.Name as BillingCountry, SC.CategoryText as CategoryName, P.Code as PaymentTermCode,GS.StatusText as GSTStatus,SCD.GSTStatusId, " +
                        "S.DraftCode,S.CompanyId, S.GSTNumber,S.ShareCapital,Scd.CurrencyId, SCD.TaxId,tg.TaxGroupName,tg.TaxGroupId, SCD.TaxClass, SCD.RateType,S.Status,S.Remarks,S.CoSupplierCode, " +
                        "SCD.CreditLimit,WS.WorkFlowStatusid,WS.Statustext AS WorkFlowStatus, S.IsSubCodeRequired, S.IsActive " +
                                                  "from " +
                                                  "dbo.Supplier as S " +
                                                  "INNER JOIN dbo.Countries as C " +
                                                  "on " +
                                                  "S.BillingCountryId = C.Id " +

                                                  "INNER JOIN dbo.SupplierCategory as SC " +
                                                  "on " +
                                                  "S.SupplierCategoryID = SC.SupplierCategoryID " +

                                                  "LEFT JOIN dbo.SupplierCompanyDetails as SCD " +
                                                  "on " +
                                                  "SCD.SupplierId = S.SupplierId " +

                                                  "INNER JOIN dbo.PaymentTerms as P " +
                                                  "on " +
                                                  "P.PaymentTermsId = SCD.PaymentTermsId " +

                                                  "LEFT JOIN dbo.GSTStatus as GS " +
                                                  "on " +
                                                  "S.GSTStatusId = GS.GSTStatusid " +

                                                  "LEFT JOIN dbo.TaxGroup as TG " +
                                                  "on " +
                                                  "SCD.TaxId = tg.TaxGroupId " +

                                                  "INNER JOIN dbo.SupplierApproval as SA " +
                                                  "on " +
                                                  "SA.SupplierId = S.SupplierId " +

                                                  "INNER JOIN dbo.WorkFlowStatus as WS " +
                                                  "on " +
                                                  "SA.WorkFlowStatusId = WS.WorkFlowStatusid " +

                                                  "INNER JOIN dbo.Currencies as CU " +
                                                  "on " +
                                                  "Scd.CurrencyId = CU.Id	 " +

                                                   "where ";


                if (supplierSearchInput.SupplierName != "" && supplierSearchInput.SupplierName != null)
                {
                    supplierQuery += "( " +
                                                    "S.SupplierName LIKE concat('%',@SupplierName,'%') " +
                                                    ") " +
                                                    "and ";
                }

                if (supplierSearchInput.SupplierCity != "" && supplierSearchInput.SupplierCity != null)
                {
                    supplierQuery += "( " +
                                                    "S.BillingCity  LIKE concat('%',@SupplierCity,'%') " +
                                                ") " +
                                                "and ";
                }

                if (supplierSearchInput.SupplierCategoryID > 0)
                {
                    supplierQuery += "S.SupplierCategoryID = @SupplierCategoryID AND ";
                }

                if (supplierSearchInput.WorkFlowStatusId > 0)
                {
                    supplierQuery += " Sa.WorkFlowStatusId = @WorkFlowStatusId AND ";
                }


                supplierQuery += " SA.Companyid = @companyId and S.Isdeleted = 0 and SCD.CompanyId=@companyId  AND ";

                supplierQuery += "( (@IsSupplierVerifier =  1 and SA.WorkFlowStatusId = 4 AND S.IsActive = 1  AND (SELECT COUNT(*) FROM Supplier sup inner join SupplierApproval sapp on sapp.SupplierId = sup.SupplierId where sup.ParentSupplierId = S.SupplierId AND sup.IsActive = 0 AND sapp.WorkFlowStatusId NOT IN(4, 5)) = 0) OR ";

                supplierQuery += " (@IsSupplierVerifier =  1 AND SA.WorkFlowStatusId =3 AND ( exists (select ParentSupplierId from supplier where SupplierId = S.SupplierId)  and  SA.WorkFlowStatusId!=4)  ) OR ";

                supplierQuery += " (@IsSupplierVerifier!=1 AND SA.WorkFlowStatusId IN (3,4,5,6,21) AND S.IsActive =1) )";


                string supplierSearchResultQuery = " select * from " +
                                                   " ( ";
                supplierSearchResultQuery += supplierQuery;

                supplierSearchResultQuery += " ) as S ";
                supplierSearchResultQuery += " order by ";
                supplierSearchResultQuery += " S.UpdatedDate desc ";


                if (supplierSearchInput.Take > 0)
                {
                    supplierSearchResultQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ";
                    supplierSearchResultQuery += " select COUNT(*) from ( ";
                    supplierSearchResultQuery += supplierQuery;

                    supplierSearchResultQuery += " ) as S ";
                }

                //executing the stored procedure to get the list of suppliers
                using (var result = this.m_dbconnection.QueryMultiple(supplierSearchResultQuery, new
                {
                    Action = "SELECT",
                    Skip = supplierSearchInput.Skip,
                    Take = supplierSearchInput.Take,
                    CompanyId = supplierSearchInput.CompanyId,
                    SupplierCity = supplierSearchInput.SupplierCity,
                    SupplierName = supplierSearchInput.SupplierName,
                    WorkFlowStatusId = supplierSearchInput.WorkFlowStatusId,
                    SupplierCategoryID = supplierSearchInput.SupplierCategoryID,
                    RoleID = supplierSearchInput.RoleID,
                    IsSupplierVerifier = verifier

                }, commandType: CommandType.Text))
                {
                    suppliersDisplayResult.Suppliers = result.Read<Supplier>().AsList();
                    if (supplierSearchInput.Take > 0)
                    {
                        suppliersDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                    else
                    {
                        suppliersDisplayResult.TotalRecords = suppliersDisplayResult.Suppliers.Count;
                    }
                }
                return suppliersDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<SupplierNew> GetAllSuppliers(GridDisplayInput gridDisplayInput)
        {
            const string sql =
                @"SELECT s.SupplierEmail,s.SupplierId, s.SupplierName, s.SupplierShortName,
                        s.Isdeleted, s.CreatedBy, s.CreatedDate, s.UpdatedBy, s.UpdatedDate, s.BillingAddress1, s.BillingAddress2, s.BillingCity, s.BillingZipcode, s.BillingTelephone, s.BillingAddress3, s.BillingFax,
                        s.IsGSTSupplier, sc.ServiceCategoryId, sc.CategoryText as CategoryName, sc.Description, sc.isdeleted, pt.PaymentTermsId, pt.Code, pt.Description,pt.NoOfDays, pt.Isdeleted,
                        c.Id, c.Code, c.Name, s.GSTStatusId, s.GSTNumber, s.ShareCapital, scd.CurrencyId, Cu.Code as CurrencyCode, s.IsSubCodeRequired
                        FROM  Supplier AS s INNER JOIN                                          
                        SupplierCategory AS sc ON sc.SupplierCategoryID = s.SupplierCategoryID INNER JOIN                      
                        Countries AS c ON c.Id = s.BillingCountryId INNER JOIN
                        SupplierCompanyDetails as scd on scd.SupplierId = s.SupplierId
                        Currencies as Cu on  scd.CurrencyId = Cu.Id INNER JOIN
                        PaymentTerms pt ON pt.PaymentTermsId = scd.PaymentTermsId
                        WHERE s.Isdeleted = 0 ORDER BY s.UpdatedDate DESC OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

            var parameters = new Dictionary<string, object>
            {
                {"Action", "SELECT"},
                {"Skip", gridDisplayInput.Skip},
                {"Take", gridDisplayInput.Take}
            };

            var supplierDictionary = new Dictionary<int, SupplierNew>();

            var suppliers = m_dbconnection.Query<SupplierNew, ServiceCategory, PaymentTerm, Country, ShippingCountry, SupplierNew>(sql,
                    (supplier, serviceCategory, paymentTerm, country, shippingCountry) =>
                    {
                        if (!supplierDictionary.TryGetValue(supplier.SupplierId, out SupplierNew ss))
                        {
                            ss = supplier;
                            supplierDictionary.Add(ss.SupplierId, ss);
                        }

                        //if (supplierService != null)
                        //{
                        //    ss.SupplierService = supplierService;
                        //}

                        if (serviceCategory != null)
                        {
                            ss.SupplierCategory = serviceCategory;
                        }

                        if (paymentTerm != null)
                        {
                            ss.PaymentTerm = paymentTerm;
                        }

                        if (country != null)
                        {
                            ss.BillingCountry = country;
                        }

                        if (shippingCountry != null)
                        {
                            ss.ShippingCountry = shippingCountry;
                        }

                        return ss;
                    }, parameters, splitOn: "SupplierId,ServiceCategoryId, PaymentTermsId, Id, ShippingCountryId").Distinct().ToList();


            return suppliers;

        }

        public Supplier GetSupplier(int supplierId, int companyId, int loggedInUserId = 0)
        {
            Supplier supplierDetails = new Supplier();
            if (this.m_dbconnection.State == ConnectionState.Closed)
                this.m_dbconnection.Open();
            using (var result = this.m_dbconnection.QueryMultiple("Supplier_CRUD", new
            {
                Action = "SELECTBYID",
                SupplierId = supplierId,
                CompanyId = companyId,
                UserId = loggedInUserId,
                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.Supplier)
            }, commandType: CommandType.StoredProcedure))
            {
                supplierDetails = result.Read<Supplier>().FirstOrDefault();
                if (supplierDetails != null)
                {
                    supplierDetails.IsWFVerifier = new WorkFlowConfigurationRepository().CheckIsWFVerifier(companyId, (int)WorkFlowProcessTypes.Supplier, supplierDetails.LocationId, loggedInUserId);
                    UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                    if (userProfile != null)
                    {
                        supplierDetails.CurrentApproverUserId = userProfile.UserID;
                        supplierDetails.CurrentApproverUserName = userProfile.UserName;
                    }

                    supplierDetails.Country = this.m_dbconnection.Query<Country>("usp_GetCountries",
                                  new
                                  {
                                      CountryId = supplierDetails.BillingCountryId
                                  }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                }
            }
            if (supplierDetails != null)
            {
                supplierDetails.SupplierCompanyDetails = this.m_dbconnection.Query<SupplierCompanyDetails>("SupplierCompanyDetails_CRUD",
                                   new
                                   {
                                       Action = "SELECTBYID",
                                       SupplierId = supplierId,
                                       CompanyId = companyId
                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }

            if (supplierDetails != null)
            {
                supplierDetails.SupplierAttachedCompanies = this.m_dbconnection.Query<SupplierAttachedCompanies>("SupplierAttachedCompanies",
                                   new
                                   {
                                       Action = "SELECT",
                                       SupplierId = supplierId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }



            if (supplierDetails != null)
            {
                if (supplierDetails.SupplierCompanyDetails == null)
                {
                    SupplierCompanyDetails objSupplierCompanyDetails = null;
                    objSupplierCompanyDetails = new SupplierCompanyDetails();
                    supplierDetails.SupplierCompanyDetails = objSupplierCompanyDetails;
                }
                supplierDetails.SupplierApproval = this.m_dbconnection.Query<SupplierApproval>("SupplierApproval_CRUD",
                                   new
                                   {
                                       Action = "SELECT",
                                       SupplierId = supplierId,
                                       CompanyId = companyId
                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }

            if (supplierDetails != null)
            {
                supplierDetails.SupplierServices = this.m_dbconnection.Query<SupplierService>("SupplierSelectedService_CRUD",
                                   new
                                   {
                                       Action = "SELECT",
                                       SupplierId = supplierId,
                                       CompanyId = companyId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }




            if (supplierDetails != null)
            {
                if (supplierDetails.SupplierServices.Count > 0)
                {
                    foreach (var record in supplierDetails.SupplierServices)
                    {
                        supplierDetails.ServiceName += record.ServiceName + ", ";
                    }

                    supplierDetails.ServiceName = supplierDetails.ServiceName.Remove(supplierDetails.ServiceName.Length - 2);
                }
                supplierDetails.ContactPersons = this.m_dbconnection.Query<SupplierContactPerson>("SupplierContactPerson_CRUD",
                                   new
                                   {
                                       Action = "SELECT",
                                       SupplierId = supplierId,
                                       CompanyId = companyId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }

            if (supplierDetails != null)
            {
                supplierDetails.SubCodes = this.m_dbconnection.Query<SupplierSubCode>("SupplierSubCode_CRUD",
                                   new
                                   {
                                       Action = "SELECT",
                                       SupplierId = supplierId,
                                       CompanyId = companyId
                                   }, commandType: CommandType.StoredProcedure).ToList();
                if (supplierDetails.WorkFlowStatusId == 3)
                {
                    supplierDetails.WorkFlowStatus += " [" + supplierDetails.CurrentApproverUserName + "]";
                    supplierDetails.SupplierApproval.WorkFlowStatus += " [" + supplierDetails.CurrentApproverUserName + "]";
                }
            }

            if (supplierDetails != null)
            {
                if (loggedInUserId != 0)
                {
                    supplierDetails.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                    {
                        Documentid = supplierDetails.SupplierId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.Supplier),
                        UserId = loggedInUserId,
                        DocumentUserId = supplierDetails.CreatedBy
                    }, this.m_dbconnection).ToList();
                }

                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = supplierDetails.SupplierId,
                    AttachmentTypeId = Convert.ToInt32(AttachmentType.Supplier)

                }, commandType: CommandType.StoredProcedure);

                supplierDetails.Attachments = attachments.ToList();
            }

            if (supplierDetails != null)
            {
                supplierDetails.SupplierEntities = this.m_dbconnection.Query<Company>("SupplierCompanyDetails_CRUD",
                                   new
                                   {
                                       Action = "ENTITIES",
                                       SupplierId = supplierId,
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }

            return supplierDetails;
        }


        public bool CheckVerifystatus(int companyid, int userid, int deptid)
        {
            int result = m_dbconnection.Query<int>("select UserId from UserCompanyDepartments where CompanyId=" + companyid + " and DepartmentId=" + deptid + " and UserId=" + userid).FirstOrDefault();
            return result == 0 ? false : true;



        }


        public int CreateSupplier(Supplier supplier)
        {
            this.m_dbconnection.Open();//opening the connection...
            string DraftCode = string.Empty;
            string supplierCode = string.Empty;
            string companyCode = string.Empty;
            Supplier oldSupplier = new Supplier();
            if (supplier.OldSupplier != null)
                oldSupplier = GetSupplier(supplier.OldSupplier.SupplierId, supplier.CompanyId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var paramaterObj = new DynamicParameters();
                    string soCode = this.m_dbconnection.QueryFirstOrDefault<string>("Supplier_CRUD", new
                    {
                        Action = "COUNT"
                    },
                    transaction: transactionObj,
                    commandType: CommandType.StoredProcedure);
                    int c = Convert.ToInt32(soCode);
                    soCode = c.ToString("D5");

                    companyRepository = new CompanyRepository();
                    Company objCompany = companyRepository.GetCompany(supplier.CompanyId);
                    if (objCompany != null)
                    {
                        companyCode = objCompany.CompanyCode;
                    }

                    if (supplier.DraftCode == null)
                    {
                        DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        supplierCode = DraftCode + objCompany.CompanyCode + "-" + soCode + '-' + "00";
                    }
                    #region Main Table Data

                    var supplierId = this.m_dbconnection.Query<int>("Supplier_CRUD",
                    new
                    {
                        Action = "INSERT",
                        SupplierId = supplier.SupplierId,
                        CompanyId = supplier.CompanyId,
                        SupplierName = supplier.SupplierName.Trim(),
                        SupplierShortName = supplier.SupplierShortName,
                        SupplierServiceID = supplier.SupplierServiceID,
                        SupplierCategoryID = supplier.SupplierCategoryID,
                        //CurrencyCode = supplier.CurrencyCode,
                        //PaymentTermsId = supplier.PaymentTermsId,
                        SupplierEmail = supplier.SupplierEmail,
                        BillingAddress1 = supplier.BillingAddress1,
                        BillingAddress2 = supplier.BillingAddress2,
                        BillingCity = supplier.BillingCity,
                        BillingCountryId = supplier.BillingCountryId,
                        BillingZipcode = supplier.BillingZipcode,
                        BillingTelephone = supplier.BillingTelephone,
                        BillingAddress3 = supplier.BillingAddress3,
                        BillingFax = supplier.BillingFax,
                        Isdeleted = supplier.IsDeleted,
                        IsGSTSupplier = supplier.IsGSTSupplier,
                        //Status=1,
                        Status = Convert.ToInt32(SupplierStatus.Draft),
                        Remarks = supplier.Remarks,
                        CoSupplierCode = supplier.CoSupplierCode,
                        CreatedBy = supplier.CreatedBy,
                        UpdatedBy = supplier.UpdatedBy,
                        CreatedDate = DateTime.Now,
                        SupplierTypeID = supplier.SupplierTypeID,
                        DraftCode = supplier.DraftCode == null ? supplierCode : supplier.DraftCode,
                        SupplierCode = supplier.SupplierCode, //SharedRepository.GenerateCode("SUP"),
                        WorkFlowStatusid = supplier.WorkFlowStatusId,
                        GSTStatusId = supplier.GSTStatusId,
                        GSTNumber = supplier.GSTNumber,
                        ShareCapital = supplier.ShareCapital,
                        IsSubCodeRequired = supplier.IsSubCodeRequired,
                        ParentSupplierId = supplier.ParentSupplierId == null ? (int?)null : supplier.ParentSupplierId,
                        IsActive = supplier.IsActive
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    #endregion

                    #region  Saving Supplier Company details

                    if (supplier.SupplierCompanyDetails != null)
                    {
                        var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                       new
                       {
                           Action = "INSERT",
                           SupplierId = supplierId,
                           CompanyId = supplier.SupplierCompanyDetails.CompanyId,
                           //GSTStatusId = supplier.SupplierCompanyDetails.GSTStatusId,
                           TaxId = supplier.SupplierCompanyDetails.TaxId,
                           TaxClass = supplier.SupplierCompanyDetails.TaxClass,
                           //GSTNumber = supplier.SupplierCompanyDetails.GSTNumber,
                           RateType = supplier.SupplierCompanyDetails.RateType,
                           Justification = string.IsNullOrEmpty(supplier.SupplierCompanyDetails.Justification) ? string.Empty : supplier.SupplierCompanyDetails.Justification,
                           //ShareCapital = supplier.SupplierCompanyDetails.ShareCapital,
                           CreditLimit = supplier.SupplierCompanyDetails.CreditLimit,
                           //AccountSet = supplier.SupplierCompanyDetails.AccountSet,
                           BankCode = supplier.SupplierCompanyDetails.BankCode,
                           CurrencyId = supplier.SupplierCompanyDetails.CurrencyId,
                           GLAccount = supplier.SupplierCompanyDetails.GLAccount,
                           ReviewedDate = supplier.SupplierCompanyDetails.ReviewedDate,
                           PaymentTermsId = supplier.SupplierCompanyDetails.PaymentTermsId
                       }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }

                    #endregion

                    #region  Freezing supplier when supplier details are changed by Supplier Verifier                   

                    //if (supplier.ParentSupplierId != null && supplier.ParentSupplierId > 0)
                    //{
                    //    bool isChanged = false;
                    //    bool isFreezedAll = false;
                    //    //CompareLogic compareLogic = new CompareLogic();
                    //    //compareLogic.Config.MaxDifferences = 99;
                    //    //List<Difference> differences = new List<Difference>();                             
                    //    //ComparisonResult result = compareLogic.Compare(supplier, supplier.OldSupplier);
                    //    //result.Differences.AddRange(differences);

                    //    //foreach (var change in result.Differences)
                    //    //{                          
                    //    //    var propertyName = change.PropertyName.ToString();                          
                    //    //}                     

                    //    //if (!result.AreEqual)
                    //    //{
                    //    //    Console.WriteLine(result.DifferencesString);
                    //    //}
                    //    if (supplier.OldSupplier != null)
                    //    {
                    //        isChanged = CompareNameAndAddress(supplier, supplier.OldSupplier);
                    //        if (isChanged)
                    //        {
                    //            isFreezedAll = true;
                    //        }
                    //        else
                    //        {
                    //            isChanged = CompareSupplierOtherFiels(supplier, supplier.OldSupplier);

                    //            if (isChanged)
                    //            {
                    //                isFreezedAll = false;
                    //            }
                    //        }

                    //        if (isChanged)
                    //        {
                    //            var freezeResult = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                    //           new
                    //           {
                    //               Action = "FREEZE",
                    //               SupplierId = supplierId,
                    //               CompanyId = supplier.CompanyId,
                    //               IsFreezedAll = isFreezedAll
                    //           }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    //        }
                    //    }
                    //}

                    #endregion

                    #region  Saving Supplier Approval details

                    if (supplier.SupplierApproval != null)
                    {
                        var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierApproval_CRUD",
                       new
                       {
                           Action = "INSERT",
                           SupplierId = supplierId,
                           CompanyId = supplier.CompanyId,
                           WorkFlowStatusId = supplier.SupplierApproval.WorkFlowStatusId
                       }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    }

                    #endregion

                    #region  Saving supplier services
                    if (supplier.SupplierServices != null)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        foreach (var record in supplier.SupplierServices)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SupplierId", supplierId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@SupplierServiceID", record.SupplierServiceID, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }

                        var result = this.m_dbconnection.Execute("SupplierSelectedService_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }

                    #endregion

                    #region  Saving supplier Attachments
                    if (supplier.Attachments != null)
                    {
                        List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                        for (var i = 0; i < supplier.Attachments.Count; i++)
                        {
                            if (supplier.Attachments[i].AttachmentId == 0)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Supplier), DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@RecordId", supplierId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", supplier.Attachments[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }

                            if (supplier.Attachments[i].IsDelete)
                            {
                                if (supplier.Attachments[i].AttachmentId > 0)
                                {
                                    var fileObj = new DynamicParameters();
                                    fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                    fileObj.Add("@AttachmentTypeId", supplier.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                    fileObj.Add("@RecordId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                                    fileObj.Add("@AttachmentId", supplier.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                    fileToDelete.Add(fileObj);
                                }
                            }

                        }

                        var salesOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);


                        //deleting files in the folder...
                        var result = from a in supplier.Attachments
                                     where a.IsDelete == true
                                     select a;

                        var deleteCount = result.Count();

                        if (deleteCount > 0)
                        {
                            var salesOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.Supplier,
                                //FilesNames = supplier.Attachments.Select(j => j.FileName ).ToArray(),
                                FilesNames = supplier.Attachments.Where(j => j.IsDelete == true).Select(j => j.FileName).ToArray(),
                                UniqueId = supplier.SupplierId.ToString()
                            });
                        }

                    }

                    #endregion

                    #region saving Supplier sub codes                 
                    if (supplier.SubCodes != null)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        foreach (var record in supplier.SubCodes)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SupplierId", supplierId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@SubCodeDescription", record.SubCodeDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SubCode", record.SubCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccountSetId", record.AccountSetId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@LocationId", supplier.LocationId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }
                        var subCodesaveResult = this.m_dbconnection.Execute("SupplierSubCode_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }

                    #endregion

                    #region  we are adding supplier Contact Person...
                    if (supplier.ContactPersons != null)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        //looping through the list of contact persons...
                        foreach (var record in supplier.ContactPersons)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SupplierId", supplierId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", supplier.SupplierCompanyDetails.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }
                        var contactPersonSaveResult = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }

                    if (supplier.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                    {
                        supplier.SupplierId = supplierId;
                        sharedRepositoryObj = new SharedRepository();
                        sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                        {
                            ProcessId = Convert.ToInt32(WorkFlowProcessTypes.Supplier),
                            CompanyId = supplier.CompanyId,
                            DocumentId = supplier.SupplierId,
                            CreatedBy = supplier.CreatedBy,
                            WorkFlowStatusId = supplier.WorkFlowStatusId
                        }, false, transactionObj, this.m_dbconnection);
                    }
                    else
                    {
                        //commiting the transaction...
                        transactionObj.Commit();
                    }

                    #endregion                

                    #region saving files here...
                    if (supplier.UploadFiles != null)
                    {
                        try
                        {
                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.Supplier,
                                Files = supplier.UploadFiles,
                                UniqueId = supplierId.ToString()
                            });
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            for (var i = 0; i < supplier.UploadFiles.Count; i++)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Supplier), DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@RecordId", supplierId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", supplier.UploadFiles[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }
                            var salesOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        catch (Exception e)
                        {
                            throw e;
                        }

                    }
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    var user = userProfileRepository.GetUserById(supplier.CreatedBy);
                    string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                    DateTime now = DateTime.Now;
                    if (supplier.ParentSupplierId != null)
                    {
                        //AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "create", supplier.CreatedBy.ToString(), supplierId.ToString(), "CreateSupplier", "Created by Supplier Verifier " + UserName + " on " + now + "", supplier.CompanyId);

                    }
                    else
                    {
                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "create", supplier.CreatedBy.ToString(), supplierId.ToString(), "CreateSupplier", "Created by " + UserName + " on " + now + "", supplier.CompanyId);
                        AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "create", supplier.CreatedBy.ToString(), supplierId.ToString(), "CreateSupplier", "Saved as Draft " + UserName + " on " + now + "", supplier.CompanyId);
                    }

                    #endregion

                    if (supplier.ParentSupplierId > 0)
                    {
                        this.UpdateAttachStatus(supplierId, supplier.CompanyId, true);
                        if (supplier.SupplierApproval.WorkFlowStatusId == (int)WorkFlowStatus.Approved)
                        {
                            Supplier newSupplier = GetSupplier(supplierId, supplier.CompanyId);
                            this.CloneSupplierDetails(Convert.ToInt32(supplier.ParentSupplierId), supplierId, supplier.CompanyId);
                            this.InActiveOldSupplier(supplierId);
                            AuditLogRepository auditLogRepository = new AuditLogRepository();
                            auditLogRepository.LogSupplierReverify(oldSupplier, newSupplier);
                        }
                    }
                    return supplierId;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        private void CloneSupplierDetails(int supplierId, int newSupplierId, int companyId)
        {
            var supplierCompanies = this.m_dbconnection.Query<SupplierAttachedCompanies>("SupplierAttachedCompanies", new
            {
                Action = "SELECT",
                SupplierId = supplierId,
                CompanyId = companyId,
            }, commandType: CommandType.StoredProcedure).ToList();
            if (supplierCompanies != null && supplierCompanies.Count > 0)
            {
                foreach (var supplierCompany in supplierCompanies)
                {
                    Supplier supplier = new Supplier();
                    supplier = GetSupplier(supplierCompany.SupplierId, supplierCompany.CompanyId);
                    if (supplier != null)
                    {
                        #region SupplierCompanyDetails
                        if (supplier.SupplierCompanyDetails != null)
                        {
                            this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD", new
                            {
                                Action = "INSERT",
                                SupplierId = newSupplierId,
                                CompanyId = supplier.SupplierCompanyDetails.CompanyId,
                                TaxId = supplier.SupplierCompanyDetails.TaxId,
                                TaxClass = supplier.SupplierCompanyDetails.TaxClass,
                                RateType = supplier.SupplierCompanyDetails.RateType,
                                Justification = string.IsNullOrEmpty(supplier.SupplierCompanyDetails.Justification) ? string.Empty : supplier.SupplierCompanyDetails.Justification,
                                CurrencyId = supplier.SupplierCompanyDetails.CurrencyId,
                                CreditLimit = supplier.SupplierCompanyDetails.CreditLimit,
                                BankCode = supplier.SupplierCompanyDetails.BankCode,
                                GLAccount = supplier.SupplierCompanyDetails.GLAccount,
                                ReviewedDate = supplier.SupplierCompanyDetails.ReviewedDate,
                                PaymentTermsId = supplier.SupplierCompanyDetails.PaymentTermsId
                            }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                        }
                        #endregion

                        #region SupplierApproval
                        if (supplier.SupplierApproval != null)
                        {
                            this.m_dbconnection.Query<int>("SupplierApproval_CRUD", new
                            {
                                Action = "INSERT",
                                SupplierId = newSupplierId,
                                CompanyId = supplier.SupplierApproval.CompanyId,
                                WorkFlowStatusId = supplier.SupplierApproval.WorkFlowStatusId
                            }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                        }
                        #endregion

                        #region SupplierSelectedService
                        if (supplier.SupplierServices != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in supplier.SupplierServices)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SupplierId", newSupplierId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@SupplierServiceID", record.SupplierServiceID, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            var result = this.m_dbconnection.Execute("SupplierSelectedService_CRUD", itemToAdd, commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region Attachments
                        if (supplier.Attachments != null)
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                            for (var i = 0; i < supplier.Attachments.Count; i++)
                            {
                                if (supplier.Attachments[i].AttachmentId == 0)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Supplier), DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@RecordId", newSupplierId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", supplier.Attachments[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    fileToSave.Add(itemObj);
                                }
                                if (supplier.Attachments[i].IsDelete)
                                {
                                    if (supplier.Attachments[i].AttachmentId > 0)
                                    {
                                        var fileObj = new DynamicParameters();
                                        fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                        fileObj.Add("@AttachmentTypeId", supplier.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                        fileObj.Add("@RecordId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                                        fileObj.Add("@AttachmentId", supplier.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                        fileToDelete.Add(fileObj);
                                    }
                                }
                            }
                            this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region SupplierSubCode
                        if (supplier.SubCodes != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in supplier.SubCodes)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SupplierId", newSupplierId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@SubCodeDescription", record.SubCodeDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SubCode", record.SubCode, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AccountSetId", record.AccountSetId, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@LocationId", supplier.LocationId, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            this.m_dbconnection.Execute("SupplierSubCode_CRUD", itemToAdd, commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region SupplierContactPerson
                        if (supplier.ContactPersons != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in supplier.ContactPersons)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SupplierId", newSupplierId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            this.m_dbconnection.Execute("SupplierContactPerson_CRUD", itemToAdd, commandType: CommandType.StoredProcedure);
                        }
                        #endregion


                        //var approvers = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD",
                        //  new
                        //  {
                        //      Action = "VERIFIERAPPROVER",
                        //      DocumentId = workFlowApproval.ParentDocumentId,
                        //      ProcessId = workFlowApproval.ProcessId,
                        //      CompanyId = supplierCompany.CompanyId,
                        //  }, transaction: transactionObj,
                        //  commandType: CommandType.StoredProcedure).ToList();

                        //if (approvers != null)
                        //{
                        //    if (approvers.Count > 0)
                        //    {
                        //        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        //        foreach (var approver in approvers)
                        //        {
                        //            var itemObj = new DynamicParameters();
                        //            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                        //            itemObj.Add("@DocumentId", workFlowApproval.DocumentId, DbType.Int32, ParameterDirection.Input);
                        //            itemObj.Add("@ProcessId", approver.ProcessId, DbType.Int32, ParameterDirection.Input);
                        //            itemObj.Add("@CompanyId", supplierCompany.CompanyId, DbType.Int32, ParameterDirection.Input);
                        //            itemObj.Add("@ApproverUserId", approver.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                        //            itemObj.Add("@WorkFlowOrder", approver.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                        //            itemObj.Add("@WorkFlowStatusId", approver.Status, DbType.Int32, ParameterDirection.Input);
                        //            itemToAdd.Add(itemObj);
                        //        }

                        //        var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        //    }
                        //}
                    }
                }
            }
        }

        private void InActiveOldSupplier(int supplierId)
        {
            this.m_dbconnection.Query<int>("Supplier_CRUD", new
            {
                Action = "IN_ACTIVE_SUPPLIER",
                SupplierId = supplierId
            }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public int RecallPoApproval(Supplier supplier)
        {
            try
            {
                int WorkFlowStatusId = 0;
                if (supplier.WorkFlowStatusId != 0)
                {
                    WorkFlowStatusId = supplier.WorkFlowStatusId;
                }
                else
                {
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.CancelledApproval);
                    supplier.WorkFlowStatus = "Cancelled Approval";
                }
                var processId = 13;
                var originalstatusid = m_dbconnection.Query<int>("select WorkFlowStatusId from SupplierApproval where SupplierId=" + supplier.SupplierId.ToString() + " and CompanyId=" + supplier.CompanyId.ToString()).FirstOrDefault();
                var attachStatus = m_dbconnection.Query<bool>("select isattached from SupplierSubCode where SupplierId=" + supplier.SupplierId.ToString() + " and CompanyId=" + supplier.CompanyId.ToString()).FirstOrDefault();

                if (supplier.ParentSupplierId > 0 && originalstatusid == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress) && attachStatus)
                {
                    SupplierRepository supplierRepository = new SupplierRepository();
                    supplierRepository.DeleteSupplier(supplier.SupplierId, supplier.CreatedBy, supplier.CompanyId, attachStatus);
                }
                var result = this.m_dbconnection.Execute("Usp_RecallSupplierApproval", new
                {
                    Action = "RECALLSupplierAPPROVAL",
                    SupplierId = supplier.SupplierId,
                    UpdatedBy = supplier.CreatedBy,
                    UpdatedDate = DateTime.Now,
                    ProcessId = processId,
                    CompanyId = supplier.CompanyId,
                    WorkFlowStatusId = WorkFlowStatusId//Convert.ToInt32(WorkFlowStatus.CancelledApproval)
                }, commandType: CommandType.StoredProcedure);



                UserProfile sender = new UserProfileRepository().GetUserById(supplier.CurrentApproverUserId);
                UserProfile userProfile = new UserProfileRepository().GetUserById(supplier.CreatedBy);

                GenericRepository genericRepository = new GenericRepository();
                genericRepository.sendRecallApprovalMail(new ProjectDocument
                {
                    CompanyId = supplier.CompanyId,
                    DocumentId = supplier.SupplierId,
                    CurrentApproverUserId = supplier.CurrentApproverUserId,
                    CreatedBy = supplier.CreatedBy,
                    DocumentCode = supplier.SupplierCode,
                    DocumentTypeId = (int)WorkFlowProcessTypes.Supplier
                });

                DateTime now = DateTime.Now;
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                var user = userProfileRepository.GetUserById(supplier.CreatedBy);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                //if (supplier.ParentSupplierId > 0)
                //{
                //    AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "Recall Approval", supplier.CreatedBy.ToString(), supplier.ParentSupplierId.ToString(), "RecallPoApproval", "Supplier Cancelled Approval by " + UserName + " on " + now, supplier.CompanyId);

                //}
                //else
                AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "Recall Approval", supplier.CreatedBy.ToString(), supplier.SupplierId.ToString(), "RecallPoApproval", "Supplier Cancelled Approval by " + UserName + " on " + now, supplier.CompanyId);


                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public string ValidateInternalCode(Supplier supplier)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("Supplier_CRUD",
                                        new
                                        {
                                            Action = "VALIDATEACCOUNTCODE",
                                            CoSupplierCode = supplier.CoSupplierCode,
                                            SupplierId = supplier.SupplierId
                                        },
                                        commandType: CommandType.StoredProcedure))
                {
                    int validateuserStatus = result.ReadFirstOrDefault<int>();
                    if (validateuserStatus > 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int UpdateSupplier(Supplier supplier)
        {
            this.m_dbconnection.Open();//opening the connection...
            Supplier oldSupplier = GetSupplier(supplier.SupplierId, supplier.CompanyId);
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    #region Main Table data
                    var supplierSaveResult = this.m_dbconnection.Query<int>("Supplier_CRUD", new
                    {
                        Action = "UPDATE",
                        SupplierId = supplier.SupplierId,
                        SupplierName = supplier.SupplierName.Trim(),
                        SupplierShortName = supplier.SupplierShortName,
                        SupplierServiceID = supplier.SupplierServiceID,
                        SupplierCategoryID = supplier.SupplierCategoryID,
                        //CurrencyCode = supplier.CurrencyCode,
                        //PaymentTermsId = supplier.PaymentTermsId,
                        SupplierEmail = supplier.SupplierEmail,
                        BillingAddress1 = supplier.BillingAddress1,
                        BillingAddress2 = supplier.BillingAddress2,
                        BillingCity = supplier.BillingCity,
                        BillingCountryId = supplier.BillingCountryId,
                        BillingZipcode = supplier.BillingZipcode,
                        BillingTelephone = supplier.BillingTelephone,
                        BillingAddress3 = supplier.BillingAddress3,
                        BillingFax = supplier.BillingFax,
                        Isdeleted = supplier.IsDeleted,
                        IsGSTSupplier = supplier.IsGSTSupplier,
                        SupplierTypeID = supplier.SupplierTypeID,
                        Status = 1,
                        Remarks = supplier.Remarks,
                        CoSupplierCode = supplier.CoSupplierCode,
                        GSTStatusId = supplier.GSTStatusId,
                        GSTNumber = supplier.GSTNumber,
                        ShareCapital = supplier.ShareCapital,
                        IsSubCodeRequired = supplier.IsSubCodeRequired,
                        UpdatedBy = supplier.UpdatedBy,
                        UpdatedDate = DateTime.Now

                    }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();
                    #endregion

                    #region  Saving Supplier Company details

                    if (supplier.SupplierCompanyDetails != null)
                    {
                        if (supplier.SupplierCompanyDetails.SupplierCompanyId > 0)
                        {
                            var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                           new
                           {
                               Action = "UPDATE",
                               SupplierCompanyId = supplier.SupplierCompanyDetails.SupplierCompanyId,
                               SupplierId = supplier.SupplierCompanyDetails.SupplierId,
                               CompanyId = supplier.SupplierCompanyDetails.CompanyId,
                               TaxId = supplier.SupplierCompanyDetails.TaxId,
                               TaxClass = supplier.SupplierCompanyDetails.TaxClass,
                               RateType = supplier.SupplierCompanyDetails.RateType,
                               Justification = string.IsNullOrEmpty(supplier.SupplierCompanyDetails.Justification) ? string.Empty : supplier.SupplierCompanyDetails.Justification,
                               CurrencyId = supplier.SupplierCompanyDetails.CurrencyId,
                               CreditLimit = supplier.SupplierCompanyDetails.CreditLimit,
                               BankCode = supplier.SupplierCompanyDetails.BankCode,
                               GLAccount = supplier.SupplierCompanyDetails.GLAccount,
                               ReviewedDate = supplier.SupplierCompanyDetails.ReviewedDate,
                               PaymentTermsId = supplier.SupplierCompanyDetails.PaymentTermsId
                           }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                        }
                        else
                        {
                            var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                                new
                                {
                                    Action = "INSERT",
                                    SupplierId = supplier.SupplierCompanyDetails.SupplierId,
                                    CompanyId = supplier.SupplierCompanyDetails.CompanyId,
                                    TaxId = supplier.SupplierCompanyDetails.TaxId,
                                    TaxClass = supplier.SupplierCompanyDetails.TaxClass,
                                    RateType = supplier.SupplierCompanyDetails.RateType,
                                    Justification = string.IsNullOrEmpty(supplier.SupplierCompanyDetails.Justification) ? string.Empty : supplier.SupplierCompanyDetails.Justification,
                                    CurrencyId = supplier.SupplierCompanyDetails.CurrencyId,
                                    CreditLimit = supplier.SupplierCompanyDetails.CreditLimit,
                                    BankCode = supplier.SupplierCompanyDetails.BankCode,
                                    GLAccount = supplier.SupplierCompanyDetails.GLAccount,
                                    ReviewedDate = supplier.SupplierCompanyDetails.ReviewedDate,
                                    PaymentTermsId = supplier.SupplierCompanyDetails.PaymentTermsId
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                            if (supplier.SupplierApproval.WorkFlowStatusId == (int)WorkFlowStatus.Draft)
                            {
                                var result = this.m_dbconnection.Execute("SupplierCompanyDetails_CRUD",
                                new
                                {
                                    Action = "CLEAREXIST",
                                    SupplierId = supplier.SupplierCompanyDetails.SupplierId,
                                    CompanyId = supplier.SupplierCompanyDetails.CompanyId,
                                    SupplierCompanyId = supplierCompanyId
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj);
                            }
                        }
                    }

                    #endregion

                    #region  Saving Supplier Approval details

                    if (supplier.SupplierApproval != null)
                    {
                        if (supplier.SupplierApproval.SupplierApprovalId > 0)
                        {
                            var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierApproval_CRUD", new
                            {
                                Action = "UPDATE",
                                SupplierApprovalId = supplier.SupplierApproval.SupplierApprovalId,
                                SupplierId = supplier.SupplierApproval.SupplierId,
                                CompanyId = supplier.SupplierApproval.CompanyId,
                                WorkFlowStatusId = supplier.SupplierApproval.WorkFlowStatusId
                            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                        }
                        else
                        {
                            var supplierCompanyId = this.m_dbconnection.Query<int>("SupplierApproval_CRUD", new
                            {
                                Action = "INSERT",
                                SupplierId = supplier.SupplierApproval.SupplierId,
                                CompanyId = supplier.SupplierApproval.CompanyId,
                                WorkFlowStatusId = supplier.SupplierApproval.WorkFlowStatusId
                            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                            if (supplier.SupplierApproval.WorkFlowStatusId == (int)WorkFlowStatus.Draft)
                            {
                                var result = this.m_dbconnection.Execute("SupplierApproval_CRUD", new
                                {
                                    Action = "CLEAREXIST",
                                    SupplierId = supplier.SupplierApproval.SupplierId,
                                    CompanyId = supplier.SupplierApproval.CompanyId
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj);
                            }
                        }
                    }

                    #endregion

                    #region we are saving contact persons details...

                    if (supplier.ContactPersons != null)
                    {
                        List<DynamicParameters> personsToAdd = new List<DynamicParameters>();
                        //if (supplier.SupplierApproval.WorkFlowStatusId == (int)WorkFlowStatus.Draft)
                        //{
                        var result = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", new
                        {
                            Action = "DELETEALL",
                            SupplierId = supplier.SupplierApproval.SupplierId,
                            CompanyId = supplier.SupplierApproval.CompanyId
                        }, commandType: CommandType.StoredProcedure, transaction: transactionObj);
                        //}
                        //looping through the list of contact persons...
                        foreach (var record in supplier.ContactPersons)
                        {
                            var personObj = new DynamicParameters();

                            personObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            personObj.Add("@SupplierId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@CompanyId", supplier.SupplierCompanyDetails.CompanyId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                            personObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                            personObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                            personObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            personObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                            personObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                            personObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);

                            personsToAdd.Add(personObj);
                        }
                        var contactPersonSaveResult = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", personsToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                    }
                    #endregion

                    #region  Saving supplier services

                    int companyId = supplier.SupplierServices.Select(s => s.CompanyId).FirstOrDefault();

                    var deleteResult = this.m_dbconnection.Execute("SupplierSelectedService_CRUD",
                                               new
                                               {
                                                   Action = "DELETE",
                                                   SupplierId = supplier.SupplierId,
                                                   CompanyId = companyId
                                               },
                                               transaction: transactionObj,
                                               commandType: CommandType.StoredProcedure);

                    if (supplier.SupplierServices != null)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        foreach (var record in supplier.SupplierServices)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SupplierId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@SupplierServiceID", record.SupplierServiceID, DbType.String, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }

                        var saveResult = this.m_dbconnection.Execute("SupplierSelectedService_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }

                    #endregion                  

                    #region updating contact persons details...

                    List<DynamicParameters> contactPersonsToUpdate = new List<DynamicParameters>();

                    //looping through the list of contact persons
                    foreach (var record in supplier.ContactPersons.Where(i => i.ContactPersonId > 0).Select(i => i))
                    {
                        var personObj = new DynamicParameters();

                        personObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                        personObj.Add("@SupplierId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                        personObj.Add("@CompanyId", supplier.CompanyId, DbType.Int32, ParameterDirection.Input);
                        personObj.Add("@ContactPersonId", record.ContactPersonId, DbType.Int32, ParameterDirection.Input);
                        personObj.Add("@Name", record.Name, DbType.String, ParameterDirection.Input);
                        personObj.Add("@ContactNumber", record.ContactNumber, DbType.String, ParameterDirection.Input);
                        personObj.Add("@EmailId", record.EmailId, DbType.String, ParameterDirection.Input);
                        personObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        personObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                        personObj.Add("@Saluation", record.Saluation, DbType.String, ParameterDirection.Input);
                        personObj.Add("@Surname", record.Surname, DbType.String, ParameterDirection.Input);
                        personObj.Add("@Department", record.Department, DbType.String, ParameterDirection.Input);

                        contactPersonsToUpdate.Add(personObj);
                    }


                    var supplierContactPersonseUpdateResult = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", contactPersonsToUpdate,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                    #endregion

                    #region deleting contact persons details...

                    List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();
                    companyId = supplier.ContactPersons.Select(cp => cp.CompanyId).FirstOrDefault();
                    if (supplier.ContactPersonsToDelete != null)
                    {
                        foreach (var purchaseOrderItemId in supplier.ContactPersonsToDelete)
                        {
                            var personObj = new DynamicParameters();

                            personObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            personObj.Add("@ContactPersonId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@CompanyId", companyId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@SupplierId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            personObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);


                            itemsToDelete.Add(personObj);
                        }
                    }

                    var supplierContactPersonseDeleteResult = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", itemsToDelete,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                    #endregion

                    #region deleting attachments
                    //looping through attachments
                    List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                    for (var i = 0; i < supplier.Attachments.Count; i++)
                    {
                        var fileObj = new DynamicParameters();
                        fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                        fileObj.Add("@AttachmentTypeId", supplier.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                        fileObj.Add("@RecordId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                        fileObj.Add("@AttachmentId", supplier.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                        fileToDelete.Add(fileObj);
                        var salesOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                              commandType: CommandType.StoredProcedure);
                        //deleting files in the folder...
                        FileOperations fileOperationsObj = new FileOperations();
                        bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = AttachmentFolderNames.Supplier,
                            FilesNames = supplier.Attachments.Select(j => j.FileName).ToArray(),
                            UniqueId = supplier.SupplierId.ToString()
                        });
                    }

                    #endregion

                    #region saving files uploaded files...
                    try
                    {
                        List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                        //looping through the list of sales order items...
                        for (var i = 0; i < supplier.UploadFiles.Count; i++)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Supplier), DbType.Int32, ParameterDirection.Input);//static value need to change
                            itemObj.Add("@RecordId", supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@FileName", supplier.UploadFiles[i].FileName, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", supplier.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            fileToSave.Add(itemObj);
                        }

                        var salesOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);

                        //saving files in the folder...
                        FileOperations fileOperationsObj = new FileOperations();
                        bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = AttachmentFolderNames.Supplier,
                            Files = supplier.UploadFiles,
                            UniqueId = supplier.SupplierId.ToString()
                        });

                    }
                    catch (Exception e)
                    {
                        throw e;
                    }
                    #endregion

                    #region updating supplier sub codes

                    List<DynamicParameters> subCodesToUpdate = new List<DynamicParameters>();

                    foreach (var record in supplier.SubCodes)
                    {
                        var personObj = new DynamicParameters();

                        if (record.SubCodeId > 0)
                        {
                            this.m_dbconnection.Query<int>("SupplierSubCode_CRUD",
                              new
                              {
                                  Action = "UPDATE",
                                  SubCodeId = record.SubCodeId,
                                  SupplierId = record.SupplierId,
                                  CompanyId = record.CompanyId,
                                  SubCodeDescription = record.SubCodeDescription,
                                  SubCode = record.SubCode,
                                  AccountSetId = record.AccountSetId,
                                  LocationId = supplier.LocationId,
                                  UpdatedBy = supplier.UpdatedBy,
                                  UpdatedDate = DateTime.Now
                              }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                        }
                        else
                        {
                            int subCodeId = this.m_dbconnection.Query<int>("SupplierSubCode_CRUD",
                            new
                            {
                                Action = "INSERT",
                                SupplierId = supplier.SupplierId,
                                CompanyId = record.CompanyId,
                                SubCodeDescription = record.SubCodeDescription,
                                SubCode = record.SubCode,
                                AccountSetId = record.AccountSetId,
                                LocationId = supplier.LocationId,
                                CreatedBy = supplier.CreatedBy,
                                CreatedDate = DateTime.Now
                            }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                            if (supplier.SupplierApproval.WorkFlowStatusId == (int)WorkFlowStatus.Draft)
                            {
                                var result = this.m_dbconnection.Execute("SupplierSubCode_CRUD", new
                                {
                                    Action = "CLEAREXIST",
                                    SupplierId = supplier.SupplierApproval.SupplierId,
                                    CompanyId = supplier.SupplierApproval.CompanyId,
                                    SubCodeId = subCodeId
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj);
                            }
                        }
                    }
                    #endregion

                    //commiting the transaction...
                    transactionObj.Commit();

                    //setting work flow approvers
                    if (supplier.IsSupplierVerifier)
                    {
                        int approvalCount = 0;
                        int status = 0;
                        string approvalStatus = string.Empty;
                        workFlowConfigRepository = new WorkFlowConfigurationRepository();
                        int deletedWorkFlowId = 0;
                        var approverList = this.m_dbconnection.Query<SupplierVerificationApprover>("WorkFlow_CRUD",
                     new
                     {
                         Action = "VERIFIERAPPROVER",
                         DocumentId = supplier.WorkFlowDetails.DocumentId,
                         ProcessId = supplier.WorkFlowDetails.ProcessId,
                         CompanyId = supplier.WorkFlowDetails.CompanyId,
                     }, transaction: transactionObj,
                     commandType: CommandType.StoredProcedure).ToList();

                        var verificationApprover = approverList.Where(app => app.IsSupplierVerrfier == true).FirstOrDefault();
                        int count = 0;
                        var updatedApproverList = this.workFlowConfigRepository.GetWorkFlowApprovers(supplier.WorkFlowDetails);
                        var isCreditLimit = updatedApproverList.FirstOrDefault(x => x.IsCreditLimit == true);
                        bool isSame = true;
                        var matchedCount = updatedApproverList.Except(updatedApproverList.Where(o => approverList.Select(s => s.ApproverUserId).ToList().Contains(o.ApproverUserId))).ToList();

                        if (matchedCount.Count() > 0)
                        {
                            isSame = false;
                        }

                        if (approverList != null && supplier.SupplierApproval.WorkFlowStatusId != (int)WorkFlowStatus.Approved)
                        {
                            if (approverList.Count > 0)
                            {
                                //if (supplier.WorkFlowDetails.IsCreditLimitChanged && isCreditLimit != null)
                                //{
                                approvalCount = approverList.Count;
                                List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                foreach (var approver in approverList)
                                {
                                    if (verificationApprover != null && verificationApprover.NextValue != null)
                                    {
                                        if (verificationApprover.NextValue == approver.ApproverUserId)
                                        {
                                            if (supplier.WorkFlowDetails.Value == null)
                                            {
                                                if (approver.ApproverUserId == verificationApprover.NextValue && !isSame)
                                                {
                                                    deletedWorkFlowId = (from a in approverList
                                                                         where a.ApproverUserId == approver.ApproverUserId
                                                                         select a.WorkFlowId).FirstOrDefault();
                                                }
                                            }
                                            else
                                            {
                                                if (!isSame)
                                                {
                                                    if (approver.ApproverUserId == verificationApprover.NextValue)
                                                    {
                                                        deletedWorkFlowId = (from a in approverList
                                                                             where a.ApproverUserId == approver.ApproverUserId
                                                                             select a.WorkFlowId).FirstOrDefault();
                                                    }
                                                }

                                            }
                                        }
                                    }
                                }

                                //checking supplier credit limit                             

                                if (deletedWorkFlowId > 0)
                                {
                                    var itemObj = new DynamicParameters();
                                    List<DynamicParameters> itemToDelete = new List<DynamicParameters>();

                                    itemObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@WorkFlowId", deletedWorkFlowId, DbType.Int32, ParameterDirection.Input);
                                    itemToDelete.Add(itemObj);

                                    this.m_dbconnection.Execute("WorkFlow_CRUD", itemToDelete, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                    verificationApprover.NextValue = null;

                                }

                                foreach (var updatedApprover in updatedApproverList)
                                {
                                    var match = approverList.FirstOrDefault(x => x.ApproverUserId == updatedApprover.ApproverUserId);
                                    var itemObj = new DynamicParameters();
                                    if (match == null)
                                    {
                                        count++;
                                        if (count == 1)
                                        {
                                            //status = Convert.ToInt32(WorkFlowStatus.Initiated);

                                            if (verificationApprover.NextValue == null)
                                            {
                                                verificationApprover.NextValue = updatedApprover.ApproverUserId;
                                                status = Convert.ToInt32(WorkFlowStatus.ApprovalInProgress);
                                            }
                                            else
                                            {
                                                status = Convert.ToInt32(WorkFlowStatus.Initiated);
                                            }

                                        }

                                        if (supplier.WorkFlowDetails.Value != null)
                                        {
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@DocumentId", supplier.WorkFlowDetails.DocumentId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@ProcessId", updatedApprover.ProcessId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CompanyId", supplier.WorkFlowDetails.CompanyId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@ApproverUserId", updatedApprover.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@WorkFlowOrder", updatedApprover.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@WorkFlowStatusId", status, DbType.Int32, ParameterDirection.Input);
                                            itemToAdd.Add(itemObj);
                                            count = 0;
                                        }
                                    }

                                }



                                var workFlowStatus = this.m_dbconnection.Execute("WorkFlow_CRUD", itemToAdd, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                                //}
                            }
                        }

                        #region  Freezing supplier when supplier details are changed by Supplier Verifier   

                        //bool isFreezedAll = false;
                        //bool isChanged = false;

                        //if (supplier.OldSupplier != null)
                        //{
                        //    isChanged = CompareNameAndAddress(supplier, supplier.OldSupplier);
                        //    if (isChanged == false)
                        //    {
                        //        isChanged = CompareSupplierOtherFiels(supplier, supplier.OldSupplier);
                        //    }

                        //    if (isChanged)
                        //    {
                        //        isFreezedAll = true;
                        //        var freezeResult = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                        //       new
                        //       {
                        //           Action = "FREEZE",
                        //           SupplierId = supplier.WorkFlowDetails.DocumentId,
                        //           CompanyId = supplier.WorkFlowDetails.CompanyId,
                        //           IsFreezedAll = isFreezedAll
                        //       }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                        //    }
                        //}

                        #endregion

                    }
                    if (supplier.CompanyId != 0)
                    {
                        int attachcompanyId = supplier.SupplierServices.Select(s => s.CompanyId).FirstOrDefault();
                        DateTime now = DateTime.Now;
                        string UserName = string.Empty;
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        if (supplier.UpdatedBy != 0)
                        {
                            var user = userProfileRepository.GetUserById(supplier.UpdatedBy);
                            UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        }
                        companyRepository = new CompanyRepository();
                        string prevCompany = companyRepository.GetCompany(supplier.CompanyId).CompanyName;
                        string attachCompany = companyRepository.GetCompany(attachcompanyId).CompanyName;
                        int statusid = m_dbconnection.Query<int>("select WorkFlowStatusId from SupplierApproval where SupplierId=" + supplier.SupplierId + " and CompanyId=" + attachcompanyId).FirstOrDefault();
                        if (statusid == (int)WorkFlowStatus.Draft && supplier.IsAttached)
                        {
                            AuditLog.Info(WorkFlowProcessTypes.Supplier.ToString(), "SupplierAttach", supplier.UpdatedBy.ToString(), supplier.SupplierId.ToString(), "CreateSupplier", "Supplier Attached from " + prevCompany + " to " + attachCompany + " on " + now, attachcompanyId);
                        }

                        if (supplier.SupplierApproval.WorkFlowStatusId == 4)
                        {
                            Supplier newSupplier = GetSupplier(supplier.SupplierId, supplier.CompanyId);
                            AuditLogRepository auditLogRepository = new AuditLogRepository();
                            auditLogRepository.LogSupplierReverify(oldSupplier, newSupplier);
                        }
                    }


                    return supplierSaveResult;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public void UpdateSupplierIdInDocuments(int parentSupplierId, int supplierId)
        {

            try
            {
                var supplierDetail = this.m_dbconnection.Execute("Supplier_CRUD",
                                     new
                                     {
                                         Action = "UPDATESUPPID",
                                         SupplierId = supplierId,
                                         ParentSupplierId = parentSupplierId
                                     },

                                     commandType: CommandType.StoredProcedure);

            }
            catch (Exception e)
            {

                throw e;
            }

        }

        public bool UpdateAttachStatus(int documentId, int companyId, bool status)
        {
            bool IsUpdated = false;
            try
            {
                int res = this.m_dbconnection.Query<int>("update SupplierSubCode set IsAttached=@status where SupplierId=@documentId and CompanyId=@companyId", new
                {
                    status = status,
                    documentId = documentId,
                    companyId = companyId
                }).FirstOrDefault();
                IsUpdated = res > 0 ? true : false;
            }
            catch (Exception ex)
            {

                throw;
            }
            return IsUpdated;
        }

        public bool DeleteSupplier(int supplierId, int createdBy, int companyId, bool IsReapproval)
        {
            if (this.m_dbconnection.State == ConnectionState.Closed)
                this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    #region deleting supplier contact persons ...

                    var supplierContactPersonRecords = this.m_dbconnection.Execute("SupplierContactPerson_CRUD", new
                    {

                        Action = "DELETEALL",
                        SupplierId = supplierId,
                        CompanyId = companyId
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    #endregion

                    #region deleting supplier sub codes...

                    var deleteResult = this.m_dbconnection.Execute("SupplierSubCode_CRUD", new
                    {
                        Action = "DELETEALL",
                        SupplierId = supplierId,
                        CompanyId = companyId

                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    #endregion

                    #region deleting supplier company details ...

                    var result = this.m_dbconnection.Execute("SupplierCompanyDetails_CRUD", new
                    {

                        Action = "DELETE",
                        SupplierId = supplierId,
                        CompanyId = companyId
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    #endregion
                    if (IsReapproval)
                    {

                        #region Delete all supplier companies

                        var resultdeleteall = this.m_dbconnection.Execute("SupplierCompanyDetails_CRUD", new
                        {

                            Action = "DELETECOMP",
                            SupplierId = supplierId,
                            CompanyId = companyId
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                    }
                    #endregion

                    #region deleting supplier service details ...

                    var serviceResult = this.m_dbconnection.Execute("SupplierSelectedService_CRUD", new
                    {

                        Action = "DELETE",
                        SupplierId = supplierId,
                        CompanyId = companyId
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    #endregion

                    #region deleting supplier approval details ...

                    var approvalResult = this.m_dbconnection.Execute("SupplierApproval_CRUD", new
                    {

                        Action = "DELETE",
                        SupplierId = supplierId,
                        CompanyId = companyId
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    #endregion

                    #region deleting supplier...
                    var supplierDetail = this.m_dbconnection.Query<bool>("Supplier_CRUD",
                                         new
                                         {
                                             Action = "DELETE",
                                             SupplierId = supplierId,
                                             CompanyId = companyId
                                         },
                                         transaction: transactionObj,
                                         commandType: CommandType.StoredProcedure).FirstOrDefault();

                    #endregion
                    //commiting the transaction...
                    transactionObj.Commit();

                    return supplierDetail;

                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public IEnumerable<SupplierService> GetSupplierServices(int? supplierId)
        {
            return this.m_dbconnection.Query<SupplierService>("usp_GetSupplierServices", new
            {

                SupplierId = supplierId

            }, commandType: CommandType.StoredProcedure).ToList().OrderBy(x => x.ServiceName);
        }

        public IEnumerable<SupplierCategory> GetServiceCategroies()
        {
            return this.m_dbconnection.Query<SupplierCategory>("usp_GetServiceCategroies", commandType: CommandType.StoredProcedure).ToList();
        }
        public IEnumerable<GSTStatus> GetGSTStatus()
        {
            return this.m_dbconnection.Query<GSTStatus>("usp_GetGSTStatus", commandType: CommandType.StoredProcedure).ToList();
        }
        public IEnumerable<SupplierCategory> GetServiceCategroies(string searchKey)
        {
            return this.m_dbconnection.Query<SupplierCategory>("usp_GetServiceCategroies", new { SearchKey = searchKey }, commandType: CommandType.StoredProcedure).ToList();
        }

        public IEnumerable<Country> GetCountries()
        {
            return this.m_dbconnection.Query<Country>("usp_GetCountries", commandType: CommandType.StoredProcedure).ToList();
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                FileOperations fileOperationsObj = new FileOperations();

                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.Supplier,
                    FilesNames = new string[] { attachment.FileName },
                    UniqueId = attachment.RecordId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public UploadResult UploadSupplier(string filePath, int userId)
        {
            UploadResult uploadResult = null;
            try
            {
                this.m_dbconnection.Open();
                System.IO.FileStream fs;
                int count = 0;
                int Fcount = 0;
                int loopCnt = 0;
                fs = File.Open(filePath, FileMode.Open, FileAccess.Read);
                var excelReader = new ExcelReader(fs);

                uploadResult = new UploadResult();
                uploadResult.FailLog = new List<string>();
                IEnumerable<DataRow> SupplierExportData = null;
                IEnumerable<DataRow> SupplierContactPersonsData = null;
                IEnumerable<DataRow> SupplierSubCodeData = null;
                IEnumerable<DataRow> SupplierFinanceInfoData = null;
                IEnumerable<DataRow> SupplierServicesData = null;
                List<SupplierExport> itemList = new List<SupplierExport>();
                List<SupplierContactPersonsExport> itemListSCP = new List<SupplierContactPersonsExport>();
                List<SupplierSubCodeExport> itemListSSE = new List<SupplierSubCodeExport>();
                List<SupplierFinanceInfoExport> itemListSFIE = new List<SupplierFinanceInfoExport>();
                List<SupplierServicesExport> itemListSS = new List<SupplierServicesExport>();
                List<DynamicParameters> supplierToUpdate = new List<DynamicParameters>();
                List<DynamicParameters> supplierCPxport = new List<DynamicParameters>();
                List<DynamicParameters> supplierSSCxport = new List<DynamicParameters>();
                List<DynamicParameters> supplierSFIxport = new List<DynamicParameters>();
                List<DynamicParameters> supplierSSxport = new List<DynamicParameters>();
                SupplierExportData = excelReader.GetData("Supplier");
                SupplierContactPersonsData = excelReader.GetData("Supplier contact Persons");
                SupplierSubCodeData = excelReader.GetData("Supplier Subcode");
                SupplierFinanceInfoData = excelReader.GetData("Supplier Finance Info");
                SupplierServicesData = excelReader.GetData("Supplier Services");
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    foreach (var v in SupplierExportData)
                    {
                        SupplierExport excelModel = new SupplierExport()
                        {
                            SupplierName = v["SupplierName"].ToString(),
                            SupplierShortName = v["SupplierShortName"].ToString(),
                            SupplierCategory = v["SupplierCategory"].ToString(),
                            CurrencyCode = v["CurrencyCode"].ToString(),
                            BillingAddress1 = v["BillingAddress1"].ToString(),
                            BillingAddress2 = v["BillingAddress2"].ToString(),
                            BillingAddress3 = v["BillingAddress3"].ToString(),
                            BillingCity = v["BillingCity"].ToString(),
                            BillingCountry = v["BillingCountry"].ToString(),
                            BillingZipcode = v["BillingZipcode"].ToString(),
                            BillingTelephone = v["BillingTelephone"].ToString(),
                            BillingFax = v["BillingFax"].ToString(),
                            SupplierType = v["SupplierType"].ToString(),
                            CoSupplierCode = v["CoSupplierCode"].ToString(),
                            SupplierEmail = v["SupplierEmail"].ToString(),
                            Remarks = v["Remarks"].ToString(),
                            GSTStatus = v["GSTStatus"].ToString(),
                            GSTNumber = v["GSTNumber"].ToString(),
                            ShareCapital = v["ShareCapital"].ToString(),
                        };

                        itemList.Add(excelModel);

                    }
                    loopCnt = 0;
                    foreach (var columnValue in itemList)
                    {
                        DynamicParameters itemObj = new DynamicParameters();
                        loopCnt++;
                        itemObj.Add("@Action", "INSERTSupplier_XLS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierName", Convert.ToString(columnValue.SupplierName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierShortName", Convert.ToString(columnValue.SupplierShortName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierCategory", Convert.ToString(columnValue.SupplierCategory), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CurrencyCode", Convert.ToString(columnValue.CurrencyCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingAddress1", Convert.ToString(columnValue.BillingAddress1), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingAddress2", Convert.ToString(columnValue.BillingAddress2), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingAddress3", Convert.ToString(columnValue.BillingAddress3), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingCity", Convert.ToString(columnValue.BillingCity), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingCountry", Convert.ToString(columnValue.BillingCountry), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingZipcode", Convert.ToString(columnValue.BillingZipcode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingTelephone", Convert.ToString(columnValue.BillingTelephone), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@BillingFax", Convert.ToString(columnValue.BillingFax), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CoSupplierCode", Convert.ToString(columnValue.CoSupplierCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierType", Convert.ToString(columnValue.SupplierType), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierEmail", Convert.ToString(columnValue.SupplierEmail), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Remarks", Convert.ToString(columnValue.Remarks), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@GSTStatus", Convert.ToString(columnValue.GSTStatus), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@GSTNumber", Convert.ToString(columnValue.GSTNumber), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@LoopCnt", loopCnt, DbType.Int32, ParameterDirection.Input);
                        if (columnValue.ShareCapital.ToString().Trim() != "")
                        {
                            itemObj.Add("@ShareCapital", Convert.ToDecimal(columnValue.ShareCapital), DbType.Decimal, ParameterDirection.Input);
                        }
                        else
                        {
                            itemObj.Add("@ShareCapital", 0.0, DbType.Decimal, ParameterDirection.Input);
                        }
                        itemObj.Add("@Uploadresult", dbType: DbType.Int32, direction: ParameterDirection.Output);

                        supplierToUpdate.Add(itemObj);
                    }
                    var result = this.m_dbconnection.Execute("Ips_Sp_SupplierImportExcel", supplierToUpdate,
                                               transaction: objTransaction,
                                               commandType: CommandType.StoredProcedure);
                    supplierToUpdate.ForEach(data =>
                    {
                        result = data.Get<int>("@Uploadresult");
                        if (result == 1)
                            count++;
                        else
                        {
                            uploadResult.FailLog.Add(string.Format("'{0}' Duplicate Supplier Exist In Excel File.", data.Get<string>("@SupplierName")));
                            Fcount++;
                        }
                    });

                    foreach (var v in SupplierContactPersonsData)
                    {
                        SupplierContactPersonsExport excelModelCPE = new SupplierContactPersonsExport()
                        {
                            SupplierName = v["SupplierName"].ToString(),
                            CompanyCode = v["CompanyCode"].ToString(),
                            Surname = v["Surname"].ToString(),
                            Name = v["Name"].ToString(),
                            ContactNumber = v["ContactNumber"].ToString(),
                            Email = v["Email"].ToString(),
                            Saluation = v["Saluation"].ToString(),
                            Department = v["Department"].ToString(),

                        };

                        itemListSCP.Add(excelModelCPE);

                    }
                    loopCnt = 0;
                    foreach (var columnValue in itemListSCP)
                    {
                        DynamicParameters itemObj = new DynamicParameters();
                        loopCnt++;
                        itemObj.Add("@Action", "contactPersons", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierName", Convert.ToString(columnValue.SupplierName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CompanyCode_XLS", Convert.ToString(columnValue.CompanyCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Surname", Convert.ToString(columnValue.Surname), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Name", Convert.ToString(columnValue.Name), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ContactNumber", Convert.ToString(columnValue.ContactNumber), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Email", Convert.ToString(columnValue.Email), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Saluation", Convert.ToString(columnValue.Saluation), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Department", Convert.ToString(columnValue.Department), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@LoopCnt", loopCnt, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@Uploadresult", dbType: DbType.Int32, direction: ParameterDirection.Output);
                        supplierCPxport.Add(itemObj);
                    }
                    var result1 = this.m_dbconnection.Execute("Ips_Sp_SupplierImportExcel", supplierCPxport,
                                              transaction: objTransaction,
                                              commandType: CommandType.StoredProcedure);
                    supplierCPxport.ForEach(data =>
                    {
                        result = data.Get<int>("@Uploadresult");
                        if (result == 1)
                            count++;
                        else
                            Fcount++;

                    });
                    foreach (var v in SupplierSubCodeData)
                    {
                        SupplierSubCodeExport excelModelSSE = new SupplierSubCodeExport()
                        {
                            SupplierName = v["SupplierName"].ToString(),
                            CompanyCode = v["CompanyCode"].ToString(),
                            SubCodeDescription = v["SubCodeDescription"].ToString(),
                            SubCode = v["SubCode"].ToString(),
                            AccountSet = v["AccountSet"].ToString(),
                            Department = v["Department"].ToString()
                        };

                        itemListSSE.Add(excelModelSSE);

                    }
                    loopCnt = 0;
                    foreach (var columnValue in itemListSSE)
                    {
                        DynamicParameters itemObj = new DynamicParameters();
                        loopCnt++;
                        itemObj.Add("@Action", "INSERTSupplierSubcode_XLS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierName", Convert.ToString(columnValue.SupplierName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CompanyCode_XLS", Convert.ToString(columnValue.CompanyCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SubCodeDescription", Convert.ToString(columnValue.SubCodeDescription), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SubCode", Convert.ToString(columnValue.SubCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@AccountSet", Convert.ToString(columnValue.AccountSet), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Department", Convert.ToString(columnValue.Department).Trim(), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@LoopCnt", loopCnt, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@Uploadresult", dbType: DbType.Int32, direction: ParameterDirection.Output);
                        supplierSSCxport.Add(itemObj);
                    }
                    var result2 = this.m_dbconnection.Execute("Ips_Sp_SupplierImportExcel", supplierSSCxport,
                                               transaction: objTransaction,
                                               commandType: CommandType.StoredProcedure);
                    supplierSSCxport.ForEach(data =>
                    {
                        result = data.Get<int>("@Uploadresult");
                        if (result == 1)
                            count++;
                        else
                            Fcount++;

                    });
                    foreach (var v in SupplierFinanceInfoData)
                    {
                        SupplierFinanceInfoExport excelModelSFIE = new SupplierFinanceInfoExport()
                        {
                            SupplierName = v["SupplierName"].ToString(),
                            CompanyCode = v["CompanyCode"].ToString(),
                            TaxGroup = v["TaxGroup"].ToString(),
                            TaxClass = v["TaxClass"].ToString(),
                            GstType = v["GstType"].ToString(),
                            TaxinPercentage = v["TaxinPercentage"].ToString(),
                            // GSTNumber = v["GSTNumber"].ToString(),
                            RateType = v["RateType"].ToString(),
                            Justification = v["Justification"].ToString(),
                            //ShareCapital = v["ShareCapital"].ToString(),
                            CreditLimit = v["CreditLimit"].ToString(),
                            BankCode = v["BankCode"].ToString(),
                            GLAccount = v["GLAccount"].ToString(),
                            ReviewedDate = v["ReviewedDate"].ToString(),
                            PaymentTermsCode = v["PaymentTermsCode"].ToString(),
                            PaymentTermsNoOfDays = v["PaymentTermsNoOfDays"].ToString(),
                        };

                        itemListSFIE.Add(excelModelSFIE);

                    }
                    loopCnt = 0;
                    foreach (var columnValue in itemListSFIE)
                    {
                        DynamicParameters itemObj = new DynamicParameters();
                        loopCnt++;
                        itemObj.Add("@Action", "INSERTSupplierFinanceInfo_XLS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierName", Convert.ToString(columnValue.SupplierName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CompanyCode_XLS", Convert.ToString(columnValue.CompanyCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@TaxGroup", Convert.ToString(columnValue.TaxGroup), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@TaxClass", Convert.ToString(columnValue.TaxClass), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@GstType", Convert.ToString(columnValue.GstType), DbType.String, ParameterDirection.Input);
                        if (columnValue.TaxinPercentage == string.Empty || columnValue.TaxinPercentage == "")
                        {
                            itemObj.Add("@TaxinPercentage", 0, DbType.Int32, ParameterDirection.Input);
                        }
                        else
                        {
                            itemObj.Add("@TaxinPercentage", Convert.ToInt32(columnValue.TaxinPercentage), DbType.Int32, ParameterDirection.Input);
                        }
                        //itemObj.Add("@GSTNumber", Convert.ToString(columnValue.GSTNumber), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@RateType", Convert.ToString(columnValue.RateType), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@Justification", Convert.ToString(columnValue.Justification), DbType.String, ParameterDirection.Input);
                        //if (columnValue.ShareCapital.ToString().Trim() != "")
                        //{
                        //    itemObj.Add("@ShareCapital", Convert.ToDecimal(columnValue.ShareCapital), DbType.Decimal, ParameterDirection.Input);
                        //}
                        //else
                        //{
                        //    itemObj.Add("@ShareCapital", 0.0, DbType.Decimal, ParameterDirection.Input);
                        //}
                        if (columnValue.CreditLimit.ToString().Trim() != "")
                        {
                            itemObj.Add("@CreditLimit", Convert.ToString(columnValue.CreditLimit), DbType.String, ParameterDirection.Input);
                        }
                        else
                        {
                            itemObj.Add("@CreditLimit", 0.0, DbType.Decimal, ParameterDirection.Input);
                        }
                        itemObj.Add("@BankCode", Convert.ToString(columnValue.BankCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@GLAccount", Convert.ToString(columnValue.GLAccount), DbType.String, ParameterDirection.Input);
                        if (!string.IsNullOrEmpty(columnValue.ReviewedDate))
                        {
                            itemObj.Add("@ReviewedDate", Convert.ToString(columnValue.ReviewedDate), DbType.DateTime, ParameterDirection.Input);
                        }
                        itemObj.Add("@PaymentTermsCode", Convert.ToString(columnValue.PaymentTermsCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@LoopCnt", loopCnt, DbType.Int32, ParameterDirection.Input);
                        if (columnValue.PaymentTermsNoOfDays == "")
                        {
                            itemObj.Add("@PaymentTermsNoOfDays", 0, DbType.Int32, ParameterDirection.Input);
                        }
                        else
                        {
                            itemObj.Add("@PaymentTermsNoOfDays", Convert.ToInt32(columnValue.PaymentTermsNoOfDays), DbType.Int32, ParameterDirection.Input);
                        }

                        itemObj.Add("@Uploadresult", dbType: DbType.Int32, direction: ParameterDirection.Output);
                        supplierSFIxport.Add(itemObj);
                    }
                    var result3 = this.m_dbconnection.Execute("Ips_Sp_SupplierImportExcel", supplierSFIxport,
                                               transaction: objTransaction,
                                               commandType: CommandType.StoredProcedure);
                    supplierSFIxport.ForEach(data =>
                    {
                        result = data.Get<int>("@Uploadresult");
                        if (result == 1)
                            count++;
                        else
                            Fcount++;

                    });
                    foreach (var v in SupplierServicesData)
                    {
                        SupplierServicesExport excelModelSS = new SupplierServicesExport()
                        {
                            SupplierName = v["SupplierName"].ToString(),
                            CompanyCode = v["CompanyCode"].ToString(),
                            ServiceName = v["ServiceName"].ToString(),
                            ServiceCategory = v["ServiceCategory"].ToString(),

                        };

                        itemListSS.Add(excelModelSS);

                    }
                    loopCnt = 0;
                    foreach (var columnValue in itemListSS)
                    {
                        DynamicParameters itemObj = new DynamicParameters();
                        loopCnt++;
                        itemObj.Add("@Action", "INSERTSupplierServices_XLS", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@SupplierName", Convert.ToString(columnValue.SupplierName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@CompanyCode_XLS", Convert.ToString(columnValue.CompanyCode), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ServiceName", Convert.ToString(columnValue.ServiceName), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ServiceCategory", Convert.ToString(columnValue.ServiceCategory), DbType.String, ParameterDirection.Input);
                        itemObj.Add("@LoopCnt", loopCnt, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@Uploadresult", dbType: DbType.Int32, direction: ParameterDirection.Output);
                        supplierSSxport.Add(itemObj);
                    }
                    var result4 = this.m_dbconnection.Execute("Ips_Sp_SupplierImportExcel", supplierSSxport,
                                               transaction: objTransaction,
                                               commandType: CommandType.StoredProcedure);
                    supplierSSxport.ForEach(data =>
                    {
                        result = data.Get<int>("@Uploadresult");
                        if (result == 1)
                            count++;
                        else
                            Fcount++;

                    });
                    objTransaction.Commit();
                    using (var objTransactionTest = this.m_dbconnection.BeginTransaction())
                    {
                        DynamicParameters itemObj = new DynamicParameters();
                        itemObj.Add("@totalCount", 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
                        itemObj.Add("@successCount", 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
                        itemObj.Add("@ErrorLog", string.Empty, dbType: DbType.String, direction: ParameterDirection.InputOutput);
                        var result5 = this.m_dbconnection.Execute("IPS_SpImportExcelData", itemObj, transaction: objTransactionTest,
                                                                           commandType: CommandType.StoredProcedure);
                        objTransactionTest.Commit();

                        uploadResult.TotalRecords = itemObj.Get<int>("@totalCount");
                        uploadResult.SuccesRecords = itemObj.Get<int>("@successCount");
                        string error = itemObj.Get<string>("@ErrorLog");
                        if (!string.IsNullOrEmpty(error))
                            //uploadResult.FailLog.AddRange(error.Split(','));
                            uploadResult.Message = string.Join(Environment.NewLine, error.Split(','));


                    }
                    //uploadResult.UploadedRecords = count;
                    //uploadResult.FailedRecords = Fcount;
                    ////commented by sateesh on 20.01.2020 to display uploadlog
                }


            }
            catch (Exception ex)
            {
                uploadResult.Message = ex.Message.ToString();
            }
            return uploadResult;
        }
        private CompanyDetails GetCompanyDetails(string companyName)
        {
            sharedRepositoryObj = new SharedRepository();
            return sharedRepositoryObj.GetCompanyDetails(companyName);
        }

        public int DetachSupplier(SupplierCompanyDetails supplierToDetach)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var detachResult = this.m_dbconnection.Query<int>("SupplierCompanyDetails_CRUD",
                    new
                    {
                        Action = "DETACH",
                        SupplierCompanyId = supplierToDetach.SupplierCompanyId,
                        SupplierId = supplierToDetach.SupplierId,
                        CompanyId = supplierToDetach.CompanyId,
                        IsDetached = supplierToDetach.IsDetached,
                        DetachedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();


                    //commiting the transaction...
                    transactionObj.Commit();

                    return detachResult;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public static bool Compare<T>(T Object1, T object2)
        {
            //Get the type of the object
            Type type = typeof(T);

            //return false if any of the object is false
            if (object.Equals(Object1, default(T)) || object.Equals(object2, default(T)))
                return false;

            //Loop through each properties inside class and get values for the property from both the objects and compare
            foreach (System.Reflection.PropertyInfo property in type.GetProperties())
            {
                if (property.Name != "ExtensionData")
                {
                    string Object1Value = string.Empty;
                    string Object2Value = string.Empty;
                    if (type.GetProperty(property.Name).GetValue(Object1, null) != null)
                        Object1Value = type.GetProperty(property.Name).GetValue(Object1, null).ToString();
                    if (type.GetProperty(property.Name).GetValue(object2, null) != null)
                        Object2Value = type.GetProperty(property.Name).GetValue(object2, null).ToString();
                    if (Object1Value.Trim() != Object2Value.Trim())
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        private static bool CompareNameAndAddress(Supplier oldSupplier, Supplier editedSupplier)
        {
            bool isChanged = false;

            if ((oldSupplier.SupplierName != editedSupplier.SupplierName) || (oldSupplier.BillingAddress1 != editedSupplier.BillingAddress1) || (oldSupplier.BillingAddress2 != editedSupplier.BillingAddress2) ||
               (oldSupplier.BillingAddress3 != editedSupplier.BillingAddress3) || (oldSupplier.BillingCity != editedSupplier.BillingCity) || (oldSupplier.BillingCountryId != editedSupplier.BillingCountryId) ||
               (oldSupplier.BillingFax != editedSupplier.BillingFax) || (oldSupplier.BillingZipcode != editedSupplier.BillingZipcode) || (oldSupplier.BillingTelephone != editedSupplier.BillingTelephone) ||
               (oldSupplier.SupplierEmail != editedSupplier.SupplierEmail))
            {
                isChanged = true;
            }

            return isChanged;
        }
        private static bool CompareSupplierOtherFiels(Supplier oldSupplier, Supplier editedSupplier)
        {
            bool isChanged = false;

            if ((oldSupplier.SupplierCompanyDetails.ReviewedDate != editedSupplier.SupplierCompanyDetails.ReviewedDate) || (oldSupplier.SupplierCompanyDetails.PaymentTermsId != editedSupplier.SupplierCompanyDetails.PaymentTermsId) || (oldSupplier.SupplierShortName != editedSupplier.SupplierShortName) ||
               (oldSupplier.Remarks != editedSupplier.Remarks) || (oldSupplier.SupplierCategoryID != editedSupplier.SupplierCategoryID) || (oldSupplier.GSTStatusId != editedSupplier.GSTStatusId) ||
               (oldSupplier.SupplierTypeID != editedSupplier.SupplierTypeID) || (oldSupplier.GSTNumber != editedSupplier.GSTNumber) || (oldSupplier.ShareCapital != editedSupplier.ShareCapital) ||
               (oldSupplier.SupplierCompanyDetails.CurrencyId != editedSupplier.SupplierCompanyDetails.CurrencyId) || (oldSupplier.SupplierCompanyDetails.TaxId != editedSupplier.SupplierCompanyDetails.TaxId) || (oldSupplier.SupplierCompanyDetails.TaxClass != editedSupplier.SupplierCompanyDetails.TaxClass) ||
               (oldSupplier.SupplierCompanyDetails.RateType != editedSupplier.SupplierCompanyDetails.RateType) || (oldSupplier.SupplierCompanyDetails.CreditLimit != editedSupplier.SupplierCompanyDetails.CreditLimit) ||
               (oldSupplier.SupplierCompanyDetails.BankCode != editedSupplier.SupplierCompanyDetails.BankCode) || (oldSupplier.SupplierCompanyDetails.GLAccount != editedSupplier.SupplierCompanyDetails.GLAccount))
            {
                isChanged = true;
            }

            var matchedCount = oldSupplier.SupplierServices.Except(oldSupplier.SupplierServices.Where(o => editedSupplier.SupplierServices.Select(s => s.SupplierServiceID).ToList().Contains(o.SupplierServiceID))).ToList();
            if (matchedCount.Count() > 0)
            {
                isChanged = true;
            }

            return isChanged;
        }
        public SupplierExportAll ExportAllSuppliers()
        {
            SupplierExportAll objSupplierExportAll = new SupplierExportAll();
            using (var result = this.m_dbconnection.QueryMultiple("SuppliersExport", commandType: CommandType.StoredProcedure))
            {
                objSupplierExportAll.supplierexport = result.Read<SupplierExport>().AsList();
                objSupplierExportAll.suppliercontactPersonsExport = result.Read<SupplierContactPersonsExport>().AsList();
                objSupplierExportAll.suppliersubCodeExport = result.Read<SupplierSubCodeExport>().AsList();
                objSupplierExportAll.supplierfinanceInfoExport = result.Read<SupplierFinanceInfoExport>().AsList();
                objSupplierExportAll.supplierservicesExport = result.Read<SupplierServicesExport>().AsList();

            }

            return objSupplierExportAll;
        }
        /// <summary>
        /// Get Vendors Export
        /// </summary>
        /// <param name="vendorInput"></param>
        /// <returns></returns>
        public VendorDisplayResult VendorsExport(GridDisplayInput vendorInput)
        {
            try
            {
                VendorDisplayResult vendorDisplayResult = new VendorDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("IPS_SpSupplierVendorsExport", new
                {
                    //Search = vendorInput.Search,
                    // Skip = vendorInput.Skip,
                    //  Take = vendorInput.Take,
                    CompanyId = vendorInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {

                    vendorDisplayResult.Vendor = result.Read<VendorsList>().AsList();
                    vendorDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return vendorDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// Export Selected Vendors by Id's
        /// </summary>
        /// <param name="vendorsLists"></param>
        /// <returns></returns>
        public VendorsList[] VendorsExportById(VendorsList[] vendorsLists, int companyId)
        {
            List<VendorsList> list = new List<VendorsList>();
            foreach (var vendor in vendorsLists)
            {
                list.AddRange((GetExportVendorDetails(vendor.SupplierId, companyId)));
            }
            return list.ToArray();
        }


        public List<VendorsList> GetExportVendorDetails(int SupplierId, int companyId)
        {
            try
            {
                List<VendorsList> vendorsList = new List<VendorsList>();
                using (var result = this.m_dbconnection.QueryMultiple("IPS_SpSupplierVendorsExportById",
                    new
                    {
                        Action = "VENDOREXPORT",
                        SupplierId = SupplierId,
                        CompanyId = companyId
                    },
                    commandType: CommandType.StoredProcedure))
                {
                    vendorsList = result.Read<VendorsList>().ToList();
                }
                return vendorsList;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        //public VendorsList GetExportVendorDetails(int SupplierId, int companyId)
        //{
        //    try
        //    {
        //        VendorsList vendorsList = new VendorsList();
        //        using (var result = this.m_dbconnection.QueryMultiple("IPS_SpSupplierVendorsExportById",
        //            new
        //            {
        //                Action = "VENDOREXPORT",
        //                SupplierId = SupplierId,
        //                CompanyId = companyId
        //            },
        //            commandType: CommandType.StoredProcedure))
        //        {
        //            vendorsList = result.Read<VendorsList>().FirstOrDefault();
        //        }
        //        return vendorsList;
        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }

        //}



        /// <summary>
        /// Changing the WorkFlow Status
        /// </summary>
        /// <param name="supplierId"></param>
        /// <param name="workFlowStatusId"></param>
        /// <returns></returns>
        public int ChangeWorkflowStatus(int supplierId, int CompanyId)
        {
            try
            {
                var result = this.m_dbconnection.Execute("IPS_SpSupplierVendorsExportById", new
                {

                    Action = "CHANGEWORKFLOWSTATUS",
                    SupplierId = supplierId,
                    CompanyId = CompanyId
                }, commandType: CommandType.StoredProcedure);

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public VendorDisplayResult VendorsExportByNewCreateSup(int supplierId, int companyId)
        {
            VendorDisplayResult result = new VendorDisplayResult();
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    result.Vendor = this.m_dbconnection.Query<VendorsList>("IPS_SpSupplierVendorsExportById",
                   new
                   {
                       Action = "VENDOREXPORT",// "ExportByNewCreatedSupplier",
                       SupplierId = supplierId,
                       companyId = companyId
                   }, commandType: CommandType.StoredProcedure, transaction: transactionObj).ToList();


                    //commiting the transaction...


                    var StatusChange = this.m_dbconnection.Query<VendorsList>("IPS_SpSupplierVendorsExportById",
                   new
                   {
                       Action = "CHANGEWORKFLOWSTATUS",
                       SupplierId = supplierId,
                       companyId = companyId
                   }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();

                    transactionObj.Commit();
                    return result;


                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public bool CheckDuplicateSupplier(int supplierId, string supplierName)
        {
            try
            {
                var result = this.m_dbconnection.Query<Supplier>("select * from supplier where SupplierId!=@SupplierId and suppliername = @supplierName and isdeleted=0 and isactive=0", new
                {
                    supplierId = supplierId,
                    supplierName = supplierName
                }).ToList();
                return result.Count > 0 ? true : false;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
