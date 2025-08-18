create or replace function check_email_verified(p_email text)
returns boolean
language sql
security definer  -- <-- runs with creator's privileges. FIX WITH SECURITY
as $$
  select exists(
    select 1
    from auth.users
    where email = p_email
      and email_confirmed_at is not null
  );
$$;

-- Grant execute to public or anon
grant execute on function check_email_verified(text) to anon;
