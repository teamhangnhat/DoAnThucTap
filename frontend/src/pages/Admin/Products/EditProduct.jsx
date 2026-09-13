import {
    useEffect,
    useState
} from "react";


import {
    useNavigate,
    useParams
} from "react-router-dom";


import {

    getAdminProductById,

    updateAdminProduct

} from "../../../services/admin/adminProductService";



function EditProduct() {


    const { id } = useParams();


    const navigate = useNavigate();



    // =====================================================
    // BASIC FORM
    // =====================================================

    const [

        form,

        setForm

    ] = useState({

        product_name: "",

        description: "",

        price: "",

        category_id: "",

        image_url: "",

        brand: "",

        discount_percent: 0,

        is_featured: false

    });



    // =====================================================
    // COLORS
    // =====================================================

    const [

        colors,

        setColors

    ] = useState([]);



    // =====================================================
    // SIZES
    // =====================================================

    const [

        sizes,

        setSizes

    ] = useState([]);



    // =====================================================
    // VARIANTS
    // =====================================================

    const [

        variants,

        setVariants

    ] = useState([]);



    // =====================================================
    // INPUT STATES
    // =====================================================

    const [

        colorName,

        setColorName

    ] = useState("");



    const [

        colorImage,

        setColorImage

    ] = useState("");



    const [

        sizeName,

        setSizeName

    ] = useState("");



    // =====================================================
    // LOADING
    // =====================================================

    const [

        loading,

        setLoading

    ] = useState(true);



    const [

        saving,

        setSaving

    ] = useState(false);




    // =====================================================
    // LOAD PRODUCT
    // =====================================================

    useEffect(() => {


        const loadProduct = async () => {


            try {


                const response =

                    await getAdminProductById(

                        id

                    );



                const data =

                    response.data;



                const product =

                    data.product;



                // =================================================
                // LOAD BASIC PRODUCT
                // =================================================

                setForm({

                    product_name:

                        product.product_name || "",

                    description:

                        product.description || "",

                    price:

                        product.price || "",

                    category_id:

                        product.category_id || "",

                    image_url:

                        product.image_url || "",

                    brand:

                        product.brand || "",

                    discount_percent:

                        product.discount_percent || 0,

                    is_featured:

                        Boolean(

                            product.is_featured

                        )

                });



                // =================================================
                // LOAD COLORS
                // =================================================

                const loadedColors =

                    data.colors.map(

                        (color) => ({

                            temp_id:

                                `color-${color.id}`,

                            original_id:

                                color.id,

                            color_name:

                                color.color_name,

                            image_url:

                                color.image_url || ""

                        })

                    );



                // =================================================
                // LOAD SIZES
                // =================================================

                const loadedSizes =

                    data.sizes.map(

                        (size) => ({

                            temp_id:

                                `size-${size.id}`,

                            original_id:

                                size.id,

                            size:

                                size.size

                        })

                    );



                // =================================================
                // LOAD EXISTING VARIANTS
                // =================================================

                const loadedVariants = [];



                data.variants.forEach(

                    (variant) => {


                        loadedVariants.push({

                            color_temp_id:

                                `color-${variant.color_id}`,

                            size_temp_id:

                                `size-${variant.size_id}`,

                            stock:

                                Number(

                                    variant.stock

                                ) || 0

                        });


                    }

                );



                // =================================================
                // CREATE MISSING VARIANTS
                // =================================================
                // Nếu product có Color + Size
                // nhưng chưa có variant trong database
                // thì tạo variant tạm stock = 0
                //
                // Nhờ vậy product stock = 0
                // vẫn hiện bảng Stock
                // =================================================

                loadedColors.forEach(

                    (color) => {


                        loadedSizes.forEach(

                            (size) => {


                                const exists =

                                    loadedVariants.some(

                                        (variant) =>

                                            variant.color_temp_id ===

                                                color.temp_id &&

                                            variant.size_temp_id ===

                                                size.temp_id

                                    );



                                if (!exists) {


                                    loadedVariants.push({

                                        color_temp_id:

                                            color.temp_id,

                                        size_temp_id:

                                            size.temp_id,

                                        stock: 0

                                    });


                                }


                            }

                        );


                    }

                );



                setColors(

                    loadedColors

                );



                setSizes(

                    loadedSizes

                );



                setVariants(

                    loadedVariants

                );


            }


            catch (error) {


                console.error(

                    "Load product error:",

                    error

                );



                alert(

                    "Failed to load product"

                );


            }


            finally {


                setLoading(false);


            }


        };



        loadProduct();


    }, [id]);




    // =====================================================
    // HANDLE FORM CHANGE
    // =====================================================

    const handleChange = (e) => {


        const {

            name,

            value,

            type,

            checked

        } = e.target;



        setForm({

            ...form,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        });


    };




    // =====================================================
    // ADD COLOR
    // =====================================================

    const addColor = () => {


        if (

            !colorName.trim()

        ) {

            return;

        }



        const newColor = {


            temp_id:

                `new-color-${Date.now()}`,



            color_name:

                colorName,



            image_url:

                colorImage

        };



        setColors([

            ...colors,

            newColor

        ]);



        setColorName("");

        setColorImage("");


    };




    // =====================================================
    // REMOVE COLOR
    // =====================================================

    const removeColor = (tempId) => {


        setColors(

            colors.filter(

                (color) =>

                    color.temp_id !==

                    tempId

            )

        );



        setVariants(

            variants.filter(

                (variant) =>

                    variant.color_temp_id !==

                    tempId

            )

        );


    };




    // =====================================================
    // ADD SIZE
    // =====================================================

    const addSize = () => {


        if (

            !sizeName.trim()

        ) {

            return;

        }



        const newSize = {


            temp_id:

                `new-size-${Date.now()}`,



            size:

                sizeName

        };



        // =================================================
        // THÊM SIZE MỚI
        // =================================================

        setSizes([

            ...sizes,

            newSize

        ]);



        // =================================================
        // TỰ ĐỘNG TẠO VARIANT CHO SIZE MỚI
        // VỚI TẤT CẢ COLOR HIỆN TẠI
        // STOCK MẶC ĐỊNH = 0
        // =================================================

        const newVariants = [

            ...variants

        ];



        colors.forEach(

            (color) => {


                newVariants.push({

                    color_temp_id:

                        color.temp_id,

                    size_temp_id:

                        newSize.temp_id,

                    stock: 0

                });


            }

        );



        setVariants(

            newVariants

        );



        setSizeName("");


    };




    // =====================================================
    // REMOVE SIZE
    // =====================================================

    const removeSize = (tempId) => {


        setSizes(

            sizes.filter(

                (size) =>

                    size.temp_id !==

                    tempId

            )

        );



        setVariants(

            variants.filter(

                (variant) =>

                    variant.size_temp_id !==

                    tempId

            )

        );


    };




    // =====================================================
    // ADD VARIANTS WHEN ADDING NEW COLOR
    // =====================================================

    const addColorWithVariants = () => {


        if (

            !colorName.trim()

        ) {

            return;

        }



        const newColor = {


            temp_id:

                `new-color-${Date.now()}`,



            color_name:

                colorName,



            image_url:

                colorImage

        };



        setColors([

            ...colors,

            newColor

        ]);



        // =================================================
        // TẠO STOCK CHO COLOR MỚI
        // VỚI TẤT CẢ SIZE HIỆN TẠI
        // =================================================

        const newVariants = [

            ...variants

        ];



        sizes.forEach(

            (size) => {


                newVariants.push({

                    color_temp_id:

                        newColor.temp_id,

                    size_temp_id:

                        size.temp_id,

                    stock: 0

                });


            }

        );



        setVariants(

            newVariants

        );



        setColorName("");

        setColorImage("");


    };




    // =====================================================
    // UPDATE STOCK
    // =====================================================

    const updateStock = (

        colorTempId,

        sizeTempId,

        value

    ) => {


        const stock =

            Number(value);



        setVariants(

            (previousVariants) => {


                const exists =

                    previousVariants.some(

                        (variant) =>

                            variant.color_temp_id ===

                                colorTempId &&

                            variant.size_temp_id ===

                                sizeTempId

                    );



                if (exists) {


                    return previousVariants.map(

                        (variant) => {


                            if (

                                variant.color_temp_id ===

                                    colorTempId &&

                                variant.size_temp_id ===

                                    sizeTempId

                            ) {


                                return {

                                    ...variant,

                                    stock

                                };


                            }



                            return variant;


                        }

                    );


                }



                return [

                    ...previousVariants,

                    {

                        color_temp_id:

                            colorTempId,

                        size_temp_id:

                            sizeTempId,

                        stock

                    }

                ];


            }

        );


    };




    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {


        e.preventDefault();



        try {


            setSaving(true);



            // =================================================
            // ĐẢM BẢO TẤT CẢ COLOR × SIZE ĐỀU CÓ VARIANT
            // =================================================

            const finalVariants = [];



            colors.forEach(

                (color) => {


                    sizes.forEach(

                        (size) => {


                            const existing =

                                variants.find(

                                    (variant) =>

                                        variant.color_temp_id ===

                                            color.temp_id &&

                                        variant.size_temp_id ===

                                            size.temp_id

                                );



                            finalVariants.push({

                                color_temp_id:

                                    color.temp_id,

                                size_temp_id:

                                    size.temp_id,

                                stock:

                                    existing

                                        ? Number(

                                            existing.stock

                                        ) || 0

                                        : 0

                            });


                        }

                    );


                }

            );



            // =================================================
            // UPDATE DATABASE
            // =================================================

            await updateAdminProduct(

                id,

                {

                    ...form,



                    price:

                        Number(

                            form.price

                        ),



                    category_id:

                        Number(

                            form.category_id

                        ),



                    discount_percent:

                        Number(

                            form.discount_percent

                        ),



                    colors,



                    sizes,



                    variants:

                        finalVariants

                }

            );



            alert(

                "Product updated successfully"

            );



            navigate(

                "/admin/products"

            );


        }


        catch (error) {


            console.error(

                "Update product error:",

                error

            );



            alert(

                error.response?.data?.message ||

                "Failed to update product"

            );


        }


        finally {


            setSaving(false);


        }


    };




    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {


        return (

            <div className="p-10">

                Loading product...

            </div>

        );


    }




    return (


        <div className="min-h-screen bg-gray-100 p-8">


            <h1 className="text-3xl font-bold mb-8">

                Edit Product

            </h1>



            <form

                onSubmit={handleSubmit}

                className="space-y-8"

            >



                {/* ================================================= */}
                {/* BASIC INFORMATION */}
                {/* ================================================= */}

                <div className="bg-white p-6 rounded-xl shadow">


                    <h2 className="text-xl font-bold mb-5">

                        Basic Information

                    </h2>



                    <div className="grid grid-cols-2 gap-5">


                        <input

                            name="product_name"

                            placeholder="Product name"

                            value={

                                form.product_name

                            }

                            onChange={

                                handleChange

                            }

                            required

                            className="border p-3 rounded-lg"

                        />



                        <input

                            name="brand"

                            placeholder="Brand"

                            value={

                                form.brand

                            }

                            onChange={

                                handleChange

                            }

                            className="border p-3 rounded-lg"

                        />



                        <input

                            name="price"

                            type="number"

                            placeholder="Price"

                            value={

                                form.price

                            }

                            onChange={

                                handleChange

                            }

                            required

                            className="border p-3 rounded-lg"

                        />



                        <input

                            name="category_id"

                            type="number"

                            placeholder="Category ID"

                            value={

                                form.category_id

                            }

                            onChange={

                                handleChange

                            }

                            required

                            className="border p-3 rounded-lg"

                        />



                        <input

                            name="image_url"

                            placeholder="Image URL"

                            value={

                                form.image_url

                            }

                            onChange={

                                handleChange

                            }

                            required

                            className="border p-3 rounded-lg col-span-2"

                        />



                        <textarea

                            name="description"

                            placeholder="Description"

                            value={

                                form.description

                            }

                            onChange={

                                handleChange

                            }

                            rows="4"

                            className="border p-3 rounded-lg col-span-2"

                        />



                    </div>



                    <label className="flex gap-3 mt-5">


                        <input

                            type="checkbox"

                            name="is_featured"

                            checked={

                                form.is_featured

                            }

                            onChange={

                                handleChange

                            }

                        />



                        Featured Product



                    </label>



                </div>




                {/* ================================================= */}
                {/* COLORS */}
                {/* ================================================= */}

                <div className="bg-white p-6 rounded-xl shadow">


                    <h2 className="text-xl font-bold mb-5">

                        Colors

                    </h2>



                    <div className="flex gap-3">


                        <input

                            placeholder="Color name"

                            value={

                                colorName

                            }

                            onChange={(e) =>

                                setColorName(

                                    e.target.value

                                )

                            }

                            className="border p-3 rounded-lg"

                        />



                        <input

                            placeholder="Color image URL"

                            value={

                                colorImage

                            }

                            onChange={(e) =>

                                setColorImage(

                                    e.target.value

                                )

                            }

                            className="border p-3 rounded-lg flex-1"

                        />



                        <button

                            type="button"

                            onClick={

                                addColorWithVariants

                            }

                            className="bg-black text-white px-5 rounded-lg"

                        >

                            Add Color

                        </button>


                    </div>



                    <div className="flex gap-3 mt-5 flex-wrap">


                        {colors.map(

                            (color) => (


                                <div

                                    key={

                                        color.temp_id

                                    }

                                    className="border px-4 py-2 rounded-lg flex gap-3 items-center"

                                >


                                    <span>

                                        {

                                            color.color_name

                                        }

                                    </span>



                                    <button

                                        type="button"

                                        onClick={() =>

                                            removeColor(

                                                color.temp_id

                                            )

                                        }

                                        className="text-red-600"

                                    >

                                        ×

                                    </button>


                                </div>


                            )

                        )}


                    </div>


                </div>




                {/* ================================================= */}
                {/* SIZES */}
                {/* ================================================= */}

                <div className="bg-white p-6 rounded-xl shadow">


                    <h2 className="text-xl font-bold mb-5">

                        Sizes

                    </h2>



                    <div className="flex gap-3">


                        <input

                            placeholder="Size e.g. S, M, L, XL"

                            value={

                                sizeName

                            }

                            onChange={(e) =>

                                setSizeName(

                                    e.target.value

                                )

                            }

                            className="border p-3 rounded-lg flex-1"

                        />



                        <button

                            type="button"

                            onClick={addSize}

                            className="bg-black text-white px-5 rounded-lg"

                        >

                            Add Size

                        </button>


                    </div>



                    <div className="flex gap-3 mt-5 flex-wrap">


                        {sizes.map(

                            (size) => (


                                <div

                                    key={

                                        size.temp_id

                                    }

                                    className="border px-4 py-2 rounded-lg flex gap-3 items-center"

                                >


                                    <span>

                                        {

                                            size.size

                                        }

                                    </span>



                                    <button

                                        type="button"

                                        onClick={() =>

                                            removeSize(

                                                size.temp_id

                                            )

                                        }

                                        className="text-red-600"

                                    >

                                        ×

                                    </button>


                                </div>


                            )

                        )}


                    </div>


                </div>




                {/* ================================================= */}
                {/* VARIANT STOCK */}
                {/* ================================================= */}

                {colors.length > 0 &&

                    sizes.length > 0 && (


                        <div className="bg-white p-6 rounded-xl shadow">


                            <h2 className="text-xl font-bold mb-5">

                                Stock By Variant

                            </h2>



                            <div className="space-y-4">


                                {colors.map(

                                    (color) =>


                                        sizes.map(

                                            (size) => {


                                                const variant =

                                                    variants.find(

                                                        (item) =>

                                                            item.color_temp_id ===

                                                                color.temp_id &&

                                                            item.size_temp_id ===

                                                                size.temp_id

                                                    );



                                                return (


                                                    <div

                                                        key={

                                                            `${color.temp_id}-${size.temp_id}`

                                                        }

                                                        className="flex items-center gap-4"

                                                    >


                                                        <span className="w-32 font-semibold">

                                                            {

                                                                color.color_name

                                                            }

                                                        </span>



                                                        <span className="w-20">

                                                            {

                                                                size.size

                                                            }

                                                        </span>



                                                        <input

                                                            type="number"

                                                            min="0"

                                                            value={

                                                                variant?.stock ?? 0

                                                            }

                                                            onChange={(e) =>

                                                                updateStock(

                                                                    color.temp_id,

                                                                    size.temp_id,

                                                                    e.target.value

                                                                )

                                                            }

                                                            className="border p-3 rounded-lg w-32"

                                                        />


                                                    </div>


                                                );


                                            }

                                        )

                                )}


                            </div>


                        </div>


                    )}




                {/* ================================================= */}
                {/* BUTTONS */}
                {/* ================================================= */}

                <div className="flex gap-4">


                    <button

                        type="submit"

                        disabled={saving}

                        className="bg-black text-white px-8 py-4 rounded-lg"

                    >

                        {saving

                            ? "Saving..."

                            : "Save Changes"

                        }

                    </button>



                    <button

                        type="button"

                        onClick={() =>

                            navigate(

                                "/admin/products"

                            )

                        }

                        className="bg-gray-300 px-8 py-4 rounded-lg"

                    >

                        Cancel

                    </button>


                </div>


            </form>


        </div>

    );

}


export default EditProduct;