# Static Campus Datasets (`server/src/data/`)

> Static institutional knowledge bases, university domain listings, and campus seed datasets.

---

## 1. Architecture & Role in System
This directory stores static, read-only reference data used for institutional validation, student email verification, and campus filtering.

---

## 2. Directory Inventory & Module Responsibilities

| File | Content & Purpose |
| :--- | :--- |
| [`world_universities.json`](file:///Users/nvc/Documents/LetMeCook/server/src/data/world_universities.json) | Comprehensive database containing `10,268+` universities and `10,588+` web domains across global academic institutions. |

---

## 3. Data Structure & Schema
Each record in `world_universities.json` adheres to the schema:
```json
{
  "name": "Birla Institute of Technology and Science",
  "domains": ["pilani.bits-pilani.ac.in", "bits-pilani.ac.in"],
  "web_pages": ["https://www.bits-pilani.ac.in/"],
  "country": "India",
  "alpha_two_code": "IN",
  "state-province": null
}
```

---

## 4. In-Memory Ingestion
During boot (`server.js`), [`university.service.js`](file:///Users/nvc/Documents/LetMeCook/server/src/services/university.service.js) reads this JSON file and loads it into an in-memory hash map (`domainMap`). This ensures student registration domain lookups take $O(1)$ time with zero database queries.
