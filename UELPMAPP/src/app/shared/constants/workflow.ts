export const DOCUMENTS = [
    { 'Id': 1, 'Name': 'Purchase Order' },
    { 'Id': 2, 'Name': 'Delivery Order' },
    { 'Id': 3, 'Name': 'Invoice' },
    { 'Id': 4, 'Name': 'Payment' },
    { 'Id': 5, 'Name': 'Sales Order' },
];

export const WORKLEVELDIRECTION = [
    { 'Id': 1, 'value': 'Left' },
    { 'Id': 2, 'value': 'Right' }
];

export const OPERATORS = [
    { 'Label': 'Less Than', 'Value': '<' },
    { 'Label': 'Greater Than', 'Value': '>' },
    { 'Label': 'Less Than or EqualTo', 'Value': '<=' },
    { 'Label': 'Greator Than or EqualTo', 'Value': '>=' },
    { 'Label': 'Not EqualTo', 'Value': '!=' },
    { 'Label': 'Equal to', 'Value': '==' },
];

export const FIELDNAMES = [
    { 'Id': 1, 'Name': 'TotalAmount' },
    // { 'Id': 2, 'Name': 'ItemCategory' },
    // { 'Id': 3, 'Name': 'Unitprice' },
    { 'Id': 4, 'Name': 'ItemQty' }   
];
export const FIXEDPOFIELDNAMES = [
    { 'Id': 1, 'Name': 'TotalAmount' },
    // { 'Id': 2, 'Name': 'AssetType' },
    // { 'Id': 3, 'Name': 'Unitprice' },
    { 'Id': 4, 'Name': 'AssetQty' }   
];
export const CONTRACTPOFIELDNAMES = [
    { 'Id': 1, 'Name': 'TotalAmount' }  
];

export const SUPPLIERFIELDNAMES = [
    { 'Id': 1, 'Name': 'CreditLimit' }  
];

export const PROJECTPOFIELDNAMES = [
    { 'Id': 1, 'Name': 'ContractSum' }  
];