import {

    useEffect,

    useState

} from "react";


import {

    useNavigate

} from "react-router-dom";


import {

    Plus,

    Pencil,

    Trash2,

    CalendarDays,

    Percent,

    Clock,

    Power

} from "lucide-react";


import {

    getFlashSales,

    deleteFlashSale,

    toggleFlashSale

} from "../../../services/admin/adminFlashSaleService";


function AdminFlashSales() {


    const navigate = useNavigate();


    const [

        flashSales,

        setFlashSales

    ] = useState([]);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        error,

        setError

    ] = useState("");



    // =====================================================
    // LOAD
    // =====================================================

    useEffect(() => {

        loadFlashSales();

    }, []);



    const loadFlashSales = async () => {

        try {

            setLoading(true);

            setError("");


            const response =

                await getFlashSales();


            setFlashSales(

                response.data

            );

        }

        catch (error) {

            console.error(

                "Load flash sales error:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Failed to load flash sales"

            );

        }

        finally {

            setLoading(false);

        }

    };



    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {


        const confirmed =

            window.confirm(

                "Are you sure you want to delete this flash sale?"

            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteFlashSale(id);


            setFlashSales(

                (previousSales) =>

                    previousSales.filter(

                        (sale) =>

                            sale.id !== id

                    )

            );


            alert(

                "Flash sale deleted successfully"

            );

        }

        catch (error) {

            console.error(

                "Delete flash sale error:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to delete flash sale"

            );

        }

    };



    // =====================================================
    // TOGGLE
    // =====================================================

    const handleToggle = async (id) => {

        try {

            await toggleFlashSale(id);


            // Load lại từ database
            // để đảm bảo status chính xác

            await loadFlashSales();


        }

        catch (error) {

            console.error(

                "Toggle flash sale error:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to update status"

            );

        }

    };



    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {


        if (!date) {

            return "N/A";

        }


        return new Date(

            date

        ).toLocaleString(

            "en-US",

            {

                year: "numeric",

                month: "short",

                day: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }

        );

    };



    // =====================================================
    // GET STATUS
    // =====================================================

    const getStatus = (sale) => {


        const now =

            new Date();


        const startTime =

            new Date(

                sale.start_time

            );


        const endTime =

            new Date(

                sale.end_time

            );


        if (

            !sale.is_active

        ) {

            return {

                text: "Inactive",

                className:

                    "bg-gray-100 text-gray-600"

            };

        }


        if (

            now < startTime

        ) {

            return {

                text: "Upcoming",

                className:

                    "bg-yellow-100 text-yellow-700"

            };

        }


        if (

            now > endTime

        ) {

            return {

                text: "Expired",

                className:

                    "bg-red-100 text-red-700"

            };

        }


        return {

            text: "Active",

            className:

                "bg-green-100 text-green-700"

        };

    };



    // =====================================================
    // LOADING
    // =====================================================

    if (

        loading

    ) {

        return (

            <div className="p-8">

                <p className="text-gray-500">

                    Loading flash sales...

                </p>

            </div>

        );

    }



    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="p-8">


            {/* HEADER */}

            <div className="flex items-center justify-between mb-8">


                <div>

                    <h1 className="text-3xl font-bold">

                        Flash Sales

                    </h1>


                    <p className="text-gray-500 mt-1">

                        Manage promotional sale events

                    </p>

                </div>



                <button

                    onClick={() =>

                        navigate(

                            "/admin/flash-sales/add"

                        )

                    }

                    className="bg-black text-white px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"

                >

                    <Plus size={18} />

                    Add Flash Sale

                </button>


            </div>



            {/* ERROR */}

            {error && (

                <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg">

                    {error}

                </div>

            )}



            {/* EMPTY */}

            {flashSales.length === 0 ? (

                <div className="bg-white rounded-xl shadow p-12 text-center">

                    <p className="text-gray-500 mb-5">

                        No flash sales found.

                    </p>


                    <button

                        onClick={() =>

                            navigate(

                                "/admin/flash-sales/add"

                            )

                        }

                        className="bg-black text-white px-5 py-3 rounded-lg"

                    >

                        Create First Flash Sale

                    </button>

                </div>

            ) : (

                <div className="bg-white rounded-xl shadow overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">


                            <thead className="bg-gray-50 border-b">

                                <tr>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">

                                        Sale Event

                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">

                                        Discount

                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">

                                        Start Time

                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">

                                        End Time

                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">

                                        Status

                                    </th>

                                    <th className="text-right px-6 py-4 text-sm font-semibold">

                                        Actions

                                    </th>

                                </tr>

                            </thead>



                            <tbody className="divide-y">


                                {flashSales.map(

                                    (sale) => {


                                        const status =

                                            getStatus(

                                                sale

                                            );


                                        return (

                                            <tr

                                                key={

                                                    sale.id

                                                }

                                                className="hover:bg-gray-50"

                                            >


                                                {/* SALE */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-4">


                                                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">


                                                            {sale.image_url ? (

                                                                <img

                                                                    src={

                                                                        sale.image_url.startsWith(

                                                                            "http"

                                                                        )

                                                                            ? sale.image_url

                                                                            : `http://localhost:5000/${sale.image_url}`

                                                                    }

                                                                    alt={

                                                                        sale.title

                                                                    }

                                                                    className="w-full h-full object-cover"

                                                                />

                                                            ) : (

                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">

                                                                    No Image

                                                                </div>

                                                            )}

                                                        </div>


                                                        <div>

                                                            <p className="font-bold">

                                                                {

                                                                    sale.title

                                                                }

                                                            </p>


                                                            <p className="text-sm text-gray-500">

                                                                {

                                                                    sale.description

                                                                }

                                                            </p>

                                                        </div>


                                                    </div>

                                                </td>



                                                {/* DISCOUNT */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2 text-red-600 font-bold">

                                                        <Percent size={16} />

                                                        {

                                                            sale.discount_percent

                                                        }% OFF

                                                    </div>

                                                </td>



                                                {/* START */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2 text-sm text-gray-600">

                                                        <CalendarDays size={16} />

                                                        {

                                                            formatDate(

                                                                sale.start_time

                                                            )

                                                        }

                                                    </div>

                                                </td>



                                                {/* END */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2 text-sm text-gray-600">

                                                        <Clock size={16} />

                                                        {

                                                            formatDate(

                                                                sale.end_time

                                                            )

                                                        }

                                                    </div>

                                                </td>



                                                {/* STATUS */}

                                                <td className="px-6 py-5">

                                                    <button

                                                        onClick={() =>

                                                            handleToggle(

                                                                sale.id

                                                            )

                                                        }

                                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${

                                                            status.className

                                                        }`}

                                                        title="Toggle sale status"

                                                    >

                                                        <Power size={14} />

                                                        {

                                                            status.text

                                                        }

                                                    </button>

                                                </td>



                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center justify-end gap-2">


                                                        <button

                                                            onClick={() =>

                                                                navigate(

                                                                    `/admin/flash-sales/edit/${sale.id}`

                                                                )

                                                            }

                                                            className="p-2 border rounded-lg hover:bg-gray-100 transition"

                                                            title="Edit Flash Sale"

                                                        >

                                                            <Pencil size={17} />

                                                        </button>


                                                        <button

                                                            onClick={() =>

                                                                handleDelete(

                                                                    sale.id

                                                                )

                                                            }

                                                            className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"

                                                            title="Delete Flash Sale"

                                                        >

                                                            <Trash2 size={17} />

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

            )}

        </div>

    );

}


export default AdminFlashSales;