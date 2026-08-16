alter table public.attraction_submissions
  add column custom_tag text;

alter table public.attraction_submissions
  drop constraint attraction_submissions_tags_allowed;

alter table public.attraction_submissions
  add constraint attraction_submissions_tags_allowed
  check (tags <@ array[
    'resto', 'beach', 'nature', 'hot-spring', 'heritage',
    'stay', 'shop', 'activity', 'viewpoint', 'custom'
  ]::text[]);

alter table public.attraction_submissions
  add constraint attraction_submissions_custom_tag
  check (
    (
      'custom' = any(tags)
      and custom_tag is not null
      and char_length(btrim(custom_tag)) between 2 and 40
    )
    or (
      'custom' <> all(tags)
      and custom_tag is null
    )
  );

grant select (custom_tag)
  on table public.attraction_submissions
  to anon, authenticated;

grant insert (custom_tag)
  on table public.attraction_submissions
  to anon, authenticated;
