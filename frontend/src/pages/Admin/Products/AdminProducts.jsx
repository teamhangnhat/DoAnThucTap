import {

    useEffect,

    useState

} from "react";


import {

    Link

} from "react-router-dom";


import {

    getAdminProducts,

    deleteAdminProduct

} from "../../../services/admin/adminProductService";



function AdminProducts() {


    const [

        products,

        setProducts

    ] = useState([]);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        search,

        setSearch

    ] = useState("");



    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    const loadProducts = async () => {

        try {

            setLoading(true);


            const response =

                await getAdminProducts();


            setProducts(

                response.data

            );

        }

        catch (error) {

            console.error(

                "Load admin products error:",

                error

            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadProducts();

    }, []);



    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async (id) => {


        const confirmDelete =

            window.confirm(

                "Are you sure you want to delete this product?"

            );


        if (!confirmDelete) {

            return;

        }


        try {

            await deleteAdminProduct(id);


            setProducts(

                products.filter(

                    (product) =>

                        product.id !== id

                )

            );


            alert(

                "Product deleted successfully"

            );

        }

        catch (error) {

            console.error(

                "Delete product error:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to delete product"

            );

        }

    };



    // =====================================================
    // SEARCH
    // =====================================================

    const filteredProducts =

        products.filter(

            (product) =>

                product.product_name

                    .toLowerCase()

                    .includes(

                        search.toLowerCase()

                    )

        );



    if (loading) {

        return (

            <div className="p-10">

                Loading products...

            </div>

        );

    }



    return (

        <div className="min-h-screen bg-gray-100 p-8">


            {/* HEADER */}

            <div className="flex justify-between items-center mb-8">


                <div>

                    <h1 className="text-3xl font-bold">

                        Product Management

                    </h1>


                    <p className="text-gray-500 mt-2">

                        Manage all products in your store

                    </p>

                </div>


                <Link

                    to="/admin/products/add"

                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"

                >

                    + Add Product

                </Link>


            </div>



            {/* SEARCH */}

            <div className="bg-white p-5 rounded-xl shadow mb-6">


                <input

                    type="text"

                    placeholder="Search product..."

                    value={search}

                    onChange={(e) =>

                        setSearch(

                            e.target.value

                        )

                    }

                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"

                />

            </div>



            {/* TABLE */}

            <div className="bg-white rounded-xl shadow overflow-x-auto">


                <table className="w-full">


                    <thead className="bg-gray-100">


                        <tr>


                            <th className="p-4 text-left">

                                Image

                            </th>


                            <th className="p-4 text-left">

                                Product

                            </th>


                            <th className="p-4 text-left">

                                Category

                            </th>


                            <th className="p-4 text-left">

                                Price

                            </th>


                            <th className="p-4 text-left">

                                Stock

                            </th>


                            <th className="p-4 text-left">

                                Status

                            </th>


                            <th className="p-4 text-left">

                                Action

                            </th>


                        </tr>


                    </thead>


                    <tbody>


                        {filteredProducts.map(

                            (product) => {


                                const imageUrl =

                                    product.image_url

                                        ?.startsWith("http")

                                        ? product.image_url

                                        : `http://localhost:5000${product.image_url}`;


                                return (

                                    <tr

                                        key={product.id}

                                        className="border-t hover:bg-gray-50"

                                    >


                                        <td className="p-4">


                                            <img

                                                src={imageUrl}

                                                alt={

                                                    product.product_name

                                                }

                                                className="w-20 h-20 object-cover rounded-lg"

                                            />


                                        </td>


                                        <td className="p-4">


                                            <p className="font-semibold">

                                                {

                                                    product.product_name

                                                }

                                            </p>


                                            <p className="text-sm text-gray-400">

                                                ID: {

                                                    product.id

                                                }

                                            </p>


                                        </td>


                                        <td className="p-4">

                                            {

                                                product.category_name ||

                                                "No category"

                                            }

                                        </td>


                                        <td className="p-4">

                                            {

                                                Number(

                                                    product.price

                                                ).toLocaleString(

                                                    "vi-VN"

                                                )

                                            }

                                            ₫

                                        </td>


                                        <td className="p-4">


                                            <span

                                                className={

                                                    product.stock <= 0

                                                        ? "text-red-600 font-bold"

                                                        : "text-green-600 font-semibold"

                                                }

                                            >

                                                {

                                                    product.stock

                                                }

                                            </span>


                                        </td>


                                        <td className="p-4">


                                            {product.is_active ? (

                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                                                    Active

                                                </span>

                                            ) : (

                                                <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">

                                                    Inactive

                                                </span>

                                            )}

                                        </td>


                                        <td className="p-4">


                                            <div className="flex gap-2">


                                                <Link

                                                    to={`/admin/products/edit/${product.id}`}

                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"

                                                >

                                                    Edit

                                                </Link>


                                                <button

                                                    onClick={() =>

                                                        handleDelete(

                                                            product.id

                                                        )

                                                    }

                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"

                                                >

                                                    Delete

                                                </button>


                                            </div>


                                        </td>


                                    </tr>

                                );

                            }

                        )}


                    </tbody>


                </table>


            </div>


        </div>

    );

}


export default AdminProducts;