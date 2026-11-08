
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
    FiCalendar,
    FiRefreshCw,
    FiCheck,
    FiX,
    FiClock,
    FiUser,
    FiFileText
} from "react-icons/fi";

const LEAVE_REQUESTS_API = "http://localhost:5000/api/leave-requests";

const getErrorMessage = (error) => {
    return (
        error.response?.data?.message ||
        "Something went wrong. Please try again."
    );
};

const formatDate = (value) => {
    if (!value) return "-";

    const dateString =
        typeof value === "string"
            ? value.slice(0, 10)
            : new Date(value).toISOString().slice(0, 10);

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
};

function LeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewingId, setReviewingId] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [reviewNotes, setReviewNotes] = useState({});

    // Load pending leave requests
    const loadLeaveRequests = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${LEAVE_REQUESTS_API}/pending`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = response.data;

            const requests = Array.isArray(data)
                ? data
                : data?.leaveRequests || data?.requests || [];

            setLeaveRequests(requests);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadLeaveRequests();
    }, [loadLeaveRequests]);

    // Review leave request
    const handleReview = async (requestId, status) => {
        const action = status === "APPROVED" ? "approve" : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this leave request?`
        );

        if (!confirmed) return;

        setReviewingId(requestId);
        setError("");
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            const response = await axios.patch(
                `${LEAVE_REQUESTS_API}/${requestId}/review`,
                {
                    status,
                    review_note: reviewNotes[requestId]?.trim() || null
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                response.data?.message ||
                "Leave request reviewed successfully."
            );

            setReviewNotes((previous) => {
                const updated = { ...previous };
                delete updated[requestId];
                return updated;
            });

            await loadLeaveRequests(true);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setReviewingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* HEADER */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-black p-3 text-white">
                            <FiCalendar size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Leave Requests
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Review leave requests submitted by Management.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => loadLeaveRequests(true)}
                    disabled={loading || refreshing}
                    className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FiRefreshCw
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* SUMMARY */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Pending Requests
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                {leaveRequests.length}
                            </h2>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                            <FiClock size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Requests Awaiting Review
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                {leaveRequests.length}
                            </h2>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <FiFileText size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <FiX className="mt-0.5 shrink-0" size={18} />
                    <p>{error}</p>
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <FiCheck className="mt-0.5 shrink-0" size={18} />
                    <p>{message}</p>
                </div>
            )}

            {/* REQUEST LIST */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Management Leave Requests
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Review and manage submitted leave requests.
                        </p>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        {leaveRequests.length} Pending
                    </span>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                        <p className="text-sm text-gray-500">
                            Loading leave requests...
                        </p>
                    </div>
                ) : leaveRequests.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FiCalendar size={26} />
                        </div>

                        <h3 className="font-semibold text-gray-800">
                            No Pending Leave Requests
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            There are currently no leave requests waiting for your review.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5 p-5">
                        {leaveRequests.map((request) => (
                            <article
                                key={request.id}
                                className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-300"
                            >
                                {/* EMPLOYEE INFORMATION */}
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                            <FiUser size={20} />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-gray-900">
                                                {request.full_name || "Management"}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {request.employee_code || "Management"}
                                                {request.department
                                                    ? ` · ${request.department}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                        <FiClock size={13} />
                                        Pending
                                    </span>
                                </div>

                                {/* LEAVE INFORMATION */}
                                <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Start Date
                                        </p>

                                        <p className="mt-2 font-semibold text-gray-900">
                                            {formatDate(request.start_date)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            End Date
                                        </p>

                                        <p className="mt-2 font-semibold text-gray-900">
                                            {formatDate(request.end_date)}
                                        </p>
                                    </div>
                                </div>

                                {/* REASON */}
                                <div className="mt-5">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Leave Reason
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                        {request.reason || "No reason provided."}
                                    </p>
                                </div>

                                {/* REVIEW NOTE */}
                                <div className="mt-5">
                                    <label
                                        htmlFor={`review-note-${request.id}`}
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Review Note (Optional)
                                    </label>

                                    <textarea
                                        id={`review-note-${request.id}`}
                                        rows={2}
                                        value={reviewNotes[request.id] || ""}
                                        onChange={(event) =>
                                            setReviewNotes((previous) => ({
                                                ...previous,
                                                [request.id]: event.target.value
                                            }))
                                        }
                                        placeholder="Enter a note for this request..."
                                        disabled={reviewingId === request.id}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                                    />
                                </div>

                                {/* ACTIONS */}
                                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleReview(request.id, "REJECTED")
                                        }
                                        disabled={reviewingId === request.id}
                                        className="flex items-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <FiX size={17} />
                                        Reject
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleReview(request.id, "APPROVED")
                                        }
                                        disabled={reviewingId === request.id}
                                        className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <FiCheck size={17} />

                                        {reviewingId === request.id
                                            ? "Processing..."
                                            : "Approve"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaveRequests;
