# Troubleshooting Connection Issues

The error `java.io.IOException: Failed to download remote update` means your phone cannot reach your computer's Expo server. This is common on Windows due to Firewall or Network issues.

## Solution 1: Use Tunnel (Recommended)

This bypasses local network restrictions.

1.  Stop the current Expo server (Ctrl + C in the terminal).
2.  Run the following command:
    ```powershell
    npx expo start --tunnel
    ```
3.  Scan the new QR code.

## Solution 2: Check Firewall

If you want to use LAN (faster than tunnel), you must allow Node.js through the firewall.

1.  Open **Windows Security**.
2.  Go to **Firewall & network protection**.
3.  Click **Allow an app through firewall**.
4.  Ensure `node.exe` is allowed on **Private** networks.

## Solution 3: Verify IP

Your PC IP is `192.168.1.12`.
Ensure your `src/services/api.ts` file in the mobile project uses this IP:

```typescript
const API_URL = "http://192.168.1.12:8000/api";
```

If your IP changes, you must update this file.
