import { UserProfile, GridDisplayInput, Companies, UserRoles, User } from "../../shared/models/shared.model";

export class UserManagement
{
    UserID:number;
    UserName:string;
    UserGUID:string;
    FirstName:string;
    LastName:string;
    CreatedDate:Date;
    LastUpdatedDate:Date;
    userAccountControl:string;
    Emailid:string;
    distinguishedName:string;
    logonCount?: number;
    primaryGroupID?: number;
    IsActive?:boolean;
    Thumbnail:ByteString;
    LocationId?:number;
    CompanyId?:number;
    ProfileImage:ByteString;
    Title:string;
    Password:string;
    isLocked?:boolean;
    Address1:string;
    Address2:string;
    Address3:string;
    CountryId?:number;    
    ZipCode:string;
    EmailSignature:string;
    PasswordAttemptCount?:number;
    AlterApprovarUserId?:number;
    ApprovalStartDate?:Date;
    ApprovalEndDate?:Date;
    Designation:string;
    PhoneNumber:string;
    RolesDetails:Array<RolesDetails>;
    RolesDetailsToDelete:Array<number>;
    CountryName:string;
    User:User;
    ManagerId:number;
    ManagerName:string;
    CreatedBy:number;
    isADUser:boolean;
    NewPassword:string;
    IsWorkFlowAssigned: boolean;
}

// export class UserManagementList
// {
//     UserId:number;
//     UserName :string;
//     FirstName: string;
//     LastName: string;
//     UserRoles:number ;
//     UserRolesName :string;
// }

export class UserManagementList
{
    UserID:number;
    FirstName :string;
    EmailId :string;
    PhoneNumber :string;
    Designation :string;
}

export class UserManagementDisplayResult
{
    UserManagementList:Array<UserManagementList>;
    TotalRecords :number;
}

export class UserManagementFilterDisplayInput extends GridDisplayInput
{
    UserNameFilter:string;
    RolesNameFilter :string;
}

export class RolesDetails
{
    UserRoleID:number;
    UserID:number;
    Company:Companies;
    Role:UserRoles;
    constructor()
    {
        this.UserRoleID=0;
        this.UserID=0;
        this.Company={
            CompanyId:0,
            CompanyName:"",
            SupplierVerifier:0,
            IsSelected:0,
            RoleID:0
        }
        this.Role={
            RoleID:0,
            RoleName:"",
            IsSelected: false
        }
    }
}