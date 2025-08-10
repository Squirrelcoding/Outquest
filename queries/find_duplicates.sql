create or replace function get_search_results(
  radius_meters float,
  current_lat float,
  current_long float
) 
returns table (
  id public.quest.id%TYPE, 
  lat float, 
  long float, 
  distance_meters float8
)
language sql
as $$
  select 
    quest.id, 
    gis.st_y(cities.location::gis.geometry) as lat, 
    gis.st_x(cities.location::gis.geometry) as long, 
    gis.st_distance(
      cities.location::gis.geography, 
      gis.st_setsrid(gis.st_point(current_long, current_lat), 4326)::gis.geography
    ) as distance_meters
  from public.quest
  inner join public.cities
  on
  cities.place = quest.location
  where gis.st_dwithin(
    cities.location::gis.geography, 
    gis.st_setsrid(gis.st_point(current_long, current_lat), 4326)::gis.geography, 
    radius_meters
  )
  order by distance_meters;
$$;
