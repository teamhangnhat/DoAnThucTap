import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {

    createAdminProduct

} from "../../../services/admin/adminProductService";


function AddProduct() {


    const navigate = useNavigate();


    const [form, setForm] = useState({

        product_name: "",

        description: "",

        price: "",

        category_id: "",

        image_url: "",

        brand: "DK Clothing",

        discount_percent: 0,

        is_featured: false

    });


    const [colors, setColors] = useState([]);


    const [sizes, setSizes] = useState([]);


    const [variants, setVariants] = useState([]);


    const [colorName, setColorName] = useState("");


    const [colorImage, setColorImage] = useState("");


    const [sizeName, setSizeName] = useState("");


    const [loading, setLoading] = useState(false);



    // =====================================================
    // FORM CHANGE
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


        if (!colorName.trim()) {

            return;

        }


        const newColor = {

            temp_id:

                Date.now(),

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
    // ADD SIZE
    // =====================================================

    const addSize = () => {


        if (!sizeName.trim()) {

            return;

        }


        const newSize = {

            temp_id:

                Date.now(),

            size:

                sizeName

        };


        setSizes([

            ...sizes,

            newSize

        ]);


        setSizeName("");

    };



    // =====================================================
    // CREATE VARIANT
    // =====================================================

    const addVariant = (

        colorTempId,

        sizeTempId

    ) => {


        const exists =

            variants.some(

                (variant) =>

                    variant.color_temp_id

                        === colorTempId &&

                    variant.size_temp_id

                        === sizeTempId

            );


        if (exists) {

            return;

        }


        setVariants([

            ...variants,

            {

                color_temp_id:

                    colorTempId,

                size_temp_id:

                    sizeTempId,

                stock: 0

            }

        ]);

    };



    // =====================================================
    // UPDATE STOCK
    // =====================================================

    const updateStock = (

        colorTempId,

        sizeTempId,

        value

    ) => {


        setVariants(

            variants.map(

                (variant) => {


                    if (

                        variant.color_temp_id

                            === colorTempId &&

                        variant.size_temp_id

                            === sizeTempId

                    ) {


                        return {

                            ...variant,

                            stock:

                                Number(value)

                        };

                    }


                    return variant;

                }

            )

        );

    };



    // =====================================================
    // CREATE PRODUCT
    // =====================================================

    const handleSubmit = async (e) => {


        e.preventDefault();


        try {


            setLoading(true);


            const finalVariants = [];


            colors.forEach(

                (color) => {


                    sizes.forEach(

                        (size) => {


                            const existing =

                                variants.find(

                                    (variant) =>

                                        variant.color_temp_id

                                            === color.temp_id &&

                                        variant.size_temp_id

                                            === size.temp_id

                                );


                            finalVariants.push({

                                color_temp_id:

                                    color.temp_id,

                                size_temp_id:

                                    size.temp_id,

                                stock:

                                    existing

                                        ? existing.stock

                                        : 0

                            });

                        }

                    );

                }

            );


            await createAdminProduct({

                ...form,

                price:

                    Number(form.price),

                category_id:

                    Number(form.category_id),

                discount_percent:

                    Number(

                        form.discount_percent

                    ),

                colors,

                sizes,

                variants:

                    finalVariants

            });


            alert(

                "Product created successfully"

            );


            navigate(

                "/admin/products"

            );

        }

        catch (error) {

            console.error(

                error

            );


            alert(

                error.response?.data?.message

                    || "Failed to create product"

            );

        }

        finally {

            setLoading(false);

        }

    };



    return (

        <div className="min-h-screen bg-gray-100 p-8">


            <h1 className="text-3xl font-bold mb-8">

                Add Product

            </h1>



            <form

                onSubmit={handleSubmit}

                className="space-y-8"

            >


                {/* BASIC INFORMATION */}

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

                            placeholder="/uploads/products/..."

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

                            className="border p-3 rounded-lg col-span-2"

                            rows="4"

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



                {/* COLORS */}

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

                            onClick={addColor}

                            className="bg-black text-white px-5 rounded-lg"

                        >

                            Add Color

                        </button>


                    </div>


                    <div className="flex gap-3 mt-5">


                        {colors.map(

                            (color) => (


                                <div

                                    key={

                                        color.temp_id

                                    }

                                    className="border px-4 py-2 rounded-lg"

                                >

                                    {

                                        color.color_name

                                    }

                                </div>

                            )

                        )}


                    </div>


                </div>



                {/* SIZES */}

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


                    <div className="flex gap-3 mt-5">


                        {sizes.map(

                            (size) => (


                                <div

                                    key={

                                        size.temp_id

                                    }

                                    className="border px-4 py-2 rounded-lg"

                                >

                                    {

                                        size.size

                                    }

                                </div>

                            )

                        )}


                    </div>


                </div>



                {/* STOCK */}

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

                                                            item.color_temp_id

                                                                === color.temp_id &&

                                                            item.size_temp_id

                                                                === size.temp_id

                                                    );


                                                return (

                                                    <div

                                                        key={

                                                            `${color.temp_id}-${size.temp_id}`

                                                        }

                                                        className="flex items-center gap-4"

                                                    >


                                                        <span className="w-32">

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

                                                                variant?.stock

                                                                    || 0

                                                            }

                                                            onChange={(e) =>

                                                                updateStock(

                                                                    color.temp_id,

                                                                    size.temp_id,

                                                                    e.target.value

                                                                )

                                                            }

                                                            className="border p-3 rounded-lg"

                                                        />


                                                    </div>

                                                );

                                            }

                                        )

                                )}


                            </div>


                        </div>

                    )

                }



                {/* SUBMIT */}

                <div className="flex gap-4">


                    <button

                        type="submit"

                        disabled={loading}

                        className="bg-black text-white px-8 py-4 rounded-lg"

                    >

                        {loading

                            ? "Creating..."

                            : "Create Product"

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


export default AddProduct;