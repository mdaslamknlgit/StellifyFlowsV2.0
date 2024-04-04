
DELETE FROM  [dbo].[AssetDepreciation] 
DBCC CHECKIDENT ('AssetDepreciation', RESEED, 0)

DELETE FROM  [dbo].[AssetDetails] 
DBCC CHECKIDENT ('AssetDetails', RESEED, 0)

DELETE FROM  [dbo].[Depreciation] 
DBCC CHECKIDENT ('Depreciation', RESEED, 0)

DELETE FROM  [dbo].[AssetDisposal] 
DBCC CHECKIDENT ('AssetDisposal', RESEED, 0)

DELETE FROM  [dbo].[AssetTranfer] 
DBCC CHECKIDENT ('AssetTranfer', RESEED, 0)

--Supplier

DELETE FROM  [dbo].[SupplierApproval] 
DBCC CHECKIDENT ('SupplierApproval', RESEED, 0)
 --null
DELETE FROM  [dbo].[SupplierCompanyDetails] 
DBCC CHECKIDENT ('SupplierCompanyDetails', RESEED, 0)
 --null
DELETE FROM  [dbo].[SupplierContactPerson] 
DBCC CHECKIDENT ('SupplierContactPerson', RESEED, 0)
 --null
DELETE FROM  [dbo].[SupplierSelectedService] 
DBCC CHECKIDENT ('[SupplierSelectedService]', RESEED, 0);
 --null
DELETE FROM  [dbo].[SupplierSubCode] 
DBCC CHECKIDENT ('SupplierSubCode', RESEED, 0)


DECLARE @max_id INT, @var int
DELETE FROM  [dbo].[SupplierTaxes] 

SELECT @max_id = MAX(SupplierTaxes)+1 FROM SupplierTaxes; 
IF @max_id IS NULL 
BEGIN
SELECT @var = 0 
END
ELSE
BEGIN 
SELECT @var = @max_id
END
DBCC CHECKIDENT ('[SupplierTaxes]', RESEED, @var);



DELETE FROM  [dbo].[EngineerDetails] 

SELECT @max_id = MAX(EngineerId)+1 FROM EngineerDetails; 
IF @max_id IS NULL 
BEGIN
SELECT @var = 0
END
ELSE
BEGIN 
SELECT @var = @max_id
END
DBCC CHECKIDENT ('[EngineerDetails]', RESEED, @var);



DELETE FROM  [dbo].[WorkFlowApprovers] 

SELECT @max_id = MAX(WorkFlowApproverId)+1 FROM WorkFlowApprovers; 
IF @max_id IS NULL 
BEGIN
SELECT @var = 0 
END
ELSE
BEGIN 
SELECT @var = @max_id
END
 DBCC CHECKIDENT ('[WorkFlowApprovers]', RESEED, @var);

 DELETE FROM  [dbo].[CreditNote] 
 DBCC CHECKIDENT ('[CreditNote]', RESEED, 0);

 DELETE FROM  [dbo].[Facility] 
 DBCC CHECKIDENT ('[Facility]', RESEED, 0);

 DELETE FROM  [dbo].[Facility] 
 DBCC CHECKIDENT ('[Facility]', RESEED, 0);

 DELETE FROM  [dbo].[GoodsReceivedNote] 
 DBCC CHECKIDENT ('[GoodsReceivedNote]', RESEED, 0);

 DELETE FROM  [dbo].[CustomerPayment] 
 DBCC CHECKIDENT ('[CustomerPayment]', RESEED, 0);

  DELETE FROM  [dbo].[InvoiceItems] 
 DBCC CHECKIDENT ('[InvoiceItems]', RESEED, 0);

 DELETE FROM  [dbo].[Invoice] 
 DBCC CHECKIDENT ('[Invoice]', RESEED, 0);

  DELETE FROM  [dbo].[LocationItems] 
 DBCC CHECKIDENT ('[LocationItems]', RESEED, 0);

   DELETE FROM  [dbo].[POPApportionment] 
 DBCC CHECKIDENT ('[POPApportionment]', RESEED, 0);

   DELETE FROM  [dbo].[POPCostCategory] 
 DBCC CHECKIDENT ('[POPCostCategory]', RESEED, 0);

    DELETE FROM  [dbo].[QuotationRequest] 
 DBCC CHECKIDENT ('[QuotationRequest]', RESEED, 0);

    DELETE FROM  [dbo].[PurchaseOrderRequest] 
 DBCC CHECKIDENT ('[PurchaseOrderRequest]', RESEED, 0);

    DELETE FROM  [dbo].[SalesInvoice] 
 DBCC CHECKIDENT ('[SalesInvoice]', RESEED, 0);

    DELETE FROM  [dbo].[SalesOrder] 
 DBCC CHECKIDENT ('[SalesOrder]', RESEED, 0);

    DELETE FROM  [dbo].[SupplierPayment] 
 DBCC CHECKIDENT ('[SupplierPayment]', RESEED, 0);

     DELETE FROM  [dbo].[Supplier] 
 DBCC CHECKIDENT ('[Supplier]', RESEED, 0);

 DELETE FROM  [dbo].[AccountCode] 
 DBCC CHECKIDENT ('[AccountCode]', RESEED, 0);

  DELETE FROM  [dbo].[Customer] 
 DBCC CHECKIDENT ('[Customer]', RESEED, 0);

   DELETE FROM  [dbo].[Asset] 
 DBCC CHECKIDENT ('[Asset]', RESEED, 0);

    DELETE FROM  [dbo].[ItemMaster] 
 DBCC CHECKIDENT ('[ItemMaster]', RESEED, 0);

 
 -- DELETE FROM  [dbo].[MeasurementUnit] 
 --DBCC CHECKIDENT ('[MeasurementUnit]', RESEED, 0);
 --null
   DELETE FROM  [dbo].[ProjectPurchaseOrder] 
 SELECT @max_id = MAX(ProjectPurchaseOrderId)+1 FROM ProjectPurchaseOrder; 
IF @max_id IS NULL 
BEGIN
SELECT @var = 0 
END
ELSE
BEGIN 
SELECT @var = @max_id
END
DBCC CHECKIDENT ('[ProjectPurchaseOrder]', RESEED, @var);
    DELETE FROM  [dbo].[ProjectMasterContract] 
 DBCC CHECKIDENT ('[ProjectMasterContract]', RESEED, 0);


  DELETE FROM  [dbo].[ContractPurchaseOrder] 
 DBCC CHECKIDENT ('[ContractPurchaseOrder]', RESEED, 0);

   DELETE FROM  [dbo].[ExpensesPurchaseOrder] 
 DBCC CHECKIDENT ('[ExpensesPurchaseOrder]', RESEED, 0);

  DELETE FROM  [dbo].[FixedAssetPurchaseOrder] 
 DBCC CHECKIDENT ('[FixedAssetPurchaseOrder]', RESEED, 0);

   DELETE FROM  [dbo].[PurchaseOrder] 
 DBCC CHECKIDENT ('[PurchaseOrder]', RESEED, 0);
 --null
    DELETE FROM  [dbo].[InventoryAdjustmentMaster] 
 DBCC CHECKIDENT ('[InventoryAdjustmentMaster]', RESEED, 0);

  
    DELETE FROM  [dbo].[InventoryRequestMaster] 
 DBCC CHECKIDENT ('[InventoryRequestMaster]', RESEED, 0);

     DELETE FROM  [dbo].[WorkFlowProcessLevel] 
 DBCC CHECKIDENT ('[WorkFlowProcessLevel]', RESEED, 0);

      DELETE FROM  [dbo].[WorkFlowConfiguration] 
 DBCC CHECKIDENT ('[WorkFlowConfiguration]', RESEED, 0);

 --      DELETE FROM  [dbo].[Location] 
 --DBCC CHECKIDENT ('[Location]', RESEED, 0);

         DELETE FROM  [dbo].[AssetCategory] 
 DBCC CHECKIDENT ('[AssetCategory]', RESEED, 0);

        DELETE FROM  [dbo].[AssetType] 
 DBCC CHECKIDENT ('[AssetType]', RESEED, 0);

         DELETE FROM  [dbo].[AssetCategory] 
 DBCC CHECKIDENT ('[AssetCategory]', RESEED, 0);

          DELETE FROM  [dbo].[CostCenter] 
 DBCC CHECKIDENT ('[CostCenter]', RESEED, 0);
 
          DELETE FROM  [dbo].[DeliveryTerms] 
 DBCC CHECKIDENT ('[DeliveryTerms]', RESEED, 0);

           DELETE FROM  [dbo].[ItemType] 
 DBCC CHECKIDENT ('[ItemType]', RESEED, 0);

            DELETE FROM  [dbo].[PaymentTerms] 
 DBCC CHECKIDENT ('[PaymentTerms]', RESEED, 0);
 
            DELETE FROM  [dbo].[ServiceCategories] 
 DBCC CHECKIDENT ('[ServiceCategories]', RESEED, 0);

  
            DELETE FROM  [dbo].[SupplierServices] 
 DBCC CHECKIDENT ('[SupplierServices]', RESEED, 0);
   
            DELETE FROM  [dbo].[Taxes] 
 DBCC CHECKIDENT ('[Taxes]', RESEED, 0);

   
            DELETE FROM  [dbo].[TaxGroup] 
 DBCC CHECKIDENT ('[TaxGroup]', RESEED, 0);













 













