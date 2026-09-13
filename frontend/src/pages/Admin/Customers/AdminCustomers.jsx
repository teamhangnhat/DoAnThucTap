import {

    useEffect,
    useState

} from "react";


import {

    Search,
    Trash2,
    Lock,
    Unlock

} from "lucide-react";


import {

    getCustomers,
    updateCustomerStatus,
    deleteCustomer

} from "../../../services/admin/adminCustomerService";


function AdminCustomers() {


    const [

        customers,
        setCustomers

    ] = useState([]);


    const [

        search,
        setSearch

    ] = useState("");


    const [

        loading,
        setLoading

    ] = useState(true);


    // =================================================
    // LOAD CUSTOMERS
    // =================================================

    const loadCustomers = async () => {

        try {

            setLoading(true);

            const response =
                await getCustomers();

            setCustomers(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load customers:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadCustomers();

    }, []);


    // =================================================
    // BLOCK / UNBLOCK
    // =================================================

    const handleStatusChange = async (

        customer

    ) => {

        try {

            const newStatus =
                customer.status === "LOCKED"
                    ? "ACTIVE"
                    : "LOCKED";


            await updateCustomerStatus(

                customer.id,

                newStatus

            );


            setCustomers(

                customers.map(

                    item =>

                        item.id === customer.id

                            ? {

                                ...item,

                                status: newStatus

                            }

                            : item

                )

            );

        } catch (error) {

            console.error(

                "Failed to update status:",

                error

            );

            alert(

                error.response?.data?.message ||

                "Failed to update customer status"

            );

        }

    };


    // =================================================
    // DELETE
    // =================================================

    const handleDelete = async (

        customer

    ) => {

        const confirmed = window.confirm(

            `Delete customer ${customer.full_name}?`

        );


        if (!confirmed) {

            return;

        }


        try {

            await deleteCustomer(

                customer.id

            );


            setCustomers(

                customers.filter(

                    item =>

                        item.id !== customer.id

                )

            );


        } catch (error) {

            console.error(

                "Failed to delete customer:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to delete customer"

            );

        }

    };


    // =================================================
    // SEARCH
    // =================================================

    const filteredCustomers =

        customers.filter(

            customer => {

                const keyword =

                    search.toLowerCase();


                return (

                    customer.full_name

                        ?.toLowerCase()

                        .includes(keyword)

                    ||

                    customer.email

                        ?.toLowerCase()

                        .includes(keyword)

                    ||

                    customer.phone

                        ?.toLowerCase()

                        .includes(keyword)

                );

            }

        );


    return (

        <div className="p-6">


            {/* HEADER */}

            <div className="flex justify-between items-center mb-6">


                <div>

                    <h1 className="text-3xl font-bold">

                        Customer Management

                    </h1>


                    <p className="text-gray-500">

                        Manage customer accounts

                    </p>

                </div>


                <div className="bg-black text-white px-6 py-4 rounded-xl">

                    Total Customers:{" "}

                    {customers.length}

                </div>

            </div>


            {/* SEARCH */}

            <div className="bg-white p-4 rounded-xl mb-6">


                <div className="relative max-w-md">


                    <Search

                        size={18}

                        className="absolute left-3 top-3 text-gray-400"

                    />


                    <input

                        type="text"

                        placeholder="Search name, email or phone..."

                        value={search}

                        onChange={

                            e =>

                                setSearch(

                                    e.target.value

                                )

                        }

                        className="w-full border rounded-lg py-2 pl-10 pr-4"

                    />

                </div>

            </div>


            {/* TABLE */}

            <div className="bg-white rounded-xl overflow-hidden">


                <table className="w-full">


                    <thead className="bg-gray-100">


                        <tr>


                            <th className="p-4 text-left">

                                ID

                            </th>


                            <th className="p-4 text-left">

                                Customer

                            </th>


                            <th className="p-4 text-left">

                                Contact

                            </th>


                            <th className="p-4 text-left">

                                Address

                            </th>


                            <th className="p-4 text-left">

                                Status

                            </th>


                            <th className="p-4 text-left">

                                Joined

                            </th>


                            <th className="p-4 text-left">

                                Actions

                            </th>


                        </tr>


                    </thead>


                    <tbody>


                        {loading ? (

                            <tr>

                                <td

                                    colSpan="7"

                                    className="text-center p-8"

                                >

                                    Loading...

                                </td>

                            </tr>

                        ) : filteredCustomers.length === 0 ? (

                            <tr>

                                <td

                                    colSpan="7"

                                    className="text-center p-8"

                                >

                                    No customers found.

                                </td>

                            </tr>

                        ) : (

                            filteredCustomers.map(

                                customer => (

                                    <tr

                                        key={customer.id}

                                        className="border-t"

                                    >


                                        <td className="p-4">

                                            #{customer.id}

                                        </td>


                                        <td className="p-4">


                                            <div className="font-semibold">

                                                {customer.full_name}

                                            </div>


                                            <div className="text-sm text-gray-500">

                                                Customer

                                            </div>


                                        </td>


                                        <td className="p-4">


                                            <div>

                                                {customer.email}

                                            </div>


                                            <div className="text-sm text-gray-500">

                                                {customer.phone || "No phone"}

                                            </div>


                                        </td>


                                        <td className="p-4">

                                            {customer.address || "No address"}

                                        </td>


                                        <td className="p-4">


                                            <span

                                                className={`px-3 py-1 rounded-full text-sm font-medium

                                                ${

                                                    customer.status === "ACTIVE"

                                                        ? "bg-green-100 text-green-700"

                                                        : customer.status === "LOCKED"

                                                            ? "bg-red-100 text-red-700"

                                                            : "bg-gray-100 text-gray-700"

                                                }

                                                `}

                                            >

                                                {customer.status}

                                            </span>


                                        </td>


                                        <td className="p-4">

                                            {customer.created_at

                                                ? new Date(

                                                    customer.created_at

                                                ).toLocaleDateString(

                                                    "vi-VN"

                                                )

                                                : "-"

                                            }

                                        </td>


                                        <td className="p-4">


                                            <div className="flex gap-2">


                                                <button

                                                    onClick={() =>

                                                        handleStatusChange(

                                                            customer

                                                        )

                                                    }

                                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"

                                                    title={

                                                        customer.status === "LOCKED"

                                                            ? "Unblock"

                                                            : "Block"

                                                    }

                                                >


                                                    {customer.status === "LOCKED"

                                                        ? (

                                                            <Unlock size={18} />

                                                        )

                                                        : (

                                                            <Lock size={18} />

                                                        )

                                                    }

                                                </button>


                                                <button

                                                    onClick={() =>

                                                        handleDelete(

                                                            customer

                                                        )

                                                    }

                                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"

                                                    title="Delete"

                                                >

                                                    <Trash2 size={18} />

                                                </button>


                                            </div>


                                        </td>


                                    </tr>

                                )

                            )

                        )}

                    </tbody>


                </table>

            </div>


        </div>

    );

}


export default AdminCustomers;