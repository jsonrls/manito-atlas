create table public.tourist_attractions (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  tags text[] not null,
  custom_tag text,
  barangay text not null,
  description text not null,
  location_details text,
  latitude double precision not null,
  longitude double precision not null,
  coordinate_accuracy text not null,
  coordinate_note text not null,
  source_label text not null,
  source_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  constraint tourist_attractions_id_format
    check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tourist_attractions_name_length
    check (char_length(btrim(name)) between 2 and 120),
  constraint tourist_attractions_tags_count
    check (cardinality(tags) between 1 and 3),
  constraint tourist_attractions_tags_allowed
    check (tags <@ array[
      'resto', 'beach', 'nature', 'hot-spring', 'heritage',
      'stay', 'shop', 'activity', 'viewpoint', 'custom'
    ]::text[]),
  constraint tourist_attractions_custom_tag
    check (
      ('custom' = any(tags) and custom_tag is not null and char_length(btrim(custom_tag)) between 2 and 40)
      or ('custom' <> all(tags) and custom_tag is null)
    ),
  constraint tourist_attractions_description_length
    check (char_length(btrim(description)) between 20 and 700),
  constraint tourist_attractions_location_length
    check (location_details is null or char_length(btrim(location_details)) between 5 and 300),
  constraint tourist_attractions_latitude
    check (latitude between -90 and 90),
  constraint tourist_attractions_longitude
    check (longitude between -180 and 180),
  constraint tourist_attractions_coordinate_accuracy
    check (coordinate_accuracy in ('verified', 'approximate', 'provisional')),
  constraint tourist_attractions_source_url
    check (source_url is null or source_url ~* '^https?://'),
  constraint tourist_attractions_sort_order
    check (sort_order >= 0)
);

comment on table public.tourist_attractions is
  'Curated Manito tourist attractions displayed on the public atlas.';

create index tourist_attractions_published_sort_idx
  on public.tourist_attractions (is_published, sort_order, name);

alter table public.tourist_attractions enable row level security;

create policy "Anyone can read published tourist attractions"
  on public.tourist_attractions
  for select
  to anon, authenticated
  using (is_published is true);

revoke all on table public.tourist_attractions from anon, authenticated;
grant select on table public.tourist_attractions to anon, authenticated;
grant all on table public.tourist_attractions to service_role;

insert into public.tourist_attractions (
  id,
  name,
  tags,
  barangay,
  description,
  latitude,
  longitude,
  coordinate_accuracy,
  coordinate_note,
  source_label,
  source_url,
  sort_order
)
values
  (
    'nag-aso-boiling-lake',
    'Nag-Aso Boiling Lake',
    array['hot-spring', 'nature'],
    'Between Brgys. Hulogan and Balabagon',
    'A geothermal lake known for steaming water and a dramatic landscape shaped by Manito’s volcanic activity.',
    13.1243,
    123.9079,
    'verified',
    'Named map POI, consistent with the published Naghaso geothermal locality.',
    'Sorsogon State University · Project DANAO',
    'https://sorsu.edu.ph/about-nag-aso-boiling-lake/',
    1
  ),
  (
    'muladbucad-white-beach-resort',
    'Muladbucad White Beach Resort',
    array['beach', 'stay'],
    'Brgy. Hulogan (Holugan)',
    'A relaxed coastal stop in Hulogan with a pale shoreline, open sea views, and a quiet resort setting.',
    13.13671,
    123.90811,
    'verified',
    'Map listing resolves inside Hulogan; barangay confirmed by the Province of Albay.',
    'Province of Albay tourism listing',
    'https://albay.gov.ph/tourist-spot/',
    2
  ),
  (
    'kawit-hanging-bridge',
    'Kawit Hanging Bridge & Mangrove Sanctuary',
    array['nature', 'activity'],
    'Brgy. Cawit (Kawit)',
    'A community eco-tourism stop where a hanging bridge leads visitors through Cawit’s coastal mangrove landscape.',
    13.12834,
    123.86433,
    'verified',
    'Matched to the mapped Manito Mangrove Eco Park / Kawit bridge site.',
    'DPWH Region V annual report',
    'https://fliphtml5.com/orbmr/bjci/',
    3
  ),
  (
    'boiling-sea-parong-hot-spring',
    'The Boiling Sea / Parong Hot Spring Geysers',
    array['hot-spring', 'beach', 'nature'],
    'Brgy. Pawa (Sitio Parong)',
    'A rare shoreline geothermal area where hot springs and geyser-like activity meet the sea near Sitio Parong.',
    13.141,
    123.9058,
    'approximate',
    'Area pin near Paron Point; the exact geothermal outlet is not published.',
    'Sitio Parong location reference',
    'https://www.tripzilla.ph/boiling-sea-albay-geothermal-wonder/21748',
    4
  ),
  (
    'paron-beach',
    'Paron Beach / Diamond Beach–Parong',
    array['beach'],
    'Parong area (barangay confirmation pending)',
    'A quiet coastal stop around Parong, suited to shoreline views and an unhurried beach visit.',
    13.13744,
    123.88314,
    'provisional',
    'Public Diamond Beach–Parong map pin; confirm the local Paron Beach name before field use.',
    'Public place listing',
    'https://www.bizippines.com/diamond-beach-parong-0912-690-0139',
    5
  ),
  (
    'inang-maharang-mudpool',
    'Inang Maharang Mud Pool',
    array['hot-spring', 'nature'],
    'Brgy. Nagotgot',
    'A geothermal mud-pool locality where heat, steam, and mineral-rich ground reveal Manito’s volcanic character.',
    13.07,
    123.91,
    'verified',
    'Published GPS coordinate for the Inang Maharang geothermal locality.',
    'Oxford Academic geothermal survey',
    'https://academic.oup.com/view-large/95228745',
    6
  ),
  (
    'singko-pier',
    'Singko Pier & Waterfront',
    array['viewpoint', 'heritage'],
    'Brgy. It-Ba (Poblacion)',
    'A waterfront landmark in the poblacion with open coastal views and a glimpse of Manito’s everyday maritime setting.',
    13.1235,
    123.8693,
    'provisional',
    'It-Ba reference pin; the named Singko Pier point needs local field confirmation.',
    'JICA Philippine ports appendix',
    'https://openjicareport.jica.go.jp/pdf/11758695.pdf',
    7
  ),
  (
    'st-raphael-parish-church',
    'St. Raphael the Archangel Parish Church',
    array['heritage'],
    'Brgy. It-Ba (Poblacion)',
    'Manito’s Catholic parish church and a familiar civic landmark in the heart of the poblacion.',
    13.1228,
    123.8687,
    'verified',
    'Matched to the named church listing on Dado Street in It-Ba.',
    'St. Raphael parish directory listing',
    'https://www.mass-schedules.com/catholic-church/1779/st-raphael-the-archangel-parish.html',
    8
  ),
  (
    'bacman-geothermal-eco-zone',
    'Bacman Geothermal Eco-Zone & Forest Reserve',
    array['nature', 'viewpoint'],
    'Brgy. Nagotgot / Manumbalay',
    'A broad geothermal and forest landscape where energy facilities sit within Manito’s green uplands.',
    13.088,
    123.91,
    'approximate',
    'Representative Manito-side area pin; the reserve is extensive and has no single entrance point.',
    'AFOCO Bac-Man forest-restoration project',
    'https://media.afocosec.org/2024/03/Project-Document-AFOCO0402023.pdf',
    9
  ),
  (
    'pocdol-mountain-ridge',
    'Pocdol Mountain Ridge Viewpoint & Trails',
    array['activity', 'viewpoint', 'nature'],
    'Brgy. Bamban (Manito-side foothills)',
    'A highland trail area along the Pocdol range, with elevated views across Manito’s forested volcanic terrain.',
    13.075,
    123.889,
    'provisional',
    'Representative foothill pin; no authoritative coordinate was found for this named viewpoint.',
    'Pocdol Mountains geographic reference',
    'https://mapcarta.com/N9515316243',
    10
  );
