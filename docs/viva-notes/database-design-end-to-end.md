# Database Design (End-to-End) — Smart Agriculture Assistance System

## 0) What database is used and where
- **Database**: MongoDB
- **ODM (data modeling library)**: Mongoose
- **Connection**: `backend/src/db/connect.js`
- **Default DB name**: `smart_crop_advisory`

MongoDB stores data in **collections** (similar to tables). Each record is a **document** (JSON-like object).

---

## 1) All collections (models) used in the project
All DB models are in: `backend/src/models/*`

1. `FarmerAccount` (collection: `farmeraccounts`) — demo users
2. `FarmerSession` (collection: `farmersessions`) — login sessions/tokens
3. `FarmerProfile` (collection: `farmerprofiles`) — farmer profile/context
4. `SoilTest` (collection: `soiltests`) — saved soil test reports (NPK/pH)
5. `Location` (collection: `locations`) — master list of Punjab districts + centroid
6. `Season` (collection: `seasons`) — master list (Rabi/Kharif/etc.)
7. `SoilType` (collection: `soiltypes`) — master list (soil types)
8. `Crop` (collection: `crops`) — master list of crops

Important: **Recommendations are NOT stored** as a DB collection.
- Crop recommendation is computed dynamically in service code.
- Fertilizer guidance is computed dynamically in service code.

Also: **Voice input audio/transcripts are NOT stored** in DB.
- Voice is handled in browser; transcript may be sent to `/chat`, but chat history is not persisted.

---

## 2) Schema for each collection (fields, types, constraints)
Below is a schema-level explanation. (MongoDB automatically adds `_id` for every document.)

### A) FarmerAccount (Users)
**File**: `backend/src/models/FarmerAccount.js`

**Fields**
- `_id`: ObjectId (auto) → primary identifier
- `name`: String **required**, `trim`, **unique**
- `email`: String optional
- `phone`: String optional
- `profileId`: ObjectId **required** → `ref: FarmerProfile`
- `createdAt`, `updatedAt`: Date (auto, timestamps)

**Constraints/Indexes**
- `name` has **unique index** (via `unique: true`)

---

### B) FarmerSession (Sessions)
**File**: `backend/src/models/FarmerSession.js`

**Fields**
- `_id`: ObjectId (auto)
- `token`: String **required**, **unique**, indexed
- `farmerId`: ObjectId **required**, indexed → `ref: FarmerAccount`
- `expiresAt`: Date **required**
- `createdAt`, `updatedAt`: Date

**Constraints/Indexes**
- Unique index: `token`
- Index: `farmerId`
- **TTL index**: `expiresAt` with `expireAfterSeconds: 0`
  - MongoDB automatically deletes expired sessions.

---

### C) FarmerProfile (Profile/context)
**File**: `backend/src/models/FarmerProfile.js`

**Fields**
- `_id`: ObjectId
- `farmerId`: ObjectId optional, `ref: FarmerAccount`, **unique**, indexed, `sparse: true`
  - This enforces **one-profile-per-farmer** when `farmerId` exists.
- `name`: String optional
- `locationId`: ObjectId **required**, indexed → `ref: Location`
- `soilTypeId`: ObjectId optional, indexed → `ref: SoilType`
- `seasonId`: ObjectId optional, indexed → `ref: Season`
- `previousCropId`: ObjectId optional, indexed → `ref: Crop`
- Legacy text fields (backward compatibility):
  - `locationText`, `soilTypeText`, `seasonText`, `previousCropText`
- `createdAt`, `updatedAt`

**Constraints/Indexes**
- Index: `locationId`
- Index: `soilTypeId`, `seasonId`, `previousCropId`
- Unique + sparse index: `farmerId`

---

### D) SoilTest (Soil test reports)
**File**: `backend/src/models/SoilTest.js`

**Fields**
- `_id`: ObjectId
- `profileId`: ObjectId **required** → `ref: FarmerProfile`
- `n`: Number **required**, min 0
- `p`: Number **required**, min 0
- `k`: Number **required**, min 0
- `ph`: Number **required**, min 0, max 14
- `testDate`: Date optional
- `createdAt`, `updatedAt`

**Constraints/Indexes**
- Uses Mongoose numeric min/max validation.
- (Gap) There is **no explicit index** on `(profileId, createdAt)` even though queries use it frequently.

---

### E) Location (Master data)
**File**: `backend/src/models/Location.js`

**Fields**
- `_id`: ObjectId
- `code`: String **required**, unique
- `state`: String **required**, default `Punjab`
- `type`: String **required**, enum `["district"]`, default `district`
- `name`: object
  - `name.en`: String required
  - `name.pa`: String optional
- `center`: object (for weather)
  - `center.lat`: Number required, -90..90
  - `center.lon`: Number required, -180..180
- `active`: Boolean default true
- `createdAt`, `updatedAt`

**Constraints/Indexes**
- Unique index: `code`

---

### F) Season (Master data)
**File**: `backend/src/models/Season.js`

**Fields**
- `_id`: ObjectId
- `code`: String required, unique
- `name.en`: String required
- `name.pa`: String optional
- `active`: Boolean default true
- timestamps

**Indexes**
- Unique index: `code`

---

### G) SoilType (Master data)
**File**: `backend/src/models/SoilType.js`

Same pattern as Season:
- `code` (unique)
- bilingual `name`
- `active`

---

### H) Crop (Master data)
**File**: `backend/src/models/Crop.js`

Same pattern as Season:
- `code` (unique)
- bilingual `name`
- `active`

---

## 3) Primary keys, foreign keys, composite keys
MongoDB does not use SQL-style “primary keys” and “foreign keys” formally, but conceptually:

### Primary keys
- Every collection uses `_id: ObjectId` as the primary identifier.

### Foreign keys (references)
These are stored as ObjectIds and declared with `ref:` in Mongoose:
- `FarmerAccount.profileId` → `FarmerProfile._id`
- `FarmerSession.farmerId` → `FarmerAccount._id`
- `FarmerProfile.farmerId` → `FarmerAccount._id`
- `FarmerProfile.locationId` → `Location._id`
- `FarmerProfile.seasonId` → `Season._id`
- `FarmerProfile.soilTypeId` → `SoilType._id`
- `FarmerProfile.previousCropId` → `Crop._id`
- `SoilTest.profileId` → `FarmerProfile._id`

### Composite keys
- No composite primary keys.
- One “composite-style” rule exists via indexes:
  - `FarmerProfile.farmerId` is **unique** (enforces 1 profile per farmer when set)

---

## 4) Relationships (one-to-one, one-to-many) — clear explanation
Think of it like this (ER-style in words):

### Core identity
- **FarmerAccount (1) — (1) FarmerProfile**
  - One farmer account points to exactly one profile using `profileId`.
  - Profile can also point back to farmer via `farmerId` (unique, sparse).

### Saved reports
- **FarmerProfile (1) — (Many) SoilTest**
  - A profile can have many soil tests over time.

### Master data lookups
- **Location / Season / SoilType / Crop** are master collections.
- FarmerProfile stores references to these so that the UI can display consistent dropdowns and bilingual names.

### Recommendations
- SoilTest → Recommendation output is **computed**, not stored.

---

## 5) Data flow between collections during key operations

### A) User login (demo login)
**API**: `POST /login` (`backend/src/routes/authRoutes.js`)

Flow:
1. Backend reads `FarmerAccount` by `name`.
2. Backend creates a `FarmerSession` token with expiry.
3. Frontend stores that token in localStorage and uses it for future requests.

Collections touched:
- Read: `FarmerAccount`
- Create: `FarmerSession`


### B) Profile creation / update
**APIs**:
- `POST /profiles`
- `PUT /profiles/:id`
- `GET /me/profile` and `PUT /me/profile`

Flow:
1. User picks `locationId`, `seasonId`, etc.
2. Backend validates those IDs exist in master tables (`Location`, `Season`, `SoilType`, `Crop`).
3. Backend stores/updates `FarmerProfile`.

Collections touched:
- Write: `FarmerProfile`
- Read for validation: `Location`, `Season`, `SoilType`, `Crop`


### C) Soil test saving
**API**: `POST /soil-tests` (`backend/src/routes/soilTestRoutes.js`)

Flow:
1. Backend requires auth → finds session (`FarmerSession`) and farmer (`FarmerAccount`).
2. Backend determines the effective `profileId` from token context.
3. Backend validates N/P/K/pH.
4. Backend saves a new `SoilTest` document.

Collections touched:
- Read (auth): `FarmerSession`, `FarmerAccount`
- Read (ownership): `FarmerProfile`
- Create: `SoilTest`


### D) Crop recommendation request
**API**: `GET /recommendations/crop` (`backend/src/routes/recommendationRoutes.js`)

Flow:
1. Backend loads `FarmerProfile` (with location/season/crop references).
2. Backend fetches **latest** soil test:
   - `SoilTest.findOne({ profileId }).sort({ createdAt: -1 })`
3. Backend uses `Location.center` to call weather service (external) and builds alerts.
4. Backend returns recommendations (computed).

Collections touched:
- Read: `FarmerProfile`, `SoilTest`, optionally `Location`
- No recommendation write.


### E) Fertilizer guidance request
**API**: `GET /recommendations/fertilizer` (`backend/src/routes/recommendationRoutes.js`)

Flow:
1. Backend fetches `FarmerProfile`.
2. Backend fetches **latest** `SoilTest`.
3. Service checks N/P/K thresholds and returns guidance.

Collections touched:
- Read: `FarmerProfile`, `SoilTest`
- No recommendation write.


### F) Voice input storage / logs / history
Current status:
- **No voice transcripts are stored**.
- **No chat history is stored**.

Voice is browser-side; transcript may be sent to `/chat`, but backend responds immediately without writing to DB.

Collections touched:
- None.

---

## 6) Example records (sample data)
These are simplified examples of what documents look like.

### FarmerAccount
```json
{
  "_id": "65f0...",
  "name": "demo_farmer_1",
  "email": "demo1@example.com",
  "phone": "9999999999",
  "profileId": "65f1...",
  "createdAt": "2026-02-01T...",
  "updatedAt": "2026-02-01T..."
}
```

### FarmerProfile
```json
{
  "_id": "65f1...",
  "farmerId": "65f0...",
  "name": "Harpreet",
  "locationId": "65aa...",
  "seasonId": "65bb...",
  "previousCropId": "65cc...",
  "createdAt": "2026-02-01T...",
  "updatedAt": "2026-02-01T..."
}
```

### SoilTest
```json
{
  "_id": "65f2...",
  "profileId": "65f1...",
  "n": 30,
  "p": 18,
  "k": 22,
  "ph": 6.8,
  "testDate": "2026-01-15T00:00:00.000Z",
  "createdAt": "2026-02-01T...",
  "updatedAt": "2026-02-01T..."
}
```

### Location
```json
{
  "_id": "65aa...",
  "code": "LUD",
  "state": "Punjab",
  "type": "district",
  "name": { "en": "Ludhiana", "pa": "ਲੁਧਿਆਣਾ" },
  "center": { "lat": 30.9, "lon": 75.85 },
  "active": true
}
```

---

## 7) CRUD operations and which APIs touch which collections
(High-level map)

### FarmerAccount
- Read:
  - `GET /farmers/demo` (list demo users)
  - `POST /login` reads by name
- Create/Update/Delete:
  - Not exposed via normal API (seed scripts likely create demo data)

### FarmerSession
- Create:
  - `POST /login` creates session token
- Read:
  - Auth middleware reads session by token (`backend/src/middleware/auth.js`)
- Delete:
  - TTL cleanup auto-removes expired sessions

### FarmerProfile
- Create:
  - `POST /profiles`
- Read:
  - `GET /profiles`, `GET /profiles/:id`, `GET /me/profile`
- Update:
  - `PUT /profiles/:id`, `PUT /me/profile`

### SoilTest
- Create:
  - `POST /soil-tests`
- Read:
  - `GET /soil-tests`, `GET /soil-tests/:id`

### Master data (Location/Season/SoilType/Crop)
- Read only (dropdowns):
  - `GET /locations`, `GET /seasons`, `GET /soil-types`, `GET /crops`

### Recommendations
- `GET /recommendations/crop` reads `FarmerProfile` + latest `SoilTest`
- `GET /recommendations/fertilizer` reads `FarmerProfile` + latest `SoilTest`
- No DB writes.

---

## 8) Data consistency, validation, integrity (how it is handled)
MongoDB does not enforce cross-collection foreign key constraints automatically, so integrity is handled at application level.

### A) Input validation utilities
**File**: `backend/src/utils/validation.js`
- Validates ObjectIds, numbers, date formats
- Example: `pickNumber(..., { min: 0 })`, `pickObjectId(...)`

### B) Route-level referential checks
Example: profile creation checks that referenced IDs exist:
- Profile routes call `Location.findById(...)`, `Season.findById(...)` etc.

### C) Ownership / access control
- `requireAuth` loads session + farmer and sets `req.auth`.
- Sensitive routes ensure you can’t access other farmer data.
  - Example: soil tests require profileId matches token profile.

### D) Mongoose schema validation
- Min/max checks on SoilTest NPK/pH
- Enum check on Location `type`

---

## 9) Indexes used and why
### Unique indexes
- `FarmerAccount.name` (unique)
  - Prevents duplicate demo user names.
- `Location.code`, `Season.code`, `SoilType.code`, `Crop.code` (unique)
  - Ensures master data codes don’t duplicate.
- `FarmerSession.token` (unique)
  - Ensures tokens are unique.

### Lookup/performance indexes
- `FarmerSession.farmerId` (index)
  - Speeds up session-to-user lookup.
- `FarmerProfile.locationId/seasonId/soilTypeId/previousCropId` (indexes)
  - Helps filtering/searching if added later.

### TTL index
- `FarmerSession.expiresAt` TTL
  - Auto-cleanup of old sessions.

### Missing but recommended indexes (gaps)
- `SoilTest` should ideally have an index like:
  - `{ profileId: 1, createdAt: -1 }`
  - because the app frequently does “latest soil test for profile”.

---

## 10) Scalability considerations (growing data, history)
What scales well already:
- Master data collections are small and stable.
- Sessions auto-expire via TTL, so they don’t grow forever.

What may become a growth point:
- `SoilTest` can grow quickly (many tests per profile).
  - Needs indexing and possibly retention policy if used long-term.

Not implemented (but important for real scale):
- Recommendation history table (not stored today)
- Voice/chat logs table (not stored today)
- Audit logs (not stored today)

---

## 11) Current gaps / weaknesses / risks (honest engineering view)
1) **No password-based auth**
- FarmerAccount is demo-friendly and login is by name.
- For production, you need hashed passwords / OTP / proper identity.

2) **No recommendation history storage**
- Good for avoiding stale results, but it also means:
  - you can’t show “past recommendations”
  - you can’t do analytics

3) **SoilTest indexing gap**
- Latest-soil queries are common; missing index can slow down with large data.

4) **Data integrity is app-enforced, not DB-enforced**
- MongoDB doesn’t enforce foreign keys; routes do manual checks.
- If someone writes directly to DB, references could become invalid.

5) **Voice/chat not persisted**
- No history, no troubleshooting logs, no audit trail.

6) **Some legacy fields exist**
- `locationText`, `seasonText`, etc. exist for backward compatibility.
- Over time, they can cause confusion unless migrated/cleaned.

7) **Security concerns (typical for demo)**
- Tokens stored in localStorage (demo okay, but in production you’d consider secure cookies + CSRF strategy).

---

## 12) Simple ER-style diagram (in words)
You can describe the DB like this in viva:

- A **FarmerAccount** has one **FarmerProfile**.
- A **FarmerProfile** has many **SoilTests**.
- A **FarmerProfile** references master data: **Location**, **Season**, **SoilType**, **Crop**.
- A **FarmerSession** connects a logged-in token to a FarmerAccount.

And recommendations are generated from **latest SoilTest + Profile** without storing them.

---

If you want, I can also generate a neat “one-page database summary” for viva (2–3 mins speaking) based on the above.
