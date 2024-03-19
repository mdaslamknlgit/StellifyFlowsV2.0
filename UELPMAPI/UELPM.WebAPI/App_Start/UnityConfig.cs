using StellifyCRM.Business.List;
using StellifyFlows.Business.Interface;
using System.Web.Http;
using UELPM.Business;
using UELPM.Business.Interface;
using UELPM.Business.Managers;
using UELPM.Service;
using UELPM.Service.Interface;
using UELPM.Service.Repositories;
using Unity;

namespace UELPM.WebAPI.App_Start
{
    public static class UnityConfig
    {
        public static void ConfigureUnity(HttpConfiguration config)
        {
            var container = new UnityContainer();

            //employee
            container.RegisterType<IItemManager, ItemManager>();
            container.RegisterType<IItemRepository, ItemRepository>();

            container.RegisterType<IServiceCategoryManager, ServiceCategoryManager>();
            container.RegisterType<IServiceCategoryRepository, ServiceCategoryRepository>();

            //UserProfile
            container.RegisterType<IUserProfileManager, UserProfileManager>();
            container.RegisterType<IUserProfileRepository, UserProfileRepository>();

            //item category
            container.RegisterType<IItemCategoryManager,ItemCategoryManager>();
            container.RegisterType<IItemCategoryRepository,ItemCategoryRepository>();

            //ItemType
            container.RegisterType<IItemTypeManager, ItemTypeManager>();
            container.RegisterType<IItemTypeRepository, ItemTypeRepository>();

            //measurement unit
            container.RegisterType<IMeasurementUnitManager,MeasurementUnitManager>();
            container.RegisterType<IMeasurementUnitRepository, MeasurementUnitRepository>();

            //location transfer
            container.RegisterType<ILocationTransferManager, LocationTransferManager>();
            container.RegisterType<ILocationTransferRepository, LocationTransferRepository>();

            //Item Master
            container.RegisterType<IItemMasterManager, ItemMasterManager>();
            container.RegisterType<IItemMasterRepository, ItemMasterRepository>();

            //ItemsListing
            container.RegisterType<IItemsListingManager, ItemsListingManager>();
            container.RegisterType<IItemsListingRepository, ItemsListingRepository>();

            //inventory request
            container.RegisterType<IInventoryRequestManager, InventoryRequestManager>();
            container.RegisterType<IInventoryRequestRepository,InventoryRequestRepository>();

            //inventory disposal request
            container.RegisterType<IInventoryDisposalRequestManager,InventoryDisposalRequestManager>();
            container.RegisterType<IInventoryDisposalRequestRepository,InventoryDisposalRequestRepository>();
            //Item Adjustment
            container.RegisterType<IItemAdjustmentManager, ItemAdjustmentManager>();
            container.RegisterType<IItemAdjustmentRepository, ItemAdjustmentRepository>();

            //purchase order creation
            container.RegisterType<IPurchaseOrderCreationManager,PurchaseOrderCreationManager>();
            container.RegisterType<IPurchaseOrderCreationRepository, PurchaseOrderCreationRepository>();

            //purchase order request
            container.RegisterType<IPurchaseOrderRequestManager, PurchaseOrderRequestManager>();
            container.RegisterType<IPurchaseOrderRequestRepository, PurchaseOrderRequestRepository>();

            container.RegisterType<IPurchaseOrderRequestApprovalManager,PurchaseOrderRequestApprovalManager>();
            container.RegisterType<IPurchaseOrderRequestApprovalRepository,PurchaseOrderRequestApprovalRepository>();

            //Shared
            container.RegisterType<ISharedManager, SharedManager>();
            container.RegisterType<ISharedRepository, SharedRepository>();

            //InventoryCycleCount
            container.RegisterType<IInventoryCycleCountManager, InventoryCycleCountManager>();
            container.RegisterType<IInventoryCycleCountRepository, InventoryCycleCountRepository>();

            //FacilityManagement
            container.RegisterType<IFacilityManagementManager, FacilityManagementManager>();
            container.RegisterType<IFacilityManagementRepository, FacilityManagementRepository>();

            //FacilityManagement
            container.RegisterType<ITicketManager, TicketManager>();
            container.RegisterType<ITicketRepository, TicketRepository>();

            //Payment Terms
            container.RegisterType<IPaymentTermsManager, PaymentTermsManager>();
            container.RegisterType<IPaymentTermsRepository, PaymentTermsRepostiory>();

            //Supplier Category
            container.RegisterType<ISupplierCategoryManager,SupplierCategoryManager>();
            container.RegisterType<ISupplierCategoryRepository,SupplierCategoryRepository>();

            //Supplier Service
            container.RegisterType<ISupplierServicesManager,SupplierServiceManager>();
            container.RegisterType<ISupplierServiceRepository,SupplierServiceRepository>();

            //Supplier
            container.RegisterType<ISupplierManager, SupplierManager>();
            container.RegisterType<ISupplierRepository, SupplierRepository>();

            //Supplier Payment
            container.RegisterType<ISupplierPaymentManager, SupplierPaymentManager>();
            container.RegisterType<ISupplierPaymentRepository, SupplierPaymentRepository>();


            //delivery terms
            container.RegisterType<IDeliveryTermsManager,DeliveryTermsManager>();
            container.RegisterType<IDeliveryTermsRepository,DeliveryTermsRepository>();

            //Work Flow Configuration
            container.RegisterType<IWorkFlowConfigurationManager, WorkFlowConfigurationManager>();
            container.RegisterType<IWorkFlowConfigurationRepository, WorkFlowConfigurationRepository>();

            //fixed asset purchase order
            container.RegisterType<IFixedAssetPurchaseOrderCreationManager, FixedAssetPurchaseOrderManager>();
            container.RegisterType<IFixedAssetPurchaseOrderCreationRepository,FixedAssetPurchaseOrderCreationRepository>();

            //Taxes Configuration
            container.RegisterType<ITaxManager, TaxManager>();
            container.RegisterType<ITaxRepository, TaxRepository>();

            //contract purchase order
            container.RegisterType<IContractPurchaseOrderManager,ContractPurchaseOrderManager>();
            container.RegisterType<IContractPurchaseOrderRepository,ContractPurchaseOrderRepository>();

            //Invoice
            container.RegisterType<IInvoiceManager, InvoiceManager>();
            container.RegisterType<IInvoiceRepository, InvoiceRepository>();

            container.RegisterType<INotificationManager, NotificationManager>();
            container.RegisterType<INotificationsRepository, NotificationsRepository>();

            //Goods Received Notes
            container.RegisterType<IGoodsReceivedNotesManager,GoodsReceivedNotesManager>();
            container.RegisterType<IGoodsReceivedNotesRepository,GoodsReceivedNotesRepository>();

            //Goods Returned Notes
            container.RegisterType<IGoodsReturnedNotesManager, GoodsReturnedNotesManager>();
            container.RegisterType<IGoodsReturnedNotesRepository, GoodsReturnedNotesRepository>();


            //Quotation Request
            container.RegisterType<IQuotationRequestManager, QuotationRequestManager>();
            container.RegisterType<IQuotationRequestRepository, QuotationRequestRepository>();

            container.RegisterType<IWorkflowAuditTrailManager, WorkflowAuditTrailManager>();
            container.RegisterType<IWorkflowAuditTrailRepository, WorkflowAuditTrailRepository>();

            container.RegisterType<ICreditNoteManager, CreditNoteManager>();
            container.RegisterType<ICreditNoteRepository,CreditNoteRepository>();

            container.RegisterType<IPurchaseOrderApprovalManager,PurchaseOrderApprovalManager>();
            container.RegisterType<IPurchaseOrderApprovalRepository,PurchaseOrderApprovalRepository>();

            container.RegisterType<ICostCentreManager,CostCentreManager>();
            container.RegisterType<ICostCentreRepository,CostCentreRepository>();         

            container.RegisterType<IAssetCategoryManager,AssetCategoryManager>();
            container.RegisterType<IAssetCategoryRepository, AssetCategoryRepository>();

            container.RegisterType<IAssetTypeManager, AssetTypeManager>();
            container.RegisterType<IAssetTypeRepository,AssetTypeRepository>();

            container.RegisterType<IDepreciationManager,DepreciationManager>();
            container.RegisterType<IDepreciationRepository,DepreciationRepository>();

            container.RegisterType<IRequestTypeManager, RequestTypeManager>();
            container.RegisterType<IRequestTypeRepository, RequestTypeRepository>();

            //Customer
            container.RegisterType<ICustomerManager, CustomerManager>();
            container.RegisterType<ICustomerRepository, CustomerRepository>();

            //Sales Order
            container.RegisterType<ISalesOrderManager, SalesOrderManager>();
            container.RegisterType<ISalesOrderRepository, SalesOrderRepository>();

            container.RegisterType<IAssetMasterManager,AssetMasterManager>();
            container.RegisterType<IAssetMasterRepository,AssetMasterRepository>();

            container.RegisterType<IAssetDetailsManager,AssetDetailsManager>();
            container.RegisterType<IAssetDetailsRepository,AssetDetailsRepository>();

            container.RegisterType<IAssetRegisterManager,AssetRegisterManager>();
            container.RegisterType<IAssetRegisterRepository,AssetRegisterRepository>();

            container.RegisterType<IAssetTransferManager, AssetTransferManager>();
            container.RegisterType<IAssetTransferRepository,AssetTransferRepository>();

            container.RegisterType<ISalesInvoiceManager, SalesInvoiceManager>();
            container.RegisterType<ISalesInvoiceRepository, SalesInvoiceRepository>();

            container.RegisterType<IAssetDisposalManager,AssetDisposalManager>();
            container.RegisterType<IAssetDisposalRepository,AssetDisposalRepository>();

            container.RegisterType<IExpenseMasterManager,ExpenseMasterManager>();
            container.RegisterType<IExpenseMasterRepository,ExpenseMasterRepository>();

            container.RegisterType<IExpensesPurchaseOrderManager,ExpensesPurchaseOrderManager>();
            container.RegisterType<IExpensesPurchaseOrderCreationRepository,ExpensesPurchaseOrderCreationRepository>();

            //Departmnt


            //User Setting
            container.RegisterType<IUserManagementManager, UserManagementManager>();
            container.RegisterType<IUserManagementRepository, UserManagementRepository>();

            //Engineer Management
            container.RegisterType<IEngineerManagementManager, EngineerManagementManager>();
            container.RegisterType<IEngineerManagementRepository, EngineerManagementRepository>();

            //Customer Payment
            container.RegisterType<ICustomerPaymentManager, CustomerPaymentManager>();
            container.RegisterType<ICustomerPaymentRepository, CustomerPaymentRepository>();

            //Service Type
            container.RegisterType<IServiceTypeManager, ServiceTypeManager>();
            container.RegisterType<IServiceTypeRepository, ServiceTypeRepository>();

            container.RegisterType<IAssetDepreciationManager, AssetDepreciationManager>();
            container.RegisterType<IAssetDepreciationRepository,AssetDepreciationRepository>();

            //Account Codes
            container.RegisterType<IAccountCodeManager, AccountCodeManager>();
            container.RegisterType<IAccountCodeRepository, AccountCodeRepository>();

            //Connection 
            container.RegisterType<IConnectionManager, ConnectionManager>();
            container.RegisterType<IConnectionRepository, ConnectionRepository>();

            //Leads
            container.RegisterType<ILeadsManager, LeadsManager>();
            container.RegisterType<ILeadsRepository, LeadsRepository>();

            //Audit Logs
            container.RegisterType<IAuditLogManager, AuditLogManager>();
            container.RegisterType<IAuditLogRepository, AuditLogRepository>();

            //Company
            container.RegisterType<ICompanyManager, CompanyManager>();
            container.RegisterType<ICompanyRepository, CompanyRepository>();

            //Project Master Contract
            container.RegisterType<IProjectMasterContractManager,ProjectMasterContractManager>();
            container.RegisterType<IProjectMasterContractRepository,ProjectMasterContractRepository>();

            //Currency
            container.RegisterType<ICurrencyManager, CurrencyManager>();
            container.RegisterType<ICurrencyRepository, CurrencyRepository>();

            //Account Types
            container.RegisterType<IAccountTypesManager, AccountTypesManager>();
            container.RegisterType<IAccountTypesRepository, AccountTypesRepository>();

            //Department
            container.RegisterType<IDepartmentManager, DepartmentManager>();
            container.RegisterType<IDepartmentRepository, DepartmentRepository>();
            
            //Tax Group
            container.RegisterType<ITaxGroupManager, TaxGroupManager>();
            container.RegisterType<ITaxGroupRepository, TaxGroupRepository>();

            //Account Sub Code Category
            container.RegisterType<IAccountSubCategoryManager, AccountSubCategoryManager>();
            container.RegisterType<IAccountSubCategoryRepository, AccountSubCategoryRepository>();

            //Project Master Contract
            container.RegisterType<IProjectPurchaseOrderManager, ProjectPurchaseOrderManager>();
            container.RegisterType<IProjectPurchaseOrderRepository, ProjectPurchaseOrderRepository>();

            //Project Contract Variation Order
            container.RegisterType<IProjectContractVariationOrderManager, ProjectContractVariationOrderManager>();
            container.RegisterType<IProjectContractVariationOrderRepository, ProjectContractVariationOrderRepository>();

            //Role Management
            container.RegisterType<IRoleManagementManager, RoleManagementManager>();
            container.RegisterType<IRoleManagementRepository, RoleManagementRepository>();

            //WorkFlow Re-Assignment
            container.RegisterType<IWorkFlowReAssignmentManager, WorkFlowReAssignmentManager>();
            container.RegisterType<IWorkFlowReAssignmentRepository, WorkFlowReAssignmentRepository>();

            //Payment Update
            container.RegisterType<IPaymentManager, PaymentManager>();
            container.RegisterType<IPaymentRepository, PaymentRepository>();

            //Expense Type
            container.RegisterType<IExpenseTypeManager, ExpenseTypeManager>();
            container.RegisterType<IExpenseTypeRepository, ExpenseTypeRepository>();

            container.RegisterType<IPaymentManager, PaymentManager>();
            container.RegisterType<IPaymentRepository, PaymentRepository>();

            //Project Payment Contract
            container.RegisterType<IProjectPaymentContractManager, ProjectPaymentContractManager>();
            container.RegisterType<IProjectPaymentContractRepository, ProjectPaymentContractRepository>();

            //Generic
            container.RegisterType<IGenericManager, GenericManager>();
            container.RegisterType<IGenericRepository, GenericRepository>();

            //Scheduler No 
            container.RegisterType<ISchedulerNoManager, SchedulerNoManager>();
            container.RegisterType<ISchedulerNoRepository, SchedulerNoRepository>();

            //Sales Adhoc
            container.RegisterType<IAdhocMasterManager, AdhocMasterManager>();
            container.RegisterType<IAdhocMasterRepository, AdhocMasterRepository>();

            //Sales Quotation
            container.RegisterType<ISalesQuotationManager, SalesQuotationManager>();
            container.RegisterType<ISalesQuotationRepository, SalesQuotationRepository>();

            //Reports
            container.RegisterType<IReportsManager, ReportsManager>();
            container.RegisterType<IReportsRepository, ReportsRepository>();

            //Contacts
            container.RegisterType<IContactsManager, ContactsManager>();
            container.RegisterType<IContactsRepository, ContactsRepository>();

            //Accounts
            container.RegisterType<IAccountsManager, AccountsManager>();
            container.RegisterType<IAccountsRepository, AccountsRepository>();

            //Opportuniry
            container.RegisterType<IOpportunityManager, OpportunityManager>();
            container.RegisterType<IOpportunityRepository, OpportunityRepository>();

            //Products
            container.RegisterType<IProductsManager, ProductsManager>();
            container.RegisterType<IProductsRepository, ProductsRepository>();

            //List
            container.RegisterType<IMarketingListManager, MarketingListManager>();
            container.RegisterType<IMarketingListRepository, MarketingListRepository>();

            //AppViews
            container.RegisterType<IAppViewsManager, AppViewsManager>();
            container.RegisterType<IAppViewsRepository, AppViewsRepository>();

            //Activity Activities
            container.RegisterType<IActivityManager, ActivityManager>();
            container.RegisterType<IActivityRepository, ActivityRepository>();

            //Deals
            container.RegisterType<IDealsManager, DealsManager>();
            container.RegisterType<IDealsRepository, DealsRepository>();

            //EntityImport
            container.RegisterType<IEntityImportManager, EntityImportManager>();
            container.RegisterType<IEntityImportRepository, EntityImportRepository>();

            //resoving of container
            config.DependencyResolver = new UnityResolver(container);
        }
    }
}