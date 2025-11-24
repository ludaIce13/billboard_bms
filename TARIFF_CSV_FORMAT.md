# Tariff CSV Upload Format

## Required Columns

Your CSV file **must** have these exact column headers (case-sensitive):

```
Ward No,Location,Surface Area,Tariff Amount
```

Or alternatively:
```
ward_id,location_type,surface_area_bucket,tariff_amount
```

---

## Valid Values

### 1. Ward No / ward_id
- **Type**: Positive integer (1, 2, 3, etc.)
- **Example**: `1`, `2`, `3`

### 2. Location / location_type
**Must be EXACTLY one of these (case-sensitive):**
- `Peri-Urban Highways`
- `Main Artery Road`
- `Public Trunk Road`
- `Community Access Road`

⚠️ **Common Mistakes:**
- ❌ `peri-urban highways` (wrong case)
- ❌ `Main Artery` (incomplete)
- ❌ `Highway` (different text)
- ✅ `Main Artery Road` (correct!)

### 3. Surface Area / surface_area_bucket
**Must be EXACTLY one of these (exact format with no spaces):**
- `<2m2`
- `2m2-5m2`
- `5m2-10m2`
- `>10m2`

⚠️ **Common Mistakes:**
- ❌ `2m2 – 5m2` (has spaces and em-dash)
- ❌ `2m2 - 5m2` (has spaces)
- ❌ `2-5m2` (missing first m2)
- ✅ `2m2-5m2` (correct - no spaces, regular hyphen)

### 4. Tariff Amount / tariff_amount
- **Type**: Positive number
- **Example**: `1000`, `2500`, `5000.50`

---

## Sample CSV File

### Correct Format:
```csv
Ward No,Location,Surface Area,Tariff Amount
1,Peri-Urban Highways,<2m2,1000
1,Peri-Urban Highways,2m2-5m2,2500
1,Main Artery Road,5m2-10m2,5000
2,Public Trunk Road,>10m2,10000
3,Community Access Road,2m2-5m2,1500
```

### Download Template
Click **"Download Sample CSV"** button on the Tariff Table page to get a properly formatted template.

---

## Common Upload Errors

### ❌ Error: "Imported 0 rows"
**Cause**: All rows failed validation

**Check:**
1. Column headers match exactly (case-sensitive)
2. Location values match the predefined list exactly
3. Surface Area values match the exact format (no spaces!)
4. Ward IDs are positive integers
5. Tariff amounts are positive numbers

### ❌ Error: "Location must be one of: ..."
**Fix**: Copy the exact location name from the error message or the valid values list above

### ❌ Error: "Surface Area must be one of: ..."
**Fix**: Use exact format like `2m2-5m2` (no spaces, regular hyphen `-`, not em-dash `–`)

---

## How to Create a Valid CSV

### Method 1: Excel/Google Sheets
1. Create spreadsheet with exact column headers
2. Enter data carefully (copy-paste from valid values list)
3. Save as CSV (UTF-8)

### Method 2: Text Editor
1. Download sample CSV from the system
2. Edit in Notepad, VS Code, or similar
3. Keep exact format, just change values
4. Save as `.csv`

---

## Validation Process

When you upload a CSV, the system:

1. ✅ Reads each row
2. ✅ Validates Ward ID (must be positive integer)
3. ✅ Validates Location (must match predefined list exactly)
4. ✅ Validates Surface Area (must match exact format)
5. ✅ Validates Tariff Amount (must be positive number)
6. ✅ Creates tariff if ALL validations pass
7. ❌ Skips row and reports error if ANY validation fails

---

## Error Messages

The system now shows **detailed error messages** for each failed row:

**Example:**
```
All rows failed validation

Errors:
Row 2: Location must be one of: Peri-Urban Highways, Main Artery Road, Public Trunk Road, Community Access Road (got: "main artery road")
Row 3: Surface Area must be one of: <2m2, 2m2-5m2, 5m2-10m2, >10m2 (got: "2m2 – 5m2")
Row 4: Ward ID must be a positive number (got: "abc")
```

**What to do:**
1. Read error messages carefully
2. Fix the exact issues mentioned
3. Re-upload the corrected CSV

---

## Tips

✅ **DO:**
- Download the sample CSV and use it as a template
- Copy-paste valid values from this document
- Double-check Surface Area format (no spaces!)
- Use regular hyphen `-` not em-dash `–`

❌ **DON'T:**
- Type location names manually (copy-paste instead)
- Add spaces in Surface Area values
- Use different case for location names
- Leave any field empty

---

## Testing

1. **First**, download the sample CSV
2. **Then**, upload it without changes (should import 5 rows)
3. **Finally**, modify it with your actual data

This confirms the upload process works before adding your data.

---

**Last Updated**: November 12, 2025
