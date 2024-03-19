ALTer PROC [dbo].[UseProfile_CRUD]
@UserID	int,	
@UserName	nvarchar(56),	
@UserGUID	nvarchar(50),	
@Firstname	nvarchar(150),	
@LastName	nvarchar(150),
@CreatedDate	datetime,	
@LastUpdatedDate	datetime,
@userAccountControl	nvarchar(100),	
@Emailid	nvarchar(100),
@distinguishedName	nvarchar(100),	
@logonCount	int	,
@primaryGroupID	int	,
@IsActive	bit	,
@Thumbnail	image,
@Title nvarchar(100)

AS
BEGIN
  if exists (select * from UserProfile where UserGUID = @UserGUID and UserGUID is not null)
  begin
    update UserProfile
	set 
	 UserName = @UserName,
	 Firstname = @Firstname,
	 LastName = (case when (@LastName IS NOT NULL AND @LastName<> '') THEN @LastName ELSE LastName end),
	 CreatedDate = @CreatedDate,
	 LastUpdatedDate = @LastUpdatedDate,
	 userAccountControl = @userAccountControl,
	 Emailid = @Emailid,
	 distinguishedName = @distinguishedName,
	 logonCount = @logonCount,
	 primaryGroupID = @primaryGroupID,
	 Thumbnail = @Thumbnail,
	 Title = @Title
	  where UserGUID = @UserGUID and UserGUID is not null
  end
  else
   begin 
      insert into UserProfile (UserName,UserGUID,Firstname,LastName,CreatedDate,LastUpdatedDate,userAccountControl,
	  Emailid,distinguishedName,logonCount,primaryGroupID,Thumbnail,Title)
	  values (@UserName,@UserGUID,@Firstname,@LastName,@CreatedDate,@LastUpdatedDate,@userAccountControl,@Emailid,
	  @distinguishedName,@logonCount,@primaryGroupID,@Thumbnail,@Title)
	  
   end
   END
		

		

