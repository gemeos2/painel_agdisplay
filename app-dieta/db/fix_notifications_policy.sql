-- 1. Create table FIRST (if it doesn't exist)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text not null check (type in ('weight', 'rank', 'diet', 'goal', 'system')),
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.notifications enable row level security;

-- 3. Add Policies
-- Drop existing policies to avoid conflicts if re-running
drop policy if exists "Enable insert for authenticated users only" on public.notifications;
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications (mark as read)" on public.notifications;

-- Policy: Admin/Auth users can INSERT (create notifications for others)
create policy "Enable insert for authenticated users only"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Policy: Users can SELECT their own notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Policy: Users can UPDATE their own notifications (e.g. mark as read)
create policy "Users can update their own notifications (mark as read)"
  on public.notifications for update
  using (auth.uid() = user_id);
