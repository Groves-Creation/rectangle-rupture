"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ImagePlus, LoaderCircle, PackagePlus } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCatalogProductAction } from "@/lib/actions/catalog";
import type { CatalogIngestMetadata } from "@/lib/api/types";

export function ProductIngestDialog({
  metadata,
}: {
  metadata: CatalogIngestMetadata;
}) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdSku, setCreatedSku] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    setCreatedSku(null);
    startTransition(async () => {
      const result = await createCatalogProductAction(formData);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setCreatedSku(result.data.sku);
      setPreview(null);
      formRef.current?.reset();
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PackagePlus aria-hidden="true" />
          Add product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingest a product</DialogTitle>
          <DialogDescription>
            Add the sellable SKU, customer pricing, opening stock, and product photo.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Product was not created</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {createdSku ? (
          <Alert>
            <CheckCircle2 aria-hidden="true" />
            <div>
              <AlertTitle>Product ready for customers</AlertTitle>
              <AlertDescription>
                SKU {createdSku} was added to the catalog. You can add another product now.
              </AlertDescription>
            </div>
          </Alert>
        ) : null}

        <form ref={formRef} action={submit} className="grid gap-6">
          <section className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Product identity</h3>
              <p className="text-xs text-muted-foreground">
                Brand and category suggestions accept a new value too.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" name="name" required placeholder="Blue Dream Gummies" />
              <Field label="Variant" name="variantName" placeholder="10 pack · 100 mg" />
              <Field label="Brand" name="brandName" list="brand-options" placeholder="Brand name" />
              <Field
                label="Category"
                name="categoryName"
                list="category-options"
                placeholder="Category name"
              />
              <datalist id="brand-options">
                {metadata.brands.map((brand) => <option key={brand} value={brand} />)}
              </datalist>
              <datalist id="category-options">
                {metadata.categories.map((category) => <option key={category} value={category} />)}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                maxLength={4000}
                placeholder="What customers should know about this product"
              />
            </div>
          </section>

          <section className="grid gap-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Sellable SKU</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="SKU" name="sku" required placeholder="BD-GUM-100" />
              <Field label="UPC / barcode" name="barcode" placeholder="012345678905" />
              <Field
                label="Units per case"
                name="unitsPerCase"
                type="number"
                min="1"
                max="100000"
                defaultValue="1"
                required
              />
              <Field
                label="Unit price"
                name="unitPrice"
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder="12.50"
                required
              />
              <Field
                label="Case price"
                name="casePrice"
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder="Optional"
              />
              <Field
                label="Minimum order"
                name="minimumOrderQuantity"
                type="number"
                min="1"
                max="100000"
                defaultValue="1"
                required
              />
            </div>
            <label className="flex w-fit items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isAgeRestricted"
                className="size-4 rounded border-input accent-primary"
              />
              Age-restricted product
            </label>
          </section>

          <section className="grid gap-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Opening inventory</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="warehouseId">Warehouse</Label>
                <Select name="warehouseId" defaultValue={metadata.warehouses[0]?.id} required>
                  <SelectTrigger id="warehouseId">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata.warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.code} — {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field
                label="Opening stock (units)"
                name="initialStock"
                type="number"
                min="0"
                max="100000000"
                defaultValue="0"
                required
              />
            </div>
          </section>

          <section className="grid gap-3 border-t border-border pt-5">
            <div>
              <h3 className="text-sm font-semibold">Product photo</h3>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP · one image · 4 MB maximum
              </p>
            </div>
            <label className="grid cursor-pointer grid-cols-[96px_1fr] items-center gap-4 rounded-lg border border-dashed border-input p-3 transition-colors hover:bg-accent/50">
              <span
                role="img"
                aria-label={preview ? "Selected product image preview" : "No product image selected"}
                className="flex aspect-square items-center justify-center rounded-md bg-muted bg-cover bg-center"
                style={preview ? { backgroundImage: `url("${preview}")` } : undefined}
              >
                {preview ? null : <ImagePlus className="size-7 text-muted-foreground" aria-hidden="true" />}
              </span>
              <span>
                <span className="block text-sm font-medium">Choose a product image</span>
                <span className="block text-xs text-muted-foreground">
                  The file is checked again by the API before it is stored.
                </span>
              </span>
              <input
                className="sr-only"
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    setPreview(null);
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () =>
                    setPreview(typeof reader.result === "string" ? reader.result : null);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isPending || metadata.warehouses.length === 0}>
              {isPending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {isPending ? "Creating product…" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
