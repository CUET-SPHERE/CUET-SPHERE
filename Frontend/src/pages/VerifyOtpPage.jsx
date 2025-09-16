import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import ApiService from "../services/api";
import { useUser } from "../contexts/UserContext";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const inputRefs = useRef([]);

  const email = location.state?.email;
  const type = location.state?.type || "password-reset";

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (type === "signup") {
        // For signup flow
        // Get stored signup data from sessionStorage
        const signupData = JSON.parse(sessionStorage.getItem('pendingSignupData') || '{}');

        if (!signupData.email) {
          setError("Session expired. Please try signing up again.");
          setIsLoading(false);
          return;
        }

        try {
          // Complete the signup process with OTP verification
          const signupResponse = await ApiService.signup(signupData, otpString);

          if (signupResponse.success) {
            // Clear stored data
            sessionStorage.removeItem('pendingSignupData');

            // Show success message
            setSuccessMessage("Your account has been created successfully! Redirecting to feed...");
            setRedirecting(true);

            // Transform the response to match frontend expectations
            const userData = {
              fullName: signupResponse.fullName,
              email: signupResponse.email,
              role: signupResponse.role,
              token: signupResponse.token,
              studentId: signupResponse.studentId || '',
              batch: signupResponse.batch || '',
              department: signupResponse.department || '',
              hall: signupResponse.hall || '',
              bio: signupResponse.bio || '',
            };

            // Log the user in
            login(userData);

            // Redirect to feed after a short delay
            setTimeout(() => {
              navigate('/feed');
            }, 3000);
          } else {
            setError(signupResponse.message || "Failed to create account. Please try again.");
          }
        } catch (error) {
          console.error("Signup error:", error);
          setError(error.message || "Failed to verify OTP. Please try again.");
        }
      } else {
        // For password reset flow
        const response = await ApiService.verifyOtp(email, otpString, type);

        if (response.success) {
          navigate("/reset-password", {
            state: {
              email,
              resetToken: response.resetToken
            }
          });
        } else {
          setError(response.message || "Invalid OTP. Please try again.");
        }
      }
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      if (!redirecting) {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");

    try {
      if (type === "signup") {
        // Get stored signup data from sessionStorage
        const signupData = JSON.parse(sessionStorage.getItem('pendingSignupData') || '{}');
        if (!signupData.email) {
          throw new Error("Session expired. Please try signing up again.");
        }
        // Use the signup OTP API
        await ApiService.requestSignupOtp(signupData);
      } else {
        await ApiService.requestPasswordReset(email);
      }

      setResendTimer(60);

      // Start new countdown
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {type === "signup" ? "Verify Your Email" : "Verify OTP"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {email}
          </p>
          {type === "signup" && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please verify your email to complete the account creation process
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
              Enter the 6-digit OTP
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              {successMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || redirecting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </div>
              ) : redirecting ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Redirecting...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?
            </p>
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Resend OTP in {resendTimer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <div className="text-center">
            <Link
              to={type === "signup" ? "/signup" : "/login"}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {type === "signup" ? "Back to Signup" : "Back to Login"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;