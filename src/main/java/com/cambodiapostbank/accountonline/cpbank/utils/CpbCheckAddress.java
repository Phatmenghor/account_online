<<<<<<< HEAD
//package com.cambodiapostbank.accountonline.cpbank.utils;
=======
package com.cambodiapostbank.accountonline.cpbank.utils;//package com.cambodiapostbank.accountonline.cpbank.utils;
>>>>>>> customer_register_v1
//
//import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;
//import org.json.JSONArray;
//import org.json.JSONException;
//import org.json.JSONObject;
//import org.springframework.core.io.ClassPathResource;
//
//import java.io.BufferedReader;
//import java.io.IOException;
//import java.io.InputStreamReader;
//import java.nio.charset.StandardCharsets;
//
//public class CpbCheckAddress {
//        public static boolean checkAddressService(String province, String district, String commune, String village, CustomerRequestDto customer) {
//            boolean isDefaultAddressUsed = false;
//            try {
//                // Read the JSON file
//                ClassPathResource resource = new ClassPathResource("Address/Address.json");
//                BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
//                StringBuilder jsonBuilder = new StringBuilder();
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    jsonBuilder.append(line);
//                }
//                reader.close();
//                String json = jsonBuilder.toString();
//
//                // Parse the JSON data
//                org.json.JSONObject addressData = new org.json.JSONObject(json);
//
//                boolean addressFound = false;
//                String provinceCode = null;
//                String districtCode = null;
//                String communeCode = null;
//                String villageCode = null;
//
//                // Find the province
//                org.json.JSONArray provinces = addressData.getJSONArray("Province");
//
//                // Find the province
//                for (int i = 0; i < provinces.length(); i++) {
//                    org.json.JSONObject provinceObj = provinces.getJSONObject(i);
//                    String provinceDesc = provinceObj.getString("PROVINCE_DESC");
//                    if (provinceDesc.equals(province)) {
//                        provinceCode = String.valueOf(provinceObj.getInt("PROVINCE_CODE"));
//
//                        // Find District With The Province
//                        org.json.JSONArray districts = addressData.getJSONArray("District");
//                        for (int j = 0; j < districts.length(); j++) {
//                            org.json.JSONObject districtObj = districts.getJSONObject(j);
//                            String districtDesc = districtObj.getString("DISTRICT_DESC");
//                            int parentCode = districtObj.getInt("PARENT_CODE");
//                            int provinceCode1 = provinceObj.getInt("PROVINCE_CODE");
//
//                            if (districtDesc.equals(district) && parentCode == provinceCode1) {
//                                districtCode = String.valueOf(districtObj.getInt("DISTRICT_CODE"));
//
//                                // Find The Commune With The District
//                                org.json.JSONArray communes = addressData.getJSONArray("Commune");
//                                for (int k = 0; k < communes.length(); k++) {
//                                    org.json.JSONObject communeObj = communes.getJSONObject(k);
//                                    Object communeDescValue = communeObj.get("COMMUNE_DESC");
//                                    String communeDesc;
//                                    if (communeDescValue instanceof String) {
//                                        communeDesc = (String) communeDescValue;
//                                    } else {
//                                        communeDesc = String.valueOf(communeDescValue);
//                                    }
//
//                                    int communeParentCode = communeObj.getInt("PARENT_CODE");
//                                    int districtCode1 = districtObj.getInt("DISTRICT_CODE");
//
//                                    if (communeDesc.equals(commune) && communeParentCode == districtCode1) {
//                                        communeCode = String.valueOf(communeObj.getInt("COMMUNE_CODE"));
//
//                                        // Find the village within the commune
//                                        JSONArray villages = addressData.getJSONArray("Village");
//                                        for (int l = 0; l < villages.length(); l++) {
//                                            JSONObject villageObj = villages.getJSONObject(l);
//                                            Object villageDescValue = villageObj.get("VILLAGE_DESC");
//                                            String villageDesc = villageDescValue.toString();
//
//                                            int villageParentCode = villageObj.getInt("PARENT_CODE");
//                                            int communeCode1 = communeObj.getInt("COMMUNE_CODE");
//                                            if (villageDesc.equals(village) && villageParentCode == communeCode1) {
//                                                villageCode = String.valueOf(villageObj.getInt("VILLAGE_CODE"));
//                                                addressFound = true;
//                                                break;
//                                            }
//                                        }
//                                    }
//                                }
//                            }
//                        }
//                    }
//                }
//
//                if (addressFound) {
//                    System.out.println("--------------------------------------");
//                    System.out.println("Address Is Found.");
//                    System.out.println("Province Code: " + provinceCode);
//                    System.out.println("districtCode Code: " + districtCode);
//                    System.out.println("commune Code: " + communeCode);
//                    System.out.println("village Code: " + villageCode);
//                    System.out.println("--------------------------------------");
//
//                    customer.setCustomerVillage(villageCode);
//                    customer.setCustomerCommune(communeCode);
//                    customer.setCustomerDistrict(districtCode);
//                    customer.setCustomerProvince(provinceCode);
//                } else {
//                    System.out.println("Address Not Found.");
//                    isDefaultAddressUsed = true;
//                }
//            } catch (IOException | JSONException e) {
//                e.printStackTrace();
//            }
//
//            return isDefaultAddressUsed;
//        }
//}