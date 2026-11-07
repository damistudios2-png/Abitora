# Abitora Security Specification

## Data Invariants
1. A **Habit** must always belong to the `userId` specified in the path `/users/{userId}/habits/{habitId}`.
2. A **Completion** must always reference a valid `habitId` that exists for the user.
3. Users can only read and write their own data.
4. `isPro` status and `createdAt` timestamps are immutable after creation (except for `isPro` which should ideally be system-updated, but for this version, we'll allow user creation but restrict updates if we were simulating a real billing system. For now, we'll protect it).

## The Dirty Dozen Payloads

1. **Identity Theft (Habit)**: Attempting to create a habit in User A's collection with `userId` of User B.
2. **Identity Theft (Completion)**: Attempting to mark a habit as completed for a `habitId` that belongs to another user.
3. **Privilege Escalation**: A non-pro user attempting to set `isPro: true` on their profile update.
4. **Shadow Field Injection**: Adding an `admin: true` field to a UserProfile document.
5. **ID Poisoning**: Using an excessively long string (1.5KB) as a `habitId`.
6. **Orphaned Completion**: Creating a completion record for a habit that does not exist in the habits collection.
7. **Timestamp Spoofing**: Providing a manual `createdAt` timestamp from the client that is in the future.
8. **Malicious Regex**: Using special characters in IDs to attempt to break path matching.
9. **Bulk Scrape**: Attempting to list all habits across all users by omitting the `{userId}` filter.
10. **State Shortcut**: Deleting a completion record for a date that hasn't happened yet (though dates are just strings here, we validate the format).
11. **Type Poisoning**: Sending a string for the `isPro` boolean field.
12. **Unverified Email Write**: Attempting to write data without a verified email (if strict verification is enabled).

## The Test Runner
`firestore.rules.test.ts` (Implementation deferred to actual test phase if requested, but logic is mapped here).
