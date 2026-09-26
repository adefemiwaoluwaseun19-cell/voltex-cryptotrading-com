revoke execute on function public.execute_trade(text, text, numeric, numeric) from public;
revoke execute on function public.execute_trade(text, text, numeric, numeric) from anon;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from service_role;