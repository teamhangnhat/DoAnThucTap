import {

    useEffect,

    useState

} from "react";


import {

    useNavigate,

    useParams

} from "react-router-dom";


import {

    ImagePlus,

    Upload,

    ArrowLeft

} from "lucide-react";


import {

    getFlashSaleById,

    updateFlashSale

} from "../../../services/admin/adminFlashSaleService";


// =====================================================
// API BASE URL
// =====================================================

const API_URL =

    "http://localhost:5000";


// =====================================================
// EDIT FLASH SALE
// =====================================================

function EditFlashSale() {


    const navigate =

        useNavigate();


    const {

        id

    } = useParams();


    // =====================================================
    // FORM DATA
    // =====================================================

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


    // =====================================================
    // IMAGE
    // =====================================================

    const [

        imageFile,

        setImageFile

    ] = useState(null);


    const [

        imagePreview,

        setImagePreview

    ] = useState("");


    const [

        currentImage,

        setCurrentImage

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


    const [

        error,

        setError

    ] = useState("");



    // =====================================================
    // FORMAT DATETIME LOCAL
    // =====================================================

    const formatDateTimeLocal = (

        date

    ) => {


        if (!date) {

            return "";

        }


        const d = new Date(date);


        const year =

            d.getFullYear();


        const month =

            String(

                d.getMonth() + 1

            ).padStart(

                2,

                "0"

            );


        const day =

            String(

                d.getDate()

            ).padStart(

                2,

                "0"

            );


        const hours =

            String(

                d.getHours()

            ).padStart(

                2,

                "0"

            );


        const minutes =

            String(

                d.getMinutes()

            ).padStart(

                2,

                "0"

            );


        return (

            `${year}-${month}-${day}` +

            `T${hours}:${minutes}`

        );

    };



    // =====================================================
    // LOAD FLASH SALE
    // =====================================================

    useEffect(() => {

        loadFlashSale();

    }, [id]);


    const loadFlashSale = async () => {


        try {


            setLoading(true);


            setError("");


            const response =

                await getFlashSaleById(id);


            const sale =

                response.data;


            setFormData({

                title:

                    sale.title || "",


                description:

                    sale.description || "",


                discount_percent:

                    sale.discount_percent || "",


                start_time:

                    formatDateTimeLocal(

                        sale.start_time

                    ),


                end_time:

                    formatDateTimeLocal(

                        sale.end_time

                    ),


                button_text:

                    sale.button_text ||

                    "VIEW ALL SALE PRODUCTS",


                is_active:

                    Boolean(

                        sale.is_active

                    )

            });


            setCurrentImage(

                sale.image_url || ""

            );

        }


        catch (error) {


            console.error(

                "Load flash sale error:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Failed to load flash sale"

            );

        }


        finally {


            setLoading(false);

        }

    };



    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (

        event

    ) => {


        const {

            name,

            value,

            type,

            checked

        } = event.target;


        setFormData(

            (previousData) => ({

                ...previousData,


                [name]:

                    type === "checkbox"

                        ? checked

                        : value

            })

        );

    };



    // =====================================================
    // HANDLE IMAGE CHANGE
    // =====================================================

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

            URL.createObjectURL(file);


        setImagePreview(

            previewUrl

        );

    };



    // =====================================================
    // UPLOAD IMAGE
    // =====================================================

    const uploadImage = async () => {


        const data =

            new FormData();


        data.append(

            "image",

            imageFile

        );


        const response =

            await fetch(

                `${API_URL}/api/upload/sale`,

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



    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (

        event

    ) => {


        event.preventDefault();


        try {


            setSaving(true);


            let imageUrl =

                currentImage;


            // =========================================
            // UPLOAD NEW IMAGE
            // =========================================

            if (imageFile) {


                const uploadResult =

                    await uploadImage();


                imageUrl =

                    uploadResult.image_url;

            }


            // =========================================
            // DATA UPDATE
            // =========================================

            const updateData = {


                title:

                    formData.title,


                description:

                    formData.description,


                image_url:

                    imageUrl,


                discount_percent:

                    Number(

                        formData.discount_percent

                    ),


                start_time:

                    formData.start_time,


                end_time:

                    formData.end_time,


                button_text:

                    formData.button_text,


                is_active:

                    formData.is_active

            };


            console.log(

                "UPDATE DATA:",

                updateData

            );


            await updateFlashSale(

                id,

                updateData

            );


            alert(

                "Flash sale updated successfully"

            );


            navigate(

                "/admin/flash-sales"

            );

        }


        catch (error) {


            console.error(

                "Update flash sale error:",

                error

            );


            alert(

                error.response?.data?.message ||

                error.message ||

                "Failed to update flash sale"

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

            <div className="p-8">


                <p className="text-gray-500">

                    Loading flash sale...

                </p>


            </div>

        );

    }



    // =====================================================
    // ERROR
    // =====================================================

    if (error) {


        return (

            <div className="p-8">


                <div className="bg-red-50 text-red-600 p-4 rounded-lg">

                    {error}

                </div>


            </div>

        );

    }



    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="p-8 max-w-4xl">


            {/* BACK */}

            <button

                onClick={() =>

                    navigate(

                        "/admin/flash-sales"

                    )

                }

                className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black"

            >

                <ArrowLeft size={18} />

                Back to Flash Sales

            </button>



            {/* TITLE */}

            <h1 className="text-3xl font-bold mb-8">

                Edit Flash Sale

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

                                    alt="New Preview"

                                    className="w-full h-full object-cover"

                                />


                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold opacity-0 hover:opacity-100 transition">

                                    Click to choose another image

                                </div>


                            </div>

                        ) : currentImage ? (


                            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">


                                <img

                                    src={

                                        currentImage.startsWith(

                                            "http"

                                        )

                                            ? currentImage

                                            : `${API_URL}/${currentImage}`

                                    }

                                    alt="Current Sale Banner"

                                    className="w-full h-full object-cover"

                                />


                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold opacity-0 hover:opacity-100 transition">

                                    Click to change image

                                </div>


                            </div>

                        ) : (


                            <div className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50">


                                <ImagePlus size={42} />


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


                    <p className="text-sm text-gray-500 mt-2">

                        Click the image to replace the current banner.

                    </p>


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

                    />

                </div>



                {/* DISCOUNT + BUTTON */}

                <div className="grid grid-cols-2 gap-5">


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



                {/* TIME */}

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



                {/* BUTTON */}

                <button

                    type="submit"

                    disabled={saving}

                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"

                >


                    <Upload size={18} />


                    {saving

                        ? "Updating..."

                        : "Update Flash Sale"}


                </button>


            </form>


        </div>

    );

}


export default EditFlashSale;