import { UserProfile, Location, Currency } from "../../shared/models/shared.model";
export class Company {
    CompanyId: number;
    OrganizationId: number;
    OrganizationName: string;
    CompanyCode: string;
    CompanyName: string;
    CompanyShortName: string;
    CompanyDescription: string;
    CompanyRegistrationNumber: string;
    Address1: string;
    Address2: string;
    Address3: string;
    Address4: string;
    City: string;
    Country: string;
    CountryName: string;
    ZipCode: string;
    SupplierVerifier: string;
    SupplierVerifierName: string;
    InvoiceLimit: number;
    GST: string;
    GSTRegistrationNumber: string;
    Email: string;
    Website: string;
    MCSTOffice: string;
    Telephone: string;
    Mobilenumber: string;
    Fax: string;
    Isdeleted: boolean;
    CreatedBy: number;
    UpdatedBy: number;
    UserNames: string;
    DepartmentNames: string;
    SupplierCompanyId: number;
    GLCodeUsersList: Array<UserProfile>;
    DepartmentList: Array<Location>;
    ContactPersons: Array<CompanyContactPerson>;
    Currency: Currency;
}

export class CompanyGrid {
    Companies: Company[];
    TotalRecords: number;
}
export class CompanyContactPerson {
    ContactPersonId: number;
    Name: string;
    ContactNumber: string;
    EmailId: string;
    IsModified: boolean;
    Saluation: string;
    Surname: string;
    Department: string;

}
export class CompanyFilterModel {
    public CompanyCode: string;
    public CompanyName: string;
    public Country: string;
    public FromDate: Date;
    public ToDate: Date;
}