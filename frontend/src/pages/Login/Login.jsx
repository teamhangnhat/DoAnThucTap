import {
    useState
} from "react";


import {
    Link,
    useNavigate
} from "react-router-dom";


import axios from "axios";


function Login() {

    const navigate = useNavigate();


    const [
        email,
        setEmail
    ] = useState("");


    const [
        password,
        setPassword
    ] = useState("");


    const [
        error,
        setError
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);


        try {

            const response = await axios.post(

                "http://localhost:5000/api/auth/login",

                {
                    email: email.trim(),
                    password
                }

            );


            const data = response.data;


            // =================================================
            // SAVE JWT TOKEN
            // =================================================

            localStorage.setItem(

                "token",

                data.token

            );


            // =================================================
            // SAVE CURRENT USER
            // =================================================

            localStorage.setItem(

                "user",

                JSON.stringify(data.user)

            );


   
            // =================================================
            // GET ROLE AND DEPARTMENT
            // =================================================

            const role = String(data.user?.role || "")
                .trim()
                .toUpperCase();

            const department = String(data.user?.department || "")
                .trim()
                .toUpperCase();

            // ADMIN
            if (role === "ADMIN") {
                navigate("/admin", { replace: true });
                return;
            }

            // MANAGEMENT
            if (
                role === "MANAGEMENT" ||
                department === "MANAGEMENT"
            ) {
                navigate("/management", { replace: true });
                return;
            }

            // SALES
            if (
                role === "EMPLOYEE" &&
                department === "SALES"
            ) {
                navigate("/employee", { replace: true });
                return;
            }

            // CUSTOMER SERVICE
            if (
                role === "EMPLOYEE" &&
                [
                    "CUSTOMER SERVICE",
                    "CUSTOMER SUPPORT",
                    "CSKH"
                ].includes(department)
            ) {
                navigate("/employee", { replace: true });
                return;
            }

            // OTHER EMPLOYEES
            if (role === "EMPLOYEE") {
                navigate("/employee", { replace: true });
                return;
            }

            // CUSTOMER
            if (role === "CUSTOMER") {
                navigate("/", { replace: true });
                return;
            }

            // INVALID ROLE
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setError("Your account has not been assigned a valid role.");
        }


        catch (error) {

            console.error(

                "Login error:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Email hoặc mật khẩu không chính xác"

            );

        }


        finally {

            setLoading(false);

        }

    };


    return (

        <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-6 py-16">


            <div className="w-full max-w-md bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">


                {/* TITLE */}

                <div className="text-center mb-8">


                    <h1 className="text-4xl font-bold">

                        Welcome Back

                    </h1>


                    <p className="text-gray-500 mt-3">

                        Sign in to continue shopping

                    </p>


                </div>


                {/* ERROR */}

                {error && (

                    <div className="mb-5 rounded-xl bg-red-50 text-red-600 px-4 py-3 text-sm">

                        {error}

                    </div>

                )}


                {/* FORM */}

                <form

                    onSubmit={handleLogin}

                    className="space-y-5"

                >


                    {/* EMAIL */}

                    <div>


                        <label className="block text-sm font-semibold mb-2">

                            Email

                        </label>


                        <input

                            type="email"

                            value={email}

                            onChange={(event) =>

                                setEmail(

                                    event.target.value

                                )

                            }

                            placeholder="Enter your email"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"

                        />

                    </div>


                    {/* PASSWORD */}

                    <div>


                        <label className="block text-sm font-semibold mb-2">

                            Password

                        </label>


                        <input

                            type="password"

                            value={password}

                            onChange={(event) =>

                                setPassword(

                                    event.target.value

                                )

                            }

                            placeholder="Enter your password"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"

                        />

                    </div>


                    {/* LOGIN BUTTON */}

                    <button

                        type="submit"

                        disabled={loading}

                        className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition disabled:opacity-50"

                    >

                        {loading

                            ? "LOGGING IN..."

                            : "LOGIN"

                        }

                    </button>


                </form>


                {/* REGISTER */}

                <div className="text-center mt-8 text-sm text-gray-500">


                    Don't have an account?


                    <Link

                        to="/register"

                        className="ml-2 font-bold text-black hover:underline"

                    >

                        Register

                    </Link>


                </div>


            </div>


        </main>

    );

}


export default Login;