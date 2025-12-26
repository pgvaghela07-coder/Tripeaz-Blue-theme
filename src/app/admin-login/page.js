"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleLogin = async () => {
        // Clear previous messages
        setErrorMessage("");
        setSuccessMessage("");

        // Validate inputs
        if (!email || !password) {
            setErrorMessage("Please enter both email and password");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                setSuccessMessage(data.message || "Login successful! Redirecting...");
                // Redirect after a short delay to show success message
                setTimeout(() => {
                    router.push("/admin");
                }, 1500);
            } else {
                setErrorMessage(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoading(false);
            setErrorMessage("An error occurred. Please try again later.");
        }
    };

    // Clear messages when user starts typing
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errorMessage || successMessage) {
            setErrorMessage("");
            setSuccessMessage("");
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errorMessage || successMessage) {
            setErrorMessage("");
            setSuccessMessage("");
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-center mb-5 text-gray-800">
                    Admin Login
                </h2>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">{errorMessage}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm text-center">{successMessage}</p>
                    </div>
                )}

                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
                        placeholder="Enter admin email"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition text-white py-2 rounded-lg font-medium"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}
