USE [UEL_DEV_1]
GO
/****** Object:  StoredProcedure [dbo].[Taxes_CRUD]    Script Date: 08-07-2019 18:00:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[Taxes_CRUD]
@Action VARCHAR(10),
@Search NVARCHAR(30) = NULL,
@TaxnameFilter NVARCHAR(30) = NULL,
@AuthorityFilter NVARCHAR(30) = NULL,
@TaxAmountFilter decimal(18, 4) = NULL,
@TaxId int = null,
@Taxname	nvarchar(MAX) =null,
@TaxType	bit =null ,
@TaxGroupId int = null,
@TaxAmount	decimal(18, 4) =null,
--@TaxAuthority	nvarchar(50) =null,
@TaxClass	nvarchar(max) =null,
@CreatedBy	int =null,
@CreatedDate	datetime =null,
@Skip int =null,
@Take int =null,
@TotalRows INT = NULL OUTPUT

AS 
BEGIN
  DECLARE @result AS INT = 0;
  if @Action='SELECT'  AND (@Search IS NULL or @Search = '')
	  BEGIN

			select
			 T.TaxId,T.TaxName, T.TaxType, T.TaxGroupId, T.TaxAmount, Tg.TaxGroupName as TaxAuthority,
			 T.TaxClass, T.IsDeleted,T.CreatedBy, T.CreatedDate, T.UpdatedBy, T.UpdatedDate
			from
			dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId
			where
				T.Isdeleted=0
			order by T.UpdatedDate desc
				OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;


			select count(*)  
			from
			dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId
			where
				T.Isdeleted=0
	  END
	  IF @Action = 'SELECT' AND @Search IS NOT NULL
		BEGIN
		select 
			 T.TaxId,T.TaxName, T.TaxType, T.TaxGroupId, T.TaxAmount, Tg.TaxGroupName as TaxAuthority,
			 T.TaxClass, T.IsDeleted,T.CreatedBy, T.CreatedDate, T.UpdatedBy, T.UpdatedDate
			from
			dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId
			where (T.TaxName LIKE concat('%',@Search,'%') OR Tg.TaxGroupName LIKE concat('%',@Search,'%') OR T.TaxAmount LIKE concat('%',@Search,'%')) and
				T.Isdeleted=0
			order by T.UpdatedDate desc
			OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;


			select 
				COUNT(*)
		     from
				dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId
			where (T.TaxName LIKE concat('%',@Search,'%') OR Tg.TaxGroupName LIKE concat('%',@Search,'%') OR T.TaxAmount LIKE concat('%',@Search,'%')) and
				T.Isdeleted=0

		END

		if(@Action='FILTER')
			BEGIN
			select 
			 T.TaxId,T.TaxName, T.TaxType, T.TaxGroupId, T.TaxAmount, Tg.TaxGroupName as TaxAuthority,
			 T.TaxClass, T.IsDeleted,T.CreatedBy, T.CreatedDate, T.UpdatedBy, T.UpdatedDate
			from
				dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId
			where (T.TaxName LIKE concat('%',@TaxnameFilter,'%') And Tg.TaxGroupName LIKE concat('%',@AuthorityFilter,'%') And T.TaxAmount LIKE concat('%',@TaxAmountFilter,'%')) and
				T.Isdeleted=0
			order by T.UpdatedDate desc
			OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;

				select 
				count(*)
		    from
				dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId
			where (T.TaxName LIKE concat('%',@TaxnameFilter,'%') And Tg.TaxGroupName LIKE concat('%',@AuthorityFilter,'%') And T.TaxAmount LIKE concat('%',@TaxAmountFilter,'%')) and
				T.Isdeleted=0


			END


 IF @Action = 'TAXES'
	  BEGIN
			select
			 T.TaxId,T.TaxName, T.TaxType, T.TaxGroupId, T.TaxAmount, Tg.TaxGroupName as TaxAuthority,
			 T.TaxClass, T.IsDeleted,T.CreatedBy, T.CreatedDate, T.UpdatedBy, T.UpdatedDate
				from
				dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId			
			where
			T.TaxGroupId = @TaxGroupId

	  END


	  IF @Action = 'SELECTBYID'
	  BEGIN
			select
			 T.TaxId,T.TaxName, T.TaxType, T.TaxGroupId, T.TaxAmount, Tg.TaxGroupName as TaxAuthority,
			 T.TaxClass, T.IsDeleted,T.CreatedBy, T.CreatedDate, T.UpdatedBy, T.UpdatedDate
				from
				dbo.Taxes T
			join dbo.TaxGroup Tg
			on T.TaxGroupId = Tg.TaxGroupId			
			where
			T.TaxId = @TaxId

	  END
	 
	  else if @Action='INSERT'
	  BEGIN
		
			--insert into dbo.Taxes(Taxname,TaxType,TaxAmount,TaxAuthority,TaxClass,CreatedBy,CreatedDate,UpdatedBy,UpdatedDate)
			--						values(@Taxname,@TaxType,@TaxAmount,@TaxAuthority,@TaxClass,@CreatedBy,@CreatedDate,@CreatedBy,@CreatedDate);

			insert into dbo.Taxes(Taxname,TaxType,TaxAmount,TaxGroupId,TaxClass,CreatedBy,CreatedDate,UpdatedBy,UpdatedDate)
									values(@Taxname,@TaxType,@TaxAmount,@TaxGroupId,@TaxClass,@CreatedBy,@CreatedDate,@CreatedBy,@CreatedDate);
            SET @result = @result  + @@ROWCOUNT
			SELECT SCOPE_IDENTITY();
			SET @TotalRows = @result

	  END
	  else if @Action='UPDATE'
	  BEGIN

			--update dbo.Taxes
			--set
			--	TaxName = @Taxname,
			--	TaxType = @TaxType,
			--	TaxAmount = @TaxAmount,
			--	TaxAuthority = @TaxAuthority,
			--	TaxClass = @TaxClass,
			--	UpdatedBy = @CreatedBy,
			--	UpdatedDate = @CreatedDate
			--where
			--TaxId = @TaxId

				update dbo.Taxes
			set
				TaxName = @Taxname,
				TaxType = @TaxType,
				TaxAmount = @TaxAmount,
				TaxGroupId = @TaxGroupId,
				TaxClass = @TaxClass,
				UpdatedBy = @CreatedBy,
				UpdatedDate = @CreatedDate
			where
			TaxId = @TaxId

	  END
	  else if @Action='DELETE'
	  BEGIN

			update dbo.Taxes
			set
				IsDeleted =1,
				UpdatedBy = @CreatedBy,
				UpdatedDate = @CreatedDate
			where
				TaxId = @TaxId

	  END
	 else if(@Action='VALIDATE')
		begin

	
			select count(*)
			from
				dbo.Taxes
			where
				TaxId != @TaxId
				and
				TaxGroupId=@TaxGroupId
				and 
				TaxClass=@TaxClass
				--TaxName = @Taxname
				and
				IsDeleted=0;
		end

	 else if(@Action='COUNT')
		begin
			select COUNT(*) from Taxes where TaxGroupId=@TaxGroupId and TaxClass=@TaxClass
		end

END

