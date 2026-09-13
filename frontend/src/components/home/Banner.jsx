function Banner() {
    return (
        <section className="bg-black text-white py-28 text-center">
            <h2 className="text-5xl font-bold">
                Summer Collection 2026
            </h2>

            <p className="mt-6 text-gray-300">
                Up to 30% off selected premium items.
            </p>

            <button className="mt-8 border border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition">
                Explore Now
            </button>
        </section>
    );
}

export default Banner;