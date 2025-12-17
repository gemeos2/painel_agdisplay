-- Create table to store push subscriptions
create table public.push_subscriptions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone not null default now(),
  constraint push_subscriptions_pkey primary key (id),
  constraint push_subscriptions_endpoint_key unique (endpoint)
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies
create policy "Users can insert their own subscriptions"
  on public.push_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.push_subscriptions
  for delete
  using (auth.uid() = user_id);

-- Optional: Allow users to view their own subscriptions (for checking status)
create policy "Users can view their own subscriptions"
  on public.push_subscriptions
  for select
  using (auth.uid() = user_id);
