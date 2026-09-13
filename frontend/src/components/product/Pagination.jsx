function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-12">

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-40"
            >
                Previous
            </button>

            {Array.from(
                { length: totalPages },
                (_, index) => index + 1
            ).map((page) => (

                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`
                        px-4
                        py-2
                        border
                        rounded
                        ${
                            currentPage === page
                                ? "bg-black text-white"
                                : "bg-white"
                        }
                    `}
                >
                    {page}
                </button>

            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-40"
            >
                Next
            </button>

        </div>
    );
}

export default Pagination;