--Asset
TRUNCATE TABLE [dbo].[AssetTranferAuditTrail]  -- done
TRUNCATE TABLE [dbo].[AssetPreferredSupplier] -- done

--Asset Depreciation
TRUNCATE TABLE [dbo].[AssetDepreciationDetails] -- done

--Asset DisposalItems
TRUNCATE TABLE [dbo].[AssetDisposalItems] -- done

--Asset Transfer
TRUNCATE TABLE  [dbo].[AssetTransferDetails] -- done

--Attachments
TRUNCATE TABLE  [dbo].[Attachments] -- done

--AuditLog
TRUNCATE TABLE  [dbo].[AuditLog]  -- done

--Company
 TRUNCATE TABLE [dbo].[CompanyContactPerson]
 TRUNCATE TABLE [dbo].[CompanyDepartment]

--ContractPurchaseOrder
TRUNCATE TABLE [dbo].[ContractPurchaseOrderItems]  -- done

--CreditNote
TRUNCATE TABLE [dbo].[CreditNoteDetails] -- done

--CreditNote
TRUNCATE TABLE [dbo].[CustomerInvoicePayment] -- done

--EngineerDetails
TRUNCATE TABLE [dbo].[EngineerFacilities]  -- done
TRUNCATE TABLE [dbo].[EngineerJobCategory] -- done

--ExpensesMaster
TRUNCATE TABLE  [dbo].[ExpensesMaster] -- done

--Expenses Purchase Order
TRUNCATE TABLE  [dbo].[ExpensesPOItems] -- done
--Facility
TRUNCATE TABLE [dbo].[FacilityAuditTrail] -- done

--Fixed Purchase Order
TRUNCATE TABLE  [dbo].[FixedAssetPOItems]  -- done

--GLCode Users Notification
--TRUNCATE TABLE  [dbo].[GLCodeUsersNotification]

--Goods Received Notes
TRUNCATE TABLE  [dbo].[GRNItems] -- done

--Goods Return Notes
TRUNCATE TABLE  [dbo].[GoodsReturnNoteItems]   -- done
TRUNCATE TABLE  [dbo].[GoodsReturnNotes]   -- done
 
 --Goods Return Notes
TRUNCATE TABLE  [dbo].[InventoryAdjustmentDetail]  -- done

 --InventoryAdjustmentMaster
TRUNCATE TABLE  [dbo].[InventoryCycleCount] -- done
TRUNCATE TABLE  [dbo].[InventoryDisposal] -- done

 --Inventory Request Master
TRUNCATE TABLE [dbo].[InventoryRequestDetail] -- done

 --Invoice
TRUNCATE TABLE [dbo].[InvoiceGRN] -- done
TRUNCATE TABLE [dbo].[InvoicePayment]  -- done

 --Item Adjustment
TRUNCATE TABLE [dbo].[ItemAdjustments] -- done

 --Location Transfer
TRUNCATE TABLE  [dbo].[LocationTransferDetail] -- done
TRUNCATE TABLE  [dbo].[LocationTransfer] -- done

 --Measurement Unit
TRUNCATE TABLE [dbo].[Membership]   -- done

 --Notifications
TRUNCATE TABLE  [dbo].[Notifications] -- done

 --POP
TRUNCATE TABLE [dbo].[POPApportionmentDetails]   -- done
TRUNCATE TABLE [dbo].[POPDisturbutionSummary]   -- done


--Project Purchase Order
TRUNCATE TABLE [dbo].[ProjectContractVariationOrderItems]   -- done
TRUNCATE TABLE [dbo].[ProjectContractVariationOrder]  -- done
TRUNCATE TABLE [dbo].[ProjectPurchaseOrderItems]   -- done
TRUNCATE TABLE [dbo].[ProjectMasterContractItems]  -- done
TRUNCATE TABLE [dbo].[ProjectMasterContractDepartments]   -- done

--Quotations
TRUNCATE TABLE [dbo].[POQuotations]   -- done
TRUNCATE TABLE [dbo].[QuotationAttachments]  -- done
TRUNCATE TABLE [dbo].[QuotationRequestSupplier]  -- done
--ProcessCode
TRUNCATE TABLE [dbo].[ProcessCode]  -- done

--ProjectTask
--TRUNCATE TABLE [dbo].[ProjectTask] 

--Purchase Order
TRUNCATE TABLE [dbo].[PurchaseOrderItems]  -- done

--Purchase Order Request
TRUNCATE TABLE [dbo].[PurchaseOrderRequestItems]  -- done

--Sales Invoice 
TRUNCATE TABLE [dbo].[SalesInvoiceItems] -- done

--Sales Order 
TRUNCATE TABLE  [dbo].[SalesOrderItems] -- done

-- SPO Quotation
TRUNCATE TABLE   [dbo].[SPOQuotationAttachments] -- done
TRUNCATE TABLE  [dbo].[SPOQuotation]  -- done

-- SPO Quotation
TRUNCATE TABLE  [dbo].[StockDetails]  -- done
TRUNCATE TABLE  [dbo].[SubContractorQuotation] -- done

-- SPO Quotation
TRUNCATE TABLE  [dbo].[TicketAuditTrail]   -- done
TRUNCATE TABLE  [dbo].[TicketEngineers]   -- done
TRUNCATE TABLE  [dbo].[TicketInventoryItem]   -- done
TRUNCATE TABLE  [dbo].[TicketSubContractor]    -- done
TRUNCATE TABLE  [dbo].[Ticket]   -- done

-- WorkFlow Related
TRUNCATE TABLE [dbo].[WorkFlow]  -- done
TRUNCATE TABLE [dbo].[WorkFlowAuditTrail]   -- done
TRUNCATE TABLE [dbo].[WorkFlowResponse]   -- done


-- UI Based Entries
TRUNCATE TABLE [dbo].[WorkFlow]  -- done
TRUNCATE TABLE [dbo].[WorkFlowAuditTrail]   -- done
TRUNCATE TABLE [dbo].[WorkFlowResponse]   -- done

-- WorkFlow
TRUNCATE TABLE  [dbo].[WorkFlowLevel]  -- done

TRUNCATE TABLE  [dbo].[SupplierCategory]  -- done

--Account Code Category
TRUNCATE TABLE  [dbo].[AccountCodeCategory]   --done

--COA Account Type
TRUNCATE TABLE [dbo].[COAAccountType]  --done

--Cost of Service
TRUNCATE TABLE  [dbo].[CostofService] --done

-- Item Category
TRUNCATE TABLE [dbo].[ItemCategory] --done

---JVA Code
TRUNCATE TABLE dbo.JVACode  --done

--Location/Department
--TRUNCATE TABLE  [dbo].[Location] --  

-- truncate table [dbo].[SPOQuotationAttachments]   -- done

-- truncate table [dbo].[SPOQuotation]   -- done

--TRUNCATE TABLE  [dbo].[WorkFlowProcessLevel]
--TRUNCATE TABLE  [dbo].[WorkFlowConfiguration]


-------dependencies------


--Others
--TRUNCATE TABLE [dbo].[AssetDetails]

--Depreciation
--TRUNCATE TABLE  [dbo].[AssetDepreciation] 
--TRUNCATE TABLE  [dbo].[Depreciation]
--TRUNCATE TABLE [dbo].[AssetDisposal]
--TRUNCATE TABLE  [dbo].[AssetTranfer]


--Supplier
--TRUNCATE TABLE [dbo].[SupplierApproval] 
--TRUNCATE TABLE [dbo].[SupplierCompanyDetails] -- done
--TRUNCATE TABLE [dbo].[SupplierContactPerson] -- done
--TRUNCATE TABLE [dbo].[SupplierSelectedService] -- done
--TRUNCATE TABLE [dbo].[SupplierSubCode] -- done
--TRUNCATE TABLE [dbo].[SupplierTaxes]  -- done
 --TRUNCATE TABLE [dbo].[Supplier] 

--Account Code
--TRUNCATE TABLE [dbo].[AccountCode]
--TRUNCATE TABLE [dbo].[Facility] -- done

--TRUNCATE TABLE [dbo].[CreditNote] -- done
--TRUNCATE TABLE  [dbo].[GoodsReceivedNote]  -- done
--TRUNCATE TABLE [dbo].[CustomerPayment]


 --Measurement Unit
--TRUNCATE TABLE [dbo].[MeasurementUnit]

--TRUNCATE TABLE [dbo].[POPApportionment]
--TRUNCATE TABLE [dbo].[POPCostCategory]


--TRUNCATE TABLE [dbo].[ContractPurchaseOrder]
--TRUNCATE TABLE  [dbo].[ExpensesPurchaseOrder]
--TRUNCATE TABLE  [dbo].[FixedAssetPurchaseOrder]
--TRUNCATE TABLE [dbo].[PurchaseOrder]
--TRUNCATE TABLE  [dbo].[InventoryAdjustmentMaster]
--TRUNCATE TABLE  [dbo].[InventoryRequestMaster]

--TRUNCATE TABLE [dbo].[InvoiceItems] 
--TRUNCATE TABLE [dbo].[Invoice]

--TRUNCATE TABLE  [dbo].[LocationItems]

--TRUNCATE TABLE [dbo].[ProjectPurchaseOrder] 
--TRUNCATE TABLE [dbo].[ProjectMasterContract]

--TRUNCATE TABLE [dbo].[QuotationRequest]
--TRUNCATE TABLE [dbo].[PurchaseOrderRequest] 
--TRUNCATE TABLE  [dbo].[SalesInvoice]
--TRUNCATE TABLE  [dbo].[SalesOrder]

--TRUNCATE TABLE [dbo].[WorkFlowApprovers] 


--Engineers
--TRUNCATE TABLE [dbo].[EngineerDetails]

--CreditNote
--TRUNCATE TABLE [dbo].[Customer]

----Asset
--TRUNCATE TABLE [dbo].[Asset]
----Item Master
--TRUNCATE TABLE [dbo].[ItemMaster]
 









