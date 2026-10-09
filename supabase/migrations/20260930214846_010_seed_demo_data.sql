-- Seed data ported 1:1 from the prototype's VISITOR_FARMS/MARKETS seed
-- objects (index.html), so the schema can be sanity-checked against real
-- data shapes before Nimrah builds against it. Demo growers get a real
-- auth.users row (placeholder password, already-confirmed email) purely so
-- farms.owner_id has something valid to reference — not meant as real
-- logins.
do $$
declare
  u_sunrise uuid := '11111111-1111-1111-1111-111111111101';
  u_birch   uuid := '11111111-1111-1111-1111-111111111102';
  u_maple   uuid := '11111111-1111-1111-1111-111111111103';
  u_hollow  uuid := '11111111-1111-1111-1111-111111111104';
  u_twoelms uuid := '11111111-1111-1111-1111-111111111105';
  f_sunrise uuid; f_birch uuid; f_maple uuid; f_hollow uuid; f_twoelms uuid;
  m_stephenson uuid; m_winnebago uuid; m_rockford uuid;
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000', u_sunrise, 'authenticated', 'authenticated', 'sunriseorchard@gmail.com', 'demo-seed-not-a-real-login', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_birch,   'authenticated', 'authenticated', 'birchlanefiber@gmail.com', 'demo-seed-not-a-real-login', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_maple,   'authenticated', 'authenticated', 'maplerowfarm@gmail.com', 'demo-seed-not-a-real-login', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_hollow,  'authenticated', 'authenticated', 'hollowcreekdairy@gmail.com', 'demo-seed-not-a-real-login', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_twoelms, 'authenticated', 'authenticated', 'twoelmsbakery@gmail.com', 'demo-seed-not-a-real-login', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());
  -- on_auth_user_created already inserted bare profiles rows; fill them in.

  update public.profiles set contact_name='Sunrise Orchard', contact_email='sunriseorchard@gmail.com', contact_phone='(815) 555-0199', email_visibility='everyone', phone_visibility='everyone' where id=u_sunrise;
  update public.profiles set contact_name='Birch Lane Fiber', contact_email='birchlanefiber@gmail.com', contact_phone='(815) 555-0142', email_visibility='everyone', phone_visibility='growers_only' where id=u_birch;
  update public.profiles set contact_name='Maple Row Farm', contact_email='maplerowfarm@gmail.com', contact_phone='(815) 555-0187', email_visibility='growers_only', phone_visibility='nobody' where id=u_maple;
  update public.profiles set contact_name='Hollow Creek Dairy', contact_email='hollowcreekdairy@gmail.com', contact_phone='(815) 555-0163', email_visibility='everyone', phone_visibility='everyone' where id=u_hollow;
  update public.profiles set contact_name='Two Elms Bakery', contact_email='twoelmsbakery@gmail.com', contact_phone='(815) 555-0129', email_visibility='everyone', phone_visibility='growers_only' where id=u_twoelms;

  insert into public.farms (owner_id, name, address, about, published, today_status_note)
  values (u_sunrise, 'Sunrise Orchard', 'Ridge Road, Pecatonica, IL', 'We''re a family-run orchard and farm offering fresh, seasonal produce grown with care. Our goal is to provide healthy food and a connection to the land.', true, 'until 6pm')
  returning id into f_sunrise;
  insert into public.farms (owner_id, name, address, about, published, today_status_note)
  values (u_birch, 'Birch Lane Fiber', 'County Line Rd, Rockford, IL', 'A small fiber farm raising alpacas and Shetland sheep. We spin, dye and knit everything by hand right here on the property.', true, 'until 4pm')
  returning id into f_birch;
  insert into public.farms (owner_id, name, address, about, published, today_status_note)
  values (u_maple, 'Maple Row Farm', 'Rt 20, Pecatonica, IL', 'Row crops and grain on land that''s been in the family four generations. We keep things simple — good soil, good seed, and a lot of patience.', true, 'opens tomorrow 9am')
  returning id into f_maple;
  insert into public.farms (owner_id, name, address, about, published, today_status_note)
  values (u_hollow, 'Hollow Creek Dairy', 'Willow Creek Rd, Pecatonica, IL', 'A small grass-fed dairy herd and a flock of laying hens. Everything''s bottled and packed right on site, same day.', true, 'opens Sat 8am')
  returning id into f_hollow;
  insert into public.farms (owner_id, name, address, about, published, today_status_note)
  values (u_twoelms, 'Two Elms Bakery', 'County Line Rd, Rockford, IL', 'A small stone-milled bakery using grain we grow ourselves. Bread days are Tuesday and Friday — come early, we sell out.', true, 'until 2pm')
  returning id into f_twoelms;

  -- farm_hours (day_of_week: 0=Mon..6=Sun, matching DAY_ORDER in the app)
  insert into public.farm_hours (farm_id, day_of_week, open_time, close_time, closed) values
    (f_sunrise,0,'09:00','18:00',false),(f_sunrise,1,'09:00','18:00',false),(f_sunrise,2,'09:00','18:00',false),
    (f_sunrise,3,'09:00','18:00',false),(f_sunrise,4,'09:00','18:00',false),(f_sunrise,5,'08:00','16:00',false),(f_sunrise,6,null,null,true),
    (f_birch,0,null,null,true),(f_birch,1,'10:00','16:00',false),(f_birch,2,'10:00','16:00',false),
    (f_birch,3,'10:00','16:00',false),(f_birch,4,'10:00','16:00',false),(f_birch,5,'10:00','16:00',false),(f_birch,6,null,null,true),
    (f_maple,0,'09:00','17:00',false),(f_maple,1,'09:00','17:00',false),(f_maple,2,'09:00','17:00',false),
    (f_maple,3,'09:00','17:00',false),(f_maple,4,'09:00','17:00',false),(f_maple,5,'09:00','17:00',false),(f_maple,6,null,null,true),
    (f_hollow,0,null,null,true),(f_hollow,1,null,null,true),(f_hollow,2,'08:00','13:00',false),
    (f_hollow,3,null,null,true),(f_hollow,4,'08:00','13:00',false),(f_hollow,5,'08:00','13:00',false),(f_hollow,6,null,null,true),
    (f_twoelms,0,null,null,true),(f_twoelms,1,'07:00','14:00',false),(f_twoelms,2,null,null,true),
    (f_twoelms,3,null,null,true),(f_twoelms,4,'07:00','14:00',false),(f_twoelms,5,null,null,true),(f_twoelms,6,null,null,true);

  -- farm_categories — remapped onto the unified 10-category taxonomy where the
  -- prototype's demo data used an older category ('Grain','Handmade') not in
  -- CATEGORIES; see dev-handoff-audit for the taxonomy-unification note.
  insert into public.farm_categories (farm_id, category) values
    (f_sunrise,'Fruit'),(f_sunrise,'Honey'),(f_sunrise,'Vegetables'),
    (f_birch,'Fiber'), -- was 'Handmade' in the demo data
    (f_maple,'Vegetables'), -- 'Grain' dropped, no equivalent in CATEGORIES
    (f_hollow,'Dairy'),(f_hollow,'Eggs'),
    (f_twoelms,'Baked goods');

  insert into public.products (farm_id, name, availability, qty) values
    (f_sunrise,'Honeycrisp Apples','ready_now','3 bushels'),(f_sunrise,'Cider Pears','ready_now','5 lbs'),
    (f_sunrise,'Lettuce Mix','ready_now','8 bunches'),(f_sunrise,'Raw Honey','ready_now','16 oz jars'),
    (f_sunrise,'Pears','producing','Ready in ~2 weeks'),(f_sunrise,'Pumpkin','producing','Ready in ~3 weeks'),
    (f_sunrise,'Garlic','producing','Ready in ~4 weeks'),(f_sunrise,'Strawberries','producing','Ready in ~1 month'),
    (f_birch,'Wool Roving','ready_now','12 skeins'),(f_birch,'Hand-knit Scarves','ready_now','6 pieces'),
    (f_birch,'Alpaca Yarn','producing','Ready in ~3 weeks'),
    (f_maple,'Sweet Corn','ready_now','2 dozen'),(f_maple,'Winter Squash','ready_now','10 lbs'),
    (f_maple,'Pumpkins','producing','Ready in ~2 weeks'),(f_maple,'Dry Beans','producing','Ready in ~5 weeks'),
    (f_hollow,'Whole Milk','ready_now','6 half-gallons'),(f_hollow,'Farmstead Cheese','ready_now','8 wheels'),
    (f_hollow,'Eggs','ready_now','4 dozen'),(f_hollow,'Yogurt','producing','Ready in ~1 week'),
    (f_twoelms,'Sourdough Loaves','ready_now','10 loaves'),(f_twoelms,'Einkorn Flour','ready_now','5 lb bags'),
    (f_twoelms,'Rye','producing','Ready in ~6 weeks');

  insert into public.events (farm_id, name, event_date, starts_at, ends_at, notes) values
    (f_sunrise,'Apple Pressing Day','2026-10-20','09:00','14:00','Bring your own apples or press ours. Cider, doughnuts and a barn tour at noon. Free to come; cider is $6 a gallon, cash or card.'),
    (f_birch,'Fiber Arts Open House','2026-10-11','10:00','15:00','Watch a spinning demo, meet the alpacas, and shop skeins and finished pieces straight from the barn.'),
    (f_maple,'Fall Harvest Days','2026-10-25','08:00','13:00','Pick your own pumpkins, walk the corn maze, and pick up a bag of sweet corn while it lasts.'),
    (f_hollow,'Milking Barn Tour','2026-10-18','11:00','12:00','See the milking parlor in action and meet the herd. Kids welcome — closed-toe shoes recommended.'),
    (f_twoelms,'Bread Baking Class','2026-11-01','09:00','11:00','A hands-on session on shaping and scoring sourdough, finished with a shared loaf fresh from the oven.');

  insert into public.markets (name, schedule_text) values ('Stephenson County Market','Open Saturdays 8am – noon') returning id into m_stephenson;
  insert into public.markets (name, schedule_text) values ('Winnebago Village Market','Thursdays 3pm – 7pm') returning id into m_winnebago;
  insert into public.markets (name, schedule_text) values ('Rockford City Market','Fridays 4pm – 8pm') returning id into m_rockford;

  insert into public.farm_markets (farm_id, market_id) values
    (f_sunrise, m_stephenson), (f_hollow, m_winnebago), (f_twoelms, m_rockford);
end $$;
