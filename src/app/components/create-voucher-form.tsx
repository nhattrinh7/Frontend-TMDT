"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useCallback } from "react";
import {
  CalendarIcon,
  Package,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import { useBoundStore } from "~/zustand/store";
import { createVoucherAPI } from "~/apiRequests/voucher.apiRequest";
import { getShopProductsPaginatedAPI } from "~/apiRequests/product.apiRequest";
import { ProductWithVariants } from "~/zodSchema/product.schema";
import { toast } from "sonner";

// Schema validation với Zod
const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mã voucher phải có ít nhất 3 ký tự")
      .max(20, "Mã voucher không được quá 20 ký tự")
      .regex(/^[A-Z0-9]+$/, "Mã voucher chỉ được chứa chữ in hoa và số"),
    name: z
      .string()
      .min(5, "Tên voucher phải có ít nhất 5 ký tự")
      .max(100, "Tên voucher không được quá 100 ký tự"),
    description: z
      .string()
      .min(10, "Mô tả phải có ít nhất 10 ký tự")
      .max(500, "Mô tả không được quá 500 ký tự"),
    discountType: z.enum(["FIXED", "PERCENT"]),
    discountValue: z.coerce.number().positive("Giá trị giảm phải lớn hơn 0"),
    minOrderValue: z.coerce
      .number()
      .nonnegative("Giá trị đơn hàng tối thiểu phải >= 0")
      .default(0),
    maxDiscountValue: z.coerce
      .number()
      .nonnegative("Mức giảm tối đa phải >= 0")
      .optional(),
    startDate: z.date(),
    endDate: z.date(),
    usageLimit: z.coerce
      .number()
      .int("Số lượt sử dụng phải là số nguyên")
      .positive("Số lượt sử dụng phải lớn hơn 0")
      .min(1, "Số lượt sử dụng tối thiểu là 1"),
    perUserLimit: z.coerce
      .number()
      .int("Giới hạn mỗi người phải là số nguyên")
      .positive("Giới hạn mỗi người phải lớn hơn 0")
      .min(1, "Giới hạn mỗi người tối thiểu là 1"),
    scope: z.enum(["ALL", "PRODUCT", "CATEGORY"]),
    selectedProducts: z.array(z.string()).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.discountType === "PERCENT") {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Phần trăm giảm giá không được vượt quá 100%",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      if (data.scope === "PRODUCT") {
        return data.selectedProducts && data.selectedProducts.length > 0;
      }
      return true;
    },
    {
      message: "Vui lòng chọn ít nhất một sản phẩm",
      path: ["selectedProducts"],
    },
  );

type VoucherFormValues = z.infer<typeof voucherSchema>;

interface CreateVoucherFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

// Component DateTimePicker
interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
}

function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Chọn ngày và giờ",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    if (value) {
      selectedDate.setHours(value.getHours());
      selectedDate.setMinutes(value.getMinutes());
      selectedDate.setSeconds(value.getSeconds());
    } else {
      selectedDate.setHours(0, 0, 0, 0);
    }

    onChange(selectedDate);
  };

  const handleTimeChange = (
    type: "hours" | "minutes" | "seconds",
    newValue: number,
  ) => {
    const newDate = value ? new Date(value) : new Date();

    if (type === "hours") newDate.setHours(newValue);
    if (type === "minutes") newDate.setMinutes(newValue);
    if (type === "seconds") newDate.setSeconds(newValue);

    onChange(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-[#004643]/20 bg-white text-gray-900",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? format(value, "dd/MM/yyyy HH:mm:ss", { locale: vi })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={disabled}
          initialFocus
          classNames={{
            months:
              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption:
              "flex justify-center pt-1 relative items-center text-gray-900",
            caption_label: "text-sm font-medium text-gray-900",
            nav: "space-x-1 flex items-center",
            nav_button:
              "h-7 w-7 bg-[#004643] p-0 hover:bg-[#003330] text-white rounded-md",
            nav_button_previous: "absolute left-1 text-gray-900",
            nav_button_next: "absolute right-1 text-gray-900",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#004643]/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal text-gray-900 aria-selected:opacity-100 hover:bg-[#004643]/10 rounded-md bg-red-200",
            day_selected:
              "bg-[#004643] text-white hover:bg-[#004643] hover:text-white focus:bg-[#004643] focus:text-white",
            day_today: "bg-gray-100 text-gray-900 font-semibold",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-300 opacity-50",
            day_range_middle:
              "aria-selected:bg-[#004643]/10 aria-selected:text-gray-900",
            day_hidden: "visible",
          }}
        />
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              Thời gian:
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Giờ</label>
              <Select
                value={value ? value.getHours().toString() : "0"}
                onValueChange={(val) =>
                  handleTimeChange("hours", parseInt(val))
                }
              >
                <SelectTrigger className="h-9 bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {hours.map((h) => (
                    <SelectItem
                      key={h}
                      value={h.toString()}
                      className="text-gray-900"
                    >
                      {h.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Phút</label>
              <Select
                value={value ? value.getMinutes().toString() : "0"}
                onValueChange={(val) =>
                  handleTimeChange("minutes", parseInt(val))
                }
              >
                <SelectTrigger className="h-9 bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {minutes.map((m) => (
                    <SelectItem
                      key={m}
                      value={m.toString()}
                      className="text-gray-900"
                    >
                      {m.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Giây</label>
              <Select
                value={value ? value.getSeconds().toString() : "0"}
                onValueChange={(val) =>
                  handleTimeChange("seconds", parseInt(val))
                }
              >
                <SelectTrigger className="h-9 bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {seconds.map((s) => (
                    <SelectItem
                      key={s}
                      value={s.toString()}
                      className="text-gray-900"
                    >
                      {s.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => setIsOpen(false)}
          >
            Xác nhận
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CreateVoucherForm({
  onClose,
  onSuccess,
}: CreateVoucherFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState<
    ProductWithVariants[]
  >([]);
  const shop = useBoundStore((state) => state.shop);
  if (!shop) throw new Error("Can not load shop, please create shop first");

  // Product selection dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedProducts, setTempSelectedProducts] = useState<string[]>(
    [],
  );
  const PRODUCTS_PER_PAGE = 5;

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discountType: "PERCENT",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountValue: undefined,
      usageLimit: 100,
      perUserLimit: 1,
      scope: "ALL",
      selectedProducts: [],
    },
  });

  const watchScope = form.watch("scope");
  const watchDiscountType = form.watch("discountType");

  // Fetch products when dialog is opened
  const fetchProducts = useCallback(
    async (page: number, search: string) => {
      setProductsLoading(true);
      try {
        const response = await getShopProductsPaginatedAPI({
          shopId: shop.id,
          page,
          limit: PRODUCTS_PER_PAGE,
          search: search || undefined,
          approveStatus: "ACCEPTED",
          isActive: true,
        });
        setProducts(response.items);
        setTotalPages(response.meta.totalPages);
      } catch {
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setProductsLoading(false);
      }
    },
    [shop.id],
  );

  // Open dialog and fetch products
  const handleOpenDialog = () => {
    setTempSelectedProducts([...selectedProducts]);
    setIsDialogOpen(true);
    setCurrentPage(1);
    setSearchTerm("");
    fetchProducts(1, "");
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProducts(newPage, searchTerm);
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setTempSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Confirm product selection
  const handleConfirmSelection = () => {
    setSelectedProducts(tempSelectedProducts);
    form.setValue("selectedProducts", tempSelectedProducts);

    // Store selected product details for display
    const selectedDetails = products.filter((p) =>
      tempSelectedProducts.includes(p.id),
    );
    setSelectedProductDetails((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newProducts = selectedDetails.filter((p) => !existingIds.has(p.id));
      return [
        ...prev.filter((p) => tempSelectedProducts.includes(p.id)),
        ...newProducts,
      ];
    });

    setIsDialogOpen(false);
  };

  // Remove product from selection
  const removeProduct = (productId: string) => {
    const newSelected = selectedProducts.filter((id) => id !== productId);
    setSelectedProducts(newSelected);
    setSelectedProductDetails((prev) => prev.filter((p) => p.id !== productId));
    form.setValue("selectedProducts", newSelected);
  };

  const onSubmit = async (data: VoucherFormValues) => {
    try {
      // Chuyển đổi Date sang ISO string (có múi giờ)
      const dataToCreate = {
        shopId: shop.id,
        code: data.code,
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountValue:
          data.discountType === "PERCENT" ? data.maxDiscountValue : undefined,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        scope: data.scope,
        selectedProducts:
          data.scope === "PRODUCT" ? data.selectedProducts : undefined,
      };

      // API call
      await createVoucherAPI(dataToCreate);
      toast.success("Tạo voucher thành công!");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Không thể tạo voucher");
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-[#004643]/20 shadow-lg bg-white">
      <CardHeader className="bg-[#f0f7f6] border-b border-[#004643]/10">
        <CardTitle className="text-2xl font-bold text-[#004643]">
          Tạo Voucher Mới
        </CardTitle>
        <CardDescription className="text-[#004643]/70 font-semibold">
          Điền thông tin để tạo voucher giảm giá cho cửa hàng
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Mã voucher và Tên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Mã Voucher <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: SUMMER2024"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        className="border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Chỉ sử dụng chữ in hoa và số
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Tên Voucher <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Giảm giá mùa hè"
                        {...field}
                        className="border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#004643] font-semibold">
                    Mô Tả <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết về voucher..."
                      className="min-h-[100px] border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kiểu giảm giá và Giá trị */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Kiểu Giảm Giá <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900">
                          <SelectValue placeholder="Chọn kiểu giảm giá" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="PERCENT" className="text-gray-900">
                          Phần trăm (%)
                        </SelectItem>
                        <SelectItem value="FIXED" className="text-gray-900">
                          Số tiền cố định (VNĐ)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Giá Trị Giảm <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder={
                            watchDiscountType === "PERCENT"
                              ? "VD: 10"
                              : "VD: 50000"
                          }
                          {...field}
                          className="border-[#004643]/20 focus:border-[#004643] pr-12 bg-white text-gray-900"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004643]/70 font-semibold">
                          {watchDiscountType === "PERCENT" ? "%" : "VNĐ"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ngày bắt đầu và kết thúc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#004643] font-semibold">
                      Ngày Bắt Đầu <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        placeholder="Chọn ngày và giờ bắt đầu"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#004643] font-semibold">
                      Ngày Kết Thúc <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        placeholder="Chọn ngày và giờ kết thúc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Giới hạn sử dụng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Tổng Số Lượt Sử Dụng{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 100"
                        {...field}
                        className="border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tổng số lần voucher có thể được sử dụng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perUserLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Giới Hạn Mỗi Người <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 1"
                        {...field}
                        className="border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Số lần mỗi người có thể sử dụng voucher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Giá trị đơn hàng tối thiểu và Mức giảm tối đa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Giá Trị Đơn Hàng Tối Thiểu{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="VD: 100000"
                          {...field}
                          className="border-[#004643]/20 focus:border-[#004643] pr-12 bg-white text-gray-900"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004643]/70 font-semibold">
                          VNĐ
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Giá trị đơn hàng tối thiểu để áp dụng voucher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchDiscountType === "PERCENT" && (
                <FormField
                  control={form.control}
                  name="maxDiscountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#004643] font-semibold">
                        Mức Giảm Tối Đa
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="VD: 100000"
                            {...field}
                            className="border-[#004643]/20 focus:border-[#004643] pr-12 bg-white text-gray-900"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004643]/70 font-semibold">
                            VNĐ
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Số tiền giảm tối đa khi áp dụng voucher phần trăm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Phạm vi áp dụng */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#004643] font-semibold">
                    Phạm Vi Áp Dụng <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900">
                        <SelectValue placeholder="Chọn phạm vi áp dụng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="ALL" className="text-gray-900">
                        Toàn bộ sản phẩm
                      </SelectItem>
                      <SelectItem value="PRODUCT" className="text-gray-900">
                        Sản phẩm cụ thể
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Voucher sẽ áp dụng cho toàn shop hoặc chỉ một số sản phẩm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nút chọn sản phẩm */}
            {watchScope === "PRODUCT" && (
              <FormField
                control={form.control}
                name="selectedProducts"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-[#004643] font-semibold">
                      Sản Phẩm Áp Dụng <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3 text-gray-700">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleOpenDialog}
                          className="w-full border-[#004643]/20 hover:bg-[#004643]/5"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Chọn Sản Phẩm ({selectedProducts.length} đã chọn)
                        </Button>

                        {/* Danh sách sản phẩm đã chọn */}
                        {selectedProductDetails.length > 0 && (
                          <div className="border border-[#004643]/20 rounded-md divide-y divide-[#004643]/10">
                            {selectedProductDetails.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 p-3"
                              >
                                <Image
                                  src={product.mainImage}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-md border"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.variants?.length || 0} phân loại
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProduct(product.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Dialog chọn sản phẩm */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-white">
                <DialogHeader>
                  <DialogTitle className="text-[#004643]">
                    Chọn sản phẩm áp dụng voucher
                  </DialogTitle>
                  <DialogDescription>
                    Chọn các sản phẩm mà voucher này sẽ được áp dụng
                  </DialogDescription>
                </DialogHeader>

                {/* Search bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9 border-[#004643]/20"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearch}
                    className="border-[#004643]/20"
                  >
                    Tìm
                  </Button>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="flex-1 overflow-y-auto min-h-[300px]">
                  {productsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004643]"></div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleProductSelection(product.id)}
                        >
                          <Checkbox
                            checked={tempSelectedProducts.includes(product.id)}
                            onCheckedChange={() =>
                              toggleProductSelection(product.id)
                            }
                            className="border-[#004643]/30 data-[state=checked]:bg-[#004643] data-[state=checked]:border-[#004643]"
                          />
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 object-cover rounded-md border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.variants && product.variants.length > 0
                                ? `${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.variants[0].price)} - ${product.variants.length} phân loại`
                                : "Không có phân loại"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-3 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="border-[#004643]/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="border-[#004643]/20"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <DialogFooter>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-gray-600">
                      Đã chọn {tempSelectedProducts.length} sản phẩm
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-[#004643]/20"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="button"
                        onClick={handleConfirmSelection}
                        className="bg-[#004643] hover:bg-[#003330] text-white"
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-[#004643]/10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#004643] hover:bg-[#003330] text-white"
              >
                Tạo Voucher
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Demo wrapper
export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Button onClick={() => setIsOpen(true)} className="bg-[#004643]">
          Mở Form Tạo Voucher
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <CreateVoucherForm onClose={() => setIsOpen(false)} />
    </div>
  );
}
