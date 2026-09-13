import {

    useState

} from "react";


import {

    Link,

    useNavigate

} from "react-router-dom";


import axios from "axios";


function Register() {


    const navigate = useNavigate();


    const [

        fullName,

        setFullName

    ] = useState("");


    const [

        email,

        setEmail

    ] = useState("");


    const [

        phone,

        setPhone

    ] = useState("");


    const [

        address,

        setAddress

    ] = useState("");


    const [

        password,

        setPassword

    ] = useState("");


    const [

        confirmPassword,

        setConfirmPassword

    ] = useState("");


    const [

        error,

        setError

    ] = useState("");


    const [

        success,

        setSuccess

    ] = useState("");


    const [

        loading,

        setLoading

    ] = useState(false);


    // =====================================================
    // PASSWORD VALIDATION
    // =====================================================

    const isValidPassword =

        /^(?=.*[A-Z])(?=.*\d).{5,}$/

            .test(password);


    // =====================================================
    // HANDLE REGISTER
    // =====================================================

    const handleRegister = async (event) => {

        event.preventDefault();


        setError("");

        setSuccess("");


        // =============================================
        // CHECK PASSWORD
        // =============================================

        if (

            !isValidPassword

        ) {

            setError(

                "Password must be at least 5 characters long and contain at least 1 uppercase letter and 1 number."

            );

            return;

        }


        // =============================================
        // CHECK CONFIRM PASSWORD
        // =============================================

        if (

            password !== confirmPassword

        ) {

            setError(

                "Passwords do not match."

            );

            return;

        }


        try {

            setLoading(true);


            await axios.post(

                "http://localhost:5000/api/auth/register",

                {

                    full_name:

                        fullName,

                    email,

                    password,

                    phone,

                    address

                }

            );


            setSuccess(

                "Account created successfully. Redirecting to login..."

            );


            setTimeout(() => {

                navigate("/login");

            }, 1500);


        }


        catch (error) {

            console.error(

                "Register error:",

                error

            );


            setError(

                error.response?.data?.message ||

                "Registration failed. Please try again."

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

                        Create Account

                    </h1>


                    <p className="text-gray-500 mt-3">

                        Join DK Clothing today

                    </p>


                </div>


                {/* ERROR */}


                {error && (

                    <div className="mb-5 rounded-xl bg-red-50 text-red-600 px-4 py-3 text-sm">

                        {error}

                    </div>

                )}


                {/* SUCCESS */}


                {success && (

                    <div className="mb-5 rounded-xl bg-green-50 text-green-600 px-4 py-3 text-sm">

                        {success}

                    </div>

                )}


                {/* FORM */}


                <form

                    onSubmit={handleRegister}

                    className="space-y-5"

                >


                    {/* FULL NAME */}


                    <div>

                        <label className="block text-sm font-semibold mb-2">

                            Full Name

                        </label>


                        <input

                            type="text"

                            value={fullName}

                            onChange={(event) =>

                                setFullName(

                                    event.target.value

                                )

                            }

                            placeholder="Enter your full name"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"

                        />

                    </div>


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


                    {/* PHONE */}


                    <div>

                        <label className="block text-sm font-semibold mb-2">

                            Phone

                        </label>


                        <input

                            type="tel"

                            value={phone}

                            onChange={(event) =>

                                setPhone(

                                    event.target.value

                                )

                            }

                            placeholder="Enter your phone number"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"

                        />

                    </div>


                    {/* ADDRESS */}


                    <div>

                        <label className="block text-sm font-semibold mb-2">

                            Address

                        </label>


                        <textarea

                            value={address}

                            onChange={(event) =>

                                setAddress(

                                    event.target.value

                                )

                            }

                            placeholder="Enter your address"

                            required

                            rows="3"

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black resize-none"

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

                            placeholder="At least 5 characters, 1 uppercase letter and 1 number"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"

                        />

                    </div>


                    {/* CONFIRM PASSWORD */}


                    <div>

                        <label className="block text-sm font-semibold mb-2">

                            Confirm Password

                        </label>


                        <input

                            type="password"

                            value={confirmPassword}

                            onChange={(event) =>

                                setConfirmPassword(

                                    event.target.value

                                )

                            }

                            placeholder="Confirm your password"

                            required

                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"

                        />

                    </div>


                    {/* PASSWORD RULE */}


                    <p className="text-xs text-gray-500 leading-5">

                        Password must contain at least 5 characters,

                        1 uppercase letter and 1 number.

                    </p>


                    {/* SUBMIT */}


                    <button

                        type="submit"

                        disabled={loading}

                        className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition disabled:opacity-50"

                    >

                        {loading

                            ? "CREATING ACCOUNT..."

                            : "CREATE ACCOUNT"

                        }

                    </button>


                </form>


                {/* LOGIN */}


                <div className="text-center mt-8 text-sm text-gray-500">


                    Already have an account?


                    <Link

                        to="/login"

                        className="ml-2 font-bold text-black hover:underline"

                    >

                        Login

                    </Link>


                </div>


            </div>


        </main>

    );

}


export default Register;