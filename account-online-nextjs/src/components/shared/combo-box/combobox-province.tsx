"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { ProvinceModel } from "@/models/address/address.response";
import { useTranslations } from "next-intl";

interface ComboboxSelectProvinceProps {
  dataSelect: ProvinceModel | null;
  onChangeSelected: (item: ProvinceModel | null) => void;
  disabled?: boolean;
  provinces: ProvinceModel[];
  isLoading?: boolean;
  locale?: string;
}

export function ComboboxSelectProvince({
  dataSelect,
  onChangeSelected,
  disabled = false,
  provinces,
  isLoading = false,
  locale = "en",
}: ComboboxSelectProvinceProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        (document.activeElement as HTMLElement)?.blur();
      });
    }
  }, [open]);
  const [searchTerm, setSearchTerm] = useState("");

  // change language
  const translate = useTranslations("common");

  const getName = (province: ProvinceModel) => {
    return locale === "kh" ? province.provinceKh : province.provinceEn;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return provinces;

    const lowerSearch = searchTerm.toLowerCase();
    return provinces.filter((province) =>
      getName(province).toLowerCase().includes(lowerSearch)
    );
  }, [provinces, searchTerm, locale]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-12 text-sm flex-1 justify-between bg-white border-gray-300",
            !dataSelect && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {isLoading
            ? translate("loading")
            : dataSelect
              ? getName(dataSelect)
              : translate("selectProvince")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput
            placeholder={translate("searchProvince")}
            value={searchTerm}
            onValueChange={setSearchTerm}
            autoFocus={false}
          />
          <CommandList
            className="max-h-60 overflow-y-auto"
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
            <CommandEmpty>No province found.</CommandEmpty>
            <CommandGroup>
              {filteredData?.map((province) => (
                <CommandItem
                  key={province.provinceCode}
                  value={getName(province)}
                  onSelect={() => {
                    onChangeSelected(province);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      dataSelect?.provinceCode === province.provinceCode
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getName(province)}
                </CommandItem>
              ))}
            </CommandGroup>

            {isLoading && (
              <div className="text-center py-2">
                <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}