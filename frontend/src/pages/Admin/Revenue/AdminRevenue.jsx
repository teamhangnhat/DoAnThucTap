import {
    useEffect,
    useState
} from "react";

import {
    DollarSign,
    CalendarDays,
    TrendingUp
} from "lucide-react";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import {
    getRevenueSummary,
    getRevenueByDay,
    getRevenueByMonth
} from "../../../services/admin/adminRevenueService";


function AdminRevenue() {


    const [summary, setSummary] = useState({

        total_orders: 0,

        total_revenue: 0,

        average_order_value: 0

    });


    const [daily, setDaily] = useState([]);


    const [monthly, setMonthly] = useState([]);


    const [loading, setLoading] = useState(true);


    const [error, setError] = useState("");



    useEffect(() => {

        loadData();

    }, []);



    const loadData = async () => {

        try {

            setLoading(true);


            const summaryRes =
                await getRevenueSummary();


            const dailyRes =
                await getRevenueByDay();


            const monthlyRes =
                await getRevenueByMonth();


            setSummary(

                summaryRes.data

            );


            setDaily(

                dailyRes.data.map(

                    item => ({

                        date: formatDate(

                            item.revenue_date

                        ),

                        revenue: Number(

                            item.revenue

                        )

                    })

                )

            );


            setMonthly(

                monthlyRes.data.map(

                    item => ({

                        month: formatMonth(

                            item.revenue_year,

                            item.revenue_month

                        ),

                        revenue: Number(

                            item.revenue

                        )

                    })

                )

            );

        }

        catch (error) {

            console.error(

                "REVENUE ERROR:",

                error

            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Failed to load revenue"

            );

        }

        finally {

            setLoading(false);

        }

    };



    const formatDate = (

        date

    ) => {

        if (!date) {

            return "";

        }


        return new Date(

            date

        ).toLocaleDateString(

            "en-US",

            {

                month: "short",

                day: "numeric"

            }

        );

    };



    const formatMonth = (

        year,

        month

    ) => {

        return new Date(

            year,

            month - 1

        ).toLocaleDateString(

            "en-US",

            {

                month: "short",

                year: "numeric"

            }

        );

    };



    const formatMoney = (

        value

    ) => {

        return Number(

            value || 0

        ).toLocaleString(

            "vi-VN"

        ) + " ₫";

    };



    if (

        loading

    ) {

        return (

            <div className="p-8">

                <p className="text-gray-500">

                    Loading revenue...

                </p>

            </div>

        );

    }



    return (

        <div className="p-8">


            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">

                    Revenue

                </h1>


                <p className="text-gray-500 mt-1">

                    Analyze your store's revenue performance

                </p>

            </div>



            {error && (

                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">

                    {error}

                </div>

            )}



            {/* SUMMARY */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


                {/* AOV */}

                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex items-center justify-between">


                        <div>

                            <p className="text-gray-500 text-sm">

                                Average Order Value

                            </p>


                            <h2 className="text-2xl font-bold mt-2">

                                {formatMoney(

                                    summary.average_order_value

                                )}

                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">

                            <DollarSign size={24} />

                        </div>

                    </div>

                </div>



                {/* ORDERS */}

                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex items-center justify-between">


                        <div>

                            <p className="text-gray-500 text-sm">

                                Completed Orders

                            </p>


                            <h2 className="text-2xl font-bold mt-2">

                                {summary.total_orders}

                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">

                            <CalendarDays size={24} />

                        </div>

                    </div>

                </div>



                {/* TOTAL REVENUE */}

                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex items-center justify-between">


                        <div>

                            <p className="text-gray-500 text-sm">

                                Total Revenue

                            </p>


                            <h2 className="text-2xl font-bold mt-2">

                                {formatMoney(

                                    summary.total_revenue

                                )}

                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">

                            <TrendingUp size={24} />

                        </div>

                    </div>

                </div>


            </div>



            {/* REVENUE BY DAY */}

            <div className="bg-white rounded-xl shadow p-6 mb-8">


                <h2 className="text-xl font-bold mb-1">

                    Revenue by Day

                </h2>


                <p className="text-gray-500 text-sm mb-6">

                    Daily revenue from completed orders

                </p>


                <div className="w-full h-96">


                    <ResponsiveContainer

                        width="100%"

                        height="100%"

                    >

                        <LineChart

                            data={daily}

                        >

                            <CartesianGrid

                                strokeDasharray="3 3"

                            />


                            <XAxis

                                dataKey="date"

                            />


                            <YAxis

                                tickFormatter={

                                    value =>

                                        `${(

                                            value / 1000000

                                        ).toFixed(1)}M`

                                }

                            />


                            <Tooltip

                                formatter={

                                    value =>

                                        formatMoney(

                                            value

                                        )

                                }

                            />


                            <Line

                                type="monotone"

                                dataKey="revenue"

                                stroke="#000"

                                strokeWidth={3}

                                dot={{

                                    r: 5

                                }}

                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>



            {/* REVENUE BY MONTH */}

            <div className="bg-white rounded-xl shadow p-6">


                <h2 className="text-xl font-bold mb-1">

                    Revenue by Month

                </h2>


                <p className="text-gray-500 text-sm mb-6">

                    Monthly revenue from completed orders

                </p>


                <div className="w-full h-96">


                    <ResponsiveContainer

                        width="100%"

                        height="100%"

                    >

                        <BarChart

                            data={monthly}

                        >

                            <CartesianGrid

                                strokeDasharray="3 3"

                            />


                            <XAxis

                                dataKey="month"

                            />


                            <YAxis

                                tickFormatter={

                                    value =>

                                        `${(

                                            value / 1000000

                                        ).toFixed(1)}M`

                                }

                            />


                            <Tooltip

                                formatter={

                                    value =>

                                        formatMoney(

                                            value

                                        )

                                }

                            />


                            <Bar

                                dataKey="revenue"

                                fill="#000"

                                radius={[

                                    8,

                                    8,

                                    0,

                                    0

                                ]}

                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


        </div>

    );

}


export default AdminRevenue;