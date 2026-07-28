# Junior Account Online Opening — T24 SOAP Integration Guide

This document is the complete, comprehensive reference guide for **Junior Account Online Opening** (both Single Junior Account and Joint Junior + Guardian Account) integrated with Temenos T24 Core Banking.

---

## 1. Global T24 Environment & Credentials

| Parameter | Value |
| :--- | :--- |
| **Base Server URL** | `http://192.168.127.31:7003` |
| **Account Creation Endpoint** | `http://192.168.127.31:7003/TWS.CPBOAO/services` |
| **Customer Inquiry Endpoint** | `http://192.168.127.31:7003/CPB.LOS.TWS/services` |
| **HTTP Method** | `POST` |
| **Content-Type** | `text/xml; charset=UTF-8` |
| **T24 Username** | `LEANGHOURNG.PHOEUNG` |
| **T24 Password** | `LEang@321` |
| **Company Code** | `KH0012011` |

---

## 2. Key T24 Mapping Parameters

| Parameter | Field Name | Code / Value | Description |
| :--- | :--- | :--- | :--- |
| **Customer Sector** | `<cus:Sector>` | `4501` | Customer Sector Code in T24 `SECTOR` database table |
| **Product Code** | `<aaar:Product>` | `SAVE.JUNIOR.SAVING` | Junior Savings Account Product |
| **Primary Owner Role** | `<aaar:CustomerRole>` | `OWNER` | Primary Junior Customer CIF Role |
| **Guardian Joint Role** | `<aaar:CustomerRole>` | `JOINT.OWNER` | Guardian / Parent Customer CIF Role |
| **Cost Center** | `<cus:CostCenter>` | `1000` | Fallback cost center |
| **Industry** | `<cus:Industry>` | `4500` | Fallback industry classification |
| **Target** | `<cus:Target>` | `220` | Target market segment |

---

## 3. Why `<aaar:gPROPERTY>` is Required

In T24 AA (Arrangement Architecture), **`<aaar:gPROPERTY>`** sets the official names printed on bank passbooks, account statements, and mobile banking apps:

- **`SHORT.TITLE:1`**: Short English Name (e.g. `KIM SOVANN`)
- **`SHORT.TITLE:2`**: Short Khmer Name (e.g. `គឹម សុវណ្ណ`)
- **`ACCOUNT.TITLE.1:1`**: Full English Account Title
- **`ACCOUNT.TITLE.1:2`**: Full Khmer Account Title

---

## 4. Junior Suite A: Single Junior Account (NO Guardian Joint CIF)

### Step 1: Create Junior CIF (`OAOCUSTOMERCREATION`)
- **URL**: `http://192.168.127.31:7003/TWS.CPBOAO/services`
- **SOAPAction Header**: `OAOCUSTOMERCREATION`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:oaow="http://temenos.com/OAOWAR"
                  xmlns:cus="http://temenos.com/CUSTOMERCPBCREATEOAO">
    <soapenv:Header/>
    <soapenv:Body>
        <oaow:OAOCUSTOMERCREATION>
            <WebRequestCommon>
                <company>KH0012011</company>
                <password>LEang@321</password>
                <userName>LEANGHOURNG.PHOEUNG</userName>
            </WebRequestCommon>
            <OfsFunction/>
            <CUSTOMERCPBCREATEOAOType id="">
                <cus:gSHORTNAME g="1">
                    <cus:ShortName>KIM SOVANN</cus:ShortName>
                    <cus:ShortName>គឹម សុវណ្ណ</cus:ShortName>
                </cus:gSHORTNAME>
                <cus:gNAME1 g="1">
                    <cus:FullName>KIM SOVANN</cus:FullName>
                    <cus:FullName>គឹម សុវណ្ណ</cus:FullName>
                </cus:gNAME1>
                <cus:gSTREET g="1">
                    <cus:STREET>Phnom Penh Cambodia</cus:STREET>
                </cus:gSTREET>
                <cus:Sector>4501</cus:Sector>
                <cus:CostCenter>1000</cus:CostCenter>
                <cus:Industry>4500</cus:Industry>
                <cus:Target>220</cus:Target>
                <cus:Nationality>KH</cus:Nationality>
                <cus:CustomerStatus>1</cus:CustomerStatus>
                <cus:Residence>KH</cus:Residence>
                <cus:gLEGALID g="1">
                    <cus:mLEGALID m="1">
                        <cus:LegalId>011299923</cus:LegalId>
                        <cus:LegalDocName>NATIONAL.ID</cus:LegalDocName>
                        <cus:LegalHolderName>NATIONAL.ID</cus:LegalHolderName>
                        <cus:LegalIssAuth>SOVANN</cus:LegalIssAuth>
                        <cus:LegalIssDate>20200101</cus:LegalIssDate>
                        <cus:LegalExpDate>20300101</cus:LegalExpDate>
                    </cus:mLEGALID>
                </cus:gLEGALID>
                <cus:Language>2</cus:Language>
                <cus:gCUSTOMERRATING g="1">
                    <cus:CustomerRating>1</cus:CustomerRating>
                </cus:gCUSTOMERRATING>
                <cus:TITLE>MR</cus:TITLE>
                <cus:GIVENNAMES>SOVANN</cus:GIVENNAMES>
                <cus:FAMILYNAME>KIM</cus:FAMILYNAME>
                <cus:Gender>MALE</cus:Gender>
                <cus:DateofBirth>20120610</cus:DateofBirth>
                <cus:MaritalStatus>SINGLE</cus:MaritalStatus>
                <cus:gPHONE1 g="1">
                    <cus:mPHONE1 m="1">
                        <cus:PHONE1>012999230</cus:PHONE1>
                        <cus:SMS1>012999230</cus:SMS1>
                        <cus:EMAIL1/>
                    </cus:mPHONE1>
                </cus:gPHONE1>
                <cus:CustomerType>ACTIVE</cus:CustomerType>
                <cus:CustProvince>12</cus:CustProvince>
                <cus:CustDistrict>1201</cus:CustDistrict>
                <cus:CustCommune>120101</cus:CustCommune>
                <cus:CustVillage>12010101</cus:CustVillage>
                <cus:Ownership>304</cus:Ownership>
                <cus:RelationManager></cus:RelationManager>
                <cus:LoanOfficer></cus:LoanOfficer>
                <cus:Staff></cus:Staff>
                <cus:ReferralBy></cus:ReferralBy>
                <cus:CUSTPROVINCEP>12</cus:CUSTPROVINCEP>
                <cus:CUSTDISTRICTP>1201</cus:CUSTDISTRICTP>
                <cus:CUSTCOMMUNEP>120101</cus:CUSTCOMMUNEP>
                <cus:CUSTVILLAGEP>12010101</cus:CUSTVILLAGEP>
            </CUSTOMERCPBCREATEOAOType>
        </oaow:OAOCUSTOMERCREATION>
    </soapenv:Body>
</soapenv:Envelope>
```

---

### Step 2: Create Single Junior KHR Account (`ACCREATIONOAO`)
- **SOAPAction Header**: `ACCREATIONOAO`
- **Product**: `SAVE.JUNIOR.SAVING` | **Currency**: `KHR`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:oaow="http://temenos.com/OAOWAR"
                  xmlns:aaar="http://temenos.com/AAARRANGEMENTACTIVITYAANEWOAO">
    <soapenv:Header/>
    <soapenv:Body>
        <oaow:ACCREATIONOAO>
            <WebRequestCommon>
                <company>KH0012011</company>
                <password>LEang@321</password>
                <userName>LEANGHOURNG.PHOEUNG</userName>
            </WebRequestCommon>
            <OfsFunction/>
            <AAARRANGEMENTACTIVITYAANEWOAOType id="">
                <aaar:Arrangement>NEW</aaar:Arrangement>
                <aaar:Activity>ACCOUNTS-NEW-ARRANGEMENT</aaar:Activity>
                <aaar:gCUSTOMER g="1">
                    <aaar:mCUSTOMER m="1">
                        <aaar:Customer>1000138456</aaar:Customer>
                        <aaar:CustomerRole>OWNER</aaar:CustomerRole>
                    </aaar:mCUSTOMER>
                </aaar:gCUSTOMER>
                <aaar:Product>SAVE.JUNIOR.SAVING</aaar:Product>
                <aaar:Currency>KHR</aaar:Currency>
                <aaar:gPROPERTY g="1">
                    <aaar:mPROPERTY m="1">
                        <aaar:Property>BALANCE</aaar:Property>
                        <aaar:sgFIELDNAME sg="1">
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                        </aaar:sgFIELDNAME>
                    </aaar:mPROPERTY>
                </aaar:gPROPERTY>
            </AAARRANGEMENTACTIVITYAANEWOAOType>
        </oaow:ACCREATIONOAO>
    </soapenv:Body>
</soapenv:Envelope>
```

---

### Step 3: Create Single Junior USD ($) Account (`ACCREATIONOAO`)
- **SOAPAction Header**: `ACCREATIONOAO`
- **Product**: `SAVE.JUNIOR.SAVING` | **Currency**: `USD`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:oaow="http://temenos.com/OAOWAR"
                  xmlns:aaar="http://temenos.com/AAARRANGEMENTACTIVITYAANEWOAO">
    <soapenv:Header/>
    <soapenv:Body>
        <oaow:ACCREATIONOAO>
            <WebRequestCommon>
                <company>KH0012011</company>
                <password>LEang@321</password>
                <userName>LEANGHOURNG.PHOEUNG</userName>
            </WebRequestCommon>
            <OfsFunction/>
            <AAARRANGEMENTACTIVITYAANEWOAOType id="">
                <aaar:Arrangement>NEW</aaar:Arrangement>
                <aaar:Activity>ACCOUNTS-NEW-ARRANGEMENT</aaar:Activity>
                <aaar:gCUSTOMER g="1">
                    <aaar:mCUSTOMER m="1">
                        <aaar:Customer>1000138456</aaar:Customer>
                        <aaar:CustomerRole>OWNER</aaar:CustomerRole>
                    </aaar:mCUSTOMER>
                </aaar:gCUSTOMER>
                <aaar:Product>SAVE.JUNIOR.SAVING</aaar:Product>
                <aaar:Currency>USD</aaar:Currency>
                <aaar:gPROPERTY g="1">
                    <aaar:mPROPERTY m="1">
                        <aaar:Property>BALANCE</aaar:Property>
                        <aaar:sgFIELDNAME sg="1">
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                        </aaar:sgFIELDNAME>
                    </aaar:mPROPERTY>
                </aaar:gPROPERTY>
            </AAARRANGEMENTACTIVITYAANEWOAOType>
        </oaow:ACCREATIONOAO>
    </soapenv:Body>
</soapenv:Envelope>
```

---

## 5. Junior Suite B: Joint Junior Account (WITH Guardian Joint CIF)

### Step 1: Create Junior CIF (`OAOCUSTOMERCREATION`)
> *(Same Customer Creation XML as above)*

---

### Step 2: Create Joint Junior KHR Account WITH Guardian (`ACCREATIONOAO`)
- **SOAPAction Header**: `ACCREATIONOAO`
- **Product**: `SAVE.JUNIOR.SAVING` | **Currency**: `KHR`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:oaow="http://temenos.com/OAOWAR"
                  xmlns:aaar="http://temenos.com/AAARRANGEMENTACTIVITYAANEWOAO">
    <soapenv:Header/>
    <soapenv:Body>
        <oaow:ACCREATIONOAO>
            <WebRequestCommon>
                <company>KH0012011</company>
                <password>LEang@321</password>
                <userName>LEANGHOURNG.PHOEUNG</userName>
            </WebRequestCommon>
            <OfsFunction/>
            <AAARRANGEMENTACTIVITYAANEWOAOType id="">
                <aaar:Arrangement>NEW</aaar:Arrangement>
                <aaar:Activity>ACCOUNTS-NEW-ARRANGEMENT</aaar:Activity>

                <!-- JUNIOR OWNER + GUARDIAN JOINT OWNER -->
                <aaar:gCUSTOMER g="1">
                    <aaar:mCUSTOMER m="1">
                        <aaar:Customer>1000138456</aaar:Customer>
                        <aaar:CustomerRole>OWNER</aaar:CustomerRole>
                    </aaar:mCUSTOMER>
                    <aaar:mCUSTOMER m="2">
                        <aaar:Customer>9000000480</aaar:Customer>
                        <aaar:CustomerRole>JOINT.OWNER</aaar:CustomerRole>
                    </aaar:mCUSTOMER>
                </aaar:gCUSTOMER>

                <aaar:Product>SAVE.JUNIOR.SAVING</aaar:Product>
                <aaar:Currency>KHR</aaar:Currency>
                <aaar:gPROPERTY g="1">
                    <aaar:mPROPERTY m="1">
                        <aaar:Property>BALANCE</aaar:Property>
                        <aaar:sgFIELDNAME sg="1">
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                        </aaar:sgFIELDNAME>
                    </aaar:mPROPERTY>
                </aaar:gPROPERTY>
            </AAARRANGEMENTACTIVITYAANEWOAOType>
        </oaow:ACCREATIONOAO>
    </soapenv:Body>
</soapenv:Envelope>
```

---

### Step 3: Create Joint Junior USD ($) Account WITH Guardian (`ACCREATIONOAO`)
- **SOAPAction Header**: `ACCREATIONOAO`
- **Product**: `SAVE.JUNIOR.SAVING` | **Currency**: `USD`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:oaow="http://temenos.com/OAOWAR"
                  xmlns:aaar="http://temenos.com/AAARRANGEMENTACTIVITYAANEWOAO">
    <soapenv:Header/>
    <soapenv:Body>
        <oaow:ACCREATIONOAO>
            <WebRequestCommon>
                <company>KH0012011</company>
                <password>LEang@321</password>
                <userName>LEANGHOURNG.PHOEUNG</userName>
            </WebRequestCommon>
            <OfsFunction/>
            <AAARRANGEMENTACTIVITYAANEWOAOType id="">
                <aaar:Arrangement>NEW</aaar:Arrangement>
                <aaar:Activity>ACCOUNTS-NEW-ARRANGEMENT</aaar:Activity>

                <!-- JUNIOR OWNER + GUARDIAN JOINT OWNER -->
                <aaar:gCUSTOMER g="1">
                    <aaar:mCUSTOMER m="1">
                        <aaar:Customer>1000138456</aaar:Customer>
                        <aaar:CustomerRole>OWNER</aaar:CustomerRole>
                    </aaar:mCUSTOMER>
                    <aaar:mCUSTOMER m="2">
                        <aaar:Customer>9000000480</aaar:Customer>
                        <aaar:CustomerRole>JOINT.OWNER</aaar:CustomerRole>
                    </aaar:mCUSTOMER>
                </aaar:gCUSTOMER>

                <aaar:Product>SAVE.JUNIOR.SAVING</aaar:Product>
                <aaar:Currency>USD</aaar:Currency>
                <aaar:gPROPERTY g="1">
                    <aaar:mPROPERTY m="1">
                        <aaar:Property>BALANCE</aaar:Property>
                        <aaar:sgFIELDNAME sg="1">
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>SHORT.TITLE:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:1</aaar:FieldName>
                                <aaar:FieldValue>KIM SOVANN</aaar:FieldValue>
                            </aaar:FieldName>
                            <aaar:FieldName s="1">
                                <aaar:FieldName>ACCOUNT.TITLE.1:2</aaar:FieldName>
                                <aaar:FieldValue>គឹម សុវណ្ណ</aaar:FieldValue>
                            </aaar:FieldName>
                        </aaar:sgFIELDNAME>
                    </aaar:mPROPERTY>
                </aaar:gPROPERTY>
            </AAARRANGEMENTACTIVITYAANEWOAOType>
        </oaow:ACCREATIONOAO>
    </soapenv:Body>
</soapenv:Envelope>
```

---

## 6. Query Customer Info by CIF (`CustomerCreationSee`)

- **Endpoint URL**: `http://192.168.127.31:7003/CPB.LOS.TWS/services`
- **SOAPAction Header**: `CustomerCreationSee`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:los="http://temenos.com/LosUatWar2">
   <soapenv:Header/>
   <soapenv:Body>
      <los:CustomerCreationSee>
         <WebRequestCommon>
            <company>KH0012011</company>
            <password>LEang@321</password>
            <userName>LEANGHOURNG.PHOEUNG</userName>
         </WebRequestCommon>
         <CUSTOMERTULOSSEEType>
            <transactionId>1000138456</transactionId>
         </CUSTOMERTULOSSEEType>
      </los:CustomerCreationSee>
   </soapenv:Body>
</soapenv:Envelope>
```
