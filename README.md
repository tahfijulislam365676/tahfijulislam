# MD. TAHFIJUL ISLAM — পোর্টফোলিও (Vercel সংস্করণ)

React + TypeScript + Tailwind CSS (সাইট) এবং Vercel Function (API, লগিন, ড্যাশবোর্ড)।
ডেটা থাকে **Upstash Redis**-এ, ছবি ও সিভি ফাইল থাকে **Vercel Blob**-এ। দুটোই Vercel-এর ফ্রি প্ল্যানে চলে।
সাইটে দুই ভাষা আছে: English ও বাংলা (হেডারের EN | বাং বাটন)।

## Vercel-এ চালু করার ধাপ

1. **GitHub:** এই ফোল্ডারের ভেতরের সব ফাইল (`package.json` রিপোজিটরির একদম ওপরে থাকবে) আপলোড করুন।
   `server/.env` বা অন্য কোনো `.env` ফাইল **কখনো** আপলোড করবেন না।
2. **Vercel:** Add New → Project → আপনার রিপোজিটরি Import করুন। Framework নিজে থেকে *Vite* ধরবে, কিছু বদলাতে হবে না। (এখনই Deploy করলে চলবে, তবে ৩-৬ ধাপ শেষ না হওয়া পর্যন্ত লগিন কাজ করবে না।)
3. **ডাটাবেস:** প্রজেক্টের *Storage* ট্যাব → *Create Database* → **Upstash Redis** (Free) → প্রজেক্টে *Connect* করুন (সব Environment সিলেক্ট থাকবে)।
4. **ফাইল স্টোরেজ:** *Storage* → *Create* → **Blob** → Access হিসেবে **Public** বেছে নিন → প্রজেক্টে *Connect* করুন।
5. **Environment Variables** (*Settings → Environment Variables*):

   | নাম | মান |
   |---|---|
   | `OWNER_EMAIL` | আপনার লগিন ইমেইল |
   | `OWNER_PASSWORD` | শক্ত পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) |
   | `OWNER_NAME` | MD. TAHFIJUL ISLAM |
   | `JWT_SECRET` | (ঐচ্ছিক) ৩২+ অক্ষরের যেকোনো লম্বা র‍্যান্ডম লেখা |

6. **Redeploy:** *Deployments* → সর্বশেষ ডিপ্লয়ের `⋯` মেনু → *Redeploy*। (স্টোরেজ বা ভ্যারিয়েবল যোগ করার পর এটা অবশ্যই করতে হবে।)
7. লগিন: `https://আপনার-সাইট.vercel.app/admin/login`

## সমস্যা হলে — আগে এই একটি কাজ করুন

ব্রাউজারে `https://আপনার-সাইট.vercel.app/api/config` খুলুন:

| যা দেখাচ্ছে | মানে ও সমাধান |
|---|---|
| `{"blob":true,"remote":true}` | সব ঠিক আছে ✅ |
| `"remote":false` অথবা "Database is not configured" | Upstash Redis প্রজেক্টে Connect হয়নি → ৩ নম্বর ধাপ করে **Redeploy** করুন |
| `"blob":false` | Blob Connect হয়নি (সাইট চলবে, কিন্তু ছবি/সিভি আপলোড হবে না) → ৪ নম্বর ধাপ করে **Redeploy** করুন |
| 404 / `NOT_FOUND` | GitHub রিপোজিটরিতে `api` ফোল্ডার (ভেতরে `index.js` ফাইল) আপলোড হয়নি → সেটি যোগ করুন |
| 500 / `FUNCTION_INVOCATION_FAILED` | Vercel → আপনার প্রজেক্ট → **Logs** ট্যাবে লাল এররটা দেখুন, সেটা আমাকে পাঠান |

লগিন পেজের এরর মেসেজে বন্ধনীর ভেতরে `HTTP ৪০৪/৫০০` ইত্যাদি কোড দেখানো থাকে, সেটাও কারণ বুঝতে সাহায্য করে।

> `api/index.js` ফাইলটি `npm run build` চালালে নিজে থেকেই আবার তৈরি হয় (সার্ভারের কোড `server/src`-এ)। এটি GitHub-এ থাকা জরুরি, মুছবেন না।

## নিরাপত্তা

- প্রথম লগিনের পর *Dashboard → Password* থেকে পাসওয়ার্ড বদলান। এরপর চাইলে Vercel থেকে `OWNER_PASSWORD` মুছে দিতে পারেন।
- **পাসওয়ার্ড ভুলে গেলে:** Vercel-এ `OWNER_EMAIL` ও `OWNER_PASSWORD` নতুন করে দিন এবং `OWNER_RESET_TOKEN` নামে একটা ভ্যারিয়েবলে যেকোনো নতুন শব্দ বসান (আগেরবার যা ছিল তা ছাড়া)। তারপর Redeploy করুন, লগিন নতুন তথ্যে বদলে যাবে।

## বাংলা ফন্ট

- **কালপুরুষ (Kalpurush):** সাথেই দেওয়া আছে (`public/fonts/`)। বাংলা মোডে সব লেখা এই ফন্টে।
- **বাংলা হেডিং ফন্ট ("ভাষার আলো মডিফাই"):** ফন্ট ফাইলটি `public/fonts/` ফোল্ডারে `bn-heading.ttf` (বা `.otf` / `.woff2`) নামে রেখে আবার আপলোড করুন। ফাইল না থাকলে হেডিং কালপুরুষে দেখায়।

## দুই ভাষায় কনটেন্ট

ড্যাশবোর্ডের প্রতিটি ফর্মে English ঘরের পাশে "— বাংলা" ঘর আছে। বাংলা ঘর ফাঁকা থাকলে বাংলা মোডেও English লেখাই দেখাবে।

## নিজের কম্পিউটারে চালানো

```bash
npm run install:all
cp server/.env.example server/.env     # তারপর server/.env খুলে ইমেইল ও পাসওয়ার্ড দিন
npm run dev                            # সাইট: http://localhost:5173  ·  ড্যাশবোর্ড: /admin/login
```
লোকালে ডেটা `server/data/db.json`-এ এবং ছবি `server/uploads/`-এ থাকে।
পাসওয়ার্ড ভুলে গেলে (সার্ভার বন্ধ করে): `npm run reset-owner -- আপনার@ইমেইল নতুন-পাসওয়ার্ড`


## ৪০৪ (HTTP 404) সমস্যা হলে
- GitHub-এ **`api/index.js`** ও **`vercel.json`** দুটোই আছে কিনা দেখুন (পুরনো `api/[...path].js` বা `api/[...path].ts` থাকলে **মুছে দিন**)।
- সব ফাইল আপলোড করে Vercel-এ **Redeploy** দিন।
- ব্রাউজারে `আপনার-সাইট/api/config` খুললে `{"blob":...,"remote":...}` দেখা গেলে API চালু।
