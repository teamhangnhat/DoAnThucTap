import { Link, useParams } from "react-router-dom";

function CategoryFilter() {

    const { category } = useParams();

    const categories = [

        {
            name:"All",
            path:"/products"
        },

        {
            name:"Men",
            path:"/products/men"
        },

        {
            name:"Women",
            path:"/products/women"
        },

        {
            name:"Accessories",
            path:"/products/accessories"
        },

        {
            name:"Sale",
            path:"/products/sale"
        }

    ];

    return (

        <div className="flex flex-wrap gap-4 mb-12">

            {

                categories.map(item=>(

                    <Link

                        key={item.name}

                        to={item.path}

                        className={`

                        px-6

                        py-3

                        rounded-full

                        border

                        transition

                        ${

                            location.pathname===item.path

                            ?

                            "bg-black text-white"

                            :

                            "hover:bg-black hover:text-white"

                        }

                        `}

                    >

                        {item.name}

                    </Link>

                ))

            }

        </div>

    );

}

export default CategoryFilter;