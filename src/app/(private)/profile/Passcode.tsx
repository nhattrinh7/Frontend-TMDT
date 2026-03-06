"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound,
  Eye,
  EyeOff,
  Save,
  Loader2,
  RotateCcw,
  ArrowLeft,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkPassCodeAPI,
  createPassCodeAPI,
  changePassCodeAPI,
  requestPassCodeResetAPI,
  resetPassCodeAPI,
} from "~/apiRequests/user.apiRequest";
import {
  createPassCodeBodySchema,
  changePassCodeBodySchema,
  resetPassCodeBodySchema,
  type CreatePassCodeBodyType,
  type ChangePassCodeBodyType,
  type ResetPassCodeBodyType,
} from "~/zodSchema/user.schema";

type PasscodeView = "create" | "change" | "reset";

export default function Passcode() {
  const [hasPassCode, setHasPassCode] = useState<boolean | null>(null); // null = đang tải
  const [view, setView] = useState<PasscodeView>("create");
  const [isLoading, setIsLoading] = useState(false);

  // Gọi API kiểm tra khi mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await checkPassCodeAPI();
        const has = res.data.hasPassCode;
        setHasPassCode(has);
        setView(has ? "change" : "create");
      } catch {
        setHasPassCode(false);
        setView("create");
      }
    };
    fetchStatus();
  }, []);

  if (hasPassCode === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004643]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#004643] to-[#005d58] p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Passcode</h1>
        <p className="text-white/80">
          {view === "create" && "Tạo mã PIN 6 số để bảo mật tài khoản"}
          {view === "change" && "Quản lý mã PIN bảo mật của bạn"}
          {view === "reset" && "Đặt lại mã PIN qua email"}
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {view === "create" && (
            <CreatePassCodeForm
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onSuccess={() => {
                setHasPassCode(true);
                setView("change");
              }}
            />
          )}
          {view === "change" && (
            <ChangePassCodeForm
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onForgot={() => setView("reset")}
            />
          )}
          {view === "reset" && (
            <ResetPassCodeForm
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onBack={() => setView("change")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== PASSCODE INPUT COMPONENT =====
function PasscodeInput({
  field,
  showPassword,
  toggleShow,
  placeholder,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  showPassword: boolean;
  toggleShow: () => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="relative">
      <input
        {...field}
        type={showPassword ? "text" : "password"}
        inputMode="numeric"
        maxLength={6}
        className="text-gray-900 w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors tracking-[0.5em] text-center text-lg font-mono"
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

// ===== CREATE PASSCODE FORM =====
function CreatePassCodeForm({
  isLoading,
  setIsLoading,
  onSuccess,
}: {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const [showPassCode, setShowPassCode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePassCodeBodyType>({
    resolver: zodResolver(createPassCodeBodySchema),
    defaultValues: { passCode: "", confirmPassCode: "" },
  });

  const onSubmit = async (data: CreatePassCodeBodyType) => {
    setIsLoading(true);
    try {
      await createPassCodeAPI({ passCode: data.passCode });
      toast.success("Tạo passcode thành công!");
      reset();
      onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
          Nhập Passcode (6 chữ số)
        </label>
        <Controller
          name="passCode"
          control={control}
          render={({ field }) => (
            <PasscodeInput
              field={field}
              showPassword={showPassCode}
              toggleShow={() => setShowPassCode(!showPassCode)}
              placeholder="••••••"
              disabled={isLoading}
            />
          )}
        />
        {errors.passCode && (
          <p className="mt-1 text-sm text-red-500">{errors.passCode.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
          Xác nhận Passcode
        </label>
        <Controller
          name="confirmPassCode"
          control={control}
          render={({ field }) => (
            <PasscodeInput
              field={field}
              showPassword={showConfirm}
              toggleShow={() => setShowConfirm(!showConfirm)}
              placeholder="••••••"
              disabled={isLoading}
            />
          )}
        />
        {errors.confirmPassCode && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirmPassCode.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Tạo Passcode
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ===== CHANGE PASSCODE FORM =====
function ChangePassCodeForm({
  isLoading,
  setIsLoading,
  onForgot,
}: {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  onForgot: () => void;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePassCodeBodyType>({
    resolver: zodResolver(changePassCodeBodySchema),
    defaultValues: {
      currentPassCode: "",
      newPassCode: "",
      confirmPassCode: "",
    },
  });

  const onSubmit = async (data: ChangePassCodeBodyType) => {
    setIsLoading(true);
    try {
      await changePassCodeAPI({
        currentPassCode: data.currentPassCode,
        newPassCode: data.newPassCode,
      });
      toast.success("Đổi passcode thành công!");
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
          Passcode hiện tại
        </label>
        <Controller
          name="currentPassCode"
          control={control}
          render={({ field }) => (
            <PasscodeInput
              field={field}
              showPassword={showCurrent}
              toggleShow={() => setShowCurrent(!showCurrent)}
              placeholder="••••••"
              disabled={isLoading}
            />
          )}
        />
        {errors.currentPassCode && (
          <p className="mt-1 text-sm text-red-500">
            {errors.currentPassCode.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
          Passcode mới
        </label>
        <Controller
          name="newPassCode"
          control={control}
          render={({ field }) => (
            <PasscodeInput
              field={field}
              showPassword={showNew}
              toggleShow={() => setShowNew(!showNew)}
              placeholder="••••••"
              disabled={isLoading}
            />
          )}
        />
        {errors.newPassCode && (
          <p className="mt-1 text-sm text-red-500">
            {errors.newPassCode.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
          Xác nhận Passcode mới
        </label>
        <Controller
          name="confirmPassCode"
          control={control}
          render={({ field }) => (
            <PasscodeInput
              field={field}
              showPassword={showConfirm}
              toggleShow={() => setShowConfirm(!showConfirm)}
              placeholder="••••••"
              disabled={isLoading}
            />
          )}
        />
        {errors.confirmPassCode && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirmPassCode.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onForgot}
          className="text-[#004643] hover:text-[#005d58] font-semibold flex items-center gap-1 hover:underline transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Quên Passcode?
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang cập nhật...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Đổi Passcode
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ===== RESET PASSCODE FORM =====
function ResetPassCodeForm({
  isLoading,
  setIsLoading,
  onBack,
}: {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  onBack: () => void;
}) {
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPassCodeBodyType>({
    resolver: zodResolver(resetPassCodeBodySchema),
    defaultValues: { otp: "", newPassCode: "", confirmPassCode: "" },
  });

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = useCallback(async () => {
    setIsLoading(true);
    try {
      await requestPassCodeResetAPI();
      toast.success("OTP đã được gửi đến email của bạn!");
      setOtpSent(true);
      setCountdown(60); // 60 giây countdown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi gửi OTP",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const onSubmit = async (data: ResetPassCodeBodyType) => {
    setIsLoading(true);
    try {
      await resetPassCodeAPI({
        otp: data.otp,
        newPassCode: data.newPassCode,
      });
      toast.success("Reset passcode thành công!");
      reset();
      onBack();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      {/* Step 1: Send OTP */}
      {!otpSent ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-[#004643]/10 rounded-full flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-[#004643]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Gửi mã OTP</h3>
            <p className="text-gray-500 mt-1">
              Chúng tôi sẽ gửi mã OTP đến email của bạn để xác minh danh tính.
              <br />
              OTP có hiệu lực trong <strong>3 phút</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi OTP
              </>
            )}
          </button>
        </div>
      ) : (
        /* Step 2: Enter OTP + New Passcode */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
              Mã OTP
            </label>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="text-gray-900 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors tracking-[0.5em] text-center text-lg font-mono"
                  placeholder="••••••"
                  disabled={isLoading}
                />
              )}
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>
            )}

            {/* Resend OTP button */}
            <div className="mt-2 text-center">
              {countdown > 0 ? (
                <span className="text-sm text-gray-400">
                  Gửi lại OTP sau {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="text-sm text-[#004643] hover:text-[#005d58] font-semibold hover:underline transition-all disabled:opacity-50"
                >
                  Gửi lại OTP
                </button>
              )}
            </div>
          </div>

          {/* New Passcode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
              Passcode mới
            </label>
            <Controller
              name="newPassCode"
              control={control}
              render={({ field }) => (
                <PasscodeInput
                  field={field}
                  showPassword={showNew}
                  toggleShow={() => setShowNew(!showNew)}
                  placeholder="••••••"
                  disabled={isLoading}
                />
              )}
            />
            {errors.newPassCode && (
              <p className="mt-1 text-sm text-red-500">
                {errors.newPassCode.message}
              </p>
            )}
          </div>

          {/* Confirm Passcode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <KeyRound className="w-4 h-4 inline mr-2 text-[#004643]" />
              Xác nhận Passcode mới
            </label>
            <Controller
              name="confirmPassCode"
              control={control}
              render={({ field }) => (
                <PasscodeInput
                  field={field}
                  showPassword={showConfirm}
                  toggleShow={() => setShowConfirm(!showConfirm)}
                  placeholder="••••••"
                  disabled={isLoading}
                />
              )}
            />
            {errors.confirmPassCode && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassCode.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Đặt lại Passcode
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
