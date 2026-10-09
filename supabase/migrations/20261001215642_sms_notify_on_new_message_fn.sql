create or replace function public.notify_new_message()
returns trigger
language plpgsql
set search_path = public, vault
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'webhook_secret'
  limit 1;

  if v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://qcsmasqxxrngylxrsbsy.supabase.co/functions/v1/send-sms-notification',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    body := jsonb_build_object('thread_id', new.thread_id, 'sender_id', new.sender_id, 'body', new.body)
  );
  return new;
end;
$$;
