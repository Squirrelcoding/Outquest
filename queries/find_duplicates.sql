create or replace function get_search_results(radius_meters float, current_lat float, current_long float) 
returns table (id public.quest.id%TYPE, lat float, long float, distance_meters float8)
set search_path = ''
language sql
as $$
  select id, place, gis.st_y(location::gis.geometry) as lat, gis.st_x(location::gis.geometry) as long, gis.st_distance(location, gis.st_point(current_long, current_lat)::gis.geometry) as dist_meters
  from public.cities
  where gis.st_within(location::gis.geometry, gis.st_point(current_long, current_lat)::gis.geometry, radius_meters)
  order by location operator(gis.<->) gis.st_point(long, lat)::gis.geography;
$$