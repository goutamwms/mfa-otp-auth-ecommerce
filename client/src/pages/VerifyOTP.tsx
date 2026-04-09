import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { pendingEmail, setUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!pendingEmail) {
      navigate('/login');
    }
  }, [pendingEmail, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const verifyMutation = useMutation({
    mutationFn: (otpCode: string) =>
      authApi.verifyOtp(pendingEmail!, otpCode),
    onSuccess: (response) => {
      if (response.data.user) {
        setUser(response.data.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    verifyMutation.mutate(otpCode);
  };

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp(pendingEmail!),
    onSuccess: (response) => {
      if (response.data.emailPreviewUrl) {
        setEmailPreviewUrl(response.data.emailPreviewUrl);
      }
      setCountdown(60);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    },
  });

  const handleResend = () => {
    if (countdown > 0 || resendMutation.isPending) return;
    resendMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Verify Email</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit code sent to<br />
          <span className="font-medium text-gray-800">{pendingEmail}</span>
        </p>

        {emailPreviewUrl && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              New OTP sent!{' '}
              <a
                href={emailPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                View email preview
              </a>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="flex justify-center gap-2 mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {verifyMutation.isPending && <Loader2 size={18} className="animate-spin" />}
            Verify
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resendMutation.isPending}
            className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendMutation.isPending
              ? 'Sending...'
              : countdown > 0
              ? `Resend in ${countdown}s`
              : 'Resend OTP'}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
