-- Enable RLS (Row Level Security)
alter table if exists public.profiles enable row level security;
alter table if exists public.companies enable row level security;
alter table if exists public.individuals enable row level security;
alter table if exists public.conversations enable row level security;
alter table if exists public.tags enable row level security;
alter table if exists public.individual_tags enable row level security;

-- Create tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  website text,
  industry text,
  size text,
  notes text,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.individuals (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  title text,
  company_id uuid references public.companies(id) on delete set null,
  notes text,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date timestamp with time zone not null,
  summary text,
  next_steps text,
  company_id uuid references public.companies(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  individual_id uuid references public.individuals(id) on delete cascade not null,
  primary key (conversation_id, individual_id)
);

create table if not exists public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.individual_tags (
  individual_id uuid references public.individuals(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (individual_id, tag_id)
);

-- Create RLS policies
create policy "Users can view their own data" on public.companies
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on public.companies
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on public.companies
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on public.companies
  for delete using (auth.uid() = user_id);

-- Repeat similar policies for other tables...

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_updated_at
  before update on public.companies
  for each row
  execute function public.handle_updated_at();

-- Repeat similar triggers for other tables... 