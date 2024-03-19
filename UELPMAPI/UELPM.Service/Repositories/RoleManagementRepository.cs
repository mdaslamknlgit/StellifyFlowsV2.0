using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class RoleManagementRepository : IRoleManagementRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public RoleGrid GetRoles(GridDisplayInput gridDisplayInput)
        {
            RoleGrid objRoleGrid = new RoleGrid();
            using (var result = this.m_dbconnection.QueryMultiple("Role_CRUD", new
            {

                Action = "SELECT",
                Search = "",
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take


            }, commandType: CommandType.StoredProcedure))
            {
                objRoleGrid.Roles = result.Read<Roles>().AsList();
                objRoleGrid.TotalRecords = objRoleGrid.Roles.Select(x => x.TotalRecords).FirstOrDefault();
            }

            return objRoleGrid;

        }

        public RoleGrid GetAllSearchRoles(GridDisplayInput gridDisplayInput)
        {
            RoleGrid objRoleGrid = new RoleGrid();
            using (var result = this.m_dbconnection.QueryMultiple("Role_CRUD", new
            {

                Action = "SELECT",
                Search = gridDisplayInput.Search,
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take

            }, commandType: CommandType.StoredProcedure))
            {
                objRoleGrid.Roles = result.Read<Roles>().AsList();
                objRoleGrid.TotalRecords = objRoleGrid.Roles.Select(x => x.TotalRecords).FirstOrDefault();
            }

            return objRoleGrid;
        }

        public RolePageModule GetPageModules()
        {
            RolePageModule rolePageModule = null;
            bool isNewRecord = true;
            IEnumerable<PageModule> pageModules = null;
            pageModules = this.m_dbconnection.Query<PageModule>("Role_CRUD", new
            {
                Action = "PageModules",
            }, commandType: CommandType.StoredProcedure).ToList();

            //Need to prepare hierarchical data for tree table          
            rolePageModule = new RolePageModule();
            rolePageModule = PrepareTreeTableData(pageModules, isNewRecord);
            return rolePageModule;
        }

        public Roles GetRoleDetails(int roleId)
        {
            Roles roleDetials = new Roles();
            RolePageModule rolePageModule = null;
            bool isNewRecord = false;
            using (var result = this.m_dbconnection.QueryMultiple("Role_CRUD", new
            {
                Action = "SELECTBYID",
                RoleID = roleId
            }, commandType: CommandType.StoredProcedure))
            {
                roleDetials = result.Read<Roles>().FirstOrDefault();
            }

            //getting page modules here         
            IEnumerable<PageModule> pageModules = null;
            pageModules = this.m_dbconnection.Query<PageModule>("Role_CRUD", new
            {
                Action = "ModulesByRole",
                RoleID = roleId
            }, commandType: CommandType.StoredProcedure).ToList();

            //Need to prepare hierarchical data for tree table          
            rolePageModule = new RolePageModule();
            if (roleDetials != null)
            {
                if (pageModules.Count() > 0)
                {
                    isNewRecord = false;
                    rolePageModule = PrepareTreeTableData(pageModules, isNewRecord);
                }
                else
                {
                    isNewRecord = true;
                    rolePageModule = GetPageModules();
                }

                roleDetials.RolePageModule = rolePageModule;
            }

            return roleDetials;
        }

        public int CreateRole(Roles role)
        {
            this.m_dbconnection.Open();//opening the connection...
            string DraftCode = string.Empty;
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var roleId = this.m_dbconnection.Query<int>("Role_CRUD",
                    new
                    {
                        Action = "INSERT",
                        RoleName = role.RoleName,
                        Description = role.Description,
                        IsActive = role.IsActive,
                        CreatedBy = role.CreatedBy,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();


                    #region  Saving Role Access details
                    if (roleId > 0)
                    {
                        if (role.RoleAccessLevels != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in role.RoleAccessLevels)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@RoleID", roleId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@PageId", record.PageId, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@IsView", record.IsView, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsAdd", record.IsAdd, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsEdit", record.IsEdit, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsDelete", record.IsDelete, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsEmail", record.IsEmail, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsPrint", record.IsPrint, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsVerify", record.IsVerify, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsApprove", record.IsApprove, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsVoid", record.IsVoid, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsImport", record.IsImport, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsExport", record.IsExport, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsGeneratePOC", record.IsGeneratePOC, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsGenerateReport", record.IsGenerateReport, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", role.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }

                            var result = this.m_dbconnection.Execute("RoleAccessLevel_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }


                        #endregion

                        //commiting the transaction...
                        transactionObj.Commit();
                    }
                    else
                    {
                        transactionObj.Rollback();
                    }

                    return roleId;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public int UpdateRole(Roles role)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var supplierSaveResult = this.m_dbconnection.Query<int>("Role_CRUD",
                                 new
                                 {
                                     Action = "UPDATE",
                                     RoleID = role.RoleID,
                                     RoleName = role.RoleName,
                                     Description = role.Description,
                                     IsActive = role.IsActive,
                                     UpdatedBy = role.UpdatedBy,
                                     UpdatedDate = DateTime.Now

                                 }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                    #region saving role access level details..
                    if (supplierSaveResult > 0)
                    {
                        if (role.RoleAccessLevels != null)
                        {
                            List<DynamicParameters> roleAccessesToAdd = new List<DynamicParameters>();
                            //looping through the list of contact persons...
                            foreach (var record in role.RoleAccessLevels.Where(i => i.AccessLevelId == 0).Select(i => i))
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@RoleID", role.RoleID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@PageId", record.PageId, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@IsView", record.IsView, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsAdd", record.IsAdd, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsEdit", record.IsEdit, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsDelete", record.IsDelete, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsEmail", record.IsEmail, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsPrint", record.IsPrint, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsVerify", record.IsVerify, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsApprove", record.IsApprove, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsVoid", record.IsVoid, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsImport", record.IsImport, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsExport", record.IsExport, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsGeneratePOC", record.IsGeneratePOC, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@IsGenerateReport", record.IsGenerateReport, DbType.Boolean, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", role.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                roleAccessesToAdd.Add(itemObj);
                            }

                            var saveResult = this.m_dbconnection.Execute("RoleAccessLevel_CRUD", roleAccessesToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }

                        #endregion

                        #region updating role access level details..

                        List<DynamicParameters> roleAccessesToUpdate = new List<DynamicParameters>();

                        foreach (var record in role.RoleAccessLevels.Where(i => i.AccessLevelId > 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccessLevelId", record.AccessLevelId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@RoleID", role.RoleID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@PageId", record.PageId, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@IsView", record.IsView, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsAdd", record.IsAdd, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsEdit", record.IsEdit, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsDelete", record.IsDelete, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsEmail", record.IsEmail, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsPrint", record.IsPrint, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsVerify", record.IsVerify, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsApprove", record.IsApprove, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsVoid", record.IsVoid, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsImport", record.IsImport, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsExport", record.IsExport, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsGeneratePOC", record.IsGeneratePOC, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@IsGenerateReport", record.IsGenerateReport, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@UpdatedBy", role.UpdatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@UpdatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            roleAccessesToUpdate.Add(itemObj);
                        }


                        var updateResult = this.m_dbconnection.Execute("RoleAccessLevel_CRUD", roleAccessesToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        //commiting the transaction...
                        transactionObj.Commit();
                    }
                    else
                    {
                        transactionObj.Rollback();
                    }

                    return supplierSaveResult;
                }
                catch (Exception e)
                {
                    //rollback transaction..
                    transactionObj.Rollback();
                    throw e;
                }
            }
        }

        public bool DeleteRole(int roleId)
        {
            {
                try
                {
                    int result = this.m_dbconnection.Query<int>("Role_CRUD",
                                                new
                                                {
                                                    Action = "DELETE",
                                                    RoleID = roleId
                                                },
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();

                    if (result == 1)
                    {
                        return false;
                    }
                    else
                        return true;
                }
                catch (Exception e)
                {
                    throw e;
                }
            }
        }

        private RolePageModule PrepareTreeTableData(IEnumerable<PageModule> pageModules, bool isNewRecord)
        {
            PageTreeNode treeNode = new PageTreeNode();
            List<PageData> pageDetails = new List<PageData>();
            RolePageModule rolePageModule = null;
            foreach (var record in pageModules)
            {
                PageData objPageData = new PageData(record.AccessLevelId, record.PageName, record.PageId, record.ParentId, record.IsPageModule, record.IsAdd, record.IsView, record.IsEdit, record.IsDelete, record.IsEmail, record.IsPrint, record.IsVerify, record.IsApprove, record.IsVoid, record.IsImport, record.IsExport, record.IsGeneratePOC, record.IsGenerateReport, record.IsAddEnable, record.IsEditEnable, record.IsDeleteEnable, record.IsEmailEnable, record.IsPrintEnable, record.IsVerifyEnable, record.IsVerifyEnable, record.IsVoidEnable, record.IsImportEnable, record.IsExportEnable, record.IsGeneratePOCEnable, record.IsGenerateReportEnable);

                objPageData.AccessLevelId = record.AccessLevelId;
                objPageData.PageName = record.PageName;
                objPageData.PageId = record.PageId;
                objPageData.ParentId = record.ParentId;
                objPageData.IsPageModule = record.IsPageModule;
                objPageData.IsAdd = isNewRecord == false ? record.IsAdd : true;
                objPageData.IsView = isNewRecord == false ? record.IsView : true;
                objPageData.IsEdit = isNewRecord == false ? record.IsEdit : true;
                objPageData.IsDelete = isNewRecord == false ? record.IsDelete : true;
                objPageData.IsEmail = isNewRecord == false ? record.IsEmail : true;
                objPageData.IsPrint = isNewRecord == false ? record.IsPrint : true;
                objPageData.IsVerify = isNewRecord == false ? record.IsVerify : true;
                objPageData.IsApprove = isNewRecord == false ? record.IsApprove : true;
                objPageData.IsVoid = isNewRecord == false ? record.IsVoid : true;
                objPageData.IsImport = isNewRecord == false ? record.IsImport : true;
                objPageData.IsExport = isNewRecord == false ? record.IsExport : true;
                objPageData.IsGeneratePOC = isNewRecord == false ? record.IsGeneratePOC : true;
                objPageData.IsGenerateReport = isNewRecord == false ? record.IsGenerateReport : true;

                objPageData.IsAddEnable = record.IsAddEnable;
                objPageData.IsEditEnable = record.IsEditEnable;
                objPageData.IsDeleteEnable = record.IsDeleteEnable;
                objPageData.IsEmailEnable = record.IsEmailEnable;
                objPageData.IsPrintEnable = record.IsPrintEnable;
                objPageData.IsVerifyEnable = record.IsVerifyEnable;
                objPageData.IsApproveEnable = record.IsApproveEnable;
                objPageData.IsVoidEnable = record.IsVoidEnable;
                objPageData.IsImportEnable = record.IsImportEnable;
                objPageData.IsExportEnable = record.IsExportEnable;
                objPageData.IsGeneratePOCEnable = record.IsGeneratePOCEnable;
                objPageData.IsGenerateReportEnable = record.IsGenerateReportEnable;

                pageDetails.Add(objPageData);
            }

            List<PageTreeNode> nodeList = new List<PageTreeNode>();
            rolePageModule = new RolePageModule();
            rolePageModule.RoleAccessLevels = pageDetails;
            nodeList = FillRecursive(pageDetails, null, isNewRecord);
            rolePageModule.PageTreeNodes = nodeList;
            return rolePageModule;
        }

        private static List<PageTreeNode> FillRecursive(List<PageData> pageDetails, int? parentId, bool isNewRecord)
        {
            List<PageTreeNode> nodeList = new List<PageTreeNode>();
            foreach (var item in pageDetails.Where(x => x.ParentId.Equals(parentId)))
            {
                RoleAccessLevel objPageData = new RoleAccessLevel();
                objPageData.AccessLevelId = item.AccessLevelId;
                objPageData.PageName = item.PageName;
                objPageData.PageId = item.PageId;
                objPageData.ParentId = item.ParentId;
                objPageData.IsPageModule = item.IsPageModule;
                objPageData.IsAdd = isNewRecord == false ? item.IsAdd : true;
                objPageData.IsView = isNewRecord == false ? item.IsView : true;
                objPageData.IsEdit = isNewRecord == false ? item.IsEdit : true;
                objPageData.IsDelete = isNewRecord == false ? item.IsDelete : true;
                objPageData.IsEmail = isNewRecord == false ? item.IsEmail : true;
                objPageData.IsPrint = isNewRecord == false ? item.IsPrint : true;
                objPageData.IsVerify = isNewRecord == false ? item.IsVerify : true;
                objPageData.IsApprove = isNewRecord == false ? item.IsApprove : true;
                objPageData.IsVoid = isNewRecord == false ? item.IsVoid : true;
                objPageData.IsImport = isNewRecord == false ? item.IsImport : true;
                objPageData.IsExport = isNewRecord == false ? item.IsExport : true;
                objPageData.IsGeneratePOC = isNewRecord == false ? item.IsGeneratePOC : true;
                objPageData.IsGenerateReport = isNewRecord == false ? item.IsGenerateReport : true;

                objPageData.IsAddEnable = item.IsAddEnable;
                objPageData.IsEditEnable = item.IsEditEnable;
                objPageData.IsDeleteEnable = item.IsDeleteEnable;
                objPageData.IsEmailEnable = item.IsEmailEnable;
                objPageData.IsPrintEnable = item.IsPrintEnable;
                objPageData.IsVerifyEnable = item.IsVerifyEnable;
                objPageData.IsApproveEnable = item.IsApproveEnable;
                objPageData.IsVoidEnable = item.IsVoidEnable;
                objPageData.IsImportEnable = item.IsImportEnable;
                objPageData.IsExportEnable = item.IsExportEnable;
                objPageData.IsGeneratePOCEnable = item.IsGeneratePOCEnable;
                objPageData.IsGenerateReportEnable = item.IsGenerateReportEnable;

                nodeList.Add(new PageTreeNode
                {
                    data = objPageData,
                    children = FillRecursive(pageDetails, item.PageId, isNewRecord),
                    expanded = true
                });
            }
            return nodeList;
        }
    }

}

