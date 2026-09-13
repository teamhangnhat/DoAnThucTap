import {
    useEffect,
    useState
} from "react";


import {
    Mail,
    Phone,
    MapPin,
    Shield,
    Save
} from "lucide-react";


import {
    getAdminProfile,
    updateAdminProfile
} from "../../../services/admin/adminProfileService";


function AdminProfile() {


    const [profile, setProfile] =

        useState(null);


    const [formData, setFormData] =

        useState({

            full_name: "",

            phone: "",

            address: ""

        });


    const [loading, setLoading] =

        useState(true);


    const [saving, setSaving] =

        useState(false);



    // =====================================================
    // LOAD PROFILE
    // =====================================================

    useEffect(() => {

        loadProfile();

    }, []);



    const loadProfile = async () => {

        try {

            const response =

                await getAdminProfile();


            const admin =

                response.data;


            setProfile(admin);


            setFormData({

                full_name:

                    admin.full_name || "",

                phone:

                    admin.phone || "",

                address:

                    admin.address || ""

            });

        }

        catch (error) {

            console.error(

                "Failed to load profile",

                error

            );

        }

        finally {

            setLoading(false);

        }

    };



    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:

                e.target.value

        });

    };



    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            setSaving(true);


            const response =

                await updateAdminProfile(

                    formData

                );


            setProfile(

                response.data.admin

            );


            alert(

                "Profile updated successfully"

            );

        }

        catch (error) {

            console.error(

                "Update profile error",

                error

            );


            alert(

                "Failed to update profile"

            );

        }

        finally {

            setSaving(false);

        }

    };



    if (loading) {

        return (

            <div className="p-8">

                Loading profile...

            </div>

        );

    }



    if (!profile) {

        return (

            <div className="p-8">

                Failed to load admin profile.

            </div>

        );

    }



    return (

        <div className="p-8 bg-gray-100 min-h-[calc(100vh-80px)]">


            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">

                    Admin Profile

                </h1>


                <p className="text-gray-500 mt-1">

                    Manage your administrator account

                </p>

            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                {/* PROFILE CARD */}

                <div className="bg-white rounded-xl p-8 shadow-sm">


                    <div className="flex flex-col items-center">


                        {/* AVATAR */}

                        <div className="w-28 h-28 rounded-full bg-black text-white flex items-center justify-center">

                            <Shield size={52} />

                        </div>


                        <h2 className="mt-5 text-xl font-bold">

                            {profile.full_name}

                        </h2>


                        <p className="text-gray-500 mt-1">

                            {profile.email}

                        </p>


                        <span className="mt-4 px-4 py-1.5 rounded-full bg-black text-white text-sm flex items-center gap-2">

                            <Shield size={15} />

                            {profile.role}

                        </span>


                    </div>


                    <div className="border-t mt-8 pt-6 space-y-4">


                        <div className="flex items-center gap-3 text-gray-600">

                            <Mail size={18} />

                            <span className="text-sm">

                                {profile.email}

                            </span>

                        </div>


                        <div className="flex items-center gap-3 text-gray-600">

                            <Phone size={18} />

                            <span className="text-sm">

                                {profile.phone || "No phone number"}

                            </span>

                        </div>


                        <div className="flex items-center gap-3 text-gray-600">

                            <MapPin size={18} />

                            <span className="text-sm">

                                {profile.address || "No address"}

                            </span>

                        </div>


                    </div>


                </div>



                {/* EDIT FORM */}

                <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-sm">


                    <h2 className="text-xl font-bold mb-6">

                        Personal Information

                    </h2>


                    <form

                        onSubmit={handleSubmit}

                        className="space-y-5"

                    >


                        {/* FULL NAME */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Full Name

                            </label>


                            <input

                                name="full_name"

                                value={

                                    formData.full_name

                                }

                                onChange={

                                    handleChange

                                }

                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"

                            />

                        </div>



                        {/* EMAIL */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Email

                            </label>


                            <input

                                value={

                                    profile.email

                                }

                                disabled

                                className="w-full border rounded-lg p-3 bg-gray-100 text-gray-500"

                            />

                        </div>



                        {/* PHONE */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Phone

                            </label>


                            <input

                                name="phone"

                                value={

                                    formData.phone

                                }

                                onChange={

                                    handleChange

                                }

                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"

                            />

                        </div>



                        {/* ADDRESS */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Address

                            </label>


                            <input

                                name="address"

                                value={

                                    formData.address

                                }

                                onChange={

                                    handleChange

                                }

                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"

                            />

                        </div>



                        {/* SAVE */}

                        <button

                            type="submit"

                            disabled={saving}

                            className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50"

                        >

                            <Save size={18} />


                            {saving

                                ? "Saving..."

                                : "Save Changes"}

                        </button>


                    </form>


                </div>


            </div>


        </div>

    );

}


export default AdminProfile;