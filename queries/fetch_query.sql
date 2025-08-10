create or replace function get_search_results(author_id uid, quest_title text, place_name text, radius_meters text, current_lat float, current_long float) 
returns table (id public.quest.id%TYPE, lat float, long float, distance_meters float8)
set search_path = "";
language sql
as $$
  select id, name, gis.st_y(location::gis.geometry) as lat, gis.st_x(location::gis.geometry) as long, gis.st_distance(location, gis.st_point(current_long, current_lat)::gis.geography) as dist_meters
  from public.cities
  order by location operator(gis.<->) gis.st_point(long, lat)::gis.geography;
$$