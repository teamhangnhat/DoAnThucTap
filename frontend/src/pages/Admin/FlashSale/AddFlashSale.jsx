import {

    useState

} from "react";


import {

    useNavigate

} from "react-router-dom";


import {

    ImagePlus,

    Upload,

    ArrowLeft

} from "lucide-react";


import {

    createFlashSale

} from "../../../services/admin/adminFlashSaleService";


function AddFlashSale() {


    const navigate = useNavigate();


    const [

        formData,

        setFormData

    ] = useState({

        title: "",

        description: "",

        discount_percent: "",

        start_time: "",

        end_time: "",

        button_text:

            "VIEW ALL SALE PRODUCTS",

        is_active: false

    });


    const [

        imageFile,

        setImageFile

    ] = useState(null);


    const [

        imagePreview,

        setImagePreview

    ] = useState("");


    const [

        loading,

        setLoading

    ] = useState(false);


    const handleChange = (event) => {

        const {

            name,

            value,

            type,

            checked

        } = event.target;


        setFormData({

            ...formData,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        });

    };


    const handleImageChange = (

        event

    ) => {

        const file =

            event.target.files[0];


        if (!file) {

            return;

        }


        setImageFile(file);


        const previewUrl =

            URL.createObjectURL(

                file

            );


        setImagePreview(

            previewUrl

        );

    };


    const uploadImage = async () => {

        const data = new FormData();


        data.append(

            "image",

            imageFile

        );


        const response = await fetch(

            "http://localhost:5000/api/upload/sale",

            {

                method: "POST",

                body: data

            }

        );


        if (!response.ok) {

            throw new Error(

                "Image upload failed"

            );

        }


        return response.json();

    };


    const handleSubmit = async (

        event

    ) => {

        event.preventDefault();


        try {

            setLoading(true);


            let imageUrl = "";


            if (

                imageFile

            ) {

                const uploadResult =

                    await uploadImage();


                imageUrl =

                    uploadResult.image_url;

            }


            await createFlashSale({

                ...formData,

                image_url: imageUrl,

                discount_percent:

                    Number(

                        formData.discount_percent

                    )

            });


            alert(

                "Flash sale created successfully"

            );


            navigate(

                "/admin/flash-sales"

            );

        }

        catch (error) {

            console.error(

                error

            );


            alert(

                error.response?.data?.message ||

                error.message ||

                "Failed to create flash sale"

            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="p-8 max-w-4xl">


            <button

                onClick={() =>

                    navigate(

                        "/admin/flash-sales"

                    )

                }

                className="flex items-center gap-2 text-gray-500 mb-6"

            >

                <ArrowLeft size={18} />

                Back to Flash Sales

            </button>


            <h1 className="text-3xl font-bold mb-8">

                Add Flash Sale

            </h1>


            <form

                onSubmit={handleSubmit}

                className="bg-white rounded-xl shadow p-8 space-y-6"

            >


                {/* IMAGE */}

                <div>

                    <label className="block font-semibold mb-2">

                        Sale Banner

                    </label>


                    <label

                        htmlFor="sale-image"

                        className="block cursor-pointer"

                    >

                        {imagePreview ? (

                            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">

                                <img

                                    src={imagePreview}

                                    alt="Preview"

                                    className="w-full h-full object-cover"

                                />

                            </div>

                        ) : (

                            <div className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50">

                                <ImagePlus

                                    size={42}

                                />

                                <p className="mt-3">

                                    Click to choose image

                                </p>

                            </div>

                        )}

                    </label>


                    <input

                        id="sale-image"

                        type="file"

                        accept="image/*"

                        onChange={

                            handleImageChange

                        }

                        className="hidden"

                    />

                </div>


                {/* TITLE */}

                <div>

                    <label className="block font-semibold mb-2">

                        Title

                    </label>


                    <input

                        name="title"

                        value={

                            formData.title

                        }

                        onChange={

                            handleChange

                        }

                        required

                        className="w-full border rounded-lg p-3"

                        placeholder="SUMMER SALE"

                    />

                </div>


                {/* DESCRIPTION */}

                <div>

                    <label className="block font-semibold mb-2">

                        Description

                    </label>


                    <textarea

                        name="description"

                        value={

                            formData.description

                        }

                        onChange={

                            handleChange

                        }

                        rows="4"

                        className="w-full border rounded-lg p-3"

                        placeholder="Premium Collection - Up to 70% OFF"

                    />

                </div>


                <div className="grid grid-cols-2 gap-5">


                    {/* DISCOUNT */}

                    <div>

                        <label className="block font-semibold mb-2">

                            Discount (%)

                        </label>


                        <input

                            type="number"

                            name="discount_percent"

                            value={

                                formData.discount_percent

                            }

                            onChange={

                                handleChange

                            }

                            min="1"

                            max="100"

                            required

                            className="w-full border rounded-lg p-3"

                        />

                    </div>


                    {/* BUTTON */}

                    <div>

                        <label className="block font-semibold mb-2">

                            Button Text

                        </label>


                        <input

                            name="button_text"

                            value={

                                formData.button_text

                            }

                            onChange={

                                handleChange

                            }

                            className="w-full border rounded-lg p-3"

                        />

                    </div>


                </div>


                <div className="grid grid-cols-2 gap-5">


                    <div>

                        <label className="block font-semibold mb-2">

                            Start Time

                        </label>


                        <input

                            type="datetime-local"

                            name="start_time"

                            value={

                                formData.start_time

                            }

                            onChange={

                                handleChange

                            }

                            required

                            className="w-full border rounded-lg p-3"

                        />

                    </div>


                    <div>

                        <label className="block font-semibold mb-2">

                            End Time

                        </label>


                        <input

                            type="datetime-local"

                            name="end_time"

                            value={

                                formData.end_time

                            }

                            onChange={

                                handleChange

                            }

                            required

                            className="w-full border rounded-lg p-3"

                        />

                    </div>


                </div>


                {/* ACTIVE */}

                <label className="flex items-center gap-3">

                    <input

                        type="checkbox"

                        name="is_active"

                        checked={

                            formData.is_active

                        }

                        onChange={

                            handleChange

                        }

                        className="w-5 h-5"

                    />

                    <span>

                        Activate this flash sale

                    </span>

                </label>


                <button

                    type="submit"

                    disabled={loading}

                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"

                >

                    <Upload size={18} />

                    {loading

                        ? "Creating..."

                        : "Create Flash Sale"}

                </button>


            </form>


        </div>

    );

}


export default AddFlashSale;