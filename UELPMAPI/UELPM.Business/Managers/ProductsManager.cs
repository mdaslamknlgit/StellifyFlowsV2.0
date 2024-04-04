using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model;
using UELPM.Service.Repositories;

namespace UELPM.Business.Managers
{
    public class ProductsManager : IProductsManager
    {
        public ProductsListResult SearchProducts(UserInfo MyUserInfo, SearchProducts searchProducts)
        {
            ProductsRepository m_ProductsRepository = new ProductsRepository(MyUserInfo);
            return m_ProductsRepository.SearchProducts(MyUserInfo, searchProducts);
        }
        public ProductsDTO GetProductByProductId(UserInfo MyUserInfo, int ProductId)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<ProductsDomainItem> GetProductDomainItem(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
        public ResultReponse CreateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ResultReponse UpdateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }
    }
}
