import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaLock,
    FaSignOutAlt,
    FaSave,
    FaCrown,
    FaStar,
    FaGift,
    FaArrowRight
} from "react-icons/fa";

import {
    getProfile,
    updateProfile,
    changePassword
} from "../../services/userService";

import {
    getMyMembership
} from "../../services/membershipService";


// =====================================================
// MEMBERSHIP CONFIG
// =====================================================

const getTierStyle = (tierName) => {

    const tier = String(

        tierName || ""

    ).toLowerCase();


    if (tier.includes("platinum")) {

        return {

            label: "PLATINUM",

            icon: "💎",

            gradient: "from-slate-900 via-gray-700 to-slate-500",

            text: "text-slate-900",

            bg: "bg-slate-100"

        };

    }


    if (tier.includes("gold")) {

        return {

            label: "GOLD",

            icon: "👑",

            gradient: "from-yellow-600 via-amber-400 to-yellow-200",

            text: "text-yellow-700",

            bg: "bg-yellow-50"

        };

    }


    if (tier.includes("silver")) {

        return {

            label: "SILVER",

            icon: "⭐",

            gradient: "from-gray-700 via-gray-400 to-gray-200",

            text: "text-gray-700",

            bg: "bg-gray-100"

        };

    }


    return {

        label: "BRONZE",

        icon: "🥉",

        gradient: "from-orange-900 via-orange-600 to-orange-300",

        text: "text-orange-700",

        bg: "bg-orange-50"

    };

};


// =====================================================
// PROFILE
// =====================================================

function Profile() {


    const navigate = useNavigate();


    // =================================================
    // USER
    // =================================================

    const [

        user,

        setUser

    ] = useState(null);


    // =================================================
    // PROFILE DATA
    // =================================================

    const [

        profile,

        setProfile

    ] = useState({

        full_name: "",

        email: "",

        phone: "",

        address: "",

        role: "",

        status: "",

        created_at: ""

    });


    // =================================================
    // MEMBERSHIP
    // =================================================

    const [

        membership,

        setMembership

    ] = useState(null);


    // =================================================
    // PASSWORD DATA
    // =================================================

    const [

        passwordData,

        setPasswordData

    ] = useState({

        old_password: "",

        new_password: "",

        confirm_password: ""

    });


    // =================================================
    // LOADING
    // =================================================

    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        membershipLoading,

        setMembershipLoading

    ] = useState(true);


    const [

        saving,

        setSaving

    ] = useState(false);


    const [

        changingPassword,

        setChangingPassword

    ] = useState(false);


    // =================================================
    // MESSAGE
    // =================================================

    const [

        message,

        setMessage

    ] = useState("");


    const [

        error,

        setError

    ] = useState("");



    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const loadProfile = async () => {


        try {


            setLoading(true);

            setError("");


            const storedUser = JSON.parse(

                localStorage.getItem("user")

            );


            if (!storedUser?.id) {

                navigate("/login");

                return;

            }


            setUser(storedUser);


            const response = await getProfile(

                storedUser.id

            );


            setProfile({

                full_name:

                    response.data.full_name || "",

                email:

                    response.data.email || "",

                phone:

                    response.data.phone || "",

                address:

                    response.data.address || "",

                role:

                    response.data.role || "",

                status:

                    response.data.status || "",

                created_at:

                    response.data.created_at || ""

            });


        }

        catch (err) {


            console.error(

                "LOAD PROFILE ERROR:",

                err

            );


            setError(

                err.response?.data?.message

                ||

                "Không thể tải thông tin cá nhân."

            );

        }


        finally {

            setLoading(false);

        }

    };



    // =====================================================
    // LOAD MEMBERSHIP
    // =====================================================

    const loadMembership = async () => {


        try {


            setMembershipLoading(true);


            const response = await getMyMembership();


            console.log(

                "MEMBERSHIP DATA:",

                response.data

            );


            setMembership(

                response.data

            );

        }


        catch (err) {


            console.error(

                "LOAD MEMBERSHIP ERROR:",

                err

            );


            // Không làm hỏng trang Profile
            setMembership(null);

        }


        finally {

            setMembershipLoading(false);

        }

    };



    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {


        loadProfile();

        loadMembership();


    }, []);



    // =====================================================
    // HANDLE PROFILE CHANGE
    // =====================================================

    const handleProfileChange = (

        event

    ) => {


        const {

            name,

            value

        } = event.target;


        setProfile(

            previous => ({

                ...previous,

                [name]: value

            })

        );

    };



    // =====================================================
    // HANDLE PASSWORD CHANGE
    // =====================================================

    const handlePasswordChange = (

        event

    ) => {


        const {

            name,

            value

        } = event.target;


        setPasswordData(

            previous => ({

                ...previous,

                [name]: value

            })

        );

    };



    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleSaveProfile = async (

        event

    ) => {


        event.preventDefault();


        try {


            setSaving(true);

            setMessage("");

            setError("");


            await updateProfile(

                user.id,

                {

                    full_name:

                        profile.full_name,

                    phone:

                        profile.phone,

                    address:

                        profile.address

                }

            );


            const updatedUser = {

                ...user,

                full_name:

                    profile.full_name,

                phone:

                    profile.phone,

                address:

                    profile.address

            };


            localStorage.setItem(

                "user",

                JSON.stringify(

                    updatedUser

                )

            );


            setUser(

                updatedUser

            );


            setMessage(

                "Cập nhật thông tin thành công!"

            );

        }


        catch (err) {


            console.error(

                "UPDATE PROFILE ERROR:",

                err

            );


            setError(

                err.response?.data?.message

                ||

                "Cập nhật thông tin thất bại."

            );

        }


        finally {

            setSaving(false);

        }

    };



    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword = async (

        event

    ) => {


        event.preventDefault();


        setMessage("");

        setError("");


        if (

            !passwordData.old_password

            ||

            !passwordData.new_password

            ||

            !passwordData.confirm_password

        ) {


            setError(

                "Vui lòng nhập đầy đủ thông tin mật khẩu."

            );


            return;

        }


        if (

            passwordData.new_password.length < 6

        ) {


            setError(

                "Mật khẩu mới phải có ít nhất 6 ký tự."

            );


            return;

        }


        if (

            passwordData.new_password

            !==

            passwordData.confirm_password

        ) {


            setError(

                "Mật khẩu mới và xác nhận mật khẩu không trùng nhau."

            );


            return;

        }


        try {


            setChangingPassword(true);


            await changePassword(

                user.id,

                {

                    old_password:

                        passwordData.old_password,

                    new_password:

                        passwordData.new_password

                }

            );


            setMessage(

                "Đổi mật khẩu thành công!"

            );


            setPasswordData({

                old_password: "",

                new_password: "",

                confirm_password: ""

            });

        }


        catch (err) {


            console.error(

                "CHANGE PASSWORD ERROR:",

                err

            );


            setError(

                err.response?.data?.message

                ||

                "Đổi mật khẩu thất bại."

            );

        }


        finally {

            setChangingPassword(false);

        }

    };



    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {


        localStorage.removeItem(

            "user"

        );


        localStorage.removeItem(

            "token"

        );


        navigate(

            "/login"

        );

    };



    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatMoney = (

        value

    ) => {


        return Number(

            value || 0

        ).toLocaleString(

            "vi-VN"

        ) + " ₫";

    };



    // =====================================================
    // GET MEMBERSHIP VALUES
    // =====================================================

    const tierName =

        membership?.tier_name

        ||

        membership?.membership_tier

        ||

        membership?.name

        ||

        "Bronze";


    const tierStyle =

        getTierStyle(

            tierName

        );


    const totalSpent =

        Number(

            membership?.total_spent

            ||

            membership?.total_spending

            ||

            membership?.total_amount

            ||

            0

        );


    const discountPercent =

        Number(

            membership?.discount_percent

            ||

            membership?.discount

            ||

            0

        );


    const nextTier =

        membership?.next_tier_name

        ||

        membership?.next_tier

        ||

        "Next Tier";


    const amountToNextTier =

        Number(

            membership?.amount_to_next_tier

            ||

            membership?.remaining_amount

            ||

            0

        );


    const progress = Math.min(

        100,

        Math.max(

            0,

            Number(

                membership?.progress_percent

                ||

                membership?.progress

                ||

                0

            )

        )

    );



    // =====================================================
    // LOADING
    // =====================================================

    if (

        loading

    ) {


        return (


            <main className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">


                <div className="text-center">


                    <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-5" />


                    <p className="text-gray-500">

                        Loading profile...

                    </p>


                </div>


            </main>

        );

    }



    // =====================================================
    // PAGE
    // =====================================================

    return (


        <main className="min-h-screen bg-[#f8f8f6] py-12 sm:py-20">


            <div className="max-w-6xl mx-auto px-5 sm:px-8">


                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}


                <div className="mb-10">


                    <p className="text-xs uppercase tracking-[4px] text-gray-400 mb-3">

                        My Account

                    </p>


                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">

                        My Profile

                    </h1>


                    <p className="text-gray-500 mt-3">

                        Manage your personal information and account security.

                    </p>


                </div>



                {/* ================================================= */}
                {/* MESSAGE */}
                {/* ================================================= */}


                {message && (


                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4">

                        {message}

                    </div>

                )}



                {error && (


                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4">

                        {error}

                    </div>

                )}



                {/* ================================================= */}
                {/* MAIN GRID */}
                {/* ================================================= */}


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                    {/* ================================================= */}
                    {/* PROFILE INFORMATION */}
                    {/* ================================================= */}


                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-7 sm:p-10 shadow-sm">


                        <div className="flex items-center gap-4 mb-8">


                            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl">


                                <FaUser />

                            </div>


                            <div>


                                <h2 className="text-2xl font-bold">

                                    Personal Information

                                </h2>


                                <p className="text-gray-500 text-sm mt-1">

                                    Update your account information.

                                </p>


                            </div>


                        </div>



                        <form

                            onSubmit={

                                handleSaveProfile

                            }

                            className="space-y-6"

                        >


                            {/* FULL NAME */}


                            <div>


                                <label className="block text-sm font-semibold mb-2">

                                    Full Name

                                </label>


                                <div className="relative">


                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />


                                    <input

                                        type="text"

                                        name="full_name"

                                        value={

                                            profile.full_name

                                        }

                                        onChange={

                                            handleProfileChange

                                        }

                                        className="w-full border border-gray-200 rounded-xl px-12 py-3 outline-none focus:border-black"

                                    />

                                </div>


                            </div>



                            {/* EMAIL */}


                            <div>


                                <label className="block text-sm font-semibold mb-2">

                                    Email

                                </label>


                                <div className="relative">


                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />


                                    <input

                                        type="email"

                                        value={

                                            profile.email

                                        }

                                        disabled

                                        className="w-full border border-gray-200 bg-gray-100 rounded-xl px-12 py-3 text-gray-500"

                                    />

                                </div>


                                <p className="text-xs text-gray-400 mt-2">

                                    Email cannot be changed.

                                </p>


                            </div>



                            {/* PHONE */}


                            <div>


                                <label className="block text-sm font-semibold mb-2">

                                    Phone Number

                                </label>


                                <div className="relative">


                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />


                                    <input

                                        type="text"

                                        name="phone"

                                        value={

                                            profile.phone

                                        }

                                        onChange={

                                            handleProfileChange

                                        }

                                        className="w-full border border-gray-200 rounded-xl px-12 py-3 outline-none focus:border-black"

                                    />

                                </div>


                            </div>



                            {/* ADDRESS */}


                            <div>


                                <label className="block text-sm font-semibold mb-2">

                                    Address

                                </label>


                                <div className="relative">


                                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />


                                    <textarea

                                        name="address"

                                        value={

                                            profile.address

                                        }

                                        onChange={

                                            handleProfileChange

                                        }

                                        rows="4"

                                        className="w-full border border-gray-200 rounded-xl px-12 py-3 outline-none focus:border-black resize-none"

                                    />

                                </div>


                            </div>



                            {/* SAVE */}


                            <button

                                type="submit"

                                disabled={saving}

                                className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition disabled:opacity-50"

                            >

                                <FaSave />

                                {saving

                                    ? "SAVING..."

                                    : "SAVE CHANGES"

                                }

                            </button>


                        </form>


                    </div>



                    {/* ================================================= */}
                    {/* RIGHT SIDEBAR */}
                    {/* ================================================= */}


                    <div className="space-y-8">


                        {/* ================================================= */}
                        {/* MEMBERSHIP CARD */}
                        {/* ================================================= */}


                        <div className="relative overflow-hidden rounded-[2rem] shadow-lg">


                            <div

                                className={`bg-gradient-to-br ${tierStyle.gradient} p-7 text-white relative`}

                            >


                                {/* Decorative circles */}


                                <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full border border-white/20" />

                                <div className="absolute -right-5 -bottom-16 w-40 h-40 rounded-full border border-white/10" />


                                <div className="relative z-10">


                                    <div className="flex items-start justify-between">


                                        <div>


                                            <p className="text-white/70 text-xs uppercase tracking-[3px]">

                                                DK Membership

                                            </p>


                                            <h2 className="text-3xl font-bold mt-2">

                                                {membershipLoading

                                                    ? "Loading..."

                                                    : tierStyle.label

                                                }

                                            </h2>

                                        </div>


                                        <div className="text-4xl">

                                            {tierStyle.icon}

                                        </div>


                                    </div>



                                    {!membershipLoading && (


                                        <>


                                            <div className="mt-8">


                                                <div className="flex items-center justify-between text-sm mb-2">


                                                    <span className="text-white/80">

                                                        Total Spending

                                                    </span>


                                                    <span className="font-bold">

                                                        {formatMoney(

                                                            totalSpent

                                                        )}

                                                    </span>


                                                </div>


                                                <div className="flex items-center justify-between text-sm">


                                                    <span className="text-white/80">

                                                        Member Discount

                                                    </span>


                                                    <span className="font-bold">

                                                        {discountPercent}%

                                                    </span>


                                                </div>


                                            </div>



                                            <div className="mt-7">


                                                <div className="flex justify-between text-xs text-white/80 mb-2">


                                                    <span>

                                                        Progress to {nextTier}

                                                    </span>


                                                    <span>

                                                        {progress}%

                                                    </span>


                                                </div>


                                                <div className="h-2 bg-white/25 rounded-full overflow-hidden">


                                                    <div

                                                        className="h-full bg-white rounded-full transition-all duration-700"

                                                        style={{

                                                            width: `${progress}%`

                                                        }}

                                                    />

                                                </div>


                                            </div>



                                            {amountToNextTier > 0 && (


                                                <div className="mt-5 flex items-center gap-2 text-sm text-white/85">


                                                    <FaArrowRight size={12} />


                                                    <span>

                                                        Spend{" "}

                                                        <strong className="text-white">

                                                            {formatMoney(

                                                                amountToNextTier

                                                            )}

                                                        </strong>{" "}

                                                        more to reach {nextTier}

                                                    </span>


                                                </div>

                                            )}


                                        </>

                                    )}

                                </div>


                            </div>



                            {/* BENEFITS */}


                            <div className="bg-white p-6">


                                <div className="flex items-center gap-3 mb-4">


                                    <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">


                                        <FaGift />

                                    </div>


                                    <div>


                                        <h3 className="font-bold">

                                            Your Member Benefits

                                        </h3>


                                        <p className="text-xs text-gray-500">

                                            Exclusive rewards for you

                                        </p>

                                    </div>


                                </div>


                                <div className="space-y-3 text-sm">


                                    <div className="flex items-center gap-3">


                                        <FaStar className="text-yellow-500" />


                                        <span>

                                            Exclusive member discounts

                                        </span>

                                    </div>


                                    <div className="flex items-center gap-3">


                                        <FaGift className="text-yellow-500" />


                                        <span>

                                            Special vouchers and rewards

                                        </span>

                                    </div>


                                    <div className="flex items-center gap-3">


                                        <FaCrown className="text-yellow-500" />


                                        <span>

                                            More benefits as you shop more

                                        </span>

                                    </div>


                                </div>


                            </div>


                        </div>



                        {/* ================================================= */}
                        {/* ACCOUNT DETAILS */}
                        {/* ================================================= */}


                        <div className="bg-white rounded-[2rem] p-7 shadow-sm">


                            <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-3">

                                Account

                            </p>


                            <h2 className="text-2xl font-bold mb-6">

                                Account Details

                            </h2>


                            <div className="space-y-4 text-sm">


                                <div className="flex justify-between gap-4">


                                    <span className="text-gray-500">

                                        Role

                                    </span>


                                    <span className="font-semibold">

                                        {profile.role}

                                    </span>


                                </div>


                                <div className="flex justify-between gap-4">


                                    <span className="text-gray-500">

                                        Status

                                    </span>


                                    <span className="font-semibold">

                                        {profile.status}

                                    </span>


                                </div>


                                <div className="flex justify-between gap-4">


                                    <span className="text-gray-500">

                                        Member Since

                                    </span>


                                    <span className="font-semibold text-right">

                                        {profile.created_at

                                            ? new Date(

                                                profile.created_at

                                            ).toLocaleDateString(

                                                "vi-VN"

                                            )

                                            : "-"

                                        }

                                    </span>


                                </div>


                            </div>


                        </div>



                        {/* ================================================= */}
                        {/* LOGOUT */}
                        {/* ================================================= */}


                        <button

                            type="button"

                            onClick={

                                handleLogout

                            }

                            className="w-full bg-white text-red-500 border border-red-100 rounded-[2rem] p-5 font-bold flex items-center justify-center gap-3 hover:bg-red-50 transition"

                        >

                            <FaSignOutAlt />

                            LOG OUT

                        </button>


                    </div>


                </div>



                {/* ================================================= */}
                {/* CHANGE PASSWORD */}
                {/* ================================================= */}


                <div className="bg-white rounded-[2rem] p-7 sm:p-10 shadow-sm mt-8">


                    <div className="flex items-center gap-4 mb-8">


                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl">


                            <FaLock />

                        </div>


                        <div>


                            <h2 className="text-2xl font-bold">

                                Change Password

                            </h2>


                            <p className="text-gray-500 text-sm mt-1">

                                Your current password must be correct before changing it.

                            </p>


                        </div>


                    </div>



                    <form

                        onSubmit={

                            handleChangePassword

                        }

                        className="grid grid-cols-1 md:grid-cols-3 gap-5"

                    >


                        <div>


                            <label className="block text-sm font-semibold mb-2">

                                Current Password

                            </label>


                            <input

                                type="password"

                                name="old_password"

                                value={

                                    passwordData.old_password

                                }

                                onChange={

                                    handlePasswordChange

                                }

                                placeholder="Enter current password"

                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"

                            />

                        </div>



                        <div>


                            <label className="block text-sm font-semibold mb-2">

                                New Password

                            </label>


                            <input

                                type="password"

                                name="new_password"

                                value={

                                    passwordData.new_password

                                }

                                onChange={

                                    handlePasswordChange

                                }

                                placeholder="Enter new password"

                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"

                            />

                        </div>



                        <div>


                            <label className="block text-sm font-semibold mb-2">

                                Confirm New Password

                            </label>


                            <input

                                type="password"

                                name="confirm_password"

                                value={

                                    passwordData.confirm_password

                                }

                                onChange={

                                    handlePasswordChange

                                }

                                placeholder="Confirm new password"

                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"

                            />

                        </div>



                        <div className="md:col-span-3">


                            <button

                                type="submit"

                                disabled={changingPassword}

                                className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition disabled:opacity-50"

                            >

                                {changingPassword

                                    ? "CHANGING PASSWORD..."

                                    : "CHANGE PASSWORD"

                                }

                            </button>


                        </div>


                    </form>


                </div>


            </div>


        </main>

    );

}


export default Profile;