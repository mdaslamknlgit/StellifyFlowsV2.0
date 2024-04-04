using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    //[Authorize(Roles = "Engineer,Admin")]
    public class ItemCategoryController : ApiController
    {
        private readonly IItemCategoryManager m_itemManager;

        public ItemCategoryController() { }

        public ItemCategoryController(IItemCategoryManager itemManager)
        {
            m_itemManager = itemManager;
        }

        /// <summary>
        /// This method is used for getting all item categories
        /// </summary>
        /// <returns></returns>
       
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/ItemCategories")]
        public IHttpActionResult GetItemCategories([FromUri] ItemCategoryDisplayInput categoryDisplayInput)
        {

            try
            {
                //ClaimsIdentity claimsIdentity = User.Identity as ClaimsIdentity;
                //var userid = claimsIdentity.Claims.FirstOrDefault(x =>x.Type == "userId").Value;
                var result = m_itemManager.GetItemCategories(categoryDisplayInput);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/ItemCategories/GetItemCategorById/{ItemCategoryId}")]
        public IHttpActionResult GetItemCategories(int ItemCategoryId)
        {

            try
            {
                //ClaimsIdentity claimsIdentity = User.Identity as ClaimsIdentity;
                //var userid = claimsIdentity.Claims.FirstOrDefault(x =>x.Type == "userId").Value;
                var result = m_itemManager.GetItemCategorById(ItemCategoryId);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// This method is used to create item category
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/CreateItemCategory")]
        public IHttpActionResult CreateItemCategory(ItemCategory item)
        {
            ResponseStatus statusObj = new ResponseStatus();

            try
            {
                int validationStatus = m_itemManager.ValidateItemCategory(new ValidateItemCategory
                                        {
                                            ItemCategoryID = 0,
                                            Name = item.Name
                                        });


                if (validationStatus == 0)
                {
                    var result = m_itemManager.CreateItemCategory(item);

                    statusObj.Status = "success";
                    statusObj.Value = result;
                }
                else
                {
                    statusObj.Status = "Duplicate";
                }
             
                return Ok(statusObj);

            }
            catch(Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();

                return Ok(statusObj);
            }
        }

        /// <summary>
        /// This method is used to udpate item category
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPost]
        [Route("api/UpdateItemCategory")]
        public IHttpActionResult UpdateItemCategory(ItemCategory item)
        {
            ResponseStatus statusObj = new ResponseStatus();

            try
            {
                int validationStatus = m_itemManager.ValidateItemCategory(new ValidateItemCategory
                {
                    ItemCategoryID = item.ItemCategoryID,
                    Name = item.Name
                });


                if (validationStatus == 0)
                {
                    var result = m_itemManager.UpdateItemCategory(item);

                    statusObj.Status = "success";
                    statusObj.Value = result;
                }
                else
                {
                    statusObj.Status = "duplicate";
                }

                return Ok(statusObj);

            }
            catch(Exception e)
            {
           
                statusObj.Status = "error";
                statusObj.Value = e.ToString();

                return Ok(statusObj);
            }
        }

        /// <summary>
        /// This method is used to delete item category
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
  
        [HttpDelete]
        [Route("api/DeleteItemCategory/{itemCategoryId}")]
        public IHttpActionResult DeleteItemCategory(int itemCategoryId)
        {
            try
            {
                int validationStatus = m_itemManager.CheckExistingCategory(itemCategoryId);
                if (validationStatus == 0)
                {
                    var result = m_itemManager.DeleteItemCategory(new ItemCategoryDelete
                    {

                        ItemCategoryID = itemCategoryId,
                        ModifiedBy = 0

                    });
                }

                return Ok(validationStatus);

            }
            catch (Exception e)
            {

                throw e;
            }
  
        }

    }
}
