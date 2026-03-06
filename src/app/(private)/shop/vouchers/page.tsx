"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { CreateVoucherForm } from "~/app/components/create-voucher-form";
import { UpdateShopVoucherForm } from "~/app/components/update-shop-voucher-form";
import {
  getShopVouchersAPI,
  softDeleteVoucherAPI,
} from "~/apiRequests/voucher.apiRequest";
import { Voucher } from "~/zodSchema/voucher.schema";
import { useBoundStore } from "~/zustand/store";
import { toast } from "sonner";

type ScopeType = "ALL" | "CATEGORY" | "PRODUCT";
type DiscountType = "FIXED" | "PERCENT";

function VouchersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { shop } = useBoundStore();

  const activeTab = searchParams.get("status") || "ongoing";
  const isCreating = searchParams.get("action") === "create";
  const isUpdating = searchParams.get("action") === "update";
  const updateVoucherId = searchParams.get("voucherId") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 5;

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete voucher states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVouchers = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getShopVouchersAPI(shop.id);
      setVouchers(data);
    } catch {
      toast.error("Không thể tải danh sách vouchers");
    } finally {
      setLoading(false);
    }
  }, [shop?.id]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const refetchVouchers = () => {
    fetchVouchers();
  };

  // Delete voucher handlers
  const handleOpenDeleteDialog = (voucher: Voucher) => {
    setVoucherToDelete(voucher);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setVoucherToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;

    try {
      setIsDeleting(true);
      await softDeleteVoucherAPI(voucherToDelete.id);
      toast.success("Xóa voucher thành công!");
      handleCloseDeleteDialog();
      refetchVouchers();
    } catch {
      toast.error("Không thể xóa voucher");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (val: string) => {
    updateParams({ status: val, page: "1" });
  };

  const handleCreateVoucher = () => {
    updateParams({ action: "create" });
  };

  const handleCloseForm = () => {
    updateParams({ action: "", voucherId: "" });
  };

  const handleUpdateVoucher = (voucher: Voucher) => {
    updateParams({ action: "update", voucherId: voucher.id });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  const upcomingVouchers = vouchers.filter(
    (v) => new Date(v.startDate) > new Date(),
  );
  const ongoingVouchers = vouchers.filter((v) => {
    const now = new Date();
    return new Date(v.startDate) <= now && new Date(v.endDate) >= now;
  });
  const endedVouchers = vouchers.filter(
    (v) => new Date(v.endDate) < new Date(),
  );

  const getPaginatedData = (data: Voucher[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const formatDiscount = (type: DiscountType, value: number) => {
    if (type === "PERCENT") return `${value}%`;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getScopeLabel = (scope: ScopeType) => {
    switch (scope) {
      case "ALL":
        return "Toàn bộ";
      case "CATEGORY":
        return "Danh mục";
      case "PRODUCT":
        return "Sản phẩm";
      default:
        return scope;
    }
  };

  const CustomPagination = ({ totalItems }: { totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between p-4 border-t border-[#004643]/10 bg-white rounded-b-md">
        <span className="text-sm text-muted-foreground">
          Hiển thị {Math.min(currentPage * itemsPerPage, totalItems)} trên{" "}
          {totalItems} kết quả
        </span>
        <Pagination className="justify-end w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const VoucherTable = ({
    data,
    totalCount,
    showUsed = false,
    showActions = false,
  }: {
    data: Voucher[];
    totalCount: number;
    showUsed?: boolean;
    showActions?: boolean;
  }) => (
    <div className="rounded-md border border-[#004643]/10 bg-white">
      <Table>
        <TableHeader className="bg-[#f0f7f6]">
          <TableRow>
            <TableHead className="w-[200px] text-[#004643] font-semibold">
              Tên & Mã
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Loại mã
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Sản phẩm áp dụng
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Kiểu giảm giá
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Giá trị giảm
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Thời gian
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Tổng lượt
            </TableHead>
            <TableHead className="text-[#004643] font-semibold">
              Giới hạn/người
            </TableHead>
            {showUsed && (
              <TableHead className="text-[#004643] font-semibold">
                Đã dùng
              </TableHead>
            )}
            <TableHead className="text-right text-[#004643] font-semibold">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((voucher) => (
              <TableRow key={voucher.id} className="hover:bg-[#f8fbfa]">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-base text-[#004643]">
                      {voucher.name}
                    </span>
                    <span className="text-sm text-muted-foreground uppercase font-mono">
                      {voucher.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-[#004643]/20 text-[#004643] bg-[#e6f0ef]"
                  >
                    Mã shop
                  </Badge>
                </TableCell>
                <TableCell>{getScopeLabel(voucher.scope)}</TableCell>
                <TableCell>
                  {voucher.discountType === "PERCENT"
                    ? "Phần trăm"
                    : "Số tiền cố định"}
                </TableCell>
                <TableCell className="font-semibold text-[#004643]">
                  {formatDiscount(voucher.discountType, voucher.discountValue)}
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {new Date(voucher.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </TableCell>
                <TableCell>{voucher.usageLimit}</TableCell>
                <TableCell>{voucher.perUserLimit}</TableCell>
                {showUsed && <TableCell>{voucher.usedCount}</TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[#004643] hover:bg-[#004643]/10 hover:text-[#004643]"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      {showActions && (
                        <DropdownMenuItem
                          className="cursor-pointer text-[#004643] focus:bg-[#004643]/10 focus:text-[#004643]"
                          onClick={() => handleUpdateVoucher(voucher)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
                        onClick={() => handleOpenDeleteDialog(voucher)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={showUsed ? 11 : 10}
                className="h-24 text-center"
              >
                Không tìm thấy voucher nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CustomPagination totalItems={totalCount} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-8 bg-[#fdfdfd] min-h-screen">
      {isCreating ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            variant="ghost"
            onClick={handleCloseForm}
            className="mb-4 text-[#004643]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại danh sách
          </Button>
          <CreateVoucherForm
            onClose={handleCloseForm}
            onSuccess={refetchVouchers}
          />
        </div>
      ) : isUpdating && updateVoucherId ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            variant="ghost"
            onClick={handleCloseForm}
            className="mb-4 text-[#004643]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại danh sách
          </Button>
          <UpdateShopVoucherForm
            voucherId={updateVoucherId}
            onClose={handleCloseForm}
            onSuccess={refetchVouchers}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#004643]">
                Quản lý Vouchers
              </h1>
              <p className="text-[#004643]/70 mt-1 font-semibold">
                Quản lý và theo dõi các chương trình khuyến mãi của cửa hàng.
              </p>
            </div>
          </div>

          {/* Top Cards */}
          <div className="max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-[#004643] bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-[#004643]">
                  Vouchers Giảm Giá
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-[#004643]/70 max-w-[240px] font-semibold">
                  Tạo mã giảm giá áp dụng cho tất cả các sản phẩm có trong cửa
                  hàng của bạn hoặc chỉ cho một/một vài sản phẩm nhất định.
                </div>
                <Button
                  onClick={handleCreateVoucher}
                  className="bg-[#004643] hover:bg-[#003330] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Tạo Voucher
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="bg-white p-1 border border-[#004643]/20 shadow-sm rounded-md [&>button]:text-[#004643] [&>button]:font-semibold">
                <TabsTrigger
                  value="upcoming"
                  style={{ color: "#004643", fontWeight: "600" }}
                  className="data-[state=active]:bg-[#004643] data-[state=active]:text-white"
                >
                  Chưa diễn ra ({upcomingVouchers.length})
                </TabsTrigger>
                <TabsTrigger
                  value="ongoing"
                  style={{ color: "#004643", fontWeight: "600" }}
                  className="data-[state=active]:bg-[#004643] data-[state=active]:text-white"
                >
                  Đang diễn ra ({ongoingVouchers.length})
                </TabsTrigger>
                <TabsTrigger
                  value="ended"
                  style={{ color: "#004643", fontWeight: "600" }}
                  className="data-[state=active]:bg-[#004643] data-[state=active]:text-white"
                >
                  Đã kết thúc ({endedVouchers.length})
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004643]"></div>
                  </div>
                ) : (
                  <>
                    <TabsContent value="upcoming">
                      <VoucherTable
                        data={getPaginatedData(upcomingVouchers)}
                        totalCount={upcomingVouchers.length}
                        showActions
                      />
                    </TabsContent>
                    <TabsContent value="ongoing">
                      <VoucherTable
                        data={getPaginatedData(ongoingVouchers)}
                        totalCount={ongoingVouchers.length}
                        showUsed
                        showActions
                      />
                    </TabsContent>
                    <TabsContent value="ended">
                      <VoucherTable
                        data={getPaginatedData(endedVouchers)}
                        totalCount={endedVouchers.length}
                        showUsed
                      />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#004643]">
              Xác nhận xóa voucher
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa voucher{" "}
              <span className="font-semibold">
                &quot;{voucherToDelete?.name}&quot;
              </span>{" "}
              (Mã: {voucherToDelete?.code})? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCloseDeleteDialog}
              className="border-[#004643]/20 text-[#004643]"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function VouchersPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004643]"></div>
        </div>
      }
    >
      <VouchersContent />
    </Suspense>
  );
}
