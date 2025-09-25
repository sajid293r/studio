# Firebase Indexes Required

## Submissions Collection Indexes

To enable efficient querying of submissions, you need to create the following composite indexes in Firebase Console:

### 1. User Submissions Index
- **Collection**: `submissions`
- **Fields**: 
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Firebase Console Link**: 
https://console.firebase.google.com/v1/r/project/studio-2edfa/firestore/indexes?create_composite=ClBwcm9qZWN0cy9zdHVkaW8tMmVkZmEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1Ym1pc3Npb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

### 2. User Property Submissions Index (Optional)
- **Collection**: `submissions`
- **Fields**:
  - `userId` (Ascending)
  - `propertyId` (Ascending)
  - `createdAt` (Descending)

## How to Create Indexes

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Indexes" tab
4. Click "Create Index"
5. Select the collection and fields as mentioned above
6. Wait for the index to build (usually takes a few minutes)

## Alternative Solution

If you don't want to create indexes, the current implementation sorts data on the client side, which works for small to medium datasets but may be slower for large datasets.

## Performance Notes

- Indexes improve query performance significantly
- Without indexes, Firebase will throw errors for compound queries
- Client-side sorting works but is less efficient for large datasets
