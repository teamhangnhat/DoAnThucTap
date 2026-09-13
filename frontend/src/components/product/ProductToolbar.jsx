import { FiSearch } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";

function ProductToolbar({

    total,

    search,

    setSearch,

    sort,

    setSort

}) {

    return (

        <div
            className="
                flex
                flex-col
                lg:flex-row
                justify-between
                items-center
                gap-6
                mb-12
            "
        >

            {/* LEFT */}

            <div>

                <h2 className="text-3xl font-bold">

                    All Products

                </h2>

                <p className="text-gray-500 mt-2">

                    {total} products available

                </p>

            </div>

            {/* RIGHT */}

            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">

                {/* SEARCH */}

                <div className="relative">

                    <FiSearch
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                            text-lg
                        "
                    />

                    <input

                        type="text"

                        placeholder="Search products..."

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                        className="
                            w-full
                            md:w-80
                            border
                            rounded-full
                            pl-12
                            pr-5
                            py-3
                            outline-none
                            focus:border-black
                            transition
                        "

                    />

                </div>

                {/* SORT */}

                <select

                    value={sort}

                    onChange={(e) => setSort(e.target.value)}

                    className="
                        border
                        rounded-full
                        px-5
                        py-3
                        outline-none
                        cursor-pointer
                        hover:border-black
                    "

                >

                    <option value="newest">

                        Newest

                    </option>

                    <option value="price_asc">

                        Price Low → High

                    </option>

                    <option value="price_desc">

                        Price High → Low

                    </option>

                </select>

                {/* FILTER BUTTON */}

                <button

                    className="
                        flex
                        items-center
                        gap-2
                        border
                        rounded-full
                        px-5
                        py-3
                        hover:bg-black
                        hover:text-white
                        transition
                    "

                >

                    <FaFilter />

                    Filter

                </button>

            </div>

        </div>

    );

}

export default ProductToolbar;