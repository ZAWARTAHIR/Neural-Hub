-- Let signed-in users list the files in the public "Images" bucket, so the
-- dashboard's Image page can show every generated image.
-- (Reading a file by its public URL already works; listing needs this policy.)
-- Run once in the Supabase SQL editor.

drop policy if exists "Signed-in users can list Images" on storage.objects;
create policy "Signed-in users can list Images"
  on storage.objects for select to authenticated
  using (bucket_id = 'Images');
