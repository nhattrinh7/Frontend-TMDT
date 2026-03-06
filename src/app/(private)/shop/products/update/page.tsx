"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "sonner";
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
import {
  UpdateProductSchema,
  UpdateProductInput,
  ProductDetail,
  ProductVariantWithStock,
  Classification,
  ProductVariantInput,
} from "~/zodSchema/product.schema";
import {
  getProductByIdAPI,
  updateProductAPI,
  uploadImageAPI,
  uploadVideoAPI,
} from "~/apiRequests/product.apiRequest";
import VariantClassifications from "~/components/products/VariantClassifications";
import SkuTable from "~/components/products/SkuTable";
import ImageUploader from "~/components/products/ImageUploader";
import GalleryUploader from "~/components/products/GalleryUploader";
import VideoUploader from "~/components/products/VideoUploader";

function UpdateProductLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function UpdateProductPage() {
  return (
    <Suspense fallback={<UpdateProductLoading />}>
      <UpdateProductContent />
    </Suspense>
  );
}

function UpdateProductContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [pendingFormData, setPendingFormData] =
    useState<UpdateProductInput | null>(null);

  // State cho classifications và variants
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      name: "",
      descriptions: "",
      mainImage: "",
      galleryImage: [],
      video: null,
      unit: "",
      attributes: {},
      classifications: [],
      variants: [],
    },
  });

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        toast.error("Không tìm thấy ID sản phẩm");
        router.push("/shop/products");
        return;
      }

      try {
        setIsLoading(true);

        // Fetch product
        const productData = await getProductByIdAPI(productId);
        if (!productData) {
          toast.error("Không tìm thấy sản phẩm");
          router.push("/shop/products");
          return;
        }

        setProduct(productData);

        // Get category name from response
        if (productData.category?.name) {
          setCategoryName(productData.category.name);
        }

        // Parse classifications từ product data NẾU CÓ
        if (
          productData.classifications &&
          productData.classifications.length > 0
        ) {
          const parsedClassifications = productData.classifications.map(
            (c, idx) => ({
              id: `classification-${idx}`,
              name: c.name,
              options: c.values.map((v, vIdx) => ({
                id: `option-${idx}-${vIdx}`,
                value: v,
              })),
            }),
          );
          setClassifications(parsedClassifications);

          // Parse variants CÓ SẴN với đầy đủ thông tin
          const parsedVariants = productData.variants.map(
            (v: ProductVariantWithStock) => ({
              id: v.id, // GIỮ ID để update variant hiện có
              sku: v.sku,
              price: v.price,
              stock: v.stock ?? 0,
              image: v.image || null,
            }),
          );
          setVariants(parsedVariants);
        }

        // Set form values
        form.reset({
          name: productData.name,
          descriptions: productData.descriptions,
          mainImage: productData.mainImage,
          galleryImage: productData.galleryImage || [],
          video: productData.video || null,
          unit: productData.unit,
          attributes: productData.attributes as Record<string, string>,
          classifications: productData.classifications || [],
          variants: productData.variants.map((v: ProductVariantWithStock) => ({
            id: v.id,
            sku: v.sku,
            price: v.price,
            stock: v.stock ?? 0,
            image: v.image || null,
          })),
        });
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Không thể tải thông tin sản phẩm");
        router.push("/shop/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, router, form]);

  // Sync variants với form khi variants thay đổi
  useEffect(() => {
    form.setValue("variants", variants);
  }, [variants, form]);

  const handleMainImageUpload = async (file: File): Promise<string> => {
    const response = await uploadImageAPI(file);
    if (response?.url) {
      form.setValue("mainImage", response.url);
      return response.url;
    }
    throw new Error("Upload failed");
  };

  const handleGalleryImageUpload = async (file: File): Promise<string> => {
    const response = await uploadImageAPI(file);
    if (response?.url) {
      const currentGallery = form.getValues("galleryImage") || [];
      form.setValue("galleryImage", [...currentGallery, response.url]);
      return response.url;
    }
    throw new Error("Upload failed");
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    const response = await uploadVideoAPI(file);
    if (response?.url) {
      form.setValue("video", response.url);
      return response.url;
    }
    throw new Error("Upload failed");
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const response = await uploadImageAPI(file);
    return response.url;
  }, []);

  const onSubmit = async (data: UpdateProductInput) => {
    if (!productId) return;

    // Nếu sản phẩm bị REJECTED, hiển thị popup xác nhận trước khi cập nhật
    if (product?.approveStatus === "REJECTED") {
      setPendingFormData(data);
      setShowResubmitDialog(true);
      return;
    }

    // Nếu không phải REJECTED, cập nhật trực tiếp
    await performUpdate(data);
  };

  const performUpdate = async (data: UpdateProductInput) => {
    if (!productId) return;

    try {
      setIsSubmitting(true);

      // Chuyển đổi classifications sang format cho API
      const classificationsForAPI = classifications
        .filter((c) => c.name && c.options.some((o) => o.value))
        .map((c) => ({
          name: c.name,
          values: c.options.filter((o) => o.value).map((o) => o.value),
        }));

      // Chuyển đổi variants
      const variantsForAPI = variants.map((v) => {
        const optionValues = v.sku.split("-"); // SKU format: "Đỏ-M"
        return {
          id: v.id, // Có thể undefined nếu là variant mới
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          image: v.image || "",
          optionValues:
            classificationsForAPI.length > 0 ? optionValues : undefined,
        };
      });

      const payload = {
        ...data,
        classifications:
          classificationsForAPI.length > 0 ? classificationsForAPI : undefined,
        variants: variantsForAPI,
      };

      await updateProductAPI(productId, payload);
      toast.success("Đã cập nhật sản phẩm thành công");
      router.push("/shop/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Không thể cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormData) return;
    setShowResubmitDialog(false);
    await performUpdate(pendingFormData);
    setPendingFormData(null);
  };

  const handleCancelUpdate = () => {
    setShowResubmitDialog(false);
    setPendingFormData(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-muted-foreground">
            Đang tải thông tin sản phẩm...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/shop/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#004643]">
              Cập nhật sản phẩm
            </h1>
            <p className="text-sm text-muted-foreground">
              Chỉnh sửa thông tin sản phẩm của bạn
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Basic Info */}
            <div className="space-y-6 lg:col-span-2">
              {/* Product Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên sản phẩm{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên sản phẩm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mô tả <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả sản phẩm"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Đơn vị <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Cái, Chiếc, Bộ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category Card (Read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle>Ngành hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">
                      {categoryName || "Đang tải..."}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    * Không thể thay đổi ngành hàng sau khi tạo sản phẩm
                  </p>
                </CardContent>
              </Card>

              {/* Attributes Card */}
              {product.attributes &&
                Object.keys(product.attributes).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Thuộc tính sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(
                        product.attributes as Record<string, string>,
                      ).map(([key]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name={`attributes.${key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{key}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

              {/* Phân loại hàng */}
              <Card>
                <CardHeader>
                  <CardTitle>Phân loại hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <VariantClassifications
                    value={classifications}
                    onChange={setClassifications}
                    maxClassifications={5}
                    editMode={true}
                  />
                </CardContent>
              </Card>

              {/* Bảng SKU - chỉ hiện khi có classifications */}
              {classifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách phân loại hàng (SKU)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkuTable
                      classifications={classifications}
                      value={variants}
                      onChange={setVariants}
                      onUploadImage={handleImageUpload}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Media */}
            <div className="space-y-6">
              {/* Main Image Card */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Ảnh chính <span className="text-destructive">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={form.watch("mainImage")}
                    onChange={(url) => form.setValue("mainImage", url || "")}
                    onUpload={handleMainImageUpload}
                  />
                  {form.formState.errors.mainImage && (
                    <p className="mt-2 text-sm text-destructive">
                      {form.formState.errors.mainImage.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Gallery Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Ảnh phụ (tối đa 5)</CardTitle>
                </CardHeader>
                <CardContent>
                  <GalleryUploader
                    value={form.watch("galleryImage") || []}
                    onChange={(urls) => form.setValue("galleryImage", urls)}
                    onUpload={handleGalleryImageUpload}
                    maxImages={5}
                  />
                </CardContent>
              </Card>

              {/* Video Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Video sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoUploader
                    value={form.watch("video") || null}
                    onChange={(url) => form.setValue("video", url)}
                    onUpload={handleVideoUpload}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/shop/products">
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              className="gap-2 bg-[#004643] hover:bg-[#004643]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* AlertDialog xác nhận xin duyệt lại sản phẩm */}
      <AlertDialog
        open={showResubmitDialog}
        onOpenChange={setShowResubmitDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xin duyệt lại sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Sản phẩm này trước đó đã bị từ chối bởi Admin Szone. Nếu bạn cập
              nhật sản phẩm này, đồng nghĩa với việc bạn xin Admin Szone duyệt
              lại sản phẩm. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpdate}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpdate}
              className="bg-[#004643] hover:bg-[#004643]/90"
            >
              Đồng ý và cập nhật
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
