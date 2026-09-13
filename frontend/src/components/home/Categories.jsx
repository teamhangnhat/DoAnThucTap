import CategoryCard from "./CategoryCard";

import men from "../../assets/images/men.png";
import women from "../../assets/images/women.png";
import accessories from "../../assets/images/accessories.png";

const categories = [
    {
        title: "MEN",
        subtitle: "Discover modern essentials",
        image: men,
        link: "/products/men",
    },
    {
        title: "WOMEN",
        subtitle: "Elegant fashion for every day",
        image: women,
        link: "/products/women",
    },
    {
        title: "ACCESSORIES",
        subtitle: "Complete your signature look",
        image: accessories,
        link: "/products/accessories",
    },
];

function Categories() {
    return (
        <section className="max-w-7xl mx-auto py-24 px-6">

            <div className="text-center">

                <p className="uppercase tracking-[8px] text-gray-500">
                    Shop by Category
                </p>

                <h2 className="text-5xl font-bold mt-4">
                    Find Your Style
                </h2>

                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Explore our carefully curated collections designed
                    for modern lifestyles and timeless elegance.
                </p>

            </div>

            <div className="grid lg:grid-cols-3 gap-8 mt-16">

                {categories.map((item) => (
                    <CategoryCard
                        key={item.title}
                        {...item}
                    />
                ))}

            </div>

        </section>
    );
}

export default Categories;