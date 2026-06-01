"use client";
import Loading from "@/components/shared/common/loading";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useState, useCallback, Suspense } from "react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInputField } from "@/components/acc-online/form-field/form-field";
import { getAccountOnlineService } from "@/services/get-account/acc-online.service";
import { GetAccountModel } from "@/models/acc-online-get/account-online.response";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE ?? "";

function getImageUrl(filename: string | undefined | null): string | null {
  if (!filename) return null;
  return `${IMAGE_BASE_URL}/api/customer-images/${filename}`;
}

function AccountPageContent() {
  const [searchCif, setSearchCif] = useState("");
  const [searchLegalId, setSearchLegalId] = useState("");
  const [account, setAccount] = useState<GetAccountModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchCif, 400);
  const debouncedSearchLegalId = useDebounce(searchLegalId, 400);

  const fetchingAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAccountOnlineService({
        cif: searchCif,
        legalId: searchLegalId,
      });
      if (response) {
        AppToast({ type: "success", message: response?.message });
        setAccount(response);
      } else {
        AppToast({ type: "error", message: "No data found." });
      }
    } catch (error: any) {
      console.error("Failed to fetch account : ", error);
      AppToast({ type: "error", message: error.errorMessage || "Failed to fetch account." });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, debouncedSearchLegalId]);

  const handleSearchCifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCif(e.target.value);
  };

  const handleSearchLegalIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchLegalId(e.target.value);
  };

  const handleSearch = () => {
    setAccount(null);
    fetchingAccount();
  };

  const downloadImage = async (
    filename: string,
    legalId: string,
    imageType: "selfie" | "nid",
  ) => {
    if (!filename) return alert("No image to download");
    try {
      const url = `${IMAGE_BASE_URL}/api/customer-images/${filename}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const extension = blob.type.replace("image/", "") || "jpg";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${legalId}_${imageType}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="mb-8">
      <Card className="h-full flex flex-col ">
        <CardContent className="space-y-6 p-6 flex flex-col h-full ">
          <div className="py-4">
            <div className="flex justify-between">
              <div className="flex flex-wrap items-center justify-start gap-4 w-full">
                <div className="relative w-full md:w-[350px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    aria-label="search-reference"
                    autoComplete="search-reference"
                    type="search"
                    placeholder={"Enter your CIF ..."}
                    value={searchCif}
                    onChange={handleSearchCifChange}
                    className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                  />
                </div>
                <div className="relative w-full md:w-[350px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    aria-label="search-reference"
                    autoComplete="search-reference"
                    type="search"
                    placeholder={"Enter your Legal Id ..."}
                    value={searchLegalId}
                    onChange={handleSearchLegalIdChange}
                    className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                  />
                </div>
              </div>
              <div>
                <Button onClick={() => handleSearch()}>{"Search"}</Button>
              </div>
            </div>

            <div className="w-full p-4">
              <Separator className="bg-gray-300" />
            </div>

            {/* ID Card and Selfie Image */}
            <div className="flex md:flex-row flex-col justify-evenly items-center mb-16 lg:gap-14 gap-8">
              {/* Card Image */}
              <div>
                <p className="text-base text-gray-600 mb-4 text-center">
                  Card Image
                </p>
                <div className="relative">
                  <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                  <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                  <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                  <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>
                  <div className="relative lg:w-96 w-80 h-60 rounded overflow-hidden group cursor-pointer">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (account?.data?.nidImageName)
                          downloadImage(
                            account.data.nidImageName,
                            account.data.legalId,
                            "nid",
                          );
                      }}
                    >
                      <img
                        src={
                          getImageUrl(account?.data?.nidImageName) ??
                          "/app/image_selfie_4K.png?height=192&width=320"
                        }
                        alt="NID Image"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <p className="text-white text-lg font-semibold">
                          Download Image
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Selfie Image */}
              <div>
                <p className="text-base text-gray-600 mb-4 text-center">
                  Selfie Image
                </p>
                <div className="relative">
                  <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                  <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                  <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                  <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>
                  <div className="relative lg:w-96 w-80 h-60 rounded overflow-hidden group cursor-pointer">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (account?.data?.selfieImageName)
                          downloadImage(
                            account.data.selfieImageName,
                            account.data.legalId,
                            "selfie",
                          );
                      }}
                    >
                      <img
                        src={
                          getImageUrl(account?.data?.selfieImageName) ??
                          "/app/image_selfie_4K.png?height=192&width=320"
                        }
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <p className="text-white text-lg font-semibold">
                          Download Image
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name (KH) */}
              <FormInputField
                label={"First Name (KH)"}
                placeholder={"First Name (KH)"}
                value={account?.data?.legalFirstNameKh ?? ""}
                onChange={(value) => null}
                disabled={true}
              />
              {/* Last Name (KH) */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  {"Last Name (KH)"}
                </label>
                <Input
                  placeholder="Last Name (KH)"
                  value={account?.data?.legalLastNameKh || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Family Name */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Family Name
                </label>
                <Input
                  placeholder="Family Name"
                  value={account?.data?.legalLastNameEn || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Given Name */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Given Name
                </label>
                <Input
                  placeholder="Given Name"
                  value={account?.data?.legalFirstNameEn || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Marital Status */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Marital Status
                </label>
                <Input
                  placeholder="Marital Status"
                  value={account?.data?.maritalStatus || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Gender */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Gender
                </label>
                <Input
                  placeholder="Gender"
                  value={account?.data?.legalGender || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Occupation */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Occupation
                </label>
                <Input
                  placeholder="Occupation"
                  value={account?.data?.occupation || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* DOB */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Date Of Birth
                </label>
                <Input
                  placeholder="Date Of Birth"
                  value={account?.data?.legalDateOfBirth || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Nationality */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Nationality
                </label>
                <Input
                  placeholder="Nationality"
                  value={account?.data?.nationality || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Phone Number */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Phone Number
                </label>
                <Input
                  placeholder="Phone Number"
                  value={account?.data?.phoneNumber || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* CIF */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  CIF
                </label>
                <Input
                  placeholder="CIF"
                  value={account?.data?.cif || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Legal ID */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Legal ID
                </label>
                <Input
                  placeholder="Legal ID"
                  value={account?.data?.legalId || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Address */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Address
                </label>
                <Input
                  placeholder="Address"
                  value={account?.data?.legalAddress || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
              {/* Place Of Birth */}
              <div>
                <label className="text-base font-medium text-gray-700 block mb-1">
                  Place Of Birth
                </label>
                <Input
                  placeholder="Place Of Birth"
                  value={account?.data?.legalPlaceOfBirth || ""}
                  onChange={(e) => null}
                  className="w-full h-10"
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountPageContent />
    </Suspense>
  );
}
