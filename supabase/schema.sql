-- =========================================================================
-- اسکیمای کامل دیتابیس فروشگاه
-- این اسکریپت را در Supabase -> SQL Editor اجرا کنید
-- =========================================================================

-- برای تولید خودکار UUID
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- ۱) جدول categories (دسته‌بندی‌ها)
-- -------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),   -- PK
  title text not null,                              -- عنوان دسته‌بندی
  image_url text,                                   -- لینک عکس گرد دسته‌بندی (Storage) - می‌تواند PNG با زمینه شفاف باشد
  glow_color text,                                   -- کد هگز رنگ نور مخفی (هالوژنی) پشت آیکون - اختیاری، مثلا #FFB300
  created_at timestamptz not null default now()
);

-- در صورتی که پیش‌تر بدون این ستون ساخته‌اید
alter table categories add column if not exists glow_color text;

-- -------------------------------------------------------------------------
-- ۲) جدول vendors (فروشنده‌ها)
-- -------------------------------------------------------------------------
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),   -- PK
  name text not null,                                -- نام فروشنده
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- ۳) جدول warehouses (انبارها)
-- -------------------------------------------------------------------------
create table if not exists warehouses (
  id uuid primary key default gen_random_uuid(),   -- PK
  name text not null,                                -- نام انبار
  location text,                                     -- آدرس/توضیح مکان انبار
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- ۴) جدول products (محصولات)
-- -------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),           -- PK
  title text not null,                                      -- عنوان محصول
  description text,                                         -- توضیحات محصول
  purchase_price numeric(12,0) not null default 0,          -- قیمت خرید (فقط در پنل مدیریت نمایش داده می‌شود)
  sale_price numeric(12,0) not null default 0,               -- قیمت فروش (نمایش عمومی)
  stock_quantity integer not null default 0,                 -- تعداد موجودی
  dimensions text,                                           -- ابعاد محصول
  tags text[] default '{}',                                  -- آرایه‌ای از تگ‌های سئو
  discount_percentage numeric(5,2) not null default 0,       -- درصد تخفیف فعلی (۰ یعنی بدون تخفیف)
  is_published boolean not null default false,                -- نمایش محصول در سایت؛ پیش‌فرض false (فقط ادمین آن را فعال می‌کند)
  category_id uuid references categories(id) on delete set null,  -- FK -> categories.id
  vendor_id uuid references vendors(id) on delete set null,        -- FK -> vendors.id (فروشنده محصول)
  warehouse_id uuid references warehouses(id) on delete set null,  -- FK -> warehouses.id (انبار محصول)

  -- ستون‌های افیلیت (Affiliate) - برای محصولاتی که به‌جای فروش مستقیم، به سایت دیگری لینک می‌دهند (مثلا دیجی‌کالا)
  is_affiliate boolean not null default false,               -- آیا این محصول افیلیت است؟
  affiliate_source text,                                      -- نام سایت مبدأ (مثلا "دیجی‌کالا")
  affiliate_product_url text,                                 -- آدرس محصول در سایت مبدأ (برای مرجع/مقایسه)
  affiliate_link text,                                        -- لینک اختصاصی/ردیابی افیلیت که کاربر روی آن کلیک می‌کند
  affiliate_code text,                                        -- کد/شناسه افیلیت شما نزد آن سایت (اختیاری)
  commission_percentage numeric(5,2) default 0,               -- درصد کمیسیون تقریبی (اختیاری، فقط اطلاعاتی)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on products(category_id);

-- در صورتی که پیش‌تر بدون این ستون‌ها ساخته‌اید
alter table products add column if not exists is_published boolean not null default false;
create index if not exists idx_products_vendor_id on products(vendor_id);
create index if not exists idx_products_warehouse_id on products(warehouse_id);

-- -------------------------------------------------------------------------
-- ۵) جدول product_images (عکس‌های محصول - حداکثر ۷ رکورد به ازای هر محصول)
-- -------------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),              -- PK
  product_id uuid not null references products(id) on delete cascade, -- FK -> products.id
  image_url text not null,
  sort_order integer not null default 0                        -- ۰ = تصویر کاور/اصلی کارت محصول
);

create index if not exists idx_product_images_product_id on product_images(product_id);

-- -------------------------------------------------------------------------
-- ۶) جدول product_colors (رنگ‌بندی محصول - تعداد نامحدود؛ هر رنگ موجودی مستقل دارد)
-- -------------------------------------------------------------------------
create table if not exists product_colors (
  id uuid primary key default gen_random_uuid(),              -- PK
  product_id uuid not null references products(id) on delete cascade, -- FK -> products.id
  color_name text not null,
  color_hex text not null,
  quantity integer not null default 0,                          -- موجودی مخصوص همین رنگ (جمع همه رنگ‌ها = stock_quantity محصول)
  sort_order integer not null default 0
);

-- در صورتی که پیش‌تر بدون ستون quantity ساخته‌اید، این خط آن را اضافه می‌کند
alter table product_colors add column if not exists quantity integer not null default 0;

create index if not exists idx_product_colors_product_id on product_colors(product_id);

-- -------------------------------------------------------------------------
-- ۷) جدول orders (سفارش‌ها)
-- -------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),              -- PK
  order_number text unique,                                     -- کد یکتای سفارش (برای پیگیری مشتری، مثلا ORD-XXXXXX)
  user_id uuid references auth.users(id) on delete set null,   -- FK -> auth.users.id
  full_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null,
  total_price numeric(12,0) not null,
  -- وضعیت سفارش: pending (در انتظار تایید پرداخت) | confirmed (تایید سفارش) | ready_to_ship (آماده ارسال)
  -- handed_to_carrier (تحویل به پست/باربری) | delivered (تحویل داده شد) | reviewing (بررسی مجدد) | returned (مرجوع شد)
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- در صورتی که پیش‌تر بدون این ستون ساخته‌اید
alter table orders add column if not exists order_number text;
create unique index if not exists idx_orders_order_number on orders(order_number);

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_created_at on orders(created_at);

-- -------------------------------------------------------------------------
-- ۸) جدول wishlists (اختیاری - فعلا wishlist در localStorage است)
-- -------------------------------------------------------------------------
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- -------------------------------------------------------------------------
-- ۹) جدول page_views (آمار بازدید - برای گزارش داشبورد مدیریت)
-- -------------------------------------------------------------------------
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  product_id uuid references products(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_product_id on page_views(product_id);
create index if not exists idx_page_views_created_at on page_views(created_at);

-- =========================================================================
-- Row Level Security (RLS)
-- =========================================================================
alter table categories enable row level security;
alter table vendors enable row level security;
alter table warehouses enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_colors enable row level security;
alter table orders enable row level security;
alter table wishlists enable row level security;
alter table page_views enable row level security;

-- خواندن عمومی برای محصولات، دسته‌بندی‌ها، عکس‌ها، رنگ‌ها، فروشنده و انبار
-- (نام فروشنده/انبار اطلاعات حساسی نیست و ممکن است در صفحه محصول هم نمایش داده شود)
create policy "Public read categories" on categories for select using (true);
create policy "Public read vendors" on vendors for select using (true);
create policy "Public read warehouses" on warehouses for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);
create policy "Public read product_colors" on product_colors for select using (true);

-- فقط کاربران لاگین‌کرده اجازه insert/update/delete روی جداول مدیریتی را دارند
-- (در پروژه واقعی پیشنهاد می‌شود یک ستون is_admin یا جدول admins اضافه کرده و Policyها را به آن محدود کنید)
create policy "Authenticated manage categories" on categories for all to authenticated using (true) with check (true);
create policy "Authenticated manage vendors" on vendors for all to authenticated using (true) with check (true);
create policy "Authenticated manage warehouses" on warehouses for all to authenticated using (true) with check (true);
create policy "Authenticated manage products" on products for all to authenticated using (true) with check (true);
create policy "Authenticated manage product_images" on product_images for all to authenticated using (true) with check (true);
create policy "Authenticated manage product_colors" on product_colors for all to authenticated using (true) with check (true);

-- سفارش‌ها
create policy "Anyone can insert orders" on orders for insert with check (true);
create policy "Authenticated read/update orders" on orders for select to authenticated using (true);
create policy "Authenticated update orders" on orders for update to authenticated using (true);
-- پیگیری عمومی سفارش با کد یکتا (صفحه «پیگیری سفارش» در سایت)؛ چون anon key همیشه در کلاینت قابل مشاهده است،
-- این Policy عمداً باز است - در پروژه واقعی بهتر است این کار را با یک تابع RPC امن‌تر (security definer) انجام دهید
create policy "Public can track orders" on orders for select using (true);

-- wishlist: هر کاربر فقط به داده‌های خودش دسترسی دارد
create policy "User manages own wishlist" on wishlists for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- بازدید: هرکسی می‌تواند ثبت کند، فقط ادمین می‌تواند بخواند
create policy "Anyone can insert page_views" on page_views for insert with check (true);
create policy "Authenticated read page_views" on page_views for select to authenticated using (true);

-- -------------------------------------------------------------------------
-- ۸) جدول purchase_invoices (فاکتورهای خرید از فروشنده - بدهی شرکت)
-- -------------------------------------------------------------------------
create table if not exists purchase_invoices (
  id uuid primary key default gen_random_uuid(),                 -- PK
  invoice_number text not null,                                   -- شماره فاکتور (برای نمایش و بارکد خطی)
  vendor_id uuid references vendors(id) on delete set null,       -- FK -> vendors.id
  warehouse_id uuid references warehouses(id) on delete set null, -- FK -> warehouses.id (انباری که کالا وارد آن می‌شود)
  total_amount numeric(14,0) not null default 0,                  -- جمع مبلغ فاکتور (تومان)
  notes text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- ۹) جدول purchase_invoice_items (ردیف‌های فاکتور خرید)
-- -------------------------------------------------------------------------
create table if not exists purchase_invoice_items (
  id uuid primary key default gen_random_uuid(),                        -- PK
  purchase_invoice_id uuid not null references purchase_invoices(id) on delete cascade, -- FK
  product_id uuid not null references products(id) on delete cascade,   -- FK -> products.id
  color_id uuid references product_colors(id) on delete set null,       -- FK -> product_colors.id (تنوع رنگ خریداری‌شده - هویت با نام رنگ است، هگز فقط نمایشی)
  quantity integer not null default 1,
  unit_price numeric(14,0) not null default 0,   -- قیمت خرید واحد (تومان)
  line_total numeric(14,0) not null default 0     -- quantity * unit_price
);

-- در صورتی که پیش‌تر بدون این ستون ساخته‌اید
alter table purchase_invoice_items add column if not exists color_id uuid references product_colors(id) on delete set null;

create index if not exists idx_purchase_invoice_items_invoice on purchase_invoice_items(purchase_invoice_id);
create index if not exists idx_purchase_invoice_items_product on purchase_invoice_items(product_id);

-- -------------------------------------------------------------------------
-- ۱۰) جدول inventory_movements (گردش کالا - ورود/خروج موجودی انبار)
-- -------------------------------------------------------------------------
create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),               -- PK
  product_id uuid not null references products(id) on delete cascade,  -- FK -> products.id
  color_id uuid references product_colors(id) on delete set null,       -- FK -> product_colors.id (کدام تنوع رنگ - در صورت وجود)
  warehouse_id uuid references warehouses(id) on delete set null,       -- FK -> warehouses.id
  change_qty integer not null,                                  -- مثبت = افزایش موجودی، منفی = کاهش موجودی
  reason text not null,                                          -- initial | purchase | sale | adjustment
  reference_type text,                                           -- product | purchase_invoice | order
  reference_id uuid,                                             -- شناسه فاکتور خرید یا سفارش مرتبط
  created_at timestamptz not null default now()
);

-- در صورتی که پیش‌تر بدون این ستون ساخته‌اید
alter table inventory_movements add column if not exists color_id uuid references product_colors(id) on delete set null;

create index if not exists idx_inventory_movements_product on inventory_movements(product_id);

-- -------------------------------------------------------------------------
-- ۱۱) جدول accounting_entries (دفتر حسابداری ساده)
--    entry_type:
--      asset_initial   -> دارایی اولیه (هنگام تعریف محصول با موجودی)
--      liability_purchase -> بدهی شرکت (هنگام صدور فاکتور خرید)
--      revenue_sale    -> درآمد فروش (هنگام ثبت سفارش مشتری)
-- -------------------------------------------------------------------------
create table if not exists accounting_entries (
  id uuid primary key default gen_random_uuid(),                -- PK
  entry_type text not null,
  amount numeric(14,0) not null default 0,                      -- مبلغ (تومان)
  description text,
  product_id uuid references products(id) on delete set null,   -- برای نمایش عکس کاور با هاور در گزارش‌ها
  quantity integer,                                              -- تعداد (برای asset_initial و revenue_sale)
  unit_price numeric(14,0),                                      -- قیمت واحد (برای asset_initial و revenue_sale)
  vendor_id uuid references vendors(id) on delete set null,      -- فروشنده مرتبط (برای فیلتر ترکیبی نوع‌فاکتور+فروشنده)
  customer_name text,                                             -- نام مشتری (فقط برای اسناد درآمد فروش revenue_sale)
  reference_type text,                                           -- product | purchase_invoice | order
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- در صورتی که پیش‌تر بدون این ستون‌ها ساخته‌اید
alter table accounting_entries add column if not exists quantity integer;
alter table accounting_entries add column if not exists unit_price numeric(14,0);
alter table accounting_entries add column if not exists vendor_id uuid references vendors(id) on delete set null;
alter table accounting_entries add column if not exists customer_name text;

create index if not exists idx_accounting_entries_reference on accounting_entries(reference_type, reference_id);
create index if not exists idx_accounting_entries_vendor on accounting_entries(vendor_id);

alter table purchase_invoices enable row level security;
alter table purchase_invoice_items enable row level security;
alter table inventory_movements enable row level security;
alter table accounting_entries enable row level security;

-- همه این جداول کاملاً داخلی/مدیریتی هستند - فقط ادمین (کاربر لاگین‌کرده) دسترسی دارد
create policy "Authenticated manage purchase_invoices" on purchase_invoices for all to authenticated using (true) with check (true);
create policy "Authenticated manage purchase_invoice_items" on purchase_invoice_items for all to authenticated using (true) with check (true);
create policy "Authenticated manage inventory_movements" on inventory_movements for all to authenticated using (true) with check (true);
create policy "Authenticated manage accounting_entries" on accounting_entries for all to authenticated using (true) with check (true);

-- =========================================================================
-- ۱۲) RBAC: پروفایل کاربران و نقش‌ها
--    نقش‌ها: admin (دسترسی کامل) | sales_manager (مدیر فروش) | supplier (تامین‌کننده) | customer (پیش‌فرض)
-- =========================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,  -- PK = FK -> auth.users.id
  email text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

-- ساخت خودکار پروفایل با نقش پیش‌فرض customer به‌ازای هر کاربر جدید که ثبت‌نام می‌کند
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
-- ادمین باید بتواند لیست همه کاربران را ببیند/نقش‌ها را تغییر دهد؛ در این پروژه به‌سادگی به همه کاربران احرازهویت‌شده اجازه داده شده
-- (در پروژه واقعی حتما این را به role = admin محدود کنید)
create policy "Authenticated view all profiles" on profiles for select to authenticated using (true);
create policy "Authenticated update profiles" on profiles for update to authenticated using (true) with check (true);
create policy "Allow self profile insert" on profiles for insert with check (true);

-- -------------------------------------------------------------------------
-- ۱۳) vendor_suppliers: اتصال کاربر با نقش «تامین‌کننده» به یک یا چند فروشنده (vendor)
-- -------------------------------------------------------------------------
create table if not exists vendor_suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,   -- FK -> profiles.id
  vendor_id uuid not null references vendors(id) on delete cascade,   -- FK -> vendors.id
  created_at timestamptz not null default now(),
  unique (user_id, vendor_id)
);
alter table vendor_suppliers enable row level security;
create policy "Authenticated manage vendor_suppliers" on vendor_suppliers for all to authenticated using (true) with check (true);

-- -------------------------------------------------------------------------
-- ۱۴) order_items: ردیف‌های نرمال‌شده سفارش (برای تفکیک بر اساس فروشنده و رنگ)
--     (ستون orders.items همچنان به‌عنوان کپی JSON ساده برای نمایش سریع فاکتور نگه داشته می‌شود)
-- -------------------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,        -- FK -> orders.id
  product_id uuid references products(id) on delete set null,            -- FK -> products.id
  color_id uuid references product_colors(id) on delete set null,        -- FK -> product_colors.id
  vendor_id uuid references vendors(id) on delete set null,               -- FK -> vendors.id (برای تفکیک تامین‌کننده)
  title text not null,
  color_name text,
  quantity integer not null default 1,
  unit_price numeric(12,0) not null default 0,
  line_total numeric(12,0) not null default 0
);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_vendor_id on order_items(vendor_id);

alter table order_items enable row level security;
create policy "Anyone can insert order_items" on order_items for insert with check (true);
create policy "Authenticated read order_items" on order_items for select to authenticated using (true);
create policy "Public track order_items" on order_items for select using (true);

-- -------------------------------------------------------------------------
-- ۱۵) order_vendor_statuses: وضعیت مجزای هر سفارش به تفکیک فروشنده
--     status: pending | ready_to_ship
-- -------------------------------------------------------------------------
create table if not exists order_vendor_statuses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,     -- FK -> orders.id
  vendor_id uuid not null references vendors(id) on delete cascade,    -- FK -> vendors.id
  status text not null default 'pending',
  updated_at timestamptz not null default now(),
  unique (order_id, vendor_id)
);
alter table order_vendor_statuses enable row level security;
create policy "Authenticated manage order_vendor_statuses" on order_vendor_statuses for all to authenticated using (true) with check (true);

-- برای بازتاب لحظه‌ای تغییر وضعیت در پنل ادمین/مدیر فروش، این جدول را به انتشار Realtime اضافه کنید:
-- (اگر خطای "already member" گرفتید یعنی از قبل فعال بوده و نیازی به این خط نیست)
-- alter publication supabase_realtime add table order_vendor_statuses;


-- در پنل Supabase -> Storage، دو باکت زیر را با حالت Public بسازید:
--   1) product-media   -> برای عکس‌های محصول
--   2) category-media  -> برای عکس گرد دسته‌بندی‌ها
--
-- سپس دستورات زیر را (بعد از برداشتن کامنت) در SQL Editor اجرا کنید:

-- insert into storage.buckets (id, name, public) values ('product-media', 'product-media', true);
-- insert into storage.buckets (id, name, public) values ('category-media', 'category-media', true);

-- create policy "Authenticated upload product-media" on storage.objects
--   for insert to authenticated with check (bucket_id = 'product-media');
-- create policy "Public read product-media" on storage.objects
--   for select using (bucket_id = 'product-media');

-- create policy "Authenticated upload category-media" on storage.objects
--   for insert to authenticated with check (bucket_id = 'category-media');
-- create policy "Public read category-media" on storage.objects
--   for select using (bucket_id = 'category-media');
