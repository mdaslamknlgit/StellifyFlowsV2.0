USE [UEL_DEV_1]
GO
/****** Object:  StoredProcedure [dbo].[CompanyMaster_CRUD]    Script Date: 08-07-2019 17:59:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[CompanyMaster_CRUD]
       @Action VARCHAR(50)
	  ,@Skip INT = NULL
	  ,@Take INT = NULL
	  ,@Search NVARCHAR(30) = NULL

	  ,@CompanyId INT = NULL
	  ,@OrganizationId INT = NULL
	  ,@CompanyCode NVARCHAR(10) = NULL
	  ,@CompanyName NVARCHAR(100) = NULL
	  ,@CompanyDescription NVARCHAR(MAX) = NULL
	  ,@Address1 NVARCHAR(MAX) = NULL
	  ,@Address2 NVARCHAR(MAX) = NULL
	  ,@Address3 NVARCHAR(MAX) = NULL
	  ,@Address4 NVARCHAR(MAX) = NULL
	  ,@City NVARCHAR(10) = NULL
	  ,@Country NVARCHAR(10) = NULL
	  ,@ZipCode NVARCHAR(14) = NULL
	  ,@SupplierVerifier NVARCHAR(56) = NULL
	  ,@InvoiceLimit DECIMAL(18,4) = NULL
	  ,@Email NVARCHAR(50) = NULL
	  ,@Telephone NVARCHAR(15) = NULL
	  ,@Mobilenumber NVARCHAR(15) = NULL
	  ,@Fax NVARCHAR(15) = NULL
	  ,@Isdeleted BIT = 0
	  ,@CreatedBy INT = NULL
	  ,@UpdatedBy INT = NULL
	  ,@CreatedDate DATETIME = NULL
	  ,@UpdatedDate DATETIME = NULL 
	  ,@LocationPrefix NVARCHAR(5) = NULL
	  ,@CompanyShortName NVARCHAR(25) = NULL
	  ,@CompanyRegistrationNumber NVARCHAR(100) = NULL
	  ,@GST NVARCHAR(50) = NULL
	  ,@GSTRegistrationNumber NVARCHAR(50) = NULL
	  ,@Website NVARCHAR(100) = NULL
	  ,@MCSTOffice NVARCHAR(50) = NULL
	  ,@DepartmentId INT = NULL
	  ,@DepartmentName NVARCHAR(50) = NULL
	  ,@UserId INT = NULL
	  ,@FromDate datetime = null
	  ,@Todate datetime = null



	  
AS
BEGIN
      SET NOCOUNT ON; 
      --SELECT
    IF @Action = 'SELECT' AND (@Search IS NULL or @Search = '')
      BEGIN
			
		SELECT c.CompanyId, c.OrganizationId, c.CompanyCode, c.CompanyName, c.CompanyDescription, c.Address1, c.Address2, c.Address3, c.Address4, c.City,		          c.Country, c.ZipCode,c.SupplierVerifier,c.InvoiceLimit, c.Email, c.Telephone, c.Mobilenumber, c.

Fax, c.Isdeleted, c.CreatedBy, c.CreatedDate, c.UpdatedBy, c.UpdatedDate, c.LocationPrefix, c.CompanyShortName, c.CompanyRegistrationNumber, c.GST, c.GSTRegistrationNumber, c.Website, c.MCSTOffice, o.OrganizationName, co.Name as [CountryNam
e],  c.SupplierVerifier 
        FROM   Company AS c INNER JOIN 
               Organization As o ON c.OrganizationId=o.OrganizationId INNER JOIN
			   Countries AS co ON co.Id = c.Country
        WHERE  (c.Isdeleted=0) ORDER BY c.UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;


		SELECT COUNT(*)  FROM      Company AS c INNER JOIN									
									Organization AS o ON c.OrganizationId = o.OrganizationId 
		WHERE   c.Isdeleted = 0;

	END

	 IF @Action = 'SELECT' AND @Search IS NOT NULL
      BEGIN
			
		SELECT c.CompanyId, c.OrganizationId, c.CompanyCode, c.CompanyName, c.CompanyDescription, c.Address1, c.Address2, c.Address3, c.Address4, c.City,		          c.Country, c.ZipCode,c.SupplierVerifier,c.InvoiceLimit, c.Email, c.Telephone, c.Mobilenumber, c.

Fax, c.Isdeleted, c.CreatedBy, c.CreatedDate, c.UpdatedBy, c.UpdatedDate, c.LocationPrefix, c.CompanyShortName, c.CompanyRegistrationNumber, c.GST, c.GSTRegistrationNumber, c.Website, c.MCSTOffice, o.OrganizationName, co.Name as [CountryName],
        c.SupplierVerifier 
 
        FROM   Company AS c INNER JOIN 
               Organization As o ON c.OrganizationId=o.OrganizationId INNER JOIN
			   Countries AS co ON co.Id = c.Country
		WHERE (c.Email LIKE '%'+@Search+'%' OR c.CompanyName LIKE '%'+@Search+'%' OR c.CompanyCode LIKE '%'+@Search+'%' OR c.CompanyRegistrationNumber LIKE '%'+@Search+'%' 
		OR c.City LIKE '%'+@Search+'%' OR c.ZipCode LIKE '%'+@Search+'%' ) AND (c.Isdeleted = 0) ORDER BY c.UpdatedDate ASC OFFSET @Skip ROWS FETCH 
NEXT @Take ROWS ONLY;

		SELECT COUNT(*)  FROM      Company AS c INNER JOIN									
									Organization AS o ON c.OrganizationId = o.OrganizationId 
		WHERE (c.Email LIKE '%'+@Search+'%' OR c.CompanyName LIKE '%'+@Search+'%' OR c.CompanyCode LIKE '%'+@Search+'%' OR c.CompanyRegistrationNumber LIKE '%'+@Search+'%'
		 OR c.City LIKE '%'+@Search+'%' OR c.ZipCode LIKE '%'+@Search+'%' ) AND (c.Isdeleted = 0)


	END
	  --SELECT BY ID
	IF @Action = 'SELECTBYID'
      BEGIN			
			SELECT c.CompanyId, c.OrganizationId, c.CompanyCode, c.CompanyName, c.CompanyDescription, c.Address1, c.Address2, c.Address3, c.Address4,
			c.City, c.Country, c.ZipCode,c.SupplierVerifier,c.InvoiceLimit, c.Email, c.Telephone, c.Mobilenumber, c.Fax, c.Isdeleted, c.CreatedBy,	
			c.CreatedDate, c.UpdatedBy, c.UpdatedDate, c.LocationPrefix, c.CompanyShortName, c.CompanyRegistrationNumber, c.GST, c.GSTRegistrationNumber,	
			c.Website, c.MCSTOffice, o.OrganizationName, co.Name as [CountryName], c.SupplierVerifier 
            FROM   Company AS c INNER JOIN 
                   Organization As o ON c.OrganizationId=o.OrganizationId INNER JOIN
				   Countries AS co ON co.Id = c.Country
            WHERE c.IsDeleted=0 AND c.CompanyId = @CompanyId;

      END
 
      --INSERT
   IF @Action = 'INSERT'
      BEGIN	      
			INSERT INTO	[dbo].[Company]
			(OrganizationId,CompanyCode,CompanyName,CompanyDescription,Address1,Address2,Address3,Address4,
			City,Country,ZipCode,SupplierVerifier,InvoiceLimit,Email,Telephone,Mobilenumber,Fax,CreatedBy,CreatedDate,UpdatedDate,
			CompanyShortName,CompanyRegistrationNumber,GST,GSTRegistrationNumber,Website,MCSTOffice)
			VALUES
			(@OrganizationId,@CompanyCode,@CompanyName,@CompanyDescription,@Address1,@Address2,@Address3,@Address4,
			@City,@Country,@ZipCode,@SupplierVerifier,@InvoiceLimit,@Email,@Telephone,@Mobilenumber,@Fax,@CreatedBy,@CreatedDate,@CreatedDate,
			@CompanyShortName,@CompanyRegistrationNumber,@GST,@GSTRegistrationNumber,@Website,@MCSTOffice)

            SELECT SCOPE_IDENTITY();

			--update UsersInRoles
			--set RoleID = (select Roles.RoleID from Roles where RoleName = 'User')
			--where RoleID= 5

			update UsersInRoles
			set RoleID = (select Roles.RoleID from Roles where RoleName = 'SupplierVerifier')
			where UserID= @SupplierVerifier
	END
	 

	--INSERT INTO CompanyDepartment
	IF @Action = 'INSERTCOMPANYDEPARTMENT'
		BEGIN
			INSERT INTO [dbo].[CompanyDepartment]
			(CompanyId,DepartmentId,DepartmentName,CreatedBy,CreatedDate)
			VALUES
			(@CompanyId,@DepartmentId,@DepartmentName,@CreatedBy,@CreatedDate)
		END

	IF @Action = 'INSERTGLCODEUSERS'
		BEGIN
			INSERT INTO [dbo].[GLCodeUsersNotification]
			(UserId,CompanyId,CreatedBy,CreatedDate) 
			VALUES
			(@UserId,@CompanyId,@CreatedBy,@CreatedDate) 
		END

	IF @Action = 'GETGLCODEUSERS'
		BEGIN
			SELECT U.UserID,U.UserName FROM [dbo].[GLCodeUsersNotification] AS GL INNER JOIN UserProfile AS U ON GL.UserId=U.UserID 
			WHERE GL.CompanyId=@CompanyId
		END

	IF @Action = 'DELETEGLCODEUSERS'
		BEGIN
			DELETE FROM [dbo].[GLCodeUsersNotification] WHERE CompanyId=@CompanyId
			SELECT @@ROWCOUNT 
		END
 
      --UPDATE
   IF @Action = 'UPDATE'
      BEGIN
	   DECLARE @previousVerifier AS INT	
		   select @previousVerifier = SupplierVerifier from Company where CompanyId = @CompanyId

			UPDATE [dbo].[Company]
			SET OrganizationId=@OrganizationId
			,CompanyCode=@CompanyCode
			,CompanyName=@CompanyName
			,CompanyDescription=@CompanyDescription
			,Address1=@Address1
			,Address2=@Address2
			,Address3=@Address3
			,Address4=@Address4
			,City=@City
			,Country=@Country
			,ZipCode=@ZipCode
			,SupplierVerifier=@SupplierVerifier
			,InvoiceLimit=@InvoiceLimit
			,Email=@Email
			,Telephone=@Telephone
			,Mobilenumber=@Mobilenumber
			,Fax=@Fax
			,UpdatedBy=@UpdatedBy
			,UpdatedDate=@UpdatedDate
			,LocationPrefix=@LocationPrefix
			,CompanyShortName=@CompanyShortName
			,CompanyRegistrationNumber=@CompanyRegistrationNumber
			,GST=@GST
			,GSTRegistrationNumber=@GSTRegistrationNumber
			,Website=@Website
			,MCSTOffice=@MCSTOffice
		WHERE CompanyId=@CompanyId

	  SELECT @@ROWCOUNT 

	     update UsersInRoles
			set RoleID = (select Roles.RoleID from Roles where RoleName = 'User')
			where UserID= @previousVerifier

         update UsersInRoles
			set RoleID = (select Roles.RoleID from Roles where RoleName = 'SupplierVerifier')
			where UserID= @SupplierVerifier
      END
 
      --DELETE
   IF @Action = 'DELETE'
      BEGIN

		   UPDATE [dbo].[Company] SET IsDeleted = 1
					WHERE CompanyId=@CompanyId;
      END

	  --Count
	 IF @Action = 'COUNT'
		BEGIN
		    SELECT COUNT(*) FROM [dbo].[Company]
		END

	IF @Action = 'FILTER'
		BEGIN	
		
			    select CompanyId,CompanyCode,ZipCode,CompanyShortName,CompanyName,CN.Name from Company C
			       inner join Countries CN on CN.Id=C.Country
			     where CompanyName LIKE CONCAT( '%',@CompanyName,'%') and
				   CompanyCode  LIKE CONCAT( '%',@CompanyCode,'%') and
				   CN.Id LIKE CONCAT( '%',@Country,'%')
			 
    	END

END







