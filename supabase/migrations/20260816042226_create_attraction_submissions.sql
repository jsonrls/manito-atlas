create table public.attraction_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  place_name text not null,
  tags text[] not null,
  barangay text not null,
  description text not null,
  location_details text not null,
  maps_url text,
  latitude double precision,
  longitude double precision,
  coordinate_accuracy text not null default 'provisional',
  coordinate_note text not null default 'Community-submitted location; pending field verification.',
  source_label text not null default 'Manito community submission',
  source_url text,
  submitted_by_name text,
  contact_details text not null,
  resident_confirmation boolean not null,
  status text not null default 'pending',
  moderator_notes text,
  reviewed_at timestamptz,
  constraint attraction_submissions_place_name_length
    check (char_length(btrim(place_name)) between 2 and 120),
  constraint attraction_submissions_tags_count
    check (cardinality(tags) between 1 and 3),
  constraint attraction_submissions_tags_allowed
    check (tags <@ array[
      'resto', 'beach', 'nature', 'hot-spring', 'heritage',
      'stay', 'shop', 'activity', 'viewpoint'
    ]::text[]),
  constraint attraction_submissions_barangay_allowed
    check (barangay in (
      'Balabagon', 'Balasbas', 'Bamban', 'Buyo', 'Cabacongan',
      'Cabit', 'Cawayan', 'Cawit', 'Holugan', 'It-Ba',
      'Malobago', 'Manumbalay', 'Nagotgot', 'Pawa', 'Tinapian'
    )),
  constraint attraction_submissions_description_length
    check (char_length(btrim(description)) between 20 and 700),
  constraint attraction_submissions_location_length
    check (char_length(btrim(location_details)) between 5 and 300),
  constraint attraction_submissions_contact_length
    check (char_length(btrim(contact_details)) between 5 and 180),
  constraint attraction_submissions_submitter_length
    check (submitted_by_name is null or char_length(btrim(submitted_by_name)) between 2 and 100),
  constraint attraction_submissions_maps_url
    check (maps_url is null or maps_url ~* '^https?://'),
  constraint attraction_submissions_source_url
    check (source_url is null or source_url ~* '^https?://'),
  constraint attraction_submissions_latitude
    check (latitude is null or latitude between -90 and 90),
  constraint attraction_submissions_longitude
    check (longitude is null or longitude between -180 and 180),
  constraint attraction_submissions_coordinate_accuracy
    check (coordinate_accuracy in ('verified', 'approximate', 'provisional')),
  constraint attraction_submissions_status
    check (status in ('pending', 'approved', 'rejected')),
  constraint attraction_submissions_resident_confirmation
    check (resident_confirmation is true),
  constraint attraction_submissions_approved_coordinates
    check (status <> 'approved' or (latitude is not null and longitude is not null))
);

comment on table public.attraction_submissions is
  'Resident-submitted Manito places. Contact details are private; only approved rows are publicly readable.';

create index attraction_submissions_status_created_at_idx
  on public.attraction_submissions (status, created_at desc);

alter table public.attraction_submissions enable row level security;

create policy "Anyone can submit a pending attraction"
  on public.attraction_submissions
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and reviewed_at is null
    and moderator_notes is null
    and resident_confirmation is true
    and latitude is null
    and longitude is null
  );

create policy "Anyone can read approved attractions"
  on public.attraction_submissions
  for select
  to anon, authenticated
  using (status = 'approved');

revoke all on table public.attraction_submissions from anon, authenticated;

grant select (
  id,
  created_at,
  place_name,
  tags,
  barangay,
  description,
  location_details,
  maps_url,
  latitude,
  longitude,
  coordinate_accuracy,
  coordinate_note,
  source_label,
  source_url
) on table public.attraction_submissions to anon, authenticated;

grant insert (
  place_name,
  tags,
  barangay,
  description,
  location_details,
  maps_url,
  submitted_by_name,
  contact_details,
  resident_confirmation
) on table public.attraction_submissions to anon, authenticated;

grant all on table public.attraction_submissions to service_role;
