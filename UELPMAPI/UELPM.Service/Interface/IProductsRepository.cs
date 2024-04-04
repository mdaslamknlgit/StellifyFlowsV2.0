using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Service.Interface
{
    public interface IProductsRepository
    {
        ProductsListResult SearchProducts(UserInfo MyUserInfo, SearchProducts searchProducts);

        ProductsDTO GetProductByProductId(UserInfo MyUserInfo, int ProductId);

        IEnumerable<ProductsDomainItem> GetProductDomainItem(UserInfo MyUserInfo);

        ResultReponse CreateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo);

        ResultReponse UpdateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo);


    }
}
