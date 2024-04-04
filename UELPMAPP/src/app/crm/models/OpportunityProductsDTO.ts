export class  OpportunityProductsDTO {
    opportunityProductId: number;
    opportunityId: number;
    opportunityProductType: number;
    writePName: string;
    writePAlias: string;
    writePDesc: string;
    productId: number;
    unitsId: number;
    pricingType: number;
    pricePerUnit: number;
    volDiscount: number;
    qty: number;
    amount: number;
    manualDiscount: number;
    tax: number;
    extendedAmount: number;
    requestDate: string;
    price: number;
    discPer: number;
    priceListId: number;
    hasInspection: boolean;
    hasCostSheet: boolean;
    costSheetValue: number;
    createdBy: number;
    createdDate: string;
    updatedBy: number;
    updatedDate: string;
    deletedBy: number;
    deletedDate: string;
}
// POPDistributionSummaryItems: Array<POPDistributionSummary>;

export class OpportunityProductsInput {
    opportunityId: number;
    createdBy: number;
    opportunityProductsDTOs:Array<OpportunityProductsDTO>=[];

    // constructor()
    // {

    // }
}

export interface OpportunityProductsResult {
    OpportunityProductsLists: OpportunityProductsList[];
    TotalRecords: number;
    Status: string;
    Message: string;
  }

export interface OpportunityProductsList {
    OpportunityProductId: number;
    OpportunityId: number;
    OpportunityProductType: number;
    ProductId: number;
    ProductCode: string;
    ProductSerialNo: string;
    ProductName: string;
    ProductFamilyId: number;
    ProductDescription: string;
    ProductIsActive: boolean;
    CategoryID: number;
    CreatedBy: number;
    CreatedDate: string;
    UnitsId: number;
    PricingType: number;
    PricePerUnit: number;
    VolDiscount: number;
    Qty: number;
    Amount: number;
    ManualDiscount: number;
    Tax: number;
    ExtendedAmount: number;
    RequestDate: string;
    Price: number;
    DiscPer: number;
    PriceListId: number;
  }

